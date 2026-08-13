import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user is Platform Super Admin, redirect to Super Admin portal
  if (user.role === 'SUPER_ADMIN') {
    return <Navigate to="/super-admin" replace />;
  }

  return children;
}
