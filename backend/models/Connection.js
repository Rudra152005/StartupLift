import mongoose from 'mongoose';

const connectionSchema = new mongoose.Schema({
    requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Ensure unique connection between two users
connectionSchema.index({ requesterId: 1, recipientId: 1 }, { unique: true });

export default mongoose.model('Connection', connectionSchema);
