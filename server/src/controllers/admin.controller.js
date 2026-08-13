import * as adminService from '../services/admin.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getStats = asyncHandler(async (req, res) => {
  res.json(await adminService.getStats());
});

export const getUsers = asyncHandler(async (req, res) => {
  res.json({ users: await adminService.listAllUsers() });
});

export const getChats = asyncHandler(async (req, res) => {
  const type = req.query.type === 'GROUP' || req.query.type === 'DIRECT' ? req.query.type : undefined;
  res.json({ chats: await adminService.listAllChats({ type }) });
});

export const getChatDetail = asyncHandler(async (req, res) => {
  res.json({ chat: await adminService.getChatDetail(req.params.id) });
});

export const getDeletedMessages = asyncHandler(async (req, res) => {
  res.json({ messages: await adminService.listDeletedMessages() });
});

export const getDeletedChats = asyncHandler(async (req, res) => {
  res.json({ chats: await adminService.listDeletedChats() });
});

export const deleteMessage = asyncHandler(async (req, res) => {
  await adminService.hardDeleteMessage(req.params.id);
  res.status(204).end();
});

export const deleteChat = asyncHandler(async (req, res) => {
  await adminService.hardDeleteChat(req.params.id);
  res.status(204).end();
});

export const purgeAll = asyncHandler(async (req, res) => {
  res.json(await adminService.purgeAllDeleted());
});
