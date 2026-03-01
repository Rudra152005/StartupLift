
import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
    siteName: { type: String, default: 'AdminPanel' },
    supportEmail: { type: String, default: 'support@example.com' },
    allowRegistration: { type: Boolean, default: true },
    maintenanceMode: { type: Boolean, default: false },
    version: { type: String, default: '1.0.0' }
}, { timestamps: true });

// Ensure only one document exists
settingsSchema.static('getSettings', async function () {
    const settings = await this.findOne();
    if (settings) return settings;
    return await this.create({});
});

export default mongoose.model('Settings', settingsSchema);
