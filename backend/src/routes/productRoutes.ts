import { Router } from 'express';
import { getProducts, createProduct, updateProduct, getStockMovements, addStockMovement } from '../controllers/productController';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

// All authenticated users can view products
router.get('/', getProducts);
router.get('/:id/movements', getStockMovements);

// Only Admin and Warehouse can manage products and stock
router.post('/', authorizeRole(['ADMIN', 'WAREHOUSE']), createProduct);
router.put('/:id', authorizeRole(['ADMIN', 'WAREHOUSE']), updateProduct);
router.post('/:id/movements', authorizeRole(['ADMIN', 'WAREHOUSE']), addStockMovement);

export default router;
