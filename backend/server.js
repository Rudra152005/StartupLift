import dotenv from 'dotenv';
dotenv.config(); // This MUST be first

// Debug environment variables
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
console.log('BACKEND_URL:', process.env.BACKEND_URL);

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import compression from 'compression';

const app = express();

// Middleware
app.use(compression()); // Enable gzip compression for all responses
app.use(cookieParser()); // Use cookie-parser before other middleware

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://localhost:5175",
  "http://localhost:5176",
  process.env.FRONTEND_URL // Vercel URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  proxy: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// ✅ IMPORTANT: Import and configure passport BEFORE routes
import './config/passport.js';

// Initialize passport middleware AFTER passport configuration
app.use(passport.initialize());
app.use(passport.session());

// Debug: Check if Google strategy is registered
console.log('Passport strategies:', Object.keys(passport._strategies));

// Import routes AFTER passport is configured
import authRoutes from './routes/authRoutes.js';
import startupRoutes from './routes/startupRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import mentorRoutes from './routes/mentorRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import programRoutes from './routes/programRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import networkRoutes from './routes/networkRoutes.js';


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/startups', startupRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/network', networkRoutes);


// MongoDB connection with better error handling
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('⚠️  Server is running but database-dependent features will fail.');
  }
};

// Start Server
const startServer = async () => {
  // Connect to Database
  await connectDB();

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔗 Local: http://localhost:${PORT}`);
    console.log(`🌐 Network: http://0.0.0.0:${PORT}`);
  });
};

startServer();

// Root Route
app.get('/', (req, res) => {
  res.send('Backend Server is Running correctly!');
});
