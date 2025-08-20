import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useServiceWorker } from '@/hooks/use-service-worker';

export function UpdateNotification() {
  const { showReload, isOnline, updateApp } = useServiceWorker();

  if (!showReload && isOnline) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      {showReload && (
        <Alert className="mb-2 border-blue-200 bg-blue-50">
          <RefreshCw className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="flex items-center justify-between">
              <span>Nova versão disponível!</span>
              <Button
                size="sm"
                onClick={updateApp}
                className="ml-2 bg-blue-600 hover:bg-blue-700"
              >
                Atualizar
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {!isOnline && (
        <Alert className="border-orange-200 bg-orange-50">
          <WifiOff className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            Você está offline. Algumas funcionalidades podem não estar disponíveis.
          </AlertDescription>
        </Alert>
      )}

      {isOnline && !showReload && (
        <Alert className="border-green-200 bg-green-50">
          <Wifi className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Conectado e atualizado
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
