import { useRef } from 'react';
import { Forward } from 'lucide-react';
import { MessageBubbleText } from './MessageBubbleText.jsx';
import { MessageBubbleMedia } from './MessageBubbleMedia.jsx';
import { MessageBubbleVoice } from './MessageBubbleVoice.jsx';
import { MessageBubbleVideoNote } from './MessageBubbleVideoNote.jsx';
import { MessageBubbleFile } from './MessageBubbleFile.jsx';
import { MessageTicks } from './MessageTicks.jsx';
import { avatarColorFromId } from '../common/Avatar.jsx';
import { formatBubbleTime } from '../../utils/formatTime.js';
import { formatLastMessage } from '../../utils/formatLastMessage.js';

const CONTENT_BY_TYPE = {
  TEXT: MessageBubbleText,
  IMAGE: MessageBubbleMedia,
  VIDEO: MessageBubbleMedia,
  VOICE: MessageBubbleVoice,
  AUDIO: MessageBubbleVoice,
  VIDEO_NOTE: MessageBubbleVideoNote,
  FILE: MessageBubbleFile,
};

const LONG_PRESS_MS = 450;

function SenderLabel({ message }) {
  const name = message.sender?.displayName;
  if (!name) return null;
  return (
    <span className="bubble-sender" style={{ color: avatarColorFromId(message.senderId) }}>
      {name}
    </span>
  );
}

function ReplyQuote({ replyTo }) {
  if (!replyTo) return null;
  const color = avatarColorFromId(replyTo.sender?.id || 'x');
  return (
    <div className="bubble-reply-quote" style={{ borderColor: color }}>
      <span className="bubble-reply-quote__name" style={{ color }}>
        {replyTo.sender?.displayName}
      </span>
      <span className="bubble-reply-quote__text">
        {replyTo.deletedAt ? 'Xabar o‘chirilgan' : formatLastMessage(replyTo)}
      </span>
    </div>
  );
}

export function MessageBubble({
  message,
  isOwn,
  isGroup,
  groupPosition = 'single',
  continued = false,
  isSelectionMode,
  isSelected,
  onLongPress,
  onToggleSelect,
}) {
  const Content = CONTENT_BY_TYPE[message.type] || MessageBubbleText;
  const showSenderName = isGroup && !isOwn && (groupPosition === 'single' || groupPosition === 'first');
  const showTicks = isOwn && !isGroup;
  const pressTimerRef = useRef(null);
  const isMedia = message.type === 'IMAGE' || message.type === 'VIDEO';
  const isVideoNote = message.type === 'VIDEO_NOTE';
  const hasTail = groupPosition === 'single' || groupPosition === 'last';

  function handlePointerDown() {
    if (isSelectionMode) return;
    pressTimerRef.current = setTimeout(() => onLongPress(message.id), LONG_PRESS_MS);
  }

  function clearPressTimer() {
    clearTimeout(pressTimerRef.current);
  }

  const rowClassName = [
    'bubble-row',
    isOwn ? 'bubble-row--own' : '',
    continued ? 'bubble-row--continued' : '',
    isSelectionMode ? 'bubble-row--selectable' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const meta = (
    <span className="bubble-meta">
      <span className="bubble-time">{formatBubbleTime(message.createdAt)}</span>
      {showTicks && <MessageTicks status={message.status} pending={message.pending} />}
    </span>
  );

  const body = isVideoNote ? (
    <div className="bubble-video-note-wrap">
      <Content message={message} />
      <span className="bubble-video-note-wrap__meta">
        {formatBubbleTime(message.createdAt)}
        {showTicks && <MessageTicks status={message.status} pending={message.pending} />}
      </span>
    </div>
  ) : (
    <div
      className={`bubble bubble--${message.type.toLowerCase()} ${isOwn ? 'bubble--own' : 'bubble--other'} ${
        isMedia ? 'bubble--media' : ''
      } bubble--group-${groupPosition} ${hasTail ? 'bubble--has-tail' : ''}`}
    >
      {message.forwardedFromName && (
        <span className="bubble-forwarded">
          <Forward size={12} strokeWidth={2} /> Uzatilgan: {message.forwardedFromName}
        </span>
      )}
      {showSenderName && <SenderLabel message={message} />}
      <ReplyQuote replyTo={message.replyTo} />
      <div className={`bubble-body ${isMedia ? 'bubble-body--media' : ''}`}>
        <Content message={message} />
        {meta}
      </div>
    </div>
  );

  return (
    <div
      className={rowClassName}
      onPointerDown={handlePointerDown}
      onPointerUp={clearPressTimer}
      onPointerLeave={clearPressTimer}
      onPointerCancel={clearPressTimer}
    >
      {isSelectionMode && <span className={`bubble-checkbox ${isSelected ? 'bubble-checkbox--checked' : ''}`} />}
      {body}
      {isSelectionMode && (
        <div className="bubble-select-catcher" onClick={() => onToggleSelect(message.id)} />
      )}
    </div>
  );
}
