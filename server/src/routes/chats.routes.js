import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { getChats, createChat, createGroup, getMessages, getChat, addChatMembers } from '../controllers/chats.controller.js';

const router = Router();

router.use(requireAuth);
router.get('/', getChats);
router.post('/', createChat);
router.post('/group', createGroup);
router.get('/:chatId/messages', getMessages);
router.get('/:chatId', getChat);
router.post('/:chatId/members', addChatMembers);

export default router;
