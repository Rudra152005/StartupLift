import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, MoreVertical, X, MapPin, Users, TrendingUp, ExternalLink, Calendar, Video, FileText, Download, Linkedin, Briefcase, Globe, DollarSign } from 'lucide-react';
import axios from '../../api/axiosInstance';
import PaymentModal from '../payment/PaymentModal';
import ReactPlayer from 'react-player';

const MentorStartups = () => {
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    fetchMyStartups();
  }, []);

  const fetchMyStartups = async () => {
    try {
      const response = await axios.get("/mentors/my-startups");

      if (response.data.success) {
        const fundedStartups = response.data.data.filter(s => s.requestType === 'Funding');
        setStartups(fundedStartups);
      }
    } catch (error) {
      console.error("Error fetching startups:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStartup = async (founderId) => {
    if (!window.confirm("Are you sure you want to remove this startup from your mentorship? This action cannot be undone.")) return;

    try {
      const response = await axios.delete(`/mentors/connection/${founderId}`);

      if (response.data.success) {
        alert("Startup removed successfully.");
        setSelectedStartup(null);
        fetchMyStartups(); // Refresh list
      }
    } catch (error) {
      console.error("Error removing startup:", error);
      alert("Failed to remove startup.");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">My Startups</h2>
        <p className="text-[var(--text-secondary)]">Startups you are currently mentoring.</p>
      </div>

      {loading ? (
        <div className="text-center py-10 text-[var(--text-secondary)]">Loading startups...</div>
      ) : startups.length === 0 ? (
        <div className="text-center py-10 bg-[var(--bg-primary)]/50 rounded-2xl border border-[var(--text-primary)]/10">
          <p className="text-[var(--text-secondary)]">No startups yet. Accept mentorship requests to see them here!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {startups.map((startup, i) => (
            <motion.div
              key={startup._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group bg-[var(--bg-primary)]/50 border border-[var(--text-primary)]/10 backdrop-blur-xl rounded-2xl p-6 hover:border-[var(--color-primary)]/30 hover:shadow-xl transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center">
                  {startup.image ? (
                    <img src={startup.image} alt={startup.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-xl flex items-center justify-center text-white font-bold text-lg">
                      {startup.name.charAt(0)}
                    </div>
                  )}
                </div>
                <button className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                  <MoreVertical size={20} />
                </button>
              </div>

              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1 break-words">{startup.name}</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-4">{startup.category}</p>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-[var(--text-secondary)]">Readiness Score</span>
                  <span className="text-[var(--color-primary)]">{startup.readinessScore || 0}%</span>
                </div>
                <div className="w-full h-1.5 bg-[var(--text-primary)]/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--color-primary)] rounded-full" style={{ width: `${startup.readinessScore || 0}%` }}></div>
                </div>
              </div>

              <div className="bg-[var(--text-primary)]/5 rounded-lg p-3 mb-4">
                <p className="text-xs text-[var(--text-secondary)] font-medium uppercase mb-1">Description</p>
                <p className="text-sm font-semibold text-[var(--text-primary)] line-clamp-2 break-words">{startup.desc || "No description"}</p>
              </div>

              <button
                onClick={() => setSelectedStartup(startup)}
                className="w-full py-2 rounded-lg border border-[var(--text-primary)]/10 text-[var(--text-primary)] font-medium hover:bg-[var(--color-primary)] hover:text-white hover:border-transparent transition-all flex items-center justify-center gap-2"
              >
                View Details <ArrowRight size={16} />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Startup Detail Modal */}
      <AnimatePresence>
        {selectedStartup && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[var(--bg-primary)] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              {/* Header */}
              <div className="relative p-8 pb-6 border-b border-[var(--text-primary)]/10">
                <button
                  onClick={() => setSelectedStartup(null)}
                  className="absolute top-6 right-6 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-2 hover:bg-[var(--text-primary)]/5 rounded-full"
                >
                  <X size={24} />
                </button>

                <div className="flex items-start gap-4 mb-6">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0">
                    {selectedStartup.image ? (
                      <img src={selectedStartup.image} alt={selectedStartup.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white font-bold text-3xl">
                        {selectedStartup.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-2 break-words">{selectedStartup.name}</h2>
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <span className="px-3 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full text-sm font-medium">
                        {selectedStartup.category}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Readiness Progress */}
                <div className="bg-gradient-to-r from-[var(--color-primary)]/5 to-transparent rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-[var(--text-secondary)]">Readiness Score</span>
                    <span className="text-2xl font-bold text-[var(--color-primary)]">{selectedStartup.readinessScore || 0}%</span>
                  </div>
                  <div className="w-full h-2 bg-[var(--text-primary)]/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${selectedStartup.readinessScore || 0}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full"
                    ></motion.div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                    <div className="w-1 h-5 bg-[var(--color-primary)] rounded-full"></div>
                    About
                  </h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    {selectedStartup.desc || "No description available for this startup."}
                  </p>
                </div>

                {/* Additional Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedStartup.stage && (
                    <div className="bg-[var(--text-primary)]/5 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <TrendingUp size={20} className="text-[var(--color-primary)]" />
                        <span className="text-sm text-[var(--text-secondary)]">Stage</span>
                      </div>
                      <p className="font-bold text-[var(--text-primary)]">{selectedStartup.stage}</p>
                    </div>
                  )}

                  {selectedStartup.location && (
                    <div className="bg-[var(--text-primary)]/5 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <MapPin size={20} className="text-[var(--color-primary)]" />
                        <span className="text-sm text-[var(--text-secondary)]">Location</span>
                      </div>
                      <p className="font-bold text-[var(--text-primary)]">{selectedStartup.location}</p>
                    </div>
                  )}

                  {selectedStartup.teamSize && (
                    <div className="bg-[var(--text-primary)]/5 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Users size={20} className="text-[var(--color-primary)]" />
                        <span className="text-sm text-[var(--text-secondary)]">Team Size</span>
                      </div>
                      <p className="font-bold text-[var(--text-primary)]">{selectedStartup.teamSize} members</p>
                    </div>
                  )}

                  {selectedStartup.founded && (
                    <div className="bg-[var(--text-primary)]/5 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar size={20} className="text-[var(--color-primary)]" />
                        <span className="text-sm text-[var(--text-secondary)]">Founded</span>
                      </div>
                      <p className="font-bold text-[var(--text-primary)]">{selectedStartup.founded}</p>
                    </div>
                  )}
                </div>

                {/* Website Link */}
                {selectedStartup.website && (
                  <div className="pt-4 border-t border-[var(--text-primary)]/10">
                    <a
                      href={selectedStartup.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:text-[var(--color-secondary)] font-medium transition-colors"
                    >
                      <ExternalLink size={18} />
                      Visit Website
                    </a>
                  </div>
                )}
              </div>

              {/* REORGANIZED CONTENT: Desc -> PDF -> Video -> Links -> Team */}
              <div className="px-8 pb-8 space-y-8">

                {/* 1. Detailed Description */}
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                    <span className="w-1 h-5 bg-[var(--color-primary)] rounded-full"></span>
                    About the Project
                  </h3>
                  <p className="text-[var(--text-primary)]/80 leading-relaxed whitespace-pre-wrap">
                    {selectedStartup.detailedDescription || selectedStartup.desc}
                  </p>
                </div>

                {/* 2. Pitch Deck (PDF) */}
                {selectedStartup.pitchDeck && (
                  <div className="bg-[var(--text-primary)]/5 rounded-2xl p-6 border border-[var(--text-primary)]/10 flex items-center justify-between group hover:bg-[var(--text-primary)]/10 transition-colors cursor-pointer" onClick={() => window.open(selectedStartup.pitchDeck, '_blank')}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center">
                        <FileText size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-[var(--text-primary)]">Pitch Deck</h4>
                        <p className="text-xs text-[var(--text-secondary)]">View detailed presentation PDF</p>
                      </div>
                    </div>
                    <ExternalLink size={20} className="text-[var(--text-secondary)] group-hover:text-[var(--color-primary)] transition-colors" />
                  </div>
                )}

                {/* 3. Video Pitch */}
                {selectedStartup.videoPitch && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                      <Video size={20} className="text-[var(--color-primary)]" /> Video Pitch
                    </h3>
                    <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black/50 border border-[var(--text-primary)]/10 shadow-lg">
                      <div className="w-full h-full rounded-2xl overflow-hidden bg-black">
                        <ReactPlayer
                          url={selectedStartup.videoPitch}
                          width="100%"
                          height="100%"
                          controls
                          light={true}
                          playing={false}
                          className="react-player"
                          config={{
                            youtube: {
                              playerVars: { origin: window.location.origin }
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Connect Links (Website, LinkedIn, Portfolio) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selectedStartup.website && (
                    <a href={selectedStartup.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-[var(--bg-primary)] p-4 rounded-xl border border-[var(--text-primary)]/10 hover:border-[var(--color-primary)]/50 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <Globe size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-[var(--text-secondary)]">Website</p>
                        <p className="font-bold text-[var(--text-primary)] text-sm truncate">Visit Site</p>
                      </div>
                    </a>
                  )}
                  {selectedStartup.linkedin && (
                    <a href={selectedStartup.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-[var(--bg-primary)] p-4 rounded-xl border border-[var(--text-primary)]/10 hover:border-[#0077b5]/50 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-[#0077b5]/10 text-[#0077b5] flex items-center justify-center">
                        <Linkedin size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-[var(--text-secondary)]">LinkedIn</p>
                        <p className="font-bold text-[var(--text-primary)] text-sm truncate">Connect</p>
                      </div>
                    </a>
                  )}
                  {selectedStartup.portfolio && (
                    <a href={selectedStartup.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-[var(--bg-primary)] p-4 rounded-xl border border-[var(--text-primary)]/10 hover:border-purple-500/50 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                        <Briefcase size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-[var(--text-secondary)]">Portfolio</p>
                        <p className="font-bold text-[var(--text-primary)] text-sm truncate">View Work</p>
                      </div>
                    </a>
                  )}
                </div>

                {/* 5. Team & Strategy */}
                <div className="border-t border-[var(--text-primary)]/10 pt-8 space-y-8">
                  {/* Team */}
                  {selectedStartup.teamMembers && selectedStartup.teamMembers.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <Users size={20} className="text-[var(--color-primary)]" /> meet the Team
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {selectedStartup.teamMembers.map((member, idx) => (
                          <div key={idx} className="flex items-center gap-3 bg-[var(--bg-primary)] p-3 rounded-xl border border-[var(--text-primary)]/5">
                            <div className="w-10 h-10 rounded-full bg-[var(--text-primary)]/10 flex items-center justify-center overflow-hidden">
                              {member.avatar ? <img src={member.avatar} className="w-full h-full object-cover" /> : <Users size={16} />}
                            </div>
                            <div>
                              <p className="font-bold text-[var(--text-primary)] text-sm">{member.name || "Team Member"}</p>
                              <p className="text-xs text-[var(--text-secondary)]">{member.role || "Role"}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Problem/Solution */}
                  <div className="grid grid-cols-1 gap-4">
                    {selectedStartup.problem && (
                      <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-5">
                        <h4 className="font-bold text-red-500 mb-2 flex items-center gap-2">⚠️ The Problem</h4>
                        <p className="text-[var(--text-primary)]/80 text-sm leading-relaxed">{selectedStartup.problem}</p>
                      </div>
                    )}
                    {selectedStartup.solution && (
                      <div className="bg-green-500/5 border border-green-500/10 rounded-2xl p-5">
                        <h4 className="font-bold text-green-600 mb-2 flex items-center gap-2">💡 The Solution</h4>
                        <p className="text-[var(--text-primary)]/80 text-sm leading-relaxed">{selectedStartup.solution}</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-[var(--text-primary)]/10 bg-[var(--text-primary)]/5 flex gap-4">
                <button
                  onClick={() => handleRemoveStartup(selectedStartup.userId)}
                  className="flex-1 bg-red-500/10 text-red-500 border border-red-500/20 py-3 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all"
                >
                  Remove Startup
                </button>
                <button
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="flex-1 bg-green-500/10 text-green-500 border border-green-500/20 py-3 rounded-xl font-bold hover:bg-green-500 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <DollarSign size={20} /> Fund Startup
                </button>
                <button
                  onClick={() => setSelectedStartup(null)}
                  className="flex-1 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        recipient={selectedStartup}
        onSuccess={() => {
          fetchMyStartups(); // Refresh to potentially show funded status if we added that, or just generic refresh
        }}
      />
    </div>
  );
};

export default MentorStartups;
