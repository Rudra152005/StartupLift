
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const resetMultiple = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('123456', salt);

        // Find users with 'khusi' or 'Khushi' in name or email
        const users = await User.find({
            $or: [
                { email: { $regex: 'khusi', $options: 'i' } },
                { name: { $regex: 'khushi', $options: 'i' } }
            ]
        });

        console.log(`Found ${users.length} potential matches.`);

        for (const user of users) {
            console.log(`Resetting password for: ${user.name} (${user.email}) [Current ID: ${user._id}]`);
            user.password = hash;
            await user.save(); // Using save to trigger any pre-save hooks just in case, though hash is already done. 
            // Actually, if we use save(), and the pre-save hook re-hashes, we double hash if we passed a hash!
            // Wait, the pre-save hook usually checks strict equality or uses isModified.
            // Best to use findByIdAndUpdate to avoid pre-save hook double-hashing logic if we already hashed it.

            await User.findByIdAndUpdate(user._id, { password: hash });
            console.log(`✅ Reset complete for ${user.email}`);
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

resetMultiple();
