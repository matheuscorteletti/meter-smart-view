
import { useState, useEffect } from 'react';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://192.168.100.234:3001/api';

export const useApi = () => {
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    console.log('🌐 Fazendo chamada API para:', `${BASE_URL}${endpoint}`);
    console.log('📋 Opções da requisição:', options);
    
    const config: RequestInit = {
      ...options,
      credentials: 'include', // CRUCIAL: Incluir cookies automaticamente
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    console.log('🔧 Configuração final da requisição:', {
      url: `${BASE_URL}${endpoint}`,
      method: config.method || 'GET',
      credentials: config.credentials,
      headers: config.headers
    });

    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    
    console.log('📡 Resposta da API:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
      console.error('❌ Erro na API:', errorData);
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Dados recebidos:', data);
    return data;
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
      console.log('🔄 Carregando dados do endpoint:', endpoint);
      const result = await apiCall(endpoint);
      setData(result);
      console.log('✅ Dados carregados com sucesso:', result);
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
  }, [endpoint]);

  return { data, loading, error, refetch: fetchData };
};
