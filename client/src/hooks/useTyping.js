import { useCallback, useEffect, useRef, useState } from 'react';
import { useSocket } from './useSocket.js';

const IDLE_MS = 2500;

export function useTyping(chatId) {
  const socket = useSocket();
  const [typingUserIds, setTypingUserIds] = useState([]);
  const timerRef = useRef(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    if (!socket) return;

    function handleUpdate({ chatId: eventChatId, userId, isTyping }) {
      if (eventChatId !== chatId) return;
      setTypingUserIds((prev) => {
        if (isTyping) return prev.includes(userId) ? prev : [...prev, userId];
        return prev.filter((id) => id !== userId);
      });
    }

    socket.on('typing:update', handleUpdate);
    return () => socket.off('typing:update', handleUpdate);
  }, [socket, chatId]);

  useEffect(() => {
    setTypingUserIds([]);
    isTypingRef.current = false;
    clearTimeout(timerRef.current);
  }, [chatId]);

  const notifyTyping = useCallback(() => {
    if (!socket || !chatId) return;
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit('typing:start', { chatId });
    }
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socket.emit('typing:stop', { chatId });
    }, IDLE_MS);
  }, [socket, chatId]);

  const stopTyping = useCallback(() => {
    if (!socket || !chatId) return;
    clearTimeout(timerRef.current);
    if (isTypingRef.current) {
      isTypingRef.current = false;
      socket.emit('typing:stop', { chatId });
    }
  }, [socket, chatId]);

  return { typingUserIds, notifyTyping, stopTyping };
}
