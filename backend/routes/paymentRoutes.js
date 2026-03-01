import express from 'express';
import { protect } from '../middleware/authMiddleware.js'; // Assuming auth middleware exists
import { createOrder, verifyPayment } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/create-order', protect, createOrder);
router.post('/verify-payment', protect, verifyPayment);

export default router;
