import React from "react";
import { FaFacebookF, FaInstagram, FaYoutube, FaEnvelope } from "react-icons/fa";

function Footer() {
  return (
    <footer
      id="footer"
      className="bg-[--color-dark] border-t border-[#1F1F2E] text-[--color-light] px-6 md:px-16 py-16 animate-fadeIn"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* === Brand Section === */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-3">StartupLift</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Empowering startups to scale smarter through mentorship, funding,
            and community support.
          </p>
        </div>

        {/* === Quick Links === */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Quick Links</h3>
          <ul className="space-y-2 text-gray-400">
            <li>
              <a href="#home" className="hover:text-[--color-primary] transition">
                Home
              </a>
            </li>
            <li>
              <a href="#programs" className="hover:text-[--color-primary] transition">
                Programs
              </a>
            </li>
            <li>
              <a href="#mentors" className="hover:text-[--color-primary] transition">
                Mentors
              </a>
            </li>
            <li>
              <a href="#resources" className="hover:text-[--color-primary] transition">
                Resources
              </a>
            </li>
          </ul>
        </div>

        {/* === Newsletter Signup === */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Join Our Newsletter</h3>
          <p className="text-gray-400 text-sm mb-4">
            Subscribe to get updates on new programs and events.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex items-center gap-2"
          >
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-[#1A1A2B] text-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[--color-primary] text-sm"
              required
            />
            <button
              type="submit"
              className="bg-linear-to-r from-[#6D28D9] to-[#9333EA] text-white px-4 py-2 rounded-md text-sm font-semibold hover:scale-105 hover:shadow-[0_0_12px_#7C3AED70] transition"
            >
              Subscribe
            </button>
          </form>
        </div>

        {/* === Social / Contact === */}
        <div className="md:text-right">
          <h3 className="text-lg font-semibold text-white mb-3">Connect With Us</h3>
          <div className="flex md:justify-end gap-4 text-gray-400 text-xl">
            <a
              href="mailto:info@startuplift.com"
              aria-label="Email"
              className="hover:text-[--color-primary] transition transform hover:scale-110"
            >
              <FaEnvelope />
            </a>
            <a
              href="https://facebook.com"
              aria-label="Facebook"
              className="hover:text-[--color-primary] transition transform hover:scale-110"
            >
              <FaFacebookF />
            </a>
            <a
              href="https://instagram.com"
              aria-label="Instagram"
              className="hover:text-[--color-primary] transition transform hover:scale-110"
            >
              <FaInstagram />
            </a>
            <a
              href="https://youtube.com"
              aria-label="YouTube"
              className="hover:text-[--color-primary] transition transform hover:scale-110"
            >
              <FaYoutube />
            </a>
          </div>
        </div>
      </div>

      {/* === Divider === */}
      <div className="border-t border-[#1F1F2E] mt-12 pt-6 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} StartupLift. All rights reserved.</p>

        <div className="flex gap-6 mt-3 md:mt-0">
          <a href="/privacy" className="hover:text-[--color-primary] transition">
            Privacy Policy
          </a>
          <a href="/terms" className="hover:text-[--color-primary] transition">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
