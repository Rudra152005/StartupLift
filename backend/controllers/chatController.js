import Message from '../models/Message.js';
import User from '../models/User.js';
import MentorshipRequest from '../models/MentorshipRequest.js';
import Connection from '../models/Connection.js';

// Send a message
export const sendMessage = async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        const senderId = req.user.id;

        if (!receiverId || !content) {
            return res.status(400).json({
                success: false,
                message: "Receiver ID and content are required"
            });
        }

        // Check for blocks
        const sender = await User.findById(senderId).select('blockedUsers');
        const receiver = await User.findById(receiverId).select('blockedUsers');

        // 1. Have I blocked them?
        if (sender.blockedUsers.includes(receiverId)) {
            return res.status(403).json({ success: false, message: "You have blocked this user. Unblock to send message." });
        }

        // 2. Have they blocked me?
        if (receiver.blockedUsers.includes(senderId)) {
            return res.status(403).json({ success: false, message: "You have been blocked by this user." });
        }

        // Unhide conversation for both parties if hidden
        await User.findByIdAndUpdate(senderId, { $pull: { hiddenConversations: receiverId } });
        await User.findByIdAndUpdate(receiverId, { $pull: { hiddenConversations: senderId } });

        const newMessage = new Message({
            sender: senderId,
            receiver: receiverId,
            content,
            read: false
        });

        await newMessage.save();

        res.status(201).json({
            success: true,
            message: "Message sent successfully",
            data: newMessage
        });
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({
            success: false,
            message: "Server error sending message",
            error: error.message
        });
    }
};

// Get conversation between two users
export const getConversation = async (req, res) => {
    try {
        const { userId } = req.params; // The other user's ID
        const myId = req.user.id;

        // Prevent CastError if userId is "undefined" or invalid
        if (!userId || userId === 'undefined' || userId === 'null') {
            return res.status(400).json({ success: false, message: "Invalid User ID provided" });
        }

        const messages = await Message.find({
            $or: [
                { sender: myId, receiver: userId },
                { sender: userId, receiver: myId }
            ],
            deletedBy: { $ne: myId } // Filter out messages deleted by me
        })
            .sort({ createdAt: 1 }) // Oldest first
            .populate('sender', 'name avatar')
            .populate('receiver', 'name avatar');

        // Mark messages as read
        await Message.updateMany(
            { sender: userId, receiver: myId, read: false },
            { read: true }
        );

        res.json({
            success: true,
            count: messages.length,
            data: messages
        });
    } catch (error) {
        console.error("Error fetching conversation:", error);
        res.status(500).json({
            success: false,
            message: "Server error fetching conversation",
            error: error.message
        });
    }
};

import Startup from '../models/Startup.js';

