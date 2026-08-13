import { prisma } from '../lib/prisma.js';
import { deleteUploadedFileByUrl } from '../utils/deleteUploadedFile.js';
import { ApiError } from '../utils/ApiError.js';

export async function getStats() {
  const [userCount, chatCount, groupCount, messageCount, deletedChatCount, deletedMessageCount] =
    await Promise.all([
      prisma.user.count(),
      prisma.chat.count({ where: { deletedAt: null, type: 'DIRECT' } }),
      prisma.chat.count({ where: { deletedAt: null, type: 'GROUP' } }),
      prisma.message.count({ where: { deletedAt: null } }),
      prisma.chat.count({ where: { deletedAt: { not: null } } }),
      prisma.message.count({ where: { deletedAt: { not: null } } }),
    ]);
  return { userCount, chatCount, groupCount, messageCount, deletedChatCount, deletedMessageCount };
}

export async function listAllUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      username: true,
      displayName: true,
      phone: true,
      isOnline: true,
      isAdmin: true,
      createdAt: true,
      lastSeenAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });
}

function chatDisplayName(chat) {
  if (chat.type === 'GROUP') return chat.name || 'Guruh';
  return chat.members.map((m) => m.user.displayName).join(' & ') || 'Shaxsiy chat';
}

function mapChatSummary(chat) {
  const deletedMessageCount = chat.messages
    ? chat.messages.filter((m) => m.deletedAt).length
    : 0;

  return {
    id: chat.id,
    type: chat.type,
    name: chatDisplayName(chat),
    members: chat.members.map((m) => ({
      id: m.user.id,
      displayName: m.user.displayName,
      username: m.user.username,
    })),
    messageCount: chat._count.messages,
    deletedMessageCount,
    deletedAt: chat.deletedAt,
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt,
  };
}

export async function listAllChats({ type } = {}) {
  const chats = await prisma.chat.findMany({
    where: type ? { type } : undefined,
    include: {
      members: {
        include: {
          user: { select: { id: true, displayName: true, username: true } },
        },
      },
      messages: { select: { deletedAt: true } },
      _count: { select: { messages: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return chats.map(mapChatSummary);
}

export async function getChatDetail(id) {
  const chat = await prisma.chat.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          user: { select: { id: true, displayName: true, username: true, isAdmin: true } },
        },
      },
      messages: {
        orderBy: { createdAt: 'asc' },
        include: {
          sender: { select: { id: true, displayName: true, username: true } },
        },
      },
    },
  });

  if (!chat) throw new ApiError(404, 'Chat topilmadi');

  return {
    id: chat.id,
    type: chat.type,
    name: chatDisplayName(chat),
    deletedAt: chat.deletedAt,
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt,
    members: chat.members.map((m) => ({
      id: m.user.id,
      displayName: m.user.displayName,
      username: m.user.username,
      isAdmin: m.user.isAdmin,
    })),
    messages: chat.messages.map((m) => ({
      id: m.id,
      type: m.type,
      content: m.content,
      mediaUrl: m.mediaUrl,
      status: m.status,
      deletedAt: m.deletedAt,
      createdAt: m.createdAt,
      sender: m.sender,
    })),
  };
}

export async function listDeletedMessages() {
  const messages = await prisma.message.findMany({
    where: { deletedAt: { not: null } },
    orderBy: { deletedAt: 'desc' },
    take: 500,
    include: {
      sender: { select: { id: true, displayName: true, username: true } },
      chat: {
        select: {
          id: true,
          type: true,
          name: true,
          members: {
            include: { user: { select: { id: true, displayName: true, username: true } } },
          },
        },
      },
    },
  });

  return messages.map((m) => ({
    ...m,
    chat: m.chat ? { ...m.chat, name: chatDisplayName(m.chat) } : null,
  }));
}

export async function listDeletedChats() {
  const chats = await prisma.chat.findMany({
    where: { deletedAt: { not: null } },
    orderBy: { deletedAt: 'desc' },
    include: {
      members: {
        include: { user: { select: { id: true, displayName: true, username: true } } },
      },
      messages: { select: { deletedAt: true } },
      _count: { select: { messages: true } },
    },
  });

  return chats.map(mapChatSummary);
}

export async function hardDeleteMessage(id) {
  const message = await prisma.message.findUnique({ where: { id } });
  if (!message) throw new ApiError(404, 'Xabar topilmadi');
  if (message.mediaUrl) await deleteUploadedFileByUrl(message.mediaUrl);
  await prisma.message.delete({ where: { id } });
}

export async function hardDeleteChat(id) {
  const chat = await prisma.chat.findUnique({ where: { id }, select: { id: true } });
  if (!chat) throw new ApiError(404, 'Chat topilmadi');

  const messages = await prisma.message.findMany({
    where: { chatId: id },
    select: { id: true, mediaUrl: true },
  });
  await Promise.all(messages.filter((m) => m.mediaUrl).map((m) => deleteUploadedFileByUrl(m.mediaUrl)));

  await prisma.$transaction([
    prisma.message.deleteMany({ where: { chatId: id } }),
    prisma.chatMember.deleteMany({ where: { chatId: id } }),
    prisma.chat.delete({ where: { id } }),
  ]);
}

export async function purgeAllDeleted() {
  const orphanDeletedMessages = await prisma.message.findMany({
    where: { deletedAt: { not: null }, chat: { deletedAt: null } },
    select: { id: true, mediaUrl: true },
  });
  await Promise.all(
    orphanDeletedMessages.filter((m) => m.mediaUrl).map((m) => deleteUploadedFileByUrl(m.mediaUrl))
  );
  await prisma.message.deleteMany({ where: { id: { in: orphanDeletedMessages.map((m) => m.id) } } });

  const deletedChats = await prisma.chat.findMany({
    where: { deletedAt: { not: null } },
    select: { id: true },
  });
  for (const chat of deletedChats) {
    await hardDeleteChat(chat.id);
  }

  return { purgedMessages: orphanDeletedMessages.length, purgedChats: deletedChats.length };
}
