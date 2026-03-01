import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    createTask,
    getMyTasks,
    getCreatedTasks,
    updateTask,
    deleteTask,
    submitTask,
    reviewTask
} from '../controllers/taskController.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.use(protect); // All routes protected

router.post('/', createTask);
router.get('/my-tasks', getMyTasks);
router.get('/created', getCreatedTasks);
router.post('/:taskId/submit', upload.single('file'), submitTask);
router.post('/:taskId/review', reviewTask);
router.put('/:taskId', updateTask);
router.delete('/:taskId', deleteTask);

export default router;
