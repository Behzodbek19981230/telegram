import { createContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth.js';

export const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!token || !user) {
      setSocket((prev) => {
        prev?.disconnect();
        return null;
      });
      return;
    }

    const instance = io({ auth: { token } });
    setSocket(instance);

    return () => {
      instance.disconnect();
    };
  }, [token, user]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}
