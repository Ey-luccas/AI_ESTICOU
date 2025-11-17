import rateLimit from 'express-rate-limit';
import Client from '../models/Client.js';
import Variation from '../models/Variation.js';

// Rate limiter geral para API
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requisições por janela
  message: {
    success: false,
    message: 'Muitas requisições. Tente novamente em 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter específico para geração de IA
export const aiGenerationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // 10 gerações por hora
  message: {
    success: false,
    message:
      'Limite de gerações por hora atingido. Tente novamente mais tarde.',
  },
  skipSuccessfulRequests: false,
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware para verificar limite mensal do cliente
export const checkMonthlyLimit = async (req, res, next) => {
  try {
    const clientId = req.user.clientId || req.body.clientId;

    if (!clientId) {
      return res.status(400).json({
        success: false,
        message: 'Cliente não identificado',
      });
    }

    // Busca cliente
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado',
      });
    }

    // Conta variações do mês atual
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const variationsThisMonth = await Variation.countDocuments({
      clientId: clientId,
      status: 'completed',
      createdAt: { $gte: startOfMonth },
    });

    // Verifica limite
    const monthlyLimit = client.settings?.monthlyAILimit || 50;

    if (variationsThisMonth >= monthlyLimit) {
      return res.status(429).json({
        success: false,
        message: `Limite mensal de ${monthlyLimit} variações atingido`,
        data: {
          used: variationsThisMonth,
          limit: monthlyLimit,
          remaining: 0,
        },
      });
    }

    // Adiciona informações ao request
    req.aiUsage = {
      used: variationsThisMonth,
      limit: monthlyLimit,
      remaining: monthlyLimit - variationsThisMonth,
    };

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar limite de uso',
      error: error.message,
    });
  }
};
