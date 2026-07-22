import { Router } from 'express';
import { login } from '../controllers/authController';
import { authenticateToken } from '../middleware/authmiddleware';

const router = Router();

router.post('/login', login);

export default router;
