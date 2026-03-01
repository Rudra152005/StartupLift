import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Globe, Rocket, Zap, Sliders, Users, Command } from "lucide-react";

export default function VisionSection() {
  const { t } = useTranslation();

  const features = [
    {
      icon: <Globe className="w-6 h-6" />,
      title: t('feature_1_title'),
      desc: t('feature_1_desc')
    },
    {
      icon: <Rocket className="w-6 h-6" />,
      title: t('feature_2_title'),
      desc: t('feature_2_desc')
    },
    {
      icon: <Command className="w-6 h-6" />,
      title: t('feature_3_title'),
      desc: t('feature_3_desc')
    }
  ];

  return (
    <section id="vision" className="py-16 sm:py-20 md:py-24 bg-[var(--bg-primary)] border-t border-[var(--text-primary)]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        <div className="text-center mb-12 sm:mb-16 md:mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4 sm:mb-6"
          >
            {t('vision_title')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-[var(--text-secondary)] text-base sm:text-lg max-w-2xl mx-auto"
          >
            {t('vision_desc')}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -5 }}
              className="p-6 sm:p-8 rounded-3xl bg-[var(--card-bg)] border border-[var(--text-primary)]/10 text-center hover:border-[var(--color-primary)]/30 transition-all shadow-sm hover:shadow-xl"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto bg-[var(--text-primary)]/5 rounded-2xl flex items-center justify-center text-[var(--color-primary)] mb-4 sm:mb-6">
                <div className="[&>svg]:w-5 [&>svg]:h-5 sm:[&>svg]:w-6 sm:[&>svg]:h-6">
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] mb-2 sm:mb-3">{feature.title}</h3>
              <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
