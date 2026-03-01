import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Video, Plus, X, Users, Clock, AlignLeft, CheckCircle, XCircle, Trash2 } from "lucide-react";
import axios from '../../api/axiosInstance';
import { toast } from 'react-toastify';

const MentorSessions = ({ initialViewMode = 'grid' }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mentees, setMentees] = useState([]); // To populate dropdown
  const [showCalendar, setShowCalendar] = useState(null); // Track which session's calendar to show
  const [viewMode, setViewMode] = useState(initialViewMode); // 'grid' or 'calendar'
  const [currentDate, setCurrentDate] = useState(new Date());

  // Form State
  const [formData, setFormData] = useState({
    founderId: "",
    title: "",
    date: "",
    time: "",
    durationMinutes: 60,
    meetingLink: "",
    description: ""
  });

  useEffect(() => {
    fetchSessions();
    fetchMentees();
  }, []);

  // Close calendar popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCalendar && !event.target.closest('.calendar-popup-container')) {
        setShowCalendar(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendar]);

  const fetchSessions = async () => {
    try {
      const response = await axios.get("/sessions");
      if (response.data.success) {
        setSessions(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMentees = async () => {
    try {
      const res = await axios.get("/mentors/my-requests?status=accepted");
      if (res.data.success) {
        const accepted = res.data.data
          .filter(req => req.founderId)
          .map(req => ({
            ...req.founderId,
            startupName: req.startupId?.name
          }))
          .filter((v, i, a) => a.findIndex(t => (t._id === v._id)) === i);
        setMentees(accepted);
      }
    } catch (err) {
      console.log("Error fetching mentees:", err);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      const dateTime = new Date(`${formData.date}T${formData.time}`);
      const payload = { ...formData, date: dateTime };

      const response = await axios.post("/sessions", payload);

      if (response.data.success) {
        toast.success("Session scheduled!");
        setSessions([...sessions, response.data.data].sort((a, b) => new Date(a.date) - new Date(b.date)));
        setIsModalOpen(false);
        setFormData({ founderId: "", title: "", date: "", time: "", durationMinutes: 60, meetingLink: "", description: "" });
      }
    } catch (error) {
      console.error("Error creating session:", error);
      toast.error(error.response?.data?.message || "Failed to schedule session");
    }
  };

  const handleJoin = async (session) => {
    try {
      await axios.put(`/sessions/${session._id}/join`, {});
      if (session.meetingLink) {
        window.open(session.meetingLink, '_blank');
      } else {
        toast.error("No meeting link available");
      }
    } catch (err) {
      console.error("Join error:", err);
      toast.error("Failed to join session");
    }
  };

  const handleDelete = async (sessionId) => {
    if (!window.confirm("Are you sure you want to delete this session?")) return;
    try {
      await axios.delete(`/sessions/${sessionId}`);
      toast.success("Session deleted");
      setSessions(sessions.filter(s => s._id !== sessionId));
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete session");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-white">Sessions</h1>
          <p className="text-gray-400 mt-1">Manage your mentorship schedule.</p>
        </motion.div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex bg-[#121212] border border-white/5 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'grid' ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/20' : 'text-gray-400 hover:text-white'}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'calendar' ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/20' : 'text-gray-400 hover:text-white'}`}
            >
              Calendar
            </button>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 sm:flex-none justify-center bg-[var(--color-primary)] text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-[var(--color-primary)]/20 hover:bg-[var(--color-primary)]/90 active:scale-95 transition-all flex items-center gap-2"
          >
            <Plus size={20} /> Schedule
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {sessions.map((session, i) => (
              <motion.div
                key={session._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-[#121212] border border-white/5 rounded-3xl p-6 relative group hover:border-[var(--color-primary)]/30 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-lg line-clamp-1">{session.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">with {session.founderId?.name || "Founder"}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(session._id)}
                      className="p-2 rounded-xl bg-red-500/5 text-red-500/50 hover:bg-red-500/10 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/5 text-gray-400">
                      <Clock size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">
                        {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                        {new Date(session.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  {session.meetingLink && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/5 text-gray-400">
                        <Video size={16} />
                      </div>
                      <a href={session.meetingLink} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--color-primary)] hover:underline truncate">
                        Meeting Link
                      </a>
                    </div>
                  )}
                </div>

                <div className="mt-auto">
                  {session.status === 'expired' ? (
                    <div className="w-full text-center py-3 rounded-2xl bg-white/5 text-gray-500 font-bold border border-white/5 text-xs uppercase tracking-widest">
                      {session.attendanceResult === 'user_missed' ? "Mentee Missed" :
                        session.attendanceResult === 'mentor_missed' ? "You Missed" :
                          session.attendanceResult === 'both_missed' ? "Both Missed" : "Completed"}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleJoin(session)}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-white text-black font-bold hover:bg-gray-200 transition-all active:scale-[0.98]"
                    >
                      <Video size={18} /> Join Session
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
            {sessions.length === 0 && !loading && (
              <div className="col-span-full text-center py-24 bg-[#121212] border border-dashed border-white/10 rounded-3xl">
                <div className="p-4 bg-white/5 rounded-full w-fit mx-auto mb-4">
                  <Calendar size={32} className="text-gray-600" />
                </div>
                <p className="text-gray-400 font-medium">No sessions scheduled yet.</p>
                <button onClick={() => setIsModalOpen(true)} className="mt-4 text-[var(--color-primary)] font-bold text-sm hover:underline">
                  Schedule your first session
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-[#121212] border border-white/5 rounded-3xl p-8"
          >
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-bold text-white">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
                  className="p-2.5 rounded-xl border border-white/5 hover:bg-white/5 text-white active:scale-90 transition-all"
                >
                  <Plus size={18} className="rotate-45" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-5 py-2.5 rounded-xl border border-white/5 hover:bg-white/5 text-white text-sm font-bold active:scale-95 transition-all"
                >
                  Today
                </button>
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
                  className="p-2.5 rounded-xl border border-white/5 hover:bg-white/5 text-white active:scale-90 transition-all"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-px bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="bg-[#0a0a0b] py-5 text-center text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] border-b border-white/5">
                  {day}
                </div>
              ))}
              {(() => {
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth();
                const firstDay = new Date(year, month, 1).getDay();
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const cells = [];
                for (let i = 0; i < firstDay; i++) {
                  cells.push(<div key={`empty-${i}`} className="bg-[#121212] min-h-[140px]"></div>);
                }
                for (let d = 1; d <= daysInMonth; d++) {
                  const cellDate = new Date(year, month, d);
                  const daySessions = sessions.filter(s => {
                    const sDate = new Date(s.date);
                    return sDate.getFullYear() === year && sDate.getMonth() === month && sDate.getDate() === d;
                  });
                  const isToday = new Date().toDateString() === cellDate.toDateString();
                  cells.push(
                    <div key={d} className={`bg-[#121212] min-h-[140px] p-3 border-r border-b border-white/5 hover:bg-white/[0.02] transition-colors group relative ${isToday ? 'bg-white/[0.01]' : ''}`}>
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-sm font-black w-8 h-8 flex items-center justify-center rounded-xl transition-all ${isToday ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/20' : 'text-gray-500 group-hover:text-white'}`}>
                          {d}
                        </span>
                        {daySessions.length > 0 && <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] shadow-[0_0_12px_var(--color-primary)]"></span>}
                      </div>
                      <div className="space-y-1.5 overflow-hidden">
                        {daySessions.slice(0, 3).map(sess => (
                          <div key={sess._id} className="px-2 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[9px] font-bold text-gray-300 truncate">
                            <span className="text-[var(--color-primary)] mr-1.5">•</span>
                            {new Date(sess.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })} {sess.title}
                          </div>
                        ))}
                        {daySessions.length > 3 && (
                          <p className="text-[9px] text-gray-500 font-bold pl-2">+ {daySessions.length - 3} more</p>
                        )}
                      </div>
                    </div>
                  );
                }
                const total = firstDay + daysInMonth;
                const remain = (Math.ceil(total / 7) * 7) - total;
                for (let i = 0; i < remain; i++) {
                  cells.push(<div key={`end-${i}`} className="bg-[#121212] min-h-[140px]"></div>);
                }
                return cells;
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#0a0a0b] border border-white/10 w-full max-w-lg rounded-[2.5rem] p-10 shadow-3xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent opacity-50"></div>

              <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
                <X size={24} />
              </button>

              <h2 className="text-3xl font-bold text-white mb-2">Schedule Session</h2>
              <p className="text-gray-500 text-sm mb-8 font-medium">Set up a new meeting with your mentee.</p>

              <form onSubmit={handleCreateSession} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Mentee/Startup</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <select
                      required
                      value={formData.founderId}
                      onChange={e => setFormData({ ...formData, founderId: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-[1.25rem] focus:border-[var(--color-primary)] focus:bg-white/[0.08] outline-none appearance-none text-white transition-all font-medium"
                    >
                      <option value="" className="bg-[#0a0a0b]">Select Mentee/Startup</option>
                      {mentees.map(mentee => (
                        <option key={mentee._id} value={mentee._id} className="bg-[#0a0a0b]">
                          {mentee.startupName ? `${mentee.startupName} (${mentee.name})` : mentee.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Session Details</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Weekly Sync"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-[1.25rem] focus:border-[var(--color-primary)] focus:bg-white/[0.08] outline-none text-white placeholder:text-gray-600 transition-all font-medium"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Date</label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={e => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-[1.25rem] focus:border-[var(--color-primary)] outline-none text-white [color-scheme:dark] text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Time</label>
                    <input
                      type="time"
                      required
                      value={formData.time}
                      onChange={e => setFormData({ ...formData, time: e.target.value })}
                      className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-[1.25rem] focus:border-[var(--color-primary)] outline-none text-white [color-scheme:dark] text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Duration</label>
                    <input
                      type="number"
                      min="15"
                      step="15"
                      required
                      value={formData.durationMinutes}
                      onChange={e => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 60 })}
                      className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-[1.25rem] focus:border-[var(--color-primary)] outline-none text-white font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Meeting Link</label>
                  <div className="relative">
                    <Video className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input
                      type="url"
                      placeholder="https://meet.google.com/..."
                      value={formData.meetingLink}
                      onChange={e => setFormData({ ...formData, meetingLink: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-[1.25rem] focus:border-[var(--color-primary)] focus:bg-white/[0.08] outline-none text-white placeholder:text-gray-600 font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-white text-black font-black py-5 rounded-[1.25rem] hover:bg-gray-200 active:scale-[0.98] transition-all shadow-xl text-sm uppercase tracking-widest mt-4"
                >
                  Confirm Schedule
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MentorSessions;
