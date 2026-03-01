import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { Users, Video, Briefcase, TrendingUp } from 'lucide-react';

const AdminReports = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await axios.get('/admin/analytics');
            setData(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching analytics:', err);
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-gray-500 text-center">Loading analytics...</div>;
    if (!data) return <div className="p-8 text-red-500 bg-red-50 border border-red-100 rounded-xl text-center">Failed to load analytics data.</div>;

    // Process data for charts
    const userRoleData = data.userDistribution.map(item => ({
        name: item._id,
        value: item.count
    }));

    const sessionStatusData = data.sessionStatus.map(item => ({
        name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
        value: item.count
    }));

    const COLORS = ['#06b6d4', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="cinematic-glass p-3 border border-white/10 rounded-xl shadow-2xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">{label}</p>
                    <p className="text-sm font-black text-white">{payload[0].value} <span className="text-[10px] text-gray-500">Units</span></p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="px-2 sm:px-0">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">Intelligence <span className="text-emerald-500/80">Analytic</span></h1>
                <p className="text-sm sm:text-base text-gray-500 font-medium">Deconstruct activity patterns and ecosystem growth vectors via real-time telemetry.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 px-2 sm:px-0">
                <div className="cinematic-glass p-6 rounded-[2rem] border border-white/5 shadow-lg group hover:border-emerald-500/30 transition-all duration-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">User Groups</p>
                            <h3 className="text-3xl font-black text-white group-hover:text-emerald-400 transition-colors">{userRoleData.length}</h3>
                        </div>
                        <div className="p-3 bg-white/5 border border-white/10 rounded-2xl group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-all">
                            <Users className="text-emerald-500 w-5 h-5" />
                        </div>
                    </div>
                </div>
                <div className="cinematic-glass p-6 rounded-[2rem] border border-white/5 shadow-lg group hover:border-emerald-500/30 transition-all duration-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Active Sessions</p>
                            <h3 className="text-3xl font-black text-white group-hover:text-emerald-400 transition-colors">
                                {data.sessionStatus.find(s => s._id === 'scheduled')?.count || 0}
                            </h3>
                        </div>
                        <div className="p-3 bg-white/5 border border-white/10 rounded-2xl group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-all">
                            <Video className="text-emerald-500 w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-2 sm:px-0">

                {/* User Distribution Pie Chart */}
                <div className="cinematic-glass p-8 rounded-[2.5rem] border border-white/5 shadow-[0_25px_60px_rgba(0,0,0,0.4)]">
                    <div className="flex items-center gap-3 mb-8">
                        <TrendingUp size={20} className="text-emerald-500" />
                        <h3 className="text-base font-black text-white uppercase tracking-tight">Ecosystem <span className="text-emerald-500">Demographics</span></h3>
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={userRoleData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {userRoleData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    formatter={(value) => <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Session Status Bar Chart */}
                <div className="cinematic-glass p-8 rounded-[2.5rem] border border-white/5 shadow-[0_25px_60px_rgba(0,0,0,0.4)]">
                    <div className="flex items-center gap-3 mb-8">
                        <Briefcase size={20} className="text-emerald-500" />
                        <h3 className="text-base font-black text-white uppercase tracking-tight">Engagement <span className="text-emerald-500">Velocity</span></h3>
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sessionStatusData}>
                                <defs>
                                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.2} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#4b5563"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: '#4b5563', fontWeight: 'bold' }}
                                />
                                <YAxis
                                    stroke="#4b5563"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: '#4b5563', fontWeight: 'bold' }}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }} />
                                <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                                    {sessionStatusData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.name === 'Scheduled' ? 'url(#barGradient)' : COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Monthly User Growth Line Chart */}
                <div className="cinematic-glass p-8 rounded-[2.5rem] border border-white/5 shadow-[0_25px_60px_rgba(0,0,0,0.4)] col-span-1 lg:col-span-2">
                    <div className="flex items-center gap-3 mb-8">
                        <TrendingUp size={20} className="text-emerald-500" />
                        <h3 className="text-base font-black text-white uppercase tracking-tight">Trajectory <span className="text-emerald-500">Calibration</span></h3>
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={data.userGrowth.map(d => ({
                                    month: `Segment ${d._id}`,
                                    users: d.count
                                }))}
                            >
                                <defs>
                                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    stroke="#4b5563"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: '#4b5563', fontWeight: 'bold' }}
                                />
                                <YAxis
                                    stroke="#4b5563"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: '#4b5563', fontWeight: 'bold' }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Line
                                    type="monotone"
                                    dataKey="users"
                                    stroke="#10b981"
                                    strokeWidth={4}
                                    dot={{ fill: '#064e3b', stroke: '#10b981', strokeWidth: 2, r: 6 }}
                                    activeDot={{ r: 8, strokeWidth: 0, fill: '#10b981' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminReports;
