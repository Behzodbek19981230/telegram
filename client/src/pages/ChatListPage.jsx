import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChats } from '../hooks/useChats.js';
import { usePresence, withPresence } from '../hooks/usePresence.js';
import { useAuth } from '../hooks/useAuth.js';
import { ChatListItem } from '../components/chat-list/ChatListItem.jsx';
import { Avatar } from '../components/common/Avatar.jsx';
import { Spinner } from '../components/common/Spinner.jsx';

export function ChatListPage() {
  const { chats, isLoading } = useChats();
  const presenceMap = usePresence();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const liveChats = useMemo(
    () => chats.map((c) => ({ ...c, otherUser: withPresence(c.otherUser, presenceMap) })),
    [chats, presenceMap]
  );

  return (
    <div className="page chat-list-page">
      <header className="page-header">
        <div className="page-header__user" onClick={logout} title="Chiqish">
          <Avatar userId={user.id} name={user.displayName} size={36} />
        </div>
        <h1>Suhbatlar</h1>
        <button className="icon-button" onClick={() => navigate('/contacts')} aria-label="Yangi suhbat">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      <div className="page-body">
        {isLoading && (
          <div className="screen-center">
            <Spinner />
          </div>
        )}

        {!isLoading && liveChats.length === 0 && (
          <div className="empty-state">
            <p>Hozircha suhbatlar yo‘q</p>
            <button onClick={() => navigate('/contacts')}>Yangi suhbat boshlash</button>
          </div>
        )}

        {liveChats.map((chat) => (
          <ChatListItem key={chat.id} chat={chat} />
        ))}
      </div>
    </div>
  );
}
