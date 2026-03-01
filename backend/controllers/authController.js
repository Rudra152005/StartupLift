import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";
import admin from "../config/firebaseAdmin.js";

/* Helpers */

// Create JWT and set as cookie
const createTokenAndSetCookie = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return token;
};

// Generate random token
const createRandomToken = () => crypto.randomBytes(32).toString("hex");

// Hash token
const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

/* Controllers */

// ✅ Register / Signup (UPDATED - includes phone number)
export const register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Validate required fields - phone is now optional
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: name, email, password, role"
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address"
      });
    }

    // Validate phone format if provided
    if (phone) {
      const phoneRegex = /^\+?[\d\s-()]{10,}$/;
      if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid phone number"
        });
      }
    }

    if (role === "Admin") {
      return res.status(403).json({
        success: false,
        message: "You cannot register as Admin. Only backend-created admins allowed.",
      });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email"
      });
    }

    // Check if phone already exists (if provided)
    if (phone) {
      const existingPhone = await User.findOne({ phone });
      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: "User already exists with this phone number"
        });
      }
    }

    // Create user with phone
    const user = await User.create({
      name,
      email,
      password: password.trim(),
      role,
      phone: phone || undefined // Store phone if provided
    });

    // Generate OTP (6 digits)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send OTP email
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8B5CF6;">Verify Your Email</h2>
        <p>Hello ${user.name},</p>
        <p>Thank you for registering! Please use the following OTP to verify your email address:</p>
        
        <div style="background: #f4f4f4; padding: 15px; text-align: center; margin: 20px 0;">
          <h1 style="color: #8B5CF6; margin: 0; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          This OTP will expire in 10 minutes.
        </p>
        
        ${phone ? `<p><strong>Registered Phone:</strong> ${phone}</p>` : ''}
        
        <p style="color: #999; font-size: 12px; margin-top: 20px;">
          If you didn't create this account, please ignore this email.
        </p>
      </div>
    `;

    await sendEmail({
      to: user.email,
      subject: "Verify Your Email - Business Accelerator",
      html
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully. Please check your email to verify your account.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (err) {
    console.error("Register Error:", err);

    // Handle duplicate key errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      const message = field === 'phone'
        ? "Phone number already exists"
        : "Email already exists";
      return res.status(400).json({
        success: false,
        message
      });
    }

    // Handle validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(error => error.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error during registration"
    });
  }
};

// ✅ Verify Account (OTP Based)
export const verifyAccount = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User is already verified"
      });
    }

    // Check OTP
    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP"
      });
    }

    // Verify user
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Send Welcome Email
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8B5CF6;">Welcome to Business Accelerator!</h2>
        <p>Hello ${user.name},</p>
        <p>Your email has been successfully verified.</p>
        <p>We are excited to have you on board! You can now log in and start exploring our platform.</p>
        
        <a href="${process.env.CLIENT_URL}/login" 
           style="background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 15px 0;">
          Login to Dashboard
        </a>
        
        <p style="color: #666; font-size: 14px; margin-top: 20px;">
          If you have any questions, feel free to reply to this email.
        </p>
      </div>
    `;

    await sendEmail({
      to: user.email,
      subject: "Registration Successful - Welcome to Business Accelerator",
      html
    });

    res.status(200).json({
      success: true,
      message: "Email verified successfully. Please login."
    });

  } catch (err) {
    console.error("Verify Account Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Verify Email (Legacy Link Based - Kept for backward compatibility if needed, but deprecated)
export const verifyEmail = async (req, res) => {
  try {
    const token = req.params.token;
    if (!token)
      return res.status(400).json({ success: false, message: "Invalid token" });

    const hashed = hashToken(token);
    const user = await User.findOne({
      verificationToken: hashed,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ success: false, message: "Token invalid or expired" });

    // user.verificationToken = undefined; // Don't clear immediately to allow refresh? No, security risk.
    // user.verificationTokenExpires = undefined;

    // Correction: We should clear it, but maybe the findOne failed.
    // Let's debug why it fails if it does.

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    // Redirect to the frontend login page
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    res.redirect(`${clientUrl}/login?verified=true`);
  } catch (err) {
    console.error("Verify Email Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Login (UPDATED - includes phone in response)
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email (case insensitive)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please sign up.'
      });
    }

    // Check if user has a password (for OAuth users)
    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: 'This account uses Google Sign-In. Please use Google to log in.'
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // IMPORTANT: Use the user's actual role from database, NOT from request
    const userActualRole = user.role;

    // Session Tracking Logic
    const userAgent = req.headers['user-agent'] || '';
    const ip = req.ip || req.connection.remoteAddress;

    // Simple parser (can be refined)
    const getDeviceType = (ua) => {
      if (ua.match(/mobile/i)) return 'Mobile';
      if (ua.match(/tablet/i)) return 'Tablet';
      return 'Desktop';
    };

    const getBrowser = (ua) => {
      if (ua.includes('Chrome')) return 'Chrome';
      if (ua.includes('Firefox')) return 'Firefox';
      if (ua.includes('Safari')) return 'Safari';
      if (ua.includes('Edge')) return 'Edge';
      return 'Unknown';
    };

    // Add new session
    user.loginSessions.push({
      device: `${getDeviceType(userAgent)} - ${getBrowser(userAgent)}`, // Store combined name
      browser: getBrowser(userAgent),
      ip: ip,
      lastActive: new Date()
    });

    await user.save(); // Save the session

    // Generate JWT token with the ACTUAL role from database
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: userActualRole // Use actual role from DB
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Return success response with ACTUAL role and phone
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone, // Added phone to response
        role: userActualRole, // Use actual role from DB
        isVerified: user.isVerified,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// ✅ Logout (UNCHANGED)
export const logout = (req, res) => {
  res.clearCookie("token");
  res.json({ success: true, message: "Logged out successfully" });
};

// ✅ Forgot Password (Email Only)
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide email for password reset"
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user found with this email"
      });
    }

    const resetToken = createRandomToken();
    user.resetPasswordToken = hashToken(resetToken);
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #8B5CF6;">Password Reset Request</h2>
          <p>Hello ${user.name},</p>
          <p>You requested to reset your password. Click the button below to proceed:</p>
          
          <a href="${resetUrl}" 
             style="background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 15px 0;">
            Reset Password
          </a>
          
          <p style="color: #666; font-size: 14px;">
            This link will expire in 15 minutes.
          </p>
          
          <p style="color: #999; font-size: 12px; margin-top: 20px;">
            If you didn't request this reset, please ignore this email.
          </p>
        </div>
      `;

    await sendEmail({
      to: user.email,
      subject: "Password Reset - Business Accelerator",
      html
    });

    res.json({
      success: true,
      message: "Password reset email sent"
    });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Reset Password (Traditional reset - UPDATED with phone in response)
export const resetPassword = async (req, res) => {
  try {
    const token = req.params.token;
    const { password } = req.body;

    const hashedToken = hashToken(token);
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ success: false, message: "Token invalid or expired" });

    // Remove manual hashing - let the User model handle it
    user.password = password.trim(); // Model will hash this automatically
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const jwtToken = createTokenAndSetCookie(res, user._id);

    res.json({
      success: true,
      message: "Password reset successful",
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone, // Added phone to response
        role: user.role
      }
    });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Send OTP for password reset (Email only - SMS removed)
export const sendOtp = async (req, res) => {
  try {
    const { email, method } = req.body;

    if (!method || method !== 'email' || !email) {
      return res.status(400).json({
        success: false,
        message: "Please provide email for OTP"
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address"
      });
    }

    // Generate OTP (6 digits)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Generate reset token for verification
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = Date.now() + 30 * 60 * 1000; // 30 minutes

    // Save OTP and reset token to user
    user.otp = otp;
    user.otpExpires = otpExpires;
    user.resetToken = resetToken;
    user.resetTokenExpires = resetTokenExpires;
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8B5CF6;">Password Reset OTP</h2>
        <p>Hello ${user.name},</p>
        <p>Your OTP for password reset is:</p>
        
        <div style="background: #f4f4f4; padding: 15px; text-align: center; margin: 20px 0;">
          <h1 style="color: #8B5CF6; margin: 0; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          This OTP will expire in 10 minutes.
        </p>
        
        <p>Alternatively, you can reset your password by clicking the button below:</p>
        
        <a href="${resetUrl}" 
           style="background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 15px 0;">
          Reset Password
        </a>
        
        <p style="color: #666; font-size: 12px; margin-top: 20px;">
          If you didn't request this reset, please ignore this email.
        </p>
      </div>
    `;

    await sendEmail({
      to: user.email,
      subject: "Password Reset OTP - Business Accelerator",
      html
    });

    res.status(200).json({
      success: true,
      message: `OTP sent successfully to your email`,
      resetToken,
      method,
      identifier: email
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP. Please try again."
    });
  }
};

