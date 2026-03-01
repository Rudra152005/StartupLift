// src/components/admin/Dashboard/RecentActivity.jsx
import React from 'react';

const RecentActivity = ({ activities = [] }) => {
  const getColor = (type) => {
    switch (type) {
      case 'success': return 'bg-emerald-500';
      case 'error': return 'bg-red-500';
      case 'purple': return 'bg-purple-500';
      case 'warning': return 'bg-amber-500';
      default: return 'bg-emerald-500'; // info
    }
  };

  return (
    <div className="group relative cinematic-glass p-8 rounded-[2.5rem] border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.3)] h-full overflow-hidden">
      <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all duration-700"></div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">Platform Activity</h3>
          <p className="text-[10px] sm:text-xs text-[var(--text-secondary)] mt-0.5">Real-time system events</p>
        </div>

      </div>

      <div className="relative pl-2">
        {activities.map((item, index) => {
          const colorClass = getColor(item.type);
          return (
            <div key={item.id} className="relative pl-8 pb-6 last:pb-0">
              {/* Vertical Line */}
              {index !== activities.length - 1 && (
                <div className="absolute left-[3px] top-4 bottom-0 w-[2px] bg-[var(--text-primary)]/10"></div>
              )}


              {/* Dot */}
              <div className={`absolute left-0 top-1.5 w-2 h-2 rounded-full ${colorClass} ring-4 ring-[#020617] z-10 shadow-[0_0_10px_currentColor]`}></div>


              {/* Content */}
              <div>
                <p className="text-[var(--text-primary)] text-sm font-medium leading-tight mb-1">{item.text}</p>
                <div className="flex items-center text-[10px] text-[var(--text-secondary)] font-medium uppercase tracking-wider">
                  <span>{item.time}</span>
                </div>
              </div>

            </div>
          );
        })}
        {activities.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 dark:text-gray-500 text-sm">No activity recorded today.</p>
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-[var(--text-primary)]/10">
        <button className="w-full text-[var(--color-primary)] hover:opacity-80 text-xs font-bold uppercase tracking-widest transition-colors py-2">
          View Audit Trail
        </button>
      </div>

    </div>
  );
};

export default RecentActivity;
