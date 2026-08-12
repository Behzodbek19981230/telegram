import { verifyToken } from '../lib/jwt.js';
import { ApiError } from '../utils/ApiError.js';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return next(new ApiError(401, 'Missing authentication token'));
  }

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, isAdmin: !!payload.isAdmin };
    next();
  } catch {
    next(new ApiError(401, 'Invalid or expired token'));
  }
}
