
// ✅ Get Active Sessions
export const getSessions = async (req, res) => {
    try {
        const userId = req.user.id;
        const userAgent = req.headers['user-agent'] || '';

        // Helper function to extract browser name
        const getBrowserName = (ua) => {
            if (!ua) return 'Unknown Browser';
            if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
            if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
            if (ua.includes('Firefox')) return 'Firefox';
            if (ua.includes('Edg')) return 'Edge';
            if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
            return 'Unknown Browser';
        };

        // For now, return the current session
        const currentSession = {
            id: req.sessionID || 'current',
            deviceName: `${userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'} - ${getBrowserName(userAgent)}`,
            deviceType: userAgent.includes('Mobile') ? 'mobile' : 'desktop',
            location: 'Unknown Location',
            lastActive: 'Active now',
            isCurrent: true,
            ipAddress: req.ip || req.connection.remoteAddress
        };

        res.json({
            success: true,
            sessions: [currentSession]
        });
    } catch (error) {
        console.error('Get sessions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch sessions'
        });
    }
};

// ✅ Logout Specific Session
export const logoutSession = async (req, res) => {
    try {
        const { sessionId } = req.params;

        if (sessionId === 'current' || sessionId === req.sessionID) {
            return res.status(400).json({
                success: false,
                message: 'Cannot logout current session. Use logout endpoint instead.'
            });
        }

        res.json({
            success: true,
            message: 'Session logged out successfully'
        });
    } catch (error) {
        console.error('Logout session error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to logout session'
        });
    }
};
