import { Avatar } from '../common/Avatar.jsx';
import { PresenceDot } from '../common/PresenceDot.jsx';
import { formatLastSeen } from '../../utils/formatTime.js';

export function ContactListItem({ user, onSelect }) {
  return (
    <button className="contact-list-item" onClick={() => onSelect(user)}>
      <div className="chat-list-item__avatar">
        <Avatar userId={user.id} name={user.displayName} size={48} />
        <PresenceDot isOnline={user.isOnline} />
      </div>
      <div className="contact-list-item__body">
        <span className="chat-list-item__name">{user.displayName}</span>
        <span className="contact-list-item__status">{formatLastSeen(user.lastSeenAt, user.isOnline)}</span>
      </div>
    </button>
  );
}
