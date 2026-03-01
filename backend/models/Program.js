import mongoose from 'mongoose';

const programSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    fundingAmount: { type: String, required: true }, // e.g., "$50,000", "Equity-free"
    type: {
        type: String,
        enum: ['Incubation', 'Acceleration', 'Grant', 'Equity Funding', 'Mentorship'],
        required: true
    },
    deadline: { type: Date, required: true },
    status: {
        type: String,
        enum: ['Active', 'Closed', 'Upcoming'],
        default: 'Active'
    },
    requirements: { type: String, default: "" }, // Markdown or text
    tags: { type: [String], default: [] }
}, { timestamps: true });

export default mongoose.model('Program', programSchema);
