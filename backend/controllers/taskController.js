import Task from '../models/Task.js';

// Create a new task (Mentor assigns to Mentee)
export const createTask = async (req, res) => {
    try {
        const { title, description, assignedTo, priority, dueDate } = req.body;
        const assignedBy = req.user.id;

        if (!title || !assignedTo) {
            return res.status(400).json({ message: "Title and Assignee are required." });
        }

        const newTask = new Task({
            title,
            description,
            assignedTo,
            assignedBy,
            priority: priority || 'Medium',
            dueDate
        });

        await newTask.save();

        // Populate assignee details for return
        await newTask.populate('assignedTo', 'name email');

        res.status(201).json({
            success: true,
            message: "Task assigned successfully!",
            data: newTask
        });

    } catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({ message: "Server error creating task" });
    }
};

// Get tasks assigned TO the logged-in user (Mentee view)
export const getMyTasks = async (req, res) => {
    try {
        const userId = req.user.id;
        const tasks = await Task.find({ assignedTo: userId })
            .populate('assignedBy', 'name role') // Show who assigned it
            .sort({ dueDate: 1, createdAt: -1 });

        res.json({
            success: true,
            count: tasks.length,
            data: tasks
        });
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ message: "Server error fetching tasks" });
    }
};

// Get tasks created BY the logged-in mentor (Mentor view)
export const getCreatedTasks = async (req, res) => {
    try {
        const mentorId = req.user.id;
        const tasks = await Task.find({ assignedBy: mentorId })
            .populate('assignedTo', 'name email') // Show who it's assigned to
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: tasks.length,
            data: tasks
        });
    } catch (error) {
        console.error("Error fetching created tasks:", error);
        res.status(500).json({ message: "Server error fetching tasks" });
    }
};

// Update task status or details
export const updateTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const updates = req.body;
        const userId = req.user.id;

        const task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ message: "Task not found" });

        // Allow update if user is the assignee OR the assigner
        if (task.assignedTo.toString() !== userId && task.assignedBy.toString() !== userId) {
            return res.status(403).json({ message: "Not authorized to update this task" });
        }

        // Apply updates
        Object.keys(updates).forEach(key => {
            // Prevent changing assignment ownership strictly if needed, but for now allow flexible updates
            task[key] = updates[key];
        });

        await task.save();

        res.json({
            success: true,
            message: "Task updated successfully",
            data: task
        });

    } catch (error) {
        console.error("Error updating task:", error);
        res.status(500).json({ message: "Server error updating task" });
    }
};

// Delete task (Mentor only)
export const deleteTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const userId = req.user.id;

        const task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ message: "Task not found" });

        if (task.assignedBy.toString() !== userId) {
            return res.status(403).json({ message: "Only the creator can delete this task" });
        }

        await task.deleteOne();

        res.json({
            success: true,
            message: "Task deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).json({ message: "Server error deleting task" });
    }
};

// Submit a task (Mentee uploads file or link)
export const submitTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { link } = req.body; // If it's a link submission
        const userId = req.user.id;

        const task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ message: "Task not found" });

        if (task.assignedTo.toString() !== userId) {
            return res.status(403).json({ message: "You are not assigned to this task" });
        }

        let submissionUrl = link;
        let submissionType = 'link';

        if (req.file) {
            // Using a relative path for the frontend to access via static server
            submissionUrl = `/uploads/${req.file.filename}`;
            submissionType = 'file';
        }

        if (!submissionUrl) {
            return res.status(400).json({ message: "Please provide a file or a link" });
        }

        task.submissionUrl = submissionUrl;
        task.submissionType = submissionType;
        task.status = 'completed';
        task.submittedAt = new Date();

        await task.save();

        res.json({
            success: true,
            message: "Task submitted successfully",
            data: task
        });

    } catch (error) {
        console.error("Error submitting task:", error);
        res.status(500).json({ message: "Server error submitting task" });
    }
};

// Review a task (Mentor provides feedback)
export const reviewTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { feedback, rating } = req.body;
        const userId = req.user.id;

        const task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ message: "Task not found" });

        if (task.assignedBy.toString() !== userId) {
            return res.status(403).json({ message: "Only the assigner can review this task" });
        }

        if (task.status !== 'completed') {
            return res.status(400).json({ message: "Task must be completed before reviewing" });
        }

        task.feedback = feedback;
        task.rating = rating;
        task.reviewedAt = new Date();

        await task.save();

        res.json({
            success: true,
            message: "Feedback submitted successfully",
            data: task
        });

    } catch (error) {
        console.error("Error reviewing task:", error);
        res.status(500).json({ message: "Server error reviewing task" });
    }
};
