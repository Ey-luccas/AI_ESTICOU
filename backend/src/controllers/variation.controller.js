import Variation from '../models/Variation.js';
import Art from '../models/Art.js';
import Client from '../models/Client.js';
import Designer from '../models/Designer.js';
import openaiService from '../services/openai.service.js';
import promptBuilder from '../services/prompt.service.js';
import { successResponse, errorResponse, paginate } from '../utils/helpers.js';

// @desc    Listar variações
// @route   GET /api/variations
// @access  Private
export const getVariations = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      artId,
      clientId,
      status,
      isApproved,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    // Build query
    let query = {};

    // Filtro por role
    if (req.user.role === 'client') {
      query.clientId = req.user.clientId;
    }

    // Filtros adicionais
    if (artId) query.artId = artId;
    if (clientId) query.clientId = clientId;
    if (status) query.status = status;
    if (isApproved !== undefined) query.isApproved = isApproved === 'true';

    // Ordenação
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = { [sortBy]: sortOrder };

    // Execute query
    const variations = await paginate(
      Variation.find(query)
        .populate('artId', 'name category imageUrl')
        .populate('clientId', 'name logo email')
        .sort(sortOptions),
      page,
      limit,
    );

    const total = await Variation.countDocuments(query);

    successResponse(res, {
      variations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    errorResponse(res, 'Erro ao listar variações', 500, error.message);
  }
};

// @desc    Obter variação por ID
// @route   GET /api/variations/:id
// @access  Private
export const getVariationById = async (req, res) => {
  try {
    const variation = await Variation.findById(req.params.id)
      .populate('artId', 'name category imageUrl tags')
      .populate('clientId', 'name logo email');

    if (!variation) {
      return errorResponse(res, 'Variação não encontrada', 404);
    }

    // Verifica permissão
    if (
      req.user.role === 'client' &&
      variation.clientId._id.toString() !== req.user.clientId.toString()
    ) {
      return errorResponse(
        res,
        'Sem permissão para visualizar esta variação',
        403,
      );
    }

    successResponse(res, { variation });
  } catch (error) {
    errorResponse(res, 'Erro ao buscar variação', 500, error.message);
  }
};

// Função auxiliar para gerar em background
async function generateVariationInBackground(
  variationId,
  art,
  parameters,
  quality,
  io = null,
) {
  try {
    // Constrói prompt otimizado
    const prompt = promptBuilder.buildPrompt(art.category, parameters);

    // Gera imagem com OpenAI e faz upload
    const result = await openaiService.generateAndUpload(prompt, { quality });

    // Atualiza variação com sucesso
    const variation = await Variation.findByIdAndUpdate(
      variationId,
      {
        status: 'completed',
        imageUrl: result.imageUrl,
        imagePublicId: result.imagePublicId,
        thumbnailUrl: result.thumbnailUrl,
        generatedPrompt: prompt,
        'metadata.generationTime': result.generationTime,
        'metadata.revisedPrompt': result.revisedPrompt,
        'metadata.format': result.metadata.format,
        dimensions: {
          width: result.metadata.width,
          height: result.metadata.height,
        },
      },
      { new: true },
    ).populate('clientId', 'name');

    // Notifica cliente que variação está pronta
    if (variation && variation.clientId) {
      const notificationService = (
        await import('../services/notification.service.js')
      ).default;
      if (io) {
        notificationService.setIO(io);
      }
      await notificationService.notifyVariationReady(variation, art);
    }

    console.log(`✅ Variação ${variationId} gerada com sucesso`);
  } catch (error) {
    // Atualiza variação com erro
    const variation = await Variation.findByIdAndUpdate(
      variationId,
      {
        status: 'failed',
        errorMessage: error.message,
      },
      { new: true },
    ).populate('clientId', 'name');

    // Notifica cliente sobre o erro
    if (variation && variation.clientId) {
      try {
        const notificationService = (
          await import('../services/notification.service.js')
        ).default;
        if (io) {
          notificationService.setIO(io);
        }
        await notificationService.notifyVariationFailed(
          variation,
          art,
          error.message,
        );
      } catch (notifError) {
        console.error('Erro ao notificar sobre falha:', notifError);
      }
    }

    console.error(`❌ Erro ao gerar variação ${variationId}:`, error);
  }
}

// @desc    Gerar nova variação com IA
// @route   POST /api/variations/generate
// @access  Private (Client)
export const generateVariation = async (req, res) => {
  try {
    const {
      artId,
      currentProduct,
      newProduct,
      currentPrice,
      newPrice,
      currentText,
      newText,
      notes,
      quality = 'standard',
    } = req.body;

    // Valida arte base
    const art = await Art.findById(artId);
    if (!art) {
      return errorResponse(res, 'Arte base não encontrada', 404);
    }

    // Verifica se cliente tem acesso a esta arte
    const clientId = req.user.clientId;
    if (art.clientId.toString() !== clientId.toString()) {
      return errorResponse(res, 'Sem permissão para usar esta arte', 403);
    }

    // Cria registro de variação (status: processing)
    const variation = await Variation.create({
      artId,
      clientId,
      parameters: {
        currentProduct,
        newProduct,
        currentPrice,
        newPrice,
        currentText,
        newText,
        notes,
      },
      status: 'processing',
      quality,
      generatedPrompt: 'Gerando...',
    });

    // Notifica designer sobre a solicitação
    try {
      const notificationService = (
        await import('../services/notification.service.js')
      ).default;
      const io = req.app.get('io');
      if (io) {
        notificationService.setIO(io);
      }

      const client = await Client.findById(clientId);
      if (client) {
        await notificationService.notifyVariationRequested(
          variation,
          art,
          client.name,
        );
      }
    } catch (error) {
      console.error('Erro ao notificar designer:', error);
    }

    // Inicia geração em background (não espera completar)
    generateVariationInBackground(
      variation._id,
      art,
      {
        currentProduct,
        newProduct,
        currentPrice,
        newPrice,
        currentText,
        newText,
        notes,
      },
      quality,
      req.app.get('io'),
    );

    successResponse(
      res,
      {
        variation,
        message: 'Variação em processamento',
        aiUsage: req.aiUsage,
      },
      'Geração iniciada',
      202,
    );
  } catch (error) {
    errorResponse(res, 'Erro ao iniciar geração', 500, error.message);
  }
};

