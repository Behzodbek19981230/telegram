export function UnreadBadge({ count }) {
  if (!count) return null;
  return <span className="unread-badge">{count > 99 ? '99+' : count}</span>;
}
