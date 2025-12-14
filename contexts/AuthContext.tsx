import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { User } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginAnonymously: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Subscribe to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(authService.mapFirebaseUser(firebaseUser));
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });
    
    // Handle the redirect result FIRST (for Google Sign In) - kept for legacy/cleanup
    authService.handleRedirectResult()
      .then((redirectUser) => {
        if (redirectUser) {
          setUser(redirectUser);
          setIsLoading(false);
          redirectHandled = true;
          authStateReceived = true;
          if (authStateTimeoutId) {
            clearTimeout(authStateTimeoutId);
            authStateTimeoutId = null;
          }
        } else {
          redirectHandled = true;
          maybeFinishLoading();
        }
      })
      .catch(error => {
        console.error("[AuthContext] Auth redirect error:", error);
        redirectHandled = true;
        maybeFinishLoading();
      });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    // We don't need to set loading here as the auth listener handles the state update
    // But we await the service call to propagate errors to the caller
    await authService.login(email, password);
    // Log analytics event
    const { logLogin } = await import('../services/analyticsService');
    logLogin('email');
  };

  const register = async (email: string, password: string, name: string) => {
    const newUser = await authService.register(email, password, name);
    // Migrate guest data to this new user automatically
    authService.migrateGuestData(newUser.id);
    // Log analytics event
    const { logSignUp } = await import('../services/analyticsService');
    logSignUp('email');
  };

  const loginAnonymously = async () => {
    await authService.loginAnonymously();
    // Log analytics event
    const { logSignUp, logLogin } = await import('../services/analyticsService');
    logSignUp('anonymous');
    logLogin('anonymous');
  };

  const loginWithGoogle = async () => {
    await authService.loginWithGoogle();
    // Log analytics event
    const { logLogin } = await import('../services/analyticsService');
    logLogin('google');
  };

  const logout = async () => {
    await authService.logout();
    // Log analytics event
    const { logLogout } = await import('../services/analyticsService');
    logLogout();
    // Force a hard reload to ensure all application state is reset
    window.location.href = '/';
  };

  const deleteAccount = async () => {
    await authService.deleteAccount();
    // Log analytics event
    const { logAccountDelete } = await import('../services/analyticsService');
    logAccountDelete();
    // Force a hard reload to ensure all application state is reset
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, loginAnonymously, loginWithGoogle, logout, deleteAccount }}>
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