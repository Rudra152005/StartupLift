import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Save, Camera, Briefcase, Award, X, LinkIcon, Upload, User, MapPin, Clock, CheckCircle, Globe, DollarSign, Rocket } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from '../../api/axiosInstance';

const MentorProfile = () => {
  const { user, updateUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [profileData, setProfileData] = useState(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    jobTitle: "",
    headline: "",
    company: "",
    location: "",
    yearsExperience: 0,
    bio: "",
    expertise: [],
    linkedin: "",
    portfolio: "",
    fundingRaised: ""
  });

  // Load profile data when component mounts
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await axios.get("/mentors/profile");

        if (response.data.success && response.data.user) {
          const userData = response.data.user;
          setProfileData(userData);
          setFormData({
            jobTitle: userData.jobTitle || "",
            headline: userData.headline || "",
            company: userData.company || "",
            location: userData.location || "",
            yearsExperience: userData.yearsExperience || 0,
            bio: userData.bio || "",
            expertise: userData.expertise || [],
            linkedin: userData.linkedin || "",
            portfolio: userData.portfolio || "",
            fundingRaised: userData.fundingRaised || ""
          });
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        setMessage("Note: Using local data or failed to fetch");
      }
    };

    loadProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const response = await axios.put(
        "/mentors/profile",
        formData
      );

      if (response.data.success) {
        setMessage("✅ Profile updated successfully!");
        if (response.data.user) {
          setProfileData(response.data.user);
        }
        if (updateUser) {
          updateUser(response.data.user);
        }
      } else {
        setMessage("❌ " + (response.data.message || "Failed to save."));
      }
    } catch (err) {
      console.error('Save error:', err);
      setMessage("❌ Failed to save. Check console for details.");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setMessage("❌ Please upload a valid image (JPEG, PNG, GIF, WebP)");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("❌ Image size should be less than 5MB");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    setUploading(true);
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };

      // 1. Upload File
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const uploadResponse = await axios.post("/upload", uploadFormData, config);

      if (!uploadResponse.data.success) {
        throw new Error("Upload failed");
      }

      const uploadedUrl = uploadResponse.data.url;

      // 2. Update Profile with new URL
      // Use JSON content type for the profile update
      const response = await axios.put(
        "/mentors/profile",
        { avatar: uploadedUrl }
      );

      if (response.data.success) {
        setMessage("✅ Avatar updated successfully!");
        if (updateUser && response.data.user) {
          updateUser(response.data.user);
          setProfileData(response.data.user);
        }
      }

      // Clear file input
      if (fileInputRef.current) fileInputRef.current.value = '';

    } catch (err) {
      console.error('Avatar upload error:', err);
      setMessage("❌ Failed to upload avatar.");
    } finally {
      setUploading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleTagInput = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = e.target.value.trim();
      if (val && !formData.expertise.includes(val)) {
        setFormData(prev => ({ ...prev, expertise: [...prev.expertise, val] }));
        e.target.value = '';
      }
    }
  };

  const removeTag = (tag) => {
    setFormData(prev => ({ ...prev, expertise: prev.expertise.filter(t => t !== tag) }));
  };

  const currentAvatar = profileData?.avatar || user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || "Mentor"}&background=6366f1&color=fff&bold=true`;

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-4 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] bg-gradient-to-r from-[var(--color-primary)] to-purple-600 bg-clip-text text-transparent">
            Mentor Profile
          </h1>
          <p className="text-[var(--text-secondary)] mt-2 max-w-2xl">
            Build trust with startups by showcasing your verified experience and success stories.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {message && (
            <div className={`px-4 py-2 rounded-lg ${message.includes('✅') ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
              <span className="text-sm font-medium">{message}</span>
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-[var(--color-primary)] to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
          >
            {saving ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Save size={20} />}
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar: Avatar, Highlights & Stats */}
        <div className="lg:col-span-4 space-y-6">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[var(--bg-primary)]/50 backdrop-blur-xl border border-[var(--text-primary)]/10 rounded-3xl p-6 text-center shadow-xl relative overflow-hidden"
          >
            {/* Verified Badge */}
            {profileData?.isVerified && (
              <div className="absolute top-4 right-4 bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle size={12} fill="currentColor" /> Verified Mentor
              </div>
            )}

            <div className="relative w-40 h-40 mx-auto mb-6 group cursor-pointer" onClick={handleAvatarClick}>
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)] to-purple-600 rounded-full blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <img
                src={currentAvatar}
                alt="Profile"
                className="relative w-full h-full rounded-full object-cover border-4 border-white/20 shadow-2xl z-10"
                onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${user?.name || "Mentor"}&background=6366f1&color=fff&bold=true`; }}
              />
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <Camera size={28} className="text-white" />
              </div>
              <input type="file" ref={fileInputRef} accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </div>

            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-1">{user?.name || "Mentor Name"}</h2>

            {/* Display Headline/Title */}
            <p className="text-[var(--color-primary)] font-medium mb-1">
              {formData.headline || formData.jobTitle || "Add your headline"}
            </p>
            <p className="text-[var(--text-secondary)] text-sm mb-4">
              {formData.location || "Add Location"}
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="bg-[var(--bg-primary)] p-3 rounded-2xl border border-[var(--text-primary)]/5">
                <p className="text-2xl font-bold text-[var(--text-primary)]">{profileData?.stats?.totalSessions || 0}</p>
                <p className="text-xs text-[var(--text-secondary)]">Sessions</p>
              </div>
              <div className="bg-[var(--bg-primary)] p-3 rounded-2xl border border-[var(--text-primary)]/5">
                <p className="text-2xl font-bold text-[var(--text-primary)]">{profileData?.stats?.startupsMentored || 0}</p>
                <p className="text-xs text-[var(--text-secondary)]">Startups</p>
              </div>
              {profileData?.stats?.rating > 0 && (
                <div className="bg-[var(--bg-primary)] p-3 rounded-2xl border border-[var(--text-primary)]/5 col-span-2">
                  <div className="flex items-center justify-center gap-1 text-yellow-500 font-bold text-xl">
                    {profileData.stats.rating.toFixed(1)} <Award size={20} fill="currentColor" />
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">Mentor Rating</p>
                </div>
              )}
            </div>

            {/* Funding Raised Highlight */}
            {formData.fundingRaised && (
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-teal-500/10 border border-green-500/20">
                <p className="text-sm text-green-600 font-medium">💰 Funding Helped Raise</p>
                <p className="text-xl font-bold text-[var(--text-primary)] mt-1">{formData.fundingRaised}</p>
              </div>
            )}

            {/* Startups Mentored List */}
            {profileData?.stats?.startupNames?.length > 0 && (
              <div className="mt-4 text-left">
                <p className="text-sm font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wide">Startups Mentored</p>
                <div className="flex flex-wrap gap-2">
                  {profileData.stats.startupNames.map((name, i) => (
                    <span key={i} className="px-2 py-1 text-xs font-medium bg-[var(--text-primary)]/5 rounded text-[var(--text-primary)]">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* About & Expertise Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[var(--bg-primary)]/50 backdrop-blur-xl border border-[var(--text-primary)]/10 rounded-3xl p-6 shadow-sm space-y-6"
          >
            {/* About */}
            <div>
              <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wide mb-3 flex items-center gap-2">
                <User size={14} /> About Me
              </h3>
              <p className="text-sm text-[var(--text-primary)] leading-relaxed">
                {profileData?.bio || "No bio added yet."}
              </p>
            </div>

            {/* Expertise */}
            {profileData?.expertise?.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Award size={14} /> Expertise
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profileData.expertise.map((tag, i) => (
                    <span key={i} className="px-3 py-1 text-xs font-medium bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full border border-[var(--color-primary)]/20">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Social Links */}
            {(profileData?.linkedin || profileData?.portfolio) && (
              <div>
                <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wide mb-3 flex items-center gap-2">
                  <LinkIcon size={14} /> Socials
                </h3>
                <div className="flex flex-col gap-2">
                  {profileData?.linkedin && (
                    <a href={profileData.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[#0077b5] hover:underline p-2 rounded-lg hover:bg-[#0077b5]/5 transition-colors">
                      <LinkIcon size={14} /> LinkedIn Profile
                    </a>
                  )}
                  {profileData?.portfolio && (
                    <a href={profileData.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[var(--text-primary)] hover:underline p-2 rounded-lg hover:bg-[var(--text-primary)]/5 transition-colors">
                      <Globe size={14} /> Portfolio / Website
                    </a>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Col: Edit Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-8 space-y-6"
        >
          {/* Basic Info Card */}
          <div className="bg-[var(--bg-primary)]/50 backdrop-blur-xl border border-[var(--text-primary)]/10 rounded-3xl p-8 shadow-xl">
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2 border-b border-[var(--text-primary)]/10 pb-4">
              <User className="text-[var(--color-primary)]" /> Professional Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text-secondary)]">Profile Headline</label>
                <input
                  type="text"
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  placeholder="e.g. Startup Growth Advisor | Ex-Google"
                  className="w-full bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] text-[var(--text-primary)]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text-secondary)]">Current Role / Title</label>
                <input
                  type="text"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  placeholder="e.g. Senior Product Manager"
                  className="w-full bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] text-[var(--text-primary)]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text-secondary)]">Company / Organization</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="e.g. Google, Microsoft"
                  className="w-full bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] text-[var(--text-primary)]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text-secondary)]">Location</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. San Francisco, CA"
                    className="w-full bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[var(--color-primary)] text-[var(--text-primary)]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text-secondary)]">Years of Experience</label>
                <div className="relative">
                  <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input
                    type="number"
                    value={formData.yearsExperience}
                    onChange={(e) => setFormData({ ...formData, yearsExperience: parseInt(e.target.value) || 0 })}
                    placeholder="e.g. 8"
                    className="w-full bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[var(--color-primary)] text-[var(--text-primary)]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text-secondary)]">Funding Helped Raise (Optional)</label>
                <div className="relative">
                  <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input
                    type="text"
                    value={formData.fundingRaised}
                    onChange={(e) => setFormData({ ...formData, fundingRaised: e.target.value })}
                    placeholder="e.g. ₹8 Cr / $1.2M"
                    className="w-full bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[var(--color-primary)] text-[var(--text-primary)]"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">About</label>
              <textarea
                rows={4}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] text-[var(--text-primary)] resize-none"
                placeholder="Share your journey, mentorship style, and what founders can expect from you..."
              />
            </div>
          </div>

          {/* Expertise & Links */}
          <div className="bg-[var(--bg-primary)]/50 backdrop-blur-xl border border-[var(--text-primary)]/10 rounded-3xl p-8 shadow-xl">
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2 border-b border-[var(--text-primary)]/10 pb-4">
              <Award className="text-[var(--color-primary)]" /> Expertise & Socials
            </h3>

            <div className="space-y-4 mb-6">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Domain Expertise</label>
              <div className="flex flex-wrap gap-2 p-4 rounded-xl bg-[var(--bg-primary)]/30 border border-[var(--text-primary)]/5 min-h-[60px]">
                {formData.expertise.map((tag, i) => (
                  <span key={i} className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-3 py-1.5 rounded-full text-sm font-medium border border-[var(--color-primary)]/20 flex items-center gap-1 group">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="group-hover:text-red-500 transition-colors"><X size={14} /></button>
                  </span>
                ))}
                <input
                  type="text"
                  onKeyDown={handleTagInput}
                  placeholder="Add skill + Enter"
                  className="bg-transparent outline-none flex-1 min-w-[120px] text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-1">
                  LinkedIn URL <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0077b5]" />
                  <input
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[var(--color-primary)] text-[var(--text-primary)]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-1">
                  Portfolio / Website <span className="text-[var(--text-secondary)]/50 text-xs">(Optional)</span>
                </label>
                <div className="relative">
                  <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input
                    type="url"
                    value={formData.portfolio}
                    onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                    placeholder="https://yourwebsite.com"
                    className="w-full bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[var(--color-primary)] text-[var(--text-primary)]"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MentorProfile;
