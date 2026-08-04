import { prisma } from '../lib/prisma.js';

const PUBLIC_USER_FIELDS = {
  id: true,
  username: true,
  displayName: true,
  isOnline: true,
  lastSeenAt: true,
};

export async function findOrCreateUser(rawUsername) {
  const username = rawUsername.trim().toLowerCase();
  const displayName = rawUsername.trim();

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) return existing;

  return prisma.user.create({ data: { username, displayName } });
}

export async function getUserById(id) {
  return prisma.user.findUnique({ where: { id }, select: PUBLIC_USER_FIELDS });
}

export async function listOtherUsers(currentUserId) {
  return prisma.user.findMany({
    where: { id: { not: currentUserId } },
    select: PUBLIC_USER_FIELDS,
    orderBy: { displayName: 'asc' },
  });
}

export async function setUserOnline(userId, isOnline) {
  return prisma.user.update({
    where: { id: userId },
    data: { isOnline, lastSeenAt: new Date() },
    select: PUBLIC_USER_FIELDS,
  });
}
