import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      sparse: true, // Allows multiple null values
      trim: true
    },
    password: {
      type: String,
      required: function () {
        return this.authMethod === 'local'; // Only required for local auth
      },
      minlength: 6
    },
    role: {
      type: String,
      enum: ["User", "Mentor", "Admin"],
      default: "User",
    },
    status: {
      type: String,
      enum: ["Active", "Suspended", "Pending"],
      default: "Active"
    },
    isVerified: { type: Boolean, default: false },

    // Email verification fields
    verificationToken: { type: String, index: true },
    verificationTokenExpires: Date,

    // Password reset fields (existing)
    resetPasswordToken: { type: String, index: true },
    resetPasswordExpires: Date,

    // OTP fields (new)
    otp: { type: String },
    otpExpires: { type: Date },
    resetToken: { type: String, index: true }, // For OTP flow
    resetTokenExpires: { type: Date },

    // OAuth fields
    googleId: { type: String, sparse: true },
    authMethod: {
      type: String,
      enum: ["local", "google"],
      default: "local"
    },
    avatar: { type: String }, // Added avatar field

    // Mentor Specific Fields
    bio: { type: String, default: "" },
    jobTitle: { type: String, default: "" },
    headline: { type: String, default: "" }, // Professional Title
    company: { type: String, default: "" },
    location: { type: String, default: "" }, // City, Country
    expertise: { type: [String], default: [] },
    yearsExperience: { type: Number, default: 0 },
    linkedin: { type: String, default: "" },
    portfolio: { type: String, default: "" }, // Separate Portfolio URL

    // Stats & Feedback
    fundingRaised: { type: String, default: "" }, // e.g., "₹8 Cr"
    rating: { type: Number, default: 0 }, // Default 0 means unrated
    testimonials: [{
      author: String,
      role: String,
      company: String,
      text: String,
      avatar: String
    }],

    // Arrays
    mentorshipRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MentorshipRequest' }],
    sessions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Session' }],

    // Chat Features
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    hiddenConversations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // Settings & Preferences
    notificationPreferences: {
      mentorRequests: { type: Boolean, default: true },
      sessionReminders: { type: Boolean, default: true },
      platformUpdates: { type: Boolean, default: true },
      marketingEmails: { type: Boolean, default: false },
      newReviews: { type: Boolean, default: true },          // For Mentors
      requestStatusUpdates: { type: Boolean, default: true }, // For Users
      investmentAlerts: { type: Boolean, default: false }     // For Users
    },
    privacySettings: {
      profileVisibility: { type: String, enum: ["Public", "MentorsOnly", "Private"], default: "Public" },
      showEmail: { type: Boolean, default: false },
      showPhone: { type: Boolean, default: false }
    },
    userPreferences: {
      theme: { type: String, enum: ["Light", "Dark", "System"], default: "Dark" },
      language: { type: String, default: "en" }
    },
    loginSessions: [{
      device: String,
      browser: String,
      ip: String,
      lastActive: { type: Date, default: Date.now },
      tokenHash: String // store a hash of the token to revoke specific sessions
    }]
  },
  { timestamps: true }
);

// Hash password before saving - ONLY if password is modified and exists
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare passwords - handle cases where user has no password (OAuth)
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false; // OAuth users don't have passwords
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to check if OTP is valid
userSchema.methods.isOtpValid = function (otp) {
  return this.otp === otp && this.otpExpires && this.otpExpires > Date.now();
};

// Method to check if reset token is valid
userSchema.methods.isResetTokenValid = function () {
  return this.resetToken && this.resetTokenExpires && this.resetTokenExpires > Date.now();
};

// Method to generate and save OTP
userSchema.methods.generateOtp = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = otp;
  this.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return otp;
};

// Method to generate reset token
userSchema.methods.generateResetToken = function () {
  const crypto = require('crypto');
  this.resetToken = crypto.randomBytes(32).toString('hex');
  this.resetTokenExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
  return this.resetToken;
};

// Method to clear OTP fields
userSchema.methods.clearOtp = function () {
  this.otp = undefined;
  this.otpExpires = undefined;
};

// Method to clear reset tokens
userSchema.methods.clearResetTokens = function () {
  this.resetToken = undefined;
  this.resetTokenExpires = undefined;
  this.resetPasswordToken = undefined;
  this.resetPasswordExpires = undefined;
};

// Add indexes for performance
userSchema.index({ role: 1 });

const User = mongoose.model("User", userSchema);
export default User;