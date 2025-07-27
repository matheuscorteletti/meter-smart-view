import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Hook para buscar dados do Supabase
export const useSupabaseQuery = <T>(
  queryKey: string[],
  table: string,
  selectColumns = '*',
  filters?: Record<string, any>
) => {
  return useQuery({
    queryKey,
    queryFn: async () => {
      let query = supabase.from(table).select(selectColumns);
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data as T[];
    },
  });
};

// Hook para mutações (insert, update, delete)
export const useSupabaseMutation = (
  table: string,
  operation: 'insert' | 'update' | 'delete' = 'insert'
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ data, id }: { data?: any; id?: string }) => {
      let result;
      
      switch (operation) {
        case 'insert':
          result = await supabase.from(table).insert(data).select();
          break;
        case 'update':
          result = await supabase.from(table).update(data).eq('id', id).select();
          break;
        case 'delete':
          result = await supabase.from(table).delete().eq('id', id);
          break;
      }
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      return result.data;
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: [table] });
    },
  });
};

// Hooks específicos para cada entidade
export const useBuildings = () => {
  return useSupabaseQuery(['buildings'], 'buildings');
};

export const useUnits = (buildingId?: string) => {
  return useSupabaseQuery(
    ['units', buildingId],
    'units',
    '*',
    buildingId ? { building_id: buildingId } : undefined
  );
};

export const useMeters = (unitId?: string) => {
  return useSupabaseQuery(
    ['meters', unitId],
    'meters',
    '*',
    unitId ? { unit_id: unitId } : undefined
  );
};

export const useReadings = (meterId?: string) => {
  return useSupabaseQuery(
    ['readings', meterId],
    'readings',
    '*',
    meterId ? { meter_id: meterId } : undefined
  );
};

export const useProfiles = () => {
  return useSupabaseQuery(['profiles'], 'profiles');
};

// Mutation hooks
export const useBuildingMutation = (operation: 'insert' | 'update' | 'delete' = 'insert') => {
  return useSupabaseMutation('buildings', operation);
};

export const useUnitMutation = (operation: 'insert' | 'update' | 'delete' = 'insert') => {
  return useSupabaseMutation('units', operation);
};

export const useMeterMutation = (operation: 'insert' | 'update' | 'delete' = 'insert') => {
  return useSupabaseMutation('meters', operation);
};

export const useReadingMutation = (operation: 'insert' | 'update' | 'delete' = 'insert') => {
  return useSupabaseMutation('readings', operation);
};

export const useProfileMutation = (operation: 'insert' | 'update' | 'delete' = 'insert') => {
  return useSupabaseMutation('profiles', operation);
};