import Resource from '../models/Resource.js';
import MentorshipRequest from '../models/MentorshipRequest.js';

// Get resources for a user (Founder)
export const getResources = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Find all mentors the user follows (Accepted Mentorship Requests)
        const mentorships = await MentorshipRequest.find({
            founderId: userId,
            status: 'accepted'
        }).select('mentorId');

        const mentorIds = mentorships.map(m => m.mentorId);

        // 2. Find resources from these mentors OR public resources
        // Logic: Show resources if:
        // - Added by a mentor I follow (Private or Public)
        // - OR is Public (Global visibility)
        const resources = await Resource.find({
            $or: [
                { addedBy: { $in: mentorIds } },
                { isPublic: true }
            ]
        })
            .populate('addedBy', 'name avatar')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: resources.length,
            data: resources
        });

    } catch (error) {
        console.error("Error fetching resources:", error);
        res.status(500).json({ message: "Server error fetching resources" });
    }
};

// Get resources uploaded by Mentor
export const getMentorResources = async (req, res) => {
    try {
        const resources = await Resource.find({ addedBy: req.user.id }).sort({ createdAt: -1 });
        res.json({ success: true, count: resources.length, data: resources });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Add a resource (Mentor)
export const addResource = async (req, res) => {
    try {
        const { title, description, type, url, assignedTo } = req.body;

        const newResource = new Resource({
            title,
            description,
            type,
            url,
            addedBy: req.user.id,
            assignedTo: assignedTo || [] // Array of user IDs
        });

        await newResource.save();

        res.status(201).json({
            success: true,
            message: "Resource added successfully!",
            data: newResource
        });

    } catch (error) {
        console.error("Error adding resource:", error);
        res.status(500).json({ message: "Server error adding resource" });
    }
};
