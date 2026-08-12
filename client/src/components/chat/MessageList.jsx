import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble.jsx';
import { TypingIndicator } from './TypingIndicator.jsx';

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
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isOwn={message.senderId === currentUserId}
          isGroup={isGroup}
          isSelectionMode={isSelectionMode}
          isSelected={selectedIds?.has(message.id)}
          onLongPress={onLongPress}
          onToggleSelect={onToggleSelect}
        />
      ))}
      {isSomeoneTyping && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}
