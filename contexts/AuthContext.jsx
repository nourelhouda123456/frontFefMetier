'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { adminLogin, adminGetMe } from '../lib/api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'admin_token';

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true);

  // Restaurer la session depuis localStorage au montage
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    if (!stored) { setLoading(false); return; }

    adminGetMe(stored)
      .then((me) => { setToken(stored); setUser(me); })
      .catch(() => { localStorage.removeItem(TOKEN_KEY); })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await adminLogin(email, password);
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider');
  return ctx;
}
