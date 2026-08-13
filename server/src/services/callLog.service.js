import { prisma } from '../lib/prisma.js';
import { createMessage } from './message.service.js';
import { memberIdsOf } from './chat.service.js';

export async function createCallLogMessage(io, call, status, durationSec = 0) {
  const startedAt =
    call.startedAt instanceof Date
      ? call.startedAt.toISOString()
      : call.startedAt || new Date().toISOString();

  const content = JSON.stringify({
    callType: call.callType,
    status,
    startedAt,
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

  const chat = await prisma.chat.findUnique({
    where: { id: call.chatId },
    include: { members: true },
  });

  if (chat) {
    const memberIds = memberIdsOf(chat);
    io.to(memberIds).emit('message:new', { message });
    io.to(memberIds).emit('call:finished', { chatId: call.chatId, message });
  }

  return message;
}
