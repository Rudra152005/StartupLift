import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import axiosInstance from "../api/axiosInstance";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon, CheckCircle2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import Logo from "../assets/Logo.svg";
import AuthShowcase from "../assets/auth_showcase_cat.png";

export default function Signup() {
  const toast = useToast();
  const [formData, setFormData] = useState({
    fullName: "",
    role: "User",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { fullName, role, email, password, confirmPassword } = formData;

    if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      toast.error("All fields are required!");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters!");
      return;
    }



    setLoading(true);

    try {
      const payload = {
        name: fullName.trim(),
        role,
        email: email.trim(),
        password,
      };

      const response = await axiosInstance.post("/auth/register", payload);

      toast.success(response.data.message);
      navigate("/verify-email", { state: { email: email.trim() } });
    } catch (error) {
      console.error("Signup Error:", error);
      const message = error.response?.data?.message || "Something went wrong!";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300 overflow-hidden font-inter">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[var(--color-primary)]/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-[var(--color-secondary)]/5 blur-[100px] rounded-full"></div>
        {/* Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#888_1px,transparent_1px)] [background-size:20px_20px]"></div>
      </div>

      <div className="flex w-full min-h-screen bg-[var(--bg-primary)]/60 backdrop-blur-md relative z-10">

        {/* Left Side: Showcase Image Panel */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-[#0a0a0b] overflow-hidden">
          <div className="absolute inset-0 z-0 text-white">
            <img
              src={AuthShowcase}
              alt="AI Intelligence"
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#0a0a0b] via-transparent to-[#0a0a0b]/40"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[var(--bg-primary)]"></div>
          </div>

          <div className="relative z-10 w-full flex flex-col justify-between p-16 text-white text-left">
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate(-1)}
                className="p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 hover:border-[var(--color-primary)]/40 transition-all group shadow-2xl"
                aria-label="Go back"
              >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              </button>
              <Link to="/" className="flex items-center gap-4">
                <div className="p-2.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                  <img src={Logo} alt="Logo" className="w-10 h-10" />
                </div>
                <span className="text-3xl font-bold tracking-tight">
                  Startup<span className="text-[var(--color-primary)]">Lift</span>
                </span>
              </Link>
            </div>

            <div className="max-w-xl">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-6xl font-extrabold leading-tight mb-8">
                  Join the <br />
                  <span className="text-[var(--color-primary)]">Elite Network.</span>
                </h1>
                <p className="text-white/60 text-xl mb-12 leading-relaxed">
                  Deep intelligence and professional matching at the speed of thought. Scale your vision with StartupLift.
                </p>

                <div className="space-y-6">
                  {[
                    "Unified Founder Dashboard",
                    "Global Investor Reach",
                    "AI-Powered Strategy"
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-4 text-white/80">
                      <div className="p-1 bg-[var(--color-primary)]/20 rounded-lg">
                        <CheckCircle2 size={24} className="text-[var(--color-primary)]" />
                      </div>
                      <span className="text-lg font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            <div className="text-white/30 text-sm font-medium uppercase tracking-[0.3em]">
              Empowering the next generation of founders
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 relative bg-[var(--bg-primary)]">

          <div className="absolute top-12 right-12 flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-4 rounded-2xl bg-[var(--text-primary)]/5 border border-[var(--text-primary)]/10 hover:bg-[var(--text-primary)]/10 transition-all text-[var(--text-primary)] shadow-sm"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun size={24} /> : <Moon size={24} />}
            </button>
          </div>

          <div className="max-w-[440px] w-full mx-auto py-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-10 text-center lg:text-left">
                <h2 className="text-3xl sm:text-4xl font-bold mb-3 tracking-tight">Create Account</h2>
                <p className="text-lg text-[var(--text-secondary)]">Join the community of innovators</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="fullName" className="block ml-1 text-sm font-semibold text-[var(--text-secondary)]">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Shreya Tripathi"
                    required
                    className="w-full bg-[var(--text-primary)]/5 border border-[var(--text-primary)]/10 rounded-2xl px-4 py-4 text-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/20 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="role" className="block ml-1 text-sm font-semibold text-[var(--text-secondary)]">
                    Role
                  </label>
                  <div className="relative">
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full bg-[var(--text-primary)]/5 border border-[var(--text-primary)]/10 rounded-2xl px-4 py-4 text-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/20 transition-all appearance-none cursor-pointer"
                    >
                      <option className="bg-[var(--bg-primary)]">User</option>
                      <option className="bg-[var(--bg-primary)]">Mentor</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[var(--text-secondary)]">
                      <svg className="h-5 w-5 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="block ml-1 text-sm font-semibold text-[var(--text-secondary)]">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="shreya@email.com"
                    required
                    className="w-full bg-[var(--text-primary)]/5 border border-[var(--text-primary)]/10 rounded-2xl px-4 py-4 text-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/20 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="block ml-1 text-sm font-semibold text-[var(--text-secondary)]">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    required
                    className="w-full bg-[var(--text-primary)]/5 border border-[var(--text-primary)]/10 rounded-2xl px-4 py-4 text-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/20 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block ml-1 text-sm font-semibold text-[var(--text-secondary)]">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    required
                    className="w-full bg-[var(--text-primary)]/5 border border-[var(--text-primary)]/10 rounded-2xl px-4 py-4 text-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/20 transition-all"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] transition-all text-white font-bold rounded-2xl py-5 mt-6 text-lg shadow-2xl shadow-[var(--color-primary)]/20 ${loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                  {loading ? "Signing Up..." : "Sign Up"}
                </motion.button>

                <p className="text-center mt-6 text-[var(--text-secondary)] text-lg">
                  Already have an account?{" "}
                  <Link to="/login" className="text-[var(--color-primary)] hover:underline font-extrabold">
                    Login
                  </Link>
                </p>
              </form>
            </motion.div>
          </div>

          <div className="text-center text-[11px] text-[var(--text-secondary)]/50 font-medium uppercase tracking-[0.3em] pb-12 mt-auto">
            © 2025 StartupLift Global • Secured by RSA-4096
          </div>
        </div>
      </div>
    </div>
  );
}
