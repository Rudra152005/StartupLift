import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  Users,
  CheckCircle,
  Calendar,
  ArrowRight,
  Target,
  Zap,
  Loader,
  Briefcase,
  DollarSign,
  MessageSquare
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import axios from '../../api/axiosInstance';
import CalendarModal from './CalendarModal';
import BankDetailsModal from './BankDetailsModal';
import { toast } from 'react-toastify';

const DashboardOverview = ({ user, setActiveTab }) => {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isBankDetailsOpen, setIsBankDetailsOpen] = useState(false);
  const [isStartupModalOpen, setIsStartupModalOpen] = useState(false);
  const [isFundingModalOpen, setIsFundingModalOpen] = useState(false);
  const [isMentorsModalOpen, setIsMentorsModalOpen] = useState(false);
  const [mentorTab, setMentorTab] = useState('active'); // 'active' or 'pending'
  const [selectedSession, setSelectedSession] = useState(null); // For detailed session view

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('/dashboard/overview');
        setData(response.data.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const handleJoinSession = async (session) => {
    if (session.meetingLink) {
      try {
        await axios.put(`/sessions/${session.id}/join`, {});
      } catch (err) {
        console.error("Tracking error:", err);
      }
      window.open(session.meetingLink, '_blank', 'noopener,noreferrer');
    } else {
      toast.info("No meeting link available for this session.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin text-[var(--color-primary)]" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-500">
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 text-[var(--color-primary)] underline">Try Again</button>
      </div>
    );
  }

  const { stats, upcomingSchedule, priorityTasks, startup } = data || {};

  const iconMap = {
    "TrendingUp": TrendingUp,
    "Users": Users,
    "CheckCircle": CheckCircle,
    "Calendar": Calendar,
    "Briefcase": Briefcase,
    "DollarSign": DollarSign
  };

  const handleSessionClick = (session) => {
    setSelectedSession(session);
    setIsCalendarOpen(false);
  };



  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 relative"
    >
      {/* ... previous content ... */}

      {/* ... keeping everything else, just inserting the function before return and updating the modal below ... */}
      {/* Actually I cannot insert before return easily with a small range. Let me try inserting handleSessionClick separately first. */}
      {/* 1. Welcome Banner (Cinematic Glass) */}
      <motion.div
        variants={item}
        className="relative overflow-hidden rounded-[2.5rem] cinematic-glass p-8 sm:p-10 text-[var(--text-primary)] shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-[var(--glass-border)] group"
      >
        {/* Immersive Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-full bg-emerald-600/10 blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-600/20 transition-all duration-1000" />
        <div className="absolute bottom-0 left-0 w-[400px] h-full bg-emerald-600/10 blur-[120px] translate-y-1/2 -translate-x-1/2 group-hover:bg-emerald-600/20 transition-all duration-1000" />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
                {t('welcome')}, <span className="bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent text-glow-emerald">{user?.name?.split(' ')[0] || "Founder"}!</span> <TrendingUp className="inline-block text-emerald-400" size={28} />
              </h1>
              <p className="text-[var(--text-secondary)] text-lg sm:text-xl max-w-xl leading-relaxed">
                {t('your_startup')} <button onClick={() => setIsStartupModalOpen(true)} className="font-bold text-[var(--text-primary)] hover:text-emerald-400 underline underline-offset-8 decoration-emerald-500/30 transition-all">{startup?.name || "Your Startup"}</button> is in the <span className="text-[var(--text-primary)] font-black uppercase tracking-widest text-[14px] bg-[var(--text-primary)]/5 px-3 py-1 rounded-lg border border-[var(--text-primary)]/10">{startup?.stage || "Idea Phase"}</span>.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 w-full sm:w-auto">
              <button
                onClick={() => setIsBankDetailsOpen(true)}
                className="flex-1 sm:flex-none justify-center bg-[var(--text-primary)]/5 hover:bg-[var(--text-primary)]/10 text-[var(--text-primary)] px-6 py-3.5 rounded-2xl font-bold transition-all duration-500 shadow-lg flex items-center gap-3 text-base border border-[var(--text-primary)]/10 hover:border-emerald-500/30 group/btn"
              >
                <Briefcase size={20} className="text-emerald-400 group-hover/btn:scale-110 transition-transform" />
                <span className="group-hover/btn:text-glow-emerald transition-all">{t('bank_details')}</span>
              </button>
              <button className="flex-1 sm:flex-none justify-center bg-emerald-500 text-white px-6 py-3.5 rounded-2xl font-bold hover:bg-emerald-400 transition-all duration-500 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] flex items-center gap-3 text-base hover:scale-[1.05] active:scale-95">
                <Zap size={20} fill="white" className="opacity-90" />
                <span>{t('boost_progress')}</span>
              </button>
            </div>
          </div>

          {/* Progress Bar Cinematic */}
          <div className="mt-12 group/progress cursor-pointer" onClick={() => setIsStartupModalOpen(true)}>
            <div className="flex justify-between items-end mb-3">
              <span className="text-xs font-black text-emerald-500/80 uppercase tracking-[0.2em] group-hover/progress:text-emerald-400 transition-colors">Startup Readiness</span>
              <span className="text-lg font-black text-[var(--text-primary)] text-glow-emerald">{startup?.progress || 0}% <span className="text-xs text-[var(--text-secondary)] font-normal">/ 100</span></span>
            </div>
            <div className="bg-[var(--text-primary)]/5 rounded-full h-4 max-w-2xl border border-[var(--text-primary)]/5 p-1 ring-1 ring-[var(--text-primary)]/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${startup?.progress || 0}%` }}
                transition={{ duration: 2, ease: "circOut" }}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full shadow-[0_0_20px_rgba(6,182,212,0.5)] relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] animate-shimmer-slow translate-x-[-100%]" />
              </motion.div>
            </div>
            <div className="flex justify-between max-w-2xl mt-4 text-[10px] sm:text-xs">
              <div className="flex flex-col gap-1">
                <span className="text-[var(--text-secondary)] font-bold uppercase tracking-widest">Initial Level</span>
                <span className="text-[var(--text-primary)] font-bold uppercase tracking-widest text-[9px] opacity-40">Idea Phase</span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[var(--text-primary)] font-bold uppercase tracking-widest text-glow-emerald">Growth Phase</span>
                <span className="text-[var(--text-secondary)] font-bold uppercase tracking-widest text-[9px]">Scaling Fast</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. Stats Grid (Cinematic Glass) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats?.map((stat, index) => {
          const IconComponent = iconMap[stat.icon] || TrendingUp;
          const isInteractive = ['Readiness Score', 'Funding Raised', 'Upcoming Sessions', 'Active Mentors'].includes(stat.title);

          return (
            <motion.div
              key={index}
              variants={item}
              whileHover={{ y: -5, scale: 1.01 }}
              onClick={() => {
                if (stat.title === "Readiness Score") setIsStartupModalOpen(true);
                if (stat.title === "Funding Raised") setIsFundingModalOpen(true);
                if (stat.title === "Upcoming Sessions") setIsCalendarOpen(true);
                if (stat.title === "Active Mentors") setIsMentorsModalOpen(true);
              }}
              className={`relative overflow-hidden cinematic-glass p-7 rounded-[2.5rem] group transition-all duration-500 border border-white/5 hover:border-emerald-500/20 shadow-[0_15px_35px_rgba(0,0,0,0.3)] ${isInteractive ? 'cursor-pointer' : ''}`}
            >
              <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all duration-700" />

              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="p-4 rounded-2xl bg-white/5 text-emerald-400 border border-white/5 group-hover:bg-emerald-500/10 group-hover:text-emerald-300 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all duration-500">
                  <IconComponent size={24} />
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300">{stat.change}</span>
                </div>
              </div>

              <div className="relative z-10">
                <p className="text-3xl font-black text-[var(--text-primary)] tracking-tight mb-2 text-glow-emerald">{stat.value}</p>
                <div className="text-[var(--text-secondary)] font-bold text-[10px] uppercase tracking-[0.2em]">{stat.title}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 3. Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Schedule (Cinematic Glass) */}
        <motion.div
          variants={item}
          className="lg:col-span-2 cinematic-glass rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-white/5 relative overflow-hidden group"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-3 text-glow-emerald">
              <Calendar size={22} className="text-emerald-400" />
              {t('upcoming_schedule')}
            </h3>
            <button
              onClick={() => setIsCalendarOpen(true)}
              className="text-xs font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-2 group/link"
            >
              {t('view_calendar')}
              <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="space-y-4">
            {upcomingSchedule?.length > 0 ? (
              upcomingSchedule.map((session) => (
                <div
                  key={session.id}
                  onClick={() => setSelectedSession(session)}
                  className="flex items-center gap-5 p-5 rounded-[1.5rem] bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-300 cursor-pointer border border-white/5 active:scale-[0.98] group/item"
                >
                  <div className="flex-shrink-0 w-14 h-14 bg-emerald-500/10 rounded-2xl flex flex-col items-center justify-center text-emerald-400 border border-emerald-500/20 group-hover/item:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all">
                    <span className="text-[10px] font-black uppercase tracking-tighter opacity-70">{new Date(session.date).toLocaleString('default', { month: 'short' })}</span>
                    <span className="text-xl font-black leading-none">{new Date(session.date).getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-[var(--text-primary)] text-base group-hover/item:text-emerald-300 transition-colors truncate">{session.title}</h4>
                    <p className="text-sm text-[var(--text-secondary)] flex items-center gap-2 mt-1 truncate">
                      <span className="w-1 h-1 rounded-full bg-[var(--text-secondary)]" />
                      with {session.mentorName} • {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {session.status === 'scheduled' ? (
                    <div className="p-3 bg-white/5 rounded-xl text-gray-400 group-hover/item:text-emerald-400 transition-all border border-white/5">
                      <ArrowRight size={18} />
                    </div>
                  ) : (
                    <span className={`px-3 py-1 text-[9px] font-black rounded-lg uppercase tracking-widest ${session.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                      {session.status === 'completed' ? 'Completed' : 'Expired'}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white/[0.01] rounded-3xl border border-dashed border-white/10">
                <Calendar size={48} className="mx-auto mb-4 text-gray-700 opacity-20" />
                <p className="text-gray-500 font-medium pb-1">No upcoming sessions.</p>
                <button className="text-emerald-400 text-xs font-black uppercase tracking-widest hover:text-emerald-300 transition-colors">Schedule one now!</button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Tasks Mini (Cinematic Glass) */}
        <motion.div
          variants={item}
          className="cinematic-glass rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-white/5 h-fit relative overflow-hidden group"
        >
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-3 text-glow-emerald">
              <Target size={22} className="text-amber-500" />
              {t('priority_tasks')}
            </h3>
            <button onClick={() => setActiveTab && setActiveTab('tracker')} className="p-2 hover:bg-white/5 rounded-xl transition-all border border-white/5 text-gray-500 hover:text-white">
              <Zap size={18} />
            </button>
          </div>

          <div className="space-y-4">
            {priorityTasks?.length > 0 ? (
              priorityTasks.map((task) => (
                <div key={task.id} onClick={() => setActiveTab && setActiveTab('tracker')} className="flex flex-col gap-2 group cursor-pointer p-4 rounded-2xl bg-white/[0.01] hover:bg-white/[0.03] transition-all border border-white/5 active:scale-[0.97]">
                  <div className="flex items-center gap-4">
                    <div className={`w-6 h-6 rounded-lg border-2 ${task.done ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'border-white/10 group-hover:border-emerald-500/50'} flex items-center justify-center transition-all`}>
                      {task.done && <CheckCircle size={14} className="text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm font-bold block truncate transition-colors ${task.done ? 'text-[var(--text-secondary)]' : 'text-[var(--text-primary)] group-hover:text-emerald-300'}`}>
                        {task.label}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        {task.done ? (
                          task.reviewedAt ? (
                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded">Reviewed</span>
                          ) : (
                            <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded">Waiting for Review</span>
                          )
                        ) : (
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${task.status === 'in-progress' ? 'text-emerald-400 bg-emerald-500/10' : 'text-gray-500 bg-white/5'}`}>
                            {task.status || 'Pending'}
                          </span>
                        )}
                        {task.dueDate && (
                          <span className="text-[9px] font-bold text-gray-600">• Due {new Date(task.dueDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {task.feedback && (
                    <div className="ml-10 p-3 bg-white/5 rounded-xl border border-white/5 text-xs text-gray-400">
                      <span className="block font-bold text-emerald-500 text-[10px] uppercase tracking-widest mb-1">Mentor Feedback</span>
                      "{task.feedback}"
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                  <CheckCircle size={24} className="text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                </div>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">All tasks completed! 🎉</p>
              </div>
            )}
          </div>

          <button
            onClick={() => setActiveTab && setActiveTab('tracker')}
            className="w-full mt-10 py-3.5 rounded-2xl bg-white/5 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/[0.08] transition-all border border-white/10 hover:border-emerald-500/30"
          >
            {t('access_milestone')}
          </button>
        </motion.div>
      </div>

      <AnimatePresence>
        {isCalendarOpen && (
          <CalendarModal
            isOpen={isCalendarOpen}
            onClose={() => setIsCalendarOpen(false)}
            sessions={upcomingSchedule}
            onSessionClick={handleSessionClick}
          />
        )}
      </AnimatePresence>

      <BankDetailsModal
        isOpen={isBankDetailsOpen}
        onClose={() => setIsBankDetailsOpen(false)}
        existingDetails={startup?.bankDetails}
        onSave={(newDetails) => { window.location.reload(); }}
      />

      {/* 1. MENTORS MODAL */}
      <AnimatePresence>
        {isMentorsModalOpen && (
          <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm" onClick={() => setIsMentorsModalOpen(false)}>
            <div className="h-full flex items-start justify-center pt-28 pb-8 px-4 overflow-y-auto">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 w-full max-w-2xl rounded-2xl p-6 sm:p-8 shadow-2xl relative max-h-[calc(100vh-8rem)] overflow-y-auto mt-4">
                <button onClick={() => setIsMentorsModalOpen(false)} className="absolute top-4 right-4 text-2xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">×</button>

                <div className="flex flex-wrap gap-4 sm:gap-6 mb-6">
                  <button onClick={() => setMentorTab('active')} className={`text-base sm:text-lg font-bold pb-2 border-b-2 transition-colors ${mentorTab === 'active' ? 'text-[var(--text-primary)] border-[var(--color-primary)]' : 'text-[var(--text-secondary)] border-transparent'}`}>
                    Active ({data?.activeMentors?.length || 0})
                  </button>
                  <button onClick={() => setMentorTab('pending')} className={`text-base sm:text-lg font-bold pb-2 border-b-2 transition-colors ${mentorTab === 'pending' ? 'text-[var(--text-primary)] border-[var(--color-primary)]' : 'text-[var(--text-secondary)] border-transparent'}`}>
                    Pending ({data?.pendingRequests?.length || 0})
                  </button>
                </div>

                {mentorTab === 'active' ? (
                  data?.activeMentors && data.activeMentors.length > 0 ? (
                    <div className="space-y-4">
                      {data.activeMentors.map((mentorship, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 bg-[var(--text-primary)]/5 rounded-xl border border-[var(--text-primary)]/10">
                          <img src={mentorship.mentor?.avatar || `https://ui-avatars.com/api/?name=${mentorship.mentor?.name}`} alt="Mentor" className="w-12 h-12 rounded-full object-cover" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-[var(--text-primary)] truncate">{mentorship.mentor?.name}</h4>
                            <p className="text-xs text-[var(--text-secondary)] truncate">{mentorship.mentor?.role || "Mentor"} • {mentorship.mentor?.category || "Expert"}</p>
                          </div>
                          <button
                            onClick={() => {
                              setIsMentorsModalOpen(false);
                              setActiveTab('messages');
                            }}
                            className="px-4 py-2 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary)]/20 transition-colors flex items-center gap-2 font-medium text-sm"
                          >
                            <MessageSquare size={16} /> Message
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-center text-[var(--text-secondary)] py-8">No active mentors yet.</p>
                ) : (
                  data?.pendingRequests && data.pendingRequests.length > 0 ? (
                    <div className="space-y-4">
                      {data.pendingRequests.map((req, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 bg-[var(--text-primary)]/5 rounded-xl border border-[var(--text-primary)]/10 opacity-80">
                          <img src={req.mentor?.avatar || `https://ui-avatars.com/api/?name=${req.mentor?.name}`} alt="Mentor" className="w-12 h-12 rounded-full object-cover grayscale" />
                          <div className="flex-1">
                            <h4 className="font-bold text-[var(--text-primary)]">{req.mentor?.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded uppercase font-bold">Pending</span>
                              <span className="text-xs text-[var(--text-secondary)]">{new Date(req.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-center text-[var(--text-secondary)] py-8">No pending requests.</p>
                )}
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. STARTUP DETAILS MODAL */}
      <AnimatePresence>
        {isStartupModalOpen && (
          <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm" onClick={() => setIsStartupModalOpen(false)}>
            <div className="h-full flex items-start justify-center pt-28 pb-8 px-4 overflow-y-auto">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 w-full max-w-3xl rounded-2xl p-6 sm:p-8 shadow-2xl relative max-h-[calc(100vh-8rem)] overflow-y-auto mt-4">
                <button onClick={() => setIsStartupModalOpen(false)} className="absolute top-4 right-4 text-2xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">×</button>
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 text-center sm:text-left">
                  <img src={startup?.image || "https://via.placeholder.com/100"} alt={startup?.name} className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover bg-gray-700" />
                  <div className="flex-1">
                    <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">{startup?.name}</h2>
                    <span className="inline-block text-xs bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-2 py-1 rounded-full font-bold uppercase mt-1">{startup?.stage}</span>
                    <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-3">{startup?.desc || "No description provided."}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-[var(--text-primary)]/5 rounded-xl">
                    <h4 className="font-bold text-[var(--text-primary)] mb-2 flex items-center gap-2"><Target size={16} /> Problem</h4>
                    <p className="text-sm text-[var(--text-secondary)]">{startup?.problem || "Problem statement not defined yet."}</p>
                  </div>
                  <div className="p-4 bg-[var(--text-primary)]/5 rounded-xl">
                    <h4 className="font-bold text-[var(--text-primary)] mb-2 flex items-center gap-2"><Zap size={16} /> Solution</h4>
                    <p className="text-sm text-[var(--text-secondary)]">{startup?.solution || "Solution not defined yet."}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-bold text-[var(--text-primary)] mb-3">Pitch Assets</h4>
                  <div className="flex flex-wrap gap-3">
                    {startup?.pitchDeck ? (
                      <a href={startup.pitchDeck} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20 transition-colors text-sm font-medium">
                        <Briefcase size={16} /> Pitch Deck
                      </a>
                    ) : <span className="text-sm text-[var(--text-secondary)] italic">No pitch deck uploaded.</span>}
                    {startup?.videoPitch ? (
                      <a href={startup.videoPitch} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-medium">
                        <TrendingUp size={16} /> Watch Pitch
                      </a>
                    ) : null}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. FUNDING MODAL */}
      <AnimatePresence>
        {isFundingModalOpen && (
          <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm" onClick={() => setIsFundingModalOpen(false)}>
            <div className="h-full flex items-start justify-center pt-28 pb-8 px-4 overflow-y-auto">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 w-full max-w-2xl rounded-2xl p-6 sm:p-8 shadow-2xl relative max-h-[calc(100vh-8rem)] overflow-y-auto mt-4">
                <button onClick={() => setIsFundingModalOpen(false)} className="absolute top-4 right-4 text-2xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">×</button>
                <h2 className="text-2xl font-bold mb-6 text-[var(--text-primary)] flex items-center gap-3"><DollarSign className="text-green-500" /> Funding History</h2>

                {(() => {
                  // Check legacy 'Funding Raised' stat if history is empty
                  const fundingStat = stats?.find(s => s.title === "Funding Raised")?.value || "₹0";
                  const fundingValue = parseFloat(fundingStat.replace(/[^0-9.]/g, '')) || 0;
                  const hasHistory = startup?.fundingHistory && startup.fundingHistory.length > 0;
                  const hasLegacyFunding = !hasHistory && fundingValue > 0;

                  if (hasHistory || hasLegacyFunding) {
                    return (
                      <div className="space-y-4">
                        {hasHistory ? (
                          startup.fundingHistory.map((fund, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-[var(--text-primary)]/5 rounded-xl border border-[var(--text-primary)]/10">
                              <div className="flex items-center gap-4">
                                <img src={fund.mentorId?.avatar || "https://ui-avatars.com/api/?name=Inv"} alt="Investor" className="w-10 h-10 rounded-full" />
                                <div>
                                  <h4 className="font-bold text-[var(--text-primary)]">{fund.mentorId?.name || "Unknown Investor"}</h4>
                                  <p className="text-xs text-[var(--text-secondary)]">{new Date(fund.date).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="block text-lg font-bold text-green-500">{fund.amount}</span>
                                <span className="text-xs text-[var(--text-secondary)]">Investment</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="flex items-center justify-between p-4 bg-[var(--text-primary)]/5 rounded-xl border border-[var(--text-primary)]/10">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 font-bold">
                                <DollarSign size={20} />
                              </div>
                              <div>
                                <h4 className="font-bold text-[var(--text-primary)]">Initial / External Funding</h4>
                                <p className="text-xs text-[var(--text-secondary)]">Previous Records</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="block text-lg font-bold text-green-500">{fundingStat}</span>
                              <span className="text-xs text-[var(--text-secondary)]">Verified</span>
                            </div>
                          </div>
                        )}

                        <div className="mt-4 pt-4 border-t border-[var(--text-primary)]/10 flex justify-between items-center bg-green-500/5 p-4 rounded-xl">
                          <span className="font-bold text-[var(--text-primary)]">Total Raised</span>
                          <span className="font-bold text-xl text-green-500">
                            {hasHistory
                              ? `₹${startup.fundingHistory.reduce((acc, curr) => acc + (parseFloat(curr.amount?.toString().replace(/[^0-9.]/g, '') || 0)), 0).toLocaleString()}`
                              : fundingStat
                            }
                          </span>
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-[var(--text-primary)]/5 rounded-full flex items-center justify-center mx-auto mb-4">
                          <DollarSign size={32} className="text-[var(--text-secondary)]" />
                        </div>
                        <h3 className="text-lg font-bold text-[var(--text-primary)]">No Funding Yet</h3>
                        <p className="text-[var(--text-secondary)] max-w-sm mx-auto mt-2">Connecting with mentors and pitching your idea is the best way to secure funding.</p>
                      </div>
                    );
                  }
                })()}
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. SESSION DETAILS MODAL */}
      {createPortal(
        <AnimatePresence>
          {selectedSession && (
            <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm" onClick={() => setSelectedSession(null)}>
              <div className="h-full flex items-start justify-center pt-28 pb-8 px-4 overflow-y-auto">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 w-full max-w-lg rounded-2xl p-8 shadow-2xl relative max-h-[calc(100vh-8rem)] overflow-y-auto mt-4">
                  <button onClick={() => setSelectedSession(null)} className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xl">×</button>

                  <div className="mb-6">
                    <span className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider mb-2 block">Session Details</span>
                    <h2 className="text-2xl font-bold text-[var(--text-primary)]">{selectedSession.title}</h2>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-4 p-3 bg-[var(--text-primary)]/5 rounded-xl">
                      <Calendar className="text-[var(--text-secondary)]" size={20} />
                      <div>
                        <p className="text-sm text-[var(--text-secondary)]">Date & Time</p>
                        <p className="font-medium text-[var(--text-primary)]">
                          {new Date(selectedSession.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          <br />
                          {new Date(selectedSession.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-3 bg-[var(--text-primary)]/5 rounded-xl">
                      <Users className="text-[var(--text-secondary)]" size={20} />
                      <div>
                        <p className="text-sm text-[var(--text-secondary)]">Mentor</p>
                        <p className="font-medium text-[var(--text-primary)]">{selectedSession.mentorName}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setSelectedSession(null)} className="flex-1 py-3 rounded-xl border border-[var(--text-primary)]/10 text-[var(--text-primary)] font-bold hover:bg-[var(--text-primary)]/5 transition-colors">Close</button>
                    {selectedSession.status === 'scheduled' && (
                      <button onClick={() => handleJoinSession(selectedSession)} className="flex-1 py-3 rounded-xl bg-[var(--color-primary)] text-white font-bold hover:bg-[var(--color-secondary)] transition-colors shadow-lg shadow-emerald-500/20">
                        Join Meeting Now
                      </button>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </motion.div>
  );
};

export default DashboardOverview;
