import { Router } from 'express';
import adminCtrl from '../controllers/adminController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';
const router = Router();

router.get('/users', authMiddleware, adminMiddleware, adminCtrl.getAllUsers);
router.put('/users/:userId/role', authMiddleware, adminMiddleware, adminCtrl.updateUserRole);
router.delete('/users/:userId', authMiddleware, adminMiddleware, adminCtrl.deleteUser);
// router.get('/attendance', authMiddleware, adminMiddleware, adminCtrl.getAllAttendance);
router.post('/attendance/report', authMiddleware, adminMiddleware, adminCtrl.generateReport);

export default router;


