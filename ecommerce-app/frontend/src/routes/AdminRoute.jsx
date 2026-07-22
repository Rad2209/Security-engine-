import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * AdminRoute
 *
 * Mirrors ProtectedRoute exactly, but reads `admin`/`isLoadingAdmin`
 * instead of `user`/`isLoadingUser` — a completely separate session, per
 * the backend's deliberate separation of customer and admin auth.
 */
function AdminRoute({ children }) {
  const { admin, isLoadingAdmin } = useAuth();
  const location = useLocation();

  if (isLoadingAdmin) {
    return null;
  }

  if (!admin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}

export default AdminRoute;