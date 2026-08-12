import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { fetchChats } from '../../api/chats.api.js';
import { Avatar } from '../common/Avatar.jsx';
import { Spinner } from '../common/Spinner.jsx';

export function ForwardDialog({ onSelect, onClose }) {
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchChats()
      .then(setChats)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="confirm-dialog-backdrop" onClick={onClose}>
      <div className="forward-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="forward-dialog__header">
          <h3>Kimga uzatish</h3>
          <button className="icon-button" onClick={onClose} aria-label="Yopish">
            <X size={18} strokeWidth={2} />
          </button>
        </div>
        <div className="forward-dialog__list">
          {isLoading && (
            <div className="screen-center">
              <Spinner />
            </div>
          )}
          {!isLoading &&
            chats.map((chat) => {
              const isGroup = chat.type === 'GROUP';
              const title = isGroup ? chat.name : chat.otherUser.displayName;
              const avatarSeed = isGroup ? chat.id : chat.otherUser.id;
              const avatarUrl = isGroup ? null : chat.otherUser.avatarUrl;
              return (
                <button
                  key={chat.id}
                  type="button"
                  className="forward-dialog__item"
                  onClick={() => onSelect(chat.id)}
                >
                  <Avatar userId={avatarSeed} name={title} avatarUrl={avatarUrl} size={40} expandable />
                  <span>{title}</span>
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
}
