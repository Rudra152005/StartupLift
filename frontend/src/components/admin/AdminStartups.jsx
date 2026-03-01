import React, { useState, useEffect } from 'react';
import { Search, Trash2, Eye, ExternalLink } from 'lucide-react';
import axios from '../../api/axiosInstance';

const AdminStartups = () => {
    const [startups, setStartups] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStartups();
    }, []);

    const fetchStartups = async () => {
        try {
            const res = await axios.get('/admin/all-startups');
            setStartups(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching startups:', err);
            setLoading(false);
        }
    };

    const handleDeleteStartup = async (id) => {
        if (!window.confirm('Are you sure you want to remove this startup? This cannot be undone.')) return;
        try {
            const res = await axios.delete(`/admin/startups/${id}`);
            if (res.status === 200) {
                fetchStartups();
            }
        } catch (err) {
            console.error('Error deleting startup:', err);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="px-2 sm:px-0">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">Startup <span className="text-emerald-500/80">Ecosystem</span></h1>
                <p className="text-sm sm:text-base text-gray-500 font-medium">Oversee and accelerate the trajectory of high-growth ventures.</p>
            </div>

            {/* Startups Table (Cinematic Glass) */}
            <div className="cinematic-glass rounded-[2.5rem] border border-white/5 overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.4)] transition-all duration-700">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5">
                                <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-gray-500">Venture Identity</th>
                                <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-gray-500">Architect</th>
                                <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-gray-500">Vertical</th>
                                <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-gray-500">Nexus</th>
                                <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-gray-500">Initialization</th>
                                <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-gray-500 text-center">Protocol</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-300 divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan="6" className="p-16 text-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                                        <span className="text-gray-500 font-bold text-xs uppercase tracking-widest">Querying Ecosystem...</span>
                                    </div>
                                </td></tr>
                            ) : (
                                startups.map(startup => (
                                    <tr key={startup._id} className="hover:bg-white/[0.03] transition-all group">
                                        <td className="p-6">
                                            <div className="flex items-center">
                                                {startup.image ? (
                                                    <img src={startup.image} alt={startup.name} className="w-12 h-12 rounded-[1.25rem] mr-4 object-cover border border-white/10 group-hover:border-emerald-500/30 transition-all" />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-[1.25rem] bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center mr-4 text-sm font-black shadow-lg">
                                                        {startup.name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <span className="font-black text-white text-[15px] group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{startup.name}</span>
                                                    <div className="text-[9px] text-gray-600 font-bold uppercase tracking-widest mt-0.5">Verified Asset</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{startup.author ? startup.author.name : 'Origin Unknown'}</span>
                                                <span className="text-[9px] text-gray-600 font-bold uppercase">Primary Founder</span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <span className="bg-emerald-500/5 border border-emerald-500/20 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest text-emerald-400">
                                                {startup.category}
                                            </span>
                                        </td>
                                        <td className="p-6">
                                            {startup.website ? (
                                                <a href={startup.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-emerald-500 hover:text-emerald-400 font-black text-[10px] uppercase tracking-widest group/link transition-all">
                                                    Visit <ExternalLink size={12} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                                                </a>
                                            ) : (
                                                <span className="text-gray-600 text-[10px] font-black uppercase tracking-widest">N/A</span>
                                            )}
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-black text-gray-400">{new Date(startup.createdAt).toLocaleDateString()}</span>
                                                <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Reg. Timestamp</span>
                                            </div>
                                        </td>
                                        <td className="p-6 text-center">
                                            <button
                                                onClick={() => handleDeleteStartup(startup._id)}
                                                className="p-3 rounded-2xl text-rose-500/70 hover:text-white hover:bg-rose-500/20 hover:shadow-[0_0_15px_rgba(244,63,94,0.3)] transition-all duration-300"
                                                title="Decommission Startup"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                            {!loading && startups.length === 0 && (
                                <tr><td colSpan="6" className="p-20 text-center text-gray-600 font-black text-xs uppercase tracking-[0.2em]">No active ventures detected.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminStartups;
