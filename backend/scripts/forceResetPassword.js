
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const forceReset = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        // Target: Khushi (Google) - ID: 694e08b275f5b42a1ebe52b7
        const userId = '694e08b275f5b42a1ebe52b7';
        const newPass = '123456';

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPass, salt);

        const res = await User.findByIdAndUpdate(userId, { password: hash });

        if (res) {
            console.log(`✅ SUCCESS: Password for user ${res.email} (${res.name}) has been FORCED to '123456'.`);
        } else {
            console.log(`❌ FAILED: User not found.`);
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

forceReset();
