/// <reference types="vite/client" />

// Desabilitar HMR globalmente
declare global {
  interface Window {
    __VITE_HMR_DISABLE__: true;
    __VITE_HMR_PORT__: 0;
    __VITE_HMR_HOST__: null;
    __VITE_HMR_ENABLED__: false;
  }
}

// Forçar desabilitamento do HMR
window.__VITE_HMR_DISABLE__ = true;
window.__VITE_HMR_PORT__ = 0;
window.__VITE_HMR_HOST__ = null;
window.__VITE_HMR_ENABLED__ = false;
