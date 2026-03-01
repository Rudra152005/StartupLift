import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon, Mail, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import Logo from "../assets/Logo.svg";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [method, setMethod] = useState("email"); // 'email' or 'sms'
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resetToken, setResetToken] = useState("");

  const navigate = useNavigate();
  const { login, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Debug: Log auth state
  console.log("AuthContext user in ForgotPassword:", user);

  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (method === "email" && !email) {
      toast.error("Please enter your registered email!");
      return;
    }

    if (method === "sms" && !phone) {
      toast.error("Please enter your registered phone number!");
      return;
    }

    setLoading(true);

    try {
      const { data } = await axios.post(
        "/auth/send-otp",
        method === "email" ? { email, method } : { phone, method }
      );

      toast.success(data.message || "OTP sent successfully!");
      setOtpSent(true);
      setResetToken(data.resetToken);
    } catch (err) {
      console.error("Send OTP error:", err.response || err);
      toast.error(err.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!otp) {
      toast.error("Please enter the OTP!");
      return;
    }

    setVerifying(true);

    try {
      console.log("🔄 Sending verify OTP request...");
      const { data } = await axios.post(
        "/auth/verify-otp",
        {
          otp,
          resetToken,
          method
        }
      );

      console.log("✅ Verify OTP response:", data);

      if (data.success && data.token && data.user) {
        toast.success(data.message || "OTP verified successfully!");

        // ✅ Use the login function from AuthContext instead of manual localStorage
        login(data.token, data.user);

        console.log("✅ User logged in via AuthContext, redirecting to dashboard...");

        // Wait a moment for state to update, then redirect
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 1500);
      } else {
        console.error("❌ Missing token or user data in response");
        toast.error("Login failed - missing token or user data");
      }
    } catch (err) {
      console.error("❌ Verify OTP error:", err.response?.data || err);
      toast.error(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);

    try {
      console.log("🔄 Resending OTP with resetToken:", resetToken);

      const { data } = await axios.post(
        "/auth/resend-otp",
        {
          resetToken, // Send the resetToken we stored earlier
          method
        }
      );

      toast.success(data.message || "OTP resent successfully!");
      console.log("✅ OTP resent successfully");
    } catch (err) {
      console.error("❌ Resend OTP error:", err.response?.data || err);
      toast.error(err.response?.data?.message || "Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)] px-4 transition-colors duration-300 overflow-hidden font-inter">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[var(--color-primary)]/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-[var(--color-secondary)]/5 blur-[100px] rounded-full"></div>
        {/* Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#888_1px,transparent_1px)] [background-size:20px_20px]"></div>
      </div>

      {/* Header with Back Button and Logo */}
      <div className="absolute top-4 sm:top-8 left-4 sm:left-8 flex items-center gap-4 sm:gap-6 z-20">
        <button
          onClick={() => navigate(-1)}
          className="p-2 sm:p-2.5 bg-[var(--bg-primary)]/50 backdrop-blur-md border border-[var(--text-primary)]/10 rounded-xl sm:rounded-2xl hover:bg-[var(--text-primary)]/10 transition-all group shadow-sm text-[var(--text-primary)]"
          aria-label="Go back"
        >
          <ArrowLeft size={18} className="sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
        </button>
        <Link
          to="/"
          className="flex items-center gap-2 sm:gap-3 group transition-transform hover:scale-105"
        >
          <img src={Logo} alt="StartupLift" className="w-7 h-7 sm:w-9 sm:h-9" />
          <span className="text-base sm:text-lg font-medium text-[var(--text-primary)]">
            Startup<span className="text-[var(--color-primary)]">Lift</span>
          </span>
        </Link>
      </div>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 sm:top-8 right-4 sm:right-8 p-2 rounded-full border border-[var(--text-primary)]/10 bg-[var(--bg-primary)]/50 backdrop-blur-md hover:bg-[var(--text-primary)]/10 transition-all text-[var(--text-primary)] z-20"
        aria-label="Toggle Theme"
      >
        {theme === "dark" ? <Sun size={18} className="sm:w-5 sm:h-5" /> : <Moon size={18} className="sm:w-5 sm:h-5" />}
      </button>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-[var(--bg-primary)]/60 backdrop-blur-xl p-6 sm:p-10 rounded-2xl sm:rounded-[32px] shadow-2xl border border-white/10 relative z-10 m-4"
      >
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] mb-6">
            <Mail size={28} className="sm:w-8 sm:h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Forgot Password?</h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] px-4">
            No worries! Enter your email and we'll send you reset instructions.
          </p>
        </div>

        {!otpSent ? (
          <>
            <p className="text-[var(--text-secondary)] text-center mb-6 text-sm">
              Choose how you want to receive the OTP
            </p>

            {/* Method Selection */}
            <div className="flex space-x-4 mb-8">
              <button
                type="button"
                onClick={() => setMethod("email")}
                className={`flex-1 py-3 rounded-xl font-medium transition-all shadow-sm ${method === "email"
                  ? "bg-[var(--color-primary)] text-white shadow-[var(--color-primary)]/25"
                  : "bg-[var(--bg-primary)]/50 text-[var(--text-secondary)] border border-[var(--text-primary)]/10 hover:bg-[var(--bg-primary)]/80"
                  }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => setMethod("sms")}
                className={`flex-1 py-3 rounded-xl font-medium transition-all shadow-sm ${method === "sms"
                  ? "bg-[var(--color-primary)] text-white shadow-[var(--color-primary)]/25"
                  : "bg-[var(--bg-primary)]/50 text-[var(--text-secondary)] border border-[var(--text-primary)]/10 hover:bg-[var(--bg-primary)]/80"
                  }`}
              >
                SMS
              </button>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-4">
              {method === "email" ? (
                <div>
                  <label className="block text-[var(--text-secondary)] text-sm mb-2 font-medium">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. you@email.com"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-[var(--bg-primary)]/50 border border-[var(--text-primary)]/10 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none text-[var(--text-primary)] transition"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-[var(--text-secondary)] text-sm mb-2 font-medium">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+919876543210"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-[var(--bg-primary)]/50 border border-[var(--text-primary)]/10 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none text-[var(--text-primary)] transition"
                  />
                  <p className="text-xs text-[var(--text-secondary)] mt-1 ml-1">Include country code (e.g. +91)</p>
                </div>
              )}

              {/* Send OTP Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 mt-4 rounded-xl font-semibold transition-all shadow-lg shadow-[var(--color-primary)]/20 ${loading
                  ? "bg-[var(--color-primary)]/70 cursor-not-allowed"
                  : "bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] text-white"
                  }`}
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </motion.button>

              {/* Back to Login */}
              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors text-sm font-medium"
                >
                  ← Back to Login
                </Link>
              </div>
            </form>
          </>
        ) : (
          <>
            <p className="text-[var(--text-secondary)] text-center mb-6 text-sm">
              Enter the OTP sent to your {method === "email" ? "email" : "phone"}
            </p>

            <form onSubmit={handleVerifyOtp} className="space-y-6">
              {/* OTP Input */}
              <div>
                <label className="block text-[var(--text-secondary)] text-sm mb-2 font-medium text-center">
                  OTP Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  required
                  className="w-full px-4 py-4 rounded-xl bg-[var(--bg-primary)]/50 border border-[var(--text-primary)]/10 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none text-[var(--text-primary)] text-center text-3xl tracking-[0.5em] font-mono transition shadow-inner"
                />
              </div>

              {/* Verify OTP Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={verifying}
                className={`w-full py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-[var(--color-primary)]/20 ${verifying
                  ? "bg-[var(--color-primary)]/70 cursor-not-allowed"
                  : "bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] text-white"
                  }`}
              >
                {verifying ? "Verifying..." : "Verify OTP & Login"}
              </motion.button>

              <div className="flex flex-col gap-3 text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-[var(--color-primary)] hover:underline text-sm font-medium"
                >
                  {loading ? "Resending..." : "Resend OTP"}
                </button>

                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm"
                >
                  Change {method === "email" ? "email" : "phone"}
                </button>

                <Link
                  to="/login"
                  className="text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors text-sm font-medium mt-2"
                >
                  ← Back to Login
                </Link>
              </div>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
