import User from '../models/User.js';
import MentorshipRequest from '../models/MentorshipRequest.js';
import Startup from '../models/Startup.js';
import Session from '../models/Session.js';
import Feedback from '../models/Feedback.js';
import mongoose from 'mongoose';
import Funding from '../models/Funding.js';

// Get all mentors with request status for the current user
export const getAllMentors = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Fetch all mentors
        const mentors = await User.find({ role: 'Mentor' })
            .select('name email avatar expertise yearsExperience jobTitle headline company location bio rating linkedin portfolio fundingRaised testimonials')
            .lean();

        // 2. Fetch all requests made by this user
        const myRequests = await MentorshipRequest.find({ founderId: userId })
            .select('mentorId status')
            .sort({ createdAt: 1 });

        // 3. Map requests to a dictionary for O(1) lookup
        const requestMap = {};
        myRequests.forEach(req => {
            requestMap[req.mentorId.toString()] = req.status;
        });

        // 4. Attach status to each mentor
        const mentorsWithStatus = mentors.map(mentor => ({
            ...mentor,
            requestStatus: requestMap[mentor._id.toString()] || null // 'pending', 'accepted', 'rejected', or null
        }));

        res.json({
            success: true,
            count: mentorsWithStatus.length,
            data: mentorsWithStatus
        });
    } catch (error) {
        console.error("Error fetching mentors:", error);
        res.status(500).json({ message: "Server error fetching mentors" });
    }
};

// Create a mentorship or funding request (Single or Bulk)
export const createMentorshipRequest = async (req, res) => {
    try {
        const { mentorId, mentorIds, message, goals, requestType } = req.body;
        const founderId = req.user.id;

        // Determine list of targets (support both single 'mentorId' and bulk 'mentorIds')
        let targets = [];
        if (mentorIds && Array.isArray(mentorIds)) {
            targets = mentorIds;
        } else if (mentorId) {
            targets = [mentorId];
        } else {
            return res.status(400).json({ message: "Mentor ID(s) required" });
        }

        const results = {
            success: [],
            failed: []
        };

        // Process each target
        for (const targetId of targets) {
            // Check if request already exists
            const existingRequest = await MentorshipRequest.findOne({
                mentorId: targetId,
                founderId,
                status: { $in: ['pending', 'accepted'] }
            });

            if (existingRequest) {
                results.failed.push({ id: targetId, reason: "Request already pending or active" });
                continue;
            }

            // Find founder's startup to link
            const startup = await Startup.findOne({ userId: founderId });

            // Create new request
            const newRequest = new MentorshipRequest({
                mentorId: targetId,
                founderId,
                startupId: startup ? startup._id : null,
                message,
                goals,
                documents: req.body.documents || [],
                video: req.body.video || '',
                teamVerification: req.body.teamVerification || [],
                requestType: requestType || 'Mentorship'
            });

            await newRequest.save();
            results.success.push(newRequest);
        }

        res.status(201).json({
            success: true,
            message: `Requests processed: ${results.success.length} sent, ${results.failed.length} skipped.`,
            data: results
        });

    } catch (error) {
        console.error("Error sending request:", error);
        res.status(500).json({ message: "Server error sending request" });
    }
};

// Get requests for the logged-in mentor
export const getMentorRequests = async (req, res) => {
    try {
        const mentorId = req.user.id;
        const { status } = req.query;

        const query = { mentorId };

        // Default to 'pending' unless 'all' is specified or a specific status is given
        if (status === 'all') {
            // No status filter
        } else if (status) {
            query.status = status;
        } else {
            query.status = 'pending';
        }

        const requests = await MentorshipRequest.find(query)
            .populate('founderId', 'name email avatar linkedin portfolio bio company location headline') // Get detailed founder info
            .populate('startupId', 'name industry category desc detailedDescription image pitchDeck videoPitch location teamSize website problem solution teamMembers readinessScore founded')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: requests.length,
            data: requests
        });
    } catch (error) {
        console.error("Error fetching requests:", error);
        res.status(500).json({ message: "Server error fetching requests" });
    }
};

