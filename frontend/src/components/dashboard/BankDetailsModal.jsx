import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, CreditCard, Save, Loader, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const BankDetailsModal = ({ isOpen, onClose, existingDetails, onSave }) => {
    const [formData, setFormData] = useState({
        accountName: '',
        accountNumber: '',
        ifsc: '',
        bankName: ''
    });
    const [showAccountNumber, setShowAccountNumber] = useState(false);
    const [showIfsc, setShowIfsc] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (existingDetails) {
            setFormData({
                accountName: existingDetails.accountName || '',
                accountNumber: existingDetails.accountNumber || '',
                ifsc: existingDetails.ifsc || '',
                bankName: existingDetails.bankName || ''
            });
        }
    }, [existingDetails]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = sessionStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const response = await axios.post('http://localhost:5000/api/dashboard/bank-details', formData, config);

            if (response.data.success) {
                toast.success("Bank details updated successfully!");
                onSave(response.data.data);
                onClose();
            }
        } catch (error) {
            console.error("Error updating bank details:", error);
            toast.error("Failed to update bank details");
        } finally {
            setLoading(false);
        }
    };

    return createPortal(
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm" onClick={onClose}>
                <div className="h-full flex items-start justify-center pt-28 pb-8 px-4 overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 w-full max-w-md rounded-2xl p-6 shadow-2xl max-h-[calc(100vh-8rem)] overflow-y-auto mt-4"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                            <Building2 className="text-[var(--color-primary)]" /> Banking Details
                        </h3>
                        <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--text-secondary)]">Account Holder Name</label>
                            <input
                                required
                                type="text"
                                value={formData.accountName}
                                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                                className="w-full bg-[var(--bg-primary)] px-4 py-3 rounded-xl border border-[var(--text-primary)]/10 focus:border-[var(--color-primary)] focus:outline-none text-[var(--text-primary)]"
                                placeholder="e.g. John Doe"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--text-secondary)]">Account Number</label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                                <input
                                    required
                                    type={showAccountNumber ? "text" : "password"}
                                    value={formData.accountNumber}
                                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                    className="w-full bg-[var(--bg-primary)] pl-10 pr-10 py-3 rounded-xl border border-[var(--text-primary)]/10 focus:border-[var(--color-primary)] focus:outline-none text-[var(--text-primary)]"
                                    placeholder="e.g. 123456789012"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowAccountNumber(!showAccountNumber)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                >
                                    {showAccountNumber ? <Eye size={18} /> : <EyeOff size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[var(--text-secondary)]">IFSC Code</label>
                                <div className="relative">
                                    <input
                                        required
                                        type={showIfsc ? "text" : "password"}
                                        value={formData.ifsc}
                                        onChange={(e) => setFormData({ ...formData, ifsc: e.target.value.toUpperCase() })}
                                        className="w-full bg-[var(--bg-primary)] px-4 py-3 pr-10 rounded-xl border border-[var(--text-primary)]/10 focus:border-[var(--color-primary)] focus:outline-none text-[var(--text-primary)]"
                                        placeholder="ABCD0123456"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowIfsc(!showIfsc)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                    >
                                        {showIfsc ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[var(--text-secondary)]">Bank Name</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.bankName}
                                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                    className="w-full bg-[var(--bg-primary)] px-4 py-3 rounded-xl border border-[var(--text-primary)]/10 focus:border-[var(--color-primary)] focus:outline-none text-[var(--text-primary)]"
                                    placeholder="e.g. HDFC Bank"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-6 bg-[var(--color-primary)] text-white py-3 rounded-xl font-bold hover:bg-[var(--color-secondary)] transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader className="animate-spin" size={20} /> : <><Save size={20} /> Save Details</>}
                        </button>
                    </form>
                    </motion.div>
                </div>
            </div>
        </AnimatePresence>,
        document.body
    );
};

export default BankDetailsModal;
