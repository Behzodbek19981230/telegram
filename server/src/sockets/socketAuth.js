import { verifyToken } from '../lib/jwt.js';

export function socketAuth(socket, next) {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Missing authentication token'));

  try {
    const payload = verifyToken(token);
    socket.userId = payload.sub;
    next();
  } catch {
    next(new Error('Invalid or expired token'));
  }
}
