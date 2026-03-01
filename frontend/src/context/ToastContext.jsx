import React, { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = "info") => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto-dismiss
        setTimeout(() => {
            removeToast(id);
        }, 4000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const toast = {
        success: (msg) => addToast(msg, "success"),
        error: (msg) => addToast(msg, "error"),
        info: (msg) => addToast(msg, "info"),
        warning: (msg) => addToast(msg, "warning"),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            {/* Toast Container */}
            <div className="fixed top-5 right-5 z-[99999999] flex flex-col gap-3 pointer-events-none w-full max-w-sm px-4">
                <AnimatePresence>
                    {toasts.map((t) => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, y: -20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            layout
                            className={`
                pointer-events-auto flex items-center gap-3 p-4 rounded-xl shadow-2xl border backdrop-blur-md
                ${t.type === 'success' ? 'bg-[#F0FDF4]/90 border-green-500/20 text-green-800 dark:bg-green-900/90 dark:text-green-100' : ''}
                ${t.type === 'error' ? 'bg-[#FEF2F2]/90 border-red-500/20 text-red-800 dark:bg-red-900/90 dark:text-red-100' : ''}
                ${t.type === 'info' ? 'bg-[#F0F9FF]/90 border-emerald-500/20 text-emerald-800 dark:bg-emerald-900/90 dark:text-emerald-100' : ''}
                ${t.type === 'warning' ? 'bg-[#FEFCE8]/90 border-yellow-500/20 text-yellow-800 dark:bg-yellow-900/90 dark:text-yellow-100' : ''}
              `}
                        >
                            <div className="shrink-0">
                                {t.type === 'success' && <CheckCircle2 size={20} className="text-green-600 dark:text-green-400" />}
                                {t.type === 'error' && <AlertCircle size={20} className="text-red-600 dark:text-red-400" />}
                                {t.type === 'info' && <Info size={20} className="text-emerald-600 dark:text-emerald-400" />}
                                {t.type === 'warning' && <AlertCircle size={20} className="text-yellow-600 dark:text-yellow-400" />}
                            </div>
                            <p className="text-sm font-medium flex-1 leading-snug">{t.message}</p>
                            <button
                                onClick={() => removeToast(t.id)}
                                className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                            >
                                <X size={16} className="opacity-60" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
