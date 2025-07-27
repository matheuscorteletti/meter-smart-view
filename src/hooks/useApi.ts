// Compatibility layer for Supabase migration
import { useSupabaseData } from './useSupabaseData';

export const useApi = () => {
  const apiCall = async (endpoint: string, options: any = {}) => {
    console.warn('useApi is deprecated, please use Supabase hooks directly');
    throw new Error('This API call needs to be migrated to Supabase');
  };

  return { apiCall };
};

export const useApiData = <T>(endpoint: string) => {
  console.warn('useApiData is deprecated, please use Supabase hooks directly');
  
  // Map old endpoints to new Supabase hooks
  const table = endpoint.replace('/', '').replace('s', '') as 'building' | 'meter' | 'unit' | 'reading' | 'profile';
  
  return {
    data: [] as T[],
    loading: false,
    error: 'This component needs to be migrated to Supabase',
    refetch: () => {}
  };
};