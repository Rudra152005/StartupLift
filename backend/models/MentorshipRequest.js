import mongoose from 'mongoose';

const mentorshipRequestSchema = new mongoose.Schema({
    mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    founderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Startup' }, // Optional link to specific startup

    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'completed', 'under_review', 'ended'],
        default: 'pending'
    },
    message: { type: String }, // Initial message from founder
    video: { type: String },   // Video link/url
    goals: { type: String },   // What they want help with

    // New Fields for Enhanced Request
    documents: [{ type: String }], // Array of document URLs (Pitch decks, etc)

    // Identity Verification (Multiple Team Members)
    teamVerification: [{
        name: { type: String },
        idNumber: { type: String },
        proofUrl: { type: String }, // Image/Doc URL
        isVerified: { type: Boolean, default: false } // Verified by OCR?
    }],

    requestType: {
        type: String,
        enum: ['Mentorship', 'Funding'],
        default: 'Mentorship'
    },

    date: { type: Date, default: Date.now },
    updates: [{
        text: { type: String },
        date: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

// Add indexes for performance
mentorshipRequestSchema.index({ mentorId: 1, status: 1 });
mentorshipRequestSchema.index({ founderId: 1, status: 1 });

export default mongoose.model('MentorshipRequest', mentorshipRequestSchema);
