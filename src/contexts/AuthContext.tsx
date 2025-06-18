
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { mockLogin, mockGetProfile } from '@/services/mockAuth';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  switchProfile: (role: 'admin' | 'user' | 'viewer') => void;
  isAdminSwitched: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminSwitched, setIsAdminSwitched] = useState(false);
  const [originalRole, setOriginalRole] = useState<'admin' | 'user' | 'viewer' | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUserProfile = async (token: string) => {
    try {
      console.log('Tentando buscar perfil do usuário...');
      
      // Try real API first, fallback to mock if not available
      const response = await fetch(`${BASE_URL}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Resposta da API de perfil:', {
        status: response.status,
        statusText: response.statusText
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const userData = await response.json();
          console.log('Perfil carregado da API:', userData);
          setUser(userData);
          return;
        }
      }

      // API not available or error, use mock
      console.log('API não disponível, usando dados mock para perfil');
      const mockUser = await mockGetProfile(token);
      console.log('Perfil mock carregado:', mockUser);
      setUser(mockUser);

    } catch (error) {
      console.log('Erro ao buscar perfil, tentando mock:', error);
      try {
        const mockUser = await mockGetProfile(token);
        console.log('Perfil mock carregado após erro:', mockUser);
        setUser(mockUser);
      } catch (mockError) {
        console.error('Erro no mock também:', mockError);
        localStorage.removeItem('token');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('Tentando fazer login com:', { email });
      
      // Try real API first
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Resposta da API de login:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          console.log('Dados de login recebidos da API:', data);
          
          if (data.token && data.user) {
            localStorage.setItem('token', data.token);
            setUser(data.user);
            return;
          }
        } else {
          console.log('Resposta da API não é JSON válido');
        }
      }

      // If real API fails or returns 404, use mock
      console.log('API não disponível ou com erro, usando autenticação mock');
      const mockData = await mockLogin(email, password);
      console.log('Login mock bem-sucedido:', mockData);
      
      localStorage.setItem('token', mockData.token);
      setUser(mockData.user);

    } catch (error) {
      if (error instanceof Error && (error.message.includes('fetch') || error.message.includes('NetworkError'))) {
        // Network error, try mock
        console.log('Erro de rede, tentando mock:', error);
        try {
          const mockData = await mockLogin(email, password);
          console.log('Login mock bem-sucedido após erro de rede:', mockData);
          
          localStorage.setItem('token', mockData.token);
          setUser(mockData.user);
          return;
        } catch (mockError) {
          console.error('Erro no mock após erro de rede:', mockError);
          throw mockError;
        }
      }
      
      console.error('Erro no login:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAdminSwitched(false);
    setOriginalRole(null);
  };

  const switchProfile = (role: 'admin' | 'user' | 'viewer') => {
    if (!user) return;
    
    if (user.role === 'admin' && !isAdminSwitched) {
      // Admin switching to another role
      setOriginalRole(user.role);
      setIsAdminSwitched(true);
      setUser({ ...user, role });
    } else if (isAdminSwitched && role === 'admin') {
      // Switching back to admin
      setIsAdminSwitched(false);
      setUser({ ...user, role: originalRole || 'admin' });
      setOriginalRole(null);
    } else if (isAdminSwitched) {
      // Admin switching between non-admin roles
      setUser({ ...user, role });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isLoading, 
      switchProfile, 
      isAdminSwitched 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
