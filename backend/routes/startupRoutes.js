import express from 'express';
import Startup from '../models/Startup.js';
import User from '../models/User.js';

const router = express.Router();

// Get all startups (Optimized for landing page)
router.get('/', async (req, res) => {
    try {
        // Only select fields needed for the marquee to reduce payload size
        const startups = await Startup.find()
            .select('name desc image category views date author createdAt')
            .sort({ createdAt: -1 })
            .limit(20); // Limit to a reasonable number for initial load
        res.json(startups);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get startup by User ID (For Dashboard)
router.get('/user/:userId', async (req, res) => {
    try {
        const startup = await Startup.findOne({ userId: req.params.userId });
        if (!startup) {
            return res.status(404).json({ message: "Startup not found for this user" });
        }
        res.json(startup);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get startup by ID (For Details Page)
router.get('/:id', async (req, res) => {
    try {
        const startup = await Startup.findById(req.params.id);
        if (!startup) {
            return res.status(404).json({ message: "Startup not found" });
        }
        res.json(startup);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create or Update a startup (Upsert)
router.post('/', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ message: "UserId is required" });
    }

    try {
        // Calculate Readiness Score based on Stage (Category)
        let score = 0;
        const stage = req.body.category || "Idea";

        switch (stage) {
            case "Idea": score = 25; break;
            case "MVP": score = 50; break;
            case "Growth": score = 75; break;
            case "Scale": score = 95; break;
            default: score = 10;
        }

        // Add calculated score to body
        req.body.readinessScore = score;

        // Check if user updates are needed (LinkedIn/Portfolio)
        if (req.body.linkedin !== undefined || req.body.portfolio !== undefined) {
            try {
                await User.findByIdAndUpdate(userId, {
                    $set: {
                        linkedin: req.body.linkedin,
                        portfolio: req.body.portfolio
                    }
                });
            } catch (uErr) {
                console.error("Failed to sync user profile fields (non-fatal):", uErr);
            }
        }

        // Upsert: Find by userId and update, or create new if not exists
        const updatedStartup = await Startup.findOneAndUpdate(
            { userId: userId },
            { $set: req.body }, // Explicitly using $set for clarity, though mongoose default often handles it
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        res.status(200).json(updatedStartup);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

export default router;
