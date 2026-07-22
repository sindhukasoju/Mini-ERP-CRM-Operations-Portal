import { Router } from 'express';
import { getCustomers, getCustomerById, createCustomer, updateCustomer } from '../controllers/customerController';
import { authenticateToken, authorizeRole } from '../middleware/authmiddleware';

const router = Router();

// Only Sales and Admin can manage customers
router.use(authenticateToken);
router.use(authorizeRole(['ADMIN', 'SALES']));

router.get('/', getCustomers);
router.get('/:id', getCustomerById);
router.post('/', createCustomer);
router.put('/:id', updateCustomer);

export default router;
