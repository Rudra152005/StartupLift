import mongoose from 'mongoose';

const programApplicationSchema = new mongoose.Schema({
    programId: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: ['applied', 'in_review', 'interview', 'accepted', 'rejected'],
        default: 'applied'
    },
    resumeUrl: { type: String },
    answers: { type: Object } // Flexible structure for application questions
}, { timestamps: true });

// Ensure unique application per user per program
programApplicationSchema.index({ programId: 1, userId: 1 }, { unique: true });

export default mongoose.model('ProgramApplication', programApplicationSchema);
