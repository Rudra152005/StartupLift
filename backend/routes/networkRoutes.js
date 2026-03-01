import express from 'express';
import { getFounderNetwork, connect, acceptRequest } from '../controllers/networkController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getFounderNetwork);
router.post('/connect', protect, connect);
router.post('/accept', protect, acceptRequest);

export default router;
