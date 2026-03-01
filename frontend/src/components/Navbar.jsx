import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon, User, ArrowLeft, Zap } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";
import Logo from "../assets/Logo.svg";

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme, setLanguage } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => setIsOpen(false), [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (e, id) => {
    e.preventDefault();
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          const offset = 80;
          const bodyRect = document.body.getBoundingClientRect().top;
          const elementRect = element.getBoundingClientRect().top;
          const elementPosition = elementRect - bodyRect;
          const offsetPosition = elementPosition - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
          });
        }
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) {
        const offset = 80;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    }
    setIsOpen(false);
  };

  const navLinks = [
    { name: t('home'), path: "/" },
    { name: t('startups'), id: "startups" },
    { name: t('about'), path: "/about" },
    { name: t('vision'), id: "vision" },
    { name: t('faq'), id: "faq" },
    { name: t('contact'), path: "/contact" },
  ];

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    setLanguage(lang);
  };


  const navVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
        ease: "easeOut"
      }
    }
  };

  const itemVariants = {
    hidden: { y: -10, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.nav
      initial="hidden"
      animate="visible"
      variants={navVariants}
      className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 ${scrolled
        ? "bg-[var(--bg-glass)] backdrop-blur-md border-b border-[var(--text-primary)]/10 py-4 shadow-sm"
        : "bg-transparent py-6"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center">
        {/* Logo */}
        <motion.div variants={itemVariants}>
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-[var(--color-primary)] rounded-xl flex items-center justify-center text-white transform group-hover:rotate-12 transition-transform shadow-lg shadow-[var(--color-primary)]/20">
              <Zap size={22} fill="white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
              Startup<span className="text-emerald-500 text-glow-emerald">Lift</span>
            </span>
          </Link>
        </motion.div>

        {/* Desktop Nav */}
        <motion.div variants={itemVariants} className="hidden lg:flex items-center gap-10">
          <ul className="flex items-center gap-8">
            {navLinks.map((l, index) => (
              <li key={l.id || l.path || index}>
                {l.path ? (
                  <Link
                    to={l.path}
                    className="relative text-[var(--text-secondary)] hover:text-emerald-400 transition-colors font-medium text-sm tracking-wide group"
                  >
                    {l.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-400 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                ) : (
                  <a
                    href={`#${l.id}`}
                    onClick={(e) => handleNavClick(e, l.id)}
                    className="relative text-[var(--text-secondary)] hover:text-emerald-400 transition-colors font-medium text-sm tracking-wide group cursor-pointer"
                  >
                    {l.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-400 transition-all duration-300 group-hover:w-full"></span>
                  </a>
                )}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Right Side Actions */}
        <motion.div variants={itemVariants} className="hidden lg:flex items-center gap-6">
          <div className="flex items-center gap-3 bg-white/5 rounded-full px-2 py-1 border border-white/10">
            <div className="flex">
              <button
                onClick={() => handleLanguageChange('en')}
                className={`w-8 h-8 flex items-center justify-center text-[10px] font-bold rounded-full transition-all ${i18n.language === 'en' ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
              >
                EN
              </button>
              <button
                onClick={() => handleLanguageChange('hi')}
                className={`w-8 h-8 flex items-center justify-center text-[10px] font-bold rounded-full transition-all ${i18n.language === 'hi' ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
              >
                हिं
              </button>
              <button
                onClick={() => handleLanguageChange('es')}
                className={`w-8 h-8 flex items-center justify-center text-[10px] font-bold rounded-full transition-all ${i18n.language === 'es' ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
              >
                ES
              </button>
            </div>
            <div className="w-[1px] h-4 bg-white/10"></div>
            <button
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to={user ? "/dashboard" : "/signup"}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-shadow"
            >
              <User size={16} />
              {user ? t('dashboard') : t('create_account')}
            </Link>
          </motion.div>
        </motion.div>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center lg:hidden gap-4">
          <div className="flex bg-white/5 rounded-full p-1 border border-white/10">
            <button
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded-full text-white/70 hover:text-white transition-all"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>

          {location.pathname !== "/" && (
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 transition-all group"
              aria-label={t('go_back')}
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-full hover:bg-[var(--color-primary)]/10 transition-colors text-[var(--text-primary)]"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden absolute top-full left-0 w-full bg-[var(--bg-glass)] backdrop-blur-xl border-b border-[var(--text-primary)]/10 overflow-hidden shadow-2xl"
          >
            <div className="flex flex-col p-6 gap-6">
              <ul className="flex flex-col gap-2">
                {navLinks.map((l) => (
                  <li key={l.id}>
                    {l.path ? (
                      <Link
                        to={l.path}
                        onClick={() => setIsOpen(false)}
                        className="block px-4 py-3 text-[var(--text-secondary)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] rounded-lg transition-colors font-medium text-base"
                      >
                        {l.name}
                      </Link>
                    ) : (
                      <a
                        href={`#${l.id}`}
                        onClick={(e) => {
                          handleNavClick(e, l.id);
                          setIsOpen(false);
                        }}
                        className="block px-4 py-3 text-[var(--text-secondary)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] rounded-lg transition-colors font-medium text-base"
                      >
                        {l.name}
                      </a>
                    )}
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-4 border-t border-[var(--text-primary)]/10 pt-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-500">{t('language')}</span>
                  <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                    <button
                      onClick={() => handleLanguageChange('en')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${i18n.language === 'en' ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                      EN
                    </button>
                    <button
                      onClick={() => handleLanguageChange('hi')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${i18n.language === 'hi' ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                      HI
                    </button>
                    <button
                      onClick={() => handleLanguageChange('es')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${i18n.language === 'es' ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                      ES
                    </button>
                  </div>
                </div>

                <Link
                  to={user ? "/dashboard" : "/signup"}
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  <User size={18} />
                  {user ? t('dashboard') : t('create_account')}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );

}
