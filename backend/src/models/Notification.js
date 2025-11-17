import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    // Usuário que receberá a notificação
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Usuário é obrigatório'],
      index: true,
    },
    // Tipo de notificação
    type: {
      type: String,
      enum: [
        'NOVA_ARTE',
        'VARIACAO_SOLICITADA',
        'VARIACAO_PRONTA',
        'VARIACAO_FALHOU',
        'NOVO_CLIENTE',
        'SISTEMA_ALERTA',
        'USO_LIMITE',
      ],
      required: [true, 'Tipo de notificação é obrigatório'],
    },
    // Título da notificação
    title: {
      type: String,
      required: [true, 'Título é obrigatório'],
      maxlength: [100, 'Título não pode ter mais de 100 caracteres'],
    },
    // Mensagem/descrição
    message: {
      type: String,
      required: [true, 'Mensagem é obrigatória'],
      maxlength: [500, 'Mensagem não pode ter mais de 500 caracteres'],
    },
    // Link relacionado (opcional)
    link: {
      type: String,
      default: null,
    },
    // Dados adicionais (JSON)
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Se foi lida
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    // Data de leitura
    readAt: {
      type: Date,
      default: null,
    },
    // Categoria para agrupamento
    category: {
      type: String,
      enum: ['client', 'variation', 'system', 'art'],
      default: 'system',
    },
    // Prioridade (para gestores)
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },
  },
  {
    timestamps: true,
  },
);

// Índices para performance
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, type: 1 });
notificationSchema.index({ createdAt: -1 });

// Método para marcar como lida
notificationSchema.methods.markAsRead = function () {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

// Método estático para criar notificação e enviar via WebSocket
notificationSchema.statics.createAndNotify = async function (
  notificationData,
  io = null,
) {
  const notification = await this.create(notificationData);

  // Envia via WebSocket se disponível
  if (io) {
    io.to(`user-${notification.userId}`).emit('notification', {
      id: notification._id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      link: notification.link,
      category: notification.category,
      createdAt: notification.createdAt,
      read: notification.read,
    });
  }

  return notification;
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
