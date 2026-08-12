import { useState } from 'react';
import { MoreVertical, Eraser, Trash2 } from 'lucide-react';

export function ChatMenu({ onClearHistory, onDeleteChat }) {
  const [open, setOpen] = useState(false);

  function handle(action) {
    setOpen(false);
    action();
  }

  return (
    <div className="popup-menu">
      <button className="icon-button" onClick={() => setOpen((v) => !v)} aria-label="Ko‘proq">
        <MoreVertical size={20} strokeWidth={2} />
      </button>

      {open && (
        <>
          <div className="popup-menu__backdrop" onClick={() => setOpen(false)} />
          <div className="popup-menu__panel popup-menu__panel--from-top">
            <button type="button" onClick={() => handle(onClearHistory)}>
              <span className="popup-menu__icon">
                <Eraser size={17} strokeWidth={1.8} />
              </span>
              Tarixni tozalash
            </button>
            <button type="button" className="popup-menu__item--danger" onClick={() => handle(onDeleteChat)}>
              <span className="popup-menu__icon">
                <Trash2 size={17} strokeWidth={1.8} />
              </span>
              Suhbatni o‘chirish
            </button>
          </div>
        </>
      )}
    </div>
  );
}
