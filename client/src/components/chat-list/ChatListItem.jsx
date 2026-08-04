import { useNavigate } from 'react-router-dom';
import { Avatar } from '../common/Avatar.jsx';
import { PresenceDot } from '../common/PresenceDot.jsx';
import { UnreadBadge } from './UnreadBadge.jsx';
import { formatListTime } from '../../utils/formatTime.js';
import { formatLastMessage } from '../../utils/formatLastMessage.js';

export function ChatListItem({ chat }) {
  const navigate = useNavigate();
  const { otherUser, lastMessage, unreadCount, updatedAt } = chat;

  return (
    <button className="chat-list-item" onClick={() => navigate(`/chat/${chat.id}`)}>
      <div className="chat-list-item__avatar">
        <Avatar userId={otherUser.id} name={otherUser.displayName} size={52} />
        <PresenceDot isOnline={otherUser.isOnline} />
      </div>
      <div className="chat-list-item__body">
        <div className="chat-list-item__row">
          <span className="chat-list-item__name">{otherUser.displayName}</span>
          <span className="chat-list-item__time">{formatListTime(updatedAt)}</span>
        </div>
        <div className="chat-list-item__row">
          <span className="chat-list-item__preview">{formatLastMessage(lastMessage)}</span>
          <UnreadBadge count={unreadCount} />
        </div>
      </div>
    </button>
  );
}
