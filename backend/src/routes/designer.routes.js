import express from 'express';
import {
  getDesigners,
  getDesignerById,
  getDesignerByUserId,
  createDesigner,
  updateDesigner,
  assignClientToDesigner,
  unassignClientFromDesigner,
  deleteDesigner,
  updateLastAccess,
} from '../controllers/designer.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(protect);

// Rotas especiais
router.get('/user/:userId', getDesignerByUserId);
router.post('/:id/assign-client', authorize('manager'), assignClientToDesigner);
router.delete(
  '/:id/unassign-client/:clientId',
  authorize('manager'),
  unassignClientFromDesigner,
);
router.post('/:id/update-access', updateLastAccess);

// CRUD básico
router
  .route('/')
  .get(authorize('manager'), getDesigners)
  .post(authorize('manager'), createDesigner);

router
  .route('/:id')
  .get(getDesignerById)
  .put(updateDesigner)
  .delete(authorize('manager'), deleteDesigner);

export default router;
