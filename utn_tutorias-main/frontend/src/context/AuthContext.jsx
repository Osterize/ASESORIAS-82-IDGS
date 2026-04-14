import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true);

  // Restaurar sesión al cargar
  useEffect(() => {
    const savedToken = localStorage.getItem('utn_token');
    const savedUser  = localStorage.getItem('utn_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.success) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('utn_token', data.token);
      localStorage.setItem('utn_user', JSON.stringify(data.user));
    }
    return data;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('utn_token');
    localStorage.removeItem('utn_user');
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('utn_user', JSON.stringify(data.user));
      }
    } catch (_) {}
  }, []);

  const isAdmin   = user?.rol === 'administrador';
  const isDocente = user?.rol === 'docente';
  const isAlumno  = user?.rol === 'alumno';

  return (
    <AuthContext.Provider value={{
      user, token, loading, isAdmin, isDocente, isAlumno,
      login, logout, refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};
