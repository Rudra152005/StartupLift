import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Logo from "../assets/Logo.svg"; // your logo

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  // Detect scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = ["Home", "Programs", "Mentors", "Resources"];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#0B0B0F]/70 backdrop-blur-xl shadow-[0_0_25px_rgba(124,58,237,0.25)]" // 🔥 reduced opacity when scrolled
          : "bg-[#0B0B0F]/95 backdrop-blur-lg"
      }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-3 md:px-12">
        {/* ✅ Logo Section */}
        <div className="flex items-center space-x-3">
          <div className="relative w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-full bg-linear-to-br from-[#7C3AED] to-[#9333EA] p-0.5 shadow-[0_0_25px_rgba(124,58,237,0.5)]">
            <div className="bg-[#0B0B0F] w-full h-full rounded-full flex items-center justify-center">
              <img
                src={Logo}
                alt="StartupLift Logo"
                className="w-11 h-11 md:w-13 md:h-13 rounded-full object-cover scale-110 transition-transform duration-500 hover:scale-115"
              />
            </div>
          </div>
          <h1 className="text-[20px] md:text-[22px] font-semibold text-gray-200 tracking-wide">
            Startup
            <span className="bg-linear-to-r from-[#7C3AED] to-[#9333EA] bg-clip-text text-transparent">
              Lift
            </span>
          </h1>
        </div>

        {/* ✅ Desktop Nav Links */}
        <ul className="hidden md:flex items-center gap-10 text-gray-300 text-[15px] font-medium">
          {navLinks.map((link) => (
            <li
              key={link}
              className="cursor-pointer relative group transition-colors duration-300"
            >
              <span className="group-hover:text-[#A78BFA]">{link}</span>
              <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-linear-to-r from-[#7C3AED] to-[#9333EA] transition-all duration-300 group-hover:w-full"></span>
            </li>
          ))}
        </ul>

        {/* ✅ Apply Button */}
        <button className="hidden md:block bg-linear-to-r from-[#7C3AED] to-[#9333EA] text-white px-6 py-2 rounded-full text-sm font-semibold hover:scale-105 hover:shadow-[0_0_15px_#7C3AED] transition-all duration-300">
          Apply Now
        </button>

        {/* ✅ Mobile Menu Toggle */}
        <button
          onClick={toggleMenu}
          className="md:hidden text-gray-300 hover:text-white transition"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* ✅ Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-[#0A0A0A]/95 backdrop-blur-md border-t border-gray-800">
          <ul className="flex flex-col items-center py-8 space-y-6 text-gray-300 text-lg font-medium">
            {navLinks.map((link) => (
              <li
                key={link}
                className="hover:text-[#A78BFA] transition-colors duration-300"
              >
                {link}
              </li>
            ))}
            <button className="bg-linear-to-r from-[#7C3AED] to-[#9333EA] text-white px-8 py-2.5 rounded-full font-semibold hover:scale-105 hover:shadow-[0_0_15px_#7C3AED] transition-transform duration-300">
              Apply Now
            </button>
          </ul>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
