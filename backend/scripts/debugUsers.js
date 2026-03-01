
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const listUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const users = await User.find({}).select('+password');

        console.log(`Total Users: ${users.length}`);
        console.log('----------------------------------------------------------------');
        console.log('| ID | Name | Email | Auth | HasPass | PassHashPreview |');
        console.log('----------------------------------------------------------------');

        users.forEach(u => {
            const passStatus = u.password ? 'YES' : 'NO';
            const hashPreview = u.password ? u.password.substring(0, 10) + '...' : 'N/A';
            console.log(`| ${u._id} | ${u.name} | ${u.email} | ${u.authMethod} | ${passStatus} | ${hashPreview} |`);
        });
        console.log('----------------------------------------------------------------');

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

listUsers();
