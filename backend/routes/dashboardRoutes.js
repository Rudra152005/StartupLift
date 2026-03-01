import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getDashboardOverview, updateBankDetails } from '../controllers/dashboardController.js';

const router = express.Router();

// All routes here are protected
router.use(protect);

router.get('/overview', getDashboardOverview);
router.post('/bank-details', updateBankDetails);

export default router;
