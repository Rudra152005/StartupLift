import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Save, Upload, Plus, Trash2, Users, Target, Lightbulb, User, FileText, Video, Link, Globe, Image as ImageIcon, Linkedin, Briefcase } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import axios from "../../api/axiosInstance";
import ReactPlayer from 'react-player';

const DashboardProfile = ({ onSave }) => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    startupName: "TechNova Solutions",
    website: "https://technova.io",
    stage: "MVP",
    description: "AI-powered analytics for small businesses.",
    problem: "Small businesses struggle to make data-driven decisions due to complex tools.",
    solution: "A simple, AI-driven dashboard that provides actionable insights in plain English.",
    marketSize: "10B",
    targetAudience: "SMEs in Retail and E-commerce",
    // New Fields
    detailedDescription: "",
    pitchDeck: "",
    videoPitch: "",
    thumbnail: "",
    linkedin: "",
    portfolio: ""
  });

  const [teamMembers, setTeamMembers] = useState([
    { name: user?.name, role: "Founder & CEO", avatar: user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}` }
  ]);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchStartupData = async () => {
      if (!user) return;
      try {
        const userId = user.id || user._id;

        // Fetch Startup Data
        const startupRes = await axios.get(`/startups/user/${userId}`);
        const data = startupRes.data;

        // Populate Form
        if (data) {
          setFormData(prev => ({
            ...prev,
            startupName: data.name || "",
            website: data.website || "",
            stage: data.category || "Idea",
            description: data.desc || "",
            problem: data.problem || "",
            solution: data.solution || "",
            marketSize: data.marketSize || "",
            targetAudience: data.targetAudience || "",
            detailedDescription: data.detailedDescription || "",
            pitchDeck: data.pitchDeck || "",
            videoPitch: data.videoPitch || "",
            thumbnail: data.image || ""
          }));

          if (data.teamMembers && data.teamMembers.length > 0) {
            setTeamMembers(data.teamMembers);
          }
        }

        // Fetch/Sync User Data (LinkedIn/Portfolio)
        // Since we don't have a direct "get user profile" that returns these specifically for non-mentors comfortably, 
        // we'll rely on the auth context 'user' object if it has them, or fetch from a general endpoint if available.
        // Assuming 'user' in context has these fields if they were populated on login. 
        // If not, we might need to fetch user details. Let's assume user object is up to date or we can fetch current user.
        // For now, initializing from user object.
        setFormData(prev => ({
          ...prev,
          linkedin: user.linkedin || "",
          portfolio: user.portfolio || ""
        }));

      } catch (err) {
        console.log("No existing startup profile found or error fetching.", err);
      }
    };

    fetchStartupData();
  }, [user?.id, user?._id]); // Fix: Dependency only on ID to prevent constant resets

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };

      setMessage(`Uploading ${field}...`);

      const response = await axios.post('/upload', formDataUpload, config);

      if (response.data.success) {
        setFormData(prev => ({ ...prev, [field]: response.data.url }));
        setMessage("✅ Upload successful");
      }
    } catch (error) {
      console.error("Upload failed", error);
      setMessage("❌ Upload failed");
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setMessage("");

    const payload = {
      userId: user.id || user._id,
      name: formData.startupName,
      website: formData.website,
      desc: formData.description,
      category: formData.stage,
      image: formData.thumbnail || "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=600",
      author: {
        name: user.name,
        role: "Founder",
        avatar: user.avatar || "https://i.pravatar.cc/150?u=" + (user.id || user._id)
      },
      // Extended Fields
      problem: formData.problem,
      solution: formData.solution,
      marketSize: formData.marketSize,
      targetAudience: formData.targetAudience,
      detailedDescription: formData.detailedDescription,
      pitchDeck: formData.pitchDeck,
      videoPitch: formData.videoPitch,
      teamMembers: teamMembers,

      // User Fields to Sync
      linkedin: formData.linkedin,
      portfolio: formData.portfolio,

      milestones: [],
      tasks: []
    };

    console.log("Saving payload:", payload); // Debug log

    try {
      await axios.post("/startups", payload);
      setMessage("✅ Profile saved!");

      // Update local user context if linkedin/portfolio changed
      if (updateUser) {
        updateUser({ ...user, linkedin: formData.linkedin, portfolio: formData.portfolio });
      }

      setTimeout(() => {
        if (onSave) onSave();
      }, 1500);

    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  // Deprecated in favor of generic handler but kept for compatibility if needed
  const handleImageUpload = (e) => handleFileUpload(e, 'thumbnail');

  const addTeamMember = () => {
    setTeamMembers([...teamMembers, { name: "", role: "", avatar: "" }]);
  };

  const removeTeamMember = (index) => {
    const newTeam = [...teamMembers];
    newTeam.splice(index, 1);
    setTeamMembers(newTeam);
  };

  const updateTeamMember = (index, field, value) => {
    const newTeam = [...teamMembers];
    newTeam[index][field] = value;
    setTeamMembers(newTeam);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 px-2"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">Startup Profile</h1>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1">Showcase your startup to mentors and investors.</p>
        </div>
        <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-lg">
          Profile 85% Complete
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT COLUMN: Main Info */}
        <div className="lg:col-span-2 space-y-8">

          {/* Basic Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[var(--bg-primary)]/50 backdrop-blur-xl border border-[var(--text-primary)]/10 rounded-2xl p-6 sm:p-8 shadow-sm"
          >
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
              <Upload size={20} className="text-[var(--color-primary)]" /> Basic Details
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--text-secondary)]">Startup Name</label>
                  <input
                    type="text"
                    value={formData.startupName}
                    onChange={(e) => setFormData({ ...formData, startupName: e.target.value })}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-primary)]/50 text-[var(--text-primary)]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--text-secondary)]">Stage</label>
                  <select
                    value={formData.stage}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-primary)]/50 text-[var(--text-primary)]"
                  >
                    <option value="Idea">Idea Phase</option>
                    <option value="MVP">MVP</option>
                    <option value="Growth">Growth</option>
                    <option value="Scale">Scale</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text-secondary)]">One-Liner Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-primary)]/50 text-[var(--text-primary)]"
                  placeholder="e.g. Airbnb for Pets"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-2">
                  <FileText size={16} /> Detailed Business Description
                </label>
                <textarea
                  value={formData.detailedDescription}
                  onChange={(e) => setFormData({ ...formData, detailedDescription: e.target.value })}
                  rows={6}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-primary)]/50 text-[var(--text-primary)] resize-none"
                  placeholder="Explain your business model, traction, and vision in detail..."
                />
              </div>
            </div>
          </motion.div>

          {/* Pitch Deck & Video */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[var(--bg-primary)]/50 backdrop-blur-xl border border-[var(--text-primary)]/10 rounded-2xl p-6 sm:p-8 shadow-sm"
          >
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
              <Video size={20} className="text-[var(--color-primary)]" /> Pitch Assets
            </h3>

            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-2">
                  <FileText size={16} /> Pitch Deck (PDF)
                </label>
                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                  <input
                    type="url"
                    value={formData.pitchDeck}
                    onChange={(e) => setFormData({ ...formData, pitchDeck: e.target.value })}
                    placeholder="Paste URL or upload..."
                    className="flex-1 bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-primary)]/50 text-[var(--text-primary)] text-sm"
                  />
                  <div className="relative">
                    <input
                      type="file"
                      id="deck-upload"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.ppt,.pptx"
                      onChange={(e) => handleFileUpload(e, 'pitchDeck')}
                    />
                    <label htmlFor="deck-upload" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[var(--text-primary)]/5 hover:bg-[var(--text-primary)]/10 px-4 py-3 rounded-xl cursor-pointer transition-colors text-sm font-bold border border-[var(--text-primary)]/10">
                      <Upload size={18} /> Upload
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-2">
                  <Video size={16} /> Video Pitch
                </label>

                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                  <input
                    type="url"
                    value={formData.videoPitch}
                    onChange={(e) => setFormData({ ...formData, videoPitch: e.target.value })}
                    placeholder="Paste YouTube Link or Upload Video..."
                    className="flex-1 bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-primary)]/50 text-[var(--text-primary)] text-sm"
                  />
                  <div className="relative">
                    <input
                      type="file"
                      id="video-upload"
                      className="hidden"
                      accept="video/*"
                      onChange={(e) => handleFileUpload(e, 'videoPitch')}
                    />
                    <label htmlFor="video-upload" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[var(--text-primary)]/5 hover:bg-[var(--text-primary)]/10 px-4 py-3 rounded-xl cursor-pointer transition-colors text-sm font-bold border border-[var(--text-primary)]/10">
                      <Upload size={18} /> Upload
                    </label>
                  </div>
                </div>

                {formData.videoPitch && (
                  <div className="mt-4 aspect-video rounded-xl overflow-hidden bg-black/50 border border-[var(--text-primary)]/10">
                    <div className="w-full h-full rounded-2xl overflow-hidden bg-black">
                      <ReactPlayer
                        url={formData.videoPitch}
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
                )}
              </div>
            </div>
          </motion.div>

          {/* Problem & Solution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-red-500/5 backdrop-blur-xl border border-red-500/10 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4 text-red-500">
                <Target size={20} />
                <h3 className="font-bold">The Problem</h3>
              </div>
              <textarea
                value={formData.problem}
                onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                rows={4}
                className="w-full bg-transparent border-none outline-none resize-none text-[var(--text-primary)] placeholder-red-500/30 font-medium"
                placeholder="What pain point are you solving?"
              />
            </div>
            <div className="bg-green-500/5 backdrop-blur-xl border border-green-500/10 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4 text-green-500">
                <Lightbulb size={20} />
                <h3 className="font-bold">The Solution</h3>
              </div>
              <textarea
                value={formData.solution}
                onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                rows={4}
                className="w-full bg-transparent border-none outline-none resize-none text-[var(--text-primary)] placeholder-green-500/30 font-medium"
                placeholder="How do you solve it?"
              />
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Sidebar - Links, Team, Market */}
        <div className="space-y-8">

          {/* Thumbnail Image */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[var(--bg-primary)]/50 backdrop-blur-xl border border-[var(--text-primary)]/10 rounded-2xl p-6 shadow-sm"
          >
            <label className="block text-sm font-bold text-[var(--text-secondary)] mb-4">Startup Thumbnail</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative w-full aspect-video rounded-xl bg-[var(--text-primary)]/5 border-2 border-dashed border-[var(--text-primary)]/20 hover:border-[var(--color-primary)] cursor-pointer flex flex-col items-center justify-center transition-colors group overflow-hidden"
            >
              {formData.thumbnail ? (
                <>
                  <img src={formData.thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-white font-medium flex items-center gap-2"><Upload size={16} /> Change Image</span>
                  </div>
                </>
              ) : (
                <div className="text-center p-4">
                  <ImageIcon size={32} className="mx-auto mb-2 text-[var(--text-secondary)] group-hover:text-[var(--color-primary)]" />
                  <p className="text-xs text-[var(--text-secondary)]">Click to upload thumbnail</p>
                </div>
              )}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>
          </motion.div>

          {/* Founder Profiles */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[var(--bg-primary)]/50 backdrop-blur-xl border border-[var(--text-primary)]/10 rounded-2xl p-6 shadow-sm"
          >
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <User size={18} /> Founder Profiles
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-2">
                  <Linkedin size={16} className="text-[#0077b5]" /> LinkedIn Profile
                </label>
                <input
                  type="url"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[var(--color-primary)]/50 text-[var(--text-primary)]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-2">
                  <Briefcase size={16} /> Portfolio URL
                </label>
                <input
                  type="url"
                  value={formData.portfolio}
                  onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                  placeholder="https://portfolio.com"
                  className="w-full bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[var(--color-primary)]/50 text-[var(--text-primary)]"
                />
              </div>

              <div className="space-y-2 border-t border-[var(--text-primary)]/5 pt-4">
                <label className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-2">
                  <Globe size={16} /> Startup Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[var(--color-primary)]/50 text-[var(--text-primary)]"
                />
              </div>
            </div>
          </motion.div>

          {/* Market Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[var(--bg-primary)]/50 backdrop-blur-xl border border-[var(--text-primary)]/10 rounded-2xl p-6 shadow-sm"
          >
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Market Info</h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-secondary)]">TAM</label>
                <input
                  type="text"
                  value={formData.marketSize}
                  onChange={(e) => setFormData({ ...formData, marketSize: e.target.value })}
                  placeholder="$10B"
                  className="w-full bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-secondary)]">Target Audience</label>
                <input
                  type="text"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  placeholder="Gen Z"
                  className="w-full bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]"
                />
              </div>
            </div>
          </motion.div>

          {/* Team */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[var(--bg-primary)]/50 backdrop-blur-xl border border-[var(--text-primary)]/10 rounded-2xl p-6 shadow-sm"
          >
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center justify-between">
              Team
              <button onClick={addTeamMember} className="text-[var(--color-primary)] p-1 hover:bg-[var(--color-primary)]/10 rounded">
                <Plus size={16} />
              </button>
            </h3>
            <div className="space-y-3">
              {teamMembers.map((member, index) => (
                <div key={index} className="flex gap-2 items-center text-sm">
                  <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden shrink-0">
                    {member.avatar ? <img src={member.avatar} className="w-full h-full object-cover" /> : <User size={16} className="m-2" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <input
                      value={member.name || ""}
                      onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                      className="w-full bg-transparent border-b border-transparent focus:border-[var(--color-primary)]/50 outline-none font-medium truncate text-sm"
                      placeholder="Name"
                    />
                    <input
                      value={member.role || ""}
                      onChange={(e) => updateTeamMember(index, 'role', e.target.value)}
                      className="w-full bg-transparent border-b border-transparent focus:border-[var(--color-primary)]/50 outline-none text-xs text-[var(--text-secondary)] truncate"
                      placeholder="Role"
                    />
                  </div>
                  {index > 0 && <button onClick={() => removeTeamMember(index)} className="text-red-400 hover:text-red-500"><Trash2 size={14} /></button>}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Save Floating Bar */}
      <div className="sticky bottom-4 z-10 px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center bg-[var(--bg-primary)]/90 backdrop-blur-xl border border-[var(--text-primary)]/10 rounded-2xl p-4 shadow-2xl max-w-2xl mx-auto gap-4">
          <div className="px-0 sm:px-4 text-center sm:text-left">
            <p className="text-[var(--text-primary)] font-bold text-sm">Unsaved Changes?</p>
            <p className={`font-medium text-[10px] sm:text-xs ${message.includes("Failed") ? "text-red-500" : "text-green-500"}`}>
              {message || "Make sure to save your progress."}
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[var(--color-primary)] text-white px-6 py-2.5 rounded-xl hover:bg-[var(--color-secondary)] transition-colors shadow-lg font-bold text-sm"
          >
            <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

    </div>
  );
};

export default DashboardProfile;
