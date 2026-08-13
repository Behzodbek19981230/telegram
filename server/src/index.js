import http from 'node:http';
import { createApp } from './app.js';
import { createSocketServer } from './sockets/index.js';
import { env } from './config/env.js';
import { ensureAdminAccount } from './services/user.service.js';

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
});

const app = createApp();
const httpServer = http.createServer(app);

createSocketServer(httpServer);

async function boot() {
  try {
    const admin = await ensureAdminAccount();
    if (admin) {
      console.log(`Admin account ready: ${admin.username}`);
    }
  } catch (err) {
    console.error('Failed to ensure admin account:', err);
  }

  httpServer.listen(env.port, () => {
    console.log(`Server listening on http://localhost:${env.port}`);
  });
}

boot();
