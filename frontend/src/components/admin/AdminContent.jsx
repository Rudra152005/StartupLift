import React, { useState, useEffect } from 'react';
import { Plus, Trash2, FileText, Video, Link as LinkIcon, Download } from 'lucide-react';
import axios from '../../api/axiosInstance';

const AdminContent = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    const [newResource, setNewResource] = useState({
        title: '',
        description: '',
        type: 'Article',
        url: '',
        category: 'General'
    });

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            const res = await axios.get('/admin/all-resources');
            const data = res.data;
            if (Array.isArray(data)) {
                setResources(data);
            } else {
                console.error("API returned non-array:", data);
                setResources([]);
            }
            setLoading(false);
        } catch (err) {
            console.error('Error fetching resources:', err);
            setLoading(false);
            setResources([]);
        }
    };

    const handleCreateResource = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/admin/all-resources', newResource);
            if (res.status === 200 || res.status === 201) {
                fetchResources();
                setIsCreating(false);
                setNewResource({
                    title: '',
                    description: '',
                    type: 'Article',
                    url: '',
                    category: 'General'
                });
            }
        } catch (err) {
            console.error('Error creating resource:', err);
        }
    };

    const handleDeleteResource = async (id) => {
        if (!window.confirm('Are you sure you want to delete this resource?')) return;
        try {
            const res = await axios.delete(`/admin/all-resources/${id}`);
            if (res.status === 200) {
                fetchResources();
            }
        } catch (err) {
            console.error('Error deleting resource:', err);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'Video': return <Video size={18} className="text-emerald-500" />;
            case 'Template': return <Download size={18} className="text-emerald-500" />;
            default: return <FileText size={18} className="text-gray-400" />;
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 px-2 sm:px-0">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">Content <span className="text-emerald-500/80">Repository</span></h1>
                    <p className="text-sm sm:text-base text-gray-500 font-medium">Curate and deploy high-impact educational assets for the ecosystem.</p>
                </div>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-2xl flex items-center justify-center transition-all duration-300 text-sm font-black uppercase tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-105 active:scale-95"
                >
                    <Plus size={18} className="mr-2" />
                    Forge Resource
                </button>
            </div>

            {/* Create Resource Form (Cinematic) */}
            {isCreating && (
                <div className="cinematic-glass p-8 rounded-[2rem] border border-emerald-500/20 mb-10 shadow-[0_20px_40px_rgba(0,0,0,0.3)] relative overflow-hidden group">
                    <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <h3 className="relative z-10 text-lg font-black text-white mb-2 uppercase tracking-tight">Compose <span className="text-emerald-500">Asset</span></h3>
                    <p className="relative z-10 text-xs text-gray-500 font-bold uppercase tracking-widest mb-6">Initialize a new knowledge node within the platform.</p>

                    <form onSubmit={handleCreateResource} className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-gray-400 font-black text-[10px] uppercase tracking-widest mb-2 px-1">Resource Title</label>
                            <input
                                type="text"
                                className="w-full bg-white/5 border border-white/10 text-white p-4 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-medium"
                                value={newResource.title}
                                onChange={e => setNewResource({ ...newResource, title: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 font-black text-[10px] uppercase tracking-widest mb-2 px-1">Classification Type</label>
                            <select
                                className="w-full bg-white/5 border border-white/10 text-white p-4 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-medium cursor-pointer"
                                value={newResource.type}
                                onChange={e => setNewResource({ ...newResource, type: e.target.value })}
                            >
                                <option className="bg-[#020617]">Article</option>
                                <option className="bg-[#020617]">Video</option>
                                <option className="bg-[#020617]">Template</option>
                                <option className="bg-[#020617]">Guide</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-gray-400 font-black text-[10px] uppercase tracking-widest mb-2 px-1">Universal Link (URL)</label>
                            <input
                                type="text"
                                placeholder="https://..."
                                className="w-full bg-white/5 border border-white/10 text-white p-4 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-medium"
                                value={newResource.url}
                                onChange={e => setNewResource({ ...newResource, url: e.target.value })}
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-gray-400 font-black text-[10px] uppercase tracking-widest mb-2 px-1">Contextual Description</label>
                            <textarea
                                className="w-full bg-white/5 border border-white/10 text-white p-4 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-medium h-32 custom-scrollbar"
                                value={newResource.description}
                                onChange={e => setNewResource({ ...newResource, description: e.target.value })}
                                required
                            />
                        </div>

                        <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="px-6 py-3 text-gray-500 font-black text-xs uppercase tracking-widest hover:text-white transition-colors"
                            >
                                Abandon
                            </button>
                            <button
                                type="submit"
                                className="bg-emerald-500 text-white font-black px-8 py-3 rounded-2xl hover:bg-emerald-400 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] uppercase tracking-widest"
                            >
                                Commit to Registry
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Resources List (Cinematic Glass) */}
            <div className="cinematic-glass rounded-[2.5rem] border border-white/5 overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.4)] transition-all duration-700">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5">
                                <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-gray-500">Asset Identity</th>
                                <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-gray-500">Classification</th>
                                <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-gray-500">Neural Link</th>
                                <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-gray-500">Curator</th>
                                <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-gray-500 text-center">Protocol</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-300 divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan="5" className="p-16 text-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                                        <span className="text-gray-500 font-bold text-xs uppercase tracking-widest">Querying Resource Vault...</span>
                                    </div>
                                </td></tr>
                            ) : resources.length === 0 ? (
                                <tr><td colSpan="5" className="p-20 text-center text-gray-600">No active assets detected in this sector.</td></tr>
                            ) : (
                                resources.map(resource => (
                                    <tr key={resource._id} className="hover:bg-white/[0.03] transition-all group">
                                        <td className="p-6">
                                            <div className="max-w-md">
                                                <div className="font-black text-white text-[15px] mb-1 group-hover:text-emerald-400 transition-colors">{resource.title}</div>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider line-clamp-2 leading-relaxed">
                                                    {resource.description}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-emerald-500/30 transition-all">
                                                    {getIcon(resource.type)}
                                                </div>
                                                <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">{resource.type}</span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <a
                                                href={resource.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-emerald-500 hover:text-emerald-400 font-black text-[10px] uppercase tracking-widest group/link transition-all"
                                            >
                                                <LinkIcon size={12} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                                                Initialize
                                            </a>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                                                    {resource.addedBy ? resource.addedBy.name : 'System Core'}
                                                </span>
                                                <span className="text-[9px] text-gray-600 font-bold uppercase">Authority Module</span>
                                            </div>
                                        </td>
                                        <td className="p-6 text-center">
                                            <button
                                                onClick={() => handleDeleteResource(resource._id)}
                                                className="p-3 rounded-2xl text-rose-500/70 hover:text-white hover:bg-rose-500/20 hover:shadow-[0_0_15px_rgba(244,63,94,0.3)] transition-all duration-300"
                                                title="Decommission Asset"
                                            >
                                                <Trash2 size={18} />
                                            </button>
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

export default AdminContent;
