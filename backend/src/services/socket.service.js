import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Configura Socket.io para notificações em tempo real
 */
export function setupSocketIO(io) {
  // Middleware de autenticação
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Token não fornecido'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('_id role clientId');

      if (!user) {
        return next(new Error('Usuário não encontrado'));
      }

      socket.userId = user._id.toString();
      socket.userRole = user.role;
      socket.clientId = user.clientId?.toString();

      next();
    } catch (error) {
      next(new Error('Token inválido'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    const userRole = socket.userRole;

    console.log(`✅ Usuário conectado: ${userId} (${userRole})`);

    // Entra na sala do usuário para receber notificações
    socket.join(`user-${userId}`);

    // Se for gestor, entra na sala de gestores
    if (userRole === 'manager') {
      socket.join('managers');
    }

    // Se for designer, entra na sala de designers
    if (userRole === 'designer') {
      socket.join('designers');
    }

    // Se for cliente, entra na sala do cliente
    if (userRole === 'client' && socket.clientId) {
      socket.join(`client-${socket.clientId}`);
    }

    // Evento para marcar notificação como lida
    socket.on('mark-notification-read', async (notificationId) => {
      try {
        const Notification = (await import('../models/Notification.js'))
          .default;
        const notification = await Notification.findById(notificationId);

        if (notification && notification.userId.toString() === userId) {
          await notification.markAsRead();
          socket.emit('notification-read', { id: notificationId });
        }
      } catch (error) {
        console.error('Erro ao marcar notificação como lida:', error);
      }
    });

    // Evento para marcar todas como lidas
    socket.on('mark-all-read', async () => {
      try {
        const Notification = (await import('../models/Notification.js'))
          .default;
        await Notification.updateMany(
          { userId, read: false },
          { read: true, readAt: new Date() },
        );
        socket.emit('all-notifications-read');
      } catch (error) {
        console.error('Erro ao marcar todas como lidas:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`❌ Usuário desconectado: ${userId}`);
    });
  });

  return io;
}

/**
 * Envia notificação para um usuário específico
 */
export function notifyUser(io, userId, notification) {
  io.to(`user-${userId}`).emit('notification', notification);
}

/**
 * Envia notificação para todos os gestores
 */
export function notifyManagers(io, notification) {
  io.to('managers').emit('notification', notification);
}

/**
 * Envia notificação para todos os designers
 */
export function notifyDesigners(io, notification) {
  io.to('designers').emit('notification', notification);
}

/**
 * Envia notificação para um cliente específico
 */
export function notifyClient(io, clientId, notification) {
  io.to(`client-${clientId}`).emit('notification', notification);
}
