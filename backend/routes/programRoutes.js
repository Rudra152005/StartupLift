import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getPrograms, applyToProgram } from '../controllers/programController.js';

const router = express.Router();

// Public route to view programs? No, usually protected for users.
router.get('/', protect, getPrograms);
router.post('/apply', protect, applyToProgram);

export default router;
