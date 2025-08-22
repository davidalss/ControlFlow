// Desabilitar HMR do Vite
import "../vite-env.d.ts";

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/globals.css'

// Importar sistema de logging global
import { logger } from './lib/logger';

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
    console.error('🚨 Global JavaScript Error:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack
    });
  });

  // Handler para promises rejeitadas não capturadas
  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    console.error('🚨 Unhandled Promise Rejection:', {
      reason: String(event.reason),
      stack: event.reason?.stack
    });
  });

  // Handler para recursos que falharam ao carregar
  window.addEventListener('error', (event) => {
    // Apenas para elementos (não erros de script)
    if (event.target && event.target !== window) {
      const target = event.target as Element;
      console.error('🚨 Resource Load Error:', {
        tagName: target.tagName,
        src: (target as any).src || (target as any).href
      });
    }
  }, true); // Usar capture phase para pegar erros de recursos
  
  // Log de inicialização da aplicação
  console.log('🚀 Application Bootstrap:', {
    timestamp: new Date().toISOString(),
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
  });
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
