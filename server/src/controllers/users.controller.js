import { getUserById, findOtherUserByExactUsername, updateUserProfile } from '../services/user.service.js';
import { listContactUsers } from '../services/chat.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const getMe = asyncHandler(async (req, res) => {
  const user = await getUserById(req.user.id);
  if (!user) throw new ApiError(404, 'User not found');
  res.json({ user });
});

export const updateMe = asyncHandler(async (req, res) => {
  try {
    const user = await updateUserProfile(req.user.id, req.body || {});
    res.json({ user });
  } catch (e) {
    throw new ApiError(400, e.message || 'Update failed');
  }
});

export const listUsers = asyncHandler(async (req, res) => {
  const users = await listContactUsers(req.user.id);
  res.json({ users });
});

export const searchUser = asyncHandler(async (req, res) => {
  const username = req.query.username;
  if (!username || !String(username).trim()) {
    return res.json({ user: null });
  }
  const user = await findOtherUserByExactUsername(req.user.id, username);
  res.json({ user });
});
