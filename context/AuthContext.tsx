import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { API_URL } from '../constants/api';

type AuthContextType = {
  user: any;
  token: string | null;
  login: (token: string, user: any) => void;
  logout: () => void;
  refreshUser: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const tokenRef = useRef<string | null>(null);

  const fetchUser = (t: string) => {
    fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${t}` } })
      .then((r) => r.json())
      .then((userData) => { if (userData.id) setUser(userData); })
      .catch(() => {});
  };

  const refreshUser = () => {
    if (tokenRef.current) fetchUser(tokenRef.current);
  };

  useEffect(() => {
    AsyncStorage.getItem('token').then((savedToken) => {
      if (!savedToken) return;
      tokenRef.current = savedToken;
      setToken(savedToken);
      fetchUser(savedToken);
    });

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refreshUser();
    });
    return () => sub.remove();
  }, []);

  const login = async (t: string, u: any) => {
    tokenRef.current = t;
    setToken(t);
    setUser(u);
    await AsyncStorage.setItem('token', t);
    fetchUser(t);
  };

  const logout = async () => {
    tokenRef.current = null;
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return context;
};
