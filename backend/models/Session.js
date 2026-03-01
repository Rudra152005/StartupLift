import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
    mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    founderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    title: { type: String, required: true }, // e.g., "Weekly Sync"
    description: { type: String },

    date: { type: Date, required: true },
    durationMinutes: { type: Number, default: 60 },

    // Attendance Tracking
    userJoined: { type: Boolean, default: false },
    mentorJoined: { type: Boolean, default: false },
    attendanceResult: {
        type: String,
        enum: ['pending', 'completed', 'user_missed', 'mentor_missed', 'both_missed'],
        default: 'pending'
    },

    status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled', 'expired'],
        default: 'scheduled'
    },

    meetingLink: { type: String },
    notes: { type: String } // Post-session notes
}, { timestamps: true });

// Add indexes for performance
sessionSchema.index({ mentorId: 1, date: -1 });
sessionSchema.index({ founderId: 1, date: -1 });
sessionSchema.index({ status: 1 });

export default mongoose.model('Session', sessionSchema);
