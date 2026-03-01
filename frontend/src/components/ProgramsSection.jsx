import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { User, DollarSign, Network } from "lucide-react";

function ProgramsSection() {
  const cardsRef = useRef([]);

  // === Scroll Animation: fade up + stagger ===
  useEffect(() => {
    const cards = cardsRef.current;

    const reveal = () => {
      cards.forEach((card, i) => {
        if (!card) return;
        const rect = card.getBoundingClientRect();
        if (rect.top < window.innerHeight - 120) {
          setTimeout(() => {
            card.classList.add("opacity-100", "translate-y-0");
          }, i * 150); // stagger
        }
      });
    };

    reveal();
    window.addEventListener("scroll", reveal);
    return () => window.removeEventListener("scroll", reveal);
  }, []);

  const programs = [
    {
      icon: <User className="w-8 h-8" />,
      title: "Mentorship",
      desc: "1-on-1 guidance from experienced founders and advisors.",
      color: "#10B981",
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: "Funding",
      desc: "Pitch sessions and access to early-stage investments.",
      color: "#F59E0B",
    },
    {
      icon: <Network className="w-8 h-8" />,
      title: "Networking",
      desc: "Connect with high-value mentors, VCs, and startup builders.",
      color: "#8B5CF6",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, rotateX: -15 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  return (
    <section
      id="programs"
      className="relative px-4 sm:px-6 md:px-12 lg:px-16 py-16 sm:py-20 md:py-28 bg-[var(--bg-primary)] overflow-hidden transition-colors duration-300 perspective-1500"
    >
      {/* Soft fog background - adapts to theme */}
      <motion.div
        className="absolute top-[-15%] left-[-10%] w-[300px] sm:w-[450px] h-[300px] sm:h-[450px] bg-[var(--color-primary)]/5 blur-[150px] opacity-20"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      ></motion.div>
      <motion.div
        className="absolute bottom-[-15%] right-[-10%] w-[350px] sm:w-[550px] h-[350px] sm:h-[550px] bg-[var(--color-primary)]/10 blur-[180px] opacity-20"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      ></motion.div>

      {/* Section Title */}
      <motion.div
        className="relative text-center mb-12 md:mb-16 z-20"
        initial={{ opacity: 0, y: -30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-[var(--text-primary)] mb-2 md:mb-3">
          Our Programs
        </h2>
        <p className="text-[var(--text-secondary)] max-w-xl mx-auto text-base sm:text-lg px-4">
          Built to accelerate your startup with world-class support.
        </p>
      </motion.div>

      {/* Cards */}
      <motion.div
        className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 md:gap-12 z-20"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {programs.map((program, index) => (
          <motion.div
            key={index}
            variants={cardVariants}
            className="group perspective-1000"
          >
            <motion.div
              className="
                p-6 sm:p-8 md:p-10 rounded-2xl cursor-pointer
                bg-[var(--color-primary)]/5
                backdrop-blur-2xl border border-[var(--color-primary)]/20
                shadow-lg
                overflow-hidden
                transform-3d
                transition-all duration-500
              "
              whileHover={{
                scale: 1.05,
                rotateY: 5,
                rotateX: 5,
                borderColor: "var(--color-primary)",
                backgroundColor: "var(--color-primary)/10",
                boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Glow effect on hover */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/10 to-transparent opacity-0 blur-xl"
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              ></motion.div>

              {/* Floating animation container */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.5,
                }}
              >
                {/* Icon Container with 3D effect */}
                <motion.div
                  className="
                    w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-5 sm:mb-6 rounded-xl 
                    flex items-center justify-center 
                    bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 
                    backdrop-blur-xl shadow-md
                    transition-all duration-500
                  "
                  whileHover={{
                    scale: 1.2,
                    rotateZ: 360,
                    backgroundColor: program.color,
                    borderColor: program.color,
                  }}
                  transition={{
                    rotateZ: { duration: 0.6 },
                    scale: { duration: 0.3 },
                  }}
                >
                  <div className="text-[var(--color-primary)] group-hover:text-white transition-colors [&>svg]:w-6 [&>svg]:h-6 sm:[&>svg]:w-8 sm:[&>svg]:h-8">
                    {program.icon}
                  </div>
                </motion.div>

                <h3 className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)] text-center mb-2 sm:mb-3">
                  {program.title}
                </h3>

                <p className="text-sm sm:text-base text-[var(--text-secondary)] text-center leading-relaxed">
                  {program.desc}
                </p>
              </motion.div>

              {/* Decorative corner elements */}
              <motion.div
                className="absolute top-0 right-0 w-16 sm:w-20 h-16 sm:h-20 bg-[var(--color-primary)]/5 rounded-bl-full opacity-0"
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              ></motion.div>
              <motion.div
                className="absolute bottom-0 left-0 w-16 sm:w-20 h-16 sm:h-20 bg-[var(--color-primary)]/5 rounded-tr-full opacity-0"
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              ></motion.div>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

export default ProgramsSection;
