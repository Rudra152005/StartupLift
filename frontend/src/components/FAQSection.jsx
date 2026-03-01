import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Plus, Minus } from "lucide-react";

export default function FAQSection() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: t('faq_1_q'),
      answer: t('faq_1_a')
    },
    {
      question: t('faq_2_q'),
      answer: t('faq_2_a')
    },
    {
      question: t('faq_3_q'),
      answer: t('faq_3_a')
    },
    {
      question: t('faq_4_q'),
      answer: t('faq_4_a')
    }
  ];

  return (
    <section id="faq" className="py-16 sm:py-20 md:py-24 bg-[var(--bg-primary)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--text-primary)] text-center mb-10 sm:mb-16">
          {t('faq_main_title')}
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-[var(--text-primary)]/10">
              <button
                onClick={() => setOpenIndex(index === openIndex ? null : index)}
                className="w-full py-5 sm:py-6 flex items-center justify-between text-left focus:outline-none"
              >
                <span className="text-lg sm:text-xl font-medium text-[var(--text-primary)] pr-4">{faq.question}</span>
                <span className="text-[var(--color-primary)] shrink-0">
                  {openIndex === index ? <Minus size={20} className="sm:w-6 sm:h-6" /> : <Plus size={20} className="sm:w-6 sm:h-6" />}
                </span>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="pb-5 sm:pb-6 text-[var(--text-secondary)] text-base sm:text-lg leading-relaxed">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
