import mongoose from 'mongoose';

const fundingSchema = new mongoose.Schema({
    mentorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    founderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    razorpayOrderId: {
        type: String,
        required: true
    },
    razorpayPaymentId: {
        type: String
    },
    status: {
        type: String,
        enum: ['created', 'paid', 'failed'],
        default: 'created'
    }
}, { timestamps: true });

export default mongoose.model('Funding', fundingSchema);
