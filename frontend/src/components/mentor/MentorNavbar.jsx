import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    Search,
    UserPlus,
    DollarSign,
    Bell,
    ChevronDown,
    User,
    Settings,
    LogOut,
    ArrowLeft
} from "lucide-react";
import { useTranslation } from "react-i18next";
import Logo from "../../assets/Logo.svg";

const MentorNavbar = ({
    user,
    logout,
    activeTab,
    setActiveTab,
    notifications,
    requestStats,
    isNotificationsOpen,
    setIsNotificationsOpen,
    toggleDrawer
}) => {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState("");
    const [isRequestsOpen, setIsRequestsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: t('Home'), path: "/" },
        { name: t('About'), path: "/about" },
        { name: t('Contact'), path: "/contact" }
    ];

    const stats = {
        mentorship: { count: requestStats?.mentorship || 0 },
        funding: { count: requestStats?.funding || 0 }
    };

    const totalRequests = stats.mentorship.count + stats.funding.count;

    return (
        <nav className={`fixed top-0 left-0 right-0 z-[100] h-24 flex items-center transition-all duration-500 ${isScrolled
            ? "cinematic-glass border-b border-white/[0.08] shadow-[0_8px_40px_rgba(0,0,0,0.6)]"
            : "bg-transparent"
            }`}>
            <div className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 flex items-center h-full relative">
                {/* 1. LEFT: Branding & Back Button */}
                <div className="flex-1 flex justify-start items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2.5 rounded-xl bg-[var(--text-primary)]/5 border border-[var(--text-primary)]/5 hover:bg-emerald-500/20 hover:border-emerald-500/30 text-gray-400 hover:text-emerald-400 transition-all duration-300 group shrink-0"
                        aria-label={t('go_back')}
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <button
                        onClick={toggleDrawer}
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
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden xl:flex items-center gap-8">
                    {/* Navigation Links */}
                    <div className="flex items-center gap-6">
                        {navLinks.map((link) => {
                            const isActive = location.pathname === link.path;
                            return (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className="relative py-2 group shrink-0"
                                >
                                    <span className={`text-[15px] font-bold tracking-wide transition-all duration-500 ${isActive ? "text-[var(--text-primary)] text-glow-emerald" : "text-gray-400 group-hover:text-emerald-400"
                                        }`}>
                                        {link.name}
                                    </span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-underline"
                                            className="absolute -bottom-1 left-0 right-0 h-0.5 bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(6,182,212,0.8)]"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Divider */}
                    <div className="h-6 w-[1px] bg-white/10" />

                    {/* Search Bar */}
                    <div className="w-[240px] relative group">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-500 transition-colors">
                            <Search size={16} />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t('search_placeholder')}
                            className="w-full bg-[var(--text-primary)]/5 border border-[var(--text-primary)]/10 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/30 focus:bg-[var(--text-primary)]/10 focus:ring-4 focus:ring-emerald-500/5 transition-all text-ellipsis cinematic-glass"
                        />
                    </div>
                </div>

                {/* 3. RIGHT: Actions & Profile */}
                <div className="flex items-center gap-4 sm:gap-6 justify-end flex-1">
                    <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                        <div className="flex items-center gap-1 sm:gap-2">
                            {/* Requests Dropdown */}
                            {user?.role === 'Mentor' && (
                                <div className="relative">
                                    <button
                                        onClick={() => {
                                            setIsRequestsOpen(!isRequestsOpen);
                                            setIsProfileOpen(false);
                                            setIsNotificationsOpen(false);
                                        }}
                                        className={`p-2.5 rounded-xl transition-all relative ${isRequestsOpen ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
                                            }`}
                                    >
                                        <UserPlus size={20} />
                                        {totalRequests > 0 && (
                                            <span className="absolute top-2 right-2 w-4 h-4 flex items-center justify-center bg-emerald-600 text-[10px] rounded-full text-white font-bold ring-2 ring-[#0a0a0b] shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                                                {totalRequests}
                                            </span>
                                        )}
                                    </button>

                                    <AnimatePresence>
                                        {isRequestsOpen && (
                                            <motion.div
                                                layoutId="dropdown"
                                                className="absolute top-full mt-4 right-0 w-72 cinematic-glass rounded-2xl shadow-3xl overflow-hidden z-50 p-2"
                                            >
                                                <div className="px-3 py-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{t('pending_requests')}</div>
                                                <button
                                                    onClick={() => { setActiveTab('requests'); setIsRequestsOpen(false); }}
                                                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg group-hover:scale-110 transition-transform">
                                                            <UserPlus size={18} />
                                                        </div>
                                                        <div className="text-left">
                                                            <p className="text-sm font-bold text-[var(--text-primary)]">{t('mentorship')}</p>
                                                            <p className="text-[10px] text-gray-500">Review applicants</p>
                                                        </div>
                                                    </div>
                                                    {stats.mentorship.count > 0 && (
                                                        <span className="text-xs font-black bg-emerald-500 text-white px-2 py-0.5 rounded-md">{stats.mentorship.count}</span>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => { setActiveTab('fundingRequests'); setIsRequestsOpen(false); }}
                                                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-green-500/10 text-green-500 rounded-lg group-hover:scale-110 transition-transform">
                                                            <DollarSign size={18} />
                                                        </div>
                                                        <div className="text-left">
                                                            <p className="text-sm font-bold text-[var(--text-primary)]">{t('funding_requests')}</p>
                                                            <p className="text-[10px] text-gray-500">Investment opportunities</p>
                                                        </div>
                                                    </div>
                                                    {stats.funding.count > 0 && (
                                                        <span className="text-xs font-black bg-green-500 text-white px-2 py-0.5 rounded-md">{stats.funding.count}</span>
                                                    )}
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                            {/* Notifications */}
                            <div className="relative">
                                <button
                                    onClick={() => {
                                        setIsNotificationsOpen(!isNotificationsOpen);
                                        setIsProfileOpen(false);
                                        setIsRequestsOpen(false);
                                    }}
                                    className={`p-2.5 rounded-xl transition-all relative ${isNotificationsOpen ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
                                        }`}
                                >
                                    <Bell size={20} />
                                    {notifications.length > 0 && (
                                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[#0a0a0b] animate-pulse"></span>
                                    )}
                                </button>

                                <AnimatePresence>
                                    {isNotificationsOpen && (
                                        <motion.div
                                            layoutId="dropdown"
                                            className="absolute top-full mt-4 right-0 w-80 cinematic-glass rounded-2xl shadow-3xl overflow-hidden z-50"
                                        >
                                            <div className="p-4 border-b border-[var(--text-primary)]/5 flex items-center justify-between bg-[var(--text-primary)]/5">
                                                <h3 className="font-bold text-sm text-[var(--text-primary)]">{t('notifications_title')}</h3>
                                                <span className="text-[10px] uppercase font-black tracking-widest text-gray-500">{notifications.length} New</span>
                                            </div>
                                            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                                {notifications.length > 0 ? (
                                                    notifications.map((notif, i) => (
                                                        <button
                                                            key={i}
                                                            className="w-full p-4 border-b border-white/5 hover:bg-white/5 text-left transition-colors flex items-start gap-3 group"
                                                            onClick={() => {
                                                                if (notif.type === 'message') {
                                                                    setActiveTab('messages');
                                                                } else {
                                                                    setActiveTab(notif.type === 'funding' ? 'fundingRequests' : 'requests');
                                                                }
                                                                setIsNotificationsOpen(false);
                                                            }}
                                                        >
                                                            <div className="w-1.5 h-1.5 mt-2 rounded-full bg-emerald-500 shrink-0 group-hover:scale-150 transition-transform" />
                                                            <div>
                                                                <p className="text-sm text-gray-300 leading-snug group-hover:text-white transition-colors">{notif.message}</p>
                                                                <p className="text-[10px] text-gray-500 mt-1.5 font-bold uppercase tracking-wider">{notif.time}</p>
                                                            </div>
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className="p-10 text-center text-gray-500">
                                                        <Bell size={32} className="mx-auto mb-3 opacity-10" />
                                                        <p className="text-sm font-medium">Clear for now</p>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        <div className="w-[1px] h-6 bg-white/10 hidden lg:block mx-1" />

                        {/* Profile */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setIsProfileOpen(!isProfileOpen);
                                    setIsRequestsOpen(false);
                                    setIsNotificationsOpen(false);
                                }}
                                className="flex items-center gap-2 sm:gap-3 p-1 rounded-full group transition-all"
                            >
                                <div className="relative">
                                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl overflow-hidden ring-2 ring-white/5 group-hover:ring-emerald-500/50 transition-all duration-300">
                                        <img
                                            src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'Mentor'}&background=111&color=fff&bold=true`}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-emerald-500 border-[2.5px] sm:border-[3px] border-[#0a0a0b] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                </div>
                                <div className="hidden lg:block text-left mr-1">
                                    <p className="text-[12px] 2xl:text-[13px] font-bold text-[var(--text-primary)] truncate max-w-[80px] 2xl:max-w-none">{user?.name || "User"}</p>
                                    <p className="text-[10px] text-gray-500 font-medium whitespace-nowrap">
                                        {user?.role === 'Mentor' ? 'Expert Mentor' : 'Founder'}
                                    </p>
                                </div>
                                <ChevronDown size={14} className={`text-gray-500 transition-transform duration-300 ${isProfileOpen ? "rotate-180" : ""}`} />
                            </button>

                            <AnimatePresence>
                                {isProfileOpen && (
                                    <motion.div
                                        layoutId="dropdown"
                                        className="absolute top-full mt-4 right-0 w-60 cinematic-glass rounded-2xl shadow-3xl overflow-hidden z-50 p-2"
                                    >
                                        <button
                                            onClick={() => { setActiveTab('profile'); setIsProfileOpen(false); }}
                                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group"
                                        >
                                            <User size={18} className="text-gray-500 group-hover:text-emerald-500 transition-colors" />
                                            <span className="text-sm font-bold text-gray-300 group-hover:text-[var(--text-primary)]">{t('profile_overview')}</span>
                                        </button>
                                        <button
                                            onClick={() => { setActiveTab('settings'); setIsProfileOpen(false); }}
                                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group"
                                        >
                                            <Settings size={18} className="text-gray-500 group-hover:text-emerald-500 transition-colors" />
                                            <span className="text-sm font-bold text-gray-300 group-hover:text-[var(--text-primary)]">{t('account_settings')}</span>
                                        </button>
                                        <div className="h-px bg-white/5 my-2 mx-2" />
                                        <button
                                            onClick={logout}
                                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 text-red-500 transition-all font-bold"
                                        >
                                            <LogOut size={18} />
                                            <span className="text-sm">{t('logout')}</span>
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div >
                </div >
            </div >
        </nav >
    );
};

export default MentorNavbar;
