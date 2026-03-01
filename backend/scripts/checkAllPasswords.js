
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const checkAllPasswords = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const users = await User.find({}).select('+password +email +name +authMethod');
        console.log(`Checking '123456' against ${users.length} users...`);
        console.log('--------------------------------------------------');

        for (const user of users) {
            if (user.password) {
                const isMatch = await bcrypt.compare('123456', user.password);
                if (isMatch) {
                    console.log(`✅ MATCH: ${user.email} (${user.authMethod}) ID: ${user._id}`);
                } else {
                    // console.log(`❌ FAIL:  ${user.email}`); 
                }
            }
        }
        console.log('--------------------------------------------------');
        console.log('Done.');

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

checkAllPasswords();
