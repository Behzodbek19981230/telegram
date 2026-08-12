import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { fetchUsers, searchUserByUsername } from '../api/users.api.js';
import { createChat } from '../api/chats.api.js';
import { usePresence, withPresence } from '../hooks/usePresence.js';
import { ContactListItem } from '../components/contacts/ContactListItem.jsx';
import { Spinner } from '../components/common/Spinner.jsx';

export function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const presenceMap = usePresence();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers()
      .then(setContacts)
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const query = search.trim();
    if (!query) {
      setSearchResult(null);
      setIsSearching(false);
      return;
    }

    let cancelled = false;
    setIsSearching(true);

    searchUserByUsername(query)
      .then((user) => {
        if (!cancelled) setSearchResult(user);
      })
      .finally(() => {
        if (!cancelled) setIsSearching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [search]);

  const liveContacts = useMemo(
    () => contacts.map((u) => withPresence(u, presenceMap)),
    [contacts, presenceMap]
  );

  const displayedUsers = useMemo(() => {
    const query = search.trim();
    if (!query) return liveContacts;
    if (searchResult) return [withPresence(searchResult, presenceMap)];
    return [];
  }, [search, searchResult, liveContacts, presenceMap]);

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

  const isSearchActive = search.trim().length > 0;

  return (
    <div className="page contacts-page">
      <header className="page-header">
        <span className="icon-button-spacer" />
        <h1>Kontaktlar</h1>
        <span className="icon-button-spacer" />
      </header>

      <div className="contacts-search">
        <Search size={16} strokeWidth={2} className="contacts-search__icon" />
        <input
          type="search"
          className="contacts-search__input"
          placeholder="Username qidirish (@username)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoComplete="off"
        />
      </div>

      <div className="page-body">
        {isLoading && (
          <div className="screen-center">
            <Spinner />
          </div>
        )}

        {!isLoading && isSearchActive && isSearching && (
          <div className="screen-center">
            <Spinner />
          </div>
        )}

        {!isLoading && !isSearching && displayedUsers.length === 0 && (
          <div className="empty-state">
            <p>
              {isSearchActive
                ? 'Foydalanuvchi topilmadi. Username to‘liq va to‘g‘ri yozilganini tekshiring.'
                : 'Hali suhbatlar yo‘q. Username orqali qidiring.'}
            </p>
          </div>
        )}

        {!isLoading &&
          !isSearching &&
          displayedUsers.map((user) => (
            <ContactListItem key={user.id} user={user} onSelect={handleSelect} />
          ))}
      </div>
    </div>
  );
}
