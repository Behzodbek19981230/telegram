import { useEffect } from 'react';

export function AvatarLightbox({ avatarUrl, name, onClose }) {
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="avatar-lightbox" onClick={onClose} role="dialog" aria-modal="true" aria-label={name}>
      <img
        className="avatar-lightbox__img"
        src={avatarUrl}
        alt={name || ''}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
