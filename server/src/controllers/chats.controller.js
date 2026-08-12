import {
  getOrCreateDirectChat,
  createGroupChat,
  assertChatAccess,
  listChatsForUser,
  listMessages,
  getGroupChatDetails,
  addGroupMembers,
} from '../services/chat.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const getChats = asyncHandler(async (req, res) => {
  const chats = await listChatsForUser(req.user.id);
  res.json({ chats });
});

export const createChat = asyncHandler(async (req, res) => {
  const { otherUserId } = req.body;
  if (!otherUserId) throw new ApiError(400, 'otherUserId is required');

  const chat = await getOrCreateDirectChat(req.user.id, otherUserId);
  res.status(201).json({ chat });
});

export const createGroup = asyncHandler(async (req, res) => {
  const { name, memberIds } = req.body;
  if (!Array.isArray(memberIds)) throw new ApiError(400, 'memberIds must be an array');

  const chat = await createGroupChat(req.user.id, name, memberIds);
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

export const getChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const chat = await getGroupChatDetails(chatId, req.user.id);
  res.json({ chat });
});

export const addChatMembers = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { memberIds } = req.body;
  if (!Array.isArray(memberIds)) throw new ApiError(400, 'memberIds must be an array');

  const chat = await addGroupMembers(chatId, req.user.id, memberIds);
  res.json({ chat });
});
