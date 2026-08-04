import crypto from 'node:crypto';
import { getUserById } from '../services/user.service.js';

// callId -> { callerId, calleeId, chatId, callType, status }
const activeCalls = new Map();

function findCallByParticipant(userId) {
  for (const [callId, call] of activeCalls) {
    if (call.callerId === userId || call.calleeId === userId) {
      return { callId, call };
    }
  }
  return null;
}

function otherParty(call, userId) {
  return call.callerId === userId ? call.calleeId : call.callerId;
}

export function registerCallHandlers(io, socket) {
  socket.on('call:invite', async (payload, ack) => {
    try {
      const { chatId, toUserId, callType } = payload || {};
      if (!chatId || !toUserId || !['audio', 'video'].includes(callType)) {
        return ack?.({ ok: false, error: 'Invalid call invite' });
      }

      const callId = crypto.randomUUID();
      activeCalls.set(callId, {
        callerId: socket.userId,
        calleeId: toUserId,
        chatId,
        callType,
        status: 'ringing',
      });

      const fromUser = await getUserById(socket.userId);
      io.to(toUserId).emit('call:incoming', {
        callId,
        chatId,
        callType,
        fromUser: { id: fromUser.id, displayName: fromUser.displayName },
      });

      ack?.({ ok: true, callId });
    } catch (err) {
      ack?.({ ok: false, error: err.message });
    }
  });

  socket.on('call:accept', ({ callId } = {}) => {
    const call = activeCalls.get(callId);
    if (!call || call.calleeId !== socket.userId) return;

    call.status = 'active';
    io.to(call.callerId).emit('call:accepted', { callId });
  });

  socket.on('call:reject', ({ callId, reason } = {}) => {
    const call = activeCalls.get(callId);
    if (!call || call.calleeId !== socket.userId) return;

    activeCalls.delete(callId);
    io.to(call.callerId).emit('call:rejected', { callId, reason });
  });

  socket.on('call:cancel', ({ callId } = {}) => {
    const call = activeCalls.get(callId);
    if (!call || call.callerId !== socket.userId) return;

    activeCalls.delete(callId);
    io.to(call.calleeId).emit('call:cancelled', { callId });
  });

  socket.on('call:end', ({ callId } = {}) => {
    const call = activeCalls.get(callId);
    if (!call) return;
    if (call.callerId !== socket.userId && call.calleeId !== socket.userId) return;

    activeCalls.delete(callId);
    io.to(call.callerId).to(call.calleeId).emit('call:ended', { callId });
  });

  socket.on('call:signal', ({ callId, kind, data } = {}) => {
    const call = activeCalls.get(callId);
    if (!call) return;
    if (call.callerId !== socket.userId && call.calleeId !== socket.userId) return;

    const targetId = otherParty(call, socket.userId);
    io.to(targetId).emit('call:signal', { callId, kind, data, fromUserId: socket.userId });
  });

  socket.on('disconnect', () => {
    const found = findCallByParticipant(socket.userId);
    if (!found) return;

    const { callId, call } = found;
    activeCalls.delete(callId);
    io.to(otherParty(call, socket.userId)).emit('call:ended', { callId });
  });
}
