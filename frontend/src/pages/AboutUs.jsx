import React from 'react';
import { motion } from 'framer-motion';
import { Target, Users, Rocket, Award, Shield, Zap } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AboutUs = () => {
    const stats = [
        { label: "Active Startups", value: "500+", icon: Rocket },
        { label: "Expert Mentors", value: "200+", icon: Users },
        { label: "Funding Raised", value: "$50M+", icon: Award },
        { label: "Secure Transactions", value: "10k+", icon: Shield }
    ];

    const team = [
        { name: "Rudra Tiwari", image: "/rudra-tiwari.png" },
        { name: "Shreya Tripathi", image: "/shreya-tripathi.png" },
        { name: "Saumya Katiyar", image: "/saumya-katiyar.png" }
    ];

    return (
        <div className="bg-[var(--bg-primary)] min-h-screen text-[var(--text-primary)] transition-colors duration-300 overflow-hidden relative">
            <Navbar />

            {/* Background Ambience */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full" />
            </div>

            <main className="relative z-10 pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

                {/* Hero Section */}
                <section className="text-center mb-24">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-black uppercase tracking-[0.2em] mb-6"
                    >
                        Our Mission
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight mb-8"
                    >
                        Empowering the Next <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">
                            Titan of Industry
                        </span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-400 text-lg sm:text-xl max-w-3xl mx-auto font-medium leading-relaxed"
                    >
                        StartupLift is a premier platform dedicated to accelerating the growth of ambitious founders through strategic mentorship, high-impact networking, and streamlined funding protocols.
                    </motion.p>
                </section>

                {/* Stats Grid */}
                <section className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-32">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="cinematic-glass p-8 rounded-[2rem] border border-white/5 text-center group hover:border-emerald-500/30 transition-all duration-500"
                        >
                            <stat.icon size={32} className="mx-auto text-emerald-500/50 mb-4 group-hover:text-emerald-400 transition-colors" />
                            <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
                            <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{stat.label}</div>
                        </motion.div>
                    ))}
                </section>

                {/* Story Section */}
                <section className="grid lg:grid-cols-2 gap-16 items-center mb-32">
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-8"
                    >
                        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                            The Genesis of <span className="text-emerald-500">StartupLift</span>
                        </h2>
                        <div className="space-y-6 text-gray-400 text-base sm:text-lg leading-relaxed font-medium">
                            <p>
                                Founded in 2025 as a visionary college-driven initiative, StartupLift was created to simplify the challenging journey from startup ideation to real-world execution. We recognized that many promising student innovations fail not because of weak ideas, but due to limited access to mentorship, funding guidance, and a unified support ecosystem.
                            </p>
                            <p>
                                StartupLift bridges the gap between academic creativity and industry expertise. Our platform enables student founders to pitch their startup ideas, connect with experienced mentors, and receive strategic guidance and funding support. With smart matching and structured workflows, we empower young entrepreneurs to transform their ideas, projects, and research into scalable, sustainable startups.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <Zap className="text-amber-500" size={20} />
                                <span className="text-white font-bold text-sm">Rapid Execution</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Target className="text-emerald-500" size={20} />
                                <span className="text-white font-bold text-sm">Targeted Growth</span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 blur-[50px] rounded-full" />
                        <div className="relative cinematic-glass p-4 rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden h-[600px] group">
                            <iframe
                                src="/"
                                title="StartupLift Preview"
                                className="w-full h-full rounded-[1.5rem] border-0"
                                style={{ filter: 'grayscale(0%)' }} // Ensure clarity
                            />
                            {/* Removed overlay to allow interaction if desired, or keep generic overlay */}
                        </div>
                    </motion.div>
                </section>

                {/* Team Section */}
                <section className="mb-32">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">The Architects of Change</h2>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">A world-class team driving global innovation</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        {team.map((member, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="group"
                            >
                                <div className="cinematic-glass p-2 rounded-[2rem] border border-white/5 overflow-hidden mb-4 group-hover:border-emerald-500/30 transition-all duration-500">
                                    <div className="relative aspect-square overflow-hidden rounded-[1.5rem]">
                                        <img
                                            src={member.image}
                                            alt={member.name}
                                            className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700 transform group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                                <div className="text-center">
                                    <h3 className="text-white font-black uppercase text-sm tracking-tight">{member.name}</h3>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

            </main>

            <Footer />
        </div>
    );
};

export default AboutUs;
