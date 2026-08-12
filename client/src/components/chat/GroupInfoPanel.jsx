import { useEffect, useMemo, useState } from 'react';
import { Search, UserPlus } from 'lucide-react';
import { fetchChat, addGroupMembers } from '../../api/chats.api.js';
import { fetchUsers, searchUserByUsername } from '../../api/users.api.js';
import { usePresence, withPresence } from '../../hooks/usePresence.js';
import { Avatar } from '../common/Avatar.jsx';
import { PresenceDot } from '../common/PresenceDot.jsx';
import { BackButton } from '../common/BackButton.jsx';
import { Spinner } from '../common/Spinner.jsx';
import { formatLastSeen } from '../../utils/formatTime.js';

function MemberRow({ member, isSelf }) {
  return (
    <div className="group-member-row">
      <div className="chat-list-item__avatar">
        <Avatar userId={member.id} name={member.displayName} avatarUrl={member.avatarUrl} size={48} expandable />
        <PresenceDot isOnline={member.isOnline} />
      </div>
      <div className="group-member-row__body">
        <span className="chat-list-item__name">
          {member.displayName}
          {isSelf ? ' (Siz)' : ''}
        </span>
        <span className="contact-list-item__status">
          {formatLastSeen(member.lastSeenAt, member.isOnline)}
        </span>
      </div>
    </div>
  );
}

export function GroupInfoPanel({ chat, currentUserId, onClose, onMembersUpdated }) {
  const [view, setView] = useState('members');
  const [members, setMembers] = useState(chat.members || []);
  const [contacts, setContacts] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const presenceMap = usePresence();

  useEffect(() => {
    fetchChat(chat.id)
      .then((data) => setMembers(data.members || []))
      .finally(() => setIsLoading(false));
  }, [chat.id]);

  useEffect(() => {
    if (view !== 'add') return;
    fetchUsers().then(setContacts);
  }, [view]);

  useEffect(() => {
    const query = search.trim();
    if (view !== 'add' || !query) {
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
  }, [search, view]);

  const memberIds = useMemo(() => new Set(members.map((m) => m.id)), [members]);

  const liveMembers = useMemo(
    () => members.map((m) => withPresence(m, presenceMap)),
    [members, presenceMap]
  );

  const addCandidates = useMemo(() => {
    const query = search.trim();
    const fromContacts = contacts
      .filter((c) => !memberIds.has(c.id))
      .map((c) => withPresence(c, presenceMap));

    if (query && searchResult && !memberIds.has(searchResult.id)) {
      const found = withPresence(searchResult, presenceMap);
      if (!fromContacts.some((c) => c.id === found.id)) {
        return [found, ...fromContacts];
      }
    }

    return fromContacts;
  }, [contacts, memberIds, search, searchResult, presenceMap]);

  function toggleSelect(userId) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }

  async function handleAddMembers() {
    const ids = [...selectedIds];
    if (ids.length === 0) return;

    setIsAdding(true);
    try {
      const updated = await addGroupMembers(chat.id, ids);
      setMembers(updated.members || []);
      setSelectedIds(new Set());
      setSearch('');
      setView('members');
      onMembersUpdated(updated);
    } finally {
      setIsAdding(false);
    }
  }

  function handleBack() {
    if (view === 'add') {
      setView('members');
      setSelectedIds(new Set());
      setSearch('');
      return;
    }
    onClose();
  }

  const isAddView = view === 'add';

  return (
    <div className="group-info-panel">
      <header className="page-header">
        <BackButton onClick={handleBack} />
        <h1>{isAddView ? 'A\'zo qo\'shish' : chat.name}</h1>
        <span className="icon-button-spacer" />
      </header>

      {!isAddView && (
        <div className="group-info-hero">
          <Avatar userId={chat.id} name={chat.name} size={96} />
          <h2>{chat.name}</h2>
          <p>{members.length} a&apos;zo</p>
        </div>
      )}

      {isAddView && (
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
      )}

      {!isAddView && (
        <button type="button" className="group-info-add-btn" onClick={() => setView('add')}>
          <UserPlus size={20} strokeWidth={2} />
          A&apos;zo qo&apos;shish
        </button>
      )}

      <div className="page-body group-info-body">
        {isLoading && (
          <div className="screen-center">
            <Spinner />
          </div>
        )}

        {!isLoading && !isAddView && (
          <>
            <h3 className="group-info-section__title">{members.length} a&apos;zo</h3>
            {liveMembers.map((member) => (
              <MemberRow key={member.id} member={member} isSelf={member.id === currentUserId} />
            ))}
          </>
        )}

        {!isLoading && isAddView && isSearching && (
          <div className="screen-center">
            <Spinner />
          </div>
        )}

        {!isLoading && isAddView && !isSearching && addCandidates.length === 0 && (
          <div className="empty-state">
            <p>
              {search.trim()
                ? 'Foydalanuvchi topilmadi yoki allaqachon guruhda'
                : 'Qo\'shish uchun kontakt topilmadi. Username orqali qidiring.'}
            </p>
          </div>
        )}

        {!isLoading &&
          isAddView &&
          !isSearching &&
          addCandidates.map((user) => (
            <button
              key={user.id}
              type="button"
              className="contact-list-item"
              onClick={() => toggleSelect(user.id)}
            >
              <div className="chat-list-item__avatar">
                <Avatar userId={user.id} name={user.displayName} avatarUrl={user.avatarUrl} size={48} expandable />
                <PresenceDot isOnline={user.isOnline} />
              </div>
              <div className="contact-list-item__body">
                <span className="chat-list-item__name">{user.displayName}</span>
                <span className="contact-list-item__status">@{user.username}</span>
              </div>
              <span className={`member-checkbox ${selectedIds.has(user.id) ? 'member-checkbox--checked' : ''}`} />
            </button>
          ))}
      </div>

      {isAddView && selectedIds.size > 0 && (
        <div className="group-info-footer">
          <button type="button" className="group-info-footer__btn" disabled={isAdding} onClick={handleAddMembers}>
            {isAdding ? 'Qo\'shilmoqda...' : `${selectedIds.size} ta a\'zo qo'shish`}
          </button>
        </div>
      )}
    </div>
  );
}
