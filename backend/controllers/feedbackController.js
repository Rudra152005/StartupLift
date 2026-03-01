import Feedback from '../models/Feedback.js';

// Create new feedback (Mentor -> Mentee)
export const createFeedback = async (req, res) => {
    try {
        const { recipient, rating, milestoneStatus, observations, actionItems } = req.body;
        const mentor = req.user.id;

        if (!recipient || !rating) {
            return res.status(400).json({ message: "Recipient and Rating are required." });
        }

        const newFeedback = new Feedback({
            recipient,
            mentor,
            rating,
            milestoneStatus,
            observations,
            actionItems
        });

        await newFeedback.save();

        res.status(201).json({
            success: true,
            message: "Feedback submitted successfully!",
            data: newFeedback
        });

    } catch (error) {
        console.error("Error submitting feedback:", error);
        res.status(500).json({ message: "Server error submitting feedback" });
    }
};

// Get feedback received by the logged-in user (Mentee view)
export const getMyFeedback = async (req, res) => {
    try {
        const userId = req.user.id;
        const feedback = await Feedback.find({ recipient: userId })
            .populate('mentor', 'name avatar jobTitle')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: feedback.length,
            data: feedback
        });
    } catch (error) {
        console.error("Error fetching feedback:", error);
        res.status(500).json({ message: "Server error fetching feedback" });
    }
};

// Get feedback given BY the logged-in mentor (Mentor view - History)
export const getGivenFeedback = async (req, res) => {
    try {
        const mentorId = req.user.id;
        const feedback = await Feedback.find({ mentor: mentorId })
            .populate('recipient', 'name email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: feedback.length,
            data: feedback
        });
    } catch (error) {
        console.error("Error fetching given feedback:", error);
        res.status(500).json({ message: "Server error fetching feedback" });
    }
};
