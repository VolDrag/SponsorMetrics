import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otpEmail, setOtpEmail] = useState('');

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const response = await api.get('/api/auth/me');
        setUser(response.data.user);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const register = async (payload) => {
    const response = await api.post('/api/auth/register', payload);
    setOtpEmail(payload.email);
    return response.data;
  };

  const verifyOTP = async (payload) => {
    const response = await api.post('/api/auth/verify-otp', payload);
    setUser(response.data.user);
    return response.data;
  };

  const login = async (payload) => {
    const response = await api.post('/api/auth/login', payload);
    setUser(response.data.user);
    return response.data;
  };

  const logout = async () => {
    await api.post('/api/auth/logout');
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      otpEmail,
      register,
      verifyOTP,
      login,
      logout,
    }),
    [user, loading, otpEmail]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }
  return context;
};
