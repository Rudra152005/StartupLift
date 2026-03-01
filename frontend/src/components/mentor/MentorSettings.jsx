import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, User, Building2, Link as LinkIcon, Mail, Phone, Upload, X, Shield, Key, Eye, EyeOff, Bell, Palette, Monitor, Camera, Smartphone, Settings, Lock } from 'lucide-react';
import axios from '../../api/axiosInstance';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const MentorSettings = ({ user: initialUser }) => {
  const { t } = useTranslation();
  const { setUserData } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(initialUser);

  // Get theme context for global theme management
  const { theme: globalTheme, setTheme: setGlobalTheme, language: globalLanguage, setLanguage: setGlobalLanguage } = useTheme();

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: '',
    avatar: '',
    bio: '',
    expertise: [],
    yearsExperience: 0,
    linkedin: '',
    phone: '',
    jobTitle: '',
    company: '',
    authMethod: 'local',
    hasPassword: true
  });

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [validationErrors, setValidationErrors] = useState({});

  // Password Visibility State
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Settings States
  const [notifications, setNotifications] = useState({
    mentorRequests: true,
    sessionReminders: true,
    newReviews: true,
    platformUpdates: true,
    marketingEmails: false,
    requestStatusUpdates: true,
    investmentAlerts: false
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: "Public",
    showEmail: false,
    showPhone: false
  });

  const [preferences, setPreferences] = useState({
    theme: "Dark",
    language: "en"
  });

  // Local state for immediate UI updates (separate from preferences to ensure reactivity)
  const [currentTheme, setCurrentTheme] = useState(preferences?.theme || "Dark");
  const [currentLanguage, setCurrentLanguage] = useState(preferences?.language || "en");

  // Active Sessions State
  const [activeSessions, setActiveSessions] = useState([]);

  // Fetch Sessions when tab is active
  useEffect(() => {
    if (activeSection === 'sessions') {
      fetchSessions();
    }
  }, [activeSection]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/auth/sessions');
      if (res.data.success) {
        setActiveSessions(res.data.sessions);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
      toast.error("Failed to load active sessions");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutSession = async (sessionId) => {
    try {
      const res = await axios.delete(`/auth/sessions/${sessionId}`);
      if (res.data.success) {
        toast.success("Session logged out successfully");
        fetchSessions(); // Refresh list
      }
    } catch (error) {
      console.error("Error logging out session:", error);
      toast.error("Failed to log out session");
    }
  };

  // Fetch fresh user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axios.get('/auth/me');
        if (res.data.success) {
          const userData = res.data.user;
          setUser(userData);

          // Update all state with fresh data
          setProfileData({
            name: userData.name || '',
            avatar: userData.avatar || '',
            bio: userData.bio || '',
            expertise: userData.expertise || [],
            yearsExperience: userData.yearsExperience || 0,
            linkedin: userData.linkedin || '',
            phone: userData.phone ? String(userData.phone) : '',
            jobTitle: userData.jobTitle || '',
            company: userData.company || '',
            authMethod: userData.authMethod || 'local',
            hasPassword: userData.hasPassword !== undefined ? userData.hasPassword : true
          });

          setNotifications(userData.notificationPreferences || {
            mentorRequests: true,
            sessionReminders: true,
            newReviews: true,
            platformUpdates: true,
            marketingEmails: false,
            requestStatusUpdates: true,
            investmentAlerts: false
          });

          setPrivacy(userData.privacySettings || {
            profileVisibility: "Public",
            showEmail: false,
            showPhone: false
          });

          const userPrefs = userData.userPreferences || {
            theme: "Dark",
            language: "en"
          };
          setPreferences(userPrefs);
          setCurrentTheme(userPrefs.theme);
          setCurrentLanguage(userPrefs.language);
        } else {
          throw new Error(res.data.message || 'Failed to fetch user data');
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        // Use initialUser as fallback
        if (initialUser) {
          setUser(initialUser);
          setProfileData({
            name: initialUser.name || '',
            avatar: initialUser.avatar || '',
            bio: initialUser.bio || '',
            expertise: initialUser.expertise || [],
            yearsExperience: initialUser.yearsExperience || 0,
            linkedin: initialUser.linkedin || '',
            phone: initialUser.phone ? String(initialUser.phone) : '',
            jobTitle: initialUser.jobTitle || '',
            company: initialUser.company || '',
            authMethod: initialUser.authMethod || 'local',
            hasPassword: initialUser.hasPassword !== undefined ? initialUser.hasPassword : true
          });
        } else {
          toast.error("Failed to load user data. Please refresh the page.");
        }
      }
    };

    fetchUserData();
  }, [initialUser]);

  // Generic Update Handler
  const handleSettingsUpdate = async (section, data) => {
    try {
      setLoading(true);
      const payload = {};
      if (section === 'notifications') payload.notificationPreferences = data;
      if (section === 'privacy') payload.privacySettings = data;
      if (section === 'preferences') payload.userPreferences = data;

      const res = await axios.put('/auth/profile', payload);

      if (res.data.success) {
        toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} updated!`);
        // Update local state with new data
        if (res.data.user) {
          setUser(res.data.user);
        }
      } else {
        throw new Error(res.data.message || 'Update failed');
      }
    } catch (error) {
      console.error("Settings Update Error:", error);
      const errorMsg = error.response?.data?.message || error.message || "Failed to update settings";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { id: 'profile', label: t('profile_details'), icon: User },
    { id: 'notifications', label: t('notifications'), icon: Bell },
    { id: 'privacy', label: t('privacy'), icon: Eye },
    { id: 'preferences', label: t('preferences'), icon: Palette },
    { id: 'security', label: t('security'), icon: Shield },
    { id: 'sessions', label: t('active_sessions'), icon: Monitor },
  ];

  const handleProfileUpdate = async () => {
    // Basic validation
    if (!profileData.name || profileData.name.trim() === '') {
      toast.error("Name is required");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.put('/auth/profile', profileData);

      if (res.data.success) {
        toast.success("Profile updated successfully!");
        // Update local user state with new data
        if (res.data.user) {
          setUser(res.data.user);
          setUserData(res.data.user); // Sync with global auth state
          // Update profileData to match server response
          setProfileData({
            name: res.data.user.name || '',
            avatar: res.data.user.avatar || '',
            bio: res.data.user.bio || '',
            expertise: res.data.user.expertise || [],
            yearsExperience: res.data.user.yearsExperience || 0,
            linkedin: res.data.user.linkedin || '',
            phone: res.data.user.phone || '',
            jobTitle: res.data.user.jobTitle || '',
            company: res.data.user.company || ''
          });
        }
      } else {
        throw new Error(res.data.message || 'Update failed');
      }
    } catch (error) {
      console.error("Profile Update Error:", error);

      // Check if it's a network error (backend not available)
      if (error.code === 'ECONNABORTED' || error.message.includes('Network Error') || !error.response) {
        // save to localStorage as fallback with user-specific key
        try {
          const userKey = profileData.email || user?.email || 'guest';
          localStorage.setItem(`profile_data_mentor_${userKey}`, JSON.stringify(profileData));
          // Update local state immediately for better UX
          setUser(prev => ({ ...prev, ...profileData }));
          toast.warning("Profile saved locally. Will sync when backend is available.");
        } catch (storageError) {
          toast.error("Failed to save profile locally.");
        }
      } else {
        const errorMsg = error.response?.data?.message || error.message || "Failed to update profile. Please try again.";
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    // Reset errors
    setValidationErrors({});

    const errors = {};
    if (passwordData.newPassword.length < 6) {
      errors.newPassword = "Password must be at least 6 characters";
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setLoading(true);
    // Validation
    if (profileData.hasPassword && !passwordData.currentPassword) {
      toast.error("Please enter your current password");
      return;
    }
    if (!passwordData.newPassword) {
      toast.error("Please enter a new password");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.put('/auth/update-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (res.data.success) {
        toast.success("Password updated successfully. Please log in again.");
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        // Update profile data to reflect that password is now set
        setProfileData(prev => ({ ...prev, hasPassword: true }));

        // Force Logout
        setTimeout(() => {
          sessionStorage.removeItem('token');
          window.location.href = '/login';
        }, 1500);
      }
    } catch (error) {
      console.error("Password Update Error:", error.message);

      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
      } else if (error.code === 'ECONNABORTED' || error.message.includes('Network Error') || !error.response) {
        toast.error("Backend is not available. Check your internet connection.");
      } else {
        const errorMsg = error.response?.data?.message || "Failed to update password";
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[600px]">
      {/* Settings Navigation Sidebar */}
      <div className="w-full lg:w-72 flex-shrink-0">
        <h2 className="text-4xl font-bold text-[var(--text-primary)] mb-8 px-2 tracking-tight">{t('settings')}</h2>
        <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible no-scrollbar pb-4 lg:pb-0">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex-shrink-0 w-auto lg:w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-left transition-all duration-300 group relative overflow-hidden ${activeSection === section.id
                ? "bg-emerald-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
            >
              <section.icon size={20} className={`relative z-10 transition-transform duration-300 ${activeSection === section.id ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span className="font-bold whitespace-nowrap relative z-10">{section.label}</span>

              {/* Active State Background Effect */}
              {activeSection === section.id && (
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-500 opacity-100 z-0" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Settings Content Area */}
      <div className="flex-1 min-w-0">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-[var(--bg-primary)] border border-[var(--text-primary)]/10 rounded-[2rem] p-6 sm:p-10 shadow-2xl relative overflow-hidden min-h-full"
        >
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

          {activeSection === 'profile' && (
            <div className="space-y-8 relative z-10">
              <div className="border-b border-white/10 pb-6 mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{t('profile_details')}</h3>
                <p className="text-gray-400">{t('manage_profile')}</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-8 mb-8">
                <div className="relative group cursor-pointer">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 p-[2px]">
                    <div className="w-full h-full rounded-full bg-[#0f1115] flex items-center justify-center overflow-hidden">
                      {user?.avatar ? (
                        <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl font-bold text-white">{user?.name?.charAt(0) || "U"}</span>
                      )}
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={20} className="text-white" />
                  </div>
                </div>
                <div className="text-center sm:text-left">
                  <h4 className="text-lg font-bold text-white">{user?.name || "Mentor Name"}</h4>
                  <p className="text-gray-500 text-sm mb-3">{user?.role || "Mentor"}</p>
                  <button className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-widest border border-white/10 transition-all">{t('change_avatar')}</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">{t('full_name')}</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all font-medium"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">{t('email_address')}</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input type="email" defaultValue={user?.email} disabled className="w-full bg-white/5 border border-white/5 rounded-xl pl-12 pr-4 py-3.5 text-gray-400 cursor-not-allowed font-medium" />
                  </div>
                </div>

                {/* Additional Mentor Fields */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">{t('job_title')}</label>
                  <div className="relative group">
                    <input
                      type="text"
                      placeholder="e.g. Senior Engineer"
                      value={profileData.jobTitle}
                      onChange={(e) => setProfileData({ ...profileData, jobTitle: e.target.value })}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all font-medium"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">{t('company_startup')}</label>
                  <div className="relative group">
                    <input
                      type="text"
                      placeholder="e.g. Google"
                      value={profileData.company}
                      onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={handleProfileUpdate}
                  disabled={loading}
                  className="bg-emerald-500 text-white px-8 py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all text-sm font-bold shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={18} /> {loading ? t('loading') : t('save_changes')}
                </button>
              </div>
            </div>
          )}



          {activeSection === 'notifications' && (
            <div className="space-y-8 relative z-10">
              <div className="border-b border-white/10 pb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{t('notification_preferences')}</h3>
                <p className="text-gray-400">{t('choose_updates')}</p>
              </div>

              <div className="space-y-4">
                {[
                  { id: 'mentorRequests', title: "New Mentorship Requests", desc: "Get notified when someone sends you a mentorship request" },
                  { id: 'newReviews', title: "New Reviews", desc: "Get notified when a student leaves you a review" },
                  { id: 'sessionReminders', title: "Session Reminders", desc: "Stay updated on your upcoming mentoring sessions" },
                  { id: 'platformUpdates', title: "Platform Updates", desc: "Receive news about new features and improvements" }
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all group">
                    <div>
                      <h4 className="text-white font-bold mb-1 group-hover:text-emerald-400 transition-colors">{item.title}</h4>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notifications[item.id]}
                        onChange={(e) => {
                          const newData = { ...notifications, [item.id]: e.target.checked };
                          setNotifications(newData);
                          handleSettingsUpdate('notifications', newData);
                        }}
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'sessions' && (
            <div className="space-y-8 relative z-10">
              <div className="border-b border-white/10 pb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{t('active_sessions')}</h3>
                <p className="text-gray-400">{t('manage_sessions')}</p>
              </div>

              <div className="space-y-4">
                {loading ? (
                  <div className="text-center text-gray-400 py-10">Loading sessions...</div>
                ) : activeSessions.length > 0 ? (
                  activeSessions.map((session) => (
                    <div key={session.id} className={`p-5 border rounded-2xl flex items-center gap-4 ${session.isCurrent ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/[0.02] border-white/5'}`}>
                      <div className={`p-3 rounded-xl ${session.isCurrent ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-gray-400'}`}>
                        {session.deviceType === 'mobile' ? <Smartphone size={24} /> : <Monitor size={24} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-white font-bold">{session.deviceName}</h4>
                          {session.isCurrent && (
                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase rounded-full">{t('current_device')}</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {session.location} • {session.isCurrent ? 'Active now' : new Date(session.lastActive).toLocaleString()}
                        </p>
                      </div>
                      {!session.isCurrent && (
                        <button
                          onClick={() => handleLogoutSession(session.id)}
                          className="text-red-500 text-sm font-bold hover:text-red-400 transition-colors"
                        >
                          Log Out
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-10">No active sessions found.</div>
                )}
              </div>
            </div>
          )}


          {activeSection === 'privacy' && (
            <div className="space-y-8 relative z-10">
              <div className="border-b border-white/10 pb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{t('privacy_settings')}</h3>
                <p className="text-gray-400">{t('manage_visibility')}</p>
              </div>

              <div className="space-y-4">
                <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h4 className="text-white font-bold mb-1">{t('profile_visibility')}</h4>
                      <p className="text-sm text-gray-500">{t('profile_visibility_desc')}</p>
                    </div>
                    <select
                      value={privacy.profileVisibility}
                      onChange={(e) => {
                        const newData = { ...privacy, profileVisibility: e.target.value };
                        setPrivacy(newData);
                        handleSettingsUpdate('privacy', newData);
                      }}
                      className="bg-black/40 border border-white/10 text-white text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 cursor-pointer hover:border-emerald-500/50 transition-colors [&>option]:bg-[#0f1115] [&>option]:text-white"
                    >
                      <option value="Public" className="bg-[#0f1115] text-white">Public</option>
                      <option value="MentorsOnly" className="bg-[#0f1115] text-white">Mentors Only</option>
                      <option value="Private" className="bg-[#0f1115] text-white">Private</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all group">
                  <div>
                    <h4 className="text-white font-bold mb-1 group-hover:text-emerald-400 transition-colors">{t('show_email')}</h4>
                    <p className="text-sm text-gray-500">{t('show_email_desc')}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={privacy.showEmail}
                      onChange={(e) => {
                        const newData = { ...privacy, showEmail: e.target.checked };
                        setPrivacy(newData);
                        handleSettingsUpdate('privacy', newData);
                      }}
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all group">
                  <div>
                    <h4 className="text-white font-bold mb-1 group-hover:text-emerald-400 transition-colors">{t('show_phone')}</h4>
                    <p className="text-sm text-gray-500">{t('show_phone_desc')}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={privacy.showPhone}
                      onChange={(e) => {
                        const newData = { ...privacy, showPhone: e.target.checked };
                        setPrivacy(newData);
                        handleSettingsUpdate('privacy', newData);
                      }}
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="space-y-8 relative z-10">
              <div className="border-b border-[var(--text-primary)]/10 pb-6">
                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">{t('security')}</h3>
                <p className="text-[var(--text-secondary)]">{t('password_protection')}</p>
              </div>

              <div className="space-y-5">
                {profileData.hasPassword && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest ml-1">{t('current_password')}</label>
                    <div className="relative group">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-emerald-400 transition-colors" size={18} />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full bg-[var(--text-primary)]/5 border border-[var(--text-primary)]/10 rounded-xl pl-12 pr-4 py-3.5 text-[var(--text-primary)] focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all placeholder:text-[var(--text-secondary)]/50"
                      />
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest ml-1">{t('new_password')}</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-emerald-400 transition-colors" size={18} />
                      <input
                        type={showNewPassword ? "text" : "password"} // Fixed: Use visible toggle
                        placeholder="New Password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full bg-[var(--text-primary)]/5 border border-[var(--text-primary)]/10 rounded-xl pl-12 pr-12 py-3.5 text-[var(--text-primary)] focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all placeholder:text-[var(--text-secondary)]/50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {validationErrors.newPassword && (
                      <p className="text-red-500 text-xs mt-1 ml-1">{validationErrors.newPassword}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest ml-1">{t('confirm_password')}</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-emerald-400 transition-colors" size={18} />
                      <input
                        type={showConfirmPassword ? "text" : "password"} // Fixed: Use visible toggle
                        placeholder="Confirm Password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full bg-[var(--text-primary)]/5 border border-[var(--text-primary)]/10 rounded-xl pl-12 pr-12 py-3.5 text-[var(--text-primary)] focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all placeholder:text-[var(--text-secondary)]/50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {validationErrors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1 ml-1">{validationErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-5 flex gap-4">
                <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500 h-fit">
                  <Shield size={24} />
                </div>
                <div>
                  <h4 className="text-[var(--text-primary)] font-bold mb-1">Two-Factor Authentication</h4>
                  <p className="text-[var(--text-secondary)] text-sm mb-3">Add an extra layer of security your account.</p>
                  <button className="px-4 py-2 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors">Enable 2FA</button>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handlePasswordUpdate}
                  disabled={loading}
                  className="bg-emerald-500 text-white px-8 py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all text-sm font-bold shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] active:scale-95 disabled:opacity-50"
                >
                  <Save size={18} /> {loading ? t('loading') : t('update_password')}
                </button>
              </div>
            </div>
          )}

          {activeSection === 'preferences' && (
            <div className="space-y-8 relative z-10">
              <div className="border-b border-[var(--text-primary)]/10 pb-6">
                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">{t('preferences')}</h3>
                <p className="text-[var(--text-secondary)]">{t('customize_experience')}</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-5 bg-[var(--text-primary)]/5 border border-[var(--text-primary)]/10 rounded-2xl">
                  <div>
                    <h4 className="text-[var(--text-primary)] font-bold mb-1">{t('theme')}</h4>
                    <p className="text-sm text-[var(--text-secondary)]">{t('select_appearance')}</p>
                  </div>
                  <select
                    value={currentTheme}
                    onChange={(e) => {
                      const newTheme = e.target.value;
                      // Update local state immediately for instant UI feedback
                      setCurrentTheme(newTheme);

                      // Apply theme globally via ThemeContext
                      setGlobalTheme(newTheme);

                      // Create new preferences object
                      const newData = {
                        theme: newTheme,
                        language: currentLanguage || preferences?.language || "en"
                      };

                      // Update preferences state
                      setPreferences(newData);

                      // Then save to backend (async)
                      handleSettingsUpdate('preferences', newData);
                    }}
                    disabled={loading}
                    className="bg-[var(--text-primary)]/10 border border-[var(--text-primary)]/10 text-[var(--text-primary)] text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 cursor-pointer hover:border-emerald-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed [&>option]:bg-[#0f1115] [&>option]:text-white"
                  >
                    <option value="Dark" className="bg-[#0f1115] text-white">{t('dark')}</option>
                    <option value="Light" className="bg-[#0f1115] text-white">{t('light')}</option>
                    <option value="System" className="bg-[#0f1115] text-white">{t('system')}</option>
                  </select>
                </div>

                <div className="flex justify-between items-center p-5 bg-[var(--text-primary)]/5 border border-[var(--text-primary)]/10 rounded-2xl">
                  <div>
                    <h4 className="text-[var(--text-primary)] font-bold mb-1">{t('language')}</h4>
                    <p className="text-sm text-[var(--text-secondary)]">{t('select_language')}</p>
                  </div>
                  <select
                    value={currentLanguage}
                    onChange={(e) => {
                      const newLanguage = e.target.value;
                      // Update local state immediately for instant UI feedback
                      setCurrentLanguage(newLanguage);

                      // Apply language globally via ThemeContext
                      setGlobalLanguage(newLanguage);

                      // Create new preferences object
                      const newData = {
                        theme: currentTheme || preferences?.theme || "Dark",
                        language: newLanguage
                      };

                      // Update preferences state
                      setPreferences(newData);

                      // Then save to backend (async)
                      handleSettingsUpdate('preferences', newData);
                    }}
                    disabled={loading}
                    className="bg-[var(--text-primary)]/10 border border-[var(--text-primary)]/10 text-[var(--text-primary)] text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 cursor-pointer hover:border-emerald-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed [&>option]:bg-[#0f1115] [&>option]:text-white"
                  >
                    <option value="en" className="bg-[#0f1115] text-white">English</option>
                    <option value="hi" className="bg-[#0f1115] text-white">Hindi</option>
                    <option value="es" className="bg-[#0f1115] text-white">Spanish</option>
                  </select>
                </div>
              </div>
            </div>
          )}

        </motion.div>
      </div>
    </div>
  );
};

export default MentorSettings;
