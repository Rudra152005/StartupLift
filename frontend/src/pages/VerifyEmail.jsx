import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useToast } from "../context/ToastContext";
import { ArrowLeft, Timer, RefreshCw } from "lucide-react";
import Logo from "../assets/Logo.svg";
import { motion } from "framer-motion";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const email = location.state?.email;

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (!email) {
      toast.error("Please sign up first.");
      navigate("/signup");
    }
  }, [email, navigate]);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index] === "" && e.target.previousSibling) {
        e.target.previousSibling.focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6).split("");
    if (pastedData.every(char => !isNaN(char))) {
      const newOtp = [...otp];
      pastedData.forEach((val, i) => {
        if (i < 6) newOtp[i] = val;
      });
      setOtp(newOtp);
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post("/auth/verify-account", {
        email,
        otp: otpValue,
      });

      toast.success("Email successfully verified! Login to continue.");
      navigate("/login", { state: { verified: true } });
    } catch (error) {
      console.error("Verification Error:", error);
      const message = error.response?.data?.message || "Verification failed";

      if (message.toLowerCase().includes("invalid") || message.toLowerCase().includes("otp")) {
        toast.error("Wrong OTP. Please re-enter the right OTP.");
        setOtp(["", "", "", "", "", ""]); // Clear OTP fields
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    setCanResend(false);
    setTimer(60);

    try {
      // Use resend-otp endpoint. Note: The backend logic for resendOtp might need to be checked if it strictly expects a resetToken or if it handles email-only for registration flow. 
      // Based on my reading of authController, resendOtp supports finding by email if method is 'email'
      await axiosInstance.post("/auth/resend-otp", {
        email,
        method: 'email'
      });
      toast.success("OTP sent successfully!");
    } catch (error) {
      console.error("Resend OTP Error:", error);
      toast.error("Failed to resend OTP");
      setCanResend(true); // Allow retry immediately on fail? or keep timer? verify this behavior.
      setTimer(0);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center p-4 sm:p-6 transition-colors duration-300 overflow-hidden relative font-inter">
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

      <div className="max-w-md w-full bg-[var(--bg-primary)]/60 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-8 sm:p-10 border border-white/10 shadow-2xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-3 tracking-tight">Verify Your Email</h2>
            <p className="text-[var(--text-secondary)] text-lg">
              We've sent a 6-digit code to <br />
              <span className="font-semibold text-[var(--text-primary)]">{email}</span>
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-8">
            <div className="flex gap-2 sm:gap-3 justify-center" onPaste={handlePaste}>
              {otp.map((data, index) => (
                <input
                  className="w-10 h-12 sm:w-12 sm:h-14 border border-[var(--text-primary)]/10 bg-[var(--text-primary)]/5 rounded-xl text-center text-xl sm:text-2xl font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/20 transition-all appearance-none"
                  type="text"
                  name="otp"
                  maxLength="1"
                  key={index}
                  value={data}
                  onChange={(e) => handleChange(e.target, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onFocus={(e) => e.target.select()}
                />
              ))}
            </div>

            <div className="flex flex-col items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading || otp.join("").length !== 6}
                className={`w-full bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] transition-all text-white font-bold rounded-2xl py-4 text-lg shadow-lg shadow-[var(--color-primary)]/20 ${loading || otp.join("").length !== 6 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
              >
                {loading ? "Verifying..." : "Verify & Login"}
              </motion.button>

              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="flex items-center gap-2 text-[var(--color-primary)] hover:underline font-semibold transition-all"
                  >
                    <RefreshCw size={18} /> Resend OTP
                  </button>
                ) : (
                  <div className="flex items-center gap-2 opacity-70">
                    <Timer size={18} />
                    <span>Resend in {timer}s</span>
                  </div>
                )}
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
