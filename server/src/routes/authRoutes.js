import express from 'express';
import { login, demoLogin, getMe, forgotPassword } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/demo-login', demoLogin);
router.post('/forgot-password', forgotPassword);
router.get('/me', requireAuth, getMe);

export default router;

