import { prisma } from '../lib/prisma.js';

export async function createMessage({ chatId, senderId, type, content, mediaUrl, mediaDuration, status }) {
  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: { chatId, senderId, type, content, mediaUrl, mediaDuration, status },
      include: { sender: { select: { id: true, username: true, displayName: true } } },
    }),
    prisma.chat.update({ where: { id: chatId }, data: { updatedAt: new Date() } }),
  ]);

  return message;
}

export async function markMessagesRead(chatId, readerId, messageIds) {
  const result = await prisma.message.updateMany({
    where: {
      chatId,
      id: { in: messageIds },
      senderId: { not: readerId },
      status: { not: 'READ' },
    },
    data: { status: 'READ' },
  });

  return result.count;
}

export async function markChatDelivered(chatId, recipientId) {
  const messages = await prisma.message.findMany({
    where: { chatId, senderId: { not: recipientId }, status: 'SENT' },
    select: { id: true },
  });
  if (messages.length === 0) return [];

  await prisma.message.updateMany({
    where: { id: { in: messages.map((m) => m.id) } },
    data: { status: 'DELIVERED' },
  });

  return messages.map((m) => m.id);
}
