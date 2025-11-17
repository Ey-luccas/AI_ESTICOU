import express from 'express';
import {
  createNotification,
  listNotifications,
  markAllRead,
  markNotificationRead,
} from '../controllers/notification.controller.js';

const router = express.Router();

router.get('/', listNotifications);
router.post('/', createNotification);
router.patch('/mark-all/read', markAllRead);
router.patch('/:id/read', markNotificationRead);

export default router;
