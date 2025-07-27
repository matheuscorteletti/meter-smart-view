import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useSupabaseAuth = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const signUp = async (email: string, password: string, userData?: { name?: string }) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Erro no signUp:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Erro no resetPassword:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: { name?: string; role?: string; building_id?: string; unit_id?: string }) => {
    if (!user) throw new Error('Usuário não autenticado');
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Erro no updateProfile:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  return {
    signUp,
    resetPassword,
    updateProfile,
    loading,
    user
  };
};