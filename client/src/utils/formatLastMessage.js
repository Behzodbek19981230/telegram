import { formatCallPreview } from './formatCallMessage.js';

const PREVIEW_BY_TYPE = {
  IMAGE: '📷 Rasm',
  VIDEO: '📹 Video',
  AUDIO: '🎵 Audio',
  VOICE: '🎤 Ovozli xabar',
  VIDEO_NOTE: '⭕ Video xabar',
  FILE: '📎 Fayl',
  CALL: '📞 Qo‘ng‘iroq',
};

export function formatLastMessage(message, { senderName, isOwn } = {}) {
  if (!message) return 'Xabarlar yo‘q';

  if (message.type === 'CALL') {
    const body = formatCallPreview(message, { isOwn });
    return senderName ? `${senderName}: ${body}` : body;
  }

  const body = message.type === 'TEXT' ? message.content || '' : PREVIEW_BY_TYPE[message.type] || 'Xabar';
  return senderName ? `${senderName}: ${body}` : body;
}
