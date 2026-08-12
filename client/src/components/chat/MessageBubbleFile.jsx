import { resolveMediaUrl } from '../../config/api.js';

function fileNameFromUrl(url) {
  return url?.split('/').pop() ?? 'fayl';
}

export function MessageBubbleFile({ message }) {
  const href = resolveMediaUrl(message.mediaUrl);
  return (
    <a className="bubble-file" href={href} download target="_blank" rel="noreferrer">
      <span className="bubble-file__icon">📎</span>
      <span className="bubble-file__name">{message.content || fileNameFromUrl(message.mediaUrl)}</span>
    </a>
  );
}
