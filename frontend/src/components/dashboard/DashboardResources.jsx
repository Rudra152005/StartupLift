import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Download, PlayCircle, Book, Link, Video, File } from "lucide-react";
import axios from '../../api/axiosInstance';

const DashboardResources = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            const response = await axios.get("/resources");
            if (response.data.success) {
                setResources(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching resources:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold text-[var(--text-primary)]">Resources</h1>
                <p className="text-[var(--text-secondary)] mt-1">Tools and guides shared by your mentors.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {resources.map((item, i) => (
                        <motion.div
                            key={item._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="group relative cinematic-glass border border-white/10 rounded-[2.5rem] p-8 hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all duration-500 hover:-translate-y-1.5 overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all duration-700" />
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                                    {item.type === 'Video' ? <Video size={24} /> : item.type === 'Link' ? <Link size={24} /> : <FileText size={24} />}
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 line-clamp-1">{item.title}</h3>
                            <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2 min-h-[40px]">{item.description || "No description provided."}</p>

                            <div className="flex items-center justify-between pt-4 border-t border-[var(--text-primary)]/5">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                        {item.addedBy?.name?.charAt(0) || "M"}
                                    </div>
                                    <span className="text-xs text-[var(--text-secondary)]">{item.addedBy?.name || "Mentor"}</span>
                                </div>

                                <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-medium text-[var(--color-primary)] hover:underline flex items-center gap-1"
                                >
                                    Open <Link size={14} />
                                </a>
                            </div>
                        </motion.div>
                    ))}
                    {!loading && resources.length === 0 && (
                        <div className="col-span-full py-20 text-center">
                            <Book className="mx-auto h-12 w-12 text-[var(--text-secondary)]/50 mb-3" />
                            <h3 className="text-lg font-bold text-[var(--text-primary)]">No Resources Yet</h3>
                            <p className="text-[var(--text-secondary)]">Your mentors haven't shared any resources yet.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default DashboardResources;
