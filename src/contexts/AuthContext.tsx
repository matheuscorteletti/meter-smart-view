
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  switchProfile: (role: 'admin' | 'user' | 'viewer') => void;
  isAdminSwitched: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
      const response = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
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
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Resposta recebida:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        url: response.url
      });

      // Verificar se a resposta tem conteúdo antes de tentar fazer parse
      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);

      if (!response.ok) {
        let errorMessage = 'Erro no login';
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (parseError) {
            console.error('Erro ao fazer parse do JSON de erro:', parseError);
            // Se não conseguir fazer parse do JSON, usar o status da resposta
            errorMessage = `Erro ${response.status}: ${response.statusText}`;
          }
        } else {
          // Se não for JSON, tentar ler como texto
          try {
            const errorText = await response.text();
            console.log('Resposta de erro como texto:', errorText);
            errorMessage = errorText || errorMessage;
          } catch (textError) {
            console.error('Erro ao ler resposta como texto:', textError);
          }
        }
        
        throw new Error(errorMessage);
      }

      // Verificar se a resposta de sucesso tem conteúdo JSON
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log('Dados de login recebidos:', data);
        
        if (data.token && data.user) {
          localStorage.setItem('token', data.token);
          setUser(data.user);
        } else {
          throw new Error('Resposta inválida do servidor');
        }
      } else {
        throw new Error('Resposta do servidor não é JSON válido');
      }

    } catch (error) {
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
