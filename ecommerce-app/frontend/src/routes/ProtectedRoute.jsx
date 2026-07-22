import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute
 *
 * Wraps customer-only pages (cart, checkout, orders). Waits for
 * AuthContext's initial GET /auth/me check to resolve before deciding
 * anything — redirecting to /login BEFORE that check resolves would
 * incorrectly bounce an actually-logged-in user on every single page
 * refresh, since isLoadingUser starts true and user starts null.
 */
function ProtectedRoute({ children }) {
  const { user, isLoadingUser } = useAuth();
  const location = useLocation();

  if (isLoadingUser) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;