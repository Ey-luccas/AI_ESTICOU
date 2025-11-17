import express from 'express';
import {
  getArts,
  getArtById,
  createArt,
  updateArt,
  deleteArt,
  downloadArt,
  getCategories,
  getSizes,
  getPopularTags,
  getArtsStats,
} from '../controllers/art.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { handleArtUpload } from '../middleware/upload.js';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(protect);

// Rotas de metadata
router.get('/meta/categories', getCategories);
router.get('/meta/sizes', getSizes);
router.get('/meta/popular-tags', getPopularTags);

// Estatísticas (apenas manager)
router.get('/stats/overview', authorize('manager'), getArtsStats);

// Download
router.get('/:id/download', downloadArt);

// CRUD básico
router
  .route('/')
  .get(getArts)
  .post(authorize('designer', 'manager'), handleArtUpload, createArt);

router
  .route('/:id')
  .get(getArtById)
  .put(authorize('designer', 'manager'), handleArtUpload, updateArt)
  .delete(authorize('designer', 'manager'), deleteArt);

export default router;
