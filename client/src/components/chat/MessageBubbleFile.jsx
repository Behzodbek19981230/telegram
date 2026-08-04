function fileNameFromUrl(url) {
  return url?.split('/').pop() ?? 'fayl';
}

export function MessageBubbleFile({ message }) {
  return (
    <a className="bubble-file" href={message.mediaUrl} download target="_blank" rel="noreferrer">
      <span className="bubble-file__icon">📎</span>
      <span className="bubble-file__name">{message.content || fileNameFromUrl(message.mediaUrl)}</span>
    </a>
  );
}
