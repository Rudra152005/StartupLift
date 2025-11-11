import React from "react";
import { User, DollarSign, Network } from "lucide-react"; // icon pack

function ProgramsSection() {
  const programs = [
    {
      icon: <User className="w-7 h-7 text-[--color-primary]" />,
      title: "Mentorship",
      desc: "Get guidance from experienced entrepreneurs.",
    },
    {
      icon: <DollarSign className="w-7 h-7 text-[--color-primary]" />,
      title: "Funding",
      desc: "Access capital to grow your startup.",
    },
    {
      icon: <Network className="w-7 h-7 text-[--color-primary]" />,
      title: "Networking",
      desc: "Join a community of like-minded founders.",
    },
  ];

  return (
    <section
      id="programs"
      className="px-6 md:px-16 py-20 bg-[--color-dark] text-[--color-light]"
    >
      {/* Section Title */}
      <div className="text-center mb-14">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Our Programs
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto">
          We empower startups through expert mentorship, strategic funding, and
          powerful networking.
        </p>
      </div>

      {/* Program Cards */}
      <div className="grid md:grid-cols-3 gap-10">
        {programs.map((program, index) => (
          <div
            key={index}
            className="bg-linear-to-b from-[#1C1C2E] to-[#12121C] p-8 rounded-2xl shadow-lg hover:shadow-[0_0_20px_#7C3AED40] hover:scale-105 transition-transform duration-300 text-center"
          >
            <div className="flex justify-center mb-5">{program.icon}</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {program.title}
            </h3>
            <p className="text-gray-400">{program.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ProgramsSection;
