import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Tables = Database['public']['Tables'];

export const useSupabaseData = <T extends keyof Tables>(
  table: T,
  select = '*',
  filter?: (query: any) => any
) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase.from(table).select(select);
      
      if (filter) {
        query = filter(query);
      }
      
      const { data: result, error: fetchError } = await query;
      
      if (fetchError) {
        throw new Error(fetchError.message);
      }
      
      setData(result || []);
    } catch (err) {
      console.error('❌ Erro ao carregar dados:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [table, select]);

  const refetch = () => fetchData();

  return { data, loading, error, refetch };
};

export const useBuildings = () => useSupabaseData('buildings');
export const useUnits = () => useSupabaseData('units');
export const useMeters = () => useSupabaseData('meters');
export const useReadings = () => useSupabaseData('readings');
export const useProfiles = () => useSupabaseData('profiles');

// Hook específico para buildings com unidades
export const useBuildingsWithUnits = () => {
  return useSupabaseData('buildings', `
    *,
    units:units(*)
  `);
};

// Hook específico para units com building e meters
export const useUnitsWithDetails = () => {
  return useSupabaseData('units', `
    *,
    building:buildings(*),
    meters:meters(*)
  `);
};

// Hook específico para meters com detalhes
export const useMetersWithDetails = () => {
  return useSupabaseData('meters', `
    *,
    unit:units(
      *,
      building:buildings(*)
    )
  `);
};

// Hook específico para readings com detalhes
export const useReadingsWithDetails = () => {
  return useSupabaseData('readings', `
    *,
    meter:meters(
      *,
      unit:units(
        *,
        building:buildings(*)
      )
    )
  `);
};