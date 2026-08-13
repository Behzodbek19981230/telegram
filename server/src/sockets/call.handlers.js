import crypto from 'node:crypto';
import { getUserById } from '../services/user.service.js';
import { createCallLogMessage } from '../services/callLog.service.js';

// callId -> { callerId, calleeId, chatId, callType, status, startedAt, answeredAt? }
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

async function finishCall(io, callId, outcome) {
  const call = activeCalls.get(callId);
  if (!call) return;

  activeCalls.delete(callId);

  let status = outcome;
  let durationSec = 0;

  if (call.answeredAt) {
    durationSec = Math.max(0, Math.round((Date.now() - call.answeredAt) / 1000));
    status = 'completed';
  }

  try {
    await createCallLogMessage(io, call, status, durationSec);
  } catch (err) {
    console.error('Failed to create call log:', err);
  }
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

  socket.on('call:reject', async ({ callId, reason } = {}) => {
    const call = activeCalls.get(callId);
    if (!call || call.calleeId !== socket.userId) return;

    const status = reason === 'busy' ? 'busy' : 'rejected';
    activeCalls.delete(callId);
    io.to(call.callerId).emit('call:rejected', { callId, reason });

    try {
      await createCallLogMessage(io, call, status, 0);
    } catch (err) {
      console.error('Failed to create call log:', err);
    }
  });

  socket.on('call:cancel', async ({ callId } = {}) => {
    const call = activeCalls.get(callId);
    if (!call || call.callerId !== socket.userId) return;

    activeCalls.delete(callId);
    io.to(call.calleeId).emit('call:cancelled', { callId });

    try {
      await createCallLogMessage(io, call, 'missed', 0);
    } catch (err) {
      console.error('Failed to create call log:', err);
    }
  });

  socket.on('call:end', async ({ callId } = {}) => {
    const call = activeCalls.get(callId);
    if (!call) return;
    if (call.callerId !== socket.userId && call.calleeId !== socket.userId) return;

    activeCalls.delete(callId);
    io.to(call.callerId).to(call.calleeId).emit('call:ended', { callId });

    let durationSec = 0;
    if (call.answeredAt) {
      durationSec = Math.max(0, Math.round((Date.now() - call.answeredAt) / 1000));
    }

    try {
      await createCallLogMessage(io, call, call.answeredAt ? 'completed' : 'missed', durationSec);
    } catch (err) {
      console.error('Failed to create call log:', err);
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
    activeCalls.delete(callId);
    io.to(otherParty(call, socket.userId)).emit('call:ended', { callId });

    let durationSec = 0;
    let status = 'missed';
    if (call.answeredAt) {
      durationSec = Math.max(0, Math.round((Date.now() - call.answeredAt) / 1000));
      status = 'completed';
    }

    try {
      await createCallLogMessage(io, call, status, durationSec);
    } catch (err) {
      console.error('Failed to create call log:', err);
    }
  });
}
