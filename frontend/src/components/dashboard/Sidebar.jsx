import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import {
  User,
  LayoutDashboard,
  Zap,
  Users,
  BookOpen,
  Activity,
  MessageSquare,
  LogOut,
  X,
  Moon,
  Sun,
  Settings
} from "lucide-react";
import { useTranslation } from "react-i18next";
import Logo from "../../assets/Logo.svg";

const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen, logout, user }) => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const menuItems = [
    { id: "overview", label: t('overview'), icon: LayoutDashboard },
    { id: "profile", label: t('profile'), icon: User },
    { id: "programs", label: t('programs'), icon: Zap },
    { id: "mentors", label: t('mentorship'), icon: Users },
    { id: "resources", label: t('resources'), icon: BookOpen },
    { id: "tracker", label: t('tracker'), icon: Activity },
    { id: "messages", label: t('messages'), icon: MessageSquare },
    { id: "network", label: t('network'), icon: Users },
    { id: "settings", label: t('settings'), icon: Settings },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (window.innerWidth < 1024) setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Global Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
          />

          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-screen w-72 bg-[var(--bg-primary)]/85 backdrop-blur-3xl border-r border-[var(--text-primary)]/10 z-[110] shadow-[30px_0_80px_rgba(0,0,0,0.9)] flex flex-col cinematic-glass overflow-hidden"
          >
            {/* 1. Sidebar Light Rays (Cinematic Sync) */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
              <div className="absolute top-[-10%] left-[-20%] w-[120%] h-[40%] bg-emerald-600/10 blur-[100px] rounded-full rotate-[-15deg] animate-pulse-soft" />
              <div className="absolute bottom-[-5%] right-[-10%] w-[100%] h-[30%] bg-emerald-600/10 blur-[120px] rounded-full rotate-[15deg]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] mix-blend-overlay bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:40px_40px]" />
            </div>
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="h-24 px-8 border-b border-white/5 flex items-center justify-between gap-4">
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

              {/* User Info (Mini) */}
              <div className="px-6 py-8">
                <div className="p-5 rounded-2x border border-white/5 bg-white/[0.03] backdrop-blur-3xl group hover:border-emerald-500/20 transition-all duration-500 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all duration-700" />

                  <div className="flex items-center gap-4 relative z-10">
                    <div className="relative">
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-[1.25rem] object-cover ring-2 ring-white/10 group-hover:ring-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all duration-500" />
                      ) : (
                        <div className="w-12 h-12 rounded-[1.25rem] bg-[#004d40] border border-emerald-500/20 flex items-center justify-center text-white text-xl font-bold shadow-[0_0_15px_rgba(16,185,129,0.1)] group-hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] transition-all">
                          {user?.name?.charAt(0) || "R"}
                        </div>
                      )}
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#10b981] rounded-full border-2 border-[#050b1e] shadow-[0_0_12px_rgba(16,185,129,0.6)] z-20" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-black text-[#94a3b8] truncate group-hover:text-white transition-all tracking-tight leading-none mb-1">
                        {user?.name || "Founder"}
                      </p>
                      <p className="text-[11px] text-[#475569] font-black uppercase tracking-[0.1em] leading-tight">
                        {t('startup_founder')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto px-4 space-y-2 custom-scrollbar">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`
                      w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-500 group relative
                      ${activeTab === item.id
                        ? "bg-gradient-to-r from-emerald-500/15 to-emerald-500/10 text-white border border-emerald-500/30 shadow-[0_8px_32_rgba(6,182,212,0.2)]"
                        : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                      }
                    `}
                  >
                    <div className={`p-2 rounded-xl transition-all duration-500 ${activeTab === item.id ? 'bg-emerald-500/20 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'bg-transparent'}`}>
                      <item.icon
                        size={20}
                        className={activeTab === item.id
                          ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                          : "text-gray-500 group-hover:text-emerald-400 transition-colors"
                        }
                      />
                    </div>
                    <span className={`font-bold text-[13px] tracking-wide transition-all ${activeTab === item.id ? "text-glow-emerald" : "group-hover:translate-x-1"}`}>
                      {item.label}
                    </span>

                    {activeTab === item.id && (
                      <motion.div
                        layoutId="activeTabGlow"
                        className="absolute left-0 w-1.5 h-6 bg-emerald-500 rounded-r-full shadow-[0_0_20px_rgba(6,182,212,1)]"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </button>
                ))}
              </nav>

              {/* Footer Actions */}
              <div className="p-4 border-t border-white/5 space-y-2 mt-auto bg-black/20">
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-gray-400 hover:text-white hover:bg-white/5 transition-all group"
                >
                  <div className="p-2 rounded-lg bg-white/5 group-hover:text-emerald-400 transition-colors">
                    {theme?.toLowerCase() === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                  </div>
                  <span className="font-bold text-sm">{theme?.toLowerCase() === 'dark' ? t('light_mode') : t('dark_mode')}</span>
                </button>

                <button
                  onClick={logout}
                  className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all font-bold text-sm group"
                >
                  <div className="p-2 rounded-lg bg-red-500/5 group-hover:scale-110 transition-transform">
                    <LogOut size={20} />
                  </div>
                  <span>{t('logout')}</span>
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;

