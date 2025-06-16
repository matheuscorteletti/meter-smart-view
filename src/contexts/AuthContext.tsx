
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { getUser, saveUser, removeUser, initializeSampleData } from '@/lib/storage';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeSampleData();
    const savedUser = getUser();
    setUser(savedUser);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Demo credentials
    const demoUsers = {
      'admin@demo.com': {
        id: 'admin-1',
        name: 'Administrador',
        email: 'admin@demo.com',
        role: 'admin' as const,
      },
      'user@demo.com': {
        id: 'user-1',
        name: 'João Silva',
        email: 'user@demo.com',
        role: 'user' as const,
        buildingId: 'building-1',
        unitId: 'unit-1',
      },
    };

    const userData = demoUsers[email as keyof typeof demoUsers];
    
    if (userData && password === 'demo123') {
      setUser(userData);
      saveUser(userData);
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    removeUser();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