// @desc    Verificar status de geração
// @route   GET /api/variations/:id/status
// @access  Private
export const checkGenerationStatus = async (req, res) => {
  try {
    const variation = await Variation.findById(req.params.id)
      .select('status errorMessage imageUrl generatedPrompt metadata')
      .populate('artId', 'name');

    if (!variation) {
      return errorResponse(res, 'Variação não encontrada', 404);
    }

    successResponse(res, {
      status: variation.status,
      imageUrl: variation.imageUrl,
      errorMessage: variation.errorMessage,
      metadata: variation.metadata,
    });
  } catch (error) {
    errorResponse(res, 'Erro ao verificar status', 500, error.message);
  }
};

// @desc    Aprovar variação
// @route   POST /api/variations/:id/approve
// @access  Private (Client)
export const approveVariation = async (req, res) => {
  try {
    const variation = await Variation.findById(req.params.id);

    if (!variation) {
      return errorResponse(res, 'Variação não encontrada', 404);
    }

    // Verifica permissão
    if (variation.clientId.toString() !== req.user.clientId.toString()) {
      return errorResponse(res, 'Sem permissão', 403);
    }

    await variation.approve();

    successResponse(res, { variation }, 'Variação aprovada');
  } catch (error) {
    errorResponse(res, 'Erro ao aprovar variação', 500, error.message);
  }
};

// @desc    Adicionar feedback
// @route   POST /api/variations/:id/feedback
// @access  Private (Client)
export const addFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return errorResponse(res, 'Rating deve ser entre 1 e 5', 400);
    }

    const variation = await Variation.findById(req.params.id);

    if (!variation) {
      return errorResponse(res, 'Variação não encontrada', 404);
    }

    // Verifica permissão
    if (variation.clientId.toString() !== req.user.clientId.toString()) {
      return errorResponse(res, 'Sem permissão', 403);
    }

    await variation.addFeedback(rating, comment);

    successResponse(res, { variation }, 'Feedback registrado');
  } catch (error) {
    errorResponse(res, 'Erro ao adicionar feedback', 500, error.message);
  }
};

// @desc    Deletar variação
// @route   DELETE /api/variations/:id
// @access  Private (Client/Manager)
export const deleteVariation = async (req, res) => {
  try {
    const variation = await Variation.findById(req.params.id);

    if (!variation) {
      return errorResponse(res, 'Variação não encontrada', 404);
    }

    // Verifica permissão
    if (
      req.user.role === 'client' &&
      variation.clientId.toString() !== req.user.clientId.toString()
    ) {
      return errorResponse(res, 'Sem permissão', 403);
    }

    // Deleta imagem do Cloudinary
    if (variation.imagePublicId) {
      const { deleteImage } = await import('../config/cloudinary.js');
      await deleteImage(variation.imagePublicId);
    }

    await variation.deleteOne();

    successResponse(res, null, 'Variação deletada');
  } catch (error) {
    errorResponse(res, 'Erro ao deletar variação', 500, error.message);
  }
};

// @desc    Obter uso de IA do cliente
// @route   GET /api/variations/usage/current
// @access  Private (Client)
export const getCurrentUsage = async (req, res) => {
  try {
    const clientId = req.user.clientId;

    const client = await Client.findById(clientId);
    if (!client) {
      return errorResponse(res, 'Cliente não encontrado', 404);
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

    const monthlyLimit = client.settings?.monthlyAILimit || 50;

    successResponse(res, {
      used: variationsThisMonth,
      limit: monthlyLimit,
      remaining: monthlyLimit - variationsThisMonth,
      percentage: Math.round((variationsThisMonth / monthlyLimit) * 100),
      resetDate: new Date(
        startOfMonth.getFullYear(),
        startOfMonth.getMonth() + 1,
        1,
      ),
    });
  } catch (error) {
    errorResponse(res, 'Erro ao obter uso', 500, error.message);
  }
};

// @desc    Obter estatísticas de variações
// @route   GET /api/variations/stats/overview
// @access  Private (Manager)
export const getVariationsStats = async (req, res) => {
  try {
    const totalVariations = await Variation.countDocuments({
      status: 'completed',
    });
    const failedVariations = await Variation.countDocuments({
      status: 'failed',
    });
    const processingVariations = await Variation.countDocuments({
      status: 'processing',
    });

    const avgGenerationTime = await Variation.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: null,
          avg: { $avg: '$metadata.generationTime' },
        },
      },
    ]);

    const topClients = await Variation.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: '$clientId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'clients',
          localField: '_id',
          foreignField: '_id',
          as: 'client',
        },
      },
    ]);

    successResponse(res, {
      total: totalVariations,
      failed: failedVariations,
      processing: processingVariations,
      avgGenerationTime: avgGenerationTime[0]?.avg || 0,
      topClients,
    });
  } catch (error) {
    errorResponse(res, 'Erro ao obter estatísticas', 500, error.message);
  }
};
