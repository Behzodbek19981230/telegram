import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, MessageCircle, Users } from 'lucide-react';

export function NewChatMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="popup-menu fab-compose">
      <button className="fab-compose__btn" onClick={() => setOpen((v) => !v)} aria-label="Yangi">
        <Pencil size={22} strokeWidth={2} />
      </button>

      {open && (
        <>
          <div className="popup-menu__backdrop" onClick={() => setOpen(false)} />
          <div className="popup-menu__panel popup-menu__panel--from-bottom-right">
            <button type="button" onClick={() => navigate('/contacts')}>
              <span className="popup-menu__icon">
                <MessageCircle size={18} strokeWidth={1.8} />
              </span>
              Yangi suhbat
            </button>
            <button type="button" onClick={() => navigate('/new-group')}>
              <span className="popup-menu__icon">
                <Users size={18} strokeWidth={1.8} />
              </span>
              Yangi guruh
            </button>
          </div>
        </>
      )}
    </div>
  );
}
