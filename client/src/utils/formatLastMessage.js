const PREVIEW_BY_TYPE = {
  IMAGE: '📷 Rasm',
  VIDEO: '📹 Video',
  AUDIO: '🎵 Audio',
  VOICE: '🎤 Ovozli xabar',
  VIDEO_NOTE: '⭕ Video xabar',
  FILE: '📎 Fayl',
};

export function formatLastMessage(message, { senderName } = {}) {
  if (!message) return 'Xabarlar yo‘q';

  const body = message.type === 'TEXT' ? message.content || '' : PREVIEW_BY_TYPE[message.type] || 'Xabar';
  return senderName ? `${senderName}: ${body}` : body;
}
