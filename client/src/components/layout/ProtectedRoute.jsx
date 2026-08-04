import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { Spinner } from '../common/Spinner.jsx';

export function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="screen-center">
        <Spinner size={32} />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return children;
}
