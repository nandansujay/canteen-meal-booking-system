import { createContext, useContext, useState, useEffect } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  function persist(user, token) {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    setUser(user);
  }

  async function login(email, password) {
    const { data } = await client.post('/auth/login', { email, password });
    persist(data.user, data.token);
    return data.user;
  }

  async function register(payload) {
    const { data } = await client.post('/auth/register', payload);
    persist(data.user, data.token);
    return data.user;
  }

  function updateUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  }

  async function refreshWallet() {
    try {
      const { data } = await client.get('/wallet/balance');
      setUser((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, wallet_balance: data.wallet_balance };
        localStorage.setItem('user', JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      // Non-critical: the cached balance just stays as-is until the next successful refresh.
    }
  }

  // Correct any stale cached balance the moment the app loads, in case a
  // previous session's wallet-affecting action failed to sync (or was made
  // before this refresh logic existed).
  useEffect(() => {
    if (localStorage.getItem('token')) {
      refreshWallet();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, refreshWallet }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
