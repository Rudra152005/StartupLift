import React, { useState, useEffect } from 'react';
import { Shield, Clock, AlertTriangle, CheckCircle, Search, FileDown } from 'lucide-react';
import axios from '../../api/axiosInstance';

const AdminLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await axios.get('/admin/security/logs');
            const data = res.data;
            if (Array.isArray(data)) {
                setLogs(data);
            } else {
                setLogs([]);
            }
            setLoading(false);
        } catch (err) {
            console.error('Error fetching security logs:', err);
            setLoading(false);
            setLogs([]);
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'HIGH': return 'text-red-600 bg-red-50 border-red-100 dark:text-red-400 dark:bg-red-900/10 dark:border-red-900/20';
            case 'MEDIUM': return 'text-amber-600 bg-amber-50 border-amber-100 dark:text-amber-400 dark:bg-amber-900/10 dark:border-amber-900/20';
            default: return 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/10 dark:border-emerald-900/20';
        }
    };

    const filteredLogs = logs.filter(log =>
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.ipAddress.includes(searchTerm)
    );

    const handleExport = () => {
        const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
            JSON.stringify(logs)
        )}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = "security_logs.json";
        link.click();
    };

    if (loading) return <div className="p-8 text-gray-500 text-center">Loading security logs...</div>;

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2 flex items-center">
                        <Shield className="mr-4 text-emerald-500" /> Security <span className="text-emerald-500/80 ml-2">Manifest</span>
                    </h1>
                    <p className="text-sm sm:text-base text-gray-500 font-medium">Real-time audit of system-level protocols and administrative trajectory.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
                    <div className="relative flex-1 sm:w-80 group">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-500/50 group-focus-within:text-emerald-400 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Interrogate logs..."
                            className="w-full bg-white/5 border border-white/10 text-white pl-12 pr-4 py-3.5 rounded-2xl focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all placeholder:text-gray-700 hover:bg-white/10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleExport}
                        className="cinematic-glass hover:bg-emerald-500/10 text-emerald-400 px-6 py-3.5 rounded-2xl border border-white/10 flex items-center justify-center transition-all active:scale-[0.98] font-black text-[10px] uppercase tracking-widest gap-2 shadow-lg"
                    >
                        <FileDown size={18} />
                        Sync Data
                    </button>
                </div>
            </div>

            {/* Logs Table (Cinematic Glass) */}
            <div className="cinematic-glass rounded-[2.5rem] border border-white/5 overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.4)] transition-all duration-700">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5">
                                <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-gray-500">Operation</th>
                                <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-gray-500 text-center">Threat Level</th>
                                <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-gray-500">Event Context</th>
                                <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-gray-500">Entity / Nexus</th>
                                <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-gray-500">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-300 divide-y divide-white/5">
                            {filteredLogs.length === 0 ? (
                                <tr><td colSpan="5" className="p-20 text-center text-gray-600 font-black text-xs uppercase tracking-[0.2em]">No operational records detected.</td></tr>
                            ) : (
                                filteredLogs.map(log => (
                                    <tr key={log._id} className="hover:bg-white/[0.03] transition-all group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(6,182,212,0.8)] animate-pulse-soft" />
                                                <span className="font-mono text-[11px] text-emerald-400 font-black uppercase tracking-tighter group-hover:text-emerald-300 transition-colors">
                                                    {log.action}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-6 text-center">
                                            <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] border transition-all ${log.severity === 'HIGH' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]' :
                                                log.severity === 'MEDIUM' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                                                    'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                                                }`}>
                                                {log.severity}
                                            </span>
                                        </td>
                                        <td className="p-6">
                                            <div className="max-w-xs xl:max-w-md">
                                                <p className="text-[11px] text-gray-400 font-medium leading-relaxed group-hover:text-gray-200 transition-colors" title={log.details}>
                                                    {log.details}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-black text-white uppercase tracking-widest">{log.adminId?.name || 'Automated System'}</span>
                                                <span className="text-[10px] text-gray-600 font-mono mt-0.5 tracking-tighter">{log.ipAddress}</span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-black text-gray-400 tracking-tight">
                                                    {new Date(log.createdAt).toLocaleDateString()}
                                                </span>
                                                <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-0.5">
                                                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                </span>
                                            </div>
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

export default AdminLogs;
