import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (login: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('htf_token');
    if (token) {
      api.getMe()
        .then(setUser)
        .catch(() => localStorage.removeItem('htf_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (loginStr: string, password: string) => {
    const { token, user } = await api.login({ login: loginStr, password });
    localStorage.setItem('htf_token', token);
    setUser(user);
  }, []);

  const register = useCallback(async (username: string, email: string, password: string) => {
    const { token, user } = await api.register({ username, email, password });
    localStorage.setItem('htf_token', token);
    setUser(user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('htf_token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
