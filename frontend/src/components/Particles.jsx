import React from 'react';
import { motion } from 'framer-motion';

const Particles = () => {
    const particles = Array.from({ length: 12 });
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((_, i) => (
                <motion.div
                    key={i}
                    className={`absolute rounded-full blur-[1px] ${i % 2 === 0 ? 'bg-emerald-400/30' : 'bg-amber-400/30'
                        }`}
                    initial={{
                        x: Math.random() * 100 + "%",
                        y: Math.random() * 100 + "%",
                        scale: Math.random() * 0.5 + 0.5,
                        opacity: Math.random() * 0.3 + 0.2
                    }}
                    animate={{
                        y: ["0%", "-20%", "0%"],
                        x: ["0%", "5%", "0%"],
                        opacity: [0.2, 0.5, 0.2]
                    }}
                    transition={{
                        duration: Math.random() * 10 + 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: Math.random() * 5
                    }}
                    style={{
                        width: Math.random() * 4 + 2 + "px",
                        height: Math.random() * 4 + 2 + "px",
                    }}
                />
            ))}
        </div>
    );
};

export default Particles;
