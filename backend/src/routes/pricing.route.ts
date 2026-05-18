import express from 'express';
import {
  getPublicPrices,
  getAllPrices,
  createPrice,
  updatePrice,
  deletePrice,
} from '../controllers/pricing.controller';
import AuthMiddleware from '../middlewares/auth.middleware';
import RoleMiddleware from '../middlewares/role.middleware';
import { ROLES } from '../constants/role';
import { upload } from '../utils/multer';

const router = express.Router();

// Public routes
router.get('/public', getPublicPrices);

// Admin routes (Protected)
router.use(AuthMiddleware.isAuthenticated, RoleMiddleware.restrictTo(ROLES.ADMIN));
router.get('/', getAllPrices);
router.post('/', upload.single('image'), createPrice);
router.put('/:id', upload.single('image'), updatePrice);
router.delete('/:id', deletePrice);

export default router;
