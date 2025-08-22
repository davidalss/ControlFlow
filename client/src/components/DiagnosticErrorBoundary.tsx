import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class DiagnosticErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 ERRO CAPTURADO PELO ERROR BOUNDARY:', error);
    console.error('📋 Stack trace:', errorInfo.componentStack);
    
    // Log detalhado para diagnóstico
    this.logErrorDetails(error, errorInfo);
    
    // Callback opcional
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private logErrorDetails(error: Error, errorInfo: ErrorInfo) {
    const errorDetails = {
      message: error.message,
      name: error.name,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    console.group('🔍 DIAGNÓSTICO DE ERRO');
    console.log('Tipo de erro:', error.name);
    console.log('Mensagem:', error.message);
    console.log('Componente:', errorInfo.componentStack);
    console.log('URL:', window.location.href);
    console.log('Timestamp:', errorDetails.timestamp);
    
    // Detectar tipo específico de erro
    if (error.message.includes('is not defined')) {
      console.error('🚨 ERRO DE IMPORT NÃO RESOLVIDO DETECTADO!');
      console.log('💡 Solução: Verificar se o componente foi importado corretamente');
      console.log('💡 Exemplo: import { Label } from "@/components/ui/label"');
    }
    
    if (error.message.includes('Cannot read properties of undefined')) {
      console.error('🚨 ERRO DE PROPRIEDADE UNDEFINIDA DETECTADO!');
      console.log('💡 Solução: Verificar se o objeto existe antes de acessar propriedades');
    }
    
    console.groupEnd();
    
    // Enviar para sistema de diagnóstico se disponível
    if (window.diagnostics) {
      window.diagnostics.logError(errorDetails);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <div className="mt-4 text-center">
              <h3 className="text-lg font-medium text-gray-900">
                Algo deu errado
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Ocorreu um erro inesperado. Nossa equipe foi notificada.
              </p>
              
              {this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                    Detalhes do erro
                  </summary>
                  <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-600 overflow-auto">
                    <div><strong>Erro:</strong> {this.state.error.name}</div>
                    <div><strong>Mensagem:</strong> {this.state.error.message}</div>
                    {this.state.error.stack && (
                      <div className="mt-2">
                        <strong>Stack:</strong>
                        <pre className="whitespace-pre-wrap">{this.state.error.stack}</pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
              
              <div className="mt-6">
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Recarregar página
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC para envolver componentes com Error Boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <DiagnosticErrorBoundary fallback={fallback}>
        <Component {...props} />
      </DiagnosticErrorBoundary>
    );
  };
}

// Hook para capturar erros em componentes funcionais
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('🚨 ERRO GLOBAL CAPTURADO:', event.error);
      setError(event.error);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('🚨 PROMISE REJECTION CAPTURADA:', event.reason);
      setError(new Error(event.reason));
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return error;
}
