const PALETTE_SIZE = 5;

function paletteIndexFromId(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return (Math.abs(hash) % PALETTE_SIZE) + 1;
}

export function avatarColorFromId(id) {
  return `var(--tg-avatar-${paletteIndexFromId(id || 'x')})`;
}

function initialsFromName(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function Avatar({ userId, name, avatarUrl, size = 48, className = '' }) {
  const style = {
    width: size,
    height: size,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 600,
    fontSize: size * 0.4,
    background: avatarColorFromId(userId || name),
    flexShrink: 0,
    userSelect: 'none',
    overflow: 'hidden',
  };

  if (avatarUrl) {
    return (
      <div className={`avatar ${className}`} style={style}>
        <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    );
  }

  return (
    <div className={`avatar ${className}`} style={style}>
      {initialsFromName(name || '?')}
    </div>
  );
}