// ✅ Verify OTP and direct login (UPDATED - includes phone in response)
export const verifyOtp = async (req, res) => {
  try {
    const { otp, resetToken, method } = req.body;

    if (!otp || !resetToken) {
      return res.status(400).json({
        success: false,
        message: "OTP and reset token are required"
      });
    }

    // Find user by reset token
    const user = await User.findOne({
      resetToken,
      resetTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token"
      });
    }

    // Verify OTP
    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP"
      });
    }

    // OTP is valid - generate JWT token for direct login
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Clear OTP and reset tokens
    user.otp = undefined;
    user.otpExpires = undefined;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;

    // Session Tracking for OTP Login
    const userAgent = req.headers['user-agent'] || '';
    const ip = req.ip || req.connection.remoteAddress;

    const getDeviceType = (ua) => {
      if (ua.match(/mobile/i)) return 'Mobile';
      if (ua.match(/tablet/i)) return 'Tablet';
      return 'Desktop';
    };

    const getBrowser = (ua) => {
      if (ua.includes('Chrome')) return 'Chrome';
      if (ua.includes('Firefox')) return 'Firefox';
      if (ua.includes('Safari')) return 'Safari';
      if (ua.includes('Edge')) return 'Edge';
      return 'Unknown';
    };

    user.loginSessions.push({
      device: `${getDeviceType(userAgent)} - ${getBrowser(userAgent)}`,
      browser: getBrowser(userAgent),
      ip: ip,
      lastActive: new Date()
    });

    await user.save();

    // Set cookie for session-based auth
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone, // Added phone to response
        role: user.role,
        isVerified: user.isVerified,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to verify OTP. Please try again."
    });
  }
};

