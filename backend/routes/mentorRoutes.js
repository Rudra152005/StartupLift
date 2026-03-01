import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getAllMentors, createMentorshipRequest, getMentorRequests, updateRequestStatus, getMyStartups, getMentorProfile, updateMentorProfile, getDashboardOverview, removeMentorshipConnection, rateMentor } from '../controllers/mentorController.js';
import Resource from '../models/Resource.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/', getAllMentors);
router.post('/request', createMentorshipRequest);
router.get('/overview', getDashboardOverview);

// Mentor-specific routes
router.get('/my-requests', getMentorRequests);
router.get('/my-startups', getMyStartups);
router.get('/profile', getMentorProfile);
router.put('/profile', updateMentorProfile);
router.put('/requests/:requestId', updateRequestStatus);
router.delete('/connection/:targetId', removeMentorshipConnection);
router.post('/:mentorId/rate', rateMentor);

// Resource routes for mentors
router.get('/resources', async (req, res) => {
    try {
        const mentorId = req.user.id;
        const { type } = req.query;

        const filter = { addedBy: mentorId };
        if (type && type !== 'all') {
            if (type === 'document') {
                filter.type = { $in: ['Document', 'PDF'] };
            } else {
                filter.type = type.charAt(0).toUpperCase() + type.slice(1);
            }
        }

        const resources = await Resource.find(filter)
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            resources: resources.map(r => ({
                _id: r._id,
                title: r.title,
                type: r.type.toLowerCase(),
                description: r.description,
                externalUrl: r.url,
                fileUrl: r.url,
                isPublic: r.isPublic,
                downloads: 0,
                uploadDate: r.createdAt,
                tags: []
            })),
            count: resources.length
        });
    } catch (error) {
        console.error('Error fetching resources:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.post('/resources/upload', upload.single('file'), async (req, res) => {
    try {
        const { title, type, description, isPublic } = req.body;

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const fileUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/uploads/${req.file.filename}`;

        const newResource = new Resource({
            addedBy: req.user.id,
            title,
            type: type === 'video' ? 'Video' : 'Document',
            description: description || '',
            url: fileUrl,
            isPublic: isPublic === 'true' // Convert string to boolean
        });

        await newResource.save();
        res.status(201).json({ success: true, resource: newResource });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ success: false, message: 'Upload failed' });
    }
});

router.post('/resources/link', async (req, res) => {
    try {
        const { title, externalUrl, description, isPublic } = req.body;

        if (!title || !externalUrl) {
            return res.status(400).json({ success: false, message: 'Title and URL required' });
        }

        const newResource = new Resource({
            addedBy: req.user.id,
            title,
            type: 'Link',
            description: description || '',
            url: externalUrl,
            isPublic: isPublic === 'true'
        });

        await newResource.save();
        res.status(201).json({ success: true, resource: newResource });
    } catch (error) {
        console.error('Link error:', error);
        res.status(500).json({ success: false, message: 'Failed to add link' });
    }
});

router.delete('/resources/:id', async (req, res) => {
    try {
        const resource = await Resource.findOne({ _id: req.params.id, addedBy: req.user.id });

        if (!resource) {
            return res.status(404).json({ success: false, message: 'Resource not found' });
        }

        await Resource.deleteOne({ _id: req.params.id });
        res.json({ success: true, message: 'Resource deleted' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ success: false, message: 'Delete failed' });
    }
});

router.post('/resources/:id/download', async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({ success: false, message: 'Resource not found' });
        }

        res.json({
            success: true,
            type: resource.type.toLowerCase() === 'link' ? 'link' : 'file',
            url: resource.url,
            fileName: resource.title
        });
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ success: false, message: 'Download failed' });
    }
});

export default router;
