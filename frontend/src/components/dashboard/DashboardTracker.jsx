import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Circle, TrendingUp, Filter, Plus, Flag, Clock, Upload, Link as LinkIcon, X } from "lucide-react";
import axios from '../../api/axiosInstance';
import { toast } from 'react-toastify';

const DashboardTasks = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Submission State
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [submissionType, setSubmissionType] = useState('link'); // 'link' or 'file'
  const [submissionLink, setSubmissionLink] = useState('');
  const [submissionFile, setSubmissionFile] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get("/tasks/my-tasks");
      if (res.data.success) {
        setTasks(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId, currentStatus) => {
    let newStatus = 'pending';
    if (currentStatus === 'pending') {
      newStatus = 'in-progress';
      // Direct update for in-progress
      try {
        setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
        await axios.put(`/tasks/${taskId}`, { status: newStatus });
        toast.success(`Task marked as ${newStatus}`);
      } catch (error) {
        toast.error("Failed to update status");
        fetchTasks();
      }
    } else if (currentStatus === 'in-progress') {
      // Open modal for completion
      const task = tasks.find(t => t._id === taskId);
      setSelectedTask(task);
      setIsSubmitModalOpen(true);
    }
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();

      if (submissionType === 'link') {
        formData.append('link', submissionLink);
      } else {
        if (!submissionFile) return toast.error("Please upload a file");
        formData.append('file', submissionFile);
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };

      await axios.post(`/tasks/${selectedTask._id}/submit`, formData, config);

      toast.success("Task submitted successfully!");
      setIsSubmitModalOpen(false);
      setSubmissionLink("");
      setSubmissionFile(null);
      fetchTasks(); // Refresh to see updated status

    } catch (error) {
      console.error("Error submitting task:", error);
      toast.error("Failed to submit task");
    }
  };

  // Helper to format date
  const formatDate = (dateString) => {
    if (!dateString) return "No Due Date";
    return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };


  const milestones = [
    { id: 1, title: "Idea Phase", status: "completed", date: "Aug 2024" },
    { id: 2, title: "MVP Prototype", status: "completed", date: "Nov 2024" },
    { id: 3, title: "Beta Launch", status: "current", date: "Jan 2025" },
    { id: 4, title: "Seed Funding", status: "upcoming", date: "Q2 2025" },
  ];

  const getPriorityColor = (tag) => {
    switch (tag) {
      case "Urgent": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "High": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "Medium": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      default: return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

      {/* Left Column: Tasks List */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Tasks & To-Dos</h2>
            <p className="text-[var(--text-secondary)]">Manage your daily goals and assignments.</p>
          </div>
          {/* New Task button removed for mentees */}
        </div>

        {/* Filters */}
        <div className="flex gap-2 pb-2 overflow-x-auto no-scrollbar -mx-2 px-2 sm:mx-0 sm:px-0">
          {['all', 'pending', 'in-progress', 'completed'].map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all border whitespace-nowrap ${activeFilter === f
                ? "bg-[var(--text-primary)] text-[var(--bg-primary)] border-[var(--text-primary)]"
                : "bg-transparent text-[var(--text-secondary)] border-transparent hover:bg-[var(--text-primary)]/5"
                }`}
            >
              {f.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Task List */}
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <div className="text-center p-6 text-[var(--text-secondary)]">No tasks assigned yet.</div>
          ) : tasks
            .filter(t => activeFilter === "all" || t.status === activeFilter)
            .map((task) => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="group relative flex flex-col sm:flex-row items-start sm:items-center gap-4 cinematic-glass border border-white/5 p-5 sm:p-6 rounded-[2rem] hover:border-emerald-500/30 transition-all duration-500 shadow-lg overflow-hidden"
              >
                <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all duration-700" />
                <div className="flex items-center gap-4 w-full sm:w-auto mb-2 sm:mb-0">
                  <button
                    onClick={() => updateTaskStatus(task._id, task.status)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${task.status === 'completed' ? 'bg-green-500 border-green-500' : 'border-[var(--text-primary)]/20 group-hover:border-[var(--color-primary)]'}`}
                  >
                    {task.status === 'completed' && <CheckCircle size={14} className="text-white" />}
                  </button>
                  <div className="sm:hidden flex-1 min-w-0">
                    <h3 className={`font-semibold text-[var(--text-primary)] text-sm sm:text-base truncate ${task.status === 'completed' && 'line-through opacity-50'}`}>{task.title}</h3>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className={`hidden sm:block font-semibold text-[var(--text-primary)] ${task.status === 'completed' && 'line-through opacity-50'}`}>{task.title}</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5 line-clamp-2 sm:line-clamp-1">{task.description}</p>

                  {task.status === 'completed' && task.rating && (
                    <div className="mt-2 p-2 bg-[var(--text-primary)]/5 rounded-lg border border-[var(--text-primary)]/10">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-yellow-500 font-bold text-xs">★ {task.rating}</span>
                        <span className="text-[10px] uppercase font-bold text-[var(--text-primary)]/50">Mentor Feedback</span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] italic">"{task.feedback}"</p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3 sm:mt-2">
                    <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className="text-[10px] sm:text-xs text-[var(--text-secondary)] flex items-center gap-1">
                      <Clock size={10} className="sm:w-3 sm:h-3" /> {formatDate(task.dueDate)}
                    </span>
                    <span className="text-[10px] sm:text-xs text-[var(--text-secondary)] truncate max-w-[120px] sm:max-w-none">
                      From: {task.assignedBy?.name}
                    </span>
                  </div>
                </div>

                <button className="hidden sm:block opacity-0 group-hover:opacity-100 p-2 hover:bg-[var(--text-primary)]/5 rounded-lg text-[var(--text-secondary)]">
                  <Flag size={18} />
                </button>
              </motion.div>
            ))}
        </div>
      </div>

      {/* Right Column: Milestones */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Startup Milestones</h2>

        <div className="cinematic-glass border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden group shadow-2xl">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all duration-1000"></div>
          {/* Thread Line */}
          <div className="absolute left-[39px] top-10 bottom-10 w-0.5 bg-[var(--text-primary)]/10"></div>

          <div className="space-y-8 relative z-10">
            {milestones.map((m, i) => (
              <div key={m.id} className={`flex gap-4 ${m.status === 'upcoming' ? 'opacity-50' : 'opacity-100'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-[var(--bg-primary)] flex-shrink-0 ${m.status === 'completed' ? 'bg-green-500 text-white' :
                  m.status === 'current' ? 'bg-[var(--color-primary)] text-white animate-pulse' :
                    'bg-[var(--text-primary)]/20'
                  }`}>
                  {m.status === 'completed' ? <CheckCircle size={14} /> : <Circle size={14} />}
                </div>
                <div>
                  <h4 className="font-bold text-[var(--text-primary)] text-sm">{m.title}</h4>
                  <p className="text-xs text-[var(--text-secondary)]">{m.date}</p>
                  {m.status === 'current' && (
                    <span className="inline-block mt-2 text-[10px] bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                      In Progress
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Readniess Score Mini */}
        <div className="bg-gradient-to-br from-[#06b6d4] to-[#3b82f6] rounded-[2.5rem] p-8 text-white shadow-[0_20px_40px_rgba(6,182,212,0.3)] group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-white/20 transition-all duration-1000"></div>
          <h3 className="font-bold mb-2">Readiness Score</h3>
          <div className="text-4xl font-bold mb-4">72<span className="text-xl text-white/70">/100</span></div>
          <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden">
            <div className="w-[72%] h-full bg-white rounded-full"></div>
          </div>
          <p className="text-xs text-white/80 mt-2">You are ready for Seed Funding!</p>
        </div>
      </div>


      {/* Submit Task Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 w-full max-w-md rounded-2xl p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={() => setIsSubmitModalOpen(false)}
              className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <X size={24} />
            </button>

            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Submit Task</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              Complete <strong>{selectedTask?.title}</strong> by uploading your work.
            </p>

            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setSubmissionType('link')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors ${submissionType === 'link'
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--text-primary)]/5 text-[var(--text-secondary)] hover:bg-[var(--text-primary)]/10'
                  }`}
              >
                <LinkIcon size={16} /> Link
              </button>
              <button
                onClick={() => setSubmissionType('file')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors ${submissionType === 'file'
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--text-primary)]/5 text-[var(--text-secondary)] hover:bg-[var(--text-primary)]/10'
                  }`}
              >
                <Upload size={16} /> File
              </button>
            </div>

            <form onSubmit={handleSubmitTask} className="space-y-4">
              {submissionType === 'link' ? (
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Submission URL</label>
                  <input
                    type="url"
                    required
                    placeholder="https://docs.google.com/..."
                    value={submissionLink}
                    onChange={e => setSubmissionLink(e.target.value)}
                    className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 rounded-xl outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Upload File</label>
                  <div className="border-2 border-dashed border-[var(--text-primary)]/20 rounded-xl p-8 text-center hover:border-[var(--color-primary)] transition-colors relative">
                    <input
                      type="file"
                      required
                      onChange={e => setSubmissionFile(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload size={32} className="mx-auto text-[var(--text-secondary)] mb-2" />
                    <p className="text-sm text-[var(--text-primary)]">
                      {submissionFile ? submissionFile.name : "Click to upload or drag & drop"}
                    </p>
                  </div>
                </div>
              )}

              <button className="w-full bg-[var(--color-primary)] text-white font-bold py-3 rounded-xl hover:bg-[var(--color-secondary)] transition-colors mt-2">
                Submit & Complete
              </button>
            </form>

          </motion.div>
        </div>
      )}
    </div>
  );
};

export default DashboardTasks;
