import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUsers } from '../api/users.api.js';
import { createChat } from '../api/chats.api.js';
import { usePresence, withPresence } from '../hooks/usePresence.js';
import { ContactListItem } from '../components/contacts/ContactListItem.jsx';
import { Spinner } from '../components/common/Spinner.jsx';

export function ContactsPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const presenceMap = usePresence();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .finally(() => setIsLoading(false));
  }, []);

  const liveUsers = useMemo(
    () => users.map((u) => withPresence(u, presenceMap)),
    [users, presenceMap]
  );

  async function handleSelect(user) {
    if (isCreating) return;
    setIsCreating(true);
    try {
      const chat = await createChat(user.id);
      navigate(`/chat/${chat.id}`, { replace: true });
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="page contacts-page">
      <header className="page-header">
        <span className="icon-button-spacer" />
        <h1>Kontaktlar</h1>
        <span className="icon-button-spacer" />
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
          <ContactListItem key={user.id} user={user} onSelect={handleSelect} />
        ))}
      </div>
    </div>
  );
}
