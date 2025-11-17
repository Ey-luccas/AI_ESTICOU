import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Gera token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc    Registrar novo usuário
// @route   POST /api/auth/register
// @access  Public (ou apenas Manager em produção)
export const register = async (req, res) => {
  try {
    const { name, email, password, role, clientId } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Nome, email, senha e função são obrigatórios',
      });
    }

    // Verifica se usuário já existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email já cadastrado',
      });
    }

    // Cria novo usuário
    const user = await User.create({
      name,
      email,
      password,
      role,
      clientId: role === 'client' ? clientId : null,
    });

    // Gera token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          clientId: user.clientId,
        },
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao registrar usuário',
      error: error.message,
    });
  }
};

// @desc    Login de usuário
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validação básica
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, forneça email e senha',
      });
    }

    // Busca usuário e inclui senha
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas',
      });
    }

    // Verifica senha
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas',
      });
    }

    // Verifica se usuário está ativo
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Usuário inativo. Entre em contato com o administrador.',
      });
    }

    // Gera token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          clientId: user.clientId,
        },
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao fazer login',
      error: error.message,
    });
  }
};

// @desc    Obter usuário atual
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          clientId: user.clientId,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar dados do usuário',
      error: error.message,
    });
  }
};

// @desc    Logout (client-side - invalidar token)
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  // No JWT, o logout é feito no client-side removendo o token
  // Aqui apenas confirmamos a ação
  res.json({
    success: true,
    message: 'Logout realizado com sucesso',
  });
};
