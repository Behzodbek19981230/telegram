import { findOrCreateUser } from '../services/user.service.js';
import { signToken } from '../lib/jwt.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const login = asyncHandler(async (req, res) => {
  const { username } = req.body;

  if (!username || typeof username !== 'string' || !username.trim()) {
    throw new ApiError(400, 'Username is required');
  }
  if (username.trim().length > 40) {
    throw new ApiError(400, 'Username is too long');
  }

  const user = await findOrCreateUser(username);
  const token = signToken({ sub: user.id });

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      isOnline: user.isOnline,
      lastSeenAt: user.lastSeenAt,
    },
  });
});
