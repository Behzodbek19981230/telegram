import { Phone, Video } from 'lucide-react';
import { Avatar } from '../common/Avatar.jsx';
import { BackButton } from '../common/BackButton.jsx';
import { ChatMenu } from './ChatMenu.jsx';
import { useCall } from '../../hooks/useCall.js';
import { formatLastSeen } from '../../utils/formatTime.js';

export function ChatHeader({ chat, typingText, onClearHistory, onDeleteChat }) {
  const { startCall, status } = useCall();
  const canCall = status === 'idle';
  const isGroup = chat.type === 'GROUP';

  const title = isGroup ? chat.name : chat.otherUser.displayName;
  const avatarSeed = isGroup ? chat.id : chat.otherUser.id;
  const avatarUrl = isGroup ? null : chat.otherUser.avatarUrl;
  const subtitle =
    typingText ||
    (isGroup
      ? `${chat.memberCount} a'zo`
      : formatLastSeen(chat.otherUser.lastSeenAt, chat.otherUser.isOnline));

  return (
    <header className="chat-header">
      <BackButton to="/chats" />
      <div className="chat-header__profile">
        <Avatar userId={avatarSeed} name={title} avatarUrl={avatarUrl} size={42} expandable />
        <div className="chat-header__info">
          <span className="chat-header__name">{title}</span>
          <span className={`chat-header__status ${typingText ? 'chat-header__status--typing' : ''}`}>
            {subtitle}
          </span>
        </div>
      </div>
      <div className="chat-header__actions">
        {!isGroup && (
          <>
            <button
              className="icon-button"
              disabled={!canCall}
              onClick={() => startCall(chat.id, chat.otherUser, 'audio')}
              aria-label="Ovozli qo‘ng‘iroq"
            >
              <Phone size={19} strokeWidth={2} />
            </button>
            <button
              className="icon-button"
              disabled={!canCall}
              onClick={() => startCall(chat.id, chat.otherUser, 'video')}
              aria-label="Video qo‘ng‘iroq"
            >
              <Video size={20} strokeWidth={2} />
            </button>
          </>
        )}
        <ChatMenu onClearHistory={onClearHistory} onDeleteChat={onDeleteChat} />
      </div>
    </header>
  );
}
