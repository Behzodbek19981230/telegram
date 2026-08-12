import 'dotenv/config';

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function parseOrigins(raw) {
  const value = raw || 'http://localhost:5173';
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

export const env = {
  port: Number(process.env.PORT) || 4000,
  databaseUrl: required('DATABASE_URL'),
  jwtSecret: required('JWT_SECRET'),
  clientOrigins: parseOrigins(process.env.CLIENT_ORIGIN),
  clientOrigin: parseOrigins(process.env.CLIENT_ORIGIN)[0],
  adminUsername: process.env.ADMIN_USERNAME || null,
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || null,
};
