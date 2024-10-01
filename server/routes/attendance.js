import { Router } from 'express';
import attendanceController from '../controllers/attendanceController.js';
import authMiddleware from "../middleware/authMiddleware.js";
const router = Router();

router.post('/checkIn', authMiddleware, attendanceController.checkIn);
router.post('/checkout', authMiddleware, attendanceController.checkOut)
router.get('/records', authMiddleware, attendanceController.getUserAttendance)

export default router;