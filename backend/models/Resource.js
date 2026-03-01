import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    type: {
        type: String,
        enum: ['PDF', 'Video', 'Link', 'Article', 'Tool', 'Template'],
        default: 'Link'
    },
    isPublic: { type: Boolean, default: true },
    url: { type: String, required: true }, // URL to file or external link

    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Mentor

    // Optional: Assign to specific founder(s), or null/empty for "Public/All Mentees"
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

export default mongoose.model('Resource', resourceSchema);
