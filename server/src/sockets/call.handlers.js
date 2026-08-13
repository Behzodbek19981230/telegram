import crypto from 'node:crypto';
import { getUserById } from '../services/user.service.js';
import { assertChatAccess, otherMemberIdOf } from '../services/chat.service.js';
import { createCallLogMessage } from '../services/callLog.service.js';

const activeCalls = new Map();
const finalizedCallIds = new Set();

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

async function finalizeCall(io, callId, call, status, durationSec = 0) {
  if (finalizedCallIds.has(callId)) return null;

  finalizedCallIds.add(callId);
  activeCalls.delete(callId);

  let finalStatus = status;
  let finalDuration = durationSec;

  if (call.answeredAt && status !== 'rejected' && status !== 'busy') {
    finalStatus = 'completed';
    if (!finalDuration) {
      finalDuration = Math.max(0, Math.round((Date.now() - call.answeredAt) / 1000));
    }
  }

  try {
    const message = await createCallLogMessage(io, call, finalStatus, finalDuration);
    setTimeout(() => finalizedCallIds.delete(callId), 60_000);
    return message;
  } catch (err) {
    finalizedCallIds.delete(callId);
    console.error('Failed to create call log:', err);
    throw err;
  }
}

function notifyCallEnded(io, call, callId, message) {
  io.to([call.callerId, call.calleeId]).emit('call:ended', {
    callId,
    chatId: call.chatId,
    message,
  });
}

export function registerCallHandlers(io, socket) {
  socket.on('call:invite', async (payload, ack) => {
    try {
      const { chatId, toUserId, callType } = payload || {};
      if (!chatId || !toUserId || !['audio', 'video'].includes(callType)) {
        return ack?.({ ok: false, error: 'Invalid call invite' });
      }

      const chat = await assertChatAccess(chatId, socket.userId);
      const expectedCallee = otherMemberIdOf(chat, socket.userId);
      if (chat.type !== 'DIRECT' || expectedCallee !== toUserId) {
        return ack?.({ ok: false, error: 'Invalid call target' });
      }

      const callId = crypto.randomUUID();
      activeCalls.set(callId, {
        callerId: socket.userId,
        calleeId: toUserId,
        chatId,
        callType,
        status: 'ringing',
        startedAt: new Date(),
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
    call.answeredAt = Date.now();
    io.to(call.callerId).emit('call:accepted', { callId });
  });

  socket.on('call:reject', async ({ callId, reason } = {}, ack) => {
    const call = activeCalls.get(callId);
    if (!call || call.calleeId !== socket.userId) {
      return ack?.({ ok: false, error: 'Call not found' });
    }

    const status = reason === 'busy' ? 'busy' : 'rejected';

    try {
      const message = await finalizeCall(io, callId, call, status, 0);
      io.to(call.callerId).emit('call:rejected', {
        callId,
        reason,
        chatId: call.chatId,
        message,
      });
      ack?.({ ok: true, message });
    } catch (err) {
      ack?.({ ok: false, error: err.message });
    }
  });

  socket.on('call:cancel', async ({ callId } = {}, ack) => {
    const call = activeCalls.get(callId);
    if (!call || call.callerId !== socket.userId) {
      return ack?.({ ok: false, error: 'Call not found' });
    }

    try {
      const message = await finalizeCall(io, callId, call, 'missed', 0);
      io.to(call.calleeId).emit('call:cancelled', {
        callId,
        chatId: call.chatId,
        message,
      });
      ack?.({ ok: true, message });
    } catch (err) {
      ack?.({ ok: false, error: err.message });
    }
  });

  socket.on('call:end', async ({ callId } = {}, ack) => {
    const call = activeCalls.get(callId);
    if (!call) {
      return ack?.({ ok: false, error: 'Call not found' });
    }
    if (call.callerId !== socket.userId && call.calleeId !== socket.userId) {
      return ack?.({ ok: false, error: 'Forbidden' });
    }

    try {
      const status = call.answeredAt ? 'completed' : 'missed';
      const durationSec = call.answeredAt
        ? Math.max(0, Math.round((Date.now() - call.answeredAt) / 1000))
        : 0;
      const message = await finalizeCall(io, callId, call, status, durationSec);
      notifyCallEnded(io, call, callId, message);
      ack?.({ ok: true, message });
    } catch (err) {
      ack?.({ ok: false, error: err.message });
    }
  });

  socket.on('call:signal', ({ callId, kind, data } = {}) => {
    const call = activeCalls.get(callId);
    if (!call) return;
    if (call.callerId !== socket.userId && call.calleeId !== socket.userId) return;

    const targetId = otherParty(call, socket.userId);
    io.to(targetId).emit('call:signal', { callId, kind, data, fromUserId: socket.userId });
  });

  socket.on('disconnect', async () => {
    const found = findCallByParticipant(socket.userId);
    if (!found) return;

    const { callId, call } = found;

    try {
      const status = call.answeredAt ? 'completed' : 'missed';
      const durationSec = call.answeredAt
        ? Math.max(0, Math.round((Date.now() - call.answeredAt) / 1000))
        : 0;
      const message = await finalizeCall(io, callId, call, status, durationSec);
      if (message) {
        notifyCallEnded(io, call, callId, message);
      }
    } catch (err) {
      console.error('Failed to log call on disconnect:', err);
    }
  });
}
