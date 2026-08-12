import { useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav.jsx';

export function MobileFrame({ children }) {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');
  const showBottomNav = ['/chats', '/contacts', '/settings', '/profile'].includes(pathname);

  return (
    <div className={`app-backdrop ${isAdmin ? 'app-backdrop--admin' : ''}`}>
      <div className={`mobile-frame ${isAdmin ? 'mobile-frame--admin' : ''} ${showBottomNav ? 'mobile-frame--with-nav' : ''}`}>
        {children}
        {showBottomNav && <BottomNav />}
      </div>
    </div>
  );
}
