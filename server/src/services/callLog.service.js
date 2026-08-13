import { createMessage } from './message.service.js';

export async function createCallLogMessage(io, call, status, durationSec = 0) {
  const content = JSON.stringify({
    callType: call.callType,
    status,
    startedAt: call.startedAt.toISOString(),
    endedAt: new Date().toISOString(),
  });

  const message = await createMessage({
    chatId: call.chatId,
    senderId: call.callerId,
    type: 'CALL',
    content,
    mediaDuration: durationSec > 0 ? durationSec : null,
    status: 'SENT',
  });

  io.to(call.callerId).to(call.calleeId).emit('message:new', { message });
  return message;
}
