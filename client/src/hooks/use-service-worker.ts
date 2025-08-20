import { useEffect, useState, useCallback } from 'react';

interface ServiceWorkerMessage {
  type: 'UPDATE_AVAILABLE';
  timestamp: number;
}

export function useServiceWorker() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [showReload, setShowReload] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Registrar service worker
  const registerServiceWorker = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });

        console.log('[SW] Service Worker registrado:', registration);

        // Verificar se há uma nova versão
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setWaitingWorker(newWorker);
                setShowReload(true);
              }
            });
          }
        });

        // Escutar mensagens do service worker
        navigator.serviceWorker.addEventListener('message', (event: MessageEvent<ServiceWorkerMessage>) => {
          if (event.data.type === 'UPDATE_AVAILABLE') {
            console.log('[SW] Nova atualização disponível:', event.data.timestamp);
            setShowReload(true);
          }
        });

        return registration;
      } catch (error) {
        console.error('[SW] Erro ao registrar service worker:', error);
      }
    }
  }, []);

  // Atualizar o app
  const updateApp = useCallback(() => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      setWaitingWorker(null);
      setShowReload(false);
      window.location.reload();
    }
  }, [waitingWorker]);

  // Limpar cache
  const clearCache = useCallback(async () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
    }
  }, []);

  // Verificar conectividade
  const checkOnlineStatus = useCallback(() => {
    setIsOnline(navigator.onLine);
  }, []);

  useEffect(() => {
    // Registrar service worker na inicialização
    registerServiceWorker();

    // Escutar eventos de conectividade
    window.addEventListener('online', checkOnlineStatus);
    window.addEventListener('offline', checkOnlineStatus);

    return () => {
      window.removeEventListener('online', checkOnlineStatus);
      window.removeEventListener('offline', checkOnlineStatus);
    };
  }, [registerServiceWorker, checkOnlineStatus]);

  return {
    waitingWorker,
    showReload,
    isOnline,
    updateApp,
    clearCache,
    registerServiceWorker
  };
}
