import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to restore session:', error);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
        const loggedInUser = await authService.login(email, password);
        setUser(loggedInUser);
    } finally {
        setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
        const newUser = await authService.register(email, password, name);
        // Migrate guest data to this new user automatically
        authService.migrateGuestData(newUser.id);
        setUser(newUser);
    } finally {
        setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
        await authService.logout();
    } finally {
        // Force a hard reload to ensure all application state (including complex 
        // component states like active practice items, editor code, etc.) 
        // is completely reset for the guest session.
        window.location.reload();
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};