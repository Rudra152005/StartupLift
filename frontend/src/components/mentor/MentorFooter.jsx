import React from 'react';
import { Link } from 'react-router-dom';
import {
    Github,
    Linkedin,
    ExternalLink,
    Heart,
    HelpCircle,
    Shield,
    ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import Logo from '../../assets/Logo.svg';

// Custom X Icon (formerly Twitter)
const XIcon = ({ size = 18 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
    >
        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.292 19.49h2.039L6.486 3.24H4.298l13.311 17.403z" />
    </svg>
);

const MentorFooter = ({ setActiveTab, userRole = "Mentor" }) => {
    const currentYear = new Date().getFullYear();

    const mentorLinks = [
        { name: "Dashboard", action: () => setActiveTab('overview') },
        { name: "Requests", action: () => setActiveTab('requests') },
        { name: "Sessions & Calendar", action: () => setActiveTab('sessions') },
        { name: "Messages", action: () => setActiveTab('messages') },
        { name: "Resources", action: () => setActiveTab('resources') },
    ];

    const userLinks = [
        { name: "Dashboard", action: () => setActiveTab('overview') },
        { name: "Programs", action: () => setActiveTab('programs') },
        { name: "Mentorship", action: () => setActiveTab('mentors') },
        { name: "Resources", action: () => setActiveTab('resources') },
        { name: "Tracker", action: () => setActiveTab('tracker') },
    ];

    const activeLinks = userRole === "Mentor" ? mentorLinks : userLinks;

    const sections = [
        {
            title: "Quick Links",
            links: activeLinks
        },
        {
            title: "Support & Company",
            links: [
                { name: "Help Center", path: "/help" },
                { name: "Terms & Privacy", path: "/privacy" },
                { name: "About StartupLift", path: "/about" },
                { name: "Contact Support", path: "/contact" },
            ]
        }
    ];

    return (
        <footer className="w-full relative mt-auto pt-20 pb-12 overflow-hidden bg-[#020617]">
            {/* Cinematic Background Layers */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent opacity-20" />

            {/* Subtle Light Bloom */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-64 bg-emerald-600/5 blur-[120px] rounded-full pointer-events-none" />

            {/* Floating Particle Mock (Static) */}
            <div className="absolute top-20 right-20 w-1 h-1 bg-amber-400/20 blur-sm rounded-full animate-float-cinematic" />
            <div className="absolute top-40 left-1/4 w-1.5 h-1.5 bg-emerald-400/10 blur-sm rounded-full animate-float-cinematic delay-1000" />

            <div className="max-w-[1600px] mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-16">

                    {/* Brand Section */}
                    <div className="space-y-6">
                        <div className="relative group w-fit">
                            <Link to="/" className="flex items-center gap-3 cursor-pointer">
                                <div className="w-10 h-10 flex items-center justify-center p-2 bg-white/5 rounded-2xl group-hover:bg-emerald-500/10 transition-all duration-500 border border-white/5 group-hover:border-emerald-500/20 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                                    <img src={Logo} alt="Logo" className="w-full h-full object-contain" />
                                </div>
                                <span className="text-xl font-bold text-white tracking-tight">
                                    Startup<span className="text-emerald-500 font-black text-glow-emerald">Lift</span>
                                </span>
                            </Link>
                        </div>

                        <p className="text-gray-400/70 text-[14px] leading-relaxed max-w-sm transition-colors hover:text-gray-300/90 cursor-default">
                            Empowering the next generation of founders through world-class mentorship and institutional support.
                        </p>

                        <div className="flex items-center gap-3.5">
                            {[
                                { icon: Linkedin, name: "LinkedIn" },
                                { icon: XIcon, name: "X" },
                                { icon: Github, name: "GitHub" }
                            ].map((social) => (
                                <motion.a
                                    key={social.name}
                                    href="#"
                                    whileHover={{ scale: 1.15, y: -4 }}
                                    className="p-2.5 bg-white/5 rounded-xl text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] border border-white/5 hover:border-emerald-500/30 transition-all active:scale-95 cursor-pointer"
                                >
                                    <social.icon size={18} />
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Links Sections with Enhanced Animation */}
                    {sections.map((section) => (
                        <div key={section.title} className="space-y-6">
                            <div className="space-y-2.5">
                                <h4 className="text-[13px] font-medium text-gray-300 tracking-wide">
                                    {section.title}
                                </h4>
                                <div className="w-10 h-px bg-white/5" />
                            </div>
                            <ul className="space-y-3.5">
                                {section.links.map((link) => (
                                    <li key={link.name}>
                                        {link.action ? (
                                            <button
                                                onClick={link.action}
                                                className="group flex items-center gap-2 text-[14px] font-medium text-gray-500 hover:text-white transition-all duration-300 cursor-pointer"
                                            >
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 scale-0 group-hover:scale-100 transition-all duration-500 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                                                <span className="transform group-hover:translate-x-2 transition-transform duration-500">
                                                    {link.name}
                                                </span>
                                            </button>
                                        ) : (
                                            <Link
                                                to={link.path}
                                                className="group flex items-center gap-2 text-[14px] font-medium text-gray-500 hover:text-white transition-all duration-300 cursor-pointer"
                                            >
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 scale-0 group-hover:scale-100 transition-all duration-500 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                                                <span className="transform group-hover:translate-x-2 transition-transform duration-500">
                                                    {link.name}
                                                </span>
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* System Status Card - Compact */}
                    <div className="space-y-6">
                        <div className="space-y-2.5">
                            <h4 className="text-[13px] font-medium text-gray-300 tracking-wide">
                                System Status
                            </h4>
                            <div className="w-10 h-px bg-white/5" />
                        </div>
                        <div className="cinematic-glass border border-white/[0.08] rounded-2xl p-5 shadow-2xl group hover:border-emerald-500/20 transition-all duration-500 overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 blur-2xl group-hover:bg-emerald-500/20 transition-all" />
                            <div className="flex items-center gap-3 mb-4 relative z-10">
                                <div className="relative">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
                                    <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping opacity-40" />
                                </div>
                                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-300">Fast & Active</span>
                            </div>
                            <div className="h-px bg-white/[0.05] mb-4" />
                            <a
                                href="#"
                                className="group/btn flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-emerald-400 transition-all cursor-pointer"
                            >
                                <span>Real-time Status</span>
                                <div className="p-1 bg-white/5 rounded-lg group-hover/btn:bg-emerald-500/10 transition-colors">
                                    <ArrowRight size={10} className="group-hover/btn:translate-x-0.5 transition-transform" />
                                </div>
                            </a>
                        </div>
                    </div>

                </div>

                {/* Bottom Bar - Slim */}
                <div className="pt-8 border-t border-white/5 flex flex-col items-center justify-between gap-6 md:flex-row">
                    <p className="text-[12px] text-gray-500/50 font-medium">
                        © {currentYear} StartupLift. Built with <Heart size={10} fill="currentColor" className="inline-block text-red-500/60 mx-0.5" />.
                    </p>

                    <div className="flex flex-wrap justify-center items-center gap-3.5 md:gap-5">
                        <div className="flex items-center gap-3 px-4 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-[11px] text-gray-400 font-black uppercase tracking-widest hover:bg-white/[0.06] hover:text-white transition-all cursor-help hover:border-emerald-500/20">
                            <Shield size={14} className="text-emerald-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                            <span>ISO 27001 Certified</span>
                        </div>
                        <div className="flex items-center gap-3 px-4 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-[11px] text-gray-400 font-black uppercase tracking-widest hover:bg-white/[0.06] hover:text-white transition-all cursor-help hover:border-emerald-500/20">
                            <HelpCircle size={14} className="text-emerald-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                            <span>Elite Support</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default MentorFooter;
