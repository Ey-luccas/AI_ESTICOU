import Notification from '../models/Notification.js';
import { errorResponse, successResponse } from '../utils/helpers.js';

export const listNotifications = async (req, res) => {
  try {
    const { userId, unreadOnly } = req.query;

    if (!userId) {
      return errorResponse(res, 'userId é obrigatório', 400);
    }

    const query = { userId };
    if (unreadOnly) {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(res, { notifications });
  } catch (error) {
    return errorResponse(res, 'Erro ao buscar notificações', 500, error.message);
  }
};

export const createNotification = async (req, res) => {
  try {
    const { userId, title, message, type, link, meta } = req.body;

    if (!userId || !title || !message) {
      return errorResponse(res, 'Dados obrigatórios ausentes', 400);
    }

    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
      link,
      meta,
    });

    return successResponse(res, { notification }, 'Notificação criada', 201);
  } catch (error) {
    return errorResponse(res, 'Erro ao criar notificação', 500, error.message);
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);
    if (!notification) {
      return errorResponse(res, 'Notificação não encontrada', 404);
    }

    notification.read = !notification.read;
    await notification.save();

    return successResponse(res, { notification }, 'Status atualizado');
  } catch (error) {
    return errorResponse(res, 'Erro ao atualizar notificação', 500, error.message);
  }
};

export const markAllRead = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return errorResponse(res, 'userId é obrigatório', 400);
    }

    await Notification.updateMany({ userId, read: false }, { read: true });

    return successResponse(res, null, 'Notificações marcadas como lidas');
  } catch (error) {
    return errorResponse(res, 'Erro ao marcar todas como lidas', 500, error.message);
  }
};
