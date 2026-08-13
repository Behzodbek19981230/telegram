import { useCallback, useEffect, useState } from 'react';
import { fetchChats } from '../api/chats.api.js';
import { useSocket } from './useSocket.js';
import { useAuth } from './useAuth.js';

export function useChats() {
  const socket = useSocket();
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(() => {
    return fetchChats()
      .then(setChats)
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    if (!socket || !user) return;

    function handleNewMessage({ message }) {
      setChats((prev) => {
        const idx = prev.findIndex((c) => c.id === message.chatId);
        if (idx === -1) {
          reload();
          return prev;
        }
        const updated = [...prev];
        const [chat] = updated.splice(idx, 1);
        const next = {
          ...chat,
          lastMessage: message,
          updatedAt: message.createdAt,
          unreadCount: message.senderId !== user.id ? (chat.unreadCount || 0) + 1 : chat.unreadCount,
        };
        updated.unshift(next);
        return updated;
      });
    }

    function handleCleared({ chatId, alsoDeleteChat }) {
      setChats((prev) => {
        if (alsoDeleteChat) return prev.filter((c) => c.id !== chatId);
        return prev.map((c) => (c.id === chatId ? { ...c, lastMessage: null, unreadCount: 0 } : c));
      });
    }

    function handleCallMessage({ chatId, message }) {
      if (!message) return;
      handleNewMessage({ message });
    }

    socket.on('message:new', handleNewMessage);
    socket.on('chat:cleared', handleCleared);
    socket.on('call:finished', handleCallMessage);
    socket.on('call:ended', handleCallMessage);
    socket.on('call:rejected', handleCallMessage);
    socket.on('call:cancelled', handleCallMessage);
    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('chat:cleared', handleCleared);
      socket.off('call:finished', handleCallMessage);
      socket.off('call:ended', handleCallMessage);
      socket.off('call:rejected', handleCallMessage);
      socket.off('call:cancelled', handleCallMessage);
    };
  }, [socket, user, reload]);

  const clearUnread = useCallback((chatId) => {
    setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, unreadCount: 0 } : c)));
  }, []);

  return { chats, isLoading, reload, clearUnread };
}
