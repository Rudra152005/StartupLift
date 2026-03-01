import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Save, Lock, Bell, User, Shield, Eye, EyeOff, Palette, Monitor, Camera, Mail, Key, Smartphone, Settings, Briefcase, Building2, Linkedin, Phone, FileText, AlertCircle } from 'lucide-react';
import axios from '../../api/axiosInstance';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const DashboardSettings = ({ user: initialUser }) => {
  const { t } = useTranslation();
  const { setUserData } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(initialUser);
  const [backendAvailable, setBackendAvailable] = useState(true);
  const isInitialized = useRef(false);
  const preferencesUpdateRef = useRef(false); // Track if user has manually updated preferences

  // Get theme context for global theme management
  const { theme: globalTheme, setTheme: setGlobalTheme, language: globalLanguage, setLanguage: setGlobalLanguage } = useTheme();

  // Profile Form State - Initialize with initialUser if available
  const [profileData, setProfileData] = useState({
    name: initialUser?.name || '',
    email: initialUser?.email || '', // Added email
    avatar: initialUser?.avatar || '',
    company: initialUser?.company || '',
    linkedin: initialUser?.linkedin || '',
    phone: initialUser?.phone ? String(initialUser.phone) : '',
    bio: initialUser?.bio || '',
    authMethod: initialUser?.authMethod || 'local',
    hasPassword: initialUser?.hasPassword !== undefined ? initialUser.hasPassword : true // Default to true for safety
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
    requestStatusUpdates: true,
    sessionReminders: true,
    investmentAlerts: false,
    platformUpdates: true,
    marketingEmails: false,
    mentorRequests: true,
    newReviews: true
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: "Public",
    showEmail: false,
    showPhone: false
  });

  const [preferences, setPreferences] = useState(() => {
    // Initialize with initialUser data if available
    const initTheme = initialUser?.userPreferences?.theme || "Dark";
    const initLanguage = initialUser?.userPreferences?.language || "en";
    return {
      theme: initTheme,
      language: initLanguage
    };
  });

  // Active Sessions State
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Local state for immediate UI updates (separate from preferences to ensure reactivity)
  const [currentTheme, setCurrentTheme] = useState(preferences?.theme || "Dark");
  const [currentLanguage, setCurrentLanguage] = useState(preferences?.language || "en");

  // Sync local state with preferences when preferences change from external source
  // Only sync if user hasn't manually updated (to prevent overwriting user changes)
  useEffect(() => {
    if (!preferencesUpdateRef.current && preferences) {
      if (preferences.theme && preferences.theme !== currentTheme) {
        setCurrentTheme(preferences.theme);
      }
      if (preferences.language && preferences.language !== currentLanguage) {
        setCurrentLanguage(preferences.language);
      }
    }
  }, [preferences]);

  // Fetch fresh user data on mount
  const fetchUserData = async () => {
    try {
      const res = await axios.get('/auth/me');
      if (res.data.success) {
        setBackendAvailable(true); // Backend found!
        const userData = res.data.user;
        setUser(userData);

        // Update all state with fresh data - only if not already initialized
        if (!isInitialized.current) {
          setProfileData({
            name: userData.name || '',
            email: userData.email || '', // Added email
            avatar: userData.avatar || '',
            company: userData.company || '',
            linkedin: userData.linkedin || '',
            phone: userData.phone ? String(userData.phone) : '',
            bio: userData.bio || '',
            authMethod: userData.authMethod || 'local',
            hasPassword: userData.hasPassword // Update hasPassword
          });

          setNotifications(userData.notificationPreferences || {
            requestStatusUpdates: true,
            sessionReminders: true,
            investmentAlerts: false,
            platformUpdates: true,
            marketingEmails: false,
            mentorRequests: true,
            newReviews: true
          });

          setPrivacy(userData.privacySettings || {
            profileVisibility: "Public",
            showEmail: false,
            showPhone: false
          });

          const userPrefs = userData.userPreferences || {};
          // Only set preferences if user hasn't manually changed them
          if (!preferencesUpdateRef.current) {
            const newPrefs = {
              theme: userPrefs.theme || "Dark",
              language: userPrefs.language || "en"
            };
            setPreferences(newPrefs);
            setCurrentTheme(newPrefs.theme);
            setCurrentLanguage(newPrefs.language);
          }

          isInitialized.current = true;
        }
      } else {
        throw new Error(res.data.message || 'Failed to fetch user data');
      }
    } catch (error) {
      console.error("Error fetching user data:", error);

      // Try to load from localStorage if backend is not available
      if (error.code === 'ECONNABORTED' || error.message.includes('Network Error') || !error.response) {
        setBackendAvailable(false);
        try {
          // Use user-specific keys to prevent isolation issues
          const userKey = profileData.email || initialUser?.email || 'guest';
          const savedProfile = localStorage.getItem(`profile_data_${userKey}`);
          const savedNotifications = localStorage.getItem(`settings_notifications_${userKey}`);
          const savedPrivacy = localStorage.getItem(`settings_privacy_${userKey}`);
          const savedPreferences = localStorage.getItem(`settings_preferences_${userKey}`);

          if (savedProfile) {
            const profile = JSON.parse(savedProfile);
            setProfileData(profile);
            if (initialUser) {
              setUser({ ...initialUser, ...profile });
            }
          }

          if (savedNotifications) {
            setNotifications(JSON.parse(savedNotifications));
          }

          if (savedPrivacy) {
            setPrivacy(JSON.parse(savedPrivacy));
          }

          if (savedPreferences && !preferencesUpdateRef.current) {
            try {
              const prefs = JSON.parse(savedPreferences);
              const newPrefs = {
                theme: prefs.theme || "Dark",
                language: prefs.language || "en"
              };
              setPreferences(newPrefs);
              setCurrentTheme(newPrefs.theme);
              setCurrentLanguage(newPrefs.language);
            } catch (e) {
              console.error("Error parsing saved preferences:", e);
            }
          }

          if (savedProfile || savedNotifications || savedPrivacy || savedPreferences) {
            toast.info("Loaded saved settings from local storage. Backend is not available.");
          }
        } catch (storageError) {
          console.error("Error loading from localStorage:", storageError);
        }
      } else {
        setBackendAvailable(true);
      }

      // Use initialUser as fallback - only if not already initialized
      if (initialUser && !isInitialized.current) {
        setUser(initialUser);
        setProfileData({
          name: initialUser.name || '',
          email: initialUser.email || '', // Added email
          avatar: initialUser.avatar || '',
          company: initialUser.company || '',
          linkedin: initialUser.linkedin || '',
          phone: initialUser.phone ? String(initialUser.phone) : '',
          bio: initialUser.bio || '',
          authMethod: initialUser.authMethod || 'local',
          hasPassword: initialUser.hasPassword !== undefined ? initialUser.hasPassword : true
        });
        isInitialized.current = true;
      }
    }
  };

  useEffect(() => {
    if (!isInitialized.current) {
      fetchUserData();
    }
  }, []);

  // Sync local data to backend when it becomes available
  useEffect(() => {
    if (!backendAvailable) {
      const checkBackendAndSync = async () => {
        try {
          // Try a simple health check
          await axios.get('/auth/me', { timeout: 3000 });

          // Backend is available - sync local data
          setBackendAvailable(true);

          // Sync profile data
          const savedProfile = localStorage.getItem('profile_data');
          if (savedProfile) {
            try {
              const profile = JSON.parse(savedProfile);
              await axios.put('/auth/profile', profile);
              localStorage.removeItem('profile_data');
              toast.success("Profile synced with backend!");
            } catch (syncError) {
              console.error("Error syncing profile:", syncError);
            }
          }

          // Sync other settings
          const sections = ['notifications', 'privacy', 'preferences'];
          for (const section of sections) {
            const key = `settings_${section}`;
            const saved = localStorage.getItem(key);
            if (saved) {
              try {
                const data = JSON.parse(saved);
                const payload = {};
                payload[`${section === 'notifications' ? 'notificationPreferences' : section === 'privacy' ? 'privacySettings' : 'userPreferences'}`] = data;
                await axios.put('/auth/profile', payload);
                localStorage.removeItem(key);
                // Don't update state from sync - user's current selection should remain
                // Only sync to backend, don't overwrite current UI state
              } catch (syncError) {
                console.error(`Error syncing ${section}:`, syncError);
              }
            }
          }
        } catch (error) {
          // Backend still not available
          console.log("Backend check failed, will retry...");
        }
      };

      // Check every 30 seconds if backend is available
      const interval = setInterval(checkBackendAndSync, 30000);
      return () => clearInterval(interval);
    }
  }, [backendAvailable]);

  // Debug: Log when preferences change
  useEffect(() => {
    console.log('Preferences state changed:', preferences);
  }, [preferences]);

  // Generic Update Handler
  const handleSettingsUpdate = async (section, data) => {
    // For preferences, state is already updated in onChange, so we don't need to update again
    // Just save to backend/localStorage
    try {
      setLoading(true);
      const payload = {};
      if (section === 'notifications') payload.notificationPreferences = data;
      if (section === 'privacy') payload.privacySettings = data;
      if (section === 'preferences') payload.userPreferences = data;

      const res = await axios.put('/auth/profile', payload);

      if (res.data.success) {
        toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} updated!`);
        // Update user state but don't override preferences state (already updated in onChange)
        if (res.data.user) {
          setUser(res.data.user);
          setUserData(res.data.user); // Sync with global auth state
          // Don't update preferences state from backend response
          // State was already updated in onChange handler before API call
          // This prevents overwriting user's selection with potentially stale backend data
        }
      } else {
        throw new Error(res.data.message || 'Update failed');
      }
    } catch (error) {
      console.error("Settings Update Error:", error);

      // Check if it's a network error (backend not available)
      if (error.code === 'ECONNABORTED' || error.message.includes('Network Error') || !error.response) {
        setBackendAvailable(false);
        // Backend is not available - save to localStorage as fallback
        try {
          const userKey = profileData.email || user?.email || 'guest';
          const key = `settings_${section}_${userKey}`;
          localStorage.setItem(key, JSON.stringify(data));
          // State was already updated in onChange handler - don't override it
          toast.warning(`${section.charAt(0).toUpperCase() + section.slice(1)} saved locally. Will sync when backend is available.`);
        } catch (storageError) {
          toast.error("Failed to save settings. Please try again later.");
        }
      } else {
        setBackendAvailable(true);
        const errorMsg = error.response?.data?.message || error.message || "Failed to update settings";
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { id: 'profile', label: t('profile_details'), icon: User },
    { id: 'notifications', label: t('notifications'), icon: Bell },
    { id: 'privacy', label: t('privacy'), icon: Eye },
    { id: 'preferences', label: t('preferences'), icon: Palette },
    { id: 'security', label: t('security'), icon: Lock },
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
            email: res.data.user.email || '', // Added email
            avatar: res.data.user.avatar || '',
            company: res.data.user.company || '',
            linkedin: res.data.user.linkedin || '',
            phone: res.data.user.phone ? String(res.data.user.phone) : '',
            bio: res.data.user.bio || '',
            authMethod: res.data.user.authMethod || 'local',
            hasPassword: res.data.user.hasPassword
          });
        }
      } else {
        throw new Error(res.data.message || 'Update failed');
      }
    } catch (error) {
      console.error("Profile Update Error:", error);

      // Check if it's a network error (backend not available)
      if (error.code === 'ECONNABORTED' || error.message.includes('Network Error') || !error.response) {
        setBackendAvailable(false);
        // Backend is not available - save to localStorage as fallback
        try {
          const userKey = profileData.email || user?.email || 'guest';
          localStorage.setItem(`profile_data_${userKey}`, JSON.stringify(profileData));
          // Update local state immediately for better UX
          setUser(prev => ({ ...prev, ...profileData }));
          toast.warning("Profile saved locally. Will sync when backend is available.");
        } catch (storageError) {
          toast.error("Failed to save profile. Please try again later.");
        }
      } else {
        setBackendAvailable(true);
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

    // Client-side Validation
    const errors = {};
    if (profileData.hasPassword && !passwordData.currentPassword) {
      errors.currentPassword = t('current_password_required') || "Please enter your current password";
    }
    if (!passwordData.newPassword) {
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

        // Force Logout (Security Best Practice)
        setTimeout(() => {
          // clear user data and redirect
          sessionStorage.removeItem('token');
          // Assuming useAuth has a logout function or we manually reload
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
        const errorMsg = error.response?.data?.message || error.message || "Failed to update password";
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch Active Sessions
  const fetchSessions = async () => {
    try {
      setLoadingSessions(true);
      const res = await axios.get('/auth/sessions');

      if (res.data.success) {
        setSessions(res.data.sessions || []);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
      // If endpoint doesn't exist, use placeholder data
      if (error.response?.status === 404) {
        console.log("Sessions endpoint not implemented yet");
        setSessions([]);
      }
    } finally {
      setLoadingSessions(false);
    }
  };

  // Handle Session Logout
  const handleSessionLogout = async (sessionId) => {
    try {
      const res = await axios.delete(`/auth/sessions/${sessionId}`);

      if (res.data.success) {
        toast.success("Session logged out successfully");
        // Refresh sessions list
        fetchSessions();
      }
    } catch (error) {
      console.error("Error logging out session:", error);
      const errorMsg = error.response?.data?.message || "Failed to logout session";
      toast.error(errorMsg);
    }
  };

  // Fetch sessions when Active Sessions section is opened
  useEffect(() => {
    if (activeSection === 'sessions') {
      fetchSessions();
    }
  }, [activeSection]);

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
        {/* Backend Status Indicator */}
        {!backendAvailable && (
          <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-amber-500" size={20} />
              <div className="flex-1">
                <p className="text-amber-400 text-sm font-bold">Backend Not Available</p>
                <p className="text-amber-400/70 text-xs">Settings are being saved locally and will sync when connection is restored.</p>
              </div>
            </div>
            <button
              onClick={() => {
                isInitialized.current = false;
                fetchUserData();
              }}
              className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-xs font-bold rounded-lg transition-colors border border-amber-500/20"
            >
              Retry Connection
            </button>
          </div>
        )}

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
              <div className="border-b border-[var(--text-primary)]/10 pb-6 mb-6">
                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">{t('profile_details')}</h3>
                <p className="text-[var(--text-secondary)]">{t('manage_profile')}</p>
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
                  <h4 className="text-lg font-bold text-white">{user?.name || "User Name"}</h4>
                  <p className="text-gray-500 text-sm mb-3">Founder</p>
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
                      placeholder="Your full name"
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

                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">{t('company_startup')}</label>
                  <div className="relative group">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
                    <input
                      type="text"
                      value={profileData.company}
                      onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                      className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all font-medium"
                      placeholder="Your startup name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">{t('linkedin_profile')}</label>
                  <div className="relative group">
                    <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
                    <input
                      type="url"
                      value={profileData.linkedin}
                      onChange={(e) => setProfileData({ ...profileData, linkedin: e.target.value })}
                      className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all font-medium"
                      placeholder="https://linkedin.com/in/your-profile"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">{t('phone_number')}</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all font-medium"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                </div>
              </div>

              {/* Bio Section */}
              <div className="space-y-2 mt-6">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">{t('bio_about')}</label>
                <div className="relative group">
                  <FileText className="absolute left-4 top-4 text-gray-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    rows={4}
                    className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all font-medium resize-none"
                    placeholder="Tell us about yourself and your startup journey..."
                  />
                </div>
                <p className="text-xs text-gray-500 ml-1">Max 250 characters</p>
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

          {activeSection === 'security' && (
            <div className="space-y-8 relative z-10">
              <div className="border-b border-white/10 pb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{t('security')}</h3>
                <p className="text-gray-400">{t('password_protection')}</p>
              </div>

              {/* Password Form */}
              <div className="space-y-6">
                {profileData.hasPassword && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">{t('current_password')}</label>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 pl-12 pr-12 text-white focus:outline-none focus:border-emerald-500 transition-all placeholder-gray-600"
                        placeholder="••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                      >
                        {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">{t('new_password')}</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 pl-12 pr-12 text-white focus:outline-none focus:border-emerald-500 transition-all placeholder-gray-600"
                        placeholder="••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                      >
                        {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {validationErrors.newPassword && (
                      <p className="text-red-500 text-xs mt-1 ml-1">{validationErrors.newPassword}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">{t('confirm_password')}</label>
                    <div className="relative group">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 pl-12 pr-12 text-white focus:outline-none focus:border-emerald-500 transition-all placeholder-gray-600"
                        placeholder="••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
                  <h4 className="text-white font-bold mb-1">Two-Factor Authentication</h4>
                  <p className="text-gray-400 text-sm mb-3">Add an extra layer of security to your account by enabling 2FA.</p>
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

          {activeSection === 'notifications' && (
            <div className="space-y-8 relative z-10">
              <div className="border-b border-white/10 pb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{t('notification_preferences')}</h3>
                <p className="text-gray-400">{t('choose_updates')}</p>
              </div>

              <div className="space-y-4">
                {[
                  { id: 'requestStatusUpdates', title: "Request Status Updates", desc: "Get notified when a mentor accepts or rejects your request" },
                  { id: 'sessionReminders', title: "Session Reminders", desc: "Stay updated on your upcoming mentoring sessions" },
                  { id: 'investmentAlerts', title: "Investment Opportunities", desc: "Receive alerts about funding and investment programs" },
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
                {loadingSessions ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                    <p className="text-gray-400 mt-4">{t('loading')}</p>
                  </div>
                ) : sessions.length > 0 ? (
                  sessions.map((session, index) => (
                    <div
                      key={session.id || index}
                      className={`p-5 border rounded-2xl flex items-center gap-4 ${session.isCurrent
                        ? 'bg-emerald-500/5 border-emerald-500/20'
                        : 'bg-white/[0.02] border-white/5'
                        }`}
                    >
                      <div className={`p-3 rounded-xl ${session.isCurrent ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-gray-400'
                        }`}>
                        {session.deviceType === 'mobile' ? <Smartphone size={24} /> : <Monitor size={24} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-white font-bold">{session.deviceName || 'Unknown Device'}</h4>
                          {session.isCurrent && (
                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase rounded-full">
                              {t('current_device')}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {session.location || 'Unknown Location'} • {session.lastActive || 'Active now'}
                        </p>
                      </div>
                      {!session.isCurrent && (
                        <button
                          onClick={() => handleSessionLogout(session.id)}
                          className="text-red-500 text-sm font-bold hover:text-red-400 transition-colors"
                        >
                          Log Out
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Monitor size={48} className="mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400">No active sessions found</p>
                    <p className="text-sm text-gray-500 mt-2">Your current session will appear here</p>
                  </div>
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

          {activeSection === 'preferences' && (
            <div className="space-y-8 relative z-10">
              <div className="border-b border-[var(--text-primary)]/10 pb-6">
                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">{t('preferences')}</h3>
                <p className="text-[var(--text-secondary)]">{t('customize_dashboard')}</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-5 bg-[var(--text-primary)]/5 border border-[var(--text-primary)]/10 rounded-2xl">
                  <div>
                    <h4 className="text-[var(--text-primary)] font-bold mb-1">{t('theme')}</h4>
                    <p className="text-sm text-[var(--text-secondary)]">{t('select_theme')}</p>
                  </div>
                  <select
                    value={currentTheme}
                    onChange={(e) => {
                      const newTheme = e.target.value;
                      console.log('=== THEME CHANGE ===');
                      console.log('New theme:', newTheme);

                      // Update local state immediately for instant UI feedback
                      setCurrentTheme(newTheme);

                      // Apply theme globally via ThemeContext
                      setGlobalTheme(newTheme);

                      // Get current language
                      const lang = currentLanguage || preferences?.language || "en";

                      // Create new preferences object
                      const newData = {
                        theme: newTheme,
                        language: lang
                      };

                      console.log('New preferences data:', newData);

                      // Mark that user has manually updated preferences
                      preferencesUpdateRef.current = true;

                      // Update preferences state
                      setPreferences(newData);

                      // Then save to backend/localStorage (async, don't wait)
                      handleSettingsUpdate('preferences', newData).catch(err => {
                        console.error('Failed to save preferences:', err);
                      });
                    }}
                    disabled={loading}
                    className="bg-[var(--text-primary)]/10 border border-[var(--text-primary)]/10 text-[var(--text-primary)] text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 min-w-[150px] cursor-pointer hover:border-emerald-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed [&>option]:bg-[#0f1115] [&>option]:text-white"
                  >
                    <option value="Dark" className="bg-[#0f1115] text-white">{t('dark')}</option>
                    <option value="Light" className="bg-[#0f1115] text-white">{t('light')}</option>
                    <option value="System" className="bg-[#0f1115] text-white">{t('system')}</option>
                  </select>
                </div>

                <div className="flex justify-between items-center p-5 bg-[var(--text-primary)]/5 border border-[var(--text-primary)]/10 rounded-2xl">
                  <div>
                    <h4 className="text-[var(--text-primary)] font-bold mb-1">{t('language')}</h4>
                    <p className="text-sm text-[var(--text-secondary)]">{t('choose_language')}</p>
                  </div>
                  <select
                    value={currentLanguage}
                    onChange={(e) => {
                      const newLanguage = e.target.value;
                      console.log('=== LANGUAGE CHANGE ===');
                      console.log('New language:', newLanguage);

                      // Update local state immediately for instant UI feedback
                      setCurrentLanguage(newLanguage);

                      // Apply language globally via ThemeContext
                      setGlobalLanguage(newLanguage);

                      // Get current theme
                      const theme = currentTheme || preferences?.theme || "Dark";

                      // Create new preferences object
                      const newData = {
                        theme: theme,
                        language: newLanguage
                      };

                      console.log('New preferences data:', newData);

                      // Mark that user has manually updated preferences
                      preferencesUpdateRef.current = true;

                      // Update preferences state
                      setPreferences(newData);

                      // Then save to backend/localStorage (async, don't wait)
                      handleSettingsUpdate('preferences', newData).catch(err => {
                        console.error('Failed to save preferences:', err);
                      });
                    }}
                    disabled={loading}
                    className="bg-[var(--text-primary)]/10 border border-[var(--text-primary)]/10 text-[var(--text-primary)] text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 min-w-[150px] cursor-pointer hover:border-emerald-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed [&>option]:bg-[#0f1115] [&>option]:text-white"
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

export default DashboardSettings;
