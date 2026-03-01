import Program from '../models/Program.js';
import ProgramApplication from '../models/ProgramApplication.js';

// Get all programs (with user application status)
export const getPrograms = async (req, res) => {
    try {
        const userId = req.user.id;

        // Auto-Seed if empty (For Demo Purposes)
        const count = await Program.countDocuments();
        if (count === 0) {
            await Program.insertMany([
                {
                    title: "Seed Accelerator Batch 5",
                    type: "Accelerator",
                    description: "A 12-week intensive program for early-stage startups seeking product-market fit and seed funding.",
                    deadline: new Date('2025-10-15'),
                    isActive: true
                },
                {
                    title: "GreenTech Grant 2025",
                    type: "Grant",
                    description: "Non-equity funding for startups building sustainable and eco-friendly solutions.",
                    deadline: new Date('2025-11-20'),
                    isActive: true
                },
                {
                    title: "Founder Fellowship",
                    type: "Fellowship",
                    description: "Mentorship and network access for first-time founders.",
                    deadline: new Date('2025-09-30'),
                    isActive: true
                }
            ]);
        }

        // Show programs that are explicitly active OR don't have isActive field set
        const programs = await Program.find({
            $or: [
                { isActive: true },
                { isActive: { $exists: false } }
            ]
        }).sort({ deadline: 1 });
        const applications = await ProgramApplication.find({ userId });

        // Create a map of ProgramId -> Status
        const appMap = new Map();
        applications.forEach(app => {
            appMap.set(app.programId.toString(), app.status);
        });

        const data = programs.map(p => {
            let status = 'Open';
            const appStatus = appMap.get(p._id.toString());

            // Map backend status to UI status
            // UI expects: "Open", "Applied", "In Review", "Closed"
            if (new Date() > new Date(p.deadline)) {
                status = 'Closed';
            }
            if (appStatus) {
                status = appStatus === 'applied' ? 'Applied' :
                    appStatus === 'in_review' ? 'In Review' :
                        appStatus.charAt(0).toUpperCase() + appStatus.slice(1);
            }

            return {
                id: p._id,
                title: p.title,
                type: p.type,
                description: p.description,
                deadline: new Date(p.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                status, // 'Open', 'Applied', etc.
                image: p.image
            };
        });

        res.json({
            success: true,
            count: data.length,
            data
        });

    } catch (error) {
        console.error("Error fetching programs:", error);
        res.status(500).json({ message: "Server error fetching programs" });
    }
};

// Apply to a program
export const applyToProgram = async (req, res) => {
    try {
        const { programId } = req.body;
        const userId = req.user.id;

        const program = await Program.findById(programId);
        if (!program) {
            return res.status(404).json({ message: "Program not found" });
        }

        if (new Date() > new Date(program.deadline)) {
            return res.status(400).json({ message: "Applications are closed for this program." });
        }

        const existingApp = await ProgramApplication.findOne({ programId, userId });
        if (existingApp) {
            return res.status(400).json({ message: "You have already applied." });
        }

        const newApp = new ProgramApplication({
            programId,
            userId,
            status: 'applied'
        });

        await newApp.save();

        res.status(201).json({
            success: true,
            message: "Application submitted successfully!",
            application: newApp
        });

    } catch (error) {
        console.error("Error applying to program:", error);
        res.status(500).json({ message: "Server error applying to program" });
    }
};
