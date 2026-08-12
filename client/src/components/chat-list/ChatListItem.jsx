import { useNavigate } from 'react-router-dom';
import { Avatar } from '../common/Avatar.jsx';
import { PresenceDot } from '../common/PresenceDot.jsx';
import { UnreadBadge } from './UnreadBadge.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { formatListTime } from '../../utils/formatTime.js';
import { formatLastMessage } from '../../utils/formatLastMessage.js';

export function ChatListItem({ chat }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { lastMessage, unreadCount, updatedAt } = chat;
  const isGroup = chat.type === 'GROUP';

  const title = isGroup ? chat.name : chat.otherUser.displayName;
  const avatarSeed = isGroup ? chat.id : chat.otherUser.id;

  let senderName;
  if (isGroup && lastMessage) {
    senderName = lastMessage.senderId === user.id ? 'Siz' : lastMessage.sender?.displayName;
  }

  return (
    <button className="chat-list-item" onClick={() => navigate(`/chat/${chat.id}`)}>
      <div className="chat-list-item__avatar">
        <Avatar userId={avatarSeed} name={title} size={52} />
        {!isGroup && <PresenceDot isOnline={chat.otherUser.isOnline} />}
      </div>
      <div className="chat-list-item__body">
        <div className="chat-list-item__row">
          <span className="chat-list-item__name">{title}</span>
          <span className="chat-list-item__time">{formatListTime(updatedAt)}</span>
        </div>
        <div className="chat-list-item__row">
          <span className="chat-list-item__preview">{formatLastMessage(lastMessage, { senderName })}</span>
          <UnreadBadge count={unreadCount} />
        </div>
      </div>
    </button>
  );
}
