import { Router } from 'express';
import analyticsController from '../controllers/analyticsController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';

const router = Router();

// User analytics (accessible by the user themselves)
router.get('/user', authMiddleware, analyticsController.getUserAnalytics);

// Team analytics (admin only)
router.get('/team', authMiddleware, adminMiddleware, analyticsController.getTeamAnalytics);

// Flagged records (admin only)
router.get('/flagged', authMiddleware, adminMiddleware, analyticsController.getFlaggedRecords);

// Review flagged record (admin only)
router.put('/flagged/:recordId/review', authMiddleware, adminMiddleware, analyticsController.reviewFlaggedRecord);

export default router;
