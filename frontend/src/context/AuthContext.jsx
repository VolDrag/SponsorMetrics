import React, { createContext, useContext, useState, useEffect } from 'react';
import authApi from '../services/authApi';
import { setAccessToken } from '../services/api';

const AuthContext = createContext(null);

const applySession = (payload, setUser) => {
  const user = payload?.user || payload;
  if (payload?.accessToken) setAccessToken(payload.accessToken);
  if (user && user._id) setUser(user);
  return user;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const refreshed = await authApi.refresh().catch(() => null);
      if (refreshed?.data?.data?.accessToken) {
        setAccessToken(refreshed.data.data.accessToken);
      }
      const res = await authApi.getMe();
      applySession({ user: res.data.data, accessToken: refreshed?.data?.data?.accessToken }, setUser);
    } catch (_error) {
      setAccessToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (payload) => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return applySession(payload, setUser);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (_error) {
      /* still clear client session */
    }
    setAccessToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    if (window.location.pathname !== '/login') {
      window.location.assign('/login');
    }
  };

  const value = {
    user,
    setUser,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    isOrganizer: user?.role === 'organizer',
    isSponsor: user?.role === 'sponsor',
    isAdmin: user?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
