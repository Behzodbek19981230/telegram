import { prisma } from '../lib/prisma.js';
import { ApiError } from '../utils/ApiError.js';

function normalizePair(userId1, userId2) {
  return userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];
}

export async function getOrCreateChat(userId1, userId2) {
  if (userId1 === userId2) {
    throw new ApiError(400, 'Cannot start a chat with yourself');
  }
  const [userAId, userBId] = normalizePair(userId1, userId2);

  return prisma.chat.upsert({
    where: { userAId_userBId: { userAId, userBId } },
    update: {},
    create: { userAId, userBId },
  });
}

export async function assertChatAccess(chatId, userId) {
  const chat = await prisma.chat.findUnique({ where: { id: chatId } });
  if (!chat) throw new ApiError(404, 'Chat not found');
  if (chat.userAId !== userId && chat.userBId !== userId) {
    throw new ApiError(403, 'Not a participant of this chat');
  }
  return chat;
}

function otherUserIdOf(chat, userId) {
  return chat.userAId === userId ? chat.userBId : chat.userAId;
}

export async function listChatsForUser(userId) {
  const chats = await prisma.chat.findMany({
    where: { OR: [{ userAId: userId }, { userBId: userId }] },
    orderBy: { updatedAt: 'desc' },
    include: {
      userA: true,
      userB: true,
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });

  return Promise.all(
    chats.map(async (chat) => {
      const otherUser = chat.userAId === userId ? chat.userB : chat.userA;
      const unreadCount = await prisma.message.count({
        where: { chatId: chat.id, senderId: { not: userId }, status: { not: 'READ' } },
      });

      return {
        id: chat.id,
        otherUser: {
          id: otherUser.id,
          username: otherUser.username,
          displayName: otherUser.displayName,
          isOnline: otherUser.isOnline,
          lastSeenAt: otherUser.lastSeenAt,
        },
        lastMessage: chat.messages[0] ?? null,
        unreadCount,
        updatedAt: chat.updatedAt,
      };
    })
  );
}

export async function listMessages(chatId, { cursor, limit = 30 }) {
  const messages = await prisma.message.findMany({
    where: { chatId },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = messages.length > limit;
  const page = hasMore ? messages.slice(0, limit) : messages;

  return {
    messages: page.reverse(),
    nextCursor: hasMore ? page[0].id : null,
  };
}

export { otherUserIdOf };
