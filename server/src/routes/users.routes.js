import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { getMe, listUsers } from '../controllers/users.controller.js';

const router = Router();

router.use(requireAuth);
router.get('/me', getMe);
router.get('/', listUsers);

export default router;
