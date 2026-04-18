import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string) => Promise<void>;
  signOut: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage for persisted session
    const storedUser = localStorage.getItem('lyloo_user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      applyTheme(parsedUser.theme || 'light');
    } else {
      applyTheme('light');
    }
    setIsLoading(false);
  }, []);

  const applyTheme = (theme: 'light' | 'dark' | 'system') => {
    const root = window.document.documentElement;
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const signIn = async (email: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockUser: UserProfile = {
      id: 'user_123',
      email,
      first_name: 'Julie',
      last_name: 'Dupont',
      avatar_url: 'https://picsum.photos/200/200?random=99',
      role: 'admin', // DEFAULTING TO ADMIN FOR DEVELOPMENT
      objectifs: [],
      tempsParJourMinutes: 15,
      notifications: { matin: false, midi: false, soir: false },
      theme: 'light'
    };
    
    setUser(mockUser);
    localStorage.setItem('lyloo_user', JSON.stringify(mockUser));
    applyTheme(mockUser.theme);
    setIsLoading(false);
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('lyloo_user');
    applyTheme('light');
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('lyloo_user', JSON.stringify(updatedUser));
      if (updates.theme) {
        applyTheme(updates.theme);
      }
    }
  };

  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    updateProfile({ theme });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut, updateProfile, setTheme }}>
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