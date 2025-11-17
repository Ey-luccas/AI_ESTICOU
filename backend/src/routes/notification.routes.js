import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} from '../controllers/notification.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(protect);

// Obter notificações do usuário
router.get('/', getNotifications);

// Contador de não lidas
router.get('/unread-count', getUnreadCount);

// Marcar como lida
router.post('/:id/read', markAsRead);

// Marcar todas como lidas
router.post('/read-all', markAllAsRead);

export default router;
