import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Only checks that the user is logged in (no subscription / trial gating).
const ProtectedRoute = ({ children, requireSuperAdmin = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireSuperAdmin && user.role !== 'superadmin') {
    return <Navigate to="/dashboard" replace />;
  }

  if (!requireSuperAdmin && user.role === 'superadmin') {
    return <Navigate to="/super-admin" replace />;
  }

  return children;
};

export default ProtectedRoute;
