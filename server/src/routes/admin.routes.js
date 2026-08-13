import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import {
  getStats,
  getUsers,
  getChats,
  getChatDetail,
  getDeletedMessages,
  getDeletedChats,
  deleteMessage,
  deleteChat,
  purgeAll,
} from '../controllers/admin.controller.js';

const router = Router();

router.use(requireAuth, requireAdmin);
router.get('/stats', getStats);
router.get('/users', getUsers);
router.get('/chats', getChats);
router.get('/chats/deleted', getDeletedChats);
router.get('/chats/:id', getChatDetail);
router.get('/messages/deleted', getDeletedMessages);
router.delete('/messages/:id', deleteMessage);
router.delete('/chats/:id', deleteChat);
router.post('/purge-all', purgeAll);

export default router;
