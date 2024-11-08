import { Router } from 'express';
import adminCtrl from '../controllers/adminController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';
const router = Router();

router.get('/users', authMiddleware, adminMiddleware, adminCtrl.getAllUsers);
router.put('/users/:userId/role', authMiddleware, adminMiddleware, adminCtrl.updateUserRole);
router.delete('/users/:userId', authMiddleware, adminMiddleware, adminCtrl.deleteUser);
router.get('/attendance/:userId', authMiddleware, adminMiddleware, adminCtrl.getUserAttendance);
router.post('/attendance/report', authMiddleware, adminMiddleware, adminCtrl.generateReport);
router.get("/attendanceRecords/date", authMiddleware, adminMiddleware, adminCtrl.getAttendanceByDate);
router.get("/getLocations", authMiddleware, adminMiddleware, adminCtrl.getLocationsByOrganization);

export default router;


