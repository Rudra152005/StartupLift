import express from 'express';
import upload from '../middleware/upload.js';
import path from 'path';

const router = express.Router();

router.post('/', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
        const fileUrl = `${backendUrl}/uploads/${req.file.filename}`;

        res.json({
            success: true,
            url: fileUrl
        });
    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ message: "Server error during upload" });
    }
});

export default router;
