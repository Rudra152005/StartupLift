import React from "react";
import growImg from "../assets/growth-chart.png";

function HeroSection() {
  return (
    <section className="relative bg-[#0B0B14] text-white overflow-hidden my-15 font-inter">
      {/* === Background Gradient === */}
      <div className="absolute inset-0 bg-linear-to-br from-[#0F0F1F] via-[#0B0B14] to-[#141425]"></div>

      {/* === Right Image Background (blended) === */}
      <div
        className="absolute inset-y-0 right-0 w-full md:w-1/2 bg-right bg-no-repeat bg-contain opacity-70 mix-blend-lighten"
        style={{
          backgroundImage: `url(${growImg})`,
          backgroundSize: "contain",
          backgroundPosition: "right center",
        }}
      ></div>

      {/* === Content Wrapper === */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between px-6 md:px-20 py-24 md:py-32">
        
        {/* === Left Text === */}
        <div className="md:w-1/2 text-center md:text-left space-y-6 animate-fadeIn">
          
          {/* ⭐ Heading uses Space Grotesk */}
          <h1 className="font-grotesk text-5xl md:text-6xl font-extrabold leading-tight text-[#E4E4E7]">
            Empowering <br />
            Startups to <br />
            <span className="text-[#A78BFA] drop-shadow-[0_0_25px_#7832FF80]">
              Scale Smarter
            </span>
          </h1>

          {/* ⭐ Body text uses Inter */}
          <p className="font-inter text-gray-400 text-lg max-w-md mx-auto md:mx-0 leading-relaxed">
            Join our accelerator program to access resources, mentorship, and
            network opportunities.
          </p>

          <div className="pt-4">
            <button className="font-inter bg-linear-to-r from-[#7832FF] to-[#5B21B6] text-white px-8 py-3 rounded-lg font-medium shadow-[0_0_25px_#7832FF50] hover:scale-105 hover:shadow-[0_0_35px_#7832FF70] transition-all duration-300">
              Join Now
            </button>
          </div>
        </div>

        {/* === Right Spacer === */}
        <div className="hidden md:block md:w-1/2"></div>
      </div>

      {/* === Subtle bottom fade === */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-linear-to-b from-transparent to-[#0B0B14] pointer-events-none"></div>
    </section>
  );
}

export default HeroSection;
