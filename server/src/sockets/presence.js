import { setUserOnline } from '../services/user.service.js';

const onlineSockets = new Map();

export function isUserOnline(userId) {
  return onlineSockets.has(userId) && onlineSockets.get(userId).size > 0;
}

export async function registerSocket(io, userId, socketId) {
  const sockets = onlineSockets.get(userId) ?? new Set();
  const wasOffline = sockets.size === 0;
  sockets.add(socketId);
  onlineSockets.set(userId, sockets);

  if (wasOffline) {
    try {
      const user = await setUserOnline(userId, true);
      io.emit('presence:update', { userId, isOnline: true, lastSeenAt: user.lastSeenAt });
    } catch (err) {
      console.error('Failed to mark user online', userId, err.message);
    }
  }
}

export async function unregisterSocket(io, userId, socketId) {
  const sockets = onlineSockets.get(userId);
  if (!sockets) return;

  sockets.delete(socketId);
  if (sockets.size === 0) {
    onlineSockets.delete(userId);
    try {
      const user = await setUserOnline(userId, false);
      io.emit('presence:update', { userId, isOnline: false, lastSeenAt: user.lastSeenAt });
    } catch (err) {
      console.error('Failed to mark user offline', userId, err.message);
    }
  }
}
