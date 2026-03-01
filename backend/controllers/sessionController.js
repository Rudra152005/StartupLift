import Session from '../models/Session.js';

// Create a new session (Mentor only)
export const createSession = async (req, res) => {
    try {
        const { founderId, title, date, durationMinutes, meetingLink, description } = req.body;
        const mentorId = req.user.id; // From authMiddleware

        // Basic validation
        if (!founderId || !title || !date) {
            return res.status(400).json({ message: "Please provide founder, title, and date." });
        }

        const newSession = new Session({
            mentorId,
            founderId,
            title,
            description,
            date,
            durationMinutes: durationMinutes || 60,
            meetingLink: meetingLink || 'https://meet.google.com/new', // Default or provided
            status: 'scheduled'
        });

        await newSession.save();

        res.status(201).json({
            success: true,
            message: "Session scheduled successfully!",
            data: newSession
        });

    } catch (error) {
        console.error("Error creating session:", error);
        res.status(500).json({ message: "Server error creating session" });
    }
};

// Delete a session (Mentor only)
export const deleteSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id; // Mentor ID

        const session = await Session.findById(sessionId);
        if (!session) return res.status(404).json({ message: "Session not found" });

        // Authorization: Only the creator (mentor) can delete
        if (session.mentorId.toString() !== userId) {
            return res.status(403).json({ message: "Not authorized to delete this session" });
        }

        await Session.findByIdAndDelete(sessionId);

        res.json({ success: true, message: "Session deleted successfully" });

    } catch (error) {
        console.error("Error deleting session:", error);
        res.status(500).json({ message: "Server error deleting session" });
    }
};

// Join a session (Track attendance)
export const joinSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;
        const role = req.user.role;

        const session = await Session.findById(sessionId);
        if (!session) return res.status(404).json({ message: "Session not found" });

        if (role === 'Mentor' && session.mentorId.toString() === userId) {
            session.mentorJoined = true;
        } else if (session.founderId.toString() === userId) {
            session.userJoined = true; // Assuming role is User/Founder
        } else {
            return res.status(403).json({ message: "You are not a participant of this session" });
        }

        await session.save();
        res.json({ success: true, message: "Joined session", data: session });

    } catch (error) {
        console.error("Error joining session:", error);
        res.status(500).json({ message: "Server error joining session" });
    }
};

// Get sessions for logged-in user (Mentor or Founder)
export const getMySessions = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;

        // Query based on role
        const query = role === 'Mentor' ? { mentorId: userId } : { founderId: userId };

        // Auto-expire logic with Attendance Check
        const now = new Date();

        const sessionsToCheck = await Session.find({
            ...query,
            status: { $in: ['scheduled'] }, // Check scheduled ones
            date: { $lt: now } // Started in the past
        });

        for (const session of sessionsToCheck) {
            const endTime = new Date(new Date(session.date).getTime() + session.durationMinutes * 60000);

            if (endTime < now) {
                // Time is up. Check attendance.
                if (session.userJoined && session.mentorJoined) {
                    session.status = 'completed';
                    session.attendanceResult = 'completed';
                } else if (!session.userJoined && session.mentorJoined) {
                    session.status = 'expired';
                    session.attendanceResult = 'user_missed';
                } else if (session.userJoined && !session.mentorJoined) {
                    session.status = 'expired';
                    session.attendanceResult = 'mentor_missed';
                } else {
                    session.status = 'expired';
                    session.attendanceResult = 'both_missed';
                }
                await session.save();
            }
        }

        const sessions = await Session.find(query)
            .populate('mentorId', 'name avatar')
            .populate('founderId', 'name avatar')
            .sort({ date: 1 });

        res.json({
            success: true,
            count: sessions.length,
            data: sessions
        });

    } catch (error) {
        console.error("Error fetching sessions:", error);
        res.status(500).json({ message: "Server error fetching sessions" });
    }
};

// Update session status (e.g., Cancel, Complete)
export const updateSessionStatus = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { status } = req.body;

        const session = await Session.findById(sessionId);
        if (!session) return res.status(404).json({ message: "Session not found" });

        // Authorization check (optional: strict check if user belongs to session)

        session.status = status;
        await session.save();

        res.json({ success: true, message: "Session updated", data: session });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
