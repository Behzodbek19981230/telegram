export function MessageBubbleMedia({ message }) {
  if (message.type === 'IMAGE') {
    return <img className="bubble-media__image" src={message.mediaUrl} alt="" loading="lazy" />;
  }
  return <video className="bubble-media__video" src={message.mediaUrl} controls playsInline />;
}
