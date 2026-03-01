import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactPlayer from 'react-player';
import { Users, Mail, MessageSquare, X, ExternalLink, Linkedin, Globe, ArrowRight, Check, Building2, Zap, Video, TrendingUp, MapPin, Calendar, FileText, Briefcase, DollarSign, User } from 'lucide-react';
import axios from '../../api/axiosInstance';
import { toast } from 'react-toastify';

const MentorMentees = ({ viewMode = 'accepted', setActiveTab }) => {
    // viewMode: 'accepted' (My Mentees) | 'pending' (Mentorship Requests)

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    // State for "My Mentees" view
    const [selectedMentee, setSelectedMentee] = useState(null);


    // State for "Mentorship Requests" view
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        type: null, // 'accept' | 'reject'
        requestId: null,
        founderName: ''
    });

    useEffect(() => {
        fetchData();
        // Reset states when switching views
        setSelectedMentee(null);
        setConfirmModal({ isOpen: false, type: null, requestId: null, founderName: '' });
    }, [viewMode]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get("/mentors/my-requests?status=all");

            if (response.data.success) {
                let filteredData = [];
                if (viewMode === 'accepted') {
                    // Filter for accepted mentorship requests
                    filteredData = response.data.data.filter(
                        req => req.requestType === 'Mentorship' && req.status === 'accepted'
                    );
                } else {
                    // Filter for pending mentorship requests
                    filteredData = response.data.data.filter(
                        req => req.requestType === 'Mentorship' && req.status === 'pending'
                    );
                }
                setData(filteredData);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load data.");
        } finally {
            setLoading(false);
        }
    };

    // --- Logic for "My Mentees" (Accepted) ---
    const handleRemoveMentee = async (requestId) => {
        if (!window.confirm("Are you sure you want to end this mentorship? This action cannot be undone.")) return;

        try {
            const response = await axios.delete(`/mentors/connection/${requestId}`);

            if (response.data.success) {
                toast.success("Mentorship ended successfully.");
                setSelectedMentee(null);
                fetchData();
            }
        } catch (error) {
            console.error("Error removing mentee:", error);
            toast.error("Failed to end mentorship.");
        }
    };

    const handleMessage = () => {
        if (setActiveTab) {
            setActiveTab('messages');
        } else {
            console.warn("setActiveTab not provided to MentorMentees");
        }
    };

    const handleMail = (email) => {
        if (email) {
            window.location.href = `mailto:${email}`;
        } else {
            toast.warn("No email address available for this mentee.");
        }
    };


    // --- Logic for "Mentorship Requests" (Pending) ---
    const openConfirmation = (id, type, founderName) => {
        setConfirmModal({
            isOpen: true,
            type,
            requestId: id,
            founderName
        });
    };

    const closeConfirmation = () => {
        setConfirmModal({ isOpen: false, type: null, requestId: null, founderName: '' });
    };

    const handleAction = async () => {
        const { requestId, type } = confirmModal;
        if (!requestId || !type) return;

        try {
            const status = type === 'accept' ? 'accepted' : 'rejected';
            const response = await axios.put(`/mentors/requests/${requestId}`, { status });

            if (response.data.success) {
                toast.success(`Request ${status} successfully!`);
                setData(prev => prev.filter(req => req._id !== requestId));
                closeConfirmation();
            }
        } catch (error) {
            console.error(`Error ${type}ing request:`, error);
            toast.error(`Failed to ${type} request.`);
            closeConfirmation();
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
            </div>
        );
    }

    // --- Render: Mentorship Requests (Pending) ---
    if (viewMode === 'pending') {
        return (
            <div className="space-y-8 pb-20">
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-3xl font-bold text-[var(--text-primary)]">Mentorship Requests</h2>
                        <p className="text-[var(--text-secondary)] mt-1">Founders looking for your expertise.</p>
                    </div>
                    <div className="text-sm font-bold bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-4 py-2 rounded-xl border border-[var(--color-primary)]/20 shadow-sm">
                        {data.length} Pending Requests
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AnimatePresence mode='popLayout'>
                        {data.length > 0 ? (
                            data.map((req) => (
                                <motion.div
                                    key={req._id}
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, x: -20 }}
                                    layout
                                    className="bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
                                >
                                    {/* Decorative Elements */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)]/5 rounded-bl-full z-0 transition-transform group-hover:scale-110"></div>

                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-[var(--bg-primary)]">
                                                    {req.founderId?.avatar ? (
                                                        <img src={req.founderId.avatar} alt={req.founderId.name} className="w-full h-full rounded-2xl object-cover" />
                                                    ) : (
                                                        req.founderId?.name?.charAt(0) || "U"
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-[var(--text-primary)] text-lg break-words">{req.founderId?.name || "Unknown Founder"}</h3>
                                                    <div className="flex items-center gap-2 text-xs mt-1">
                                                        <span className={`px-2.5 py-1 rounded-lg font-medium border
                                                            ${req.requestType === 'Funding'
                                                                ? "bg-green-500/10 text-green-600 border-green-500/20"
                                                                : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                                            }`}>
                                                            {req.requestType}
                                                        </span>
                                                        {req.startupId && (
                                                            <span className="flex items-center gap-1 text-[var(--text-secondary)]">
                                                                <Building2 size={12} /> Startup
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            {req.requestType === 'Funding' && (
                                                <div className="bg-green-100 p-2 rounded-full text-green-600 shadow-sm animate-pulse">
                                                    <Zap size={20} fill="currentColor" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-[var(--bg-secondary)]/50 rounded-2xl p-5 mb-5 border border-[var(--text-primary)]/5">
                                            <div className="flex gap-2 mb-2 text-[var(--text-secondary)] text-xs font-bold uppercase tracking-wider">
                                                <span>Message</span>
                                            </div>
                                            <p className="text-sm text-[var(--text-primary)] leading-relaxed line-clamp-2 break-words">"{req.message || "No message provided."}"</p>
                                        </div>

                                        <button
                                            onClick={() => setSelectedMentee(req)} // Using selectedMentee state reused for request details
                                            className="w-full py-2.5 mb-4 rounded-xl border border-[var(--text-primary)]/10 text-[var(--text-primary)] font-bold hover:bg-[var(--text-primary)]/5 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Video size={18} /> View Full Details
                                        </button>

                                        <div className="flex gap-4 pt-2">
                                            <button
                                                onClick={() => openConfirmation(req._id, 'reject', req.founderId?.name)}
                                                className="flex-1 py-3 px-4 rounded-xl border border-red-500/20 text-red-500 font-bold hover:bg-red-500 hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
                                            >
                                                <X size={18} /> Decline
                                            </button>

                                            <button
                                                onClick={() => openConfirmation(req._id, 'accept', req.founderId?.name)}
                                                className="flex-[2] py-3 px-4 rounded-xl bg-[var(--color-primary)] text-white font-bold hover:bg-[var(--color-secondary)] hover:shadow-lg hover:shadow-[var(--color-primary)]/30 transition-all duration-300 flex items-center justify-center gap-2"
                                            >
                                                <Check size={18} /> Accept
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="col-span-1 lg:col-span-2 py-24 text-center"
                            >
                                <div className="w-24 h-24 bg-[var(--text-primary)]/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Check size={40} className="text-[var(--text-secondary)] opacity-50" />
                                </div>
                                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">All Caught Up!</h3>
                                <p className="text-[var(--text-secondary)] text-lg">You have no pending mentorship requests at the moment.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* View Details Modal for Requests (Reusing selectedMentee state but logic differs) */}
                <AnimatePresence>
                    {selectedMentee && viewMode === 'pending' && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 w-full max-w-2xl rounded-3xl p-8 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                            >
                                <div className="flex justify-between items-center mb-6 border-b border-[var(--text-primary)]/10 pb-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Request Details</h2>
                                        <p className="text-[var(--text-secondary)] text-sm">From {selectedMentee.founderId?.name}</p>
                                    </div>
                                    <button onClick={() => setSelectedMentee(null)} className="p-2 hover:bg-[var(--text-primary)]/5 rounded-full text-[var(--text-secondary)]">
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
                                    {/* 1. Basic Info */}
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Request Type</h4>
                                            <span className={`px-2.5 py-1 rounded-lg font-medium border text-sm
                                                ${selectedMentee.requestType === 'Funding'
                                                    ? "bg-green-500/10 text-green-600 border-green-500/20"
                                                    : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                                }`}>
                                                {selectedMentee.requestType}
                                            </span>
                                        </div>

                                        <div className="bg-[var(--bg-secondary)]/50 p-4 rounded-xl">
                                            <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase mb-2">About Founder</h4>
                                            <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap">{selectedMentee.message || "No introduction provided."}</p>
                                        </div>

                                        <div className="bg-[var(--bg-secondary)]/50 p-4 rounded-xl">
                                            <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase mb-2">Project Description & Goals</h4>
                                            <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap">{selectedMentee.goals || "No description provided."}</p>
                                        </div>
                                    </div>

                                    {/* 2. Documents */}
                                    {selectedMentee.documents && selectedMentee.documents.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                                                <FileText size={16} /> Startup Documents
                                            </h4>
                                            <div className="grid grid-cols-1 gap-2">
                                                {selectedMentee.documents.map((doc, idx) => (
                                                    <a key={idx} href={doc} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--text-primary)]/10 hover:bg-[var(--text-primary)]/5 transition-colors">
                                                        <span className="text-sm font-medium text-[var(--text-primary)]">Document {idx + 1}</span>
                                                        <ExternalLink size={14} className="text-[var(--text-secondary)]" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* 3. Team Verification */}
                                    {selectedMentee.teamVerification && selectedMentee.teamVerification.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                                                <Check size={16} /> Verified Team Members
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {selectedMentee.teamVerification.map((member, mIdx) => (
                                                    <div key={mIdx} className="flex gap-4 items-start bg-[var(--bg-secondary)] p-3 rounded-xl border border-[var(--text-primary)]/10">
                                                        <a href={member.proofUrl} target="_blank" rel="noopener noreferrer" className="block w-16 h-12 rounded-lg overflow-hidden border border-[var(--text-primary)]/10 flex-shrink-0">
                                                            <img src={member.proofUrl} alt="ID" className="w-full h-full object-cover" />
                                                        </a>
                                                        <div className="space-y-1 min-w-0">
                                                            <p className="text-xs text-[var(--text-secondary)]">Name: <span className="text-[var(--text-primary)] font-bold">{member.name || "N/A"}</span></p>
                                                            <p className="text-xs text-[var(--text-secondary)]">ID: <span className="text-[var(--text-primary)] font-bold">{member.idNumber || "N/A"}</span></p>
                                                            {member.isVerified && <span className="text-[10px] text-green-500 font-bold bg-green-500/10 px-1.5 py-0.5 rounded">Verified</span>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* 4. Video Pitch */}
                                    {selectedMentee.video && (
                                        <div>
                                            <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3">Video Pitch</h4>
                                            <a href={selectedMentee.video} target="_blank" rel="noopener noreferrer" className="block w-full bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--text-primary)]/10 flex items-center justify-between hover:bg-[var(--text-primary)]/5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center">
                                                        <Video size={18} fill="currentColor" />
                                                    </div>
                                                    <span className="text-sm font-bold text-[var(--text-primary)]">Watch Video Pitch</span>
                                                </div>
                                                <ExternalLink size={16} />
                                            </a>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-[var(--text-primary)]/10">
                                    <button
                                        onClick={() => openConfirmation(selectedMentee._id, 'reject', selectedMentee.founderId?.name)}
                                        className="px-6 py-2.5 rounded-xl border border-red-500/20 text-red-500 font-bold hover:bg-red-500 hover:text-white transition-colors"
                                    >
                                        Decline
                                    </button>
                                    <button
                                        onClick={() => openConfirmation(selectedMentee._id, 'accept', selectedMentee.founderId?.name)}
                                        className="px-8 py-2.5 rounded-xl bg-[var(--color-primary)] text-white font-bold hover:bg-[var(--color-secondary)] transition-colors"
                                    >
                                        Accept Request
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Confirmation Modal */}
                <AnimatePresence>
                    {confirmModal.isOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 w-full max-w-sm rounded-3xl p-8 shadow-2xl"
                            >
                                <div className="text-center mb-6">
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${confirmModal.type === 'accept' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                                        }`}>
                                        {confirmModal.type === 'accept' ? <Check size={32} /> : <X size={32} />}
                                    </div>
                                    <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                                        {confirmModal.type === 'accept' ? 'Accept Request?' : 'Decline Request?'}
                                    </h3>
                                    <p className="text-[var(--text-secondary)]">
                                        Are you sure you want to {confirmModal.type === 'accept' ? 'accept' : 'decline'} the request from <span className="font-bold text-[var(--text-primary)]">{confirmModal.founderName}</span>?
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={closeConfirmation}
                                        className="flex-1 py-3 rounded-xl font-bold border border-[var(--text-primary)]/10 text-[var(--text-secondary)] hover:bg-[var(--text-primary)]/5 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAction}
                                        className={`flex-1 py-3 rounded-xl font-bold text-white transition-all shadow-lg ${confirmModal.type === 'accept'
                                            ? 'bg-green-500 hover:bg-green-600 shadow-green-500/20'
                                            : 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
                                            }`}
                                    >
                                        Confirm
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    // --- Render: My Mentees (Accepted) ---
    return (
        <div className="space-y-8 pb-20">
            <div>
                <h2 className="text-3xl font-bold text-[var(--text-primary)]">My Mentees</h2>
                <p className="text-[var(--text-secondary)] mt-1">Founders you are actively mentoring.</p>
            </div>

            {data.length === 0 ? (
                <div className="text-center py-20 bg-[var(--bg-primary)]/50 rounded-3xl border border-[var(--text-primary)]/10">
                    <div className="w-24 h-24 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Users size={40} className="text-[var(--color-primary)]" />
                    </div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">No Mentees Yet</h3>
                    <p className="text-[var(--text-secondary)]">Accept mentorship requests to start guiding founders!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.map((mentee, i) => (
                        <motion.div
                            key={mentee._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="group bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 rounded-3xl p-6 hover:border-[var(--color-primary)]/30 hover:shadow-xl transition-all relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)]/5 rounded-bl-full"></div>

                            <div className="relative flex flex-col items-center text-center mb-6">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white font-bold text-2xl shadow-lg mb-4 ring-4 ring-[var(--bg-primary)]">
                                    {mentee.founderId?.avatar ? (
                                        <img src={mentee.founderId.avatar} alt={mentee.founderId.name} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        mentee.founderId?.name?.charAt(0) || "M"
                                    )}
                                </div>

                                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1 break-words">
                                    {mentee.founderId?.name || "Unknown Mentee"}
                                </h3>
                                <p className="text-sm text-[var(--text-secondary)]">{mentee.founderId?.email || "No email"}</p>
                            </div>

                            <div className="bg-[var(--bg-secondary)]/50 rounded-xl p-4 mb-4">
                                <p className="text-xs text-[var(--text-secondary)] font-bold uppercase mb-2">Description</p>
                                <p className="text-sm text-[var(--text-primary)] italic line-clamp-3 break-words">
                                    "{mentee.startupId?.desc || mentee.startupId?.detailedDescription || mentee.founderId?.bio || mentee.message || "No description available."}"
                                </p>
                            </div>

                            <div className="flex gap-2 mb-4">
                                <button
                                    onClick={() => handleMail(mentee.founderId?.email)}
                                    className="flex-1 py-2 px-3 rounded-xl border border-[var(--text-primary)]/10 text-[var(--text-primary)] hover:bg-[var(--text-primary)]/5 transition-colors flex items-center justify-center gap-2"
                                    title="Send Email"
                                >
                                    <Mail size={16} /> <span className="text-xs font-semibold"></span>
                                </button>
                                <button
                                    onClick={handleMessage}
                                    className="flex-1 py-2 px-3 rounded-xl border border-[var(--text-primary)]/10 text-[var(--text-primary)] hover:bg-[var(--text-primary)]/5 transition-colors flex items-center justify-center gap-2"
                                    title="Go to Chat"
                                >
                                    <MessageSquare size={16} /> <span className="text-xs font-semibold"></span>
                                </button>
                            </div>

                            <button
                                onClick={() => setSelectedMentee(mentee)}
                                className="w-full py-2.5 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold hover:bg-[var(--color-primary)] hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                                View Details <ArrowRight size={16} />
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Mentee (Startup) Detail Modal */}
            <AnimatePresence>
                {selectedMentee && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-[var(--bg-primary)] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                        >
                            {/* Header */}
                            <div className="relative p-8 pb-6 border-b border-[var(--text-primary)]/10">
                                <button
                                    onClick={() => setSelectedMentee(null)}
                                    className="absolute top-6 right-6 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-2 hover:bg-[var(--text-primary)]/5 rounded-full"
                                >
                                    <X size={24} />
                                </button>

                                <div className="flex items-start gap-4 mb-6">
                                    <div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0">
                                        {selectedMentee.startupId?.image ? (
                                            <img src={selectedMentee.startupId.image} alt={selectedMentee.startupId.name} className="w-full h-full object-cover" />
                                        ) : selectedMentee.founderId?.avatar ? (
                                            <img src={selectedMentee.founderId.avatar} alt={selectedMentee.founderId.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white font-bold text-3xl">
                                                {selectedMentee.startupId?.name?.charAt(0) || selectedMentee.founderId?.name?.charAt(0) || "M"}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-2 break-words">
                                            {selectedMentee.startupId?.name || selectedMentee.founderId?.company || selectedMentee.founderId?.name}
                                        </h2>
                                        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                                            {(selectedMentee.startupId?.stage || selectedMentee.startupId?.category) && (
                                                <span className="px-3 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full text-sm font-medium">
                                                    {selectedMentee.startupId?.stage || selectedMentee.startupId?.category}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Readiness Progress */}
                                {selectedMentee.startupId?.readinessScore !== undefined && (
                                    <div className="bg-gradient-to-r from-[var(--color-primary)]/5 to-transparent rounded-xl p-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-[var(--text-secondary)]">Readiness Score</span>
                                            <span className="text-2xl font-bold text-[var(--color-primary)]">{selectedMentee.startupId.readinessScore || 0}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-[var(--text-primary)]/10 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${selectedMentee.startupId.readinessScore || 0}%` }}
                                                transition={{ duration: 0.8, ease: "easeOut" }}
                                                className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full"
                                            ></motion.div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-8 space-y-6">
                                {/* Startup Description */}
                                <div>
                                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                                        <div className="w-1 h-5 bg-[var(--color-primary)] rounded-full"></div>
                                        About the Startup
                                    </h3>
                                    <p className="text-[var(--text-secondary)] leading-relaxed">
                                        {selectedMentee.startupId?.desc || "No startup description available."}
                                    </p>
                                </div>

                                {/* Founder Bio */}
                                <div>
                                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                                        <User size={18} className="text-[var(--color-primary)]" />
                                        About the Founder
                                    </h3>
                                    <p className="text-[var(--text-secondary)] leading-relaxed italic">
                                        "{selectedMentee.founderId?.bio || selectedMentee.message || "No founder bio available."}"
                                    </p>
                                </div>

                                {/* Additional Info Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {(selectedMentee.startupId?.stage) && (
                                        <div className="bg-[var(--text-primary)]/5 rounded-xl p-4">
                                            <div className="flex items-center gap-3 mb-2">
                                                <TrendingUp size={20} className="text-[var(--color-primary)]" />
                                                <span className="text-sm text-[var(--text-secondary)]">Stage</span>
                                            </div>
                                            <p className="font-bold text-[var(--text-primary)]">{selectedMentee.startupId.stage}</p>
                                        </div>
                                    )}

                                    {selectedMentee.startupId?.location && (
                                        <div className="bg-[var(--text-primary)]/5 rounded-xl p-4">
                                            <div className="flex items-center gap-3 mb-2">
                                                <MapPin size={20} className="text-[var(--color-primary)]" />
                                                <span className="text-sm text-[var(--text-secondary)]">Location</span>
                                            </div>
                                            <p className="font-bold text-[var(--text-primary)]">{selectedMentee.startupId?.location || selectedMentee.founderId?.location}</p>
                                        </div>
                                    )}

                                    {selectedMentee.startupId?.teamSize && (
                                        <div className="bg-[var(--text-primary)]/5 rounded-xl p-4">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Users size={20} className="text-[var(--color-primary)]" />
                                                <span className="text-sm text-[var(--text-secondary)]">Team Size</span>
                                            </div>
                                            <p className="font-bold text-[var(--text-primary)]">{selectedMentee.startupId?.teamSize} members</p>
                                        </div>
                                    )}

                                    {selectedMentee.startupId?.founded && (
                                        <div className="bg-[var(--text-primary)]/5 rounded-xl p-4">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Calendar size={20} className="text-[var(--color-primary)]" />
                                                <span className="text-sm text-[var(--text-secondary)]">Founded</span>
                                            </div>
                                            <p className="font-bold text-[var(--text-primary)]">{selectedMentee.startupId?.founded}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Website Link */}
                                {selectedMentee.startupId?.website && (
                                    <div className="pt-4 border-t border-[var(--text-primary)]/10">
                                        <a
                                            href={selectedMentee.startupId?.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:text-[var(--color-secondary)] font-medium transition-colors"
                                        >
                                            <ExternalLink size={18} />
                                            Visit Website
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* REORGANIZED CONTENT: Desc -> PDF -> Video -> Links -> Team */}
                            <div className="px-8 pb-8 space-y-8">

                                {/* 1. Detailed Description */}
                                <div>
                                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                                        <span className="w-1 h-5 bg-[var(--color-primary)] rounded-full"></span>
                                        About the Project
                                    </h3>
                                    <p className="text-[var(--text-primary)]/80 leading-relaxed whitespace-pre-wrap">
                                        {selectedMentee.startupId?.detailedDescription || selectedMentee.startupId?.desc || selectedMentee.founderId?.bio}
                                    </p>
                                </div>

                                {/* 2. Pitch Deck (PDF) */}
                                {selectedMentee.startupId?.pitchDeck && (
                                    <div className="bg-[var(--text-primary)]/5 rounded-2xl p-6 border border-[var(--text-primary)]/10 flex items-center justify-between group hover:bg-[var(--text-primary)]/10 transition-colors cursor-pointer" onClick={() => window.open(selectedMentee.startupId.pitchDeck, '_blank')}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center">
                                                <FileText size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-[var(--text-primary)]">Pitch Deck</h4>
                                                <p className="text-xs text-[var(--text-secondary)]">View detailed presentation PDF</p>
                                            </div>
                                        </div>
                                        <ExternalLink size={20} className="text-[var(--text-secondary)] group-hover:text-[var(--color-primary)] transition-colors" />
                                    </div>
                                )}

                                {/* 3. Video Pitch */}
                                {selectedMentee.startupId?.videoPitch && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                                            <Video size={20} className="text-[var(--color-primary)]" /> Video Pitch
                                        </h3>
                                        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black/50 border border-[var(--text-primary)]/10 shadow-lg">
                                            <div className="w-full h-full rounded-2xl overflow-hidden bg-black">
                                                <ReactPlayer
                                                    url={selectedMentee.startupId.videoPitch}
                                                    width="100%"
                                                    height="100%"
                                                    controls
                                                    light={true}
                                                    playing={false}
                                                    className="react-player"
                                                    config={{
                                                        youtube: {
                                                            playerVars: { origin: window.location.origin }
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 4. Connect Links (Website, LinkedIn, Portfolio) */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {selectedMentee.startupId?.website && (
                                        <a href={selectedMentee.startupId.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-[var(--bg-primary)] p-4 rounded-xl border border-[var(--text-primary)]/10 hover:border-[var(--color-primary)]/50 transition-colors">
                                            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                                <Globe size={20} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-[var(--text-secondary)]">Website</p>
                                                <p className="font-bold text-[var(--text-primary)] text-sm truncate">Visit Site</p>
                                            </div>
                                        </a>
                                    )}
                                    {selectedMentee.founderId?.linkedin && (
                                        <a href={selectedMentee.founderId.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-[var(--bg-primary)] p-4 rounded-xl border border-[var(--text-primary)]/10 hover:border-[#0077b5]/50 transition-colors">
                                            <div className="w-10 h-10 rounded-lg bg-[#0077b5]/10 text-[#0077b5] flex items-center justify-center">
                                                <Linkedin size={20} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-[var(--text-secondary)]">LinkedIn</p>
                                                <p className="font-bold text-[var(--text-primary)] text-sm truncate">Connect</p>
                                            </div>
                                        </a>
                                    )}
                                    {selectedMentee.founderId?.portfolio && (
                                        <a href={selectedMentee.founderId.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-[var(--bg-primary)] p-4 rounded-xl border border-[var(--text-primary)]/10 hover:border-purple-500/50 transition-colors">
                                            <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                                                <Briefcase size={20} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-[var(--text-secondary)]">Portfolio</p>
                                                <p className="font-bold text-[var(--text-primary)] text-sm truncate">View Work</p>
                                            </div>
                                        </a>
                                    )}
                                </div>

                                {/* 5. Team & Strategy */}
                                <div className="border-t border-[var(--text-primary)]/10 pt-8 space-y-8">
                                    {/* Team */}
                                    {selectedMentee.startupId?.teamMembers && selectedMentee.startupId.teamMembers.length > 0 && (
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                                                <Users size={20} className="text-[var(--color-primary)]" /> meet the Team
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {selectedMentee.startupId.teamMembers.map((member, idx) => (
                                                    <div key={idx} className="flex items-center gap-3 bg-[var(--bg-primary)] p-3 rounded-xl border border-[var(--text-primary)]/5">
                                                        <div className="w-10 h-10 rounded-full bg-[var(--text-primary)]/10 flex items-center justify-center overflow-hidden">
                                                            {member.avatar ? <img src={member.avatar} className="w-full h-full object-cover" /> : <Users size={16} />}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-[var(--text-primary)] text-sm">{member.name || "Team Member"}</p>
                                                            <p className="text-xs text-[var(--text-secondary)]">{member.role || "Role"}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Problem/Solution */}
                                    <div className="grid grid-cols-1 gap-4">
                                        {selectedMentee.startupId?.problem && (
                                            <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-5">
                                                <h4 className="font-bold text-red-500 mb-2 flex items-center gap-2">⚠️ The Problem</h4>
                                                <p className="text-[var(--text-primary)]/80 text-sm leading-relaxed">{selectedMentee.startupId.problem}</p>
                                            </div>
                                        )}
                                        {selectedMentee.startupId?.solution && (
                                            <div className="bg-green-500/5 border border-green-500/10 rounded-2xl p-5">
                                                <h4 className="font-bold text-green-600 mb-2 flex items-center gap-2">💡 The Solution</h4>
                                                <p className="text-[var(--text-primary)]/80 text-sm leading-relaxed">{selectedMentee.startupId.solution}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </div>

                            {/* Footer Actions */}
                            <div className="p-6 border-t border-[var(--text-primary)]/10 bg-[var(--text-primary)]/5 flex gap-4">
                                <button
                                    onClick={() => handleRemoveMentee(selectedMentee._id)}
                                    className="flex-1 bg-red-500/10 text-red-500 border border-red-500/20 py-3 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all"
                                >
                                    End Mentorship
                                </button>
                                <button
                                    onClick={() => setSelectedMentee(null)}
                                    className="flex-1 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MentorMentees;
