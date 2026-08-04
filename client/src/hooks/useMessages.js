import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchMessages } from '../api/chats.api.js';
import { useSocket } from './useSocket.js';
import { useAuth } from './useAuth.js';

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
      setMessages(page);
      cursorRef.current = nextCursor;
      setHasMore(Boolean(nextCursor));
      setIsLoading(false);
    });
  }, [chatId]);

  const loadMore = useCallback(async () => {
    if (!cursorRef.current) return;
    const { messages: page, nextCursor } = await fetchMessages(chatId, cursorRef.current);
    setMessages((prev) => [...page, ...prev]);
    cursorRef.current = nextCursor;
    setHasMore(Boolean(nextCursor));
  }, [chatId]);

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

    socket.on('message:new', handleNewMessage);
    socket.on('message:status', handleStatus);
    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('message:status', handleStatus);
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

  const markRead = useCallback(
    (messageIds) => {
      if (!socket || !messageIds || messageIds.length === 0) return;
      socket.emit('message:read', { chatId, messageIds });
    },
    [socket, chatId]
  );

  return { messages, isLoading, hasMore, loadMore, sendMessage, markRead };
}
