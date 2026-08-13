import { useCallback, useEffect, useMemo, useState } from 'react';
import { Shield } from 'lucide-react';
import { BackButton } from '../components/common/BackButton.jsx';
import {
  fetchStats,
  fetchAllUsers,
  fetchAllChats,
  fetchChatDetail,
  fetchDeletedMessages,
  fetchDeletedChats,
  deleteMessagePermanently,
  deleteChatPermanently,
  purgeAllDeleted,
} from '../api/admin.api.js';
import { ConfirmDialog } from '../components/common/ConfirmDialog.jsx';
import { Spinner } from '../components/common/Spinner.jsx';
import { formatLastMessage } from '../utils/formatLastMessage.js';
import { resolveMediaUrl } from '../config/api.js';

const TABS = [
  { id: 'users', label: 'Foydalanuvchilar' },
  { id: 'direct', label: 'Chatlar' },
  { id: 'groups', label: 'Guruhlar' },
  { id: 'deleted', label: 'O‘chirilganlar' },
];

export function AdminPage() {
  const [tab, setTab] = useState('users');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [deletedMessages, setDeletedMessages] = useState([]);
  const [deletedChats, setDeletedChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const reload = useCallback(async () => {
    const [s, u, c, dm, dc] = await Promise.all([
      fetchStats(),
      fetchAllUsers(),
      fetchAllChats(),
      fetchDeletedMessages(),
      fetchDeletedChats(),
    ]);
    setStats(s);
    setUsers(u);
    setChats(c);
    setDeletedMessages(dm);
    setDeletedChats(dc);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const directChats = useMemo(() => chats.filter((c) => c.type === 'DIRECT'), [chats]);
  const groupChats = useMemo(() => chats.filter((c) => c.type === 'GROUP'), [chats]);

  async function openChat(chatId) {
    setChatLoading(true);
    try {
      const detail = await fetchChatDetail(chatId);
      setSelectedChat(detail);
    } finally {
      setChatLoading(false);
    }
  }

  async function refreshSelectedChat() {
    if (!selectedChat) return;
    const detail = await fetchChatDetail(selectedChat.id);
    setSelectedChat(detail);
  }

  function askDeleteMessage(message) {
    setConfirmAction({
      title: 'Xabarni bazadan o‘chirish',
      message: 'Bu amalni ortga qaytarib bo‘lmaydi. Xabar va fayl butunlay o‘chiriladi.',
      actions: [
        {
          label: 'O‘chirish',
          variant: 'danger',
          onClick: async () => {
            await deleteMessagePermanently(message.id);
            setConfirmAction(null);
            await reload();
            if (selectedChat) await refreshSelectedChat();
          },
        },
      ],
    });
  }

  function askDeleteChat(chat) {
    setConfirmAction({
      title: 'Chatni bazadan o‘chirish',
      message: `"${chat.name}" va barcha xabarlar/fayllar butunlay o‘chiriladi.`,
      actions: [
        {
          label: 'O‘chirish',
          variant: 'danger',
          onClick: async () => {
            await deleteChatPermanently(chat.id);
            setConfirmAction(null);
            setSelectedChat(null);
            await reload();
          },
        },
      ],
    });
  }

  function askPurgeAll() {
    setConfirmAction({
      title: 'Hammasini tozalash',
      message: 'Barcha soft-delete qilingan xabar va chatlar bazadan butunlay o‘chiriladi.',
      actions: [
        {
          label: 'Hammasini o‘chirish',
          variant: 'danger',
          onClick: async () => {
            await purgeAllDeleted();
            setConfirmAction(null);
            setSelectedChat(null);
            await reload();
          },
        },
      ],
    });
  }

  if (isLoading) {
    return (
      <div className="admin-page screen-center">
        <Spinner size={32} />
      </div>
    );
  }

  if (selectedChat) {
    return (
      <AdminChatDetail
        chat={selectedChat}
        loading={chatLoading}
        onBack={() => setSelectedChat(null)}
        onDeleteMessage={askDeleteMessage}
        onDeleteChat={() => askDeleteChat(selectedChat)}
        confirmAction={confirmAction}
        onCancelConfirm={() => setConfirmAction(null)}
      />
    );
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <BackButton to="/chats" />
        <h1>
          <Shield size={18} strokeWidth={2} className="admin-header__icon" /> Admin panel
        </h1>
        <button type="button" className="admin-purge-btn" onClick={askPurgeAll}>
          Hammasini tozalash
        </button>
      </header>

      <div className="admin-body">
        <div className="admin-stats">
          <StatCard label="Foydalanuvchilar" value={stats.userCount} />
          <StatCard label="Chatlar" value={stats.chatCount} />
          <StatCard label="Guruhlar" value={stats.groupCount ?? 0} />
          <StatCard label="Xabarlar" value={stats.messageCount} />
          <StatCard label="O‘chirilgan chatlar" value={stats.deletedChatCount} variant="danger" />
          <StatCard label="O‘chirilgan xabarlar" value={stats.deletedMessageCount} variant="danger" />
        </div>

        <div className="admin-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`admin-tab ${tab === t.id ? 'admin-tab--active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'users' && (
          <section className="admin-section">
            <h2>Barcha foydalanuvchilar</h2>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Ism</th>
                    <th>Username</th>
                    <th>Telefon</th>
                    <th>Rol</th>
                    <th>Holat</th>
                    <th>Ro‘yxatdan o‘tgan</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.displayName}</td>
                      <td>@{u.username}</td>
                      <td>{u.phone || '—'}</td>
                      <td>{u.isAdmin ? 'Admin' : 'Foydalanuvchi'}</td>
                      <td>{u.isOnline ? 'Onlayn' : 'Offlayn'}</td>
                      <td>{new Date(u.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {tab === 'direct' && (
          <ChatTable
            title="Shaxsiy chatlar"
            chats={directChats}
            onOpen={openChat}
            onDelete={askDeleteChat}
          />
        )}

        {tab === 'groups' && (
          <ChatTable
            title="Guruhlar"
            chats={groupChats}
            onOpen={openChat}
            onDelete={askDeleteChat}
          />
        )}

        {tab === 'deleted' && (
          <>
            <section className="admin-section">
              <h2>O‘chirilgan xabarlar</h2>
              {deletedMessages.length === 0 && <p className="admin-empty">O‘chirilgan xabarlar yo‘q</p>}
              {deletedMessages.map((m) => (
                <div key={m.id} className="admin-list-row">
                  <div className="admin-list-row__body">
                    <span className="admin-list-row__title">
                      {m.sender?.displayName} → {m.chat?.name || m.chat?.type}
                    </span>
                    <span className="admin-list-row__subtitle">{formatLastMessage(m)}</span>
                    <span className="admin-list-row__meta">
                      O‘chirilgan: {m.deletedAt ? new Date(m.deletedAt).toLocaleString() : '—'}
                    </span>
                  </div>
                  <button type="button" className="admin-link-btn" onClick={() => openChat(m.chat.id)}>
                    Chat
                  </button>
                  <button type="button" className="admin-delete-btn" onClick={() => askDeleteMessage(m)}>
                    Bazadan o‘chirish
                  </button>
                </div>
              ))}
            </section>

            <section className="admin-section">
              <h2>O‘chirilgan chatlar</h2>
              {deletedChats.length === 0 && <p className="admin-empty">O‘chirilgan chatlar yo‘q</p>}
              {deletedChats.map((c) => (
                <div key={c.id} className="admin-list-row">
                  <div className="admin-list-row__body">
                    <span className="admin-list-row__title">{c.name}</span>
                    <span className="admin-list-row__subtitle">
                      {c.type === 'GROUP' ? 'Guruh' : 'Shaxsiy'} · {c.messageCount} ta xabar
                    </span>
                  </div>
                  <button type="button" className="admin-link-btn" onClick={() => openChat(c.id)}>
                    Ochish
                  </button>
                  <button type="button" className="admin-delete-btn" onClick={() => askDeleteChat(c)}>
                    Bazadan o‘chirish
                  </button>
                </div>
              ))}
            </section>
          </>
        )}
      </div>

      {confirmAction && <ConfirmDialog {...confirmAction} onCancel={() => setConfirmAction(null)} />}
    </div>
  );
}

function ChatTable({ title, chats, onOpen, onDelete }) {
  return (
    <section className="admin-section">
      <h2>{title}</h2>
      {chats.length === 0 ? (
        <p className="admin-empty">Ro‘yxat bo‘sh</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nomi</th>
                <th>A’zolar</th>
                <th>Xabarlar</th>
                <th>O‘chirilgan</th>
                <th>Holati</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {chats.map((c) => (
                <tr key={c.id} className="admin-table__clickable" onClick={() => onOpen(c.id)}>
                  <td>{c.name}</td>
                  <td>{c.members?.map((m) => m.displayName).join(', ')}</td>
                  <td>{c.messageCount}</td>
                  <td>{c.deletedMessageCount || 0}</td>
                  <td>
                    <span className={`admin-badge ${c.deletedAt ? 'admin-badge--danger' : 'admin-badge--ok'}`}>
                      {c.deletedAt ? 'O‘chirilgan' : 'Faol'}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="admin-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(c);
                      }}
                    >
                      O‘chirish
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function AdminChatDetail({ chat, loading, onBack, onDeleteMessage, onDeleteChat, confirmAction, onCancelConfirm }) {
  const deletedCount = chat.messages.filter((m) => m.deletedAt).length;

  return (
    <div className="admin-page">
      <header className="admin-header">
        <BackButton onClick={onBack} />
        <h1>{chat.name}</h1>
        <button type="button" className="admin-purge-btn" onClick={onDeleteChat}>
          Chatni o‘chirish
        </button>
      </header>

      <div className="admin-body">
        <div className="admin-chat-meta">
          <span>{chat.type === 'GROUP' ? 'Guruh' : 'Shaxsiy chat'}</span>
          <span>·</span>
          <span>{chat.members.map((m) => m.displayName).join(', ')}</span>
          <span>·</span>
          <span>{chat.messages.length} xabar</span>
          {deletedCount > 0 && (
            <>
              <span>·</span>
              <span className="admin-meta-danger">{deletedCount} o‘chirilgan</span>
            </>
          )}
          {chat.deletedAt && (
            <>
              <span>·</span>
              <span className="admin-meta-danger">Chat o‘chirilgan</span>
            </>
          )}
        </div>

        {loading ? (
          <div className="screen-center">
            <Spinner size={28} />
          </div>
        ) : chat.messages.length === 0 ? (
          <p className="admin-empty">Xabarlar yo‘q</p>
        ) : (
          <div className="admin-messages">
            {chat.messages.map((m) => (
              <div
                key={m.id}
                className={`admin-message ${m.deletedAt ? 'admin-message--deleted' : ''}`}
              >
                <div className="admin-message__top">
                  <strong>{m.sender?.displayName || 'Noma’lum'}</strong>
                  <span>{new Date(m.createdAt).toLocaleString()}</span>
                  {m.deletedAt && <span className="admin-badge admin-badge--danger">O‘chirilgan</span>}
                </div>
                <div className="admin-message__body">{formatLastMessage(m)}</div>
                {m.mediaUrl && (
                  <a
                    className="admin-message__media"
                    href={resolveMediaUrl(m.mediaUrl)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Media ochish
                  </a>
                )}
                {m.deletedAt && (
                  <div className="admin-message__actions">
                    <span className="admin-list-row__meta">
                      Soft-delete: {new Date(m.deletedAt).toLocaleString()}
                    </span>
                    <button type="button" className="admin-delete-btn" onClick={() => onDeleteMessage(m)}>
                      Bazadan o‘chirish
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {confirmAction && <ConfirmDialog {...confirmAction} onCancel={onCancelConfirm} />}
    </div>
  );
}

function StatCard({ label, value, variant }) {
  return (
    <div className={`stat-card ${variant ? `stat-card--${variant}` : ''}`}>
      <span className="stat-card__value">{value}</span>
      <span className="stat-card__label">{label}</span>
    </div>
  );
}
