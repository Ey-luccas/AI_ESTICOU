import Art from '../models/Art.js';
import Client from '../models/Client.js';
import Designer from '../models/Designer.js';
import {
  paginate,
  buildSearchQuery,
  successResponse,
  errorResponse,
} from '../utils/helpers.js';
import {
  deleteOldImage,
  extractPublicId,
  generateThumbnail,
} from '../utils/imageProcessor.js';

// @desc    Listar todas as artes
// @route   GET /api/arts
// @access  Private
export const getArts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      status = 'active',
      clientId,
      designerId,
      tags,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    // Build query
    let query = {};

    // Filtro por role do usuário
    if (req.user.role === 'client') {
      query.clientId = req.user.clientId;
    } else if (req.user.role === 'designer') {
      const designer = await Designer.findOne({ userId: req.user.id });
      if (designer) {
        query.designerId = designer._id;
      }
    }

    // Filtros adicionais
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) query.category = category;
    if (status) query.status = status;
    if (clientId) query.clientId = clientId;
    if (designerId) query.designerId = designerId;
    if (tags) {
      const tagArray = tags.split(',').map((t) => t.trim());
      query.tags = { $in: tagArray };
    }

    // Ordenação
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = { [sortBy]: sortOrder };

    // Execute query com paginação
    const arts = await paginate(
      Art.find(query)
        .populate('clientId', 'name logo email')
        .populate('designerId', 'userId')
        .populate({
          path: 'designerId',
          populate: {
            path: 'userId',
            select: 'name email avatar',
          },
        })
        .sort(sortOptions),
      page,
      limit,
    );

    const total = await Art.countDocuments(query);

    successResponse(res, {
      arts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    errorResponse(res, 'Erro ao listar artes', 500, error.message);
  }
};

// @desc    Obter arte por ID
// @route   GET /api/arts/:id
// @access  Private
export const getArtById = async (req, res) => {
  try {
    const art = await Art.findById(req.params.id)
      .populate('clientId', 'name logo email')
      .populate({
        path: 'designerId',
        populate: {
          path: 'userId',
          select: 'name email avatar',
        },
      });

    if (!art) {
      return errorResponse(res, 'Arte não encontrada', 404);
    }

    // Verifica permissão
    if (
      req.user.role === 'client' &&
      art.clientId._id.toString() !== req.user.clientId.toString()
    ) {
      return errorResponse(res, 'Sem permissão para visualizar esta arte', 403);
    }

    // Incrementa views
    await art.incrementViews();

    successResponse(res, { art });
  } catch (error) {
    errorResponse(res, 'Erro ao buscar arte', 500, error.message);
  }
};

