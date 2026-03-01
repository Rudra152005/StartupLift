import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import axios from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Moon, Sun, Mail, Lock, CheckCircle2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import Logo from "../assets/Logo.svg";
import AuthShowcase from "../assets/auth_showcase_cat.png";

const InputField = ({ label, name, type, placeholder, value, onChange, required, Icon }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-semibold text-[var(--text-secondary)] ml-1">{label}</label>
    <div className="relative group">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-[var(--color-primary)] transition-colors" size={18} />
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-[var(--text-primary)]/5 border border-[var(--text-primary)]/10 rounded-2xl pl-12 pr-4 py-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]/50 focus:ring-1 focus:ring-[var(--color-primary)]/20 transition-all"
        required={required}
      />
    </div>
  </div>
);

export default function Login() {
  const navigate = useNavigate();
  const toast = useToast();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "User", // Default role
  });

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { loginWithGoogle, setUserData } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Check for Google OAuth errors in URL when component loads
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');

    if (error) {
      switch (error) {
        case 'user_not_found':
          toast.error("User not found. Please sign up first.");
          break;
        case 'login_failed':
          toast.error("Login failed. Please try again.");
          break;
        case 'server_error':
          alert('Server error occurred. Please try again later.');
          break;
        default:
          toast.error("Authentication failed. Please try again.");
      }
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email || !password) {
      toast.error("All fields are required!");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "/auth/login",
        { email, password }
      );

      if (response.data.success) {
        toast.success("Login successful! Redirecting...");

        if (response.data.token) {
          sessionStorage.setItem("token", response.data.token);
          sessionStorage.setItem("user", JSON.stringify(response.data.user));
          setUserData(response.data.user);
          const userActualRole = response.data.user.role;

          let redirectPath = "/dashboard";
          if (userActualRole === "Admin") redirectPath = "/admin-dashboard";
          else if (userActualRole === "Mentor") redirectPath = "/mentor-dashboard";

          navigate(redirectPath, { replace: true });
        }
      } else {
        toast.error(response.data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login Error:", error);

      if (error.response) {
        // Server responded with a status code outside the 2xx range
        console.log("Login Error - Status:", error.response.status);
        console.log("Login Error - Data:", error.response.data);

        const status = error.response.status;
        const message = error.response.data?.message;

        if (status === 404) {
          console.log("Triggering 404 Toast");
          toast.error("User doesn't exist. Please sign up.");
        } else if (status === 401) {
          console.log("Triggering 401 Toast");
          toast.error("Invalid email or password");
        } else if (status === 403) {
          toast.error(message || "Access denied for this role");
        } else {
          toast.error(message || "Login failed. Please try again!");
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.log("Login Error - No Response:", error.request);
        toast.error("No response from server. Please check your internet connection.");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log("Login Error - Setup:", error.message);
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    setTimeout(() => setGoogleLoading(false), 5000);
    loginWithGoogle();
  };

  return (
    <div className="relative min-h-screen flex bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300 font-inter">

      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[var(--color-primary)]/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-[var(--color-secondary)]/5 blur-[100px] rounded-full"></div>
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#888_1px,transparent_1px)] [background-size:20px_20px]"></div>
      </div>

      <div className="flex w-full min-h-screen bg-[var(--bg-primary)]/60 backdrop-blur-md relative z-10">

        {/* Left Side: Image Showcase */}
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

          <div className="relative z-10 w-full flex flex-col justify-between p-16 text-white">
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
                  Intelligent <br />
                  <span className="text-[var(--color-primary)]">Startup Scaleup.</span>
                </h1>
                <p className="text-white/60 text-xl mb-12 leading-relaxed">
                  Leverage advanced AI insights and elite mentorship to accelerate your startup's growth trajectory.
                </p>

                <div className="space-y-6">
                  {[
                    "AI-Driven Growth Insights",
                    "Expert Mentorship Matching",
                    "Investor-Ready Pitch Decking"
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
              <div className="mb-12 text-center lg:text-left">
                <h2 className="text-4xl font-bold mb-3 tracking-tight">Welcome Back</h2>
                <p className="text-[var(--text-secondary)] text-lg">Please enter your credentials to log in.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-7">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[var(--text-secondary)] ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-[var(--color-primary)] transition-colors" size={18} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@company.com"
                      className="w-full bg-[var(--text-primary)]/5 border border-[var(--text-primary)]/10 rounded-2xl pl-12 pr-4 py-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]/50 focus:ring-1 focus:ring-[var(--color-primary)]/20 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-sm font-semibold text-[var(--text-secondary)]">Password</label>
                    <Link to="/forgot-password" size="sm" className="text-sm font-medium text-[var(--color-primary)] hover:underline underline-offset-4">
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-[var(--color-primary)] transition-colors" size={20} />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full bg-[var(--text-primary)]/5 border border-[var(--text-primary)]/10 rounded-2xl pl-14 pr-4 py-4.5 text-[var(--text-primary)] text-lg focus:outline-none focus:border-[var(--color-primary)]/50 focus:ring-1 focus:ring-[var(--color-primary)]/20 transition-all font-inter"
                      required
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white font-bold py-5 rounded-2xl transition-all shadow-2xl shadow-[var(--color-primary)]/20 flex items-center justify-center gap-3 active:scale-[0.98] text-lg ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    "Sign In"
                  )}
                </motion.button>
              </form>

              <div className="relative my-10">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--text-primary)]/10"></div></div>
                <div className="relative flex justify-center text-sm uppercase tracking-[0.2em] text-[var(--text-secondary)] font-semibold">
                  <span className="bg-[var(--bg-primary)] px-5">Or continue with</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="w-full bg-[var(--text-primary)]/5 hover:bg-[var(--text-primary)]/10 border border-[var(--text-primary)]/10 text-[var(--text-primary)] font-semibold py-4.5 rounded-2xl transition-all flex items-center justify-center gap-4 text-base"
              >
                {googleLoading ? (
                  <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <img src="https://www.svgrepo.com/show/355037/google.svg" alt="Google" className="w-6 h-6" />
                    <span>Google Account</span>
                  </>
                )}
              </motion.button>

              <p className="mt-10 text-center text-[var(--text-secondary)] text-lg">
                New here?{" "}
                <Link to="/signup" className="text-[var(--color-primary)] font-extrabold hover:underline underline-offset-4">
                  Create account
                </Link>
              </p>
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
