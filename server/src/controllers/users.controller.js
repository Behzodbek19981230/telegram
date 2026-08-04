import { getUserById, listOtherUsers } from '../services/user.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const getMe = asyncHandler(async (req, res) => {
  const user = await getUserById(req.user.id);
  if (!user) throw new ApiError(404, 'User not found');
  res.json({ user });
});

export const listUsers = asyncHandler(async (req, res) => {
  const users = await listOtherUsers(req.user.id);
  res.json({ users });
});
