import { Router } from 'express';
import { getChallans, getChallanById, createChallan, confirmChallan } from '../controllers/challanController';
import { authenticateToken, authorizeRole } from '../middleware/authmiddleware';

const router = Router();

router.use(authenticateToken);

// All authenticated users can view challans
router.get('/', getChallans);
router.get('/:id', getChallanById);

// Only Sales and Admin can manage challans
router.post('/', authorizeRole(['ADMIN', 'SALES']), createChallan);
router.post('/:id/confirm', authorizeRole(['ADMIN', 'SALES']), confirmChallan);

export default router;
