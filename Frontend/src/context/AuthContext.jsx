import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, fetchCsrfToken } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await fetchCsrfToken();
        const { data } = await authAPI.getMe();
        if (data?.success) {
          setUser(data.user);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const loginContext = async (credentials) => {
    const { data } = await authAPI.login(credentials);
    setUser(data.user);
    return data;
  };

  const registerContext = async (userData) => {
    const { data } = await authAPI.register(userData);
    setUser(data.user);
    return data;
  };

  const logoutContext = async () => {
    try {
      await authAPI.logout();
    } catch (e) {
      console.error('Logout failed:', e);
    } finally {
      setUser(null);
      navigate('/login', { replace: true });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginContext, registerContext, logoutContext }}>
      {children}
    </AuthContext.Provider>
  );
};

