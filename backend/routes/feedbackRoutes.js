import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    createFeedback,
    getMyFeedback,
    getGivenFeedback
} from '../controllers/feedbackController.js';

const router = express.Router();

router.use(protect);

router.post('/', createFeedback);
router.get('/my-feedback', getMyFeedback);
router.get('/given', getGivenFeedback);

export default router;
