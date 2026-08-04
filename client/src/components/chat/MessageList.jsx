import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble.jsx';
import { TypingIndicator } from './TypingIndicator.jsx';

export function MessageList({ messages, currentUserId, isOtherTyping, hasMore, onLoadMore }) {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const prevScrollHeightRef = useRef(0);
  const isNearBottomRef = useRef(true);

  useEffect(() => {
    if (isNearBottomRef.current) {
      bottomRef.current?.scrollIntoView({ block: 'end' });
    }
  }, [messages.length, isOtherTyping]);

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
        <MessageBubble key={message.id} message={message} isOwn={message.senderId === currentUserId} />
      ))}
      {isOtherTyping && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}
