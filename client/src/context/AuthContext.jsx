import { createContext, useCallback, useEffect, useState } from 'react';
import { setAuthToken } from '../api/http.js';
import { fetchMe } from '../api/users.api.js';
import { loginWithCredentials, registerWithCredentials } from '../api/auth.api.js';

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

  const login = useCallback(async ({ username, password }) => {
    const { token: newToken, user: newUser } = await loginWithCredentials({ username, password });
    localStorage.setItem(TOKEN_KEY, newToken);
    setAuthToken(newToken);
    setToken(newToken);
    setUser(newUser);
    return newUser;
  }, []);

  const register = useCallback(async ({ username, password, firstName, lastName, phone }) => {
    const { token: newToken, user: newUser } = await registerWithCredentials({
      username,
      password,
      firstName,
      lastName,
      phone,
    });

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
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
