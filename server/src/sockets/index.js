import { Server } from 'socket.io';
import { env } from '../config/env.js';
import { socketAuth } from './socketAuth.js';
import { registerSocket, unregisterSocket } from './presence.js';
import { registerChatHandlers } from './chat.handlers.js';
import { registerCallHandlers } from './call.handlers.js';

export function createSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: env.clientOrigin },
  });

  io.use(socketAuth);

  io.on('connection', async (socket) => {
    socket.join(socket.userId);
    await registerSocket(io, socket.userId, socket.id);

    registerChatHandlers(io, socket);
    registerCallHandlers(io, socket);

    socket.on('disconnect', () => {
      unregisterSocket(io, socket.userId, socket.id);
    });
  });

  return io;
}
