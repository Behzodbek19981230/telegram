import { getOrCreateChat, assertChatAccess, listChatsForUser, listMessages } from '../services/chat.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const getChats = asyncHandler(async (req, res) => {
  const chats = await listChatsForUser(req.user.id);
  res.json({ chats });
});

export const createChat = asyncHandler(async (req, res) => {
  const { otherUserId } = req.body;
  if (!otherUserId) throw new ApiError(400, 'otherUserId is required');

  const chat = await getOrCreateChat(req.user.id, otherUserId);
  res.status(201).json({ chat });
});

export const getMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  await assertChatAccess(chatId, req.user.id);

  const cursor = req.query.cursor || undefined;
  const limit = Math.min(Number(req.query.limit) || 30, 100);

  const result = await listMessages(chatId, { cursor, limit });
  res.json(result);
});
