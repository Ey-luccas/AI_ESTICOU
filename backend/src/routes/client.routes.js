import express from 'express';
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getClientsStats,
} from '../controllers/client.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(protect);

// Estatísticas (apenas manager)
router.get('/stats/overview', authorize('manager'), getClientsStats);

// CRUD básico
router
  .route('/')
  .get(authorize('manager', 'designer'), getClients)
  .post(authorize('manager'), createClient);

router
  .route('/:id')
  .get(getClientById)
  .put(authorize('manager'), updateClient)
  .delete(authorize('manager'), deleteClient);

export default router;
