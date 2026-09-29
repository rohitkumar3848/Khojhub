import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, notificationsApi } from '../services/api';
import wsService from '../services/websocket';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('khojhub_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('khojhub_token'));
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (token) {
      authApi.getMe()
        .then((res) => {
          if (res.data) {
            setUser(res.data);
            localStorage.setItem('khojhub_user', JSON.stringify(res.data));
            fetchUnreadCount();
          }
        })
        .catch(() => {
          logout();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [token]);

  // Subscribe to real-time notifications via WebSocket when user is logged in
  useEffect(() => {
    if (user?.id) {
      wsService.connect();
      const unsub = wsService.subscribeToNotifications(user.id, (notif) => {
        setUnreadCount((prev) => prev + 1);
      });
      return () => {
        unsub();
      };
    }
  }, [user?.id]);

  const fetchUnreadCount = async () => {
    try {
      const res = await notificationsApi.getUnreadCount();
      if (res.data?.unreadCount !== undefined) {
        setUnreadCount(res.data.unreadCount);
      }
    } catch (e) {
      // ignore
    }
  };

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.data) {
      const { token: jwtToken, user: userData } = res.data;
      setToken(jwtToken);
      setUser(userData);
      localStorage.setItem('khojhub_token', jwtToken);
      localStorage.setItem('khojhub_user', JSON.stringify(userData));
      fetchUnreadCount();
      return userData;
    }
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    if (res.data) {
      const { token: jwtToken, user: createdUser } = res.data;
      setToken(jwtToken);
      setUser(createdUser);
      localStorage.setItem('khojhub_token', jwtToken);
      localStorage.setItem('khojhub_user', JSON.stringify(createdUser));
      fetchUnreadCount();
      return createdUser;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('khojhub_token');
    localStorage.removeItem('khojhub_user');
    wsService.disconnect();
  };

  const refreshUser = async () => {
    try {
      const res = await authApi.getMe();
      if (res.data) {
        setUser(res.data);
        localStorage.setItem('khojhub_user', JSON.stringify(res.data));
      }
    } catch (e) {
      // ignore
    }
  };

  const isAdmin = user?.roles?.includes('ROLE_ADMIN') || false;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isAdmin,
        loading,
        unreadCount,
        login,
        register,
        logout,
        refreshUser,
        refreshNotificationsCount: fetchUnreadCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
