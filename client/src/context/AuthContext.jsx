import { createContext, useCallback, useEffect, useState } from 'react';
import { setAuthToken } from '../api/http.js';
import { fetchMe } from '../api/users.api.js';
import { login as loginRequest } from '../api/auth.api.js';

export const AuthContext = createContext(null);

const TOKEN_KEY = 'telegram_clone_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) {
      setIsLoading(false);
      return;
    }

    setAuthToken(stored);
    fetchMe()
      .then((me) => {
        setUser(me);
        setToken(stored);
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setAuthToken(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (username) => {
    const { token: newToken, user: newUser } = await loginRequest(username);
    localStorage.setItem(TOKEN_KEY, newToken);
    setAuthToken(newToken);
    setToken(newToken);
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setAuthToken(null);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
