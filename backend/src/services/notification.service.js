import Notification from '../models/Notification.js';

/**
 * Serviço centralizado para criar e enviar notificações
 */
class NotificationService {
  constructor(io = null) {
    this.io = io;
  }

  /**
   * Define a instância do Socket.io
   */
  setIO(io) {
    this.io = io;
  }

  /**
   * Cria e envia notificação para um usuário
   */
  async notifyUser(userId, type, title, message, options = {}) {
    try {
      const notification = await Notification.createAndNotify(
        {
          userId,
          type,
          title,
          message,
          link: options.link || null,
          category: options.category || 'system',
          priority: options.priority || 'normal',
          data: options.data || {},
        },
        this.io,
      );

      return notification;
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      throw error;
    }
  }

  /**
   * Notifica cliente quando designer adiciona nova arte
   */
  async notifyNewArt(art, clientId, designerName) {
    return this.notifyUser(
      clientId,
      'NOVA_ARTE',
      'Nova arte disponível',
      `${designerName} adicionou uma nova arte: "${art.name}"`,
      {
        link: `/client/art/${art._id}`,
        category: 'art',
        data: {
          artId: art._id.toString(),
          artName: art.name,
          designerName,
        },
      },
    );
  }

  /**
   * Notifica designer quando cliente solicita variação
   */
  async notifyVariationRequested(variation, art, clientName) {
    try {
      // Busca o designer da arte
      const Designer = (await import('../models/Designer.js')).default;
      const artPopulated = await art.populate('designerId');

      if (!artPopulated.designerId) {
        return;
      }

      const designer = await Designer.findById(
        artPopulated.designerId._id,
      ).populate('userId');

      if (!designer || !designer.userId) {
        return;
      }

      return this.notifyUser(
        designer.userId._id,
        'VARIACAO_SOLICITADA',
        'Nova solicitação de variação',
        `${clientName} solicitou uma variação da arte "${art.name}"`,
        {
          link: `/designer/art/${art._id}`,
          category: 'variation',
          data: {
            variationId: variation._id.toString(),
            artId: art._id.toString(),
            artName: art.name,
            clientName,
          },
        },
      );
    } catch (error) {
      console.error('Erro ao notificar designer sobre variação:', error);
    }
  }

  /**
   * Notifica cliente quando variação está pronta
   */
  async notifyVariationReady(variation, art) {
    return this.notifyUser(
      variation.clientId,
      'VARIACAO_PRONTA',
      '✨ Sua variação está pronta!',
      `A IA processou sua solicitação para "${art.name}"`,
      {
        link: `/client/variations/${variation._id}`,
        category: 'variation',
        data: {
          variationId: variation._id.toString(),
          artId: art._id.toString(),
          artName: art.name,
        },
      },
    );
  }

  /**
   * Notifica cliente quando variação falha
   */
  async notifyVariationFailed(variation, art, errorMessage) {
    return this.notifyUser(
      variation.clientId,
      'VARIACAO_FALHOU',
      '⚠️ Erro ao processar variação',
      `Não foi possível processar a variação de "${art.name}". ${errorMessage}`,
      {
        link: `/client/art/${art._id}`,
        category: 'variation',
        priority: 'high',
        data: {
          variationId: variation._id.toString(),
          artId: art._id.toString(),
          errorMessage,
        },
      },
    );
  }

  /**
   * Notifica gestor sobre eventos críticos
   */
  async notifyManager(managerId, type, title, message, options = {}) {
    return this.notifyUser(managerId, type, title, message, {
      ...options,
      priority: options.priority || 'high',
      category: 'system',
    });
  }

  /**
   * Notifica sobre uso de limite de IA
   */
  async notifyUsageLimit(clientId, percentage, limit, used) {
    if (percentage >= 80) {
      return this.notifyUser(
        clientId,
        'USO_LIMITE',
        `⚠️ Cota de IA em ${percentage}%`,
        `Você já usou ${used} de ${limit} variações este mês.`,
        {
          link: '/client/variations',
          category: 'system',
          priority: percentage >= 95 ? 'urgent' : 'high',
          data: {
            percentage,
            limit,
            used,
          },
        },
      );
    }
  }
}

// Exporta instância singleton
export default new NotificationService();
