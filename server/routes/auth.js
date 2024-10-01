import { Router } from 'express';
import authCtrl from '../controllers/authController.js';
import { validateLogin, validateRegistration } from '../middleware/validateInput.js';
const router = Router();

router.post('/register',validateRegistration, authCtrl.register);
router.post('/login',validateLogin, authCtrl.login)
router.post('/refresh-token', authCtrl.refreshToken);

export default router;