import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { sendMessage, getConversation, getContacts, restartMentorship, deleteConversation, blockUser, unblockUser, clearChat } from '../controllers/chatController.js';

const router = express.Router();

router.use(protect);

router.post('/', sendMessage);
router.get('/contacts', getContacts);
router.post('/restart-mentorship', restartMentorship);
router.post('/delete', deleteConversation); // Delete/Hide conversation
router.post('/clear', clearChat); // Clear conversation permanently
router.post('/block', blockUser);
router.post('/unblock', unblockUser);
router.get('/:userId', getConversation);

export default router;
