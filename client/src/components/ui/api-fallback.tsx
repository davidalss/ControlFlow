import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';

interface ApiFallbackProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export function ApiFallback({ 
  title = "Serviço Temporariamente Indisponível",
  message = "Não foi possível conectar ao servidor. Verifique sua conexão com a internet e tente novamente.",
  onRetry,
  showRetry = true
}: ApiFallbackProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
          </div>
          <CardTitle className="text-lg font-semibold text-gray-900">
            {title}
          </CardTitle>
          <CardDescription className="text-sm text-gray-600">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {showRetry && onRetry && (
            <Button 
              onClick={onRetry}
              className="w-full"
              variant="outline"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar Novamente
            </Button>
          )}
          <p className="mt-4 text-xs text-gray-500">
            Se o problema persistir, entre em contato com o suporte técnico.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function LoadingFallback({ message = "Carregando..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <RefreshCw className="h-6 w-6 text-blue-600 animate-spin" />
          </div>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Carregando...
          </CardTitle>
          <CardDescription className="text-sm text-gray-600">
            {message}
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
