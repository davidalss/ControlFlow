import { useState, useEffect, useRef } from 'react';

export type ApiStatus = 'online' | 'offline' | 'connecting' | 'error';

interface UseApiStatusOptions {
  checkInterval?: number; // Intervalo em ms para verificar a API
  healthEndpoint?: string; // Endpoint para verificar saúde da API
  timeout?: number; // Timeout para a requisição
}

export const useApiStatus = (options: UseApiStatusOptions = {}) => {
  const {
    checkInterval = 10000, // 10 segundos
    healthEndpoint = 'http://localhost:5002/health',
    timeout = 5000 // 5 segundos
  } = options;

  const [status, setStatus] = useState<ApiStatus>('connecting');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const checkApiStatus = async () => {
    try {
      console.log('🔍 Verificando status da API...', healthEndpoint);
      
      // Cancelar requisição anterior se ainda estiver pendente
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Criar novo controller para esta requisição
      abortControllerRef.current = new AbortController();
      
      setStatus('connecting');
      setErrorMessage('');
      console.log('🔄 Status: connecting');

      const response = await fetch(healthEndpoint, {
        method: 'GET',
        signal: abortControllerRef.current.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Resposta da API:', response.status, response.statusText);

      if (response.ok) {
        setStatus('online');
        setErrorMessage('');
        console.log('✅ Status: online');
      } else {
        setStatus('error');
        setErrorMessage(`API retornou status ${response.status}`);
        console.log('❌ Status: error -', response.status);
      }
    } catch (error) {
      console.log('🚫 Erro na verificação:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          // Requisição foi cancelada, não fazer nada
          console.log('⏹️ Requisição cancelada');
          return;
        }
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Erro desconhecido');
      }
      
      setStatus('offline');
      console.log('🔴 Status: offline');
    } finally {
      setLastCheck(new Date());
    }
  };

  // Verificação inicial
  useEffect(() => {
    checkApiStatus();
  }, []);

  // Configurar verificação periódica
  useEffect(() => {
    intervalRef.current = setInterval(checkApiStatus, checkInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [checkInterval]);

  // Função para verificação manual
  const checkStatus = () => {
    checkApiStatus();
  };

  return {
    status,
    lastCheck,
    errorMessage,
    checkStatus,
    isOnline: status === 'online',
    isOffline: status === 'offline',
    isConnecting: status === 'connecting',
    hasError: status === 'error'
  };
};
