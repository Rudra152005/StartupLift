import React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, BarChart, PieChart, TrendingUp, Info } from 'lucide-react';

const DashboardAnalytics = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Analytics & Insights</h2>
        <p className="text-[var(--text-secondary)]">Track your startup's growth and performance metrics.</p>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { label: "Profile Views", value: "1,248", change: "+12%", color: "text-emerald-500", bg: "bg-emerald-500/10" },
           { label: "Pitch Deck Downloads", value: "86", change: "+5%", color: "text-purple-500", bg: "bg-purple-500/10" },
           { label: "Mentor Interests", value: "14", change: "+2", color: "text-green-500", bg: "bg-green-500/10" },
         ].map((stat, i) => (
           <motion.div 
             key={i}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: i * 0.1 }}
             className="bg-[var(--bg-primary)]/50 border border-[var(--text-primary)]/10 backdrop-blur-xl rounded-2xl p-6 shadow-sm"
           >
             <div className="flex justify-between items-start">
               <div>
                 <p className="text-[var(--text-secondary)] text-sm font-medium mb-1">{stat.label}</p>
                 <h3 className="text-3xl font-bold text-[var(--text-primary)]">{stat.value}</h3>
               </div>
               <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                 <TrendingUp size={20} />
               </div>
             </div>
             <div className="mt-4 flex items-center gap-2">
               <span className={`${stat.color} text-xs font-bold px-2 py-0.5 rounded-full bg-white/5`}>{stat.change}</span>
               <span className="text-[var(--text-secondary)] text-xs">vs last month</span>
             </div>
           </motion.div>
         ))}
      </div>

      {/* Charts Section (Visual Mockups using CSS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Growth Chart */}
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.3 }}
           className="bg-[var(--bg-primary)]/50 border border-[var(--text-primary)]/10 backdrop-blur-xl rounded-2xl p-6 shadow-sm"
        >
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-bold text-[var(--text-primary)]">Growth Trajectory</h3>
             <select className="bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 text-[var(--text-primary)] text-sm rounded-lg px-2 py-1 outline-none">
               <option>Last 6 Months</option>
               <option>Last Year</option>
             </select>
          </div>
          
          {/* CSS Bar Chart Mock */}
          <div className="h-64 flex items-end justify-between gap-2 md:gap-4 px-2">
             {[40, 60, 45, 70, 65, 85, 95].map((h, i) => (
               <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                  <div className="relative w-full bg-[var(--color-primary)]/10 rounded-t-lg overflow-hidden h-full flex items-end">
                     <motion.div 
                       initial={{ height: 0 }}
                       animate={{ height: `${h}%` }}
                       transition={{ duration: 1, delay: i * 0.1 }}
                       className="w-full bg-[var(--color-primary)] opacity-60 group-hover:opacity-100 transition-opacity rounded-t-lg relative"
                     >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          {h}%
                        </div>
                     </motion.div>
                  </div>
                  <span className="text-xs text-[var(--text-secondary)]">M{i+1}</span>
               </div>
             ))}
          </div>
        </motion.div>

        {/* Readiness Score */}
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.4 }}
           className="bg-[var(--bg-primary)]/50 border border-[var(--text-primary)]/10 backdrop-blur-xl rounded-2xl p-6 shadow-sm"
        >
          <div className="flex justify-between items-center mb-6">
             <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Investor Readiness</h3>
                <Info size={16} className="text-[var(--text-secondary)]" />
             </div>
          </div>

          <div className="flex flex-col items-center justify-center py-6">
             <div className="relative w-48 h-48">
                {/* Background Ring */}
                <svg className="w-full h-full transform -rotate-90">
                   <circle
                     cx="96"
                     cy="96"
                     r="88"
                     stroke="currentColor"
                     strokeWidth="12"
                     fill="transparent"
                     className="text-[var(--text-primary)]/10"
                   />
                   <motion.circle
                     cx="96"
                     cy="96"
                     r="88"
                     stroke="url(#gradient)"
                     strokeWidth="12"
                     fill="transparent"
                     strokeDasharray="552"
                     strokeDashoffset="552"
                     strokeLinecap="round"
                     initial={{ strokeDashoffset: 552 }}
                     animate={{ strokeDashoffset: 552 - (552 * 0.72) }} // 72%
                     transition={{ duration: 2, ease: "easeOut" }}
                   />
                   <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="var(--color-primary)" />
                        <stop offset="100%" stopColor="var(--color-secondary)" />
                      </linearGradient>
                   </defs>
                </svg>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <span className="text-4xl font-bold text-[var(--text-primary)]">72%</span>
                   <span className="text-sm text-[var(--text-secondary)]">Solid MVP</span>
                </div>
             </div>
          </div>

          <div className="space-y-3 mt-4">
             <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Team Structure</span>
                <span className="text-green-500 font-medium">Excellent</span>
             </div>
             <div className="w-full h-2 bg-[var(--text-primary)]/10 rounded-full overflow-hidden">
                <div className="h-full w-[90%] bg-green-500 rounded-full" />
             </div>
             
             <div className="flex justify-between text-sm pt-2">
                <span className="text-[var(--text-secondary)]">Market Research</span>
                <span className="text-yellow-500 font-medium">Needs Work</span>
             </div>
             <div className="w-full h-2 bg-[var(--text-primary)]/10 rounded-full overflow-hidden">
                <div className="h-full w-[45%] bg-yellow-500 rounded-full" />
             </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default DashboardAnalytics;