// Get contacts for chat (Global search or My Contacts)
export const getContacts = async (req, res) => {
    try {
        const userId = req.user.id.toString();
        const userRole = req.user.role;
        const searchQuery = req.query.search || '';
        console.log('Fetching contacts for user:', userId); // Debug Log

        // 1. Identify Connected Users (Strict Mentorship Only)
        // A. Formal Connections (Accepted and Completed only - exclude Ended)
        const [mentorships, connections] = await Promise.all([
            MentorshipRequest.find({
                $or: [
                    { mentorId: userId },
                    { founderId: userId }
                ],
                status: { $in: ['accepted', 'completed'] } // Only show active mentorships
            }).select('mentorId founderId status'),
            Connection.find({
                $or: [{ requesterId: userId }, { recipientId: userId }],
                status: 'accepted'
            }).select('requesterId recipientId status')
        ]);

        const connectedUserIds = new Set();
        const mentorshipStatusMap = {};
        const mentorshipIdMap = {};

        mentorships.forEach(req => {
            const partnerId = req.mentorId.toString() === userId
                ? req.founderId.toString()
                : req.mentorId.toString();

            connectedUserIds.add(partnerId);
            mentorshipStatusMap[partnerId] = req.status;
            mentorshipIdMap[partnerId] = req._id;
        });

        connections.forEach(conn => {
            const partnerId = conn.requesterId.toString() === userId
                ? conn.recipientId.toString()
                : conn.requesterId.toString();

            connectedUserIds.add(partnerId);
            // Treat connections as 'accepted' mentorships for now in frontend logic or just use 'accepted'
            mentorshipStatusMap[partnerId] = 'accepted';
            mentorshipIdMap[partnerId] = conn._id;
        });


        // Query Construction
        let query = {};
        if (searchQuery) {
            // SEARCH WITHIN ACTIVE CONNECTIONS ONLY (not global)
            if (connectedUserIds.size === 0) {
                return res.json({ success: true, contacts: [], totalCount: 0 });
            }

            query = {
                _id: { $in: [...connectedUserIds] },
                $or: [
                    { name: { $regex: searchQuery, $options: 'i' } },
                    { email: { $regex: searchQuery, $options: 'i' } },
                    { company: { $regex: searchQuery, '$options': 'i' } }
                ]
            };
        } else {
            // STRICT VIEW: Only formal connections
            if (connectedUserIds.size === 0) {
                return res.json({ success: true, contacts: [], totalCount: 0 });
            }
            query = { _id: { $in: [...connectedUserIds] } };
        }

        // 3. Fetch Users
        const contacts = await User.find(query)
            .select('name email avatar role jobTitle company status lastSeen hiddenConversations blockedUsers');



        // 4. Attach Metadata (Last Message, Unread Count, Relationship) & Startup Info
        // Fetch Startups for these contacts (if they are Founders/Users)
        const contactIds = contacts.map(c => c._id.toString());
        const startups = await Startup.find({ userId: { $in: contactIds } }).select('userId name');
        const startupMap = {};
        startups.forEach(s => { startupMap[s.userId] = s.name; });

        const contactsWithDetails = await Promise.all(
            contacts.map(async (contact) => {
                const contactId = contact._id.toString();

                // Check if hidden by me (SKIP if hidden) - UNLESS searching
                if (!searchQuery && req.user.hiddenConversations?.includes(contactId)) {
                    return null;
                }

                // Determine relationship type
                let relationshipType = 'other';
                if (connectedUserIds.has(contactId)) {
                    relationshipType = userRole === 'Mentor' ? 'mentee' : 'mentor';
                }

                // Fetch last message (if any)
                const lastMessage = await Message.findOne({
                    $or: [
                        { sender: userId, receiver: contactId },
                        { sender: contactId, receiver: userId }
                    ],
                    deletedBy: { $ne: userId } // Filter deleted
                })
                    .sort({ createdAt: -1 })
                    .select('content createdAt sender read');

                // Get unread count
                const unreadCount = await Message.countDocuments({
                    sender: contactId,
                    receiver: userId,
                    read: false,
                    deletedBy: { $ne: userId } // Filter deleted
                });

                return {
                    _id: contactId,
                    name: contact.name,
                    email: contact.email,
                    avatar: contact.avatar,
                    role: contact.role,
                    jobTitle: contact.jobTitle,
                    company: contact.company || startupMap[contactId] || "", // Use Startup Name if User company is empty
                    status: contact.status,
                    relationshipType,
                    mentorshipStatus: mentorshipStatusMap[contactId] || 'none',
                    requestId: mentorshipIdMap[contactId] || null,
                    lastMessage: lastMessage ? {
                        content: lastMessage.content,
                        timestamp: lastMessage.createdAt,
                        fromMe: lastMessage.sender.toString() === userId,
                        read: lastMessage.read
                    } : null,
                    unreadCount,
                    isBlocked: req.user.blockedUsers?.includes(contactId) || false,
                    hasBlockedMe: contact.blockedUsers?.includes(userId) || false
                };
            })
        );

        // Filter out nulls (hidden conversations)
        const validContacts = contactsWithDetails.filter(c => c !== null);

        // 5. Sort
        validContacts.sort((a, b) => {
            const timeA = a.lastMessage?.timestamp ? new Date(a.lastMessage.timestamp).getTime() : 0;
            const timeB = b.lastMessage?.timestamp ? new Date(b.lastMessage.timestamp).getTime() : 0;

            if (timeB !== timeA) return timeB - timeA; // Recent messages first
            return a.name.localeCompare(b.name);
        });

        res.json({
            success: true,
            contacts: validContacts,
            totalCount: validContacts.length
        });

    } catch (error) {
        console.error('Error getting contacts:', error);
        res.status(500).json({
            success: false,
            message: 'Server error getting contacts',
            error: error.message
        });
    }
};

// Restart Mentorship (Unblock Chat)
export const restartMentorship = async (req, res) => {
    try {
        const userId = req.user.id;
        const { requestId } = req.body;

        const request = await MentorshipRequest.findOne({
            _id: requestId,
            $or: [{ mentorId: userId }, { founderId: userId }]
        });

        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        request.status = 'completed';
        await request.save();

        res.json({ success: true, message: "Mentorship restarted" });
    } catch (error) {
        console.error("Error restarting mentorship:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Delete Conversation (Hide from list)
export const deleteConversation = async (req, res) => {
    try {
        const userId = req.user.id;
        const { targetUserId } = req.body;

        if (!targetUserId) {
            return res.status(400).json({ success: false, message: "Target User ID required" });
        }

        await User.findByIdAndUpdate(userId, {
            $addToSet: { hiddenConversations: targetUserId }
        });

        res.json({ success: true, message: "Conversation deleted" });

    } catch (error) {
        console.error("Error deleting conversation:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Block User
export const blockUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const { targetUserId } = req.body;

        if (!targetUserId) {
            return res.status(400).json({ success: false, message: "Target User ID required" });
        }

        await User.findByIdAndUpdate(userId, {
            $addToSet: { blockedUsers: targetUserId }
        });

        res.json({ success: true, message: "User blocked" });

    } catch (error) {
        console.error("Error blocking user:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Unblock User
export const unblockUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const { targetUserId } = req.body;

        if (!targetUserId) {
            return res.status(400).json({ success: false, message: "Target User ID required" });
        }

        await User.findByIdAndUpdate(userId, {
            $pull: { blockedUsers: targetUserId }
        });

        res.json({ success: true, message: "User unblocked" });

    } catch (error) {
        console.error("Error unblocking user:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Clear Chat History (Permanent Delete for User)
export const clearChat = async (req, res) => {
    try {
        const userId = req.user.id;
        const { targetUserId } = req.body;

        if (!targetUserId) {
            return res.status(400).json({ success: false, message: "Target User ID required" });
        }

        // Find all messages between these two users
        await Message.updateMany(
            {
                $or: [
                    { sender: userId, receiver: targetUserId },
                    { sender: targetUserId, receiver: userId }
                ]
            },
            {
                $addToSet: { deletedBy: userId }
            }
        );

        res.json({ success: true, message: "Chat history cleared" });

    } catch (error) {
        console.error("Error clearing chat:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
