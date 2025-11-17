import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.routes.js';
import clientRoutes from './routes/client.routes.js';
import designerRoutes from './routes/designer.routes.js';
import artRoutes from './routes/art.routes.js';
import variationRoutes from './routes/variation.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { ensureDefaultAdmin } from './utils/initializeAdmin.js';

// Carrega variáveis de ambiente
dotenv.config();

// Conecta ao MongoDB
connectDB().then(() => ensureDefaultAdmin());

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
});

// Configura Socket.io
setupSocketIO(io);

// Exporta io para uso em outros módulos
app.set('io', io);

// Middlewares
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiter global
app.use('/api/', apiLimiter);

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/designers', designerRoutes);
app.use('/api/arts', artRoutes);
app.use('/api/variations', variationRoutes);
app.use('/api/notifications', notificationRoutes);

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API Lua Crescente rodando!',
    timestamp: new Date().toISOString(),
  });
});

// Rota de teste da OpenAI
app.get('/api/openai/test', async (req, res) => {
  try {
    const openaiService = (await import('./services/openai.service.js'))
      .default;
    const result = await openaiService.testConnection();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao testar conexão OpenAI',
      error: error.message,
    });
  }
});

// Tratamento de erro 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada',
  });
});

// Tratamento de erros global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📝 Ambiente: ${process.env.NODE_ENV}`);
  console.log(`🔌 WebSocket ativo`);
});
