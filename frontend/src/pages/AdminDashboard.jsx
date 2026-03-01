import React, { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Menu,
  Bell,
  Search,
  User as UserIcon,
  Settings as SettingsIcon,
  LogOut,
  ChevronDown,
  ArrowLeft
} from 'lucide-react';
import AdminSidebar from '../components/admin/AdminSidebar';
// Lazy Load Components
const AdminOverview = lazy(() => import('../components/admin/AdminOverview'));
const AdminUsers = lazy(() => import('../components/admin/AdminUsers'));
const AdminMentors = lazy(() => import('../components/admin/AdminMentors'));
const AdminStartups = lazy(() => import('../components/admin/AdminStartups'));
const AdminPrograms = lazy(() => import('../components/admin/AdminPrograms'));
const AdminSessions = lazy(() => import('../components/admin/AdminSessions'));
const AdminContent = lazy(() => import('../components/admin/AdminContent'));
const AdminReports = lazy(() => import('../components/admin/AdminReports'));
const AdminSettings = lazy(() => import('../components/admin/AdminSettings'));
const AdminLogs = lazy(() => import('../components/admin/AdminLogs'));
const AdminProfile = lazy(() => import('../components/admin/AdminProfile'));
import Logo from '../assets/Logo.svg';


// Global Components
import Particles from '../components/Particles';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default to closed for better mobile/drawer experience
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    { id: 1, type: 'application', message: 'New program application received', time: '5 min ago', unread: true },
    { id: 2, type: 'user', message: 'New mentor registration pending approval', time: '1 hour ago', unread: true },
    { id: 3, type: 'system', message: 'System backup completed successfully', time: '3 hours ago', unread: false },
    { id: 4, type: 'alert', message: 'Program deadline approaching: Seed Accelerator', time: '1 day ago', unread: false },
  ]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!loading && user?.role !== 'Admin') {
      // navigate('/dashboard'); // Security check
    }
  }, [user, loading, navigate]);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <AdminOverview setActiveTab={setActiveTab} />;
      case 'users': return <AdminUsers />;
      case 'mentors': return <AdminMentors />;
      case 'startups': return <AdminStartups />;
      case 'programs': return <AdminPrograms />;
      case 'sessions': return <AdminSessions />;
      case 'content': return <AdminContent />;
      case 'reports': return <AdminReports />;
      case 'settings': return <AdminSettings user={user} />;
      case 'logs': return <AdminLogs />;
      case 'profile': return <AdminProfile />;
      default: return <AdminOverview setActiveTab={setActiveTab} />;
    }
  };


  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'application': return '📝';
      case 'user': return '👤';
      case 'system': return '⚙️';
      case 'alert': return '⚠️';
      default: return '🔔';
    }
  };

  return (
    <div className="relative min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-inter flex flex-col transition-colors duration-300 overflow-hidden">

      {/* 1. Cinematic Night Forest Background Layers */}

      {/* Background Ambience (Consistent with Landing Page) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-25%] left-[-15%] w-[400px] md:w-[700px] h-[400px] md:h-[700px] bg-[var(--color-primary)]/5 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-25%] right-[-15%] w-[350px] md:w-[600px] h-[350px] md:h-[600px] bg-[var(--color-primary)]/8 blur-[120px] rounded-full" />
      </div>

      {/* Navigation Layer */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        user={user}
        logout={logout}
      />

      <div className="flex-grow flex flex-col min-h-screen relative z-10">
        {/* Header - Fixed & Cinematic Glass */}
        <header className="fixed top-0 left-0 right-0 z-[100] h-28 bg-[var(--bg-primary)]/70 backdrop-blur-3xl border-b border-[var(--text-primary)]/5 px-6 sm:px-10 max-w-[1600px] mx-auto w-full flex items-center justify-between cinematic-header relative">


          {/* 1. LEFT: Branding & Back Button */}
          <div className="flex-1 flex justify-start items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 sm:p-2.5 bg-[var(--text-primary)]/5 backdrop-blur-md border border-[var(--text-primary)]/5 rounded-xl sm:rounded-2xl hover:bg-emerald-500/20 hover:border-emerald-500/30 text-gray-400 hover:text-emerald-400 transition-all duration-300 group shrink-0"
              aria-label={t('go_back')}
            >
              <ArrowLeft size={18} className="sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="flex items-center gap-3 group shrink-0"
            >
              <div className="w-10 h-10 flex items-center justify-center p-1 bg-[var(--text-primary)]/5 rounded-2xl group-hover:bg-emerald-500/20 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-500 border border-[var(--text-primary)]/10 group-hover:border-emerald-500/30">
                <img src={Logo} alt="Logo" className="w-full h-full object-contain dark:brightness-100 brightness-0 transition-all" />
              </div>
              <span className="text-xl font-bold text-[var(--text-primary)] tracking-tight hidden lg:block">
                Startup<span className="text-emerald-500 text-glow-emerald">Lift</span>
              </span>
            </button>
          </div>

          {/* 2. CENTER: Nav + Search (Grouped) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden min-[1400px]:flex items-center gap-8">
            {/* Nav Links */}
            <div className="flex items-center gap-6">
              {[
                { name: t('home'), path: "/" },
                { name: t('about'), path: "/about" },
                { name: t('contact'), path: "/contact" }
              ].map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-[15px] font-bold tracking-wide text-gray-400 hover:text-emerald-400 transition-all duration-300"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Divider */}
            <div className="h-6 w-[1px] bg-white/10" />

            {/* Search Bar */}
            <div className="relative w-[240px] group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400/50 group-hover:text-emerald-400 transition-colors">
                <Search size={18} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search_placeholder')}
                className="w-full bg-[var(--text-primary)]/5 border border-[var(--text-primary)]/10 rounded-2xl py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-emerald-500/30 border-transparent outline-none transition-all text-[var(--text-primary)] placeholder:text-gray-500 hover:bg-[var(--text-primary)]/10"
              />
            </div>
          </div>

          {/* 3. RIGHT: Actions */}
          <div className="flex-1 flex items-center gap-4 sm:gap-6 justify-end">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileMenu(false);
                }}
                className={`
                  relative p-3 rounded-2xl transition-all duration-500 border
                  ${showNotifications
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                  }
                `}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-4 ring-[#020617] shadow-[0_0_10px_rgba(6,182,212,0.8)]"></span>
                )}
              </button>

              {/* Notification Dropdown (Cinematic Glass) */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-[340px] cinematic-glass bg-[#020617]/90 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/10 py-2 z-50 overflow-hidden"
                  >
                    <div className="px-6 py-5 border-b border-[var(--text-primary)]/5 flex items-center justify-between">
                      <h3 className="font-bold text-base text-[var(--text-primary)] tracking-tight">{t('notifications_title')}</h3>
                      {unreadCount > 0 && (
                        <span className="bg-emerald-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                          {unreadCount} new
                        </span>
                      )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                      {notifications.map((notif) => (
                        <button
                          key={notif.id}
                          className={`w-full px-6 py-4 flex items-start gap-4 hover:bg-white/5 transition-all group ${notif.unread ? 'bg-emerald-500/5' : ''}`}
                        >
                          <span className="text-2xl flex-shrink-0 grayscale group-hover:grayscale-0 transition-all">{getNotificationIcon(notif.type)}</span>
                          <div className="flex-1 min-w-0 text-left">
                            <p className={`text-sm tracking-tight ${notif.unread ? 'font-bold text-white' : 'text-gray-400'}`}>
                              {notif.message}
                            </p>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">{notif.time}</p>
                          </div>
                          {notif.unread && (
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(6,182,212,1)] mt-2"></div>
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="px-6 py-4 border-t border-white/5">
                      <button className="w-full text-center text-xs font-black uppercase tracking-[0.2em] text-emerald-400 hover:text-emerald-300 transition-colors">
                        Clear All
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="h-8 w-[1px] bg-white/10 mx-1"></div>

            <div className="relative">
              <button
                className={`
                  flex items-center gap-3 p-1.5 pr-4 rounded-2xl transition-all duration-500 border
                  ${showProfileMenu
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }
                `}
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-black shadow-lg">
                  {user?.name?.charAt(0) || "A"}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-[13px] font-bold text-[var(--text-primary)] leading-none mb-1">{user?.name || "Admin"}</div>
                  <div className="text-[10px] text-gray-500 font-black uppercase tracking-wider flex items-center gap-1.5">
                    Platform Admin <ChevronDown size={12} className={`transition-transform duration-500 ${showProfileMenu ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-56 cinematic-glass bg-[#020617]/90 border border-white/10 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.7)] py-3 z-50 overflow-hidden"
                  >
                    {[
                      { id: 'profile', label: t('my_profile'), icon: UserIcon },
                      { id: 'settings', label: t('settings'), icon: SettingsIcon },
                    ].map(item => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setShowProfileMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-6 py-3.5 text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                      >
                        <item.icon size={18} className="text-emerald-400/70" /> {item.label}
                      </button>
                    ))}
                    <div className="h-[1px] bg-white/5 my-2 mx-6"></div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-6 py-3.5 text-sm font-bold text-red-500 hover:bg-red-500/10 transition-all font-black uppercase tracking-widest"
                    >
                      <LogOut size={18} /> {t('logout')}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Dynamic Section Content */}
        <main className="flex-grow pt-32 sm:pt-40 px-6 sm:px-10 max-w-[1600px] mx-auto w-full pb-20 overflow-visible relative z-10">
          <Suspense fallback={<div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div></div>}>
            {renderContent()}
          </Suspense>
        </main>

        {/* Summary Footer */}
        <footer className="relative mt-auto border-t border-[var(--text-primary)]/5 bg-[var(--bg-primary)]/40 backdrop-blur-3xl py-12 px-6 sm:px-10">
          <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-gray-500 font-bold text-xs uppercase tracking-[0.2em]">
              © 2025 Antigravity <span className="text-emerald-500/60">Administration</span> v1.2.0
            </div>

            <div className="flex flex-wrap justify-center gap-8">
              {['Documentation', 'Support Center', 'System Status'].map(link => (
                <a
                  key={link}
                  href="#"
                  className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-emerald-400 transition-all hover:scale-105"
                >
                  {link}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-6">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center grayscale opacity-50">
                <img src={Logo} alt="Logo" className="w-5 h-5 object-contain" />
              </div>
            </div>
          </div>
        </footer>
      </div >
    </div >
  );
};

export default AdminDashboard;
