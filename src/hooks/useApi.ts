// Compatibility layer - DEPRECATED
// All components should be migrated to useSupabaseData

export const useApi = () => {
  const apiCall = async (endpoint: string, options: any = {}) => {
    console.error('useApi is deprecated and non-functional. Use Supabase hooks instead.');
    return [];
  };

  return { apiCall };
};

export const useApiData = <T>(endpoint: string) => {
  console.error('useApiData is deprecated. Use Supabase hooks instead.');
  
  return {
    data: [] as T[],
    loading: false,
    error: 'Component needs migration to Supabase',
    refetch: () => {}
  };
};