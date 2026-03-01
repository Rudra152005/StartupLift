import React from 'react';
import { Users, Briefcase, UserPlus, FileText } from 'lucide-react';
import axios from '../../../api/axiosInstance';
import StatsCard from './StatsCard';
import GrowthChart from './GrowthChart';
import RecentActivity from './RecentActivity';

const Dashboard = () => {
    const [data, setData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    const icons = [Users, Briefcase, UserPlus, FileText]; // Map based on index for now

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const res = await axios.get('/stats');
                if (res.data) {
                    setData(res.data);
                } else {
                    throw new Error('Invalid response format');
                }
            } catch (err) {
                console.error('Error fetching stats:', err);
                setError(err.response?.data?.message || err.message || 'Failed to fetch dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="p-8 mt-16 ml-64 min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 mt-16 ml-64 min-h-screen flex flex-col items-center justify-center">
                <div className="text-red-500 text-center mb-4">
                    <p className="text-lg font-bold mb-2">Error loading dashboard</p>
                    <p className="text-sm text-gray-400">{error}</p>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-400 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="p-8 mt-16 ml-64 min-h-screen flex items-center justify-center">
                <div className="text-gray-400 text-center">
                    <p className="text-lg font-bold mb-2">No data available</p>
                    <p className="text-sm">Please check back later</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 mt-16 ml-64 min-h-screen">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">Dashboard Overview</h1>
                <p className="text-gray-400">Welcome back, get a bird's eye view of your platform.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {data?.stats?.map((stat, index) => {
                    const Icon = icons[index] || Users;
                    return (
                        <StatsCard
                            key={index}
                            icon={Icon}
                            label={stat.label}
                            value={stat.value}
                            trend={stat.trend}
                            trendUp={stat.trendUp}
                            alert={stat.alert}
                        />
                    );
                })}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
                {/* Chart Section */}
                <div className="lg:col-span-2 h-full">
                    <GrowthChart data={data?.growth} />
                </div>

                {/* Activity Section */}
                <div className="lg:col-span-1 h-full">
                    <RecentActivity activities={data?.activities} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