// Update request status (Accept/Reject)
export const updateRequestStatus = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { status } = req.body; // 'accepted' or 'rejected'
        const mentorId = req.user.id;

        // Verify request exists and belongs to this mentor
        const request = await MentorshipRequest.findOne({
            _id: requestId,
            mentorId
        });

        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        request.status = status;
        await request.save();

        res.json({
            success: true,
            message: `Request ${status} successfully`,
            data: request
        });

    } catch (error) {
        console.error("Error updating request:", error);
        res.status(500).json({ message: "Server error updating request" });
    }
};

// Get startups that the mentor has accepted
export const getMyStartups = async (req, res) => {
    try {
        const mentorId = req.user.id;

        // Find all accepted mentorship requests (both Funding and Mentorship)
        const acceptedRequests = await MentorshipRequest.find({
            mentorId,
            status: 'accepted'
        }).populate('founderId', 'name email avatar linkedin portfolio');

        // Create a map of user details and request type
        const founderMap = {};
        const requestTypeMap = {}; // Map founderId -> requestType

        acceptedRequests.forEach(req => {
            if (req.founderId) {
                const founderIdStr = req.founderId._id.toString();
                founderMap[founderIdStr] = req.founderId;
                // Store request type (prioritize 'Funding' if multiple exist, or just take the first found)
                if (!requestTypeMap[founderIdStr] || req.requestType === 'Funding') {
                    requestTypeMap[founderIdStr] = req.requestType;
                }
            }
        });

        const founderIds = Object.keys(founderMap);

        // Fetch startups for these founders
        const startups = await Startup.find({
            userId: { $in: founderIds }
        });

        // Merge founder details and requestType into startup objects
        const enrichedStartups = startups.map(startup => {
            const founder = founderMap[startup.userId];
            const type = requestTypeMap[startup.userId] || 'Mentorship';
            return {
                ...startup.toObject(),
                linkedin: founder?.linkedin || "",
                portfolio: founder?.portfolio || "",
                requestType: type // 'Mentorship' or 'Funding'
            };
        });

        res.json({
            success: true,
            count: enrichedStartups.length,
            data: enrichedStartups
        });

    } catch (error) {
        console.error("Error fetching my startups:", error);
        res.status(500).json({ message: "Server error fetching startups" });
    }
};

// Get mentor profile
export const getMentorProfile = async (req, res) => {
    try {
        const mentorId = req.user.id;

        // Fetch user with profile fields
        const mentor = await User.findById(mentorId).select('name email avatar role jobTitle headline company location bio expertise yearsExperience linkedin portfolio fundingRaised testimonials rating isVerified');

        if (!mentor) {
            return res.status(404).json({ message: "Mentor not found" });
        }

        // Calculate Stats
        const [totalSessions, approvedRequests] = await Promise.all([
            Session.countDocuments({ mentorId }),
            MentorshipRequest.find({ mentorId, status: 'accepted' }).select('founderId')
        ]);

        // Fetch startup names for approved requests
        const founderIds = approvedRequests.map(req => req.founderId);
        const startups = await Startup.find({ userId: { $in: founderIds } }).select('name');
        const startupNames = startups.map(s => s.name);

        const stats = {
            totalSessions,
            startupsMentored: startupNames.length,
            startupNames, // Array of names
            fundingRaised: mentor.fundingRaised || "",
            rating: mentor.rating || 0
        };

        res.json({
            success: true,
            user: {
                ...mentor.toObject(),
                stats
            }
        });

    } catch (error) {
        console.error("Error fetching mentor profile:", error);
        res.status(500).json({ message: "Server error fetching profile" });
    }
};



