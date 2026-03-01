import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Building2, ExternalLink, Zap, Video, Eye, FileText } from 'lucide-react';
import axios from '../../api/axiosInstance';
import { toast } from 'react-toastify';

const MentorRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null); // For View Details Modal

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null, // 'accept' | 'reject'
    requestId: null,
    founderName: ''
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get("/mentors/my-requests");

      if (response.data.success) {
        // Filter to show only Mentorship requests
        const mentorshipRequests = response.data.data.filter(req => req.requestType === 'Mentorship');
        setRequests(mentorshipRequests);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Failed to load requests.");
    } finally {
      setLoading(false);
    }
  };

  const openConfirmation = (id, type, founderName) => {
    setConfirmModal({
      isOpen: true,
      type,
      requestId: id,
      founderName
    });
  };

  const closeConfirmation = () => {
    setConfirmModal({ isOpen: false, type: null, requestId: null, founderName: '' });
  };

  const handleAction = async () => {
    const { requestId, type } = confirmModal;
    if (!requestId || !type) return;

    try {
      const token = sessionStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const status = type === 'accept' ? 'accepted' : 'rejected';

      const response = await axios.put(`/mentors/requests/${requestId}`, { status });

      if (response.data.success) {
        toast.success(`Request ${status} successfully!`);
        setRequests(prev => prev.filter(req => req._id !== requestId));
        closeConfirmation();
        setSelectedRequest(null); // Close details modal if open
      }
    } catch (error) {
      console.error(`Error ${type}ing request:`, error);
      toast.error(`Failed to ${type} request.`);
      closeConfirmation();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-[var(--text-primary)]">Mentorship Requests</h2>
          <p className="text-[var(--text-secondary)] mt-1">Founders looking for your expertise.</p>
        </div>
        <div className="text-sm font-bold bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-4 py-2 rounded-xl border border-[var(--color-primary)]/20 shadow-sm">
          {requests.length} Pending Requests
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence mode='popLayout'>
          {requests.length > 0 ? (
            requests.map((req) => (
              <motion.div
                key={req._id}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: -20 }}
                layout
                className="bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
              >
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)]/5 rounded-bl-full z-0 transition-transform group-hover:scale-110"></div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-[var(--bg-primary)]">
                        {req.founderId?.avatar ? (
                          <img src={req.founderId.avatar} alt={req.founderId.name} className="w-full h-full rounded-2xl object-cover" />
                        ) : (
                          req.founderId?.name?.charAt(0) || "U"
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-[var(--text-primary)] text-lg">{req.founderId?.name || "Unknown Founder"}</h3>
                        <div className="flex items-center gap-2 text-xs mt-1">
                          <span className={`px-2.5 py-1 rounded-lg font-medium border
                                ${req.requestType === 'Funding'
                              ? "bg-green-500/10 text-green-600 border-green-500/20"
                              : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            }`}>
                            {req.requestType}
                          </span>
                          {req.startupId && (
                            <span className="flex items-center gap-1 text-[var(--text-secondary)]">
                              <Building2 size={12} /> Startup
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {req.requestType === 'Funding' && (
                      <div className="bg-green-100 p-2 rounded-full text-green-600 shadow-sm animate-pulse">
                        <Zap size={20} fill="currentColor" />
                      </div>
                    )}
                  </div>

                  {/* Summary (Truncated) */}
                  <div className="bg-[var(--bg-secondary)]/50 rounded-2xl p-4 mb-5 border border-[var(--text-primary)]/5">
                    <p className="text-sm text-[var(--text-primary)] leading-relaxed line-clamp-2">
                      "{req.message || "No message provided."}"
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedRequest(req)}
                    className="w-full py-2.5 mb-4 rounded-xl border border-[var(--text-primary)]/10 text-[var(--text-primary)] font-bold hover:bg-[var(--text-primary)]/5 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye size={18} /> View Full Details
                  </button>

                  <div className="flex gap-4 pt-2">
                    <button
                      onClick={() => openConfirmation(req._id, 'reject', req.founderId?.name)}
                      className="flex-1 py-3 px-4 rounded-xl border border-red-500/20 text-red-500 font-bold hover:bg-red-500 hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <X size={18} /> Decline
                    </button>

                    <button
                      onClick={() => openConfirmation(req._id, 'accept', req.founderId?.name)}
                      className="flex-[2] py-3 px-4 rounded-xl bg-[var(--color-primary)] text-white font-bold hover:bg-[var(--color-secondary)] hover:shadow-lg hover:shadow-[var(--color-primary)]/30 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Check size={18} /> Accept
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-1 lg:col-span-2 py-24 text-center"
            >
              <div className="w-24 h-24 bg-[var(--text-primary)]/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check size={40} className="text-[var(--text-secondary)] opacity-50" />
              </div>
              <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">All Caught Up!</h3>
              <p className="text-[var(--text-secondary)] text-lg">You have no pending mentorship requests at the moment.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* View Details Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 w-full max-w-2xl rounded-3xl p-8 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-6 border-b border-[var(--text-primary)]/10 pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-[var(--text-primary)]">Request Details</h2>
                  <p className="text-[var(--text-secondary)] text-sm">From {selectedRequest.founderId?.name}</p>
                </div>
                <button onClick={() => setSelectedRequest(null)} className="p-2 hover:bg-[var(--text-primary)]/5 rounded-full text-[var(--text-secondary)]">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
                {/* 1. Basic Info */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Request Type</h4>
                    <span className={`px-2.5 py-1 rounded-lg font-medium border text-sm
                                    ${selectedRequest.requestType === 'Funding'
                        ? "bg-green-500/10 text-green-600 border-green-500/20"
                        : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      }`}>
                      {selectedRequest.requestType}
                    </span>
                  </div>

                  <div className="bg-[var(--bg-secondary)]/50 p-4 rounded-xl">
                    <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase mb-2">About Founder</h4>
                    <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap">{selectedRequest.message || "No introduction provided."}</p>
                  </div>

                  <div className="bg-[var(--bg-secondary)]/50 p-4 rounded-xl">
                    <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase mb-2">Project Description & Goals</h4>
                    <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap">{selectedRequest.goals || "No description provided."}</p>
                  </div>
                </div>

                {/* 2. Documents */}
                {selectedRequest.documents && selectedRequest.documents.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                      <FileText size={16} /> Startup Documents
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {selectedRequest.documents.map((doc, idx) => (
                        <a key={idx} href={doc} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--text-primary)]/10 hover:bg-[var(--text-primary)]/5 transition-colors">
                          <span className="text-sm font-medium text-[var(--text-primary)]">Document {idx + 1}</span>
                          <ExternalLink size={14} className="text-[var(--text-secondary)]" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Team Verification */}
                {selectedRequest.teamVerification && selectedRequest.teamVerification.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                      <Check size={16} /> Verified Team Members
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedRequest.teamVerification.map((member, mIdx) => (
                        <div key={mIdx} className="flex gap-4 items-start bg-[var(--bg-secondary)] p-3 rounded-xl border border-[var(--text-primary)]/10">
                          <a href={member.proofUrl} target="_blank" rel="noopener noreferrer" className="block w-16 h-12 rounded-lg overflow-hidden border border-[var(--text-primary)]/10 flex-shrink-0">
                            <img src={member.proofUrl} alt="ID" className="w-full h-full object-cover" />
                          </a>
                          <div className="space-y-1 min-w-0">
                            <p className="text-xs text-[var(--text-secondary)]">Name: <span className="text-[var(--text-primary)] font-bold">{member.name || "N/A"}</span></p>
                            <p className="text-xs text-[var(--text-secondary)]">ID: <span className="text-[var(--text-primary)] font-bold">{member.idNumber || "N/A"}</span></p>
                            {member.isVerified && <span className="text-[10px] text-green-500 font-bold bg-green-500/10 px-1.5 py-0.5 rounded">Verified</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Video Pitch */}
                {selectedRequest.video && (
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                      <Video size={16} /> Video Pitch
                    </h4>
                    <a href={selectedRequest.video} target="_blank" rel="noopener noreferrer" className="block w-full bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--text-primary)]/10 flex items-center justify-between hover:bg-[var(--text-primary)]/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center">
                          <Video size={18} fill="currentColor" />
                        </div>
                        <span className="text-sm font-bold text-[var(--text-primary)]">Watch Video Pitch</span>
                      </div>
                      <ExternalLink size={16} />
                    </a>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-[var(--text-primary)]/10">
                <button
                  onClick={() => openConfirmation(selectedRequest._id, 'reject', selectedRequest.founderId?.name)}
                  className="px-6 py-2.5 rounded-xl border border-red-500/20 text-red-500 font-bold hover:bg-red-500 hover:text-white transition-colors"
                >
                  Decline
                </button>
                <button
                  onClick={() => openConfirmation(selectedRequest._id, 'accept', selectedRequest.founderId?.name)}
                  className="px-8 py-2.5 rounded-xl bg-[var(--color-primary)] text-white font-bold hover:bg-[var(--color-secondary)] transition-colors"
                >
                  Accept Request
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal (Existing) */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 w-full max-w-sm rounded-3xl p-8 shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${confirmModal.type === 'accept' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                  }`}>
                  {confirmModal.type === 'accept' ? <Check size={32} /> : <X size={32} />}
                </div>
                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                  {confirmModal.type === 'accept' ? 'Accept Request?' : 'Decline Request?'}
                </h3>
                <p className="text-[var(--text-secondary)]">
                  Are you sure you want to {confirmModal.type === 'accept' ? 'accept' : 'decline'} the request from <span className="font-bold text-[var(--text-primary)]">{confirmModal.founderName}</span>?
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={closeConfirmation}
                  className="flex-1 py-3 rounded-xl font-bold border border-[var(--text-primary)]/10 text-[var(--text-secondary)] hover:bg-[var(--text-primary)]/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAction}
                  className={`flex-1 py-3 rounded-xl font-bold text-white transition-all shadow-lg ${confirmModal.type === 'accept'
                    ? 'bg-green-500 hover:bg-green-600 shadow-green-500/20'
                    : 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
                    }`}
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MentorRequests;
