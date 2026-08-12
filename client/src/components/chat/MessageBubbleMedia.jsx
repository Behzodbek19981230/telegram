import { resolveMediaUrl } from '../../config/api.js';

export function MessageBubbleMedia({ message }) {
  const src = resolveMediaUrl(message.mediaUrl);
  if (message.type === 'IMAGE') {
    return <img className="bubble-media__image" src={src} alt="" loading="lazy" />;
  }
  return <video className="bubble-media__video" src={src} controls playsInline />;
}
