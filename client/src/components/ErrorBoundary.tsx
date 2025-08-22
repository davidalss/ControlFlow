// src/components/ErrorBoundary.tsx
import React from "react";
import { logger } from "@/lib/logger";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Bug, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  correlationId: string;
  errorCount: number;
  lastErrorTime: number;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{
    error: Error;
    errorInfo: React.ErrorInfo;
    correlationId: string;
    onRetry: () => void;
    onCopyError: () => void;
  }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo, correlationId: string) => void;
  feature?: string;
  resetOnPropsChange?: boolean;
  maxRetries?: number;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      correlationId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      errorCount: 0,
      lastErrorTime: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Atualizar state para mostrar UI de erro
    return {
      hasError: true,
      error,
      correlationId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      lastErrorTime: Date.now()
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { feature = 'ui', onError } = this.props;
    const correlationId = this.state.correlationId;
    
    // Log detalhado do erro
    console.group(`🛑 React Error Boundary - ${feature}`);
    
    log.error({
      feature,
      action: 'render-error',
      correlationId,
      details: {
        message: error.message,
        name: error.name,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        errorBoundary: this.constructor.name,
        props: this.sanitizeProps(this.props),
        state: this.sanitizeState(this.state),
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        errorCount: this.state.errorCount + 1
      }
    });
    
    log.groupEnd();

    // Atualizar state com informações do erro
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Callback customizado se fornecido
    if (onError) {
      try {
        onError(error, errorInfo, correlationId);
      } catch (callbackError) {
        log.error({
          feature,
          action: 'error-callback-failed',
          correlationId,
          details: {
            callbackError: callbackError instanceof Error ? callbackError.message : String(callbackError)
          }
        });
      }
    }

    // Reportar erro para serviços externos (opcional)
    this.reportErrorToService(error, errorInfo, correlationId);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetOnPropsChange } = this.props;
    
    // Reset automático quando props mudam (útil para mudanças de rota)
    if (resetOnPropsChange && this.state.hasError && prevProps.children !== this.props.children) {
      this.handleRetry();
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  private sanitizeProps(props: ErrorBoundaryProps) {
    const { children, onError, ...safeProp } = props;
    return {
      ...safeProp,
      hasChildren: !!children,
      hasOnError: !!onError
    };
  }

  private sanitizeState(state: ErrorBoundaryState) {
    return {
      hasError: state.hasError,
      errorCount: state.errorCount,
      lastErrorTime: state.lastErrorTime,
      correlationId: state.correlationId,
      errorMessage: state.error?.message,
      errorName: state.error?.name
    };
  }

  private reportErrorToService = async (error: Error, errorInfo: React.ErrorInfo, correlationId: string) => {
    try {
      // Exemplo de como reportar erros para um serviço externo
      // Aqui você poderia integrar com Sentry, LogRocket, etc.
      
      const errorReport = {
        correlationId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        feature: this.props.feature || 'ui'
      };

      // Para desenvolvimento, apenas loggar
      if (process.env.NODE_ENV === 'development') {
        console.group('🔴 Error Report (would be sent to external service)');
        console.log(errorReport);
        console.groupEnd();
      }

      // Em produção, você faria algo como:
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorReport)
      // });

    } catch (reportError) {
      log.error({
        feature: this.props.feature || 'ui',
        action: 'error-reporting-failed',
        correlationId,
        details: {
          reportError: reportError instanceof Error ? reportError.message : String(reportError)
        }
      });
    }
  };

  private handleRetry = () => {
    const { maxRetries = 3 } = this.props;
    const correlationId = generateCorrelationId();

    log.info({
      feature: this.props.feature || 'ui',
      action: 'error-boundary-retry',
      correlationId,
      details: {
        previousCorrelationId: this.state.correlationId,
        retryAttempt: this.state.errorCount,
        maxRetries
      }
    });

    // Verificar se excedeu o máximo de tentativas
    if (this.state.errorCount >= maxRetries) {
      log.warn({
        feature: this.props.feature || 'ui',
        action: 'max-retries-exceeded',
        correlationId,
        details: {
          errorCount: this.state.errorCount,
          maxRetries
        }
      });
      return;
    }

    // Reset do estado
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      correlationId
    });
  };

  private handleCopyError = () => {
    const { error, errorInfo, correlationId } = this.state;
    
    const errorDetails = {
      correlationId,
      timestamp: new Date().toISOString(),
      error: {
        message: error?.message,
        name: error?.name,
        stack: error?.stack
      },
      componentStack: errorInfo?.componentStack,
      feature: this.props.feature,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    const errorText = JSON.stringify(errorDetails, null, 2);
    
    navigator.clipboard.writeText(errorText).then(() => {
      // Mostrar toast de sucesso se possível
      log.info({
        feature: this.props.feature || 'ui',
        action: 'error-copied-to-clipboard',
        correlationId,
        details: { textLength: errorText.length }
      });
    }).catch((clipboardError) => {
      log.error({
        feature: this.props.feature || 'ui',
        action: 'clipboard-copy-failed',
        correlationId,
        details: { clipboardError: String(clipboardError) }
      });
    });
  };

  render() {
    const { hasError, error, errorInfo, correlationId, errorCount } = this.state;
    const { children, fallback: CustomFallback, maxRetries = 3 } = this.props;

    if (hasError && error && errorInfo) {
      // Se há um componente de fallback customizado
      if (CustomFallback) {
        return (
          <CustomFallback
            error={error}
            errorInfo={errorInfo}
            correlationId={correlationId}
            onRetry={this.handleRetry}
            onCopyError={this.handleCopyError}
          />
        );
      }

      // Componente de fallback padrão
      return (
        <DefaultErrorFallback
          error={error}
          errorInfo={errorInfo}
          correlationId={correlationId}
          errorCount={errorCount}
          maxRetries={maxRetries}
          onRetry={this.handleRetry}
          onCopyError={this.handleCopyError}
          feature={this.props.feature}
        />
      );
    }

    return children;
  }
}

