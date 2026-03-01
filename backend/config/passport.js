// config/passport.js
import dotenv from 'dotenv';
dotenv.config();

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

console.log('=== PASSPORT CONFIGURATION ===');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '***' + process.env.GOOGLE_CLIENT_SECRET.slice(-4) : 'Missing');
console.log('BACKEND_URL:', process.env.BACKEND_URL);
console.log('==============================');

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error('❌ Google OAuth credentials are missing in passport.js!');
  console.log('⚠️  Google OAuth will be disabled');
} else {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`,
        // Add this to force account selection
        passReqToCallback: true
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          console.log('✅ Google OAuth profile received:', profile.displayName);
          
          const email = profile.emails?.[0]?.value;
          const name = profile.displayName || "User";
          const googleId = profile.id;
          const avatar = profile.photos?.[0]?.value;

          let user = await User.findOne({ 
            $or: [{ email }, { googleId }] 
          });

          if (!user) {
            console.log('❌ User not found with email:', email);
            return done(null, false, { 
              message: 'No account found with this email. Please sign up first.' 
            });
          }

          console.log('✅ Existing user found:', user.email);
          
          if (!user.googleId) {
            user.googleId = googleId;
            user.authMethod = "google";
          }
          user.avatar = avatar || user.avatar;
          user.isVerified = true;
          await user.save();

          return done(null, user);
        } catch (err) {
          console.error("❌ Google Auth Error:", err);
          return done(err, null);
        }
      }
    )
  );
  
  console.log('✅ Google OAuth strategy configured successfully');
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;