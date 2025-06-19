
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Corrigindo a URL base para usar o IP correto
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://192.168.100.234:3001/api';

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

  useEffect(() => {
    console.log('BASE_URL configurada:', BASE_URL);
    console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
    
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUserProfile = async (token: string) => {
    try {
      console.log('Buscando perfil do usuário...');
      console.log('URL da API:', `${BASE_URL}/users/profile`);
      
      const response = await fetch(`${BASE_URL}/users/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Resposta da API de perfil:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('Perfil carregado:', userData);
        setUser(userData);
      } else {
        console.error('Erro ao buscar perfil:', response.statusText);
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('Tentando fazer login com:', { email });
      console.log('BASE_URL atual:', BASE_URL);
      console.log('URL da API de login:', `${BASE_URL}/auth/login`);
      
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
        const data = await response.json();
        console.log('Login bem-sucedido:', data);
        
        localStorage.setItem('token', data.token);
        setUser(data.user);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Erro de comunicação com o servidor' }));
        throw new Error(errorData.error || `Erro HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Erro no login:', error);
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando em http://192.168.100.234:3001');
      }
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};
