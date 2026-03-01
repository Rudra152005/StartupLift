import React, { useState, useEffect } from 'react';
import { Search, Trash2, X, Plus, Award, Briefcase } from 'lucide-react';
import axios from '../../api/axiosInstance';

const AdminMentors = () => {
    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newMentor, setNewMentor] = useState({
        name: '',
        email: '',
        role: 'Mentor',
        status: 'Active',
        expertise: '',
        company: ''
    });

    useEffect(() => {
        fetchMentors();
    }, []);

    const fetchMentors = async () => {
        try {
            const res = await axios.get('/admin/all-mentors');
            setMentors(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching mentors:', err);
            setLoading(false);
        }
    };

    const handleAddMentor = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...newMentor,
                expertise: newMentor.expertise.split(',').map(s => s.trim())
            };

            const res = await axios.post('/admin/users', payload);
            if (res.status === 200 || res.status === 201) {
                fetchMentors();
                setIsAdding(false);
                setNewMentor({ name: '', email: '', role: 'Mentor', status: 'Active', expertise: '', company: '' });
            }
        } catch (err) {
            console.error('Error adding mentor:', err);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to remove this mentor?')) return;
        try {
            const res = await axios.delete(`/admin/users/${id}`);
            if (res.status === 200) {
                fetchMentors();
            }
        } catch (err) {
            console.error('Error deleting mentor:', err);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 px-2 sm:px-0">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">Mentor <span className="text-emerald-500/80">Network</span></h1>
                    <p className="text-sm sm:text-base text-gray-500 font-medium">Curate and oversee the expert mentorship ecosystem.</p>
                </div>

                <div className="w-full sm:w-auto flex items-center gap-4">
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-2xl flex items-center justify-center transition-all duration-300 text-sm font-black uppercase tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-105 active:scale-95"
                    >
                        <Plus size={18} className="mr-2" />
                        Add New Mentor
                    </button>
                </div>
            </div>

            {/* Add Mentor Form (Cinematic) */}
            {isAdding && (
                <div className="cinematic-glass p-8 rounded-[2rem] border border-emerald-500/20 mb-10 shadow-[0_20px_40px_rgba(0,0,0,0.3)] relative overflow-hidden group">
                    <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <h3 className="relative z-10 text-lg font-black text-white mb-2 uppercase tracking-tight">Onboard <span className="text-emerald-500">New Mentor</span></h3>
                    <p className="relative z-10 text-xs text-gray-500 font-bold uppercase tracking-widest mb-6">Register an expert to join the mentorship talent pool.</p>

                    <form onSubmit={handleAddMentor} className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <input
                            type="text"
                            placeholder="Full Name"
                            className="bg-white/5 border border-white/10 text-white p-4 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-medium"
                            value={newMentor.name}
                            onChange={e => setNewMentor({ ...newMentor, name: e.target.value })}
                            required
                        />
                        <input
                            type="email"
                            placeholder="Professional Email"
                            className="bg-white/5 border border-white/10 text-white p-4 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-medium"
                            value={newMentor.email}
                            onChange={e => setNewMentor({ ...newMentor, email: e.target.value })}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Organization / Designation"
                            className="bg-white/5 border border-white/10 text-white p-4 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-medium"
                            value={newMentor.company}
                            onChange={e => setNewMentor({ ...newMentor, company: e.target.value })}
                        />
                        <div className="lg:col-span-2 relative">
                            <input
                                type="text"
                                placeholder="Core Expertises (e.g. Fintech, AI, Scaling - comma separated)"
                                className="w-full bg-white/5 border border-white/10 text-white p-4 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-medium"
                                value={newMentor.expertise}
                                onChange={e => setNewMentor({ ...newMentor, expertise: e.target.value })}
                            />
                        </div>
                        <button type="submit" className="bg-emerald-500 text-white font-black p-4 rounded-2xl hover:bg-emerald-400 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] uppercase tracking-widest">
                            Provision Mentor
                        </button>
                    </form>
                </div>
            )}

            {/* Mentors Table (Cinematic Glass) */}
            <div className="cinematic-glass rounded-[2.5rem] border border-white/5 overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.4)] transition-all duration-700">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5">
                                <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-gray-500">Expert Guardian</th>
                                <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-gray-500">Professional Context</th>
                                <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-gray-500">Core Domains</th>
                                <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-gray-500">Vetting Status</th>
                                <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-gray-500">Enrolled</th>
                                <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-gray-500 text-center">Execute</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-300 divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan="6" className="p-16 text-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                                        <span className="text-gray-500 font-bold text-xs uppercase tracking-widest">Parsing Mentor Dossiers...</span>
                                    </div>
                                </td></tr>
                            ) : (
                                mentors.map(mentor => (
                                    <tr key={mentor._id} className="hover:bg-white/[0.03] transition-all group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-[1.25rem] bg-gradient-to-br from-emerald-600/20 to-emerald-600/20 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-black shadow-[0_0_15px_rgba(6,182,212,0.1)] group-hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all">
                                                    {(mentor.name || '?').charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-sm font-black text-white truncate leading-none mb-1">{mentor.name}</div>
                                                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{mentor.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-500">
                                                    <Briefcase size={14} />
                                                </div>
                                                <span className="text-[13px] font-medium text-gray-400">
                                                    {mentor.company || mentor.jobTitle || 'Unspecified'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-wrap gap-2">
                                                {mentor.expertise && mentor.expertise.length > 0 ? (
                                                    mentor.expertise.slice(0, 2).map((skill, i) => (
                                                        <span key={i} className="bg-emerald-500/5 border border-emerald-500/20 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider text-emerald-400/80 shadow-[0_0_10px_rgba(6,182,212,0.05)]">
                                                            {skill}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-600 text-[10px] font-bold uppercase tracking-widest italic">Opaque Domain</span>
                                                )}
                                                {mentor.expertise && mentor.expertise.length > 2 && (
                                                    <span className="text-[10px] font-black text-gray-600 bg-white/5 px-2 py-1 rounded-lg">+{mentor.expertise.length - 2}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2.5">
                                                <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${mentor.status === 'Active' ? 'bg-emerald-500' :
                                                    mentor.status === 'Pending' ? 'bg-amber-500' : 'bg-rose-500'
                                                    }`} />
                                                <span className={`text-[11px] font-black uppercase tracking-widest ${mentor.status === 'Active' ? 'text-emerald-400' :
                                                    mentor.status === 'Pending' ? 'text-amber-400' : 'text-rose-400'
                                                    }`}>
                                                    {mentor.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-6 text-gray-500 text-[11px] font-bold uppercase tracking-wider">
                                            {new Date(mentor.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </td>
                                        <td className="p-6 text-center">
                                            <button
                                                onClick={() => handleDeleteUser(mentor._id)}
                                                className="p-3 rounded-2xl text-rose-500/70 hover:text-white hover:bg-rose-500/20 hover:shadow-[0_0_15px_rgba(244,63,94,0.3)] transition-all duration-300"
                                                title="Revoke Mentor Access"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                            {!loading && mentors.length === 0 && (
                                <tr><td colSpan="6" className="p-20 text-center text-gray-600">No mentor records detected in the neural buffer.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminMentors;
