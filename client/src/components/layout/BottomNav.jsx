import { useLocation, useNavigate } from 'react-router-dom';
import { MessageCircle, Phone, Settings } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { Avatar } from '../common/Avatar.jsx';

export function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const active = (path) => pathname === path || (path === '/chats' && pathname.startsWith('/chats'));

  const items = [
    { key: 'chats', path: '/chats', label: 'Chatlar', icon: MessageCircle },
    { key: 'contacts', path: '/contacts', label: 'Kontaktlar', icon: Phone },
    { key: 'settings', path: '/settings', label: 'Sozlamalar', icon: Settings },
    { key: 'profile', path: '/profile', label: 'Profil', isAvatar: true },
  ];

  return (
    <nav className="bottom-nav" aria-label="Primary navigation">
      {items.map((item) => {
        const isActive = active(item.path);
        return (
          <button
            key={item.key}
            type="button"
            className={`bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`}
            onClick={() => navigate(item.path)}
            aria-label={item.label}
          >
            {item.isAvatar ? (
              <Avatar userId={user?.id} name={user?.displayName} avatarUrl={user?.avatarUrl} size={24} />
            ) : (
              <item.icon size={20} strokeWidth={2} />
            )}
            <span className="bottom-nav__label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

