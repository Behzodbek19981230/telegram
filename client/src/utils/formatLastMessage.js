const PREVIEW_BY_TYPE = {
  IMAGE: '📷 Rasm',
  VIDEO: '📹 Video',
  AUDIO: '🎵 Audio',
  VOICE: '🎤 Ovozli xabar',
  VIDEO_NOTE: '⭕ Video xabar',
  FILE: '📎 Fayl',
};

export function formatLastMessage(message) {
  if (!message) return 'Xabarlar yo‘q';
  if (message.type === 'TEXT') return message.content || '';
  return PREVIEW_BY_TYPE[message.type] || 'Xabar';
}
