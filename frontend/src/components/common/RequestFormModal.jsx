import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Upload, FileText, Video as VideoIcon, Check, Loader2, ScanLine, Plus, Trash2, Users } from 'lucide-react';
import axios from '../../api/axiosInstance';
import { toast } from 'react-toastify';
import Tesseract from 'tesseract.js';

const RequestFormModal = ({ isOpen, onClose, mentor, onSubmitSuccess }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [ocrLoading, setOcrLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        message: '',
        goals: '',
        requestType: 'Mentorship',
        documents: [],
        video: '',
        teamVerification: [] // Array of verified members
    });

    // Current Member being added
    const [currentMember, setCurrentMember] = useState({
        name: '',
        idNumber: '',
        proofUrl: '',
        isVerified: false
    });

    const fileInputRef = useRef(null);
    const idInputRef = useRef(null);

    if (!isOpen) return null;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const data = new FormData();
        data.append('file', file);

        try {
            const token = sessionStorage.getItem('token');
            const response = await axios.post('/upload', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                if (type === 'document') {
                    setFormData(prev => ({ ...prev, documents: [...prev.documents, response.data.url] }));
                    toast.success("Document uploaded!");
                } else if (type === 'identity') {
                    setCurrentMember(prev => ({ ...prev, proofUrl: response.data.url }));
                    performOCR(file);
                    toast.success("ID uploaded, processing...");
                } else if (type === 'video') {
                    setFormData(prev => ({ ...prev, video: response.data.url }));
                    toast.success("Video uploaded!");
                }
            }
        } catch (error) {
            console.error("Upload failed", error);
            toast.error("Upload failed.");
        } finally {
            setUploading(false);
        }
    };

    const performOCR = (file) => {
        setOcrLoading(true);
        Tesseract.recognize(
            file,
            'eng',
            { logger: m => console.log(m) } // Optional logger
        ).then(({ data: { text } }) => {
            console.log("OCR Raw:", text);

            let detectedName = '';
            let detectedId = '';
            const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

            // 1. ID Extraction
            // Relaxed Regex for PAN (handling 0 vs O, 1 vs I common OCR errors is hard without complex logic, distinct patterns helps)
            // We stick to standard greedy match first
            const panMatch = text.match(/[A-Z]{5}[0-9]{4}[A-Z]{1}/);
            const aadharMatch = text.match(/\d{4}\s\d{4}\s\d{4}/);

            if (panMatch) detectedId = panMatch[0];
            else if (aadharMatch) detectedId = aadharMatch[0];

            // 2. Name Extraction Strategy
            // We use a multi-strategy approach: Anchor-based (Best) -> Label-based -> Fallback

            const cleanName = (str) => {
                if (!str) return '';
                // Remove special chars that aren't dot or space
                // Also remove "Name" or "Father" if they accidentally got attached
                return str.replace(/[|:_]/g, '')
                    .replace(/Name/gi, '')
                    .replace(/Father/gi, '')
                    .trim();
            };

            const isNameValid = (str) => {
                return str &&
                    str.length > 3 &&
                    !/\d/.test(str) && // No digits
                    !["INCOME", "TAX", "INDIA", "GOVT", "DEPARTMENT", "GOVERNMENT", "ACCOUNT", "NUMBER", "PERMANENT", "SIGNATURE", "CARD", "PATERNITY", "NAME", "FATHER", "MOTHER", "BIRTH"].some(w => str.toUpperCase().includes(w));
            };

            // Strategy 1: "Father's Name" Anchor (Best for PAN)
            // The User's Name is typically the line strictly ABOVE the "Father's Name" label.
            const fatherIdx = lines.findIndex(l => l.toLowerCase().includes("father") || l.toLowerCase().includes("pita"));
            if (!detectedName && fatherIdx > 0) {
                const candidate = lines[fatherIdx - 1];
                // If the line above is just "Name" label, we might have skipped a line? No, usually Name Label -> Name -> Father Label
                // So "Father Label" index - 1 should be the Name Value.
                if (isNameValid(candidate)) {
                    detectedName = candidate;
                }
            }

            // Strategy 2: "Name" Label (Standard)
            if (!detectedName) {
                const nameLabelIdx = lines.findIndex(l => {
                    const lower = l.toLowerCase();
                    // Match simple "Name" or "Name :" but avoid "Father's Name"
                    return lower.includes("name") && !lower.includes("father") && !lower.includes("paternity") && !lower.includes("mother");
                });

                if (nameLabelIdx !== -1) {
                    const line = lines[nameLabelIdx];
                    // Case: "Name: John Doe"
                    if (line.includes(":")) {
                        const part = line.split(":")[1].trim();
                        if (isNameValid(part)) detectedName = part;
                    }
                    // Case: "Name" (Label) \n "John Doe" (Value)
                    else if (nameLabelIdx + 1 < lines.length) {
                        const nextLine = lines[nameLabelIdx + 1];
                        if (isNameValid(nextLine)) detectedName = nextLine;
                    }
                }
            }

            // Strategy 3: Relative to DOB (Date of Birth)
            if (!detectedName) {
                const dobIndex = lines.findIndex(l => l.match(/\d{2}\/\d{2}\/\d{4}/) || l.toLowerCase().includes("dob") || l.toLowerCase().includes("date of birth"));
                if (dobIndex > 1) {
                    // DOB -> (skip Father) -> (skip Father Label) -> Name Value
                    // This is risky if layout varies, but usually 2 or 3 lines up.
                    // Let's just look at specific offsets
                    const candidates = [lines[dobIndex - 1], lines[dobIndex - 2], lines[dobIndex - 3]];
                    for (const c of candidates) {
                        if (c && isNameValid(c)) {
                            detectedName = c;
                            break;
                        }
                    }
                }
            }

            // Strategy 4: Fallback uppercase block (Last resort)
            if (!detectedName && panMatch) {
                const potentialNames = lines.filter(l =>
                    /^[A-Z\s\.]+$/.test(l.trim()) && // Strictly uppercase
                    isNameValid(l)
                );
                if (potentialNames.length > 0) detectedName = potentialNames[0];
            }

            detectedName = cleanName(detectedName);

            // Heuristic D: Aadhar Fallback (Top valid text line)
            if (!detectedName && aadharMatch) {
                const nameCands = lines.filter(l =>
                    /^[A-Za-z\s\.]+$/.test(l) &&
                    l.length > 3 &&
                    !l.match(/\d/) &&
                    !["Government", "India", "DOB", "Male", "Female", "Address", "Unique", "Identification", "Authority"].some(w => l.includes(w))
                );
                if (nameCands.length > 0) detectedName = nameCands[0];
            }

            setCurrentMember(prev => ({
                ...prev,
                name: detectedName || prev.name,
                idNumber: detectedId || prev.idNumber,
                isVerified: !!(detectedId || detectedName)
            }));

            if (detectedName) toast.success("Name detected!");
            if (detectedId) toast.success("ID detected!");
            setOcrLoading(false);
        }).catch(err => {
            console.error(err);
            setOcrLoading(false);
            toast.error("OCR Failed.");
        });
    };

    const addMember = () => {
        if (!currentMember.name || !currentMember.idNumber || !currentMember.proofUrl) {
            toast.error("Please complete member details and upload ID.");
            return;
        }
        setFormData(prev => ({
            ...prev,
            teamVerification: [...prev.teamVerification, currentMember]
        }));
        setCurrentMember({ name: '', idNumber: '', proofUrl: '', isVerified: false });
        toast.success("Member added to list!");
    };

    const removeMember = (index) => {
        setFormData(prev => ({
            ...prev,
            teamVerification: prev.teamVerification.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async () => {
        if (formData.requestType === 'Funding' && formData.documents.length === 0) {
            toast.error("Funding requests require startup documents.");
            return;
        }
        // At least one member verified or legacy single proof? User asked for multiple members.
        if (formData.teamVerification.length === 0) {
            toast.error("Please verify at least one team member.");
            return;
        }

        setLoading(true);
        try {
            const token = sessionStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const payload = { mentorId: mentor._id, ...formData };

            const response = await axios.post('/mentors/request', payload, config);

            if (response.data.success) {
                toast.success("Request sent successfully!");
                onClose();
                if (onSubmitSuccess) onSubmitSuccess();
            }
        } catch (error) {
            console.error("Request failed", error);
            toast.error(error.response?.data?.message || "Failed to send request.");
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 w-full max-w-2xl rounded-3xl p-8 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Send Request</h2>
                            <p className="text-[var(--text-secondary)] text-sm">To {mentor?.name}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-[var(--text-primary)]/5 rounded-full text-[var(--text-secondary)]">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex gap-2 mb-8">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-[var(--color-primary)]' : 'bg-[var(--text-primary)]/10'}`} />
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {step === 1 && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-[var(--text-primary)]">Step 1: Request Details</h3>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[var(--text-secondary)]">Request Type</label>
                                    <div className="flex gap-4">
                                        {['Mentorship', 'Funding'].map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setFormData({ ...formData, requestType: type })}
                                                className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all font-bold ${formData.requestType === type
                                                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]'
                                                    : 'border-[var(--text-primary)]/10 text-[var(--text-secondary)]'}`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[var(--text-secondary)]">About You</label>
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleInputChange}
                                            placeholder="Brief introduction about yourself and your background..."
                                            className="w-full bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--text-primary)]/10 rounded-xl p-4 focus:ring-2 focus:ring-[var(--color-primary)] outline-none min-h-[100px]"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[var(--text-secondary)]">Project Description & Goals</label>
                                        <textarea
                                            name="goals"
                                            value={formData.goals}
                                            onChange={handleInputChange}
                                            placeholder="Describe your startup idea, current progress, and what specific help you need..."
                                            className="w-full bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--text-primary)]/10 rounded-xl p-4 focus:ring-2 focus:ring-[var(--color-primary)] outline-none min-h-[100px]"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-[var(--text-primary)]">Step 2: Startup Documents</h3>
                                <p className="text-sm text-[var(--text-secondary)]">
                                    {formData.requestType === 'Funding'
                                        ? "Mandatory for funding requests. Upload pitch deck, revenue models, etc."
                                        : "Optional. Helps mentors guide you better."}
                                </p>
                                <div className="border-2 border-dashed border-[var(--text-primary)]/20 rounded-2xl p-8 text-center hover:bg-[var(--text-primary)]/5 transition-colors cursor-pointer" onClick={() => fileInputRef.current.click()}>
                                    <Upload className="mx-auto text-[var(--text-secondary)] mb-4" size={32} />
                                    <p className="font-bold text-[var(--text-primary)]">Upload Documents</p>
                                    <p className="text-xs text-[var(--text-secondary)] mt-1">PDFs supported</p>
                                </div>
                                <input type="file" hidden ref={fileInputRef} accept="application/pdf" onChange={(e) => handleFileUpload(e, 'document')} />
                                {formData.documents.length > 0 && (
                                    <div className="space-y-2">
                                        {formData.documents.map((doc, idx) => (
                                            <div key={idx} className="flex items-center gap-3 bg-[var(--bg-secondary)] p-3 rounded-xl border border-[var(--text-primary)]/10">
                                                <FileText className="text-[var(--color-primary)]" size={20} />
                                                <span className="text-sm text-[var(--text-primary)] truncate flex-1">Document {idx + 1}</span>
                                                <Check size={16} className="text-green-500" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-[var(--text-primary)]">Step 3: Identity Verification</h3>
                                <p className="text-sm text-[var(--text-secondary)]">Verify team members by uploading PAN or Aadhar card.</p>

                                {/* Added Members List */}
                                {formData.teamVerification.length > 0 && (
                                    <div className="space-y-3 mb-6">
                                        <h4 className="text-sm font-bold text-[var(--text-secondary)]">Verified Members ({formData.teamVerification.length})</h4>
                                        {formData.teamVerification.map((member, idx) => (
                                            <div key={idx} className="flex items-center justify-between bg-[var(--bg-secondary)] p-3 rounded-xl border border-[var(--text-primary)]/10">
                                                <div className="flex items-center gap-3">
                                                    <img src={member.proofUrl} alt="ID" className="w-10 h-10 rounded-lg object-cover" />
                                                    <div>
                                                        <p className="text-sm font-bold text-[var(--text-primary)]">{member.name}</p>
                                                        <p className="text-xs text-[var(--text-secondary)]">{member.idNumber}</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => removeMember(idx)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Add New Member Form */}
                                <div className="bg-[var(--bg-secondary)]/30 p-4 rounded-2xl border border-[var(--text-primary)]/10">
                                    <h4 className="text-sm font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                                        <Users size={16} /> Add Team Member
                                    </h4>

                                    <div className="border-2 border-dashed border-[var(--text-primary)]/20 rounded-xl p-6 text-center hover:bg-[var(--text-primary)]/5 transition-colors cursor-pointer mb-4" onClick={() => idInputRef.current.click()}>
                                        {currentMember.proofUrl ? (
                                            <img src={currentMember.proofUrl} className="h-24 mx-auto object-contain mb-2 rounded-lg" alt="ID Proof" />
                                        ) : (
                                            <ScanLine className="mx-auto text-[var(--text-secondary)] mb-2" size={24} />
                                        )}
                                        <p className="text-sm font-bold text-[var(--text-primary)]">{currentMember.proofUrl ? "Change ID" : "Upload ID Proof"}</p>
                                    </div>
                                    <input type="file" hidden ref={idInputRef} accept="image/*" onChange={(e) => handleFileUpload(e, 'identity')} />

                                    {ocrLoading && (
                                        <div className="flex items-center gap-2 text-[var(--color-primary)] bg-[var(--color-primary)]/10 p-3 rounded-xl mb-4">
                                            <Loader2 className="animate-spin" size={16} />
                                            <span className="text-xs font-bold">Scanning...</span>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-[var(--text-secondary)]">Name</label>
                                            <input
                                                value={currentMember.name}
                                                onChange={(e) => setCurrentMember({ ...currentMember, name: e.target.value })}
                                                className="w-full bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--text-primary)]/10 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                                                placeholder="Full Name"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-[var(--text-secondary)]">ID Number</label>
                                            <input
                                                value={currentMember.idNumber}
                                                onChange={(e) => setCurrentMember({ ...currentMember, idNumber: e.target.value })}
                                                className="w-full bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--text-primary)]/10 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                                                placeholder="PAN / Aadhar"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={addMember}
                                        disabled={!currentMember.name || !currentMember.idNumber || !currentMember.proofUrl}
                                        className="w-full flex items-center justify-center gap-2 bg-[var(--text-primary)] text-[var(--bg-primary)] py-2.5 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                                    >
                                        <Plus size={18} /> Add to List
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-[var(--text-primary)]">Step 4: Video Pitch</h3>
                                <p className="text-sm text-[var(--text-secondary)]">Add a video pitch to make your request stand out.</p>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[var(--text-secondary)]">Video Link</label>
                                    <input
                                        name="video" // Changed name for consistency if needed, though controlled input uses value
                                        value={formData.video}
                                        onChange={(e) => setFormData({ ...formData, video: e.target.value })}
                                        placeholder="https://youtube.com/..."
                                        className="w-full bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--text-primary)]/10 rounded-xl p-4 focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                                    />
                                </div>
                            </div>
                        )}

                        {step === 5 && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-[var(--text-primary)]">Step 5: Review & Submit</h3>
                                <p className="text-sm text-[var(--text-secondary)]">Please review all details before sending your request.</p>

                                <div className="space-y-4 bg-[var(--bg-secondary)]/30 p-4 rounded-xl border border-[var(--text-primary)]/10">
                                    <div>
                                        <p className="text-xs font-bold text-[var(--text-secondary)] uppercase">Request Type</p>
                                        <p className="text-[var(--text-primary)] font-medium">{formData.requestType}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-[var(--text-secondary)] uppercase">About You</p>
                                        <p className="text-[var(--text-primary)] text-sm whitespace-pre-wrap">{formData.message || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-[var(--text-secondary)] uppercase">Project Goals</p>
                                        <p className="text-[var(--text-primary)] text-sm whitespace-pre-wrap">{formData.goals || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-[var(--text-secondary)] uppercase">Documents</p>
                                        <p className="text-[var(--text-primary)] text-sm">{formData.documents.length} File(s) Attached</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-[var(--text-secondary)] uppercase">Identity Verification</p>
                                        <p className="text-[var(--text-primary)] text-sm">{formData.teamVerification.length} Member(s) Verified</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-[var(--text-secondary)] uppercase">Video Pitch</p>
                                        <p className="text-[var(--text-primary)] text-sm truncate">{formData.video || "None"}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-center mt-8 pt-6 border-t border-[var(--text-primary)]/10">
                        {step > 1 ? (
                            <button onClick={prevStep} className="flex items-center gap-2 font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                                <ChevronLeft size={20} /> Back
                            </button>
                        ) : <div />}

                        <div className="flex gap-4">
                            {step < 5 ? (
                                <button
                                    onClick={nextStep}
                                    disabled={uploading}
                                    className="flex items-center gap-2 bg-[var(--text-primary)] text-[var(--bg-primary)] px-6 py-3 rounded-xl font-bold hover:bg-[var(--text-primary)]/90 transition-all disabled:opacity-50"
                                >
                                    {uploading ? 'Processing...' : 'Next'} <ChevronRight size={20} />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-8 py-3 rounded-xl font-bold hover:bg-[var(--color-secondary)] hover:shadow-lg hover:shadow-[var(--color-primary)]/30 transition-all disabled:opacity-50"
                                >
                                    {loading && <Loader2 className="animate-spin" size={20} />}
                                    Confirm & Send
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default RequestFormModal;
