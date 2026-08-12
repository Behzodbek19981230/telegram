import crypto from 'node:crypto';
import { ApiError } from './ApiError.js';
import { env } from '../config/env.js';

function buildDataCheckString(params) {
  const keys = Object.keys(params).filter((k) => k !== 'hash');
  keys.sort();
  return keys.map((k) => `${k}=${params[k] ?? ''}`).join('\n');
}

export function verifyTelegramLoginData(params) {
  if (!env.telegramBotToken) {
    throw new ApiError(500, 'TELEGRAM_BOT_TOKEN missing in server env');
  }

  const hash = params.hash;
  const authDate = params.auth_date;

  if (!hash || typeof hash !== 'string') throw new ApiError(400, 'Missing Telegram hash');
  if (!authDate) throw new ApiError(400, 'Missing Telegram auth_date');

  const authDateNum = Number(authDate);
  if (!Number.isFinite(authDateNum)) throw new ApiError(400, 'Invalid auth_date');

  // Telegram recommends rejecting data older than 24 hours
  const ageSec = Math.floor(Date.now() / 1000) - authDateNum;
  if (ageSec < 0 || ageSec > 24 * 60 * 60) throw new ApiError(401, 'Telegram auth expired');

  const dataCheckString = buildDataCheckString(params);

  const secretKey = crypto.createHash('sha256').update(env.telegramBotToken).digest(); // SHA256(bot_token)
  const computedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  if (computedHash !== hash) {
    throw new ApiError(401, 'Invalid Telegram auth hash');
  }

  return {
    telegramId: String(params.id),
    username: params.username || null,
    firstName: params.first_name || null,
    lastName: params.last_name || null,
  };
}

