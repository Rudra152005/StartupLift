import { motion, useMotionValue, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import growImg from "../assets/growth-chart.png";

function HeroSection() {
  const { t } = useTranslation();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-300, 300], [6, -6]);
  const rotateY = useTransform(mouseX, [-300, 300], [-6, 6]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX - window.innerWidth / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <section className="relative w-full min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-inter overflow-x-hidden overflow-y-visible">

      {/* Background ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-25%] left-[-15%] w-[400px] md:w-[700px] h-[400px] md:h-[700px] bg-[var(--color-primary)]/5 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-25%] right-[-15%] w-[350px] md:w-[600px] h-[350px] md:h-[600px] bg-[var(--color-primary)]/8 blur-[120px] rounded-full" />
      </div>

      {/* FULL WIDTH GRID */}
      <div className="relative z-10 w-full px-4 sm:px-6 md:px-12 lg:px-20 pt-20 sm:pt-24 md:pt-28 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">

        {/* LEFT CONTENT */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="space-y-6 md:space-y-8"
        >
          <span className="inline-block px-3 md:px-4 py-1.5 rounded-full border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 text-[var(--color-primary)] text-xs sm:text-sm font-medium">
            {t('hero_subtitle')}
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
            {t('hero_title_1')} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]">
              {t('hero_title_2')}
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-[var(--text-secondary)] max-w-xl leading-relaxed">
            {t('hero_description')}
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4">
            <Link
              to="/signup"
              className="px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-[var(--color-primary)] text-white font-semibold text-base sm:text-lg shadow-lg shadow-[var(--color-primary)]/25 hover:opacity-90 transition text-center"
            >
              {t('start_pitch')}
            </Link>

            <a
              href="#startups"
              className="px-6 sm:px-8 py-3 sm:py-4 rounded-full border border-[var(--color-primary)]/30 text-base sm:text-lg hover:bg-[var(--color-primary)]/5 transition text-center"
            >
              {t('browse_projects')}
            </a>
          </div>

          <div className="flex items-center gap-3 md:gap-4 text-xs sm:text-sm text-[var(--text-secondary)]">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-[var(--bg-primary)] bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-600"
                >
                  U{i}
                </div>
              ))}
            </div>
            <span>{t('joined_by')}</span>
          </div>
        </motion.div>

        {/* RIGHT VISUAL */}
        <motion.div
          style={{ rotateX, rotateY, perspective: 1200 }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="relative hidden md:block w-full overflow-visible"
        >
          <div className="relative p-4 lg:p-6 rounded-3xl bg-[var(--bg-primary)]/50 backdrop-blur-xl border border-[var(--color-primary)]/10 shadow-2xl">
            <img
              src={growImg}
              alt="Startup Growth"
              fetchPriority="high"
              className="w-full h-auto rounded-2xl object-cover"
            />

            {/* Floating Badge */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-4 -left-4 md:-left-8 p-3 md:p-4 bg-[var(--bg-primary)] rounded-xl border border-[var(--color-primary)]/10 shadow-xl flex items-center gap-2 md:gap-3"
            >
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-green-100 flex items-center justify-center text-lg md:text-xl">
                📈
              </div>
              <div>
                <p className="text-xs md:text-sm font-bold text-[var(--text-primary)]">
                  {t('growth_stat')}
                </p>
                <p className="text-[10px] md:text-xs text-[var(--text-secondary)]">
                  {t('last_month')}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Decorative blobs */}
          <div className="absolute -top-8 md:-top-12 -right-8 md:-right-12 w-24 h-24 md:w-36 md:h-36 bg-[var(--color-primary)]/20 blur-3xl rounded-full" />
          <div className="absolute -bottom-8 md:-bottom-12 -left-8 md:-left-12 w-28 h-28 md:w-44 md:h-44 bg-[var(--color-secondary)]/20 blur-3xl rounded-full" />
        </motion.div>

      </div>
    </section>
  );
}

export default HeroSection;
