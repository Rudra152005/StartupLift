import mongoose from 'mongoose';

const authorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, default: 'Founder' },
    avatar: { type: String, default: '' }
});

const teamMemberSchema = new mongoose.Schema({
    name: { type: String },
    role: { type: String },
    avatar: { type: String }
});

const milestoneSchema = new mongoose.Schema({
    id: { type: Number },
    title: { type: String },
    status: { type: String, enum: ['completed', 'current', 'upcoming'], default: 'upcoming' },
    date: { type: String }
});

const taskSchema = new mongoose.Schema({
    id: { type: Number },
    title: { type: String },
    tag: { type: String }, // Urgent, High, etc.
    status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
    due: { type: String }
});

const startupSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true }, // Link to user
    name: { type: String, required: true },
    desc: { type: String, required: true },
    website: { type: String },
    image: { type: String, required: true }, // Placeholder or Uploaded URL
    category: { type: String, required: true }, // Stage/Category

    // Extended Details
    problem: { type: String, default: "" },
    solution: { type: String, default: "" },
    marketSize: { type: String, default: "" },
    targetAudience: { type: String, default: "" },

    // Pitch Assets
    pitchDeck: { type: String, default: "" }, // URL to PDF
    videoPitch: { type: String, default: "" }, // URL to Video
    detailedDescription: { type: String, default: "" }, // Long description for verified profile

    // Banking Details
    bankDetails: {
        accountName: { type: String, default: "" },
        accountNumber: { type: String, default: "" },
        ifsc: { type: String, default: "" },
        bankName: { type: String, default: "" }
    },

    // Arrays
    teamMembers: { type: [teamMemberSchema], default: [] },
    milestones: { type: [milestoneSchema], default: [] },
    tasks: { type: [taskSchema], default: [] },
    fundingHistory: {
        type: [{
            mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            amount: { type: String },
            date: { type: Date, default: Date.now },
            transactionId: { type: String }
        }],
        default: []
    },

    // Stats
    views: { type: Number, default: 0 },
    readinessScore: { type: Number, default: 0 },

    date: { type: String, default: () => new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) },
    author: { type: authorSchema, required: true },
}, { timestamps: true });



export default mongoose.model('Startup', startupSchema);