// Componente de fallback padrão
interface DefaultErrorFallbackProps {
  error: Error;
  errorInfo: React.ErrorInfo;
  correlationId: string;
  errorCount: number;
  maxRetries: number;
  onRetry: () => void;
  onCopyError: () => void;
  feature?: string;
}

function DefaultErrorFallback({
  error,
  correlationId,
  errorCount,
  maxRetries,
  onRetry,
  onCopyError,
  feature
}: DefaultErrorFallbackProps) {
  const { toast } = useToast();
  
  const handleCopyWithToast = () => {
    onCopyError();
    toast({
      title: "Erro copiado",
      description: "Detalhes do erro foram copiados para a área de transferência"
    });
  };

  const canRetry = errorCount < maxRetries;

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6 bg-gray-50">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl text-red-900">
            Ops! Algo deu errado
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-gray-600">
              Ocorreu um erro inesperado{feature ? ` na funcionalidade ${feature}` : ''}.
            </p>
            
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="text-sm font-mono text-gray-700 break-all">
                ID: {correlationId}
              </div>
              {error.message && (
                <div className="text-sm text-red-600 mt-1">
                  {error.message}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            {canRetry && (
              <Button
                onClick={onRetry}
                className="flex-1"
                variant="default"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar Novamente
                {errorCount > 1 && ` (${maxRetries - errorCount} restantes)`}
              </Button>
            )}
            
            <Button
              onClick={handleCopyWithToast}
              variant="outline"
              className="flex-1"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copiar Detalhes
            </Button>
          </div>

          {!canRetry && (
            <div className="text-center">
              <p className="text-sm text-red-600 mb-2">
                Máximo de tentativas excedido
              </p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
              >
                Recarregar Página
              </Button>
            </div>
          )}

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Se o problema persistir, entre em contato com o suporte
              e informe o ID acima.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook para usar ErrorBoundary programaticamente
export function useErrorHandler() {
  return (error: Error, errorInfo?: any) => {
    const correlationId = generateCorrelationId();
    
    log.error({
      feature: 'manual-error-handler',
      action: 'manual-error',
      correlationId,
      details: {
        message: error.message,
        name: error.name,
        stack: error.stack,
        errorInfo,
        timestamp: new Date().toISOString()
      }
    });

    // Re-throw para que seja capturado pelo ErrorBoundary
    throw error;
  };
}

// HOC para adicionar ErrorBoundary a componentes
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryConfig?: Partial<ErrorBoundaryProps>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryConfig}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

export default ErrorBoundary;
