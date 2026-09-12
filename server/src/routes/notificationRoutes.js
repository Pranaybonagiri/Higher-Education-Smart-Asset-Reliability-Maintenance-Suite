import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  clearNotification,
} from '../controllers/notificationController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, getNotifications);
router.patch('/mark-all', requireAuth, markAllAsRead);
router.patch('/:id/read', requireAuth, markAsRead);
router.delete('/:id', requireAuth, clearNotification);

export default router;

