import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaEnvelope,
  FaLinkedinIn,
  FaGithub,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

import { Link } from "react-router-dom";

function Footer() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setEmail("");
  };

  const socialIcons = [
    { Icon: FaEnvelope, color: "#EA4335", link: "mailto:rudratiwari152005@gmail.com" },
    { Icon: FaFacebookF, color: "#1877F2", link: "https://www.facebook.com/profile.php?id=61556300785953" },
    { Icon: FaInstagram, color: "#E4405F", link: "https://www.instagram.com/rudratiwari285/?next=%2F" },
    { Icon: FaXTwitter, color: "#000000", link: "https://x.com/tiwar95562" },
    { Icon: FaLinkedinIn, color: "#0A66C2", link: "https://www.linkedin.com/in/rudra-tiwari05/" },
    { Icon: FaGithub, color: "#333333", link: "https://github.com/Rudra152005" },
    { Icon: FaYoutube, color: "#FF0000", link: "https://www.youtube.com/channel/UCRR6aTNgpsNLEl_YiPrC70w" },
  ];

  const quickLinks = [
    { name: t('home'), path: "/" },
    { name: t('startups'), id: "startups" },
    { name: t('about'), path: "/about" },
    { name: t('vision'), id: "vision" },
    { name: t('faq'), id: "faq" },
    { name: t('contact'), path: "/contact" },
  ];

  const handleNavClick = (e, id) => {
    if (id) {
      e.preventDefault();
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.href = `/#${id}`;
      }
    }
  };

  /* Animation variants */
  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.footer
      id="footer"
      className="relative w-full bg-[#020617] text-white overflow-hidden"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* ===== Gradient Wave ===== */}
      <div className="absolute top-0 left-0 w-full h-[60px] md:h-[90px] overflow-hidden z-10 opacity-30">
        <motion.svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="absolute w-[200%] h-full"
        >
          <path
            d="M0,60 C300,20 600,110 900,70 1100,40 1300,90 1500,60 L1500,0 L0,0 Z"
            fill="url(#footerWave)"
          />
        </motion.svg>
      </div>

      {/* ===== CONTENT ===== */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="relative z-20 w-full px-4 sm:px-6 md:px-12 lg:px-20 pt-16 sm:pt-20 md:pt-24 pb-6 md:pb-8"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 md:gap-12 mb-10 md:mb-14">

          {/* Brand */}
          <motion.div variants={item} className="sm:col-span-2 lg:col-span-1 space-y-4">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Startup
              <motion.span
                className="text-emerald-500 relative inline-block"
                animate={{
                  textShadow: [
                    "0 0 8px rgba(6, 182, 212, 0.3)",
                    "0 0 16px rgba(6, 182, 212, 0.5)",
                    "0 0 8px rgba(6, 182, 212, 0.3)"
                  ]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                Lift
                <motion.span
                  className="absolute bottom-0 left-0 h-[2px] bg-emerald-500"
                  initial={{ width: "0%" }}
                  animate={{ width: ["0%", "100%", "0%"] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    times: [0, 0.5, 1]
                  }}
                />
              </motion.span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-medium max-w-xs">
              {t('footer_brand_desc')}
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={item} className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 underline decoration-emerald-500/30 underline-offset-8">
              {t('quick_protocols')}
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link, i) => (
                <motion.li
                  key={link.name}
                  className="group relative overflow-hidden"
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {link.path ? (
                    <Link
                      to={link.path}
                      className="text-[13px] font-black text-gray-400 group-hover:text-emerald-400 transition-colors duration-300 uppercase tracking-widest flex items-center gap-3"
                    >
                      <motion.span
                        className="w-1.5 h-1.5 rounded-full bg-emerald-500/30"
                        whileHover={{
                          scale: 1.5,
                          backgroundColor: "rgb(6, 182, 212)",
                          boxShadow: "0 0 8px rgba(6, 182, 212, 0.6)"
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      />
                      <span className="relative">
                        {link.name}
                        <motion.span
                          className="absolute bottom-0 left-0 h-[1px] bg-emerald-500"
                          initial={{ width: "0%" }}
                          whileHover={{ width: "100%" }}
                          transition={{ duration: 0.3 }}
                        />
                      </span>
                    </Link>
                  ) : (
                    <a
                      href={`#${link.id}`}
                      onClick={(e) => handleNavClick(e, link.id)}
                      className="text-[13px] font-black text-gray-400 group-hover:text-emerald-400 transition-colors duration-300 uppercase tracking-widest flex items-center gap-3"
                    >
                      <motion.span
                        className="w-1.5 h-1.5 rounded-full bg-emerald-500/30"
                        whileHover={{
                          scale: 1.5,
                          backgroundColor: "rgb(6, 182, 212)",
                          boxShadow: "0 0 8px rgba(6, 182, 212, 0.6)"
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      />
                      <span className="relative">
                        {link.name}
                        <motion.span
                          className="absolute bottom-0 left-0 h-[1px] bg-emerald-500"
                          initial={{ width: "0%" }}
                          whileHover={{ width: "100%" }}
                          transition={{ duration: 0.3 }}
                        />
                      </span>
                    </a>
                  )}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Newsletter + Social */}
          <motion.div variants={item} className="sm:col-span-2 space-y-4">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-1.5">
                {t('newsletter_title')}
              </h3>
              <p className="text-sm sm:text-base text-white/70 leading-relaxed">
                {t('newsletter_desc')}
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-2.5"
            >
              <motion.input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('email_address')}
                required
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md text-sm md:text-base text-white placeholder:text-gray-500 focus:outline-none transition-all duration-300"
                whileFocus={{
                  borderColor: "var(--color-primary)",
                  boxShadow: "0 0 0 3px rgba(6, 182, 212, 0.1), 0 0 20px rgba(6, 182, 212, 0.2)"
                }}
              />
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="px-5 md:px-6 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm md:text-base font-medium hover:bg-[var(--color-secondary)] transition-colors duration-300 shadow-lg shadow-emerald-500/20"
              >
                {t('subscribe')}
              </motion.button>
            </form>

            {/* Social Icons */}
            <div className="flex gap-2.5 md:gap-3 flex-wrap pt-1">
              {socialIcons.map(({ Icon, color, link }, i) => (
                <motion.a
                  key={i}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-xl bg-white/10 border border-white/20 cursor-pointer backdrop-blur-md"
                  whileHover={{
                    y: -4,
                    scale: 1.1,
                    backgroundColor: color,
                    boxShadow: `0 8px 24px ${color}60, 0 0 20px ${color}40`,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 15,
                  }}
                >
                  <Icon className="text-lg md:text-xl text-white" />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Animated Divider */}
        <motion.div
          className="relative h-[1px] w-full my-6 md:my-8 overflow-hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent"
            animate={{
              x: ["-100%", "100%"],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.5, 1]
            }}
          />
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          variants={item}
          className="flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-white/60"
        >
          <span className="text-center md:text-left font-medium">
            © {new Date().getFullYear()} StartupLift. {t('all_rights_reserved')}
          </span>
          <div className="flex gap-5 md:gap-6">
            <motion.span
              className="cursor-pointer transition-colors duration-300 hover:text-[var(--color-primary)] relative group"
              whileHover={{ x: 2 }}
            >
              {t('privacy_policy')}
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[var(--color-primary)] group-hover:w-full transition-all duration-300" />
            </motion.span>
            <motion.span
              className="cursor-pointer transition-colors duration-300 hover:text-[var(--color-primary)] relative group"
              whileHover={{ x: 2 }}
            >
              {t('terms_of_service')}
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[var(--color-primary)] group-hover:w-full transition-all duration-300" />
            </motion.span>
          </div>
        </motion.div>
      </motion.div>
    </motion.footer>
  );
}

export default Footer;
