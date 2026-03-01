import React from "react";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import StartupsSection from "../components/StartupsSection";
import VisionSection from "../components/VisionSection";
import ToolsSection from "../components/ToolsSection";
import FAQSection from "../components/FAQSection";
import Footer from "../components/Footer";

function LandingPage() {
  return (
    <div className="bg-[var(--bg-primary)] min-h-screen text-[var(--text-primary)] transition-colors duration-300">
      <Navbar />
      <HeroSection />
      <StartupsSection />
      {/* <VisionSection /> */}
      {/* <ToolsSection /> */}
      <FAQSection />
      <Footer />
    </div>
  );
}

export default LandingPage;
