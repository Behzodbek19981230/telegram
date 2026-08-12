import { useState } from 'react';
import { AvatarLightbox } from './AvatarLightbox.jsx';

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

export function Avatar({ userId, name, avatarUrl, size = 48, className = '', expandable = false }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const canExpand = expandable && Boolean(avatarUrl);

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

  function openLightbox(e) {
    e.stopPropagation();
    e.preventDefault();
    setLightboxOpen(true);
  }

  const rootClass = ['avatar', className, canExpand ? 'avatar--expandable' : ''].filter(Boolean).join(' ');

  return (
    <>
      <div
        className={rootClass}
        style={style}
        onClick={canExpand ? openLightbox : undefined}
        onKeyDown={
          canExpand
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') openLightbox(e);
              }
            : undefined
        }
        role={canExpand ? 'button' : undefined}
        tabIndex={canExpand ? 0 : undefined}
        aria-label={canExpand ? `${name || 'Avatar'} rasmini kattalashtirish` : undefined}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable={false} />
        ) : (
          initialsFromName(name || '?')
        )}
      </div>
      {lightboxOpen && (
        <AvatarLightbox avatarUrl={avatarUrl} name={name} onClose={() => setLightboxOpen(false)} />
      )}
    </>
  );
}
