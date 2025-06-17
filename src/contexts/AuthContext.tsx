
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { getUser, saveUser, removeUser, initializeSampleData } from '@/lib/storage';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
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

// Simple password validation
const validatePassword = (password: string): boolean => {
  // Senha deve ter pelo menos 6 caracteres
  return password.length >= 6;
};

// Simular hash da senha (em produção, use bcrypt ou similar)
const hashPassword = (password: string): string => {
  // Esta é uma implementação básica apenas para demonstração
  // Em produção, use uma biblioteca de hash segura
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString();
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginAttempts, setLoginAttempts] = useState<{ [email: string]: { count: number; lastAttempt: number } }>({});

  useEffect(() => {
    initializeSampleData();
    const savedUser = getUser();
    setUser(savedUser);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Validação básica de entrada
    if (!email || !password) {
      return { success: false, error: 'Email e senha são obrigatórios' };
    }

    if (!validatePassword(password)) {
      return { success: false, error: 'A senha deve ter pelo menos 6 caracteres' };
    }

    // Verificar tentativas de login (rate limiting básico)
    const now = Date.now();
    const userAttempts = loginAttempts[email] || { count: 0, lastAttempt: 0 };
    
    // Reset contador se passou mais de 15 minutos
    if (now - userAttempts.lastAttempt > 15 * 60 * 1000) {
      userAttempts.count = 0;
    }

    // Bloquear se muitas tentativas
    if (userAttempts.count >= 5) {
      const timeLeft = Math.ceil((15 * 60 * 1000 - (now - userAttempts.lastAttempt)) / 60000);
      return { 
        success: false, 
        error: `Muitas tentativas de login. Tente novamente em ${timeLeft} minutos.` 
      };
    }

    // Credenciais válidas com senhas hasheadas
    const validCredentials = {
      'admin@demo.com': {
        passwordHash: hashPassword('admin123'),
        user: {
          id: 'admin-1',
          name: 'Administrador',
          email: 'admin@demo.com',
          role: 'admin' as const,
        }
      },
      'user@demo.com': {
        passwordHash: hashPassword('user123'),
        user: {
          id: 'user-1013',
          name: 'João Silva',
          email: 'user@demo.com',
          role: 'user' as const,
          buildingId: 'building-1013',
          unitId: 'unit-1013-externo',
        }
      },
    };

    const credential = validCredentials[email as keyof typeof validCredentials];
    const providedPasswordHash = hashPassword(password);
    
    if (credential && credential.passwordHash === providedPasswordHash) {
      // Login bem-sucedido - resetar tentativas
      setLoginAttempts(prev => ({ ...prev, [email]: { count: 0, lastAttempt: now } }));
      
      setUser(credential.user);
      saveUser(credential.user);
      return { success: true };
    } else {
      // Login falhou - incrementar tentativas
      setLoginAttempts(prev => ({
        ...prev,
        [email]: {
          count: userAttempts.count + 1,
          lastAttempt: now
        }
      }));
      
      return { success: false, error: 'Email ou senha incorretos' };
    }
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
