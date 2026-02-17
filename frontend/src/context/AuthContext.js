import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

/**
 * Authentication Context
 * Manages user authentication state and provides auth methods
 */
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          // Set token in axios headers
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          
          // Fetch user data
          const response = await api.get('/auth/me');
          setUser(response.data.data.user);
        } catch (error) {
          // Token is invalid or expired, clear it
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    checkAuth();

    // Listen for logout events from API interceptor
    const handleLogout = () => {
      logout();
    };
    window.addEventListener('auth:logout', handleLogout);

    return () => {
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, []);

  /**
   * Login user
   */
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data.data;
      
      // Store token
      localStorage.setItem('token', token);
      setToken(token);
      
      // Set axios header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Set user
      setUser(user);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  /**
   * Register user
   */
  const register = async (name, email, password, role, phone, location) => {
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        role,
        phone,
        location
      });
      const { token, user } = response.data.data;
      
      // Store token
      localStorage.setItem('token', token);
      setToken(token);
      
      // Set axios header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Set user
      setUser(user);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  /**
   * Logout user
   */
  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  // Set up logout event listener
  useEffect(() => {
    const handleLogout = () => {
      logout();
    };
    window.addEventListener('auth:logout', handleLogout);

    return () => {
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, []);

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
