// Desabilitar HMR do Vite
import "../vite-env.d.ts";

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/globals.css'

// Importar sistema de logging global
import { log, generateCorrelationId } from './lib/logger';

// Prevenir erros de favicon no console
const preventFaviconError = () => {
  const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
  link.type = 'image/x-icon';
  link.rel = 'shortcut icon';
  link.href = '/favicon.ico';
  document.getElementsByTagName('head')[0].appendChild(link);
};

// Setup de listeners de erros globais
const setupGlobalErrorHandlers = () => {
  // Handler para erros JavaScript não capturados
  window.addEventListener('error', (event) => {
    const correlationId = generateCorrelationId();
    
    log.group('🚨 Global JavaScript Error');
    log.error({
      feature: 'global',
      action: 'window-error',
      correlationId,
      details: {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        type: 'javascript-error'
      }
    });
    log.groupEnd();
  });

  // Handler para promises rejeitadas não capturadas
  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    const correlationId = generateCorrelationId();
    
    log.group('🚨 Unhandled Promise Rejection');
    log.error({
      feature: 'global',
      action: 'unhandled-rejection',
      correlationId,
      details: {
        reason: String(event.reason),
        reasonType: typeof event.reason,
        stack: event.reason?.stack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        type: 'promise-rejection',
        // Tentar extrair mais informações se for um erro HTTP
        ...(event.reason?.status && {
          httpStatus: event.reason.status,
          httpMessage: event.reason.message,
          httpCorrelationId: event.reason.correlationId
        })
      }
    });
    log.groupEnd();

    // Prevenir que o erro apareça no console do browser
    // event.preventDefault();
  });

  // Handler para recursos que falharam ao carregar
  window.addEventListener('error', (event) => {
    // Apenas para elementos (não erros de script)
    if (event.target && event.target !== window) {
      const target = event.target as Element;
      const correlationId = generateCorrelationId();
      
      log.group('🚨 Resource Load Error');
      log.error({
        feature: 'global',
        action: 'resource-error',
        correlationId,
        details: {
          tagName: target.tagName,
          src: (target as any).src || (target as any).href,
          message: 'Failed to load resource',
          timestamp: new Date().toISOString(),
          url: window.location.href,
          type: 'resource-error'
        }
      });
      log.groupEnd();
    }
  }, true); // Usar capture phase para pegar erros de recursos
  
  // Log de inicialização da aplicação
  log.group('🚀 Application Bootstrap');
  log.info({
    feature: 'global',
    action: 'app-bootstrap',
    correlationId: generateCorrelationId(),
    details: {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      screen: {
        width: window.screen.width,
        height: window.screen.height
      },
      env: {
        nodeEnv: import.meta.env.MODE,
        debugLogs: import.meta.env.VITE_APP_DEBUG_LOGS,
        baseUrl: import.meta.env.VITE_API_URL
      }
    }
  });
  log.groupEnd();
};

// Executar quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    preventFaviconError();
    setupGlobalErrorHandlers();
  });
} else {
  preventFaviconError();
  setupGlobalErrorHandlers();
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
