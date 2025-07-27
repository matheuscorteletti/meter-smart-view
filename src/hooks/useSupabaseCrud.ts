import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useSupabaseCrud = () => {
  const [loading, setLoading] = useState(false);

  const create = async (table: string, data: any) => {
    setLoading(true);
    try {
      const { data: result, error } = await (supabase as any)
        .from(table)
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Item criado com sucesso!",
      });
      
      return { data: result, error: null };
    } catch (error) {
      console.error('Erro ao criar:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao criar item",
        variant: "destructive",
      });
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const update = async (table: string, id: string, data: any) => {
    setLoading(true);
    try {
      const { data: result, error } = await (supabase as any)
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Item atualizado com sucesso!",
      });
      
      return { data: result, error: null };
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao atualizar item",
        variant: "destructive",
      });
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const remove = async (table: string, id: string) => {
    setLoading(true);
    try {
      const { error } = await (supabase as any)
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Item removido com sucesso!",
      });
      
      return { error: null };
    } catch (error) {
      console.error('Erro ao remover:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao remover item",
        variant: "destructive",
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  return {
    create,
    update,
    remove,
    loading
  };
};