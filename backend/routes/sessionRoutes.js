import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createSession, getMySessions, updateSessionStatus, joinSession, deleteSession } from '../controllers/sessionController.js';

const router = express.Router();

router.use(protect);

router.post('/', createSession); // Create
router.get('/', getMySessions); // List
router.put('/:sessionId', updateSessionStatus); // Update status
router.put('/:sessionId/join', joinSession); // Join session

router.put('/:sessionId/join', joinSession); // Join session
router.delete('/:sessionId', deleteSession); // Delete session

export default router;
