import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Restore session on startup
    const savedUser = localStorage.getItem('hms_session');
    const token = localStorage.getItem('hms_access_token');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const loggedInUser = await api.login(email, password);
      setUser(loggedInUser);
      setIsLoading(false);
      return loggedInUser;
    } catch (err) {
      const errMsg = err.message || 'Invalid credentials or connection error.';
      setError(errMsg);
      setIsLoading(false);
      throw new Error(errMsg);
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  const updateUserData = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('hms_session', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUserData, isLoading, error, setError }}>
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