// Mentor Dashboard Overview Data
export const getDashboardOverview = async (req, res) => {
    try {
        const mentorId = req.user.id;
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        // Auto-expire logic (Ensure consistency)
        const now = new Date();
        const sessionsToCheck = await Session.find({
            mentorId,
            status: 'scheduled',
            date: { $lt: now }
        });

        const bulkOps = [];
        for (const session of sessionsToCheck) {
            const endTime = new Date(new Date(session.date).getTime() + (session.durationMinutes || 60) * 60000);
            if (endTime < now) {
                let status = 'expired';
                let attendanceResult = 'both_missed';

                if (session.userJoined && session.mentorJoined) {
                    status = 'completed';
                    attendanceResult = 'completed';
                } else if (!session.userJoined && session.mentorJoined) {
                    attendanceResult = 'user_missed';
                } else if (session.userJoined && !session.mentorJoined) {
                    attendanceResult = 'mentor_missed';
                }

                bulkOps.push({
                    updateOne: {
                        filter: { _id: session._id },
                        update: { $set: { status, attendanceResult } }
                    }
                });
            }
        }

        if (bulkOps.length > 0) {
            await Session.bulkWrite(bulkOps);
        }

        // 1. Fetch Everything in Parallel
        const Resource = (await import('../models/Resource.js')).default;
        const Task = (await import('../models/Task.js')).default; // Dynamic import for Task

        // Prepare promises
        const promises = [
            MentorshipRequest.find({ mentorId, status: 'accepted' })
                .select('founderId')
                .populate('founderId', '_id')
                .then(reqs => {
                    const uniqueFounders = new Set();
                    reqs.forEach(r => {
                        if (r.founderId) uniqueFounders.add(r.founderId._id.toString());
                    });
                    return uniqueFounders.size;
                }),
            MentorshipRequest.countDocuments({ mentorId, status: 'pending' }),
            Session.countDocuments({
                mentorId,
                date: { $gte: todayStart, $lte: todayEnd },
                status: { $ne: 'cancelled' }
            }),
            Session.countDocuments({
                mentorId,
                $or: [
                    { status: 'completed' },
                    { status: 'expired', mentorJoined: true }
                ]
            }), // Total sessions delivered (attended by mentor)
            Resource.countDocuments({ addedBy: mentorId }),
            User.findById(mentorId).select('rating'), // Fetch mentor rating
            Session.find({
                mentorId,
                date: { $gte: todayStart, $lte: todayEnd },
                status: { $ne: 'cancelled' }
            }).populate('founderId', 'name email avatar').sort({ date: 1 }).limit(5),
            MentorshipRequest.find({ mentorId }).populate('founderId', 'name').sort({ updatedAt: -1 }).limit(3).lean(),
            Resource.find({ addedBy: mentorId }).sort({ createdAt: -1 }).limit(3).lean(),
            // New Funding Queries
            Funding.find({ mentorId }).sort({ createdAt: -1 }).limit(10).lean(),
            Funding.aggregate([
                { $match: { mentorId: new mongoose.Types.ObjectId(mentorId), status: 'paid' } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]),
            // Fetch Priority Tasks
            Task.find({
                assignedBy: mentorId,
                $or: [
                    { status: { $ne: 'completed' } },
                    { status: 'completed', reviewedAt: { $exists: false } }
                ]
            })
                .sort({ dueDate: 1 }) // Sooner deadlines first
                .limit(5)
                .populate('assignedTo', 'name avatar') // Get Mentee details
        ];

        const [
            activeStartups,
            pendingRequests,
            sessionsTodayCount,
            totalSessionsCount,
            resourcesCount,
            mentor,
            todaysSessions,
            recentRequests,
            recentResources,
            rawFundingHistory,
            totalFundingResult,
            priorityTasks
        ] = await Promise.all(promises);

        // Process Funding Data to get Startup Names
        const founderIds = rawFundingHistory.map(f => f.founderId);
        let startups = [];
        if (founderIds.length > 0) {
            startups = await Startup.find({ userId: { $in: founderIds } }).select('userId name').lean();
        }

        const startupMap = {};
        startups.forEach(s => {
            startupMap[s.userId.toString()] = s.name;
        });

        const fundingHistory = rawFundingHistory.map(f => ({
            id: f._id,
            startup: startupMap[f.founderId.toString()] || "Unknown Startup",
            amount: f.amount,
            date: f.createdAt,
            type: "Investment", // Default as Funding model lacks type
            status: f.status === 'paid' ? 'Completed' : 'Pending'
        }));

        const totalInvested = totalFundingResult.length > 0 ? totalFundingResult[0].total : 0;

        // Combine and sort activities
        let activities = [
            ...recentRequests.map(r => ({
                text: `${r.status === 'pending' ? 'Received' : r.status} request from ${r.founderId ? r.founderId.name : 'Unknown User'}`,
                time: r.updatedAt,
                type: 'request'
            })),
            ...recentResources.map(r => ({
                text: `Uploaded resource: '${r.title}'`,
                time: r.createdAt,
                type: 'resource'
            }))
        ];

        activities.sort((a, b) => new Date(b.time) - new Date(a.time));
        activities = activities.slice(0, 5); // Take top 5

        res.json({
            success: true,
            data: {
                stats: {
                    activeStartups,
                    pendingRequests,
                    sessionsToday: sessionsTodayCount,
                    totalSessions: totalSessionsCount,
                    impactScore: mentor.rating?.toFixed(1) || "5.0", // Real Rating
                    totalInvested // Add this
                },
                sessions: todaysSessions.map(s => ({
                    id: s._id,
                    time: new Date(s.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    name: s.founderId ? s.founderId.name : "Unknown",
                    topic: s.title,
                    status: s.status,
                    meetingLink: s.meetingLink,
                    attendanceResult: s.attendanceResult,
                    avatar: s.founderId ? s.founderId.avatar : ""
                })),
                tasks: priorityTasks.map(t => ({
                    id: t._id,
                    title: t.title,
                    priority: t.priority,
                    dueDate: t.dueDate,
                    status: t.status,
                    assignedToName: t.assignedTo ? t.assignedTo.name : 'Unknown Mentee',
                    assignedToAvatar: t.assignedTo ? t.assignedTo.avatar : null
                })),
                activity: activities,
                fundingHistory // Add this
            }
        });

    } catch (error) {
        console.error("Error fetching dashboard overview:", error);
        res.status(500).json({ message: "Server error fetching dashboard data" });
    }
};

// Update mentor profile
export const updateMentorProfile = async (req, res) => {
    try {
        const mentorId = req.user.id;
        const { jobTitle, headline, company, location, bio, expertise, linkedin, portfolio, fundingRaised, avatar, yearsExperience } = req.body;

        // Validation
        if (linkedin && !linkedin.startsWith('http')) {
            return res.status(400).json({ message: "Invalid LinkedIn URL" });
        }

        const updates = {};
        if (jobTitle !== undefined) updates.jobTitle = jobTitle;
        if (headline !== undefined) updates.headline = headline;
        if (company !== undefined) updates.company = company;
        if (location !== undefined) updates.location = location;
        if (bio !== undefined) updates.bio = bio;
        if (yearsExperience !== undefined) updates.yearsExperience = yearsExperience;
        if (expertise !== undefined) {
            updates.expertise = Array.isArray(expertise) ? expertise : expertise.split(',').map(e => e.trim());
        }
        if (linkedin !== undefined) updates.linkedin = linkedin;
        if (portfolio !== undefined) updates.portfolio = portfolio;
        if (fundingRaised !== undefined) updates.fundingRaised = fundingRaised;
        if (avatar !== undefined) updates.avatar = avatar;

        const updatedMentor = await User.findByIdAndUpdate(
            mentorId,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('name email avatar role jobTitle headline company location bio expertise yearsExperience linkedin portfolio fundingRaised testimonials rating isVerified');

        if (!updatedMentor) {
            return res.status(404).json({ message: "Mentor not found" });
        }

        // Calculate Stats to return with the updated profile
        const [totalSessions, approvedRequests] = await Promise.all([
            Session.countDocuments({ mentorId }),
            MentorshipRequest.find({ mentorId, status: 'accepted' }).select('founderId')
        ]);

        const founderIds = approvedRequests.map(req => req.founderId);
        const startups = await Startup.find({ userId: { $in: founderIds } }).select('name');
        const startupNames = startups.map(s => s.name);

        const stats = {
            totalSessions,
            startupsMentored: startupNames.length,
            startupNames,
            fundingRaised: updatedMentor.fundingRaised || "",
            rating: updatedMentor.rating || 0
        };

        res.json({
            success: true,
            message: "Profile updated successfully",
            user: {
                ...updatedMentor.toObject(),
                stats
            }
        });

    } catch (error) {
        console.error("Error updating mentor profile:", error);
        res.status(500).json({ message: "Server error updating profile" });
    }
};



// Remove mentorship connection (Disconnect) -> Now Soft Delete (Ended)
export const removeMentorshipConnection = async (req, res) => {
    try {
        const userId = req.user.id;
        const { targetId } = req.params; // targetId can be requestId OR (mentorId/founderId)

        // Strategy: Try to find a request where 'targetId' is the OTHER PARTY (Mentor or Founder)
        // This supports the frontend use case where we only have the Mentor's ID.
        let request = await MentorshipRequest.findOne({
            $or: [
                { mentorId: targetId, founderId: userId }, // Case: Founder disconnecting Mentor
                { founderId: targetId, mentorId: userId }  // Case: Mentor disconnecting Founder
            ],
            status: { $in: ['accepted', 'pending'] } // Only disconnect active/pending requests
        });

        // Fallback: If not found by user pair, try assuming targetId is the Request ID itself (Backward compatibility)
        if (!request) {
            request = await MentorshipRequest.findOne({
                _id: targetId,
                $or: [
                    { mentorId: userId },
                    { founderId: userId }
                ]
            });
        }

        if (!request) {
            return res.status(404).json({ message: "Active connection not found" });
        }

        // Update status to 'ended'
        request.status = 'ended';
        await request.save();

        res.json({
            success: true,
            message: "Mentorship connection ended successfully",
            data: request
        });

    } catch (error) {
        console.error("Error ending connection:", error);
        res.status(500).json({ message: "Server error ending connection" });
    }
};

// Rate a Mentor
export const rateMentor = async (req, res) => {
    try {
        const { mentorId } = req.params;
        const { rating, comment } = req.body; // rating 1-5
        const founderId = req.user.id;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }

        // Check if mentor exists
        const mentor = await User.findById(mentorId);
        if (!mentor) {
            return res.status(404).json({ message: "Mentor not found" });
        }

        // Update or Create Feedback
        // Upsert to ensure 1 rating per founder per mentor
        await Feedback.findOneAndUpdate(
            { mentorId, founderId },
            {
                rating,
                comment,
                recipient: mentorId, // Keeping redundant fields if schema requires
                mentor: mentorId
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Calculate new average
        const feedbacks = await Feedback.find({ mentorId });
        const totalRating = feedbacks.reduce((sum, f) => sum + f.rating, 0);
        const avgRating = (totalRating / feedbacks.length).toFixed(1);

        // Update Mentor Profile
        mentor.rating = parseFloat(avgRating);
        await mentor.save();

        res.json({
            success: true,
            message: "Rating submitted successfully",
            rating: mentor.rating
        });

    } catch (error) {
        console.error("Error rating mentor:", error);
        res.status(500).json({ message: "Server error submitting rating: " + error.message });
    }
};
