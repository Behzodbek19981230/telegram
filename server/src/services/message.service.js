import { prisma } from '../lib/prisma.js';
import { REPLY_INCLUDE, PUBLIC_USER_FIELDS } from './chat.service.js';

export async function createMessage({
  chatId,
  senderId,
  type,
  content,
  mediaUrl,
  mediaDuration,
  status,
  replyToId,
  forwardedFromUserId,
  forwardedFromName,
}) {
  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: {
        chatId,
        senderId,
        type,
        content,
        mediaUrl,
        mediaDuration,
        status,
        replyToId: replyToId ?? null,
        forwardedFromUserId: forwardedFromUserId ?? null,
        forwardedFromName: forwardedFromName ?? null,
      },
      include: { sender: { select: PUBLIC_USER_FIELDS }, ...REPLY_INCLUDE },
    }),
    prisma.chat.update({ where: { id: chatId }, data: { updatedAt: new Date() } }),
  ]);

  return message;
}
