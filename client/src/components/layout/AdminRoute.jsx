import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

export function AdminRoute({ children }) {
  const { user } = useAuth();
  if (!user?.isAdmin) return <Navigate to="/chats" replace />;
  return children;
}
