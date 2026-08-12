import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { fetchUsers } from '../api/users.api.js';
import { createGroupChat } from '../api/chats.api.js';
import { usePresence, withPresence } from '../hooks/usePresence.js';
import { Avatar } from '../components/common/Avatar.jsx';
import { PresenceDot } from '../components/common/PresenceDot.jsx';
import { Spinner } from '../components/common/Spinner.jsx';
import { BackButton } from '../components/common/BackButton.jsx';

export function CreateGroupPage() {
  const [step, setStep] = useState('members');
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [name, setName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const presenceMap = usePresence();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .finally(() => setIsLoading(false));
  }, []);

  const liveUsers = useMemo(() => users.map((u) => withPresence(u, presenceMap)), [users, presenceMap]);

  function toggleUser(userId) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim() || isCreating) return;
    setIsCreating(true);
    try {
      const chat = await createGroupChat(name, Array.from(selectedIds));
      navigate(`/chat/${chat.id}`, { replace: true });
    } finally {
      setIsCreating(false);
    }
  }

  if (step === 'name') {
    return (
      <div className="page">
        <header className="page-header">
          <BackButton onClick={() => setStep('members')} />
          <h1>Guruh nomi</h1>
          <span className="icon-button-spacer" />
        </header>

        <form className="group-name-form" onSubmit={handleCreate}>
          <input
            type="text"
            placeholder="Guruh nomini kiriting"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            autoFocus
          />
          <p className="group-name-form__hint">{selectedIds.size} a'zo tanlandi</p>
          <button type="submit" disabled={!name.trim() || isCreating}>
            {isCreating ? 'Yaratilmoqda...' : 'Guruh yaratish'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="page contacts-page">
      <header className="page-header">
        <BackButton to="/chats" />
        <h1>A'zolarni tanlang</h1>
        <button
          className="icon-button"
          disabled={selectedIds.size === 0}
          onClick={() => setStep('name')}
          aria-label="Keyingisi"
        >
          <ChevronRight size={22} strokeWidth={2} />
        </button>
      </header>

      <div className="page-body">
        {isLoading && (
          <div className="screen-center">
            <Spinner />
          </div>
        )}

        {!isLoading && liveUsers.length === 0 && (
          <div className="empty-state">
            <p>Boshqa foydalanuvchilar hali ro‘yxatdan o‘tmagan</p>
          </div>
        )}

        {liveUsers.map((user) => (
          <button key={user.id} type="button" className="contact-list-item" onClick={() => toggleUser(user.id)}>
            <div className="chat-list-item__avatar">
              <Avatar userId={user.id} name={user.displayName} avatarUrl={user.avatarUrl} size={48} />
              <PresenceDot isOnline={user.isOnline} />
            </div>
            <div className="contact-list-item__body">
              <span className="chat-list-item__name">{user.displayName}</span>
            </div>
            <span className={`member-checkbox ${selectedIds.has(user.id) ? 'member-checkbox--checked' : ''}`} />
          </button>
        ))}
      </div>
    </div>
  );
}
