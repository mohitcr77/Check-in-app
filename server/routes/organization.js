import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';
import organizationCtrl from '../controllers/organizationController.js';

const router = express.Router();


router.post('/register', authMiddleware, adminMiddleware, organizationCtrl.registerOrganization);
router.post('/join', authMiddleware, organizationCtrl.joinOrganization);
router.get('/', organizationCtrl.listOrganizations);

export default router;
