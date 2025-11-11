import React, { useState } from "react";
import { Menu, X } from "lucide-react"; // for hamburger menu icons
import Logo from "../assets/Logo.svg"; // ✅ Adjust the path if needed

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="flex justify-between items-center py-4 px-6 md:px-12 bg-transparent text-white relative z-50">
      {/* Logo Section */}
      <div className="flex items-center space-x-3">
        <img
          src={Logo}
          alt="StartupLift Logo"
          className="w-9 h-9 md:w-10 md:h-10 object-contain"
        />
        <h1 className="text-xl md:text-2xl font-semibold tracking-wide">
          Startup<span className="text-purple-500 font-bold">Lift</span>
        </h1>
      </div>

      {/* Desktop Menu */}
      <ul className="hidden md:flex gap-10 text-gray-300 text-base font-medium">
        <li className="hover:text-purple-400 transition cursor-pointer">Home</li>
        <li className="hover:text-purple-400 transition cursor-pointer">Programs</li>
        <li className="hover:text-purple-400 transition cursor-pointer">Mentors</li>
        <li className="hover:text-purple-400 transition cursor-pointer">Resources</li>
      </ul>

      {/* Apply Now Button (Desktop) */}
      <button className="hidden md:block bg-linear-to-r from-purple-600 to-purple-800 text-white px-6 py-2.5 rounded-md text-sm font-semibold hover:scale-105 hover:shadow-[0_0_15px_#7C3AED] transition-all duration-200">
        Apply Now
      </button>

      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <button
          onClick={toggleMenu}
          className="text-gray-300 hover:text-white transition"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="absolute top-16 left-0 w-full bg-[#0B0B0B]/95 border-t border-gray-800 md:hidden flex flex-col items-center space-y-6 py-8 shadow-xl animate-fadeIn">
          <ul className="flex flex-col gap-6 text-gray-300 text-lg font-medium">
            <li className="hover:text-purple-400 transition cursor-pointer">Home</li>
            <li className="hover:text-purple-400 transition cursor-pointer">Programs</li>
            <li className="hover:text-purple-400 transition cursor-pointer">Mentors</li>
            <li className="hover:text-purple-400 transition cursor-pointer">Resources</li>
          </ul>

          <button className="bg-linear-to-r from-purple-600 to-purple-800 text-white px-7 py-2.5 rounded-md text-base font-semibold hover:scale-105 hover:shadow-[0_0_15px_#7C3AED] transition-transform duration-200">
            Apply Now
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
