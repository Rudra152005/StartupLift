import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getResources, getMentorResources, addResource } from '../controllers/resourceController.js';

const router = express.Router();

router.use(protect);

router.get('/', getResources); // For Founders
router.get('/mentor', getMentorResources); // For Mentors
router.post('/', addResource); // Create

export default router;
