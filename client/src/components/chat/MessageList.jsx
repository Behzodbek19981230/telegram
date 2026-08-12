import { Fragment, useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble.jsx';
import { TypingIndicator } from './TypingIndicator.jsx';
import { getMessageGroupPosition } from '../../utils/messageGrouping.js';
import { formatChatDateDivider, isSameDay } from '../../utils/formatTime.js';

export function MessageList({
  messages,
  currentUserId,
  isGroup,
  isSomeoneTyping,
  hasMore,
  onLoadMore,
  isSelectionMode,
  selectedIds,
  onLongPress,
  onToggleSelect,
}) {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const prevScrollHeightRef = useRef(0);
  const isNearBottomRef = useRef(true);

  useEffect(() => {
    if (isNearBottomRef.current) {
      bottomRef.current?.scrollIntoView({ block: 'end' });
    }
  }, [messages.length, isSomeoneTyping]);

  function handleScroll() {
    const el = containerRef.current;
    if (!el) return;

    isNearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;

    if (el.scrollTop < 80 && hasMore) {
      prevScrollHeightRef.current = el.scrollHeight;
      onLoadMore().then(() => {
        requestAnimationFrame(() => {
          if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight - prevScrollHeightRef.current;
          }
        });
      });
    }
  }

  return (
    <div className="message-list" ref={containerRef} onScroll={handleScroll}>
      <div className="message-list__inner">
        {messages.map((message, index) => {
          const groupPosition = getMessageGroupPosition(messages, index);
          const continued = groupPosition === 'middle' || groupPosition === 'last';
          const showDateDivider =
            index === 0 || !isSameDay(message.createdAt, messages[index - 1].createdAt);

          return (
            <Fragment key={message.id}>
              {showDateDivider && (
                <div className="date-divider">
                  <span>{formatChatDateDivider(message.createdAt)}</span>
                </div>
              )}
              <MessageBubble
                message={message}
                isOwn={message.senderId === currentUserId}
                isGroup={isGroup}
                groupPosition={groupPosition}
                continued={continued}
                isSelectionMode={isSelectionMode}
                isSelected={selectedIds?.has(message.id)}
                onLongPress={onLongPress}
                onToggleSelect={onToggleSelect}
              />
            </Fragment>
          );
        })}
        {isSomeoneTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
