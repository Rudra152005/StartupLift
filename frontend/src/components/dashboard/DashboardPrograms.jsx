import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Calendar, CheckCircle, Loader, X, Clock, AlertCircle, FileText } from "lucide-react";
import axios from '../../api/axiosInstance';

const DashboardPrograms = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const response = await axios.get('/programs');
      if (response.data.success) {
        setPrograms(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching programs:", error);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleApply = async (programId, programTitle) => {
    setApplying(programId);
    try {
      const response = await axios.post('/programs/apply', { programId });

      if (response.data.success) {
        showNotification(`Successfully applied to "${programTitle}"! 🎉`, 'success');
        fetchPrograms(); // Refresh to update status
      }
    } catch (error) {
      console.error("Error applying to program:", error);
      const errorMsg = error.response?.data?.message || "Failed to apply. You might have already applied or the deadline has passed.";
      showNotification(errorMsg, 'error');
    } finally {
      setApplying(null);
    }
  };

  const handleViewStatus = (program) => {
    setSelectedProgram(program);
    setShowStatusModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'text-green-600 bg-green-50 border-green-200';
      case 'Applied': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'In Review': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'Closed': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin text-[var(--color-primary)]" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-6 left-1/2 z-[60] w-[90%] max-w-md"
          >
            <div className={`px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-2xl border-2 backdrop-blur-md ${notification.type === 'success'
              ? 'bg-green-50/90 border-green-300 text-green-800'
              : 'bg-red-50/90 border-red-300 text-red-800'
              }`}>
              <div className="flex items-center gap-3">
                {notification.type === 'success' ? (
                  <CheckCircle className="flex-shrink-0" size={24} />
                ) : (
                  <AlertCircle className="flex-shrink-0" size={24} />
                )}
                <p className="font-medium">{notification.message}</p>
                <button
                  onClick={() => setNotification(null)}
                  className="ml-auto hover:opacity-70 transition-opacity"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Modal */}
      <AnimatePresence>
        {showStatusModal && selectedProgram && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowStatusModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--color-primary)]/20 max-w-lg w-full p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[85vh]"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-[var(--text-primary)]">Application Status</h3>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-2 hover:bg-[var(--color-primary)]/10 rounded-lg"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Program Info */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText size={16} className="text-[var(--color-primary)]" />
                    <span className="text-xs font-semibold text-[var(--color-primary)] uppercase tracking-wider">
                      {selectedProgram.type}
                    </span>
                  </div>
                  <h4 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                    {selectedProgram.title}
                  </h4>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {selectedProgram.description}
                  </p>
                </div>

                {/* Status Badge */}
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider block mb-2">
                    Current Status
                  </label>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-bold ${getStatusColor(selectedProgram.status)}`}>
                    {selectedProgram.status === 'Applied' && <Clock size={16} />}
                    {selectedProgram.status === 'In Review' && <Loader size={16} className="animate-spin" />}
                    {selectedProgram.status === 'Closed' && <X size={16} />}
                    {selectedProgram.status === 'Open' && <CheckCircle size={16} />}
                    {selectedProgram.status}
                  </div>
                </div>

                {/* Deadline */}
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider block mb-2">
                    Application Deadline
                  </label>
                  <div className="flex items-center gap-2 text-[var(--text-primary)]">
                    <Calendar size={16} className="text-[var(--color-primary)]" />
                    <span className="font-medium">{selectedProgram.deadline}</span>
                  </div>
                </div>

                {/* Status Info */}
                <div className="bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 rounded-xl p-4">
                  <p className="text-sm text-[var(--text-secondary)]">
                    {selectedProgram.status === 'Applied' && (
                      <>✅ Your application has been submitted successfully! Our team will review it shortly.</>
                    )}
                    {selectedProgram.status === 'In Review' && (
                      <>🔍 Your application is currently under review. You'll be notified of the decision soon.</>
                    )}
                    {selectedProgram.status === 'Closed' && (
                      <>⏰ Applications for this program have closed. Check back for future opportunities!</>
                    )}
                    {selectedProgram.status === 'Open' && (
                      <>🚀 You haven't applied yet. Click "Apply Now" to submit your application!</>
                    )}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowStatusModal(false)}
                className="w-full mt-6 bg-[var(--color-primary)] hover:opacity-90 text-white py-3 px-6 rounded-xl font-semibold transition-all shadow-lg"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center sm:text-left"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] px-2">Programs & Grants</h1>
        <p className="text-[var(--text-secondary)] mt-1 px-2">Explore opportunities to accelerate your startup.</p>
      </motion.div>

      {/* Program Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {programs.map((program, index) => (
          <motion.div
            key={program.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative cinematic-glass border border-white/10 rounded-[2.5rem] p-8 hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all duration-500 hover:-translate-y-1.5 overflow-hidden"
          >
            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all duration-700" />
            {/* Status Badge */}
            <div className={`absolute top-6 right-6 px-3 py-1 rounded-full text-xs font-medium border
              ${program.status === 'Open' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                program.status === 'Applied' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                  program.status === 'Closed' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                    'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
              }
            `}>
              {program.status}
            </div>

            <div className="mt-2 mb-4">
              <span className="text-xs font-semibold text-[var(--color-primary)] uppercase tracking-wider">{program.type}</span>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mt-1 group-hover:text-[var(--color-primary)] transition-colors">{program.title}</h3>
            </div>

            <p className="text-[var(--text-secondary)] text-sm mb-6 line-clamp-3">
              {program.description}
            </p>

            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                <Calendar size={14} />
                <span>Deadline: {program.deadline}</span>
              </div>

              <button
                disabled={program.status !== 'Open' && program.status !== 'Applied' || applying === program.id}
                onClick={() => {
                  if (program.status === 'Applied') {
                    handleViewStatus(program);
                  } else {
                    handleApply(program.id, program.title);
                  }
                }}
                className={`flex items-center gap-1.5 text-sm font-medium transition-all
                    ${program.status === 'Open'
                    ? 'text-[var(--text-primary)] hover:text-[var(--color-primary)] cursor-pointer hover:gap-2'
                    : program.status === 'Applied'
                      ? 'text-emerald-600 hover:text-emerald-700 cursor-pointer hover:gap-2'
                      : 'text-[var(--text-secondary)] opacity-50 cursor-not-allowed'}`
                }
              >
                {applying === program.id ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Applying...
                  </>
                ) : program.status === 'Open' ? (
                  <>
                    Apply Now
                    <ArrowRight size={16} />
                  </>
                ) : program.status === 'Applied' ? (
                  <>
                    View Status
                    <ArrowRight size={16} />
                  </>
                ) : (
                  <>
                    {program.status}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DashboardPrograms;
