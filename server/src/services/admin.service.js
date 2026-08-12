import { prisma } from '../lib/prisma.js';
import { deleteUploadedFileByUrl } from '../utils/deleteUploadedFile.js';

export async function getStats() {
  const [userCount, chatCount, messageCount, deletedChatCount, deletedMessageCount] = await Promise.all([
    prisma.user.count(),
    prisma.chat.count({ where: { deletedAt: null } }),
    prisma.message.count({ where: { deletedAt: null } }),
    prisma.chat.count({ where: { deletedAt: { not: null } } }),
    prisma.message.count({ where: { deletedAt: { not: null } } }),
  ]);
  return { userCount, chatCount, messageCount, deletedChatCount, deletedMessageCount };
}

export async function listAllUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      username: true,
      displayName: true,
      isOnline: true,
      isAdmin: true,
      createdAt: true,
      lastSeenAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });
}

function chatDisplayName(chat) {
  if (chat.type === 'GROUP') return chat.name;
  return chat.members.map((m) => m.user.displayName).join(' & ');
}

export async function listAllChats() {
  const chats = await prisma.chat.findMany({
    include: {
      members: { include: { user: { select: { id: true, displayName: true } } } },
      _count: { select: { messages: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return chats.map((chat) => ({
    id: chat.id,
    type: chat.type,
    name: chatDisplayName(chat),
    messageCount: chat._count.messages,
    deletedAt: chat.deletedAt,
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt,
  }));
}

export async function listDeletedMessages() {
  return prisma.message.findMany({
    where: { deletedAt: { not: null } },
    orderBy: { deletedAt: 'desc' },
    take: 200,
    include: {
      sender: { select: { id: true, displayName: true } },
      chat: {
        select: {
          id: true,
          type: true,
          name: true,
          members: { include: { user: { select: { id: true, displayName: true } } } },
        },
      },
    },
  });
}

export async function listDeletedChats() {
  const chats = await prisma.chat.findMany({
    where: { deletedAt: { not: null } },
    orderBy: { deletedAt: 'desc' },
    include: {
      members: { include: { user: { select: { id: true, displayName: true } } } },
      _count: { select: { messages: true } },
    },
  });

  return chats.map((chat) => ({
    id: chat.id,
    type: chat.type,
    name: chatDisplayName(chat),
    messageCount: chat._count.messages,
    deletedAt: chat.deletedAt,
  }));
}

export async function hardDeleteMessage(id) {
  const message = await prisma.message.findUnique({ where: { id } });
  if (!message) return;
  if (message.mediaUrl) await deleteUploadedFileByUrl(message.mediaUrl);
  await prisma.message.delete({ where: { id } });
}

export async function hardDeleteChat(id) {
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
