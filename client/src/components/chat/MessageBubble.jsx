import { MessageBubbleText } from './MessageBubbleText.jsx';
import { MessageBubbleMedia } from './MessageBubbleMedia.jsx';
import { MessageBubbleVoice } from './MessageBubbleVoice.jsx';
import { MessageBubbleVideoNote } from './MessageBubbleVideoNote.jsx';
import { MessageBubbleFile } from './MessageBubbleFile.jsx';
import { MessageTicks } from './MessageTicks.jsx';
import { formatBubbleTime } from '../../utils/formatTime.js';

const CONTENT_BY_TYPE = {
  TEXT: MessageBubbleText,
  IMAGE: MessageBubbleMedia,
  VIDEO: MessageBubbleMedia,
  VOICE: MessageBubbleVoice,
  AUDIO: MessageBubbleVoice,
  VIDEO_NOTE: MessageBubbleVideoNote,
  FILE: MessageBubbleFile,
};

export function MessageBubble({ message, isOwn }) {
  const Content = CONTENT_BY_TYPE[message.type] || MessageBubbleText;

  if (message.type === 'VIDEO_NOTE') {
    return (
      <div className={`bubble-row ${isOwn ? 'bubble-row--own' : ''}`}>
        <div className="bubble-video-note-wrap">
          <Content message={message} />
          <span className="bubble-video-note-wrap__meta">
            {formatBubbleTime(message.createdAt)}
            {isOwn && <MessageTicks status={message.status} pending={message.pending} />}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bubble-row ${isOwn ? 'bubble-row--own' : ''}`}>
      <div
        className={`bubble bubble--${message.type.toLowerCase()} ${isOwn ? 'bubble--own' : 'bubble--other'}`}
      >
        <Content message={message} />
        <span className="bubble-meta">
          <span className="bubble-time">{formatBubbleTime(message.createdAt)}</span>
          {isOwn && <MessageTicks status={message.status} pending={message.pending} />}
        </span>
      </div>
    </div>
  );
}
