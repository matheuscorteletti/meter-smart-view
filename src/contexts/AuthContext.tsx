
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
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
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('🚀 AuthProvider iniciado com Supabase');
    
    // Função para buscar perfil
    const fetchUserProfile = async (session: Session) => {
      console.log('🔍 Buscando perfil para usuário:', session.user.id);
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      console.log('👤 Perfil encontrado:', profile);
      
      if (profile) {
        const userObj = {
          id: profile.id,
          name: profile.name,
          email: session.user.email!,
          role: profile.role as 'admin' | 'user' | 'viewer',
          buildingId: profile.building_id,
          unitId: profile.unit_id,
        };
        console.log('✅ Definindo usuário:', userObj);
        setUser(userObj);
      }
      setIsLoading(false);
    };
    
    // Configurar listener de mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.id);
        setSession(session);
        
        if (session?.user) {
          await fetchUserProfile(session);
        } else {
          console.log('❌ Nenhuma sessão ativa');
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    // Verificar sessão inicial
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('🔍 Verificando sessão inicial:', session?.user?.id);
      setSession(session);
      
      if (session?.user) {
        await fetchUserProfile(session);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Tentando fazer login com Supabase:', { email });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log('✅ Login bem-sucedido:', data);
    } catch (error) {
      console.error('❌ Erro no login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Fazendo logout...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Erro no logout:', error);
      } else {
        console.log('✅ Logout realizado com sucesso');
      }
    } catch (error) {
      console.error('❌ Erro no logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session,
      login, 
      logout, 
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};
