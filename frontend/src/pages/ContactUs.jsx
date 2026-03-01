import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MapPin, Phone, Send, CheckCircle2, Globe, Clock } from 'lucide-react';
import axios from '../api/axiosInstance';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ContactUs = () => {
    const [formState, setFormState] = useState('idle'); // idle, sending, success, error
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        objective: 'Funding Inquiry',
        message: ''
    });
    const [errorMessage, setErrorMessage] = useState('');

    const contactInfo = [
        {
            icon: Mail,
            label: "Strategic Inquiries",
            value: "rudratiwari152005@gmail.com",
            description: "For partnership and investment opportunities."
        },
        {
            icon: Phone,
            label: "Direct Support",
            value: "+1 (555) 000-1111",
            description: "Priority support for verified founders."
        },
        {
            icon: MapPin,
            label: "Global Nexus",
            value: "San Francisco, CA",
            description: "Silicon Valley Innovation Center."
        },
        {
            icon: Globe,
            label: "Digital Presence",
            value: "startuplift.com",
            description: "Connecting the global founder network."
        }
    ];

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormState('sending');
        setErrorMessage('');

        try {
            const response = await axios.post('/contact', formData);

            if (response.data.success || response.status === 200) {
                setFormState('success');
                // Reset form
                setFormData({
                    name: '',
                    email: '',
                    objective: 'Funding Inquiry',
                    message: ''
                });
                // Reset to idle after 5 seconds
                setTimeout(() => setFormState('idle'), 5000);
            } else {
                setFormState('error');
                setErrorMessage(response.data.message || 'Failed to send message. Please try again.');
                setTimeout(() => setFormState('idle'), 5000);
            }
        } catch (error) {
            console.error('Contact form error:', error);
            setFormState('error');
            setErrorMessage('Network error. Please check your connection and try again.');
            setTimeout(() => setFormState('idle'), 5000);
        }
    };

    return (
        <div className="bg-[var(--bg-primary)] min-h-screen text-[var(--text-primary)] transition-colors duration-300 overflow-hidden relative">
            <Navbar />

            {/* Background Ambience */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/5 blur-[140px] rounded-full" />
                <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full" />
            </div>

            <main className="relative z-10 pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

                {/* Header Section */}
                <div className="text-center mb-20">
                    <motion.span
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-block px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-black uppercase tracking-[0.2em] mb-6"
                    >
                        Connect with us
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl sm:text-6xl font-black text-white tracking-tight mb-6"
                    >
                        Initialize <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">Strategic Contact</span>
                    </motion.h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto font-medium">
                        Reach out to our executive team or support desk to accelerate your venture's trajectory.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-start">

                    {/* Contact Form Container */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="cinematic-glass p-8 sm:p-10 rounded-[2.5rem] border border-white/5 relative overflow-hidden group shadow-[0_25px_60px_rgba(0,0,0,0.5)]"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Full Identity</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter name"
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all font-bold text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Secure Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="email@example.com"
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all font-bold text-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Strategic Objective</label>
                                <select
                                    name="objective"
                                    value={formData.objective}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-bold text-sm appearance-none cursor-pointer"
                                >
                                    <option className="bg-[#020617]">Funding Inquiry</option>
                                    <option className="bg-[#020617]">Mentorship Application</option>
                                    <option className="bg-[#020617]">Strategic Partnership</option>
                                    <option className="bg-[#020617]">Technical Support</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Communication Payload</label>
                                <textarea
                                    rows="5"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="Draft your message..."
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-3xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all font-bold text-sm resize-none"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={formState !== 'idle'}
                                className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-3 ${formState === 'success'
                                    ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                                    : formState === 'error'
                                        ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                                        : 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-[0_10px_30px_rgba(6,182,212,0.3)] hover:shadow-[0_15px_40px_rgba(6,182,212,0.5)]'
                                    }`}
                            >
                                {formState === 'idle' && (
                                    <>
                                        <Send size={16} /> Broadcast Message
                                    </>
                                )}
                                {formState === 'sending' && (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                )}
                                {formState === 'success' && (
                                    <>
                                        <CheckCircle2 size={16} /> Transmission Successful
                                    </>
                                )}
                                {formState === 'error' && (
                                    <>
                                        ✕ Transmission Failed
                                    </>
                                )}
                            </button>

                            {/* Error Message */}
                            <AnimatePresence>
                                {formState === 'error' && errorMessage && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium text-center"
                                    >
                                        {errorMessage}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>
                    </motion.div>

                    {/* Contact Info Cards */}
                    <div className="space-y-6">
                        <div className="grid sm:grid-cols-2 gap-6">
                            {contactInfo.map((info, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                    className="cinematic-glass p-6 rounded-[2rem] border border-white/5 group hover:border-emerald-500/20 transition-all duration-500"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 text-emerald-500 group-hover:scale-110 transition-transform">
                                        <info.icon size={20} />
                                    </div>
                                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{info.label}</h3>
                                    <p className="text-white font-black text-sm mb-2">{info.value}</p>
                                    <p className="text-gray-600 text-[10px] font-bold uppercase leading-tight">{info.description}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Availability Banner */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="cinematic-glass p-8 rounded-[2rem] border border-emerald-500/10 flex items-center gap-6 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <Clock size={80} className="text-emerald-500" />
                            </div>
                            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                                <Clock size={32} />
                            </div>
                            <div>
                                <h4 className="text-white font-black text-lg uppercase tracking-tight mb-1">Operational Hours</h4>
                                <p className="text-gray-400 text-sm font-medium">Monday — Friday: 09:00 - 18:00 PST</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,1)]" />
                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Systems Active</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ContactUs;
