import React, { createContext, useContext, useState, useEffect } from 'react';
import { ROLES } from '../constants/roles';

const AuthContext = createContext(null);

// Preset test users for review
const MOCK_USERS = {
  'admin@homepathy.com': { id: 'u1', name: 'Dr. Sarah Collins', email: 'admin@homepathy.com', role: ROLES.ADMIN },
  'doctor@homepathy.com': { id: 'u2', name: 'Dr. Amit Patel', email: 'doctor@homepathy.com', role: ROLES.DOCTOR },
  'patient@homepathy.com': { id: 'u3', name: 'Suresh Kumar', email: 'patient@homepathy.com', role: ROLES.PATIENT },
  'inventory@homepathy.com': { id: 'u4', name: 'John Doe', email: 'inventory@homepathy.com', role: ROLES.INVENTORY_REP }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Restore session
    const savedUser = localStorage.getItem('hms_session');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    
    // Simulate API request delay
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const foundUser = MOCK_USERS[email.toLowerCase().trim()];
        if (foundUser && password === 'password123') { // Simple default password
          localStorage.setItem('hms_session', JSON.stringify(foundUser));
          setUser(foundUser);
          setIsLoading(false);
          resolve(foundUser);
        } else {
          const errMsg = foundUser ? 'Incorrect password. (Use: password123)' : 'User not found. Use mock emails: admin@homepathy.com, doctor@homepathy.com, patient@homepathy.com, inventory@homepathy.com';
          setError(errMsg);
          setIsLoading(false);
          reject(new Error(errMsg));
        }
      }, 600);
    });
  };

  const logout = () => {
    localStorage.removeItem('hms_session');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, error, setError }}>
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