// ✅ Resend OTP (Email only)
export const resendOtp = async (req, res) => {
  try {
    const { resetToken, method, email } = req.body;

    let user;

    // Method 1: Find by resetToken (for OTP flow)
    if (resetToken) {
      user = await User.findOne({
        resetToken,
        resetTokenExpires: { $gt: Date.now() }
      });
    }
    // Method 2: Find by email
    else if (method === 'email' && email) {
      user = await User.findOne({ email: email.toLowerCase() });
    } else {
      return res.status(400).json({
        success: false,
        message: "Please provide reset token or email"
      });
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token, or user not found"
      });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Update OTP fields
    user.otp = otp;
    user.otpExpires = otpExpires;

    // If using resetToken method, also update the reset token expiration
    if (resetToken) {
      user.resetTokenExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
    }

    await user.save();

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${user.resetToken}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8B5CF6;">New OTP Request</h2>
        <p>Hello ${user.name},</p>
        <p>Here is your new OTP for password reset:</p>
        
        <div style="background: #f4f4f4; padding: 15px; text-align: center; margin: 20px 0;">
          <h1 style="color: #8B5CF6; margin: 0; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          This OTP will expire in 10 minutes.
        </p>
        
        <p>You can also reset your password by clicking the button below:</p>
        
        <a href="${resetUrl}" 
           style="background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 15px 0;">
          Reset Password
        </a>
      </div>
    `;

    await sendEmail({
      to: user.email,
      subject: "New OTP - Business Accelerator",
      html
    });

    res.status(200).json({
      success: true,
      message: "New OTP sent successfully"
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to resend OTP. Please try again."
    });
  }
};

// ✅ Update Password
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.password) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: "Please provide current password" });
      }
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: "Incorrect current password" });
      }
    }

    // Common Validation
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long"
      });
    }

    // Update password
    user.password = newPassword;

    // If they were Google/OAuth only, they now have a local password too
    if (user.authMethod === 'google') {
      // We can keep authMethod as 'google' but they can now login with password too if we supported hybrid. 
      // For now, let's just save the password. 
      // Or we could switch authMethod to 'local' if we want to enforce one active method.
      // Let's just user.password = newPassword which implicitly enables password login if logic checks password presence.
    }

    await user.save();

    // Generate new token
    const token = createTokenAndSetCookie(res, user._id);

    res.json({
      success: true,
      message: user.password ? "Password updated successfully" : "Password set successfully",
      token
    });
  } catch (err) {
    console.error("Update Password Error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Server error"
    });
  }
};

// ✅ Protected Profile Route
export const getProfile = async (req, res) => {
  try {
    // Fetch user with password field included to check existence
    const user = await User.findById(req.user.id).select('+password');

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
        authMethod: user.authMethod,
        hasPassword: !!user.password, // Check if password exists
        avatar: user.avatar,
        // Mentor Fields
        bio: user.bio,
        jobTitle: user.jobTitle,
        company: user.company,
        linkedin: user.linkedin,
        // Settings Fields
        notificationPreferences: user.notificationPreferences,
        privacySettings: user.privacySettings,
        userPreferences: user.userPreferences,
        loginSessions: user.loginSessions
      }
    });
  } catch (err) {
    console.error("Get Profile Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Update Profile
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Top-level fields
    const allowedFields = [
      'name', 'phone', 'avatar', 'bio', 'jobTitle',
      'company', 'linkedin', 'expertise', 'yearsExperience'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    // Nested Preference Objects - Recursive Merge
    if (req.body.notificationPreferences) {
      user.notificationPreferences = {
        ...(user.notificationPreferences || {}),
        ...req.body.notificationPreferences
      };
    }

    if (req.body.privacySettings) {
      user.privacySettings = {
        ...(user.privacySettings || {}),
        ...req.body.privacySettings
      };
    }

    if (req.body.userPreferences) {
      user.userPreferences = {
        ...(user.userPreferences || {}),
        ...req.body.userPreferences
      };
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
        jobTitle: updatedUser.jobTitle,
        company: updatedUser.company,
        linkedin: updatedUser.linkedin,
        expertise: updatedUser.expertise,
        yearsExperience: updatedUser.yearsExperience,
        notificationPreferences: updatedUser.notificationPreferences,
        privacySettings: updatedUser.privacySettings,
        userPreferences: updatedUser.userPreferences
      }
    });
  } catch (err) {
    console.error("Update Profile Error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Server error"
    });
  }
};

// ✅ Verify Firebase Phone Login
export const verifyPhoneLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ success: false, message: "ID Token is required" });
    }

    // Verify the ID token using Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { phone_number } = decodedToken;

    if (!phone_number) {
      return res.status(400).json({ success: false, message: "Invalid Phone Number in Token" });
    }

    // Check if user exists with this phone number
    let user = await User.findOne({ phone: phone_number });

    // Auto-register if new user
    if (!user) {
      // Create random password
      const randomPassword = crypto.randomBytes(16).toString("hex");

      user = await User.create({
        name: "Mobile User",
        email: `mobile_${phone_number.replace('+', '')}@example.com`,
        phone: phone_number,
        password: randomPassword,
        role: "User",
        isVerified: true
      });
    }

    // Generate JWT for our Backend
    const token = createTokenAndSetCookie(res, user._id);

    res.json({
      success: true,
      message: "Phone login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error("Firebase Verify Error:", error);
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

// ✅ Get Active Sessions
export const getSessions = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const currentIp = req.ip || req.connection.remoteAddress;
    const currentUa = req.headers['user-agent'] || '';

    // If no sessions stored (because user logged in before this feature), add current one
    if (!user.loginSessions || user.loginSessions.length === 0) {

      // Simple parser (can be refined)
      const getDeviceType = (ua) => {
        if (ua.match(/mobile/i)) return 'Mobile';
        if (ua.match(/tablet/i)) return 'Tablet';
        return 'Desktop';
      };

      const getBrowser = (ua) => {
        if (ua.includes('Chrome')) return 'Chrome';
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Safari')) return 'Safari';
        if (ua.includes('Edge')) return 'Edge';
        return 'Unknown';
      };

      const newSession = {
        device: `${getDeviceType(currentUa)} - ${getBrowser(currentUa)}`,
        browser: getBrowser(currentUa),
        ip: currentIp,
        lastActive: new Date()
      };

      user.loginSessions = [newSession];
      await user.save();
    }

    // Map sessions to simplified format
    // We try to guess "isCurrent" by matching IP and rough browser (optional, simplistic)
    // Note: IP matching in dev (localhost vs ::1) can be tricky.
    const sessions = user.loginSessions.map(session => ({
      id: session._id,
      deviceName: session.device || 'Unknown Device',
      deviceType: session.device?.includes('Mobile') ? 'mobile' : 'desktop',
      location: session.ip === '::1' ? 'Localhost' : (session.ip || 'Unknown'),
      lastActive: session.lastActive,
      isCurrent: session.ip === currentIp, // Simple heuristic for now
      ipAddress: session.ip
    }));

    // Sort by most recent
    sessions.sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive));

    res.json({
      success: true,
      sessions
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sessions'
    });
  }
};

// ✅ Logout Specific Session
export const logoutSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const user = await User.findById(req.user.id);

    // Remove session with matching _id
    user.loginSessions = user.loginSessions.filter(s => s._id.toString() !== sessionId);

    await user.save();

    res.json({
      success: true,
      message: 'Session logged out successfully'
    });
  } catch (error) {
    console.error('Logout session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to logout session'
    });
  }
};
