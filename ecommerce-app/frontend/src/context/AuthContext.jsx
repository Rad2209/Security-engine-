import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as authApi from '../api/authApi';
import * as adminAuthApi from '../api/adminAuthApi';

const AuthContext = createContext(undefined);

/**
 * AuthContext
 *
 * Tracks BOTH the customer session (cookie: "token") and the admin session
 * (cookie: "adminToken") independently — they're genuinely separate
 * sessions by backend design (Phase 5c), so a browser can hold both at
 * once without collision. ProtectedRoute reads `user`/`isLoadingUser`;
 * AdminRoute reads `admin`/`isLoadingAdmin`.
 *
 * On mount, calls GET /auth/me and GET /admin/me once each to bootstrap
 * session state from the httpOnly cookies — this is the only way to know
 * "am I still logged in?" after a page refresh, since JS can't read the
 * cookie's contents directly (see authApi.getMe()'s comment on the backend
 * gap this fills).
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const [admin, setAdmin] = useState(null);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(true);

  useEffect(() => {
    authApi
      .getMe()
      .then(setUser)
      .catch(() => setUser(null)) // 401 = not logged in — expected, not an error to surface
      .finally(() => setIsLoadingUser(false));
  }, []);

  useEffect(() => {
    adminAuthApi
      .getAdminMe()
      .then(setAdmin)
      .catch(() => setAdmin(null))
      .finally(() => setIsLoadingAdmin(false));
  }, []);

  const loginUser = useCallback(async (credentials) => {
    const loggedInUser = await authApi.login(credentials);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const registerUser = useCallback(async (input) => {
    // Deliberately does NOT log the user in automatically — register and
    // login are separate backend calls, matching authRoutes.js exactly.
    // The calling page decides whether to redirect to /login after this.
    return authApi.register(input);
  }, []);

  const logoutUser = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const loginAdmin = useCallback(async (credentials) => {
    const loggedInAdmin = await adminAuthApi.adminLogin(credentials);
    setAdmin(loggedInAdmin);
    return loggedInAdmin;
  }, []);

  const logoutAdmin = useCallback(async () => {
    await adminAuthApi.adminLogout();
    setAdmin(null);
  }, []);

  const value = {
    user,
    isLoadingUser,
    loginUser,
    registerUser,
    logoutUser,
    admin,
    isLoadingAdmin,
    loginAdmin,
    logoutAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}