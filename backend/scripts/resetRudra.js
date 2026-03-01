
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const resetRudra = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const email = 'www.rudra152005@gmail.com';
        const user = await User.findOne({ email });

        if (user) {
            console.log(`Found user: ${user.name} (${user.email})`);
            user.password = '123456'; // Set plain text, model pre-save hook will hash it
            await user.save();
            console.log(`✅ SUCCESS: Password for ${email} has been RESET to '123456'.`);
        } else {
            console.log(`❌ FAILED: User ${email} not found.`);
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

resetRudra();
