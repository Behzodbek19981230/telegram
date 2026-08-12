import path from 'node:path';
import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/users.routes.js';
import chatsRoutes from './routes/chats.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.clientOrigins, credentials: true }));
  app.use(express.json());
  app.use('/uploads', express.static(UPLOAD_DIR));

  app.get('/api/health', (req, res) => res.json({ ok: true }));
  app.use('/api/auth', authRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/chats', chatsRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/admin', adminRoutes);

  app.use('/api', notFoundHandler);
  app.use(errorHandler);

  return app;
}
