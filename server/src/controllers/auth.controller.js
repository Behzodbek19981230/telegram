import { registerWithCredentials, verifyCredentialsLogin } from '../services/user.service.js';
import { signToken } from '../lib/jwt.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    isOnline: user.isOnline,
    isAdmin: user.isAdmin,
    lastSeenAt: user.lastSeenAt,
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    phone: user.phone ?? null,
    avatarUrl: user.avatarUrl ?? null,
    bio: user.bio ?? null,
    birthday: user.birthday ?? null,
  };
}

function mapRegistrationError(e) {
  if (e.message === 'Username already exists') {
    throw new ApiError(409, 'Bu username allaqachon ishlatilgan');
  }
  if (e.message === 'Phone number already exists') {
    throw new ApiError(409, 'Bu telefon raqam allaqachon ro‘yxatdan o‘tgan');
  }
  throw new ApiError(400, e.message || 'Ro‘yxatdan o‘tishda xatolik');
}

export const register = asyncHandler(async (req, res) => {
  const { username, password, firstName, lastName, phone } = req.body || {};

  if (!username || typeof username !== 'string' || !username.trim()) throw new ApiError(400, 'Username shart');
  if (!password || typeof password !== 'string' || password.length < 6) {
    throw new ApiError(400, 'Password kamida 6 ta belgi bo‘lishi kerak');
  }
  if (username.trim().length > 40) throw new ApiError(400, 'Username juda uzun');

  try {
    const user = await registerWithCredentials({ username, password, firstName, lastName, phone });
    const token = signToken({ sub: user.id, isAdmin: user.isAdmin });
    res.json({ token, user: publicUser(user) });
  } catch (e) {
    mapRegistrationError(e);
  }
});

export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || typeof username !== 'string' || !username.trim()) throw new ApiError(400, 'Username shart');
  if (!password || typeof password !== 'string') throw new ApiError(400, 'Password shart');

  const user = await verifyCredentialsLogin({ username, password });
  if (!user) throw new ApiError(401, 'Username yoki password noto‘g‘ri');

  const token = signToken({ sub: user.id, isAdmin: user.isAdmin });
  res.json({ token, user: publicUser(user) });
});
