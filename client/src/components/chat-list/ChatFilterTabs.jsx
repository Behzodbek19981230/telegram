const TABS = [
  { key: 'all', label: 'Barchasi' },
  { key: 'private', label: 'Private' },
  { key: 'groups', label: 'Groups' },
  { key: 'channels', label: 'Channels' },
  { key: 'unread', label: 'Unread' },
];

export function ChatFilterTabs({ active, onChange, unreadChatsCount }) {
  return (
    <div className="filter-tabs">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          className={`filter-tabs__tab ${active === tab.key ? 'filter-tabs__tab--active' : ''}`}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
          {tab.key === 'unread' && unreadChatsCount > 0 && (
            <span className="filter-tabs__badge">{unreadChatsCount}</span>
          )}
        </button>
      ))}
    </div>
  );
}
