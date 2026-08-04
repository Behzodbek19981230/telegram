import { assertChatAccess, otherUserIdOf } from '../services/chat.service.js';
import { createMessage, markMessagesRead } from '../services/message.service.js';
import { isUserOnline } from './presence.js';

const typingTimers = new Map();

export function registerChatHandlers(io, socket) {
  socket.on('message:send', async (payload, ack) => {
    try {
      const { chatId, type, content, mediaUrl, mediaDuration, clientTempId } = payload || {};
      const chat = await assertChatAccess(chatId, socket.userId);
      const recipientId = otherUserIdOf(chat, socket.userId);

      const message = await createMessage({
        chatId,
        senderId: socket.userId,
        type: type || 'TEXT',
        content: content ?? null,
        mediaUrl: mediaUrl ?? null,
        mediaDuration: mediaDuration ?? null,
        status: isUserOnline(recipientId) ? 'DELIVERED' : 'SENT',
      });

      const outgoing = { ...message, clientTempId };
      io.to(chat.userAId).to(chat.userBId).emit('message:new', { message: outgoing });
      ack?.({ ok: true, message });
    } catch (err) {
      ack?.({ ok: false, error: err.message });
    }
  });

  socket.on('message:read', async (payload) => {
    try {
      const { chatId, messageIds } = payload || {};
      if (!Array.isArray(messageIds) || messageIds.length === 0) return;

      const chat = await assertChatAccess(chatId, socket.userId);
      await markMessagesRead(chatId, socket.userId, messageIds);

      io.to(chat.userAId).to(chat.userBId).emit('message:status', {
        chatId,
        messageIds,
        status: 'READ',
      });
    } catch {
      // silently ignore invalid read receipts
    }
  });

  socket.on('typing:start', async (payload) => {
    await relayTyping(io, socket, payload, true);
  });

  socket.on('typing:stop', async (payload) => {
    await relayTyping(io, socket, payload, false);
  });

  socket.on('disconnect', () => {
    const key = `${socket.userId}:${socket.id}`;
    const timer = typingTimers.get(key);
    if (timer) {
      clearTimeout(timer);
      typingTimers.delete(key);
    }
  });
}

async function relayTyping(io, socket, payload, isTyping) {
  const { chatId } = payload || {};
  if (!chatId) return;

  try {
    const chat = await assertChatAccess(chatId, socket.userId);
    const recipientId = otherUserIdOf(chat, socket.userId);

    io.to(recipientId).emit('typing:update', { chatId, userId: socket.userId, isTyping });

    const key = `${socket.userId}:${chatId}`;
    const existingTimer = typingTimers.get(key);
    if (existingTimer) clearTimeout(existingTimer);

    if (isTyping) {
      const timer = setTimeout(() => {
        io.to(recipientId).emit('typing:update', { chatId, userId: socket.userId, isTyping: false });
        typingTimers.delete(key);
      }, 4000);
      typingTimers.set(key, timer);
    } else {
      typingTimers.delete(key);
    }
  } catch {
    // ignore invalid typing events
  }
}
