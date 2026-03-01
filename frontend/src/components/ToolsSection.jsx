import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const tools = [
  "Figma", "Notion", "Slack", "Discord",
  "GitHub", "Linear", "Vercel", "Stripe",
  "Framer", "React", "Tailwind", "Firebase"
];

function ToolTag({ name }) {
  return (
    <div className="mx-4 px-6 py-3 rounded-full border border-[var(--text-primary)]/10 bg-[var(--bg-primary)] text-[var(--text-secondary)] font-semibold text-lg whitespace-nowrap">
      {name}
    </div>
  );
}

export default function ToolsSection() {
  const { t } = useTranslation();
  return (
    <section id="tools" className="py-16 sm:py-20 md:py-24 overflow-hidden bg-[var(--bg-primary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center mb-10 sm:mb-16">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-3 sm:mb-4 px-4">
          {t('tools_title')}
        </h2>
        <p className="text-[var(--text-secondary)] text-base sm:text-lg px-4">{t('tools_desc')}</p>
      </div>

      <div className="flex flex-wrap justify-center gap-4 sm:gap-6 px-4">
        {tools.map((tool, index) => (
          <div key={`${tool}-${index}`} className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-full border border-[var(--text-primary)]/10 bg-[var(--bg-primary)] text-[var(--text-secondary)] font-semibold text-sm sm:text-base hover:border-[var(--color-primary)]/50 transition-colors cursor-default">
            {tool}
          </div>
        ))}
      </div>
    </section>
  );
}
