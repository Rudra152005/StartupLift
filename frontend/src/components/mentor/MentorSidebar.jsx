import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Rocket,
  Calendar,
  FileText,
  Bell,
  User,
  Settings,
  LogOut,
  MessageSquare,
  CheckCircle,
  X,
  DollarSign
} from "lucide-react";
import { useTranslation } from 'react-i18next';
import Logo from "../../assets/Logo.svg";

const MentorSidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen, logout, user }) => {
  const { t } = useTranslation();
  const menuItems = [
    { id: "overview", label: t('dashboard'), icon: LayoutDashboard },
    { id: "requests", label: t('mentorship_requests'), icon: UserPlus },
    { id: "fundingRequests", label: t('funding_requests'), icon: DollarSign },
    { id: "startups", label: t('my_startups'), icon: Rocket },
    { id: "mentees", label: t('my_mentees'), icon: Users },
    { id: "sessions", label: t('sessions_calendar'), icon: Calendar },
    { id: "tasks", label: t('tasks_feedback'), icon: CheckCircle },
    { id: "messages", label: t('messages'), icon: MessageSquare },
    { id: "resources", label: t('resources'), icon: FileText },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (window.innerWidth < 1024) setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
          />

          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-screen w-72 bg-[var(--bg-primary)]/80 backdrop-blur-2xl border-r border-[var(--text-primary)]/5 z-[110] shadow-[20px_0_60px_rgba(0,0,0,0.8)] flex flex-col cinematic-glass"
          >
            <div className="h-24 px-8 border-b border-[var(--text-primary)]/5 flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center p-2 bg-[var(--text-primary)]/5 rounded-2xl border border-[var(--text-primary)]/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                <img src={Logo} alt="Logo" className="w-full h-full object-contain dark:brightness-100 brightness-0 transition-all" />
              </div>
              <span className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
                Startup<span className="text-emerald-500 text-glow-emerald">Lift</span>
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="ml-auto lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${activeTab === item.id
                    ? "bg-emerald-500/10 text-white border border-emerald-500/20 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                    : "text-gray-400 hover:text-emerald-400 hover:bg-white/5 border border-transparent"
                    }`}
                >
                  <item.icon
                    size={20}
                    className={activeTab === item.id ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" : "text-gray-500 group-hover:text-emerald-400 transition-colors"}
                  />
                  <span className={`font-bold text-sm tracking-wide ${activeTab === item.id ? "text-glow-emerald" : ""}`}>{item.label}</span>
                </button>
              ))}

              {/* Public Links (Mobile Only) */}
              <div className="lg:hidden pt-4 mt-4 border-t border-white/5 space-y-1">
                <Link
                  to="/"
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  <span className="font-medium">{t('home')}</span>
                </Link>
                <Link
                  to="/about"
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  <span className="font-medium">{t('about')}</span>
                </Link>
                <Link
                  to="/contact"
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  <span className="font-medium">{t('contact')}</span>
                </Link>
              </div>
            </nav>

            <div className="p-4 border-t border-white/5 space-y-2">
              <button
                onClick={() => handleNavClick('profile')}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${activeTab === 'profile' ? "bg-emerald-500/10 text-white border border-emerald-500/20" : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
              >
                <User size={20} className={activeTab === 'profile' ? "text-emerald-400" : "text-gray-500"} />
                <span className={`font-bold text-sm ${activeTab === 'profile' ? "text-glow-emerald" : ""}`}>{t('my_profile')}</span>
              </button>
              <button
                onClick={() => handleNavClick('settings')}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${activeTab === 'settings' ? "bg-emerald-500/10 text-white border border-emerald-500/20" : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
              >
                <Settings size={20} className={activeTab === 'settings' ? "text-emerald-400" : "text-gray-500"} />
                <span className={`font-bold text-sm ${activeTab === 'settings' ? "text-glow-emerald" : ""}`}>{t('settings')}</span>
              </button>
              <button
                onClick={logout}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all font-medium"
              >
                <LogOut size={20} />
                <span>{t('logout')}</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MentorSidebar;
