import { ApiError } from '../utils/ApiError.js';

export function requireAdmin(req, res, next) {
  if (!req.user?.isAdmin) {
    return next(new ApiError(403, 'Admin access required'));
  }
  next();
}
