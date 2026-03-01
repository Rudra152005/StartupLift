import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Video, Calendar, Clock, X, Send, DollarSign, BookOpen, CheckCircle, AlertCircle, Star, Eye, Linkedin, ExternalLink, Briefcase, MapPin } from "lucide-react";
import axios from "../../api/axiosInstance";
import { toast } from "react-toastify";
import RequestFormModal from "../common/RequestFormModal";

const DashboardMentors = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selection State
  const [selectedMentors, setSelectedMentors] = useState([]);

  // Modal State
  const [selectedMentor, setSelectedMentor] = useState(null); // specific mentor for single request (optional if using bulk)
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [requestType, setRequestType] = useState("Mentorship"); // 'Mentorship' or 'Funding'
  const [message, setMessage] = useState("");
  const [video, setVideo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [nextSession, setNextSession] = useState(null);

  // Rating Modal State
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [ratingTarget, setRatingTarget] = useState(null); // { id, name }
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingComment, setRatingComment] = useState("");

  // View Profile State
  const [viewingMentor, setViewingMentor] = useState(null);

  useEffect(() => {
    fetchMentors();
    fetchNextSession();
  }, []);

  const fetchNextSession = async () => {
    try {
      const response = await axios.get("/sessions");

      if (response.data.success) {
        // Find the next upcoming session
        const upcoming = response.data.data
          .filter(s => new Date(s.date) > new Date())
          .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

        setNextSession(upcoming);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };

  const fetchMentors = async () => {
    try {
      const response = await axios.get("/mentors");

      if (response.data.success) {
        setMentors(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching mentors:", error);
      toast.error("Failed to load mentors.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (mentorId) => {
    if (selectedMentors.includes(mentorId)) {
      setSelectedMentors(selectedMentors.filter(id => id !== mentorId));
    } else {
      setSelectedMentors([...selectedMentors, mentorId]);
    }
  };

  const handleRequest = async (e) => {
    e.preventDefault();

    // Determine target(s)
    let targets = [];
    if (isBulkMode) {
      targets = selectedMentors;
    } else if (selectedMentor) {
      targets = [selectedMentor._id];
    } else {
      return;
    }

    setIsSubmitting(true);
    try {
      const token = sessionStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const payload = {
        mentorIds: targets, // Backend now supports this
        mentorId: targets.length === 1 ? targets[0] : undefined, // Backward compatibility
        requestType,
        message,
        video,
        goals: requestType === "Funding" ? "Looking for investment" : "Career guidance"
      };

      const response = await axios.post("/mentors/request", payload);

      if (response.data.success) {
        const { success: successCount, failed: failedCount } = response.data.data || { success: [], failed: [] };

        if (successCount.length > 0) {
          toast.success(`Successfully sent ${successCount.length} request(s)!`);
        }
        if (failedCount.length > 0) {
          toast.info(`${failedCount.length} request(s) were skipped (already pending).`);
        }
      }

      // Reset UI
      setSelectedMentor(null);
      setIsBulkMode(false);
      setSelectedMentors([]); // clear selection
      setSelectedMentors([]); // clear selection
      setMessage("");
      setVideo("");

      // Refresh list to update statuses
      fetchMentors();

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to send request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModal = (mentor = null) => {
    if (mentor) {
      setSelectedMentor(mentor);
      setIsBulkMode(false);
    } else if (selectedMentors.length > 0) {
      setSelectedMentor(null);
      setIsBulkMode(true);
    } else {
      return;
    }
    setRequestType("Mentorship");
    setMessage("");
    setVideo("");
  };

  const handleDisconnect = async (e, mentorId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to remove this mentor? This will cancel your mentorship.")) return;

    try {
      // axiosInstance is configured to send the token automatically
      // const token = sessionStorage.getItem('token');
      // const config = { headers: { Authorization: `Bearer ${token}` } };

      const response = await axios.delete(`/mentors/connection/${mentorId}`);

      if (response.data.success) {
        toast.success("Mentor removed successfully.");
        fetchMentors(); // Refresh list
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to disconnect.");
    }
  };

  const openRatingModal = (e, mentor) => {
    e.stopPropagation();
    setRatingTarget({ id: mentor._id, name: mentor.name });
    setRatingValue(0);
    setRatingComment("");
    setRatingModalOpen(true);
  };

  const submitRating = async () => {
    if (ratingValue === 0) {
      toast.warning("Please select a rating.");
      return;
    }

    try {
      // axiosInstance is configured to send the token automatically
      const token = sessionStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const response = await axios.post(`/mentors/${ratingTarget.id}/rate`, {
        rating: ratingValue,
        comment: ratingComment
      }, config);

      if (response.data.success) {
        toast.success("Rating submitted! Thank you.");
        setRatingModalOpen(false);
        fetchMentors(); // Refresh to see updated rating if displayed
      }

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to submit rating.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 relative pb-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 px-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">Mentorship & Funding</h1>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1">Connect with industry experts or pitch assignments for funding.</p>
        </div>

        {/* Bulk Action Button */}
        <AnimatePresence>
          {selectedMentors.length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => openModal()}
              className="w-full sm:w-auto bg-[var(--color-primary)] text-white px-6 py-3 rounded-xl font-bold hover:bg-[var(--color-secondary)] transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              <Send size={18} />
              <span className="text-sm sm:text-base">Send Request ({selectedMentors.length})</span>
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Upcoming Session Banner */}
      {nextSession && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-[#06b6d4] to-[#3b82f6] rounded-[2.5rem] p-8 text-white shadow-[0_20px_50px_rgba(6,182,212,0.3)] relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-white/30 transition-all duration-1000"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-center justify-between gap-6 text-center md:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Session Avatar */}
              <div className="w-20 h-20 rounded-[1.5rem] border-2 border-white/20 overflow-hidden bg-white/10 shadow-lg">
                <Avatar src={nextSession.mentorId?.avatar} alt={nextSession.mentorId?.name} fontSize="text-2xl" />
              </div>
              <div>
                <div className="text-xs font-semibold bg-white/20 px-2 py-1 rounded inline-block mb-1">UPCOMING SESSION</div>
                <h3 className="text-xl font-bold">{nextSession.title}</h3>
                <p className="text-white/80 text-sm">with {nextSession.mentorId?.name} • {nextSession.mentorId?.jobTitle || "Expert Mentor"}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/10 px-6 py-3 rounded-xl backdrop-blur-md border border-white/20">
              <div className="text-center border-r border-white/20 pr-4">
                <Calendar size={18} className="mx-auto mb-1 opacity-80" />
                <span className="text-xs font-medium">{new Date(nextSession.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
              </div>
              <div className="text-center">
                <Clock size={18} className="mx-auto mb-1 opacity-80" />
                <span className="text-[10px] sm:text-xs font-medium">{new Date(nextSession.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              {nextSession.meetingLink && (
                <a
                  href={nextSession.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-2 bg-white text-[var(--color-primary)] p-2 rounded-full hover:bg-white/90 transition-colors flex items-center justify-center"
                  title="Join Meeting"
                >
                  <Video size={20} />
                </a>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Recommended Mentors */}
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Available Mentors</h2>

        {loading ? (
          <div className="text-center py-10 text-[var(--text-secondary)]">Loading mentors...</div>
        ) : mentors.length === 0 ? (
          <div className="text-center py-10 bg-[var(--bg-primary)]/50 rounded-2xl border border-[var(--text-primary)]/10">
            <p className="text-[var(--text-secondary)]">No mentors found. Invite some to join!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor, i) => (
              <motion.div
                key={mentor._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`group relative cinematic-glass border rounded-[2.5rem] p-8 flex flex-col items-center text-center transition-all duration-500 overflow-hidden
                    ${selectedMentors.includes(mentor._id) ? "border-emerald-500/50 shadow-[0_0_30px_rgba(34,211,238,0.2)]" : "border-white/5 hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] hover:border-emerald-500/20"}
                `}
                onClick={() => (!mentor.requestStatus || ['rejected', 'ended', 'completed'].includes(mentor.requestStatus)) && toggleSelection(mentor._id)}
              >
                {/* Selection Checkbox */}
                {(!mentor.requestStatus || ['rejected', 'ended', 'completed'].includes(mentor.requestStatus)) && (
                  <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer
                        ${selectedMentors.includes(mentor._id) ? "bg-[var(--color-primary)] border-[var(--color-primary)]" : "border-[var(--text-primary)]/20 group-hover:border-[var(--color-primary)]/50 bg-[var(--bg-primary)]"}
                    `}>
                    {selectedMentors.includes(mentor._id) && <CheckCircle size={14} className="text-white" />}
                  </div>
                )}

                {/* Status Badge */}
                {mentor.requestStatus && (
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold border
                        ${mentor.requestStatus === 'accepted'
                      ? "bg-green-500/10 text-green-500 border-green-500/20"
                      : mentor.requestStatus === 'rejected'
                        ? "bg-red-500/10 text-red-500 border-red-500/20"
                        : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                    }
                    `}>
                    {mentor.requestStatus.toUpperCase()}
                  </div>
                )}

                <div className="relative mb-6">
                  <div className="w-28 h-28 rounded-[1.75rem] overflow-hidden border-2 border-white/10 group-hover:border-emerald-500/40 transition-all duration-500 shadow-xl">
                    <Avatar src={mentor.avatar} alt={mentor.name} fontSize="text-4xl" />
                  </div>

                  {/* Rating Badge (Display) */}
                  {mentor.rating > 0 && (
                    <div className="absolute top-4 right-4 bg-yellow-400/10 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 border border-yellow-400/20 shadow-xl">
                      <Star size={12} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-xs font-bold text-yellow-400">{mentor.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-bold text-[var(--text-primary)] mt-2">{mentor.name}</h3>
                <p className="text-[var(--text-secondary)] text-sm mb-4">{mentor.role === 'Mentor' ? (mentor.jobTitle || 'Expert Mentor') : mentor.role}</p>

                {mentor.company && (
                  <p className="text-xs font-semibold text-[var(--color-primary)] mb-4">{mentor.company}</p>
                )}

                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {(mentor.expertise || []).slice(0, 3).map((skill, idx) => (
                    <span key={idx} className="text-xs bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 px-2 py-1 rounded text-[var(--text-secondary)]">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="mt-auto w-full space-y-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewingMentor(mentor);
                    }}
                    className="w-full py-2 rounded-xl text-sm font-medium border border-[var(--text-primary)]/10 hover:bg-[var(--text-primary)]/5 transition-colors flex items-center justify-center gap-2 text-[var(--text-primary)]"
                  >
                    <Eye size={16} /> View Profile
                  </button>

                  <button
                    onClick={(e) => openRatingModal(e, mentor)}
                    className="w-full py-2 rounded-xl text-sm font-medium border border-yellow-500/20 bg-yellow-500/5 text-yellow-600 hover:bg-yellow-500/10 transition-colors flex items-center justify-center gap-2"
                  >
                    <Star size={14} /> Rate Mentor
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // prevent card click
                      if (mentor.requestStatus === 'accepted') {
                        handleDisconnect(e, mentor._id);
                      } else if (!mentor.requestStatus || ['rejected', 'ended', 'completed'].includes(mentor.requestStatus)) {
                        openModal(mentor);
                      }
                    }}
                    disabled={mentor.requestStatus === 'pending'}
                    className={`w-full py-2.5 rounded-xl font-medium transition-all
                        ${mentor.requestStatus === 'accepted'
                        ? "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
                        : mentor.requestStatus === 'pending'
                          ? "bg-[var(--text-primary)]/5 text-[var(--text-secondary)] cursor-not-allowed opacity-70"
                          : "bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white"
                      }
                      `}
                  >
                    {mentor.requestStatus === 'accepted' ? 'Disconnect' : mentor.requestStatus === 'pending' ? 'Request Sent' : 'Connect / Pitch'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Request Modal */}
      <RequestFormModal
        isOpen={!!selectedMentor && !isBulkMode}
        onClose={() => setSelectedMentor(null)}
        mentor={selectedMentor}
        onSubmitSuccess={() => {
          setSelectedMentor(null);
          fetchMentors();
        }}
      />

      {/* Rating Modal */}
      <AnimatePresence>
        {ratingModalOpen && (
          <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm" onClick={() => setRatingModalOpen(false)}>
            <div className="h-full flex items-start justify-center pt-28 pb-8 px-4 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 w-full max-w-sm rounded-2xl p-5 sm:p-6 shadow-2xl text-center max-h-[calc(100vh-8rem)] overflow-y-auto mt-4"
              >
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Rate {ratingTarget?.name}</h3>
                <p className="text-[var(--text-secondary)] text-sm mb-6">How was your mentorship experience?</p>

                <div className="flex justify-center gap-2 mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRatingValue(star)}
                      className={`p-2 rounded-full transition-transform hover:scale-110 ${ratingValue >= star ? "text-yellow-500" : "text-gray-300"}`}
                    >
                      <Star size={32} fill="currentColor" />
                    </button>
                  ))}
                </div>

                <textarea
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  placeholder="Optional feedback..."
                  className="w-full bg-[var(--bg-primary)] px-4 py-2 rounded-xl border border-[var(--text-primary)]/10 mb-6 text-sm resize-none focus:outline-none focus:border-[var(--color-primary)]"
                  rows={3}
                />

                <div className="flex gap-3">
                  <button
                    onClick={() => setRatingModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl font-medium border border-[var(--text-primary)]/10 hover:bg-[var(--text-primary)]/5 text-[var(--text-secondary)]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitRating}
                    className="flex-1 py-2.5 rounded-xl font-medium bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90"
                  >
                    Submit
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
      {/* View Profile Modal */}
      <AnimatePresence>
        {viewingMentor && (
          <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md" onClick={() => setViewingMentor(null)}>
            <div className="h-full flex items-start justify-center pt-28 pb-8 px-4 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[calc(100vh-8rem)] overflow-y-auto mt-4"
              >
                {/* Header / Cover */}
                <div className="relative h-32 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]">
                  <button
                    onClick={() => setViewingMentor(null)}
                    className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-sm z-10"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="px-6 sm:px-8 pb-8 -mt-12 sm:-mt-16 relative z-10 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start">
                    {/* Avatar */}
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-[var(--bg-primary)] shadow-xl overflow-hidden bg-[var(--bg-primary)] shrink-0">
                      <Avatar src={viewingMentor.avatar} alt={viewingMentor.name} fontSize="text-4xl sm:text-5xl" />
                    </div>

                    {/* Header Info */}
                    <div className="pt-2 sm:pt-16 md:pt-2 flex-1 w-full">
                      <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start w-full">
                        <div className="w-full">
                          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] flex flex-wrap justify-center sm:justify-start items-center gap-2">
                            {viewingMentor.name}
                            {viewingMentor.rating > 0 && (
                              <span className="text-xs font-medium bg-yellow-400/10 text-yellow-500 px-2 py-0.5 rounded-full border border-yellow-400/20 flex items-center gap-1">
                                <Star size={12} fill="currentColor" /> {viewingMentor.rating.toFixed(1)}
                              </span>
                            )}
                          </h2>
                          <p className="text-[var(--text-secondary)] font-medium text-base sm:text-lg mt-1">{viewingMentor.jobTitle || viewingMentor.role}</p>
                          <div className="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-4 mt-3 text-xs sm:text-sm text-[var(--text-secondary)]">
                            {viewingMentor.company && (
                              <span className="flex items-center gap-1.5"><Briefcase size={14} /> {viewingMentor.company}</span>
                            )}
                            {viewingMentor.location && (
                              <span className="flex items-center gap-1.5"><MapPin size={14} /> {viewingMentor.location}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="mt-8 space-y-8">
                    {/* Bio */}
                    {viewingMentor.bio && (
                      <div>
                        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">About</h3>
                        <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">{viewingMentor.bio}</p>
                      </div>
                    )}

                    {/* Expertise */}
                    <div>
                      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3">Expertise</h3>
                      <div className="flex flex-wrap gap-2">
                        {(viewingMentor.expertise || []).map((skill, i) => (
                          <span key={i} className="px-3 py-1.5 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium text-sm border border-[var(--color-primary)]/20">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="bg-[var(--bg-secondary)]/50 p-4 rounded-2xl border border-[var(--text-primary)]/5">
                        <div className="text-[var(--text-secondary)] text-xs font-bold uppercase tracking-wider mb-1">Experience</div>
                        <div className="text-xl font-bold text-[var(--text-primary)]">{viewingMentor.yearsExperience || 0}+ Years</div>
                      </div>
                      {viewingMentor.fundingRaised && (
                        <div className="bg-[var(--bg-secondary)]/50 p-4 rounded-2xl border border-[var(--text-primary)]/5">
                          <div className="text-[var(--text-secondary)] text-xs font-bold uppercase tracking-wider mb-1">Funding Raised</div>
                          <div className="text-xl font-bold text-green-500">{viewingMentor.fundingRaised}</div>
                        </div>
                      )}
                      <div className="bg-[var(--bg-secondary)]/50 p-4 rounded-2xl border border-[var(--text-primary)]/5">
                        <div className="text-[var(--text-secondary)] text-xs font-bold uppercase tracking-wider mb-1">Response Rate</div>
                        <div className="text-xl font-bold text-[var(--text-primary)]">High</div>
                      </div>
                    </div>

                    {/* Testimonials */}
                    {viewingMentor.testimonials && viewingMentor.testimonials.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3">What Founders Say</h3>
                        <div className="space-y-4">
                          {viewingMentor.testimonials.map((t, i) => (
                            <div key={i} className="bg-[var(--bg-secondary)]/30 p-4 rounded-xl border border-[var(--text-primary)]/5">
                              <p className="italic text-[var(--text-secondary)] mb-3">"{t.text}"</p>
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center font-bold text-xs">
                                  {t.author[0]}
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-[var(--text-primary)]">{t.author}</div>
                                  <div className="text-xs text-[var(--text-secondary)]">{t.role}, {t.company}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Links */}
                    {(viewingMentor.linkedin || viewingMentor.portfolio) && (
                      <div className="flex gap-3 pt-4 border-t border-[var(--text-primary)]/10">
                        {viewingMentor.linkedin && (
                          <a href={viewingMentor.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-emerald-500 hover:underline font-medium">
                            <Linkedin size={18} /> LinkedIn Profile
                          </a>
                        )}
                        {viewingMentor.portfolio && (
                          <a href={viewingMentor.portfolio} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[var(--color-primary)] hover:underline font-medium">
                            <ExternalLink size={18} /> Portfolio / Website
                          </a>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => {
                        if (!viewingMentor.requestStatus || ['rejected', 'ended', 'completed'].includes(viewingMentor.requestStatus)) {
                          setViewingMentor(null);
                          openModal(viewingMentor);
                        }
                      }}
                      disabled={viewingMentor.requestStatus === 'pending' || viewingMentor.requestStatus === 'accepted'}
                      className={`w-full py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all shadow-lg
                      ${viewingMentor.requestStatus === 'accepted'
                          ? "bg-green-500/10 text-green-500 cursor-default"
                          : viewingMentor.requestStatus === 'pending'
                            ? "bg-[var(--text-primary)]/10 text-[var(--text-secondary)] cursor-not-allowed"
                            : "bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)] hover:scale-[1.02]"
                        }`}
                    >
                      {viewingMentor.requestStatus === 'accepted'
                        ? "Connected"
                        : viewingMentor.requestStatus === 'pending'
                          ? "Request Pending"
                          : "Send Mentorship Request"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper Component for Avatar
const Avatar = ({ src, alt, className = "", fontSize = "text-xl" }) => {
  const [error, setError] = useState(false);

  // Normalize URL
  let imageUrl = src;
  if (src && !src.startsWith("http") && !src.startsWith("data:")) {
    // Attempt to prepend backend URL if it looks like a relative path
    // Remove leading slash if present to avoid double slash if needed, or backend handles it.
    // Assuming uploads are served from root
    imageUrl = `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/${src.startsWith('/') ? src.slice(1) : src}`;
  }

  if (!src || error) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold ${fontSize}`}>
        {alt?.charAt(0)?.toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={`w-full h-full object-cover ${className}`}
      onError={() => setError(true)}
    />
  );
};

export default DashboardMentors;
