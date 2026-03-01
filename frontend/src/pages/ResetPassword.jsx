import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "../api/axiosInstance";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon, ArrowLeft } from "lucide-react";
import Logo from "../assets/Logo.svg";

export default function ResetPassword() {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { token } = useParams(); // from email reset link
  const { theme, toggleTheme } = useTheme();


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const password = formData.password.trim();
    const confirmPassword = formData.confirmPassword.trim();

    if (!password || !confirmPassword) {
      toast.error("All fields are required!");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long!");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `/auth/reset-password/${token}`,
        { password }
      );

      if (response.data.success) {
        toast.success("Password reset successful! You can now log in.");
        navigate("/login");
      } else {
        toast.error(response.data.message || "Failed to reset password.");
      }
    } catch (error) {
      console.error("Reset password error:", error.response || error);
      toast.error(
        error.response?.data?.message || "Failed to reset password. Please try again!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[var(--color-primary)]/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-[var(--color-secondary)]/5 blur-[100px] rounded-full"></div>
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
        className="fixed top-6 right-6 p-2 rounded-full bg-[var(--bg-primary)]/20 border border-[var(--text-primary)]/10 text-[var(--text-primary)] transition-all hover:bg-[var(--bg-primary)]/40"
        aria-label="Toggle Theme"
      >
        {theme === "dark" ? <Sun size={18} className="sm:w-5 sm:h-5" /> : <Moon size={18} className="sm:w-5 sm:h-5" />}
      </button>

      <div className="w-full max-w-md bg-[var(--bg-primary)]/60 backdrop-blur-xl p-6 sm:p-10 rounded-2xl sm:rounded-[32px] shadow-2xl border border-white/10 relative z-10 m-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2 text-[var(--text-primary)]">Reset Password</h2>
        <p className="text-[var(--text-primary)]/60 text-center mb-6">
          Enter your new password below.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[var(--text-primary)]/80 text-sm mb-2">
              New Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter new password"
              disabled={loading}
              required
              className="w-full px-4 py-2 rounded-md bg-[var(--bg-primary)] border border-[var(--text-primary)]/20 focus:border-[var(--color-primary)] outline-none text-[var(--text-primary)]"
            />
          </div>

          <div>
            <label className="block text-[var(--text-primary)]/80 text-sm mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter new password"
              disabled={loading}
              required
              className="w-full px-4 py-2 rounded-md bg-[var(--bg-primary)] border border-[var(--text-primary)]/20 focus:border-[var(--color-primary)] outline-none text-[var(--text-primary)]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 bg-[var(--color-primary)] hover:opacity-90 transition-all rounded-md font-semibold text-white"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-[var(--color-primary)] hover:underline text-sm font-medium"
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </div >
  );
}
