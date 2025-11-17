import Client from '../models/Client.js';
import User from '../models/User.js';
import Designer from '../models/Designer.js';
import Notification from '../models/Notification.js';
import {
  paginate,
  buildSearchQuery,
  successResponse,
  errorResponse,
} from '../utils/helpers.js';

// @desc    Listar todos os clientes
// @route   GET /api/clients
// @access  Private (Manager/Designer)
export const getClients = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;

    // Build query
    let query = {};

    if (search) {
      query = buildSearchQuery(['name', 'email'], search);
    }

    if (status) {
      query.status = status;
    }

    // Execute query com paginação
    const clients = await paginate(
      Client.find(query).sort({ createdAt: -1 }),
      page,
      limit,
    );

    const total = await Client.countDocuments(query);

    successResponse(res, {
      clients,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    errorResponse(res, 'Erro ao listar clientes', 500, error.message);
  }
};

// @desc    Obter cliente por ID
// @route   GET /api/clients/:id
// @access  Private
export const getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id).populate(
      'userId',
      'name email avatar',
    );

    if (!client) {
      return errorResponse(res, 'Cliente não encontrado', 404);
    }

    successResponse(res, { client });
  } catch (error) {
    errorResponse(res, 'Erro ao buscar cliente', 500, error.message);
  }
};

// @desc    Criar novo cliente
// @route   POST /api/clients
// @access  Private (Manager)
export const createClient = async (req, res) => {
  try {
    const { name, email, phone, address, notes, settings, createUser, password } =
      req.body;

    // Verifica se email já existe
    const clientExists = await Client.findOne({ email });
    if (clientExists) {
      return errorResponse(res, 'Email já cadastrado', 400);
    }

    let userId = null;

    // Se solicitado, cria usuário para o cliente
    if (createUser) {
      const userExists = await User.findOne({ email });
      if (userExists) {
        return errorResponse(res, 'Já existe um usuário com este email', 400);
      }

      const tempPassword =
        password && password.length >= 6
          ? password
          : Math.random().toString(36).slice(-8);

      const user = await User.create({
        name,
        email,
        password: tempPassword,
        role: 'client',
      });

      userId = user._id;

      // TODO: Enviar email com senha temporária
      console.log(`Senha temporária para ${email}: ${tempPassword}`);
    }

    // Cria cliente
    const client = await Client.create({
      name,
      email,
      phone,
      address,
      notes,
      settings,
      userId,
    });

    // Atualiza clientId no usuário se foi criado
    if (userId) {
      await User.findByIdAndUpdate(userId, { clientId: client._id });
    }

    // Notifica todos os designers sobre o novo cliente
    const designers = await Designer.find().populate('userId', 'name email');
    const notificationPayloads = designers
      .filter((designer) => designer.userId)
      .map((designer) => ({
        userId: designer.userId._id,
        title: 'Novo cliente cadastrado',
        message: `${client.name} acabou de ser adicionado pelo gestor`,
        type: 'CLIENTE',
        link: `/clients/${client._id.toString()}`,
        meta: { clientId: client._id.toString() },
      }));

    if (notificationPayloads.length > 0) {
      await Notification.insertMany(notificationPayloads);
    }

    successResponse(res, { client }, 'Cliente criado com sucesso', 201);
  } catch (error) {
    errorResponse(res, 'Erro ao criar cliente', 500, error.message);
  }
};

// @desc    Atualizar cliente
// @route   PUT /api/clients/:id
// @access  Private (Manager)
export const updateClient = async (req, res) => {
  try {
    const { name, email, phone, address, status, notes, settings } = req.body;

    const client = await Client.findById(req.params.id);

    if (!client) {
      return errorResponse(res, 'Cliente não encontrado', 404);
    }

    // Verifica se email já está em uso por outro cliente
    if (email && email !== client.email) {
      const emailExists = await Client.findOne({
        email,
        _id: { $ne: req.params.id },
      });
      if (emailExists) {
        return errorResponse(res, 'Email já está em uso', 400);
      }
    }

    // Atualiza campos
    if (name) client.name = name;
    if (email) client.email = email;
    if (phone !== undefined) client.phone = phone;
    if (address) client.address = { ...client.address, ...address };
    if (status) client.status = status;
    if (notes !== undefined) client.notes = notes;
    if (settings) client.settings = { ...client.settings, ...settings };

    await client.save();

    successResponse(res, { client }, 'Cliente atualizado com sucesso');
  } catch (error) {
    errorResponse(res, 'Erro ao atualizar cliente', 500, error.message);
  }
};

// @desc    Deletar cliente
// @route   DELETE /api/clients/:id
// @access  Private (Manager)
export const deleteClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return errorResponse(res, 'Cliente não encontrado', 404);
    }

    // Remove userId do usuário associado
    if (client.userId) {
      await User.findByIdAndUpdate(client.userId, { clientId: null });
    }

    await client.deleteOne();

    successResponse(res, null, 'Cliente deletado com sucesso');
  } catch (error) {
    errorResponse(res, 'Erro ao deletar cliente', 500, error.message);
  }
};

// @desc    Obter estatísticas dos clientes
// @route   GET /api/clients/stats/overview
// @access  Private (Manager)
export const getClientsStats = async (req, res) => {
  try {
    const totalClients = await Client.countDocuments();
    const activeClients = await Client.countDocuments({ status: 'active' });
    const inactiveClients = await Client.countDocuments({
      status: 'inactive',
    });

    const topClients = await Client.find()
      .sort({ variationsCount: -1 })
      .limit(5)
      .select('name artsCount variationsCount');

    successResponse(res, {
      total: totalClients,
      active: activeClients,
      inactive: inactiveClients,
      topClients,
    });
  } catch (error) {
    errorResponse(res, 'Erro ao obter estatísticas', 500, error.message);
  }
};
