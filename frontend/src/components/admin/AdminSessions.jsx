import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, CheckCircle, XCircle } from 'lucide-react';
import axios from '../../api/axiosInstance';

const AdminSessions = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const res = await axios.get('/admin/all-sessions');
            setSessions(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching sessions:', err);
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'scheduled': return 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/10 dark:border-emerald-900/20';
            case 'completed': return 'text-green-600 bg-green-50 border-green-100 dark:text-green-400 dark:bg-green-900/10 dark:border-green-900/20';
            case 'cancelled': return 'text-red-600 bg-red-50 border-red-100 dark:text-red-400 dark:bg-red-900/10 dark:border-red-900/20';
            default: return 'text-gray-600 bg-gray-50 border-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-700';
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">Mentorship <span className="text-emerald-500/80">Engagements</span></h1>
                <p className="text-sm sm:text-base text-gray-500 font-medium">Synchronize and audit high-level strategic consultations across the network.</p>
            </div>

            {/* Sessions Table (Cinematic Glass) */}
            <div className="cinematic-glass rounded-[2.5rem] border border-white/5 overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.4)] transition-all duration-700">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5">
                                <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-gray-500">Session Context</th>
                                <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-gray-500">Lead Mentor</th>
                                <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-gray-500">Venture/Founder</th>
                                <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-gray-500">Temporal Slot</th>
                                <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-gray-500">State</th>
                                <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-gray-500 text-center">Nexus Link</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-300 divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan="6" className="p-16 text-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                                        <span className="text-gray-500 font-bold text-xs uppercase tracking-widest">Querying Temporal Hub...</span>
                                    </div>
                                </td></tr>
                            ) : sessions.length === 0 ? (
                                <tr><td colSpan="6" className="p-20 text-center text-gray-600 font-black text-xs uppercase tracking-[0.2em]">No active engagements detected.</td></tr>
                            ) : (
                                sessions.map(session => (
                                    <tr key={session._id} className="hover:bg-white/[0.03] transition-all group">
                                        <td className="p-6">
                                            <div className="max-w-[240px]">
                                                <div className="font-black text-white text-[15px] mb-1 group-hover:text-emerald-400 transition-colors uppercase tracking-tight line-clamp-1">{session.title}</div>
                                                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wider line-clamp-1">
                                                    {session.description || 'General Consultation'}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{session.mentorId?.name || 'Unassigned'}</span>
                                                <span className="text-[9px] text-gray-600 font-bold uppercase">Subject Expert</span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{session.founderId?.name || session.menteeId?.name || 'Unknown Agent'}</span>
                                                <span className="text-[9px] text-gray-600 font-bold uppercase">Executive Lead</span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2 text-white font-black text-[11px] uppercase tracking-tighter">
                                                    <Calendar size={12} className="text-emerald-500/50" />
                                                    {new Date(session.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-500 font-bold text-[10px] uppercase tracking-widest">
                                                    <Clock size={12} className="text-gray-700" />
                                                    {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] border transition-colors ${session.status === 'completed' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' :
                                                session.status === 'cancelled' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' :
                                                    'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                                                }`}>
                                                {session.status}
                                            </span>
                                        </td>
                                        <td className="p-6 text-center">
                                            {session.meetingLink ? (
                                                <a
                                                    href={session.meetingLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2.5 bg-white/5 border border-white/10 text-emerald-500 hover:text-white hover:bg-emerald-500 px-4 py-2 rounded-2xl transition-all duration-300 font-black text-[10px] uppercase tracking-widest group/link"
                                                >
                                                    <Video size={14} className="group-hover/link:scale-110 transition-transform" />
                                                    Initialize
                                                </a>
                                            ) : (
                                                <span className="text-gray-700 text-[10px] font-black uppercase tracking-widest opacity-50">Offline</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminSessions;
