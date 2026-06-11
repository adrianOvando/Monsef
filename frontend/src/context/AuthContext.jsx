import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

/* ─── Context definition ─────────────────────────────────────────────── */
const AuthContext = createContext(null);

/* ─── Provider ───────────────────────────────────────────────────────── */
export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  /**
   * Restore session on mount: if there is a token in localStorage,
   * verify it by calling GET /api/auth/me.
   */
  useEffect(() => {
    const restore = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setLoading(false);
        return;
      }
      try {
        const response = await api.get('/auth/me');
        setUser(response.data.data);
        setToken(storedToken);
      } catch {
        // Token is invalid or expired – clean up.
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restore();
  }, []);

  /**
   * login – POST /api/auth/login, persist token, set user.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<object>} user data
   * @throws Error with message from the API on failure
   */
  const login = useCallback(async (emailOrObj, passwordParam) => {
    let email, password;
    if (emailOrObj && typeof emailOrObj === 'object') {
      email = emailOrObj.email;
      password = emailOrObj.password;
    } else {
      email = emailOrObj;
      password = passwordParam;
    }

    const response = await api.post('/auth/login', { email, password });
    const { token: newToken, usuario: userData } = response.data.data;

    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);

    return userData;
  }, []);

  /**
   * logout – clear token from storage and reset state.
   */
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(user),
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/* ─── Hook ───────────────────────────────────────────────────────────── */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return context;
}

export { AuthContext };
export default AuthContext;