// @desc    Criar nova arte
// @route   POST /api/arts
// @access  Private (Designer/Manager)
export const createArt = async (req, res) => {
  try {
    const {
      name,
      description,
      clientId,
      category,
      tags,
      isTemplate,
      dimensions,
      metadata,
      size,
    } = req.body;

    // Verifica se imagem foi enviada
    if (!req.file) {
      return errorResponse(res, 'Imagem é obrigatória', 400);
    }

    // Verifica se Cloudinary está configurado
    const { isCloudinaryConfigured } = await import('../config/cloudinary.js');
    if (!isCloudinaryConfigured()) {
      return errorResponse(
        res,
        'Cloudinary não está configurado. Configure as variáveis CLOUDINARY_* no .env para fazer upload de imagens.',
        503,
      );
    }

    // Verifica se cliente existe
    const client = await Client.findById(clientId);
    if (!client) {
      return errorResponse(res, 'Cliente não encontrado', 404);
    }

    // Busca designer do usuário logado
    let designerId;
    if (req.user.role === 'designer') {
      const designer = await Designer.findOne({ userId: req.user.id });
      if (!designer) {
        return errorResponse(res, 'Perfil de designer não encontrado', 404);
      }
      designerId = designer._id;
    } else if (req.user.role === 'manager' && req.body.designerId) {
      designerId = req.body.designerId;
    } else {
      return errorResponse(res, 'Designer não especificado', 400);
    }

    // Extrai informações da imagem do Cloudinary
    const imageUrl = req.file.path;
    const imagePublicId = req.file.filename;

    // Gera thumbnail
    const thumbnailUrl = await generateThumbnail(imageUrl);

    // Processa tags
    const artTags = tags
      ? typeof tags === 'string'
        ? tags.split(',').map((t) => t.trim())
        : tags
      : [];

    // Processa tamanho e dimensões
    const artSize = size || '1080x1080';
    const [width, height] = artSize.split('x').map(Number);
    const artDimensions = dimensions || { width, height };

    // Cria arte
    const art = await Art.create({
      name,
      description,
      imageUrl,
      imagePublicId,
      thumbnailUrl,
      clientId,
      designerId,
      category,
      tags: artTags,
      size: artSize,
      isTemplate: isTemplate !== undefined ? isTemplate : true,
      dimensions: artDimensions,
      fileSize: req.file.size,
      metadata: {
        format: req.file.format,
        ...metadata,
      },
    });

    // Popula dados
    await art.populate('clientId', 'name logo email');
    await art.populate({
      path: 'designerId',
      populate: {
        path: 'userId',
        select: 'name email avatar',
      },
    });

    successResponse(res, { art }, 'Arte criada com sucesso', 201);
  } catch (error) {
    errorResponse(res, 'Erro ao criar arte', 500, error.message);
  }
};

// @desc    Atualizar arte
// @route   PUT /api/arts/:id
// @access  Private (Designer/Manager)
export const updateArt = async (req, res) => {
  try {
    const { name, description, category, tags, status, isTemplate, size } =
      req.body;

    const art = await Art.findById(req.params.id);

    if (!art) {
      return errorResponse(res, 'Arte não encontrada', 404);
    }

    // Verifica permissão
    if (req.user.role === 'designer') {
      const designer = await Designer.findOne({ userId: req.user.id });
      if (!designer || art.designerId.toString() !== designer._id.toString()) {
        return errorResponse(res, 'Sem permissão para editar esta arte', 403);
      }
    }

    // Se nova imagem foi enviada, deleta a antiga
    if (req.file) {
      await deleteOldImage(art.imageUrl);
      art.imageUrl = req.file.path;
      art.imagePublicId = req.file.filename;
      art.thumbnailUrl = await generateThumbnail(req.file.path);
      art.fileSize = req.file.size;
    }

    // Atualiza campos
    if (name) art.name = name;
    if (description !== undefined) art.description = description;
    if (category) art.category = category;
    if (tags) {
      art.tags =
        typeof tags === 'string' ? tags.split(',').map((t) => t.trim()) : tags;
    }
    if (status) art.status = status;
    if (isTemplate !== undefined) art.isTemplate = isTemplate;
    if (size) {
      art.size = size;
      // Atualiza dimensões baseado no tamanho
      const [width, height] = size.split('x').map(Number);
      art.dimensions = { width, height };
    }

    await art.save();
    await art.populate('clientId', 'name logo email');
    await art.populate({
      path: 'designerId',
      populate: {
        path: 'userId',
        select: 'name email avatar',
      },
    });

    successResponse(res, { art }, 'Arte atualizada com sucesso');
  } catch (error) {
    errorResponse(res, 'Erro ao atualizar arte', 500, error.message);
  }
};

// @desc    Deletar arte
// @route   DELETE /api/arts/:id
// @access  Private (Designer/Manager)
export const deleteArt = async (req, res) => {
  try {
    const art = await Art.findById(req.params.id);

    if (!art) {
      return errorResponse(res, 'Arte não encontrada', 404);
    }

    // Verifica permissão
    if (req.user.role === 'designer') {
      const designer = await Designer.findOne({ userId: req.user.id });
      if (!designer || art.designerId.toString() !== designer._id.toString()) {
        return errorResponse(res, 'Sem permissão para deletar esta arte', 403);
      }
    }

    // Deleta imagem do Cloudinary
    await deleteOldImage(art.imageUrl);

    // Atualiza contadores antes de deletar
    await Designer.findByIdAndUpdate(art.designerId, {
      $inc: { 'stats.artsCreated': -1 },
    });
    await Client.findByIdAndUpdate(art.clientId, {
      $inc: { artsCount: -1 },
    });

    // Deleta arte
    await art.deleteOne();

    successResponse(res, null, 'Arte deletada com sucesso');
  } catch (error) {
    errorResponse(res, 'Erro ao deletar arte', 500, error.message);
  }
};

