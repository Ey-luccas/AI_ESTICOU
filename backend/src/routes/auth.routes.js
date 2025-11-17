import express from 'express';
import {
  register,
  login,
  getMe,
  logout,
} from '../controllers/auth.controller.js';
import { authorize, protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', protect, authorize('manager'), register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

export default router;
