import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { getChats, createChat, getMessages } from '../controllers/chats.controller.js';

const router = Router();

router.use(requireAuth);
router.get('/', getChats);
router.post('/', createChat);
router.get('/:chatId/messages', getMessages);

export default router;
