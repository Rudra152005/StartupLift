// src/components/admin/Dashboard/StatsCard.jsx
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatsCard = ({ icon: Icon, label, value, trend, trendUp, alert }) => {
    return (
        <div className="group relative h-full flex flex-col cinematic-glass p-8 rounded-[2.5rem] border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.5)] transition-all duration-500 hover:-translate-y-2 overflow-hidden">
            {/* Internal Glow */}
            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all duration-700" />

            <div className="flex justify-between items-start mb-auto pb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${alert
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]'
                    }`}>
                    <Icon size={24} className="group-hover:scale-110 transition-transform duration-500" />
                </div>

                {alert ? (
                    <span className="text-[10px] font-black text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 uppercase tracking-[0.2em] shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                        Action Required
                    </span>

                ) : (
                    <div className={`flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border ${trendUp
                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.1)]'
                        : 'text-rose-400 bg-rose-500/10 border-rose-500/20 shadow-[0_0_12px_rgba(244,63,94,0.1)]'
                        }`}>
                        {trendUp ? <TrendingUp size={12} className="mr-1.5" /> : <TrendingDown size={12} className="mr-1.5" />}
                        {trend}
                    </div>

                )}
            </div>

            <div>
                <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{label}</h3>
                <div className="text-3xl font-black text-white tracking-tighter group-hover:text-emerald-400 transition-colors duration-500">{value}</div>
            </div>
        </div>
    );
};

export default StatsCard;
