// Quick test to check what's in the database
// Run this in the backend directory: node checkPrograms.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Program from './models/Program.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB');

        const allPrograms = await Program.find();
        console.log('\n=== ALL PROGRAMS IN DATABASE ===');
        console.log(`Total: ${allPrograms.length}\n`);

        allPrograms.forEach((p, i) => {
            console.log(`${i + 1}. ${p.title}`);
            console.log(`   - ID: ${p._id}`);
            console.log(`   - Type: ${p.type}`);
            console.log(`   - Deadline: ${p.deadline}`);
            console.log(`   - isActive: ${p.isActive}`);
            console.log(`   - status: ${p.status}`);
            console.log('');
        });

        const activePrograms = await Program.find({
            $or: [
                { isActive: true },
                { isActive: { $exists: false } }
            ]
        });
        console.log(`=== ACTIVE PROGRAMS (shown to users) ===`);
        console.log(`Total: ${activePrograms.length}`);
        activePrograms.forEach(p => console.log(`  - ${p.title}`));

        mongoose.disconnect();
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
