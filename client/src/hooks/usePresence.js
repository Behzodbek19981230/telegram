import { useEffect, useState } from 'react';
import { useSocket } from './useSocket.js';

export function usePresence() {
  const socket = useSocket();
  const [presenceMap, setPresenceMap] = useState({});

  useEffect(() => {
    if (!socket) return;

    function handleUpdate({ userId, isOnline, lastSeenAt }) {
      setPresenceMap((prev) => ({ ...prev, [userId]: { isOnline, lastSeenAt } }));
    }

    socket.on('presence:update', handleUpdate);
    return () => socket.off('presence:update', handleUpdate);
  }, [socket]);

  return presenceMap;
}

export function withPresence(user, presenceMap) {
  if (!user) return user;
  const live = presenceMap[user.id];
  if (!live) return user;
  return { ...user, isOnline: live.isOnline, lastSeenAt: live.lastSeenAt };
}
