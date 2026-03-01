import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    UserPlus,
    Calendar,
    Activity,
    Star,
    ArrowRight,
    Clock,
    Zap,
    Loader,
    TrendingUp,
    Award,
    BarChart,
    CheckCircle2,
    Video,
    X,
    Target,
    Plus,
    DollarSign
} from 'lucide-react';
import MentorFundingHistory from './MentorFundingHistory';
import axios from '../../api/axiosInstance';
import { toast } from 'react-toastify';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from 'recharts';

const MentorOverview = ({ user, setActiveTab }) => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const fundingRef = React.useRef(null);

    const scrollToFunding = () => {
        fundingRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Modal States
    const [isStartupsModalOpen, setIsStartupsModalOpen] = useState(false);

    const [isSessionsModalOpen, setIsSessionsModalOpen] = useState(false);

    // Detailed Data States
    const [activeStartupsList, setActiveStartupsList] = useState([]);
    const [activeMenteesList, setActiveMenteesList] = useState([]);
    const [pendingRequestsList, setPendingRequestsList] = useState([]);
    const [dataLoading, setDataLoading] = useState(false);
    const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);

    const analyticsData = [
        { month: 'Jan', impact: 3.2, hours: 12 },
        { month: 'Feb', impact: 3.5, hours: 15 },
        { month: 'Mar', impact: 4.1, hours: 22 },
        { month: 'Apr', impact: 4.3, hours: 18 },
        { month: 'May', impact: 4.5, hours: 28 },
        { month: 'Jun', impact: 4.8, hours: 25 },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/mentors/overview');
                if (response.data.success) {
                    setDashboardData(response.data.data);
                }
            } catch (error) {
                console.error("Error loading dashboard:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const fetchStartups = async () => {
        setDataLoading(true);
        try {
            const res = await axios.get('/mentors/my-startups');
            if (res.data.success) setActiveStartupsList(res.data.data);
        } catch (e) {
            console.error("Error fetching startups", e);
            toast.error("Failed to load startups");
        } finally {
            setDataLoading(false);
        }
    };

    const fetchMentees = async () => {
        // Fetch accepted mentorship requests to get "Active Mentees"
        setDataLoading(true);
        try {
            const res = await axios.get('/mentors/my-requests?status=all');
            if (res.data.success) {
                const mentees = res.data.data.filter(req => req.status === 'accepted' && req.founderId);
                setActiveMenteesList(mentees);
            }
        } catch (e) {
            console.error("Error fetching mentees", e);
        } finally {
            setDataLoading(false);
        }
    };

    const fetchRequests = async () => {
        setDataLoading(true);
        try {
            const res = await axios.get('/mentors/my-requests?status=pending');
            if (res.data.success) setPendingRequestsList(res.data.data);
        } catch (e) {
            console.error("Error fetching requests", e);
            toast.error("Failed to load requests");
        } finally {
            setDataLoading(false);
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader className="animate-spin text-[var(--color-primary)]" size={32} />
            </div>
        );
    }

    const { stats = {}, sessions: upcomingSessions = [], activity: recentActivity = [], fundingHistory = [] } = dashboardData || {};
    const {
        activeStartups: activeMentees = 0,
        pendingRequests = 0,
        sessionsToday = 0,
        totalSessions = 0,
        impactScore = "0.0",
        totalInvested = 0
    } = stats;

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8 relative"
        >
            {/* 1. Welcome Banner (Aligned with User Dashboard) */}
            <motion.div
                variants={item}
                className="relative overflow-hidden rounded-[2.5rem] cinematic-glass p-8 sm:p-10 text-white shadow-2xl border border-white/10 group"
            >
                {/* Immersive Background Gradients */}
                <div className="absolute top-0 right-0 w-[500px] h-full bg-emerald-600/10 blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-600/20 transition-all duration-1000" />
                <div className="absolute bottom-0 left-0 w-[400px] h-full bg-emerald-600/10 blur-[120px] translate-y-1/2 -translate-x-1/2 group-hover:bg-emerald-600/20 transition-all duration-1000" />

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                        <div>
                            <div className="flex items-center gap-5 mb-4">
                                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                                    Welcome back, <span className="bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent text-glow-emerald">{(user?.name || 'Mentor').split(' ')[0]}!</span>
                                </h1>
                                <div className="p-3 bg-white/5 rounded-2xl backdrop-blur-xl border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)] animate-float-cinematic">
                                    <TrendingUp size={32} className="text-emerald-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]" />
                                </div>
                            </div>
                            <p className="text-gray-300/90 text-lg sm:text-xl max-w-xl leading-relaxed">
                                You have <span className="text-white font-bold text-glow-emerald">{pendingRequests} pending requests</span> and <span className="text-white font-bold text-glow-emerald">{sessionsToday} sessions</span> lined up for today.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-4 w-full sm:w-auto">
                            <button
                                onClick={scrollToFunding}
                                className="flex-1 sm:flex-none justify-center bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-6 py-3.5 rounded-2xl font-bold transition-all duration-500 shadow-lg flex items-center gap-3 text-base cursor-pointer hover:scale-[1.05] border border-emerald-500/20 hover:border-emerald-500/40"
                            >
                                <DollarSign size={20} />
                                <span>Funding History</span>
                            </button>
                            <button
                                onClick={() => setIsAnalyticsModalOpen(true)}
                                className="flex-1 sm:flex-none justify-center bg-white/5 hover:bg-white/10 text-white px-6 py-3.5 rounded-2xl font-bold transition-all duration-500 shadow-lg flex items-center gap-3 text-base cursor-pointer hover:scale-[1.05] active:scale-95 border border-white/10 hover:border-emerald-500/30 group/btn"
                            >
                                <Activity size={20} className="text-emerald-400 group-hover/btn:scale-110 transition-transform" />
                                <span className="group-hover/btn:text-glow-emerald transition-all">Analytics</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('profile')}
                                className="flex-1 sm:flex-none justify-center bg-emerald-500 text-white px-6 py-3.5 rounded-2xl font-bold hover:bg-emerald-400 transition-all duration-500 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] flex items-center gap-3 text-base cursor-pointer hover:scale-[1.05] active:scale-95"
                            >
                                <Users size={20} fill="white" className="opacity-90" />
                                <span>My Profile</span>
                            </button>
                        </div>
                    </div>

                    {/* Progress Bar Cinematic */}
                    <div className="mt-12 group/progress cursor-help">
                        <div className="flex justify-between items-end mb-3">
                            <span className="text-xs font-black text-emerald-500/80 uppercase tracking-[0.2em] group-hover/progress:text-emerald-400 transition-colors">Impact Score Status</span>
                            <span className="text-lg font-black text-white text-glow-emerald">{(parseFloat(impactScore) * 20).toFixed(0)}% <span className="text-xs text-gray-500 font-normal">/ 100</span></span>
                        </div>
                        <div className="bg-white/5 rounded-full h-4 max-w-2xl border border-white/5 p-1 ring-1 ring-white/5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(parseFloat(impactScore) * 20, 100)}%` }}
                                transition={{ duration: 2, ease: "circOut" }}
                                className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full shadow-[0_0_20px_rgba(6,182,212,0.5)] relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] animate-shimmer-slow translate-x-[-100%]" />
                            </motion.div>
                        </div>
                        <div className="flex justify-between items-center mt-3 text-[10px] sm:text-xs">
                            <div className="flex flex-col gap-1">
                                <span className="text-gray-500 font-bold uppercase tracking-widest">Growth Level</span>
                                <span className="text-white font-bold uppercase tracking-widest text-[9px] opacity-40">Rising Talent</span>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <div className="flex items-center gap-2">
                                    <Star size={12} className="text-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                                    <span className="text-white font-bold uppercase tracking-widest text-glow-amber">Elite Mentor Class</span>
                                </div>
                                <span className="text-gray-500 font-bold uppercase tracking-widest text-[9px]">Top 5% of Mentors</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* 2. Stats Grid (Cinematic Glass) */}
            <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Active Mentees */}
                <div
                    onClick={() => { fetchStartups(); fetchMentees(); setIsStartupsModalOpen(true); }}
                    className="relative overflow-hidden cinematic-glass p-7 rounded-[2rem] group cursor-pointer hover:scale-[1.02] transition-all duration-500 border border-white/5 hover:border-emerald-500/20"
                >
                    <div className="absolute top-0 right-0 -mr-4 -mt-4 w-28 h-28 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all duration-700" />

                    <div className="flex justify-between items-start mb-8 relative z-10">
                        <div className="p-4 rounded-2xl bg-white/5 text-emerald-400 border border-white/5 group-hover:bg-emerald-500/10 group-hover:text-emerald-300 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all duration-500">
                            <Users size={28} />
                        </div>
                        {activeMentees > 0 && (
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300">Tracking</span>
                            </div>
                        )}
                    </div>

                    <div className="relative z-10">
                        <p className={`text-5xl font-black tracking-tight mb-2 ${activeMentees === 0 ? 'text-white/20' : 'text-white text-glow-emerald'}`}>{activeMentees}</p>
                        <div className="text-gray-500 font-black text-[10px] uppercase tracking-[0.2em]">Active Members</div>
                    </div>
                </div>

                {/* Pending Requests */}
                <div
                    onClick={() => setActiveTab('requests')}
                    className="relative overflow-hidden cinematic-glass p-7 rounded-[2rem] group cursor-pointer hover:scale-[1.02] transition-all duration-500 border border-white/5 hover:border-purple-500/20"
                >
                    <div className="absolute top-0 right-0 -mr-4 -mt-4 w-28 h-28 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-all duration-700" />

                    <div className="flex justify-between items-start mb-8 relative z-10">
                        <div className="p-4 rounded-2xl bg-white/5 text-purple-400 border border-white/5 group-hover:bg-purple-500/10 group-hover:text-purple-300 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] transition-all duration-500">
                            <UserPlus size={28} />
                        </div>
                        {pendingRequests > 0 && (
                            <div className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 animate-pulse text-purple-300 text-[9px] font-black uppercase tracking-widest">
                                Immediate
                            </div>
                        )}
                    </div>

                    <div className="relative z-10">
                        <p className={`text-5xl font-black tracking-tight mb-2 ${pendingRequests === 0 ? 'text-white/20 text-glow-purple' : 'text-white text-glow-purple'}`}>{pendingRequests}</p>
                        <div className="text-gray-500 font-black text-[10px] uppercase tracking-[0.2em]">Pending Requests</div>
                    </div>
                </div>

                {/* Sessions Delivered */}
                <div
                    onClick={() => setActiveTab('sessions')}
                    className="relative overflow-hidden cinematic-glass p-7 rounded-[2rem] group cursor-pointer hover:scale-[1.02] transition-all duration-500 border border-white/5 hover:border-emerald-500/20"
                >
                    <div className="absolute top-0 right-0 -mr-4 -mt-4 w-28 h-28 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all duration-700" />

                    <div className="flex justify-between items-start mb-8 relative z-10">
                        <div className="p-4 rounded-2xl bg-white/5 text-emerald-400 border border-white/5 group-hover:bg-emerald-500/10 group-hover:text-emerald-300 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all duration-500">
                            <CheckCircle2 size={28} />
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            <Zap size={12} className="text-emerald-400" />
                            <span className="text-[10px] font-black tracking-widest uppercase text-emerald-300">Deliveries</span>
                        </div>
                    </div>

                    <div className="relative z-10">
                        <p className={`text-5xl font-black tracking-tight mb-2 ${totalSessions === 0 ? 'text-white/20' : 'text-white text-glow-emerald'}`}>{totalSessions}</p>
                        <div className="text-gray-500 font-black text-[10px] uppercase tracking-[0.2em]">Sessions Delivered</div>
                    </div>
                </div>

                {/* Impact Score */}
                <div className="relative overflow-hidden cinematic-glass p-7 rounded-[2rem] group cursor-pointer hover:scale-[1.02] transition-all duration-500 border border-white/5 hover:border-amber-500/20">
                    <div className="absolute top-0 right-0 -mr-4 -mt-4 w-28 h-28 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-all duration-700" />

                    <div className="flex justify-between items-start mb-8 relative z-10">
                        <div className="p-4 rounded-2xl bg-white/5 text-amber-400 border border-white/5 group-hover:bg-amber-500/10 group-hover:text-amber-300 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all duration-500">
                            <Star size={28} />
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                            <Award size={12} className="text-amber-400" />
                            <span className="text-[10px] font-black tracking-widest uppercase text-amber-300">Prestige</span>
                        </div>
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-baseline gap-2 mb-2">
                            <p className="text-5xl font-black text-white tracking-tight text-glow-amber">{impactScore}</p>
                            <span className="text-gray-600 font-black text-lg">/ 5.0</span>
                        </div>
                        <div className="text-gray-500 font-black text-[10px] uppercase tracking-[0.2em]">Impact Score</div>
                    </div>
                </div>
            </motion.div>

            {/* 3. Main Content Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Schedule (Wider) */}
                {/* Left Column: Schedule (Wider) */}
                <motion.div variants={item} className="lg:col-span-2 cinematic-glass rounded-[2rem] p-8 shadow-2xl border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
                            <Calendar size={22} className="text-emerald-400" />
                            Upcoming Schedule
                        </h3>
                        {upcomingSessions.length > 0 && (
                            <button onClick={() => setActiveTab('sessions-calendar')} className="text-sm font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-2 group/link">
                                View Calendar
                                <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                            </button>
                        )}
                    </div>

                    <div className="space-y-5">
                        {upcomingSessions.length > 0 ? (
                            upcomingSessions.map((session, i) => (
                                <div key={session.id || i} className="flex items-center gap-5 p-5 rounded-[1.5rem] bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-300 cursor-pointer border border-white/5 active:scale-[0.98] group/item">
                                    <div className="flex-shrink-0 w-16 h-16 bg-emerald-500/10 rounded-2xl flex flex-col items-center justify-center text-emerald-400 border border-emerald-500/20 group-hover/item:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all">
                                        <span className="text-[10px] font-black uppercase tracking-tighter opacity-70">{session.time?.split(' ')[1] || 'AM'}</span>
                                        <span className="text-lg font-black leading-none">{session.time?.split(' ')[0] || '00:00'}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-white text-lg group-hover/item:text-emerald-300 transition-colors">{session.topic || "Mentorship Session"}</h4>
                                        <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(6,182,212,0.5)]" />
                                            with {session.name || "Unknown"}
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); window.open(session.meetingLink || `/sessions/${session.id}`, '_blank'); }}
                                        className="p-3 bg-white/5 rounded-xl text-gray-400 hover:bg-emerald-500/10 hover:text-emerald-400 transition-all border border-white/5"
                                        disabled={!session.meetingLink}
                                        title={session.meetingLink ? "Join Meeting" : "No meeting link"}
                                    >
                                        <Video size={18} />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 bg-white/[0.02] rounded-[1.5rem] border border-white/5 border-dashed">
                                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
                                    <Clock size={24} />
                                </div>
                                <h4 className="text-white font-bold mb-1">No Upcoming Sessions</h4>
                                <p className="text-gray-500 text-sm">You're clear for the rest of the day.</p>
                                <button onClick={() => setActiveTab('sessions')} className="mt-4 text-emerald-400 text-xs font-bold uppercase tracking-widest hover:text-emerald-300">Schedule Session</button>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Right Column: Priority Tasks / Activity (Narrower) */}
                {/* Right Column: Assigned Tasks (Narrower) */}
                <motion.div variants={item} className="cinematic-glass rounded-[2rem] p-8 shadow-2xl border border-white/5 h-fit relative overflow-hidden">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
                            <Target size={22} className="text-amber-500" />
                            Assigned Tasks
                        </h3>
                        <button onClick={() => setActiveTab('tasks')} className="p-2 hover:bg-white/5 rounded-xl transition-all border border-white/5 text-gray-500 hover:text-white">
                            <Plus size={18} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {dashboardData?.tasks && dashboardData.tasks.length > 0 ? (
                            dashboardData.tasks.map((task, i) => {
                                // Determine styling based on STATUS
                                let statusColor = "text-gray-400";
                                let dotClass = "bg-gray-400";
                                let borderColor = "border-white/10";

                                switch (task.status) {
                                    case 'completed':
                                        statusColor = "text-emerald-400";
                                        dotClass = "bg-emerald-400";
                                        borderColor = "border-emerald-500/30";
                                        break;
                                    case 'in-progress':
                                        statusColor = "text-emerald-400";
                                        dotClass = "bg-emerald-400";
                                        borderColor = "border-emerald-500/30";
                                        break;
                                    case 'pending':
                                        statusColor = "text-amber-400";
                                        dotClass = "bg-amber-400";
                                        borderColor = "border-amber-500/30";
                                        break;
                                    default:
                                        statusColor = "text-gray-400";
                                        dotClass = "bg-gray-400";
                                }

                                return (
                                    <div key={task.id || i} className={`flex items-center gap-4 group cursor-pointer p-4 rounded-2xl bg-white/[0.01] hover:bg-white/[0.03] transition-all border ${borderColor} active:scale-[0.97]`} onClick={() => setActiveTab('tasks')}>
                                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 overflow-hidden">
                                            {task.assignedToAvatar ? (
                                                <img src={task.assignedToAvatar} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="font-bold text-sm text-gray-400">{task.assignedToName?.[0] || 'U'}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="text-sm font-bold text-white block group-hover:text-emerald-300 transition-colors truncate mb-1">{task.title}</span>
                                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                                <span>{task.assignedToName || "Unknown Mentee"}</span>
                                                <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                                                <span className={statusColor}>{task.status}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-10 bg-white/[0.02] rounded-[1.5rem] border border-white/5 border-dashed">
                                <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-500">
                                    <Target size={20} />
                                </div>
                                <h4 className="text-white font-bold text-sm mb-1">No Active Tasks</h4>
                                <p className="text-gray-500 text-xs">Assign items to track progress.</p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => setActiveTab('tasks')}
                        className="w-full mt-10 py-3.5 rounded-2xl bg-white/5 text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-white/[0.08] transition-all border border-white/10 hover:border-emerald-500/30"
                    >
                        Manage & Assign Tasks
                    </button>
                </motion.div>

                {/* New Column: Funding History */}
                <motion.div variants={item} className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-3" ref={fundingRef}>
                        <MentorFundingHistory history={fundingHistory} totalInvested={totalInvested} />
                    </div>
                </motion.div>

            </div >

            {/* --- Modals (Styled for Theme) --- */}

            {
                isStartupsModalOpen && createPortal(
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md"
                        onClick={() => setIsStartupsModalOpen(false)}
                    >
                        <div className="h-full flex items-start justify-center pt-28 pb-8 px-4 overflow-y-auto">
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-[#0f1115] border border-white/10 w-full max-w-2xl rounded-[2.5rem] p-8 shadow-2xl relative max-h-[calc(100vh-8rem)] overflow-y-auto overflow-x-hidden mt-4"
                            >
                                {/* Decorative Background */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 blur-[100px] -translate-y-1/2 translate-x-1/2" />

                                <button onClick={() => setIsStartupsModalOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all ring-1 ring-white/5">
                                    <X size={20} />
                                </button>

                                <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-4 tracking-tight">
                                    <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400">
                                        <Users size={24} />
                                    </div>
                                    Active Members
                                </h2>

                                <div className="border-b border-white/10 mb-6 pb-4">
                                    <p className="text-gray-400 text-sm">Manage your connection with Startups and Individual Mentees.</p>
                                </div>

                                {/* Combined List of Startups & Mentees */}
                                <div className="space-y-8">
                                    {/* 1. Startups Section */}
                                    <div>
                                        <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                            <Zap size={14} className="text-emerald-500" /> Startups
                                        </h3>
                                        {activeStartupsList.length > 0 ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {activeStartupsList.map((startup, i) => (
                                                    <div key={i} className="flex flex-col p-5 bg-white/[0.02] rounded-[1.5rem] border border-white/5 hover:border-emerald-500/30 transition-all group relative overflow-hidden" onClick={() => { setActiveTab('startups'); setIsStartupsModalOpen(false); }}>
                                                        <div className="flex items-center gap-4 mb-4">
                                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-black text-lg shadow-lg">
                                                                {startup.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-white text-base tracking-tight">{startup.name}</h4>
                                                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{startup.industry || "Tech"}</p>
                                                            </div>
                                                        </div>
                                                        <button className="w-full py-2.5 rounded-xl bg-white/5 text-gray-400 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all border border-white/5 group-hover:border-emerald-500/50">View Startup</button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-sm italic">No active startups linked.</p>
                                        )}
                                    </div>

                                    {/* 2. Mentees Section */}
                                    <div>
                                        <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                            <Users size={14} className="text-purple-500" /> Mentees
                                        </h3>
                                        {activeMenteesList.length > 0 ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {activeMenteesList.map((mentee, i) => (
                                                    <div key={i} className="flex flex-col p-5 bg-white/[0.02] rounded-[1.5rem] border border-white/5 hover:border-purple-500/30 transition-all group relative overflow-hidden" onClick={() => { setActiveTab('mentees'); setIsStartupsModalOpen(false); }}>
                                                        <div className="flex items-center gap-4 mb-4">
                                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-black text-lg shadow-lg">
                                                                {mentee.founderId?.name?.charAt(0) || "M"}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-white text-base tracking-tight">{mentee.founderId?.name || "Mentee"}</h4>
                                                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{mentee.founderId?.role || "Founder"}</p>
                                                            </div>
                                                        </div>
                                                        <button className="w-full py-2.5 rounded-xl bg-white/5 text-gray-400 text-[10px] font-black uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-all border border-white/5 group-hover:border-purple-500/50">View Mentee</button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-sm italic">No active mentees.</p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>,
                    document.body
                )
            }



            {/* 3. Analytics Modal */}
            <AnimatePresence>
                {isAnalyticsModalOpen && createPortal(
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsAnalyticsModalOpen(false)}
                    >
                        <div className="h-full flex items-start justify-center pt-28 pb-8 px-4 overflow-y-auto">
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-[#0f1115] border border-white/10 w-full max-w-4xl rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden max-h-[calc(100vh-8rem)] overflow-y-auto mt-4"
                            >
                                {/* Decorative Background Gradients */}
                                <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-600/10 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2" />
                                <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-600/10 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2" />

                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-10">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-emerald-500/10 rounded-xl">
                                                    <BarChart className="text-emerald-500" size={20} />
                                                </div>
                                                <h2 className="text-2xl font-bold text-white tracking-tight">Impact Analytics</h2>
                                            </div>
                                            <p className="text-gray-400 text-sm">Real-time performance metrics and mentorship reach</p>
                                        </div>
                                        <button
                                            onClick={() => setIsAnalyticsModalOpen(false)}
                                            className="p-2.5 hover:bg-white/5 rounded-2xl text-gray-400 hover:text-white transition-all cursor-pointer ring-1 ring-white/5"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                        {[
                                            { label: "Avg. Impact", value: "4.8", change: "+12%", color: "text-emerald-500" },
                                            { label: "Total Hours", value: "148.5", change: "+5.2h", color: "text-emerald-500" },
                                            { label: "Mentees Reached", value: "24", change: "+3 recently", color: "text-purple-500" }
                                        ].map((stat, i) => (
                                            <div key={i} className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
                                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">{stat.label}</p>
                                                <div className="flex items-baseline gap-2">
                                                    <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
                                                    <span className={`text-[10px] font-bold ${stat.color} bg-${stat.color.split('-')[1]}-500/10 px-1.5 py-0.5 rounded-full`}>
                                                        {stat.change}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="h-[300px] w-full bg-white/[0.01] border border-white/5 rounded-3xl p-6">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={analyticsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorImpact" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                    </linearGradient>
                                                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                                <XAxis
                                                    dataKey="month"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                                                    dy={10}
                                                />
                                                <YAxis
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: '#121214',
                                                        borderColor: 'rgba(255,255,255,0.1)',
                                                        borderRadius: '16px',
                                                        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                                                        color: '#fff'
                                                    }}
                                                    itemStyle={{ color: '#fff' }}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="impact"
                                                    stroke="#3b82f6"
                                                    strokeWidth={3}
                                                    fillOpacity={1}
                                                    fill="url(#colorImpact)"
                                                    name="Impact Score"
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="hours"
                                                    stroke="#8b5cf6"
                                                    strokeWidth={3}
                                                    fillOpacity={1}
                                                    fill="url(#colorHours)"
                                                    name="Mentorship Hours"
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>,
                    document.body
                )}
            </AnimatePresence>

        </motion.div >
    );
};

export default MentorOverview;
