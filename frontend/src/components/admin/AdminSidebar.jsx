import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Briefcase,
  Zap,
  Calendar,
  FileText,
  BarChart2,
  Settings,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../../assets/Logo.svg';

const AdminSidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen, user, logout }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const menuItems = [
    { id: 'overview', label: t('overview'), icon: LayoutDashboard },
    { id: 'users', label: t('user_management'), icon: Users },
    { id: 'mentors', label: t('mentor_management'), icon: UserPlus },
    { id: 'startups', label: t('startup_management'), icon: Briefcase },
    { id: 'programs', label: t('programs'), icon: Zap },
    { id: 'sessions', label: t('mentorship_sessions'), icon: Calendar },
    { id: 'content', label: t('content_management'), icon: FileText },
    { id: 'reports', label: t('reports_analytics'), icon: BarChart2 },
    { id: 'settings', label: t('settings'), icon: Settings },
    { id: 'logs', label: t('platform_logs'), icon: Shield },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Global Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[150]"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{
          x: isOpen ? 0 : -320,
          opacity: isOpen ? 1 : 0
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 h-full w-[300px] sm:w-[320px] bg-[var(--bg-primary)]/80 backdrop-blur-3xl border-r border-[var(--text-primary)]/5 z-[200] flex flex-col shadow-[25px_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
      >
        {/* Cinematic Background Elements for Sidebar */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
          <div className="absolute top-0 right-0 w-full h-[500px] bg-gradient-to-b from-emerald-500/10 via-emerald-500/5 to-transparent blur-3xl" />
          <div className="absolute bottom-0 left-0 w-full h-[300px] bg-gradient-to-t from-emerald-600/10 via-transparent to-transparent blur-2xl" />
          {/* Internal Light Rays */}
          <div className="absolute top-1/4 -right-20 w-40 h-[600px] bg-emerald-500/10 blur-[100px] rotate-12" />
        </div>

        {/* Header (Branding) */}
        <div className="relative z-10 h-32 flex items-center px-8">
          <Link
            to="/"
            className="flex items-center gap-4 group transition-transform hover:scale-105"
          >
            <div className="w-12 h-12 flex items-center justify-center p-2.5 bg-[var(--bg-primary)] rounded-[1.25rem] border border-[var(--text-primary)]/10 shadow-[0_0_20px_rgba(255,255,255,0.02)] group-hover:border-emerald-500/30 transition-all duration-500">
              <img src={Logo} alt="StartupLift" className="w-full h-full object-contain opacity-90 group-hover:opacity-100 dark:brightness-100 brightness-0 transition-all" />
            </div>
            <span className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
              Startup<span className="bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent text-glow-emerald">Lift</span>
            </span>
          </Link>
        </div>

        {/* Navigation Section */}
        <nav className="relative z-10 flex-1 overflow-y-auto px-4 py-4 space-y-1.5 custom-scrollbar">
          <div className="px-4 mb-4">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500/80">{t('main_administration')}</span>
          </div>

          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (window.innerWidth < 1024) setIsOpen(false);
              }}
              className={`
                w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-500 group relative overflow-hidden
                ${activeTab === item.id
                  ? "bg-gradient-to-r from-emerald-500/15 via-emerald-500/10 to-transparent text-white shadow-[inset_0_0_20px_rgba(34,211,238,0.05)]"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
                }
              `}
            >
              {/* Active Marker */}
              {activeTab === item.id && (
                <motion.div
                  layoutId="active-marker"
                  className="absolute left-0 w-1.5 h-8 bg-emerald-500 rounded-r-full shadow-[0_0_15px_rgba(6,182,212,0.8)]"
                />
              )}

              <item.icon
                size={22}
                className={`flex-shrink-0 transition-all duration-500 ${activeTab === item.id ? "text-emerald-400 scale-110 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" : "group-hover:text-emerald-400 group-hover:scale-110"
                  }`}
              />

              <span className={`text-sm tracking-tight transition-all duration-500 ${activeTab === item.id ? "font-bold" : "font-medium"}`}>
                {item.label}
              </span>

              {/* Hover Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </button>
          ))}
        </nav>

        {/* User Profile Section (Bottom) */}
        <div className="relative z-10 p-6 border-t border-white/5 bg-white/[0.02]">
          <button
            onClick={() => setActiveTab('profile')}
            className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-all group"
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-[1.25rem] bg-[#004d40] border border-emerald-500/20 flex items-center justify-center text-white text-xl font-bold shadow-[0_0_15px_rgba(16,185,129,0.1)] group-hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] transition-all overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0) || "A"
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#10b981] rounded-full border-2 border-[#050b1e] shadow-[0_0_12px_rgba(16,185,129,0.6)] z-20" />
            </div>

            <div className="flex-1 text-left min-w-0">
              <p className="text-[15px] font-black text-[#94a3b8] truncate group-hover:text-white transition-all tracking-tight leading-none mb-1">
                {user?.name || "Admin"}
              </p>
              <p className="text-[11px] text-[#475569] font-black uppercase tracking-[0.1em] leading-tight">
                {t('system_navigator')}
              </p>
            </div>
          </button>

          <button
            onClick={handleLogout}
            className="w-full mt-4 flex items-center justify-center gap-2 p-3.5 rounded-2xl text-red-500/70 hover:text-red-500 hover:bg-red-500/10 transition-all font-black text-xs uppercase tracking-[0.2em]"
          >
            <LogOut size={18} /> {t('logout')}
          </button>
        </div>
      </motion.aside>
    </>
  );
};

export default AdminSidebar;
