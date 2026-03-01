// src/components/admin/Dashboard/GrowthChart.jsx
import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { ChevronDown } from 'lucide-react';

const GrowthChart = ({ data = [] }) => {
    // Fallback if data is empty to keep chart rendered
    const chartData = data.length > 0 ? data : [
        { name: 'Jan', value: 0 }, { name: 'Feb', value: 0 }
    ];

    return (
        <div className="group relative cinematic-glass p-8 rounded-[2.5rem] border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col h-full overflow-hidden">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all duration-1000"></div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">Active Users</h3>
                    <p className="text-[10px] sm:text-xs text-[var(--text-secondary)] mt-0.5">Monthly platform engagement</p>
                </div>

                <button className="flex items-center space-x-2 text-[10px] sm:text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--text-primary)]/5 px-3 py-1.5 rounded-lg border border-[var(--text-primary)]/10 transition-all">
                    <span>This Year</span>
                    <ChevronDown size={14} />
                </button>

            </div>

            <div className="flex-1 w-full min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} barSize={40}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(156, 163, 175, 0.1)" />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(5, 5, 5, 0.9)',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                color: '#fff',
                                fontSize: '12px',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                                backdropFilter: 'blur(8px)'
                            }}
                            itemStyle={{ color: 'var(--color-primary)' }}
                            cursor={{ fill: 'var(--color-primary)', fillOpacity: 0.05 }}
                        />

                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 500 }}
                            dy={10}
                        />

                        <Bar
                            dataKey="value"
                            radius={[6, 6, 0, 0]}
                            fill="var(--color-primary)"
                        >

                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fillOpacity={0.6 + (index / chartData.length) * 0.4}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default GrowthChart;
