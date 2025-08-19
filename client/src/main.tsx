// Desabilitar HMR do Vite
import "../vite-env.d.ts";

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Prevenir erros de favicon no console
const preventFaviconError = () => {
  const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
  link.type = 'image/x-icon';
  link.rel = 'shortcut icon';
  link.href = '/favicon.ico';
  document.getElementsByTagName('head')[0].appendChild(link);
};

// Executar quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', preventFaviconError);
} else {
  preventFaviconError();
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
