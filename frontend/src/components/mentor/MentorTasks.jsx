import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, CheckCircle, Circle, Clock, MoreVertical, Filter, X, ExternalLink, Trash2 } from 'lucide-react';
import axios from '../../api/axiosInstance';
import { toast } from 'react-toastify';

const MentorTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedTo: "",
    priority: "Medium",
    due: "", // Text for now or date picker
  });

  // Review State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewData, setReviewData] = useState({
    taskId: null,
    rating: 5,
    feedback: ""
  });

  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTasks();
    fetchMentees();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get("/tasks/created"); // Tasks created by me
      if (response.data.success) {
        setTasks(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMentees = async () => {
    try {
      const res = await axios.get("/mentors/my-requests?status=accepted");
      if (res.data.success) {
        // Filter unique accepted founders
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

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        dueDate: formData.due ? new Date(formData.due) : undefined
      };

      const response = await axios.post("/tasks", payload);

      if (response.data.success) {
        toast.success("Task assigned successfully!");
        setTasks([response.data.data, ...tasks]);
        setIsModalOpen(false);
        setFormData({ title: "", description: "", assignedTo: "", priority: "Medium", due: "" });
      }
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error(error.response?.data?.message || "Failed to assign task");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      const response = await axios.delete(`/tasks/${taskId}`);
      if (response.data.success) {
        toast.success("Task deleted successfully");
        setTasks(tasks.filter(t => t._id !== taskId));
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  const handleReviewTask = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`/tasks/${reviewData.taskId}/review`, {
        rating: reviewData.rating,
        feedback: reviewData.feedback
      });

      if (response.data.success) {
        toast.success("Feedback submitted!");
        // Update local state
        setTasks(tasks.map(t => t._id === reviewData.taskId ? response.data.data : t));
        setIsReviewModalOpen(false);
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
    }
  };

  // Helper to format date
  const formatDate = (dateString) => {
    if (!dateString) return "No Due Date";
    return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Tasks & Assignments</h2>
          <p className="text-[var(--text-secondary)]">Track progress and assign work to your mentees.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[var(--color-primary)] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[var(--color-secondary)] transition-colors shadow-lg flex items-center gap-2"
        >
          <Plus size={20} /> Assign New Task
        </button>
      </div>

      <div className="bg-[var(--bg-primary)]/50 border border-[var(--text-primary)]/10 backdrop-blur-xl rounded-2xl overflow-hidden shadow-sm">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-[var(--text-primary)]/10 bg-[var(--text-primary)]/5 text-sm font-semibold text-[var(--text-secondary)]">
          <div className="col-span-5">Task Details</div>
          <div className="col-span-3">Assignee</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Priority</div>
        </div>

        {/* Task Rows */}
        <div className="divide-y divide-[var(--text-primary)]/10">
          {tasks.length === 0 ? (
            <div className="p-8 text-center text-[var(--text-secondary)]">No active tasks found. Assign one to get started!</div>
          ) : (
            tasks.map((task) => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-[var(--text-primary)]/5 transition-colors group"
              >
                <div className="col-span-5 flex items-center gap-3">
                  <button className={`flex-shrink-0 w-5 h-5 rounded border ${task.status === 'completed' ? 'bg-green-500 border-green-500 text-white' : 'border-[var(--text-primary)]/30'} flex items-center justify-center`}>
                    {task.status === 'completed' && <CheckCircle size={14} />}
                  </button>
                  <div>
                    <p className={`font-medium text-[var(--text-primary)] ${task.status === 'completed' && 'line-through opacity-50'}`}>{task.title}</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5 line-clamp-1" title={task.description}>{task.description}</p>
                    <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1 mt-0.5">
                      <Clock size={10} /> Due: {formatDate(task.dueDate)}
                    </p>
                  </div>
                </div>

                <div className="col-span-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-500 text-[10px] text-white flex items-center justify-center font-bold">
                      {task.assignedTo?.name?.charAt(0) || "?"}
                    </div>
                    <span className="text-sm text-[var(--text-primary)]">{task.assignedTo?.name || "Unknown"}</span>
                  </div>
                </div>

                <div className="col-span-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full capitalize
                         ${task.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                      task.status === 'in-progress' ? 'bg-emerald-500/10 text-emerald-500' :
                        'bg-gray-500/10 text-gray-500'}
                       `}>
                    {task.status.replace('-', ' ')}
                  </span>
                </div>

                <div className="col-span-2 flex items-center justify-end gap-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded border
                         ${task.priority === 'Urgent' ? 'border-red-500/20 text-red-500' :
                      task.priority === 'High' ? 'border-orange-500/20 text-orange-500' :
                        'border-gray-500/20 text-gray-500'}
                       `}>
                    {task.priority}
                  </span>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteTask(task._id)}
                    className="p-1.5 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Delete Task"
                  >
                    <Trash2 size={16} />
                  </button>
                  {task.status === 'completed' && task.submissionUrl && (
                    <>
                      <a
                        href={task.submissionUrl.startsWith('http') ? task.submissionUrl : `${axios.defaults.baseURL.replace('/api', '')}${task.submissionUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20 transition-colors"
                        title="View Submission"
                      >
                        <ExternalLink size={14} />
                      </a>
                      {!task.rating && (
                        <button
                          onClick={() => {
                            setReviewData({ taskId: task._id, rating: 5, feedback: "" });
                            setIsReviewModalOpen(true);
                          }}
                          className="text-xs bg-[var(--color-primary)] text-white px-3 py-1.5 rounded-lg hover:bg-[var(--color-secondary)] transition-colors"
                        >
                          Review
                        </button>
                      )}
                      {task.rating && (
                        <span className="text-xs font-bold text-[var(--color-primary)]">
                          ★ {task.rating}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Assign Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 w-full max-w-lg rounded-2xl p-8 shadow-2xl relative"
          >
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
              <X size={24} />
            </button>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Assign New Task</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Task Title</label>
                <input
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 rounded-xl outline-none focus:border-[var(--color-primary)]"
                  placeholder="e.g. Update Pitch Deck"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 rounded-xl outline-none focus:border-[var(--color-primary)] min-h-[100px]"
                  placeholder="Add details regarding the task..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Assign To</label>
                <select
                  required
                  value={formData.assignedTo}
                  onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 rounded-xl outline-none focus:border-[var(--color-primary)]"
                >
                  <option value="">Select Mentee/Startup</option>
                  {mentees.map(m => (
                    <option key={m._id} value={m._id}>
                      {m.startupName ? `${m.startupName} (${m.name})` : m.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 rounded-xl outline-none focus:border-[var(--color-primary)]"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.due}
                    onChange={e => setFormData({ ...formData, due: e.target.value })}
                    className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 rounded-xl outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
              </div>
              <button className="w-full bg-[var(--color-primary)] text-white font-bold py-3 rounded-xl hover:bg-[var(--color-secondary)] transition-colors mt-4">
                Assign Task
              </button>
            </form>
          </motion.div>
        </div>
      )}
      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 w-full max-w-md rounded-2xl p-8 shadow-2xl relative"
          >
            <button onClick={() => setIsReviewModalOpen(false)} className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
              <X size={24} />
            </button>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Review & Rate Task</h2>
            <form onSubmit={handleReviewTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewData({ ...reviewData, rating: star })}
                      className={`text-2xl transition-colors ${reviewData.rating >= star ? 'text-yellow-500' : 'text-[var(--text-secondary)] opacity-30'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Feedback</label>
                <textarea
                  required
                  value={reviewData.feedback}
                  onChange={e => setReviewData({ ...reviewData, feedback: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 rounded-xl outline-none focus:border-[var(--color-primary)] min-h-[120px]"
                  placeholder="Provide constructive feedback..."
                />
              </div>
              <button className="w-full bg-[var(--color-primary)] text-white font-bold py-3 rounded-xl hover:bg-[var(--color-secondary)] transition-colors mt-2">
                Submit Review
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MentorTasks;