// @desc    Download de arte
// @route   GET /api/arts/:id/download
// @access  Private
export const downloadArt = async (req, res) => {
  try {
    const art = await Art.findById(req.params.id);

    if (!art) {
      return errorResponse(res, 'Arte não encontrada', 404);
    }

    // Verifica permissão
    if (
      req.user.role === 'client' &&
      art.clientId.toString() !== req.user.clientId.toString()
    ) {
      return errorResponse(res, 'Sem permissão para baixar esta arte', 403);
    }

    // Incrementa contador de downloads
    await art.incrementDownloads();

    successResponse(res, {
      downloadUrl: art.imageUrl,
      name: art.name,
    });
  } catch (error) {
    errorResponse(res, 'Erro ao baixar arte', 500, error.message);
  }
};

// @desc    Obter categorias disponíveis
// @route   GET /api/arts/meta/categories
// @access  Private
export const getCategories = async (req, res) => {
  try {
    const categories = [
      { value: 'banner', label: 'Banner' },
      { value: 'story', label: 'Story' },
      { value: 'feed', label: 'Post Feed' },
      { value: 'menu', label: 'Cardápio' },
      { value: 'poster', label: 'Poster' },
      { value: 'logo', label: 'Logo' },
      { value: 'outros', label: 'Outros' },
    ];

    successResponse(res, { categories });
  } catch (error) {
    errorResponse(res, 'Erro ao obter categorias', 500, error.message);
  }
};

// @desc    Obter tamanhos disponíveis
// @route   GET /api/arts/meta/sizes
// @access  Private
export const getSizes = async (req, res) => {
  try {
    const sizes = [
      {
        value: '1080x1080',
        label: '1080x1080 (Quadrado)',
        width: 1080,
        height: 1080,
      },
      {
        value: '1350x1080',
        label: '1350x1080 (Retângulo)',
        width: 1350,
        height: 1080,
      },
      {
        value: '1920x1080',
        label: '1920x1080 (Full HD)',
        width: 1920,
        height: 1080,
      },
    ];

    successResponse(res, { sizes });
  } catch (error) {
    errorResponse(res, 'Erro ao obter tamanhos', 500, error.message);
  }
};

// @desc    Obter tags mais usadas
// @route   GET /api/arts/meta/popular-tags
// @access  Private
export const getPopularTags = async (req, res) => {
  try {
    const tags = await Art.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);

    successResponse(res, {
      tags: tags.map((t) => ({ name: t._id, count: t.count })),
    });
  } catch (error) {
    errorResponse(res, 'Erro ao obter tags populares', 500, error.message);
  }
};

// @desc    Obter estatísticas de artes
// @route   GET /api/arts/stats/overview
// @access  Private (Manager)
export const getArtsStats = async (req, res) => {
  try {
    const totalArts = await Art.countDocuments({ status: 'active' });
    const draftArts = await Art.countDocuments({ status: 'draft' });
    const archivedArts = await Art.countDocuments({ status: 'archived' });

    const byCategory = await Art.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const topDesigners = await Art.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$designerId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'designers',
          localField: '_id',
          foreignField: '_id',
          as: 'designer',
        },
      },
    ]);

    successResponse(res, {
      total: totalArts,
      draft: draftArts,
      archived: archivedArts,
      byCategory,
      topDesigners,
    });
  } catch (error) {
    errorResponse(res, 'Erro ao obter estatísticas', 500, error.message);
  }
};
