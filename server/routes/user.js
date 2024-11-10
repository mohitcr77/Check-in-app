import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import userCtrl from '../controllers/userController.js';
import upload from '../middleware/uploadMiddleware.js'

const router = express.Router();

router.get('/profile', authMiddleware, userCtrl.getProfile);
router.put('/profile', authMiddleware, userCtrl.updateProfile);
router.put('/change-password', authMiddleware, userCtrl.changePassword);
router.post('/upload-profile-image', authMiddleware, upload.single("profileImage"), userCtrl.uploadProfileImage)

export default router;
