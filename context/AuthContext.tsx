import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { API_URL } from '../constants/api';

// 1 — Définir le type du contexte
type AuthContextType = {
  user: any;
  token: string | null;
  login: (token: string, user: any) => void;
  logout: () => void;
};

// 2 — Créer le contexte
const AuthContext = createContext<AuthContextType | null>(null);

// 3 — Créer le Provider
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('token').then((savedToken) => {
      if (!savedToken) return;
      setToken(savedToken);
      fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${savedToken}` },
      })
        .then((r) => r.json())
        .then((userData) => { if (userData.id) setUser(userData); })
        .catch(() => {});
    });
  }, []);

  const isAdmin = () => user?.is_admin === true;
  const isWriter = () => user?.is_writer === true;
  const isConnected = () => user !== null;


  const login = async (token: string, user: any) => {
    setToken(token);
    setUser(user);
    await AsyncStorage.setItem('token', token);
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 4 — Hook pour utiliser le contexte facilement
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return context;
};
