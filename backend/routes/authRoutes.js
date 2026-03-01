import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import {
  verifyEmail,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getProfile,
  register,
  sendOtp,
  verifyOtp,
  resendOtp,
  verifyPhoneLogin,
  verifyAccount,
  updatePassword,
  updateProfile,
  getSessions,
  logoutSession
} from "../controllers/authController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/verify-account", verifyAccount);
router.get("/verify/:token", verifyEmail);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/firebase-login", verifyPhoneLogin);

// OTP routes for password reset
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);

// Google Auth Routes - UPDATED with prompt parameter
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account consent", // 👈 ADDED - shows both account selection AND consent screen
    access_type: "offline", // 👈 ADDED
    include_granted_scopes: true // 👈 ADDED // 👈 ADDED - forces account selection every time
  })
);

router.get(
  "/google/callback",
  (req, res, next) => {
    passport.authenticate("google", { session: false }, (err, user, info) => {
      if (err) {
        console.error('Google OAuth error:', err);
        return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
      }

      if (!user) {
        let errorType = 'auth_failed';
        if (info && info.message) {
          if (info.message.includes('No account found')) {
            errorType = 'user_not_found';
          }
        }
        return res.redirect(`${process.env.CLIENT_URL}/login?error=${errorType}`);
      }

      // Generate JWT Token
      const token = jwt.sign(
        {
          id: user._id,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      // Redirect to frontend callback with token
      return res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);

    })(req, res, next);
  }
);

// Authentication status and session routes
router.get("/user", (req, res) => {
  if (req.user) {
    res.json({
      user: req.user,
      message: "User authenticated via session"
    });
  } else {
    res.status(401).json({
      message: "Not authenticated via session"
    });
  }
});

// Check session authentication (for Google OAuth)
router.get("/session-check", (req, res) => {
  console.log('Session check - User:', req.user);
  if (req.user) {
    res.json({
      success: true,
      user: req.user,
      message: "User authenticated via session"
    });
  } else {
    res.status(401).json({
      success: false,
      message: "No active session"
    });
  }
});

// Check token authentication (for email/password login)
router.get("/token-check", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided"
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      user: user,
      authMethod: 'token'
    });

  } catch (error) {
    console.error('Token check error:', error);
    res.status(401).json({
      success: false,
      message: "Invalid token"
    });
  }
});

// Universal auth status check (tries both methods)
router.get("/auth-status", async (req, res) => {
  try {
    // First try session (Google OAuth)
    if (req.user) {
      return res.json({
        success: true,
        user: req.user,
        authMethod: 'session'
      });
    }

    // Then try token (email/password)
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (user) {
          return res.json({
            success: true,
            user: user,
            authMethod: 'token'
          });
        }
      } catch (tokenError) {
        console.log('Token validation failed:', tokenError.message);
        // Continue to return not authenticated
      }
    }

    return res.status(200).json({
      success: false,
      message: "Not authenticated",
      authenticated: false
    });

  } catch (error) {
    console.error('Auth status error:', error);
    res.status(500).json({
      success: false,
      message: "Authentication check failed"
    });
  }
});

// Test route to check users in database - UPDATED with phone
router.get("/test-users", async (req, res) => {
  try {
    const users = await User.find().select('name email phone role isVerified authMethod');
    res.json({
      success: true,
      users: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// Create test user (remove this in production) - UPDATED with phone
router.post("/create-test-user", async (req, res) => {
  try {
    const { email, password, name, role, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create new user with phone
    const user = new User({
      name: name || "Test User",
      email: email || "test@example.com",
      password: password || "password123",
      role: role || "User",
      phone: phone || null, // Added phone field
      isVerified: true,
      authMethod: 'local'
    });

    await user.save();

    res.json({
      success: true,
      message: 'Test user created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone, // Include phone in response
        role: user.role,
        authMethod: user.authMethod
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating test user',
      error: error.message
    });
  }
});

// Protected routes (must come after public routes)
router.get("/me", protect, getProfile);

// Update Password
router.put("/update-password", protect, updatePassword);

// Update Profile
router.put("/profile", protect, updateProfile);

// Session Management
router.get("/sessions", protect, getSessions);
router.delete("/sessions/:sessionId", protect, logoutSession);

// Admin route
router.get("/admin-dashboard", protect, authorizeRoles("admin"), (req, res) => {
  res.json({ message: `Welcome Admin ${req.user.name}` });
});

// Logout routes (handle both session and token logout)
router.post("/logout", (req, res) => {
  // For session-based auth (Google OAuth)
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ success: false, message: "Logout failed" });
    }

    // Clear session cookie
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
      }
      res.clearCookie("connect.sid");

      // For token-based auth, the frontend will clear the token
      res.status(200).json({
        success: true,
        message: "Logged out successfully"
      });
    });
  });
});

// Google logout (legacy route, can be removed if not used)
router.get("/google/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: "Logout error" });
    res.redirect(`${process.env.CLIENT_URL}/login`);
  });
});

// Create admin test user (remove in production) - UPDATED with phone
router.post("/create-admin-user", async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create new admin user with phone
    const user = new User({
      name: name || "Admin User",
      email: email || "admin@example.com",
      password: password || "admin123",
      phone: phone || null, // Added phone field
      role: "Admin", // Set role as Admin
      isVerified: true,
      authMethod: 'local'
    });

    await user.save();

    res.json({
      success: true,
      message: 'Admin user created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone, // Include phone in response
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating admin user',
      error: error.message
    });
  }
});

// Check if admin users exist - UPDATED with phone
router.get("/check-admin-users", async (req, res) => {
  try {
    const adminUsers = await User.find({ role: "Admin" }).select('name email phone role');

    res.json({
      success: true,
      count: adminUsers.length,
      adminUsers: adminUsers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking admin users',
      error: error.message
    });
  }
});

// Create admin user with env credentials - UPDATED with phone
router.get("/setup-admin", async (req, res) => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL });

    if (existingAdmin) {
      return res.json({
        success: true,
        message: 'Admin user already exists',
        user: {
          id: existingAdmin._id,
          name: existingAdmin.name,
          email: existingAdmin.email,
          phone: existingAdmin.phone, // Include phone in response
          role: existingAdmin.role
        }
      });
    }

    // Create new admin user
    const adminUser = new User({
      name: "System Administrator",
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      phone: process.env.ADMIN_PHONE || null, // Added phone field
      role: "Admin",
      isVerified: true,
      authMethod: 'local'
    });

    await adminUser.save();

    res.json({
      success: true,
      message: 'Admin user created successfully',
      user: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        phone: adminUser.phone, // Include phone in response
        role: adminUser.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating admin user',
      error: error.message
    });
  }
});

export default router;