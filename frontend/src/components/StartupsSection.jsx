import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import axios from '../api/axiosInstance';

export default function StartupsSection() {
  const { t } = useTranslation();
  const [startups, setStartups] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const fetchStartups = async () => {
      try {
        const res = await axios.get("/startups");
        setStartups(res.data);
      } catch (err) {
        console.error("Failed to fetch startups", err);
      }
    };
    fetchStartups();
  }, []);

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.9,
    }),
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset, velocity) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => (prevIndex + newDirection + startups.length) % startups.length);
  };

  if (startups.length === 0) {
    return (
      <section className="py-24 bg-[var(--bg-primary)] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-bold text-xs uppercase tracking-[0.2em]">{t('sync_ecosystem')}</p>
      </section>
    );
  }

  const currentStartup = startups[currentIndex];

  return (
    <section id="startups" className="py-12 sm:py-16 md:py-24 bg-[var(--bg-primary)] overflow-hidden relative">
      {/* Texture Background */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#888_1px,transparent_1px)] [background-size:20px_20px]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8 md:mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-3 md:mb-4">
            {t('fresh_ideas')} <span className="text-emerald-500/80">{t('horizon')}</span>
          </h2>
          <p className="text-[var(--text-secondary)] text-base sm:text-lg max-w-2xl font-medium">
            {t('startups_desc')}
          </p>
        </motion.div>

        <motion.button
          className="flex items-center gap-2 text-emerald-400 font-black uppercase tracking-widest text-[10px] hover:text-white transition-all group"
          whileHover={{ x: 5 }}
        >
          {t('view_all_startups')} <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </div>

      {/* Improved Slider Container */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-12 py-10 min-h-[500px] flex items-center justify-center">

        {/* Navigation Buttons */}
        <button
          className="absolute left-0 z-30 p-2 sm:p-4 rounded-full bg-white/5 border border-white/10 text-white hover:bg-emerald-500 hover:border-emerald-500 transition-all shadow-xl backdrop-blur-md group"
          onClick={() => paginate(-1)}
        >
          <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>

        <button
          className="absolute right-0 z-30 p-2 sm:p-4 rounded-full bg-white/5 border border-white/10 text-white hover:bg-emerald-500 hover:border-emerald-500 transition-all shadow-xl backdrop-blur-md group"
          onClick={() => paginate(1)}
        >
          <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>

        <div className="w-full relative overflow-visible flex justify-center">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
                scale: { duration: 0.4 }
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = swipePower(offset.x, velocity.x);
                if (swipe < -swipeConfidenceThreshold) {
                  paginate(1);
                } else if (swipe > swipeConfidenceThreshold) {
                  paginate(-1);
                }
              }}
              className="w-full max-w-xl cinematic-glass border border-white/5 rounded-[2.5rem] p-6 sm:p-10 flex flex-col md:flex-row gap-8 shadow-[0_40px_100px_rgba(0,0,0,0.5)] relative overflow-hidden"
            >
              {/* Internal Glow */}
              <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />

              {/* Image Section */}
              <div className="w-full md:w-1/2 h-64 md:h-auto rounded-3xl overflow-hidden relative border border-white/10 shadow-2xl">
                <img
                  src={currentStartup.image}
                  alt={currentStartup.name}
                  className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-500 text-[10px] font-black text-white tracking-wider uppercase">
                    {currentStartup.category}
                  </span>
                </div>
              </div>

              {/* Content Section */}
              <div className="w-full md:w-1/2 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">{currentStartup.date}</span>
                    <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-white/5 border border-white/5">
                      <Eye size={12} className="text-emerald-400" />
                      <span className="text-gray-400 text-[10px]">{currentStartup.views}</span>
                    </div>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-4 tracking-tight">
                    {currentStartup.name}
                  </h3>

                  <p className="text-[14px] text-gray-400 leading-relaxed mb-8 font-medium italic">
                    "{currentStartup.desc}"
                  </p>

                  <div className="flex items-center gap-4 mb-8">
                    {currentStartup.author?.avatar && (
                      <img
                        src={currentStartup.author.avatar}
                        alt={currentStartup.author.name}
                        className="w-12 h-12 rounded-2xl border-2 border-white/10 shadow-lg"
                      />
                    )}
                    <div>
                      <p className="text-sm font-black text-white">{currentStartup.author?.name}</p>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{currentStartup.author?.role}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white text-[12px] font-black py-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 uppercase tracking-widest">
                    {t('details')}
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pagination Dots */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-3 pb-4">
          {startups.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setDirection(idx > currentIndex ? 1 : -1);
                setCurrentIndex(idx);
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? "w-8 bg-emerald-500" : "bg-white/20 hover:bg-white/40"
                }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
