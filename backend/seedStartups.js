import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Startup from './models/Startup.js';

dotenv.config();

const seeds = [
    {
        userId: "found_sunny_1",
        date: "December 12, 2025",
        views: 125,
        author: {
            name: "Sunny",
            role: "Engineering Student",
            avatar: "https://i.pravatar.cc/150?u=sunny"
        },
        name: "RoboInspect - AI Visual Inspection",
        desc: "Computer vision platform automating industrial quality inspection with 99.9% accuracy.",
        image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=600",
        category: "Manufacturing",
    },
    {
        userId: "found_sunny_2",
        date: "December 6, 2025",
        views: 89,
        author: {
            name: "Sunny",
            role: "Engineering Student",
            avatar: "https://i.pravatar.cc/150?u=sunny"
        },
        name: "GreenHome - Smart Home Energy",
        desc: "IoT platform optimizing residential energy consumption and enabling peer-to-peer energy trading.",
        image: "https://images.unsplash.com/photo-1558449028-b53a39d100fc?auto=format&fit=crop&q=80&w=600",
        category: "CleanTech",
    },
    {
        userId: "found_bishal",
        date: "December 1, 2025",
        views: 240,
        author: {
            name: "Bishal Baira",
            role: "Product Designer",
            avatar: "https://i.pravatar.cc/150?u=bishal"
        },
        name: "Postify - Social Scheduling",
        desc: "Postify simplifies social media management with AI-driven content scheduling and analytics.",
        image: "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?auto=format&fit=crop&q=80&w=600",
        category: "Marketing",
    },
    {
        userId: "found_alex",
        date: "December 6, 2025",
        views: 156,
        author: {
            name: "Alex Doe",
            role: "Full Stack Dev",
            avatar: "https://i.pravatar.cc/150?u=alex"
        },
        name: "Procmon - Webhook Debugger",
        desc: "Procmon is a webhook monitoring tool that helps you debug and inspect HTTP requests instantly.",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600",
        category: "DevTools",
    },
    {
        userId: "found_sarah",
        date: "December 8, 2025",
        views: 302,
        author: {
            name: "Sarah Lee",
            role: "AI Researcher",
            avatar: "https://i.pravatar.cc/150?u=sarah"
        },
        name: "Neuraflow - AI Workflows",
        desc: "Drag-and-drop interface to build complex AI agent workflows without writing code.",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=600",
        category: "AI",
    },
    {
        userId: "found_david",
        date: "December 10, 2025",
        views: 180,
        author: {
            name: "David Chen",
            role: "Fintech Founder",
            avatar: "https://i.pravatar.cc/150?u=david"
        },
        name: "PayPulse - Borderless Payments",
        desc: "Instant cross-border payments for freelancers with near-zero transaction fees.",
        image: "https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&q=80&w=600",
        category: "Fintech",
    }
];

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to DB for seeding...');
        await Startup.deleteMany({}); // clear old data
        await Startup.insertMany(seeds);
        console.log('Database seeded with startups!');
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
