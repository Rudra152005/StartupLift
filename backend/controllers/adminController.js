import User from '../models/User.js';
import Startup from '../models/Startup.js';
import MentorshipRequest from '../models/MentorshipRequest.js';
import Program from '../models/Program.js';
import Session from '../models/Session.js';
import Resource from '../models/Resource.js';
import Settings from '../models/Settings.js';
import SecurityLog from '../models/SecurityLog.js';

// Helper to log events
export const logSecurityEvent = async (action, details, severity = 'LOW', req = null, status = 'SUCCESS') => {
    try {
        await SecurityLog.create({
            action,
            details,
            severity,
            status,
            ipAddress: req ? (req.ip || req.connection.remoteAddress) : 'SYSTEM',
            adminId: req && req.user ? req.user._id : null
        });
    } catch (error) {
        console.error("Failed to create security log:", error);
    }
};

// Security Logs Endpoint
export const getSecurityLogs = async (req, res) => {
    try {
        const logs = await SecurityLog.find()
            .populate('adminId', 'name email')
            .sort({ createdAt: -1 })
            .limit(100);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch security logs' });
    }
};

// Settings Management
export const getSettings = async (req, res) => {
    try {
        const settings = await Settings.getSettings();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
};

export const updateSettings = async (req, res) => {
    try {
        const settings = await Settings.findOneAndUpdate({}, req.body, { new: true, upsert: true });

        // Log the event
        await logSecurityEvent('UPDATE_SETTINGS', `Settings updated via Admin Panel`, 'MEDIUM', req);

        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update settings' });
    }
};

export const getAllSessions = async (req, res) => {
    try {
        const sessions = await Session.find()
            .populate('mentorId', 'name email')
            .populate('founderId', 'name email')
            .sort({ date: -1 });
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch sessions' });
    }
};

// Resource Management
export const getAllResources = async (req, res) => {
    try {
        const resources = await Resource.find().populate('addedBy', 'name email').sort({ createdAt: -1 });
        res.json(resources);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch resources' });
    }
};

export const createResource = async (req, res) => {
    try {
        // Admin creates resource (can be assigned to all or specific)
        const newResource = new Resource({
            ...req.body,
            addedBy: req.user._id // Assuming admin is authenticated
        });
        await newResource.save();
        res.status(201).json(newResource);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create resource', details: error.message });
    }
};

export const deleteResource = async (req, res) => {
    try {
        await Resource.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Resource deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete resource' });
    }
};

// Analytics & Reports
export const getAnalytics = async (req, res) => {
    try {
        // 1. User Distribution
        const userStats = await User.aggregate([
            { $group: { _id: "$role", count: { $sum: 1 } } }
        ]);

        // 2. Session Status
        const sessionStats = await Session.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        // 3. Startup Categories
        const startupStats = await Startup.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);

        // 4. Monthly User Growth (Last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const growthStats = await User.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        res.json({
            userDistribution: userStats,
            sessionStatus: sessionStats,
            startupCategories: startupStats,
            userGrowth: growthStats
        });

    } catch (error) {
        console.error("Analytics Error:", error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
};

// Get generic dashboard stats
export const getAdminStats = async (req, res) => {
    try {
        // Fetch real counts concurrently
        const [
            userCount,
            startupCount,
            pendingMentorsCount, // Approximate filtering
            totalRequestsCount
        ] = await Promise.all([
            User.countDocuments(),
            Startup.countDocuments().catch(() => 0), // Fallback if model issue
            User.countDocuments({ role: 'Mentor', status: 'Pending' }),
            MentorshipRequest.countDocuments().catch(() => 0)
        ]);

        res.json({
            stats: [
                { label: "Total Users", value: userCount.toLocaleString(), trend: "+8%", trendUp: true },
                { label: "Active Startups", value: startupCount.toString(), trend: "+5%", trendUp: true },
                { label: "Pending Mentors", value: pendingMentorsCount.toString(), trend: "Requires action", trendUp: false, alert: pendingMentorsCount > 0 },
                { label: "Total Requests", value: totalRequestsCount.toLocaleString(), trend: "+12%", trendUp: true },
            ],
            // Mock growth data for chart (can be made dynamic later with aggregation)
            growth: [
                { name: 'Jan', value: 20 }, { name: 'Feb', value: 45 }, { name: 'Mar', value: 35 },
                { name: 'Apr', value: 50 }, { name: 'May', value: 40 }, { name: 'Jun', value: 65 },
                { name: 'Jul', value: 70 }, { name: 'Aug', value: 55 }, { name: 'Sep', value: 60 },
                { name: 'Oct', value: 75 }, { name: 'Nov', value: 85 }, { name: 'Dec', value: 90 },
            ],
            // Activities - mixing real recent users with mock system logs
            activities: [
                {
                    id: 1,
                    text: "New mentor application received",
                    time: "10 min ago",
                    type: "info"
                },
                {
                    id: 2,
                    text: "Startup verified successfully",
                    time: "2h ago",
                    type: "success"
                },
                {
                    id: 3,
                    text: "System check: All services operational",
                    time: "5h ago",
                    type: "purple"
                }
            ]
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ error: 'Failed to fetch admin stats' });
    }
};

// Mentor Management
export const getAllMentors = async (req, res) => {
    try {
        const mentors = await User.find({ role: 'Mentor' }).sort({ createdAt: -1 });
        res.json(mentors);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch mentors' });
    }
};

// Startup Management
export const getAllStartups = async (req, res) => {
    try {
        const startups = await Startup.find().sort({ createdAt: -1 });
        res.json(startups);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch startups' });
    }
};

// Startup Management

export const deleteStartup = async (req, res) => {
    try {
        await Startup.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Startup deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete startup' });
    }
};

// Program Management
export const getAllPrograms = async (req, res) => {
    try {
        const programs = await Program.find().sort({ createdAt: -1 });
        res.json(programs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch programs' });
    }
};

export const createProgram = async (req, res) => {
    try {
        const newProgram = new Program(req.body);
        await newProgram.save();
        res.status(201).json(newProgram);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create program', details: error.message });
    }
};

export const deleteProgram = async (req, res) => {
    try {
        await Program.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Program deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete program' });
    }
};

// User Management
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

export const createUser = async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create user', details: error.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
};

export const deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
};
