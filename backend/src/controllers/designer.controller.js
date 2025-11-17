import Designer from '../models/Designer.js';
import User from '../models/User.js';
import Client from '../models/Client.js';
import {
  paginate,
  buildSearchQuery,
  successResponse,
  errorResponse,
} from '../utils/helpers.js';

// @desc    Listar todos os designers
// @route   GET /api/designers
// @access  Private (Manager)
export const getDesigners = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    // Build query com populate de User
    let designers = await Designer.find()
      .populate('userId', 'name email avatar isActive')
      .populate('assignedClients', 'name email')
      .sort({ createdAt: -1 });

    // Filtro por busca (no nome do user)
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      designers = designers.filter(
        (d) =>
          d.userId?.name?.match(searchRegex) ||
          d.userId?.email?.match(searchRegex),
      );
    }

    // Paginação manual (já temos os dados)
    const total = designers.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    designers = designers.slice(startIndex, endIndex);

    successResponse(res, {
      designers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    errorResponse(res, 'Erro ao listar designers', 500, error.message);
  }
};

// @desc    Obter designer por ID
// @route   GET /api/designers/:id
// @access  Private
export const getDesignerById = async (req, res) => {
  try {
    const designer = await Designer.findById(req.params.id)
      .populate('userId', 'name email avatar isActive')
      .populate('assignedClients', 'name email logo artsCount');

    if (!designer) {
      return errorResponse(res, 'Designer não encontrado', 404);
    }

    successResponse(res, { designer });
  } catch (error) {
    errorResponse(res, 'Erro ao buscar designer', 500, error.message);
  }
};

// @desc    Obter designer pelo userId
// @route   GET /api/designers/user/:userId
// @access  Private
export const getDesignerByUserId = async (req, res) => {
  try {
    const designer = await Designer.findOne({ userId: req.params.userId })
      .populate('userId', 'name email avatar')
      .populate('assignedClients', 'name email logo');

    if (!designer) {
      return errorResponse(res, 'Designer não encontrado', 404);
    }

    successResponse(res, { designer });
  } catch (error) {
    errorResponse(res, 'Erro ao buscar designer', 500, error.message);
  }
};

// @desc    Criar novo designer
// @route   POST /api/designers
// @access  Private (Manager)
export const createDesigner = async (req, res) => {
  try {
    const { userId, portfolio, bio, specialties, assignedClients } = req.body;

    // Verifica se usuário existe e é designer
    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(res, 'Usuário não encontrado', 404);
    }

    if (user.role !== 'designer') {
      return errorResponse(res, 'Usuário não é um designer', 400);
    }

    // Verifica se já existe perfil de designer para este user
    const designerExists = await Designer.findOne({ userId });
    if (designerExists) {
      return errorResponse(res, 'Designer já possui um perfil', 400);
    }

    // Cria designer
    const designer = await Designer.create({
      userId,
      portfolio,
      bio,
      specialties,
      assignedClients: assignedClients || [],
    });

    // Popula dados
    await designer.populate('userId', 'name email avatar');
    await designer.populate('assignedClients', 'name email');

    successResponse(res, { designer }, 'Designer criado com sucesso', 201);
  } catch (error) {
    errorResponse(res, 'Erro ao criar designer', 500, error.message);
  }
};

// @desc    Atualizar designer
// @route   PUT /api/designers/:id
// @access  Private (Manager/Own)
export const updateDesigner = async (req, res) => {
  try {
    const { portfolio, bio, specialties, isAvailable } = req.body;

    const designer = await Designer.findById(req.params.id);

    if (!designer) {
      return errorResponse(res, 'Designer não encontrado', 404);
    }

    // Verifica permissão (apenas o próprio ou manager)
    if (
      req.user.role !== 'manager' &&
      designer.userId.toString() !== req.user.id
    ) {
      return errorResponse(res, 'Sem permissão para editar este designer', 403);
    }

    // Atualiza campos
    if (portfolio !== undefined) designer.portfolio = portfolio;
    if (bio !== undefined) designer.bio = bio;
    if (specialties) designer.specialties = specialties;
    if (isAvailable !== undefined) designer.isAvailable = isAvailable;

    await designer.save();
    await designer.populate('userId', 'name email avatar');
    await designer.populate('assignedClients', 'name email');

    successResponse(res, { designer }, 'Designer atualizado com sucesso');
  } catch (error) {
    errorResponse(res, 'Erro ao atualizar designer', 500, error.message);
  }
};

// @desc    Atribuir cliente a designer
// @route   POST /api/designers/:id/assign-client
// @access  Private (Manager)
export const assignClientToDesigner = async (req, res) => {
  try {
    const { clientId } = req.body;

    const designer = await Designer.findById(req.params.id);
    if (!designer) {
      return errorResponse(res, 'Designer não encontrado', 404);
    }

    const client = await Client.findById(clientId);
    if (!client) {
      return errorResponse(res, 'Cliente não encontrado', 404);
    }

    await designer.assignClient(clientId);
    await designer.populate('assignedClients', 'name email logo');

    successResponse(res, { designer }, 'Cliente atribuído com sucesso');
  } catch (error) {
    errorResponse(res, 'Erro ao atribuir cliente', 500, error.message);
  }
};

// @desc    Remover cliente de designer
// @route   DELETE /api/designers/:id/unassign-client/:clientId
// @access  Private (Manager)
export const unassignClientFromDesigner = async (req, res) => {
  try {
    const { clientId } = req.params;

    const designer = await Designer.findById(req.params.id);
    if (!designer) {
      return errorResponse(res, 'Designer não encontrado', 404);
    }

    await designer.unassignClient(clientId);
    await designer.populate('assignedClients', 'name email logo');

    successResponse(res, { designer }, 'Cliente removido com sucesso');
  } catch (error) {
    errorResponse(res, 'Erro ao remover cliente', 500, error.message);
  }
};

// @desc    Deletar designer
// @route   DELETE /api/designers/:id
// @access  Private (Manager)
export const deleteDesigner = async (req, res) => {
  try {
    const designer = await Designer.findById(req.params.id);

    if (!designer) {
      return errorResponse(res, 'Designer não encontrado', 404);
    }

    await designer.deleteOne();

    successResponse(res, null, 'Designer deletado com sucesso');
  } catch (error) {
    errorResponse(res, 'Erro ao deletar designer', 500, error.message);
  }
};

// @desc    Atualizar último acesso
// @route   POST /api/designers/:id/update-access
// @access  Private (Own)
export const updateLastAccess = async (req, res) => {
  try {
    const designer = await Designer.findById(req.params.id);

    if (!designer) {
      return errorResponse(res, 'Designer não encontrado', 404);
    }

    await designer.updateLastAccess();

    successResponse(
      res,
      { lastAccessAt: designer.lastAccessAt },
      'Acesso atualizado',
    );
  } catch (error) {
    errorResponse(res, 'Erro ao atualizar acesso', 500, error.message);
  }
};
