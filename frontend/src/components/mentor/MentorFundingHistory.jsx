import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Calendar, ArrowUpRight } from 'lucide-react';

const MentorFundingHistory = ({ history = [], totalInvested = 0 }) => {

    // Helper to format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Helper to format date
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    return (
        <div className="cinematic-glass rounded-[2rem] p-8 shadow-2xl border border-white/5 relative overflow-hidden group h-full">
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/10 transition-all duration-700" />

            <div className="flex items-center justify-between mb-8 relative z-10">
                <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                        <DollarSign size={20} />
                    </div>
                    Funding History
                </h3>
                {history.length > 0 && (
                    <button className="text-sm font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-2 group/link">
                        View All
                        <ArrowUpRight size={14} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                    </button>
                )}
            </div>

            <div className="space-y-4 relative z-10 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {history.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 italic">
                        No funding history available yet.
                    </div>
                ) : (
                    history.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] transition-all border border-white/5 group/item">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-500/20 flex items-center justify-center text-white font-bold border border-white/10">
                                    {item.startup ? item.startup.charAt(0) : '?'}
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-sm group-hover/item:text-emerald-300 transition-colors">{item.startup}</h4>
                                    <div className="flex items-center gap-2 text-[10px] text-gray-400 uppercase tracking-wider font-bold mt-0.5">
                                        <span>{item.type}</span>
                                        <span className="w-1 h-1 rounded-full bg-gray-600" />
                                        <span className="flex items-center gap-1">
                                            <Calendar size={10} /> {formatDate(item.date)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-white text-base text-glow-emerald">{formatCurrency(item.amount)}</p>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${item.status === 'Completed' ? 'text-emerald-500' : 'text-amber-500'
                                    }`}>
                                    {item.status}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Total Invested */}
            <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-end relative z-10">
                <div>
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Invested</p>
                    <p className="text-3xl font-black text-white tracking-tight">{formatCurrency(totalInvested)}</p>
                </div>
                <div className="p-3 bg-white/5 rounded-xl text-emerald-400 animate-pulse-soft">
                    <TrendingUp size={24} />
                </div>
            </div>
        </div>
    );
};

export default MentorFundingHistory;
