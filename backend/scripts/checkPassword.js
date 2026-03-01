
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const checkPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        // Find the user - assuming it's the one logged in or the main one
        // Since I don't have the ID handy, I'll search by email if I knew it, 
        // OR I'll just list users who have passwords.
        // Let's list all users with authMethod 'google' AND a password.

        const users = await User.find({ authMethod: 'google' }).select('+password +email +name');

        console.log(`Found ${users.length} Google users.`);

        for (const user of users) {
            if (user.password) {
                console.log(`User: ${user.email} (${user.name}) has a password.`);
                const isMatch = await bcrypt.compare('123456', user.password);
                console.log(`  Matching '123456': ${isMatch}`);

                // Also check plain text just in case of double-hashing failure
                if (user.password === '123456') {
                    console.log(`  CRITICAL: Password is stored as PLAIN TEXT '123456'. Hashing failed.`);
                }
            } else {
                console.log(`User: ${user.email} has NO password.`);
            }
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

checkPassword();
