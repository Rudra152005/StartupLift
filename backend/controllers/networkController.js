import User from '../models/User.js';
import Startup from '../models/Startup.js';
import Connection from '../models/Connection.js';

// Get Founder Network (Real Founders)
export const getFounderNetwork = async (req, res) => {
    try {
        const currentUserId = req.user.id;

        // Fetch all connections for current user to map status
        const connections = await Connection.find({
            $or: [{ requesterId: currentUserId }, { recipientId: currentUserId }]
        });

        const connectionMap = {};
        connections.forEach(conn => {
            if (conn.requesterId.toString() === currentUserId) {
                connectionMap[conn.recipientId.toString()] = conn.status; // 'pending' or 'accepted'
            } else {
                connectionMap[conn.requesterId.toString()] = conn.status === 'pending' ? 'received' : conn.status;
            }
        });

        // Find all users with role 'User' (founders) who have startups
        const founders = await User.find({
            role: 'User',
            _id: { $ne: currentUserId } // Exclude current user
        })
            .select('name email avatar createdAt')
            .limit(20)
            .lean();

        // Get startup info for each founder
        const foundersWithStartups = await Promise.all(
            founders.map(async (founder) => {
                const startup = await Startup.findOne({ userId: founder._id })
                    .select('name stage category desc fundingRaised')
                    .lean();

                if (!startup) return null; // Skip founders without startups

                return {
                    _id: founder._id,
                    name: founder.name,
                    email: founder.email,
                    avatar: founder.avatar,
                    joinedAt: founder.createdAt,
                    connectionStatus: connectionMap[founder._id.toString()] || 'none', // 'none', 'pending', 'accepted', 'received'
                    startup: {
                        name: startup.name,
                        stage: startup.stage || startup.category || 'Early Stage',
                        category: startup.category,
                        description: startup.desc,
                        fundingRaised: startup.fundingRaised || '₹0'
                    }
                };
            })
        );

        // Filter out null values (founders without startups)
        const validFounders = foundersWithStartups.filter(f => f !== null);

        res.json({
            success: true,
            data: validFounders,
            count: validFounders.length
        });

    } catch (error) {
        console.error('Error fetching founder network:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching founder network'
        });
    }
};

// Send Connection Request
export const connect = async (req, res) => {
    try {
        const requesterId = req.user.id;
        const { recipientId } = req.body;

        if (!recipientId) {
            return res.status(400).json({ success: false, message: 'Recipient ID is required' });
        }

        if (requesterId === recipientId) {
            return res.status(400).json({ success: false, message: 'Cannot connect with yourself' });
        }

        // Check if connection already exists
        const existingConnection = await Connection.findOne({
            $or: [
                { requesterId, recipientId },
                { requesterId: recipientId, recipientId: requesterId }
            ]
        });

        if (existingConnection) {
            if (existingConnection.status === 'accepted') {
                return res.status(400).json({ success: false, message: 'Already connected' });
            }
            if (existingConnection.status === 'pending') {
                return res.status(400).json({ success: false, message: 'Connection request already pending' });
            }
        }

        // Create new connection request
        const newConnection = new Connection({
            requesterId,
            recipientId,
            status: 'pending'
        });

        await newConnection.save();

        res.json({ success: true, message: 'Connection request sent', status: 'pending' });

    } catch (error) {
        console.error('Error sending connection request:', error);
        res.status(500).json({ success: false, message: 'Server error sending request' });
    }
};

// Accept Connection Request
export const acceptRequest = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const { requesterId } = req.body;

        if (!requesterId) {
            return res.status(400).json({ success: false, message: 'Requester ID is required' });
        }

        const connection = await Connection.findOne({
            requesterId: requesterId,
            recipientId: currentUserId,
            status: 'pending'
        });

        if (!connection) {
            return res.status(404).json({ success: false, message: 'No pending request found' });
        }

        connection.status = 'accepted';
        connection.updatedAt = Date.now();
        await connection.save();

        res.json({ success: true, message: 'Connection accepted' });

    } catch (error) {
        console.error('Error accepting connection:', error);
        res.status(500).json({ success: false, message: 'Server error accepting connection' });
    }
};
