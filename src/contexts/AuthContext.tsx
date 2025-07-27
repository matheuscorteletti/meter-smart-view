
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User as AppUser } from '@/types';

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
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


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = async (userId: string, userSession: Session | null) => {
    try {
      console.log('Buscando perfil para usuário:', userId);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        // Se não encontrar perfil, criar um perfil básico
        if (error.code === 'PGRST116') { // Not found
          console.log('Perfil não encontrado, criando perfil padrão');
          return {
            id: userId,
            name: userSession?.user?.user_metadata?.name || 'Usuário',
            email: userSession?.user?.email || '',
            role: 'user' as 'admin' | 'user' | 'viewer',
            buildingId: undefined,
            unitId: undefined,
          };
        }
        return null;
      }

      console.log('Perfil encontrado:', profile);
      return {
        id: profile.id,
        name: profile.name,
        email: userSession?.user?.email || '',
        role: profile.role as 'admin' | 'user' | 'viewer',
        buildingId: profile.building_id,
        unitId: profile.unit_id,
      };
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      // Retornar um perfil padrão em caso de erro
      return {
        id: userId,
        name: userSession?.user?.user_metadata?.name || 'Usuário',
        email: userSession?.user?.email || '',
        role: 'user' as 'admin' | 'user' | 'viewer',
        buildingId: undefined,
        unitId: undefined,
      };
    }
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, session);
        setSession(session);
        
        if (session?.user) {
          // Use setTimeout to defer async calls
          setTimeout(() => {
            if (!mounted) return;
            fetchUserProfile(session.user.id, session).then((userProfile) => {
              if (!mounted) return;
              console.log('Profile fetched:', userProfile);
              setUser(userProfile);
              setIsLoading(false);
            }).catch((error) => {
              if (!mounted) return;
              console.error('Error fetching profile:', error);
              setIsLoading(false);
            });
          }, 0);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      if (session?.user) {
        setSession(session);
        fetchUserProfile(session.user.id, session).then((userProfile) => {
          if (!mounted) return;
          console.log('Initial profile fetched:', userProfile);
          setUser(userProfile);
          setIsLoading(false);
        }).catch((error) => {
          if (!mounted) return;
          console.error('Error fetching initial profile:', error);
          setIsLoading(false);
        });
      } else {
        setSession(null);
        setUser(null);
        setIsLoading(false);
      }
    });

    // Set a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      if (mounted) {
        console.warn('Loading timeout reached, stopping loading state');
        setIsLoading(false);
      }
    }, 10000); // 10 seconds timeout

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(loadingTimeout);
    };
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Erro ao fazer login' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
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
