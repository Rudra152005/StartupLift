import React from "react";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";

function Testimonials() {
  const testimonials = [
    {
      quote: "StartupLift helped us refine our business model and connect with investors. The mentorship and community support were truly pivotal in scaling our business.",
      name: "Jane Cooper",
      role: "Co-founder, TechWave",
      image: "https://randomuser.me/api/portraits/women/65.jpg",
    },
  ];

  return (
    <section
      id="testimonials"
      className="relative px-4 sm:px-6 md:px-12 lg:px-16 py-16 sm:py-20 md:py-28 bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden transition-colors duration-300 perspective-1500"
    >
      {/* === Background Fog Layers === */}
      <motion.div
        className="absolute top-[-20%] left-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-[var(--color-primary)]/5 blur-[100px] sm:blur-[150px] opacity-30 pointer-events-none"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, 30, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      ></motion.div>
      <motion.div
        className="absolute bottom-[-20%] right-[-10%] w-[400px] sm:w-[700px] h-[400px] sm:h-[700px] bg-[var(--color-primary)]/8 blur-[120px] sm:blur-[180px] opacity-20 pointer-events-none"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, -40, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      ></motion.div>

      {/* === Section Title === */}
      <motion.div
        className="relative text-center mb-10 sm:mb-16 z-20"
        initial={{ opacity: 0, y: -30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-[var(--text-primary)] drop-shadow-md mb-3 sm:mb-4 px-4">
          What Our Founders Say
        </h2>

        <p className="text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed text-base sm:text-lg px-4">
          Hear how StartupLift has helped founders accelerate growth and connect
          with meaningful opportunities.
        </p>
      </motion.div>

      {/* === Testimonial Cards === */}
      <div className="relative max-w-4xl mx-auto z-20">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={index}
            className="group perspective-1000"
            initial={{ opacity: 0, y: 50, rotateX: -10 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              className="relative p-6 sm:p-10 md:p-12 rounded-2xl 
              bg-[var(--color-primary)]/5 backdrop-blur-xl 
              border border-[var(--color-primary)]/20 
              shadow-lg
              transform-3d
              overflow-hidden"
              whileHover={{
                scale: 1.02,
                rotateY: 2,
                rotateX: 2,
                borderColor: "var(--color-primary)",
                backgroundColor: "var(--color-primary)/10",
                boxShadow: "0 25px 70px rgba(0,0,0,0.3)",
              }}
              transition={{ duration: 0.4 }}
            >
              {/* Animated gradient overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/10 via-transparent to-[var(--color-secondary)]/10 opacity-0"
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              ></motion.div>

              {/* Decorative quote icon */}
              <motion.div
                className="absolute top-6 right-6 text-[var(--color-primary)]/20"
                animate={{
                  rotate: [0, 5, 0, -5, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Quote className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20" />
              </motion.div>

              {/* Quote Text */}
              <motion.p
                className="relative italic text-[var(--text-secondary)] text-base sm:text-lg md:text-xl leading-relaxed mb-6 sm:mb-8 z-10"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                "{testimonial.quote}"
              </motion.p>

              {/* Founder Info */}
              <motion.div
                className="relative flex items-center gap-5 z-10"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
              >
                {/* Avatar with 3D effect */}
                <motion.div
                  className="relative"
                  whileHover={{
                    scale: 1.1,
                    rotateZ: 5,
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-[var(--color-primary)]/30 rounded-full blur-md"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  ></motion.div>
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="relative w-16 h-16 md:w-18 md:h-18 rounded-full object-cover 
                    border-2 border-[var(--color-primary)]/40 shadow-lg"
                  />
                </motion.div>

                {/* Name + Role */}
                <div>
                  <motion.h4
                    className="text-[var(--text-primary)] font-semibold text-base sm:text-lg md:text-xl"
                    whileHover={{ x: 5 }}
                  >
                    {testimonial.name}
                  </motion.h4>
                  <p className="text-[var(--text-secondary)] text-xs sm:text-sm md:text-base">
                    {testimonial.role}
                  </p>
                </div>
              </motion.div>

              {/* Decorative corner accents */}
              <motion.div
                className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-[var(--color-primary)]/20 rounded-tl-2xl opacity-0"
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              ></motion.div>
              <motion.div
                className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-[var(--color-primary)]/20 rounded-br-2xl opacity-0"
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              ></motion.div>

              {/* Floating particles */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 bg-[var(--color-primary)]/40 rounded-full"
                  style={{
                    left: `${20 + i * 30}%`,
                    top: `${30 + i * 20}%`,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.2, 0.6, 0.2],
                  }}
                  transition={{
                    duration: 3 + i,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.5,
                  }}
                ></motion.div>
              ))}
            </motion.div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default Testimonials;
