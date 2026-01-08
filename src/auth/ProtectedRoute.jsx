import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();

  if (loading) {
    return <div>読み込み中...</div>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
