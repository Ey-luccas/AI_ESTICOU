import Notification from '../models/Notification.js';
import { successResponse, errorResponse, paginate } from '../utils/helpers.js';

// @desc    Listar notificações do usuário
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, read, type, category } = req.query;

    let query = { userId: req.user.id };

    if (read !== undefined) {
      query.read = read === 'true';
    }

    if (type) {
      query.type = type;
    }

    if (category) {
      query.category = category;
    }

    const notifications = await paginate(
      Notification.find(query).sort({ createdAt: -1 }),
      page,
      limit,
    );

    const total = await Notification.countDocuments(query);

    successResponse(res, {
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    errorResponse(res, 'Erro ao listar notificações', 500, error.message);
  }
};

// @desc    Obter contador de não lidas
// @route   GET /api/notifications/unread-count
// @access  Private
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user.id,
      read: false,
    });

    successResponse(res, { count });
  } catch (error) {
    errorResponse(res, 'Erro ao obter contador', 500, error.message);
  }
};

// @desc    Marcar notificação como lida
// @route   POST /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return errorResponse(res, 'Notificação não encontrada', 404);
    }

    if (notification.userId.toString() !== req.user.id.toString()) {
      return errorResponse(res, 'Sem permissão', 403);
    }

    await notification.markAsRead();

    successResponse(res, { notification }, 'Notificação marcada como lida');
  } catch (error) {
    errorResponse(res, 'Erro ao marcar como lida', 500, error.message);
  }
};

// @desc    Marcar todas como lidas
// @route   POST /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.user.id, read: false },
      { read: true, readAt: new Date() },
    );

    successResponse(
      res,
      { updated: result.modifiedCount },
      'Todas as notificações foram marcadas como lidas',
    );
  } catch (error) {
    errorResponse(res, 'Erro ao marcar todas como lidas', 500, error.message);
  }
};
