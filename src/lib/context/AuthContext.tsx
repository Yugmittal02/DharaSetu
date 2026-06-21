'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  name: string;
  role: string;
  operatorId?: string;
  mobile?: string;
  walletBalance?: number;
  shopName?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
  updateWallet: (balance: number) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  isLoading: true,
  updateWallet: () => {},
});

export function AuthProvider({ children, storageKey = 'dharasetu' }: { children: React.ReactNode; storageKey?: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(`${storageKey}_token`);
    const storedUser = localStorage.getItem(`${storageKey}_user`);
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem(`${storageKey}_token`);
        localStorage.removeItem(`${storageKey}_user`);
      }
    }
    setIsLoading(false);
  }, [storageKey]);

  const login = useCallback((newToken: string, newUser: User) => {
    localStorage.setItem(`${storageKey}_token`, newToken);
    localStorage.setItem(`${storageKey}_user`, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, [storageKey]);

  const logout = useCallback(() => {
    localStorage.removeItem(`${storageKey}_token`);
    localStorage.removeItem(`${storageKey}_user`);
    setToken(null);
    setUser(null);
  }, [storageKey]);

  const updateWallet = useCallback((balance: number) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, walletBalance: balance };
      localStorage.setItem(`${storageKey}_user`, JSON.stringify(updated));
      return updated;
    });
  }, [storageKey]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading, updateWallet }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
