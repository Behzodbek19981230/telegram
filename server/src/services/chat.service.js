import { prisma } from '../lib/prisma.js';
import { ApiError } from '../utils/ApiError.js';

const PUBLIC_USER_FIELDS = {
  id: true,
  username: true,
  displayName: true,
  avatarUrl: true,
  isOnline: true,
  lastSeenAt: true,
};

const REPLY_INCLUDE = {
  replyTo: {
    select: {
      id: true,
      type: true,
      content: true,
      deletedAt: true,
      sender: { select: PUBLIC_USER_FIELDS },
    },
  },
};

export async function getOrCreateDirectChat(userId1, userId2) {
  if (userId1 === userId2) {
    throw new ApiError(400, 'Cannot start a chat with yourself');
  }

  const candidates = await prisma.chat.findMany({
    where: { type: 'DIRECT', deletedAt: null, members: { some: { userId: userId1 } } },
    include: { members: true },
  });
  const existing = candidates.find(
    (c) => c.members.length === 2 && c.members.some((m) => m.userId === userId2)
  );
  if (existing) return existing;

  return prisma.chat.create({
    data: {
      type: 'DIRECT',
      members: { create: [{ userId: userId1 }, { userId: userId2 }] },
    },
    include: { members: true },
  });
}

export async function createGroupChat(creatorId, name, memberIds) {
  const trimmedName = (name || '').trim();
  if (!trimmedName) throw new ApiError(400, 'Guruh nomi kiritilishi shart');
  if (trimmedName.length > 60) throw new ApiError(400, 'Guruh nomi juda uzun');

  const uniqueIds = Array.from(new Set([creatorId, ...(memberIds || [])]));
  if (uniqueIds.length < 2) {
    throw new ApiError(400, 'Guruhda kamida 1 ta boshqa a\'zo bo\'lishi kerak');
  }

  return prisma.chat.create({
    data: {
      type: 'GROUP',
      name: trimmedName,
      members: { create: uniqueIds.map((userId) => ({ userId })) },
    },
    include: { members: { include: { user: true } } },
  });
}

export async function assertChatAccess(chatId, userId) {
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: { members: true },
  });
  if (!chat || chat.deletedAt) throw new ApiError(404, 'Chat not found');
  if (!chat.members.some((m) => m.userId === userId)) {
    throw new ApiError(403, 'Not a participant of this chat');
  }
  return chat;
}

export function memberIdsOf(chat) {
  return chat.members.map((m) => m.userId);
}

export function otherMemberIdOf(chat, userId) {
  const other = chat.members.find((m) => m.userId !== userId);
  return other?.userId ?? null;
}

function toPublicUser(user) {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl ?? null,
    isOnline: user.isOnline,
    lastSeenAt: user.lastSeenAt,
  };
}

