// src/components/admin/AdminProfile.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Save, Camera, User, Mail, Phone, FileText, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from '../../api/axiosInstance';

const AdminProfile = () => {
    const { user, setUserData } = useAuth();
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        bio: user?.bio || "",
        avatar: user?.avatar || ""
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
                phone: user.phone || "",
                bio: user.bio || "",
                avatar: user.avatar || ""
            });
        }
    }, [user]);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage("");
        try {
            const token = sessionStorage.getItem('token');
            const response = await axios.put('/auth/profile', formData, config);

            if (response.data.success) {
                setMessage("✅ Profile updated successfully!");
                if (setUserData && response.data.user) {
                    setUserData(response.data.user);
                    // Ensure local form data is in sync with server response
                    setFormData({
                        name: response.data.user.name || "",
                        email: response.data.user.email || "",
                        phone: response.data.user.phone || "",
                        bio: response.data.user.bio || "",
                        avatar: response.data.user.avatar || ""
                    });
                }
            } else {
                setMessage("❌ " + (response.data.message || "Failed to save."));
            }
        } catch (err) {
            console.error('Save error:', err);
            setMessage("❌ Failed to save. Please try again.");
        } finally {
            setSaving(false);
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to see the message
            setTimeout(() => setMessage(""), 5000);
        }

    };

    const handleAvatarClick = () => {
        fileInputRef.current.click();
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setMessage("❌ Please upload a valid image (JPEG, PNG, GIF, WebP)");
            return;
        }

        setUploading(true);
        try {
            const token = sessionStorage.getItem('token');
            const uploadData = new FormData();
            uploadData.append('file', file);

            const uploadRes = await axios.post('/upload', uploadData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (uploadRes.data.success) {
                const newAvatar = uploadRes.data.url;
                setFormData(prev => ({ ...prev, avatar: newAvatar }));

                // Also update immediately via API
                await axios.put('/auth/profile', { avatar: newAvatar });

                if (setUserData) {
                    setUserData({ ...user, avatar: newAvatar });
                }
                setMessage("✅ Avatar updated!");
            }
        } catch (err) {
            console.error('Upload error:', err);
            setMessage("❌ Failed to upload avatar.");
        } finally {
            setUploading(false);
            setTimeout(() => setMessage(""), 3000);
        }
    };

    const currentAvatar = formData.avatar || `https://ui-avatars.com/api/?name=${formData.name || 'Admin'}&background=3b82f6&color=fff&bold=true`;

    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700">
            <div className="px-2 sm:px-0 flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="text-center sm:text-left">
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-4">
                        <User className="text-emerald-500" /> Admin <span className="text-emerald-500/80">Identity</span>
                    </h1>
                    <p className="text-sm sm:text-base text-gray-500 font-medium mt-1">Manage your high-level administrative credentials and presence.</p>
                </div>

                {message && (
                    <div className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-3xl animate-in slide-in-from-top-4 duration-500 border ${message.includes('✅')
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.1)]'}`}>
                        {message}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
                {/* Left Card: Avatar (Cinematic Glass) */}
                <div className="cinematic-glass p-10 rounded-[2.5rem] border border-white/5 flex flex-col items-center shadow-[0_25px_60px_rgba(0,0,0,0.4)] text-center relative overflow-hidden group">
                    {/* Decorative Background Glow */}
                    <div className="absolute -top-12 -left-12 w-32 h-32 bg-emerald-500/5 blur-[60px] rounded-full group-hover:bg-emerald-500/10 transition-all duration-700" />

                    <div className="relative group/avatar cursor-pointer" onClick={handleAvatarClick}>
                        <div className="absolute inset-0 bg-emerald-500 rounded-[2.5rem] blur-2xl opacity-10 group-hover/avatar:opacity-20 transition-opacity"></div>
                        <img
                            src={currentAvatar}
                            alt="Profile"
                            className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-[2.5rem] object-cover border-4 border-white/5 shadow-2xl z-10 group-hover/avatar:scale-105 transition-transform duration-500"
                        />

                        {/* Squircle Camera Icon */}
                        <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-[1.25rem] border-4 border-[#020617] shadow-xl z-20 group-hover/avatar:scale-110 transition-all duration-300">
                            <Camera size={20} className="text-white" />
                        </div>

                        <div className="absolute inset-0 rounded-[2.5rem] bg-black/60 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity z-20">
                            <span className="text-white text-[9px] font-black uppercase tracking-[0.2em]">Update Node</span>
                        </div>

                        {uploading && (
                            <div className="absolute inset-0 rounded-[2.5rem] bg-[#020617]/80 backdrop-blur-sm flex items-center justify-center z-30">
                                <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
                            </div>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                        />
                    </div>

                    <div className="mt-8 w-full">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight break-words line-clamp-2 group-hover:text-emerald-400 transition-colors">{formData.name || "Unknown Operator"}</h2>
                        <div className="inline-flex items-center gap-2 mt-3 px-4 py-1.5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                            <CheckCircle size={14} className="text-emerald-500" />
                            <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Root Administrator</span>
                        </div>
                    </div>
                </div>

                {/* Right Card: Form (Cinematic Glass) */}
                <div className="lg:col-span-2 cinematic-glass p-10 sm:p-12 rounded-[2.5rem] border border-white/5 shadow-[0_25px_60px_rgba(0,0,0,0.4)] relative overflow-hidden">
                    {/* Decorative Background Glow */}
                    <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-600/5 blur-[100px] rounded-full" />

                    <form onSubmit={handleSave} className="space-y-8 relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                    <User size={14} className="text-emerald-500/50" /> Operator Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all text-white font-medium hover:bg-white/10 placeholder:text-gray-700"
                                    placeholder="Enter full name"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                    <Mail size={14} className="text-emerald-500/50" /> Access Key (Email)
                                </label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={formData.email}
                                        disabled
                                        className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-5 py-4 text-gray-600 font-mono text-sm cursor-not-allowed"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-bold text-rose-500/40 uppercase tracking-widest border border-rose-500/10 px-2 py-1 rounded-lg bg-rose-500/5">
                                        Immutable
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                    <Phone size={14} className="text-emerald-500/50" /> Comms Channel
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all text-white font-medium hover:bg-white/10 placeholder:text-gray-700 font-mono"
                                    placeholder="+91 00000 00000"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                <FileText size={14} className="text-emerald-500/50" /> Professional Status
                            </label>
                            <textarea
                                rows={4}
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all text-white font-medium resize-none hover:bg-white/10 placeholder:text-gray-700 text-sm leading-relaxed"
                                placeholder="Broadcast your administrative focus..."
                            />
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.25em] flex items-center justify-center gap-3 transition-all shadow-xl hover:shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-50 group/save"
                            >
                                {saving ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Save size={18} className="group-hover/save:scale-110 transition-transform" />
                                )}
                                Synchronize Profile Nodes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminProfile;
