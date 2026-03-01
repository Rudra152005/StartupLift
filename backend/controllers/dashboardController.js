import User from '../models/User.js';
import Startup from '../models/Startup.js';
import MentorshipRequest from '../models/MentorshipRequest.js';
import Session from '../models/Session.js';
import Task from '../models/Task.js';
import mongoose from 'mongoose';

// Update Bank Details
export const updateBankDetails = async (req, res) => {
    try {
        const userId = req.user.id;
        const { accountName, accountNumber, ifsc, bankName } = req.body;

        const startup = await Startup.findOne({ userId });
        if (!startup) {
            return res.status(404).json({ message: "Startup profile not found" });
        }

        startup.bankDetails = {
            accountName,
            accountNumber,
            ifsc,
            bankName
        };

        await startup.save();

        res.json({
            success: true,
            message: "Bank details updated successfully",
            data: startup.bankDetails
        });
    } catch (error) {
        console.error("Error updating bank details:", error);
        res.status(500).json({ message: "Server error updating bank details" });
    }
};

// Get Dashboard Overview Data (Existing)
export const getDashboardOverview = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log("Fetching dashboard data for user:", userId);
        const userObjectId = new mongoose.Types.ObjectId(userId);

        console.log("Starting Promise.all for dashboard data...");
        const [user, startup, activeMentorsList, pendingMentorsList, upcomingSessions, upcomingSessionsCount, priorityTasks] = await Promise.all([
            User.findById(userId).select('-password').lean(),
            Startup.findOne({ userId }).populate('fundingHistory.mentorId', 'name avatar').lean(),
            MentorshipRequest.find({ founderId: userObjectId, status: 'accepted' }).populate('mentorId', 'name avatar expertise role category').lean(),
            MentorshipRequest.find({ founderId: userObjectId, status: 'pending' }).populate('mentorId', 'name avatar expertise role').lean(),
            Session.find({
                founderId: userObjectId,
                status: { $in: ['scheduled', 'completed', 'expired'] },
                date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
            }).sort({ date: 1 }).limit(3).populate('mentorId', 'name avatar').lean(),
            Session.countDocuments({
                founderId: userObjectId,
                status: 'scheduled',
                date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
            }),
            Task.find({ assignedTo: userObjectId })
                .sort({ status: 1, dueDate: 1 }) // Pending first, then by date
                .limit(10)
                .lean()
        ]);

        console.log("All dashboard queries completed");

        if (!user) return res.status(404).json({ message: "User not found" });

        const activeMentorsCount = activeMentorsList.length;
        const pendingMentorsCount = pendingMentorsList.length;

        // Calculate Stats
        const readinessScore = startup?.readinessScore || 0;
        let totalFunding = 0;
        if (startup?.fundingHistory?.length > 0) {
            totalFunding = startup.fundingHistory.reduce((acc, curr) => {
                const cleanAmount = curr.amount ? parseFloat(curr.amount.toString().replace(/[^0-9.]/g, '')) : 0;
                return acc + cleanAmount;
            }, 0);
        }
        const fundingRaised = totalFunding > 0 ? `₹${totalFunding.toLocaleString()}` : (user.fundingRaised || "₹0");

        const dashboardData = {
            user: {
                name: user.name,
                email: user.email,
                avatar: user.avatar
            },
            startup: startup ? {
                ...startup, // Return all fields including fundingHistory
                name: startup.name,
                stage: startup.category || "Idea Phase",
                progress: readinessScore,
                bankDetails: startup.bankDetails
            } : null,
            activeMentors: activeMentorsList.map(m => ({ ...m, mentor: m.mentorId })), // Flatten for frontend convenience
            pendingRequests: pendingMentorsList.map(r => ({ ...r, mentor: r.mentorId })),
            stats: [
                {
                    title: "Readiness Score",
                    value: `${readinessScore}/100`,
                    change: "+5%",
                    icon: "TrendingUp",
                    color: "text-green-500",
                    bg: "bg-green-500/10"
                },
                {
                    title: "Funding Raised",
                    value: fundingRaised,
                    change: "Total",
                    icon: "DollarSign", // Changed from Active Mentors to Funding for visibility based on request? 
                    // Wait, user asked for payment to be reflected. I should probably ADD a stat or REPLACE one.
                    // The existing stats were: Readiness, Active Mentors, Team Members, Upcoming Sessions.
                    // I will replace Team Members or add a new one? Let's REPLACE Team Members for now as Funding is more critical for this task.
                    color: "text-yellow-500",
                    bg: "bg-yellow-500/10"
                },
                {
                    title: "Active Mentors",
                    value: activeMentorsCount.toString(),
                    change: `${pendingMentorsCount} Pending`,
                    icon: "Users",
                    color: "text-blue-500",
                    bg: "bg-blue-500/10"
                },
                {
                    title: "Upcoming Sessions",
                    value: upcomingSessionsCount.toString(),
                    change: upcomingSessions.length > 0 ? "This Week" : "None",
                    icon: "Calendar",
                    color: "text-orange-500",
                    bg: "bg-orange-500/10"
                },
            ],
            upcomingSchedule: upcomingSessions.map(s => ({
                id: s._id,
                title: s.title,
                mentorName: s.mentorId?.name || "Unknown Mentor",
                date: s.date,
                meetingLink: s.meetingLink,
                status: s.status,
                attendanceResult: s.attendanceResult
            })),
            priorityTasks: priorityTasks.map(t => ({
                id: t._id,
                label: t.title,
                status: t.status,
                done: t.status === 'completed',
                feedback: t.feedback || null,
                reviewedAt: t.reviewedAt || null,
                dueDate: t.dueDate
            })),
            notifications: [
                ...upcomingSessions.map(s => ({
                    id: `sess-${s._id}`,
                    type: 'session',
                    message: `Upcoming session with ${s.mentorId?.name || "Mentor"}`,
                    time: new Date(s.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    unread: true
                })),
                ...priorityTasks.map(t => ({
                    id: `task-${t._id}`,
                    type: 'task',
                    message: `Task Pending: ${t.title}`,
                    time: new Date(t.dueDate).toLocaleDateString(),
                    unread: true
                })),
                // Add a welcome notification if empty
                ...(upcomingSessions.length === 0 && priorityTasks.length === 0 ? [{
                    id: 'welcome',
                    type: 'system',
                    message: "Welcome to your new dashboard!",
                    time: "Just now",
                    unread: true
                }] : [])
            ]
        };

        res.json({ success: true, data: dashboardData });

    } catch (error) {
        console.error("Dashboard Error:", error);
        res.status(500).json({ message: "Server error fetching dashboard data" });
    }
};
