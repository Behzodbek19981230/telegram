import { useNavigate } from 'react-router-dom';
import { Avatar } from '../common/Avatar.jsx';
import { useCall } from '../../hooks/useCall.js';
import { formatLastSeen } from '../../utils/formatTime.js';

export function ChatHeader({ otherUser, chatId, isOtherTyping }) {
  const navigate = useNavigate();
  const { startCall, status } = useCall();
  const canCall = status === 'idle';

  return (
    <header className="page-header chat-header">
      <button className="icon-button" onClick={() => navigate('/chats')} aria-label="Orqaga">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <Avatar userId={otherUser.id} name={otherUser.displayName} size={38} />
      <div className="chat-header__info">
        <span className="chat-header__name">{otherUser.displayName}</span>
        <span className={`chat-header__status ${isOtherTyping ? 'chat-header__status--typing' : ''}`}>
          {isOtherTyping ? 'yozmoqda...' : formatLastSeen(otherUser.lastSeenAt, otherUser.isOnline)}
        </span>
      </div>
      <div className="chat-header__actions">
        <button
          className="icon-button"
          disabled={!canCall}
          onClick={() => startCall(chatId, otherUser, 'audio')}
          aria-label="Ovozli qo‘ng‘iroq"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1l-2.2 2.2z" />
          </svg>
        </button>
        <button
          className="icon-button"
          disabled={!canCall}
          onClick={() => startCall(chatId, otherUser, 'video')}
          aria-label="Video qo‘ng‘iroq"
        >
          <svg viewBox="0 0 24 24" width="21" height="21" fill="currentColor">
            <path d="M17 10.5V8.5A1.5 1.5 0 0 0 15.5 7h-11A1.5 1.5 0 0 0 3 8.5v7A1.5 1.5 0 0 0 4.5 17h11a1.5 1.5 0 0 0 1.5-1.5v-2l4 2v-6l-4 2z" />
          </svg>
        </button>
      </div>
    </header>
  );
}
