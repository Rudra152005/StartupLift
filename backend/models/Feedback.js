import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    mentor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    // New fields for Mentor Rating
    mentorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    founderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    comment: { type: String },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    milestoneStatus: {
        type: String,
        enum: ['On Track', 'At Risk', 'Delayed'],
        default: 'On Track'
    },
    observations: {
        type: String,
        trim: true
    },
    actionItems: {
        type: String,
        trim: true
    }
}, { timestamps: true });

export default mongoose.model('Feedback', feedbackSchema);
