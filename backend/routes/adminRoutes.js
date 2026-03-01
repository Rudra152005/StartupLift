import express from 'express';
import {
    getAdminStats,
    getAllUsers,
    createUser,
    getUserById,
    deleteUser,
    getAllMentors,
    getAllStartups,
    deleteStartup,
    getAllPrograms,
    createProgram,
    deleteProgram,
    getAllSessions,
    getAllResources,
    createResource,
    deleteResource,
    getAnalytics,
    getSettings,
    updateSettings,
    getSecurityLogs
} from '../controllers/adminController.js';

const router = express.Router();

// Stats
router.get('/stats', getAdminStats);

// Mentor Management
router.get('/all-mentors', getAllMentors);

// Startup Management
router.get('/all-startups', getAllStartups);
router.delete('/startups/:id', deleteStartup);

// Program Management
router.get('/programs', getAllPrograms);
router.post('/programs', createProgram);
router.delete('/programs/:id', deleteProgram);

// Session Management
router.get('/all-sessions', getAllSessions);

// Resource Management
router.get('/all-resources', getAllResources);
router.post('/all-resources', createResource);
router.delete('/all-resources/:id', deleteResource);

// Reports & Analytics
router.get('/analytics', getAnalytics);

// System Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

// Security
router.get('/security/logs', getSecurityLogs);

// User Management
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.get('/users/:id', getUserById);
router.delete('/users/:id', deleteUser);

export default router;
