import express from 'express';
import {
  getVariations,
  getVariationById,
  generateVariation,
  checkGenerationStatus,
  approveVariation,
  addFeedback,
  deleteVariation,
  getCurrentUsage,
  getVariationsStats,
} from '../controllers/variation.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import {
  checkMonthlyLimit,
  aiGenerationLimiter,
} from '../middleware/rateLimiter.js';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(protect);

// Estatísticas (apenas manager)
router.get('/stats/overview', authorize('manager'), getVariationsStats);

// Uso atual (client)
router.get('/usage/current', authorize('client'), getCurrentUsage);

// Geração de variação (com limitadores)
router.post(
  '/generate',
  authorize('client'),
  aiGenerationLimiter,
  checkMonthlyLimit,
  generateVariation,
);

// Status de geração
router.get('/:id/status', checkGenerationStatus);

// Aprovação e feedback
router.post('/:id/approve', authorize('client'), approveVariation);
router.post('/:id/feedback', authorize('client'), addFeedback);

// CRUD básico
router.route('/').get(getVariations);

router.route('/:id').get(getVariationById).delete(deleteVariation);

export default router;
