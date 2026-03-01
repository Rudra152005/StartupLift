import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const MentorDashboard = lazy(() => import("./pages/MentorDashboard"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const ContactUs = lazy(() => import("./pages/ContactUs"));

// Google Callback
import GoogleCallback from "./pages/GoogleCallback";
import { ToastProvider } from "./context/ToastContext";

// Simple loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return user ? children : <Navigate to="/login" />;
};

// Public Route Component (redirect to dashboard if already authenticated)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return user ? <Navigate to="/dashboard" /> : children;
};

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ThemeProvider>
          <Router>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Google Callback */}
                <Route path="/auth/callback" element={<GoogleCallback />} />

                {/* Public Routes */}
                <Route
                  path="/login"
                  element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/signup"
                  element={
                    <PublicRoute>
                      <Signup />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/forgot-password"
                  element={
                    <PublicRoute>
                      <ForgotPassword />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/reset-password/:token"
                  element={
                    <PublicRoute>
                      <ResetPassword />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/verify-email"
                  element={
                    <PublicRoute>
                      <VerifyEmail />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/verify-email/:token"
                  element={
                    <PublicRoute>
                      <VerifyEmail />
                    </PublicRoute>
                  }
                />

                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin-dashboard"
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/mentor-dashboard"
                  element={
                    <ProtectedRoute>
                      <MentorDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Default route */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/contact" element={<ContactUs />} />

                {/* 404 route */}
                <Route
                  path="*"
                  element={
                    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
                      <div className="text-center">
                        <h1 className="text-4xl font-bold mb-4">404</h1>
                        <p className="text-[var(--text-primary)]/60">Page not found</p>
                        <button
                          onClick={() => window.location.href = '/dashboard'}
                          className="mt-4 bg-[var(--color-primary)] hover:opacity-90 px-6 py-2 rounded-md text-white"
                        >
                          Go to Dashboard
                        </button>
                      </div>
                    </div>
                  }
                />
              </Routes >
            </Suspense >
          </Router >
        </ThemeProvider >
      </AuthProvider >
    </ToastProvider>
  );
}

export default App;
