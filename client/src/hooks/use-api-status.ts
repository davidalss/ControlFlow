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
    healthEndpoint = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/health` : 'https://enso-backend-0aa1.onrender.com/health',
    timeout = 5000 // 5 segundos
  } = options;

  const [status, setStatus] = useState<ApiStatus>('connecting');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef<number>(0);
  const maxRetries = 5;

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
        retryCountRef.current = 0; // Reset retry count on success
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
      
      // Implementar exponential backoff
      retryCountRef.current = Math.min(retryCountRef.current + 1, maxRetries);
      const backoffDelay = Math.min(1000 * Math.pow(2, retryCountRef.current - 1), 30000); // 1s, 2s, 4s, 8s, 16s, max 30s
      
      setStatus('offline');
      console.log(`🔴 Status: offline (tentativa ${retryCountRef.current}/${maxRetries}, próximo retry em ${backoffDelay}ms)`);
      
      // Agendar próximo retry com backoff
      setTimeout(() => {
        if (retryCountRef.current < maxRetries) {
          checkApiStatus();
        }
      }, backoffDelay);
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