export async function listChatsForUser(userId) {
  const memberships = await prisma.chatMember.findMany({
    where: { userId, chat: { deletedAt: null } },
    include: {
      chat: {
        include: {
          members: { include: { user: true } },
          messages: {
            where: { deletedAt: null },
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: { sender: { select: PUBLIC_USER_FIELDS } },
          },
        },
      },
    },
  });

  const results = await Promise.all(
    memberships.map(async ({ chat, lastReadAt }) => {
      const unreadCount = await prisma.message.count({
        where: { chatId: chat.id, senderId: { not: userId }, deletedAt: null, createdAt: { gt: lastReadAt } },
      });

      const base = {
        id: chat.id,
        type: chat.type,
        lastMessage: chat.messages[0] ?? null,
        unreadCount,
        updatedAt: chat.updatedAt,
      };

      if (chat.type === 'DIRECT') {
        const otherMember = chat.members.find((m) => m.userId !== userId);
        return { ...base, otherUser: otherMember ? toPublicUser(otherMember.user) : null };
      }

      return {
        ...base,
        name: chat.name,
        memberCount: chat.members.length,
        members: chat.members.map((m) => toPublicUser(m.user)),
      };
    })
  );

  return results.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

export async function listContactUsers(userId) {
  const memberships = await prisma.chatMember.findMany({
    where: {
      userId,
      chat: { type: 'DIRECT' },
    },
    include: {
      chat: {
        include: {
          members: { include: { user: true } },
        },
      },
    },
  });

  const userMap = new Map();
  for (const { chat } of memberships) {
    const otherMember = chat.members.find((m) => m.userId !== userId);
    if (otherMember?.user) {
      userMap.set(otherMember.user.id, toPublicUser(otherMember.user));
    }
  }

  return [...userMap.values()].sort((a, b) => a.displayName.localeCompare(b.displayName));
}

export function formatGroupChat(chat) {
  return {
    id: chat.id,
    type: chat.type,
    name: chat.name,
    memberCount: chat.members.length,
    members: chat.members.map((m) => toPublicUser(m.user)),
    updatedAt: chat.updatedAt,
  };
}

export async function getGroupChatDetails(chatId, userId) {
  const chat = await assertChatAccess(chatId, userId);
  if (chat.type !== 'GROUP') throw new ApiError(400, 'Not a group chat');

  const full = await prisma.chat.findUnique({
    where: { id: chatId },
    include: { members: { include: { user: true } } },
  });

  return formatGroupChat(full);
}

export async function addGroupMembers(chatId, userId, memberIds) {
  const chat = await assertChatAccess(chatId, userId);
  if (chat.type !== 'GROUP') throw new ApiError(400, 'Not a group chat');

  const existingIds = new Set(chat.members.map((m) => m.userId));
  const newIds = [...new Set(memberIds)].filter((id) => id !== userId && !existingIds.has(id));

  if (newIds.length > 0) {
    await prisma.chatMember.createMany({
      data: newIds.map((uid) => ({ chatId, userId: uid })),
      skipDuplicates: true,
    });
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });
  }

  return getGroupChatDetails(chatId, userId);
}

export async function markChatRead(chat, userId) {
  const now = new Date();
  await prisma.chatMember.update({
    where: { chatId_userId: { chatId: chat.id, userId } },
    data: { lastReadAt: now },
  });

  if (chat.type !== 'DIRECT') return [];

  const affected = await prisma.message.findMany({
    where: {
      chatId: chat.id,
      senderId: { not: userId },
      status: { not: 'READ' },
      deletedAt: null,
      createdAt: { lte: now },
    },
    select: { id: true },
  });
  if (affected.length === 0) return [];

  await prisma.message.updateMany({
    where: { id: { in: affected.map((m) => m.id) } },
    data: { status: 'READ' },
  });
  return affected.map((m) => m.id);
}

export async function listMessages(chatId, { cursor, limit = 30 }) {
  const messages = await prisma.message.findMany({
    where: { chatId, deletedAt: null },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    include: { sender: { select: PUBLIC_USER_FIELDS }, ...REPLY_INCLUDE },
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = messages.length > limit;
  const page = hasMore ? messages.slice(0, limit) : messages;

  return {
    messages: page.reverse(),
    nextCursor: hasMore ? page[0].id : null,
  };
}

export async function clearChatHistory(chatId, alsoDeleteChat) {
  const now = new Date();
  await prisma.message.updateMany({
    where: { chatId, deletedAt: null },
    data: { deletedAt: now },
  });
  if (alsoDeleteChat) {
    await prisma.chat.update({ where: { id: chatId }, data: { deletedAt: now } });
  }
}

export async function softDeleteMessages(chatId, messageIds) {
  const result = await prisma.message.updateMany({
    where: { chatId, id: { in: messageIds }, deletedAt: null },
    data: { deletedAt: new Date() },
  });
  return result.count;
}

export async function getMessagesByIds(ids) {
  return prisma.message.findMany({
    where: { id: { in: ids }, deletedAt: null },
    include: { sender: { select: PUBLIC_USER_FIELDS } },
  });
}

export { REPLY_INCLUDE, PUBLIC_USER_FIELDS };
