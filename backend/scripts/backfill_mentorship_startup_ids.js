
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MentorshipRequest from '../models/MentorshipRequest.js';
import Startup from '../models/Startup.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const backfill = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB...");

        const requests = await MentorshipRequest.find({ startupId: { $exists: false } });
        console.log(`Found ${requests.length} requests without startupId.`);

        for (const req of requests) {
            const startup = await Startup.findOne({ userId: req.founderId });
            if (startup) {
                req.startupId = startup._id;
                await req.save();
                console.log(`Updated request ${req._id} with startup ${startup.name}`);
            } else {
                console.log(`No startup found for founder ${req.founderId} in request ${req._id}`);
            }
        }

        const nullRequests = await MentorshipRequest.find({ startupId: null });
        console.log(`Found ${nullRequests.length} requests with null startupId.`);
        for (const req of nullRequests) {
            const startup = await Startup.findOne({ userId: req.founderId });
            if (startup) {
                req.startupId = startup._id;
                await req.save();
                console.log(`Updated null request ${req._id} with startup ${startup.name}`);
            }
        }

        console.log("Backfill complete.");
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

backfill();
