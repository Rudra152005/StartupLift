
import mongoose from 'mongoose';

const securityLogSchema = new mongoose.Schema({
    action: { type: String, required: true }, // e.g., 'LOGIN', 'DELETE_USER', 'UPDATE_SETTINGS'
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Who did it
    ipAddress: { type: String },
    details: { type: String }, // Extra info
    severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'LOW' },
    status: { type: String, enum: ['SUCCESS', 'FAILURE'], default: 'SUCCESS' }
}, { timestamps: true });

export default mongoose.model('SecurityLog', securityLogSchema);
