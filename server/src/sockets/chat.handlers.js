import {
  assertChatAccess,
  memberIdsOf,
  otherMemberIdOf,
  markChatRead,
  clearChatHistory,
  softDeleteMessages,
  getMessagesByIds,
} from '../services/chat.service.js';
import { createMessage } from '../services/message.service.js';
import { isUserOnline } from './presence.js';

const typingTimers = new Map();

function computeInitialStatus(chat, senderId) {
  if (chat.type !== 'DIRECT') return 'SENT';
  const recipientId = otherMemberIdOf(chat, senderId);
  return isUserOnline(recipientId) ? 'DELIVERED' : 'SENT';
}

export function registerChatHandlers(io, socket) {
  socket.on('message:send', async (payload, ack) => {
    try {
      const { chatId, type, content, mediaUrl, mediaDuration, clientTempId, replyToId } = payload || {};
      const chat = await assertChatAccess(chatId, socket.userId);

      let validReplyToId = null;
      if (replyToId) {
        const [replyTarget] = await getMessagesByIds([replyToId]);
        if (replyTarget && replyTarget.chatId === chatId) validReplyToId = replyToId;
      }

      const message = await createMessage({
        chatId,
        senderId: socket.userId,
        type: type || 'TEXT',
        content: content ?? null,
        mediaUrl: mediaUrl ?? null,
        mediaDuration: mediaDuration ?? null,
        status: computeInitialStatus(chat, socket.userId),
        replyToId: validReplyToId,
      });

      const outgoing = { ...message, clientTempId };
      io.to(memberIdsOf(chat)).emit('message:new', { message: outgoing });
      ack?.({ ok: true, message });
    } catch (err) {
      ack?.({ ok: false, error: err.message });
    }
  });

  socket.on('message:forward', async (payload, ack) => {
    try {
      const { targetChatId, messageIds } = payload || {};
      if (!targetChatId || !Array.isArray(messageIds) || messageIds.length === 0) {
        throw new Error('Invalid forward payload');
      }

      const targetChat = await assertChatAccess(targetChatId, socket.userId);
      const sourceMessages = await getMessagesByIds(messageIds);

      const sourceChatIds = [...new Set(sourceMessages.map((m) => m.chatId))];
      for (const cid of sourceChatIds) {
        await assertChatAccess(cid, socket.userId);
      }

      const status = computeInitialStatus(targetChat, socket.userId);
      let count = 0;
      for (const src of sourceMessages) {
        const message = await createMessage({
          chatId: targetChatId,
          senderId: socket.userId,
          type: src.type,
          content: src.content,
          mediaUrl: src.mediaUrl,
          mediaDuration: src.mediaDuration,
          status,
          forwardedFromUserId: src.senderId,
          forwardedFromName: src.sender.displayName,
        });
        count += 1;
        io.to(memberIdsOf(targetChat)).emit('message:new', { message });
      }

      ack?.({ ok: true, count });
    } catch (err) {
      ack?.({ ok: false, error: err.message });
    }
  });

  socket.on('message:delete', async (payload) => {
    try {
      const { chatId, messageIds } = payload || {};
      if (!chatId || !Array.isArray(messageIds) || messageIds.length === 0) return;

      const chat = await assertChatAccess(chatId, socket.userId);
      await softDeleteMessages(chatId, messageIds);
      io.to(memberIdsOf(chat)).emit('message:deleted', { chatId, messageIds });
    } catch {
      // ignore invalid delete requests
    }
  });

  socket.on('chat:clear', async (payload) => {
    try {
      const { chatId, alsoDeleteChat } = payload || {};
      if (!chatId) return;

      const chat = await assertChatAccess(chatId, socket.userId);
      const memberIds = memberIdsOf(chat);
      await clearChatHistory(chatId, !!alsoDeleteChat);
      io.to(memberIds).emit('chat:cleared', { chatId, alsoDeleteChat: !!alsoDeleteChat });
    } catch {
      // ignore invalid clear requests
    }
  });

  socket.on('chat:read', async (payload) => {
    try {
      const { chatId } = payload || {};
      const chat = await assertChatAccess(chatId, socket.userId);
      const messageIds = await markChatRead(chat, socket.userId);

      if (messageIds.length > 0) {
        io.to(memberIdsOf(chat)).emit('message:status', { chatId, messageIds, status: 'READ' });
      }
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
    const otherIds = memberIdsOf(chat).filter((id) => id !== socket.userId);
    if (otherIds.length === 0) return;

    io.to(otherIds).emit('typing:update', { chatId, userId: socket.userId, isTyping });

    const key = `${socket.userId}:${chatId}`;
    const existingTimer = typingTimers.get(key);
    if (existingTimer) clearTimeout(existingTimer);

    if (isTyping) {
      const timer = setTimeout(() => {
        io.to(otherIds).emit('typing:update', { chatId, userId: socket.userId, isTyping: false });
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
