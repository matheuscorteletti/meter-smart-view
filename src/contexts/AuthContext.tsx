
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Corrigindo a URL base para usar o IP correto em produção
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
    console.log('Mode:', import.meta.env.MODE);
    
    // Verificar se há token salvo (agora em cookies)
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('Verificando status de autenticação...');
      
      const response = await fetch(`${BASE_URL}/users/profile`, {
        method: 'GET',
        credentials: 'include', // Incluir cookies na requisição
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Resposta da verificação de auth:', {
        status: response.status,
        statusText: response.statusText
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('Usuário autenticado:', userData);
        setUser(userData);
      } else {
        console.log('Usuário não autenticado');
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
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
        credentials: 'include', // Incluir cookies na requisição
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Resposta da API de login:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Login bem-sucedido:', data);
        setUser(data.user);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Erro de comunicação com o servidor' }));
        throw new Error(errorData.error || `Erro HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Erro no login:', error);
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error(`Não foi possível conectar ao servidor. Verifique se o backend está rodando em ${BASE_URL}`);
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      setUser(null);
    }
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
