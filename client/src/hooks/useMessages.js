import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchMessages } from '../api/chats.api.js';
import { useSocket } from './useSocket.js';
import { useAuth } from './useAuth.js';
import { filterHiddenMessages, hideMessagesLocally } from '../utils/hiddenMessages.js';

export function useMessages(chatId) {
  const socket = useSocket();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const cursorRef = useRef(null);

  useEffect(() => {
    if (!chatId) return;
    setMessages([]);
    setIsLoading(true);
    cursorRef.current = null;

    fetchMessages(chatId).then(({ messages: page, nextCursor }) => {
      setMessages(filterHiddenMessages(user?.id, chatId, page));
      cursorRef.current = nextCursor;
      setHasMore(Boolean(nextCursor));
      setIsLoading(false);
    });
  }, [chatId, user?.id]);

  const loadMore = useCallback(async () => {
    if (!cursorRef.current) return;
    const { messages: page, nextCursor } = await fetchMessages(chatId, cursorRef.current);
    setMessages((prev) => [...filterHiddenMessages(user?.id, chatId, page), ...prev]);
    cursorRef.current = nextCursor;
    setHasMore(Boolean(nextCursor));
  }, [chatId, user?.id]);

  useEffect(() => {
    if (!socket) return;

    function handleNewMessage({ message }) {
      if (message.chatId !== chatId) return;
      setMessages((prev) => {
        if (message.clientTempId) {
          const idx = prev.findIndex((m) => m.id === message.clientTempId);
          if (idx !== -1) {
            const updated = [...prev];
            updated[idx] = message;
            return updated;
          }
        }
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    }

    function handleStatus({ chatId: cId, messageIds, status }) {
      if (cId !== chatId) return;
      setMessages((prev) => prev.map((m) => (messageIds.includes(m.id) ? { ...m, status } : m)));
    }

    function handleDeleted({ chatId: cId, messageIds }) {
      if (cId !== chatId) return;
      setMessages((prev) => prev.filter((m) => !messageIds.includes(m.id)));
    }

    function handleCleared({ chatId: cId }) {
      if (cId !== chatId) return;
      setMessages([]);
    }

    socket.on('message:new', handleNewMessage);
    socket.on('message:status', handleStatus);
    socket.on('message:deleted', handleDeleted);
    socket.on('chat:cleared', handleCleared);
    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('message:status', handleStatus);
      socket.off('message:deleted', handleDeleted);
      socket.off('chat:cleared', handleCleared);
    };
  }, [socket, chatId]);

  const sendMessage = useCallback(
    (payload) => {
      if (!socket || !user) return;
      const clientTempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const optimistic = {
        id: clientTempId,
        chatId,
        senderId: user.id,
        type: payload.type,
        content: payload.content ?? null,
        mediaUrl: payload.mediaUrl ?? null,
        mediaDuration: payload.mediaDuration ?? null,
        status: 'SENT',
        createdAt: new Date().toISOString(),
        replyTo: payload.replyTo ?? null,
        pending: true,
      };
      setMessages((prev) => [...prev, optimistic]);

      socket.emit('message:send', { chatId, ...payload, clientTempId }, (ack) => {
        setMessages((prev) => {
          const idx = prev.findIndex((m) => m.id === clientTempId);
          if (idx === -1) return prev;
          if (!ack?.ok) return prev.filter((m) => m.id !== clientTempId);
          const updated = [...prev];
          updated[idx] = ack.message;
          return updated;
        });
      });
    },
    [socket, chatId, user]
  );

  const deleteMessages = useCallback(
    (messageIds, { forEveryone = false } = {}) => {
      if (messageIds.length === 0 || !user?.id) return;

      if (forEveryone) {
        setMessages((prev) => prev.filter((m) => !messageIds.includes(m.id)));
        if (!socket) return;
        socket.emit('message:delete', { chatId, messageIds, forEveryone: true });
        return;
      }

      hideMessagesLocally(user.id, chatId, messageIds);
      setMessages((prev) => prev.filter((m) => !messageIds.includes(m.id)));
    },
    [socket, chatId, user?.id]
  );

  const markRead = useCallback(() => {
    if (!socket || !chatId) return;
    socket.emit('chat:read', { chatId });
  }, [socket, chatId]);

  return { messages, isLoading, hasMore, loadMore, sendMessage, deleteMessages, markRead };
}
