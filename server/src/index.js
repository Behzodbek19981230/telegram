import http from 'node:http';
import { createApp } from './app.js';
import { createSocketServer } from './sockets/index.js';
import { env } from './config/env.js';

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
});

const app = createApp();
const httpServer = http.createServer(app);

createSocketServer(httpServer);

httpServer.listen(env.port, () => {
  console.log(`Server listening on http://localhost:${env.port}`);
});
