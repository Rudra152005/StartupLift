import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to DB');
        const admin = await User.findOne({ role: 'Admin' });
        if (admin) {
            console.log('✅ Admin user found:', admin.email);
            console.log('Password hash:', admin.password ? 'Exists' : 'Missing');
        } else {
            console.log('❌ No Admin user found.');
            // Create one
            const newAdmin = new User({
                name: "Admin",
                email: "admin@example.com",
                password: "password123",
                role: "Admin",
                isVerified: true,
                authMethod: "local"
            });
            await newAdmin.save();
            console.log('✅ Created default admin: admin@example.com / password123');
        }
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
