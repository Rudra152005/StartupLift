import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Send, Star } from "lucide-react";
import axios from "../../api/axiosInstance";
import { toast } from "react-toastify";

const MentorFeedback = () => {
  const [mentees, setMentees] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    recipient: "",
    rating: 5,
    milestoneStatus: "On Track",
    observations: "",
    actionItems: ""
  });

  useEffect(() => {
    fetchMentees();
    fetchFeedbackHistory();
  }, []);

  const fetchMentees = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
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

  const fetchFeedbackHistory = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get("/feedback/given");
      if (res.data.success) {
        setHistory(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching feedback history:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const res = await axios.post("/feedback", formData);

      if (res.data.success) {
        toast.success("Feedback submitted successfully!");
        setHistory([res.data.data, ...history]);
        // Reset form (keep rating default)
        setFormData({ ...formData, observations: "", actionItems: "", rating: 5 });
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to submit feedback");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Startup Feedback</h1>
        <p className="text-[var(--text-secondary)] mt-1">Evaluate startup progress and provide structured guidance.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[var(--bg-primary)]/50 backdrop-blur-xl border border-[var(--color-primary)]/10 rounded-2xl p-8"
      >
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">New Report</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">Select Startup / Mentee</label>
            <select
              required
              value={formData.recipient}
              onChange={e => setFormData({ ...formData, recipient: e.target.value })}
              className="w-full bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-primary)]/50"
            >
              <option value="">Select Mentee/Startup</option>
              {mentees.map(m => (
                <option key={m._id} value={m._id}>
                  {m.startupName ? `${m.startupName} (${m.name})` : `${m.name} (${m.email})`}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Progress Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className={`p-2 rounded-lg transition-colors ${formData.rating >= star ? 'text-[var(--color-primary)]' : 'text-[var(--text-secondary)] hover:bg-[var(--color-primary)]/10'}`}
                  >
                    <Star size={24} fill={formData.rating >= star ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Milestone Status</label>
              <select
                value={formData.milestoneStatus}
                onChange={e => setFormData({ ...formData, milestoneStatus: e.target.value })}
                className="w-full bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-primary)]/50"
              >
                <option>On Track</option>
                <option>At Risk</option>
                <option>Delayed</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">Key Observations</label>
            <textarea
              required
              value={formData.observations}
              onChange={e => setFormData({ ...formData, observations: e.target.value })}
              rows={4}
              placeholder="What went well? What needs improvement?"
              className="w-full bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-primary)]/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">Action Items for Next Week</label>
            <textarea
              value={formData.actionItems}
              onChange={e => setFormData({ ...formData, actionItems: e.target.value })}
              rows={3}
              placeholder="- Update pitch deck..."
              className="w-full bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-primary)]/50"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-6 py-3 rounded-xl hover:bg-[var(--color-secondary)] transition-colors shadow-lg shadow-[var(--color-primary)]/20">
              <Send size={18} /> Submit Report
            </button>
          </div>
        </form>
      </motion.div>

      {/* History Preview */}
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Recent Feedback History</h2>
        <div className="space-y-4">
          {loading ? (
            <div className="text-[var(--text-secondary)]">Loading history...</div>
          ) : history.length === 0 ? (
            <div className="text-[var(--text-secondary)]">No feedback submitted yet.</div>
          ) : (
            history.map(item => (
              <div key={item._id} className="bg-[var(--bg-primary)]/50 backdrop-blur-xl border border-[var(--text-primary)]/10 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--text-primary)]">Report for {item.recipient?.name || 'Mentee'}</h3>
                    <p className="text-sm text-[var(--text-secondary)] mb-2">Sent on {new Date(item.createdAt).toLocaleDateString()}</p>
                    <p className="text-[var(--text-primary)]/80 text-sm">{item.observations}</p>
                    {item.actionItems && (
                      <div className="mt-2 p-2 bg-[var(--bg-primary)] rounded-lg text-xs font-mono text-[var(--text-secondary)]">
                        <strong>Actions:</strong> {item.actionItems}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorFeedback;
