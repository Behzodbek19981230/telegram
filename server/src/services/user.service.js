import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';
import bcrypt from 'bcryptjs';

const PUBLIC_USER_FIELDS = {
  id: true,
  username: true,
  displayName: true,
  firstName: true,
  lastName: true,
  phone: true,
  telegramId: true,
  avatarUrl: true,
  bio: true,
  birthday: true,
  isOnline: true,
  isAdmin: true,
  lastSeenAt: true,
};

function normalizeUsername(rawUsername) {
  const u = (rawUsername || '').trim();
  if (!u) return '';
  return u.toLowerCase();
}

function displayNameFromNames(firstName, lastName, fallback) {
  const f = (firstName || '').trim();
  const l = (lastName || '').trim();
  const combined = [f, l].filter(Boolean).join(' ').trim();
  return combined || (fallback || '').trim() || 'User';
}

function maybeMarkAdmin(user, username) {
  const shouldBeAdmin = env.adminUsername && username === env.adminUsername.trim().toLowerCase();
  if (shouldBeAdmin && !user.isAdmin) {
    return prisma.user.update({ where: { id: user.id }, data: { isAdmin: true } });
  }
  return user;
}

export async function getUserById(id) {
  return prisma.user.findUnique({ where: { id }, select: PUBLIC_USER_FIELDS });
}

export async function getUserByUsername(username) {
  const normalized = normalizeUsername(username);
  if (!normalized) return null;
  return prisma.user.findUnique({ where: { username: normalized }, select: { ...PUBLIC_USER_FIELDS, password: true, phone: true, telegramId: true, firstName: true, lastName: true } });
}

export async function getUserByPhone(phone) {
  const p = (phone || '').trim();
  if (!p) return null;
  return prisma.user.findUnique({ where: { phone: p }, select: { ...PUBLIC_USER_FIELDS, password: true, username: true } });
}

export async function getUserByTelegramId(telegramId) {
  const t = (telegramId || '').trim();
  if (!t) return null;
  return prisma.user.findUnique({ where: { telegramId: t }, select: { ...PUBLIC_USER_FIELDS, password: true, username: true, phone: true } });
}

export async function registerWithCredentials({ username, password, firstName, lastName, phone }) {
  const normalizedUsername = normalizeUsername(username);
  if (!normalizedUsername) throw new Error('Username is required');
  if (!password || typeof password !== 'string' || password.length < 6) throw new Error('Password must be at least 6 characters');

  const displayName = displayNameFromNames(firstName, lastName, username);
  const hashedPassword = await bcrypt.hash(password, 10);

  const existing = await prisma.user.findUnique({ where: { username: normalizedUsername } });
  if (existing) throw new Error('Username already exists');

  // phone unique constraint will also protect us, but give a nicer message:
  if (phone && typeof phone === 'string' && phone.trim()) {
    const existingPhone = await prisma.user.findUnique({ where: { phone: phone.trim() } });
    if (existingPhone) throw new Error('Phone number already exists');
  }

  const user = await prisma.user.create({
    data: {
      username: normalizedUsername,
      displayName,
      firstName: (firstName || '').trim(),
      lastName: (lastName || '').trim(),
      phone: phone && typeof phone === 'string' ? phone.trim() : null,
      password: hashedPassword,
    },
  });

  return maybeMarkAdmin(user, normalizedUsername);
}

export async function verifyCredentialsLogin({ username, password }) {
  const user = await getUserByUsername(username);
  if (!user) return null;
  if (!user.password) return null;
  const ok = await bcrypt.compare(password || '', user.password);
  if (!ok) return null;
  // return minimal fields for client:
  return user;
}

export async function telegramUpsert({ telegramId, username, firstName, lastName, phone }) {
  const tId = (telegramId || '').trim();
  if (!tId) throw new Error('telegramId is required');

  // If username isn't provided, derive a stable one from telegramId:
  const normalizedUsername = normalizeUsername(username) || `tg_${tId}`;
  const displayName = displayNameFromNames(firstName, lastName, normalizedUsername);

  let user = await prisma.user.findUnique({ where: { telegramId: tId }, select: { ...PUBLIC_USER_FIELDS, password: true, username: true, phone: true } });

  if (!user) {
    // If telegramId is new but username exists on another account, block it.
    const existingUsername = await prisma.user.findUnique({ where: { username: normalizedUsername } });
    if (existingUsername && existingUsername.telegramId !== tId) {
      throw new Error('Username already exists');
    }

    user = await prisma.user.create({
      data: {
        telegramId: tId,
        username: normalizedUsername,
        displayName,
        firstName: (firstName || '').trim(),
        lastName: (lastName || '').trim(),
        phone: phone && typeof phone === 'string' && phone.trim() ? phone.trim() : null,
      },
    });
    return maybeMarkAdmin(user, normalizedUsername);
  }

  // Update profile if user exists:
  user = await prisma.user.update({
    where: { id: user.id },
    data: {
      username: normalizedUsername,
      displayName,
      firstName: (firstName || '').trim(),
      lastName: (lastName || '').trim(),
      phone: phone && typeof phone === 'string' && phone.trim() ? phone.trim() : user.phone,
    },
    select: { ...PUBLIC_USER_FIELDS, password: true, username: true, phone: true, telegramId: true, firstName: true, lastName: true },
  });

  return maybeMarkAdmin(user, normalizedUsername);
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

export async function updateUserProfile(userId, data) {
  const { firstName, lastName, phone, username, bio, birthday, avatarUrl } = data;

  const updateData = {};

  if (firstName !== undefined) updateData.firstName = String(firstName).trim();
  if (lastName !== undefined) updateData.lastName = String(lastName).trim();
  if (bio !== undefined) updateData.bio = String(bio).trim() || null;
  if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl || null;

  if (phone !== undefined) {
    const p = phone ? String(phone).trim() : null;
    if (p) {
      const existing = await prisma.user.findFirst({ where: { phone: p, NOT: { id: userId } } });
      if (existing) throw new Error('Phone number already exists');
    }
    updateData.phone = p;
  }

  if (username !== undefined) {
    const normalized = normalizeUsername(username);
    if (!normalized) throw new Error('Username is required');
    const existing = await prisma.user.findFirst({ where: { username: normalized, NOT: { id: userId } } });
    if (existing) throw new Error('Username already exists');
    updateData.username = normalized;
  }

  if (birthday !== undefined) {
    if (!birthday) {
      updateData.birthday = null;
    } else {
      const d = new Date(birthday);
      if (Number.isNaN(d.getTime())) throw new Error('Invalid birthday');
      updateData.birthday = d;
    }
  }

  if (firstName !== undefined || lastName !== undefined) {
    const current = await prisma.user.findUnique({ where: { id: userId } });
    const f = firstName !== undefined ? updateData.firstName : current.firstName;
    const l = lastName !== undefined ? updateData.lastName : current.lastName;
    updateData.displayName = displayNameFromNames(f, l, current.username);
  }

  return prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: PUBLIC_USER_FIELDS,
  });
}
