import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, FileText, CheckCircle, Clock } from 'lucide-react';
import axios from '../../api/axiosInstance';

const AdminPrograms = () => {
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newProgram, setNewProgram] = useState({
        title: '',
        description: '',
        fundingAmount: '',
        type: 'Incubation',
        deadline: '',
        status: 'Active',
        requirements: ''
    });

    useEffect(() => {
        fetchPrograms();
    }, []);

    const fetchPrograms = async () => {
        try {
            const res = await axios.get('/admin/programs');
            const data = res.data;
            // Handle both response formats: direct array OR { success: true, data: [...] }
            if (data.success && Array.isArray(data.data)) {
                setPrograms(data.data);
            } else if (Array.isArray(data)) {
                setPrograms(data);
            } else {
                console.error('Unexpected response format:', data);
                setPrograms([]);
            }
            setLoading(false);
        } catch (err) {
            console.error('Error fetching programs:', err);
            setLoading(false);
        }
    };

    const handleCreateProgram = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/admin/programs', {
                ...newProgram,
                isActive: newProgram.status === 'Active' // Map status to isActive boolean
            });
            if (res.status === 200 || res.status === 201) {
                fetchPrograms();
                setIsCreating(false);
                setNewProgram({
                    title: '',
                    description: '',
                    fundingAmount: '',
                    type: 'Incubation',
                    deadline: '',
                    status: 'Active',
                    requirements: ''
                });
            }
        } catch (err) {
            console.error('Error creating program:', err);
        }
    };


    const handleDeleteProgram = async (id) => {
        if (!window.confirm('Are you sure you want to delete this program?')) return;
        try {
            const res = await axios.delete(`/admin/programs/${id}`);
            if (res.status === 200) {
                fetchPrograms();
            }
        } catch (err) {
            console.error('Error deleting program:', err);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 px-2 sm:px-0">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">Programs & <span className="text-emerald-500/80">Capital</span></h1>
                    <p className="text-sm sm:text-base text-gray-500 font-medium">Engineer and manage high-velocity incubation and funding channels.</p>
                </div>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-2xl flex items-center justify-center transition-all duration-300 text-sm font-black uppercase tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-105 active:scale-95"
                >
                    <Plus size={18} className="mr-2" />
                    Initialize Program
                </button>
            </div>

            {/* Create Program Form (Cinematic) */}
            {isCreating && (
                <div className="cinematic-glass p-8 rounded-[2rem] border border-emerald-500/20 mb-10 shadow-[0_20px_40px_rgba(0,0,0,0.3)] relative overflow-hidden group">
                    <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <h3 className="relative z-10 text-lg font-black text-white mb-2 uppercase tracking-tight">Design <span className="text-emerald-500">Opportunity</span></h3>
                    <p className="relative z-10 text-xs text-gray-500 font-bold uppercase tracking-widest mb-6">Provision a new incubation or funding protocol for the network.</p>

                    <form onSubmit={handleCreateProgram} className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-gray-400 font-black text-[10px] uppercase tracking-widest mb-2 px-1">Program Label</label>
                            <input
                                type="text"
                                className="w-full bg-white/5 border border-white/10 text-white p-4 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-medium placeholder:text-gray-700"
                                placeholder="Quantum Leap Accelerator..."
                                value={newProgram.title}
                                onChange={e => setNewProgram({ ...newProgram, title: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 font-black text-[10px] uppercase tracking-widest mb-2 px-1">Program Architecture</label>
                            <select
                                className="w-full bg-white/5 border border-white/10 text-white p-4 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-medium cursor-pointer"
                                value={newProgram.type}
                                onChange={e => setNewProgram({ ...newProgram, type: e.target.value })}
                            >
                                <option className="bg-[#020617]">Incubation</option>
                                <option className="bg-[#020617]">Acceleration</option>
                                <option className="bg-[#020617]">Grant</option>
                                <option className="bg-[#020617]">Equity Funding</option>
                                <option className="bg-[#020617]">Mentorship</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-gray-400 font-black text-[10px] uppercase tracking-widest mb-2 px-1">Capital / Valuation</label>
                            <input
                                type="text"
                                placeholder="e.g. $100K Seed or Equity-Free"
                                className="w-full bg-white/5 border border-white/10 text-white p-4 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-medium placeholder:text-gray-700"
                                value={newProgram.fundingAmount}
                                onChange={e => setNewProgram({ ...newProgram, fundingAmount: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 font-black text-[10px] uppercase tracking-widest mb-2 px-1">Temporal Deadline</label>
                            <input
                                type="date"
                                className="w-full bg-white/5 border border-white/10 text-white p-4 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-medium"
                                value={newProgram.deadline}
                                onChange={e => setNewProgram({ ...newProgram, deadline: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 font-black text-[10px] uppercase tracking-widest mb-2 px-1">Deployment State</label>
                            <select
                                className="w-full bg-white/5 border border-white/10 text-white p-4 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-medium cursor-pointer"
                                value={newProgram.status}
                                onChange={e => setNewProgram({ ...newProgram, status: e.target.value })}
                            >
                                <option className="bg-[#020617]">Active</option>
                                <option className="bg-[#020617]">Upcoming</option>
                                <option className="bg-[#020617]">Closed</option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-gray-400 font-black text-[10px] uppercase tracking-widest mb-2 px-1">Program Abstract</label>
                            <textarea
                                className="w-full bg-white/5 border border-white/10 text-white p-4 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-medium h-32 custom-scrollbar placeholder:text-gray-700"
                                placeholder="Comprehensive program objectives and curriculum outline..."
                                value={newProgram.description}
                                onChange={e => setNewProgram({ ...newProgram, description: e.target.value })}
                                required
                            />
                        </div>

                        <div className="md:col-span-2 flex flex-col sm:flex-row justify-end gap-4 mt-6">
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="order-2 sm:order-1 px-8 py-3 text-gray-500 font-black text-xs uppercase tracking-widest hover:text-white transition-colors"
                            >
                                Discard
                            </button>
                            <button
                                type="submit"
                                className="order-1 sm:order-2 bg-emerald-500 text-white font-black px-10 py-3 rounded-2xl hover:bg-emerald-400 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] uppercase tracking-widest"
                            >
                                Deploy Opportunity
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Programs Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 px-2 sm:px-0">
                {loading ? (
                    <div className="flex flex-col items-center gap-4 col-span-2 py-20 opacity-50">
                        <div className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                        <span className="text-gray-500 font-bold text-xs uppercase tracking-widest text-glow-emerald">Synchronizing Program Buffers...</span>
                    </div>
                ) : programs.length === 0 ? (
                    <div className="col-span-2 flex flex-col items-center gap-2 py-20 px-8 border border-white/5 rounded-[2.5rem] bg-white/[0.02] opacity-30">
                        <FileText size={40} className="text-gray-500 mb-4" />
                        <p className="text-gray-500 font-bold text-xs uppercase tracking-[0.3em]">No Active Opportunities Found</p>
                    </div>
                ) : (
                    programs.map(program => {
                        // Compute real-time status based on deadline
                        const isPastDeadline = new Date(program.deadline) < new Date();
                        const displayStatus = isPastDeadline ? 'Closed' : (program.status || 'Active');

                        return (
                            <div key={program._id} className="group relative cinematic-glass p-8 rounded-[2.5rem] border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.5)] transition-all duration-700 hover:-translate-y-2 flex flex-col overflow-hidden">
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-[80px] group-hover:bg-emerald-500/10 transition-all duration-1000" />

                                <div className="relative z-10 flex justify-between items-start mb-8">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-3 mb-4">
                                            <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-colors ${displayStatus === 'Active' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' :
                                                displayStatus === 'Closed' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' :
                                                    'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                                                }`}>
                                                {displayStatus}
                                            </span>
                                            {isPastDeadline && program.status === 'Active' && (
                                                <span className="text-[9px] font-black text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20 uppercase tracking-[0.2em]">
                                                    Auto-Temporal Lock
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-xl font-black text-white group-hover:text-emerald-400 transition-colors duration-500 tracking-tight leading-tight">
                                            {program.title}
                                        </h3>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteProgram(program._id)}
                                        className="p-3 rounded-2xl text-gray-600 hover:text-rose-500 hover:bg-rose-500/10 transition-all duration-300"
                                        title="Decommission Program"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>

                                <p className="relative z-10 text-gray-500 font-medium text-[13px] leading-relaxed mb-8 line-clamp-3 group-hover:text-gray-400 transition-colors">
                                    {program.description}
                                </p>

                                <div className="relative z-10 grid grid-cols-2 gap-6 mt-auto border-t border-white/5 pt-8">
                                    <div className="space-y-1.5">
                                        <div className="text-gray-500 font-black text-[9px] uppercase tracking-widest flex items-center"><FileText size={10} className="mr-2 text-emerald-500/50" /> Program Model</div>
                                        <div className="text-white font-black text-xs uppercase tracking-tight">{program.type}</div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="text-gray-500 font-black text-[9px] uppercase tracking-widest flex items-center"><CheckCircle size={10} className="mr-2 text-emerald-500/50" /> Dynamic Funding</div>
                                        <div className="text-emerald-400 font-black text-xs uppercase tracking-tight">{program.fundingAmount}</div>
                                    </div>
                                    <div className="col-span-2 space-y-2 mt-2">
                                        <div className="flex items-center justify-between">
                                            <div className="text-gray-500 font-black text-[9px] uppercase tracking-widest flex items-center">
                                                <Clock size={10} className="mr-2 text-amber-500/50" />
                                                Temporal Window
                                            </div>
                                            {isPastDeadline && (
                                                <span className="text-[8px] font-black text-rose-500 uppercase tracking-[0.2em] animate-pulse">Window Expired</span>
                                            )}
                                        </div>
                                        <div className={`p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center font-black text-xs uppercase tracking-widest transition-all ${isPastDeadline ? 'text-rose-500 border-rose-500/10' : 'text-gray-400 group-hover:text-white group-hover:bg-white/10'
                                            }`}>
                                            <Calendar size={14} className="mr-3 opacity-50" />
                                            {new Date(program.deadline).toLocaleDateString(undefined, {
                                                year: 'numeric', month: 'short', day: 'numeric'
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default AdminPrograms;
