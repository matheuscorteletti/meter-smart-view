
import { useState, useEffect } from 'react';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const useApi = () => {
  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  };

  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro na API');
    }

    return response.json();
  };

  return { apiCall };
};

export const useApiData = <T>(endpoint: string) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { apiCall } = useApi();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall(endpoint);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [endpoint]);

  return { data, loading, error, refetch: fetchData };
};
