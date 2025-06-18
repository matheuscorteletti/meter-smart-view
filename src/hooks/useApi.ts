
import { useState, useEffect } from 'react';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export const useApi = () => {
  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  };

  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    console.log('Fazendo chamada para:', `${BASE_URL}${endpoint}`);
    
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...getHeaders(),
        ...options.headers,
      },
    });

    console.log('Resposta da API:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erro na API' }));
      throw new Error(errorData.error || `Erro HTTP ${response.status}`);
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
      console.log('Buscando dados do endpoint:', endpoint);
      const result = await apiCall(endpoint);
      console.log('Dados recebidos:', result);
      setData(result);
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [endpoint]);

  return { data, loading, error, refetch: fetchData };
};
