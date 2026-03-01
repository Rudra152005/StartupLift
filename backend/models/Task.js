import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed'],
        default: 'pending'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium'
    },
    dueDate: {
        type: Date
    },
    submissionUrl: {
        type: String
    },
    submissionType: {
        type: String,
        enum: ['file', 'link'],
        default: 'link'
    },
    submittedAt: {
        type: Date
    },
    feedback: {
        type: String,
        trim: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    reviewedAt: {
        type: Date
    }
}, { timestamps: true });

// Add indexes for performance
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ assignedBy: 1 });

export default mongoose.model('Task', taskSchema);
