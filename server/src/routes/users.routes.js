import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { getMe, listUsers, searchUser, updateMe } from '../controllers/users.controller.js';

const router = Router();

router.use(requireAuth);
router.get('/me', getMe);
router.patch('/me', updateMe);
router.get('/search', searchUser);
router.get('/', listUsers);

export default router;
