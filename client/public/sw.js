// Service Worker mínimo para ENSO
// Versão: 2025.01.20.003 - MÍNIMO

console.log('[SW] Service Worker carregado');

// Install event - apenas log
self.addEventListener('install', event => {
  console.log('[SW] Service Worker instalado');
  self.skipWaiting();
});

// Activate event - apenas log
self.addEventListener('activate', event => {
  console.log('[SW] Service Worker ativado');
  self.clients.claim();
});

// Fetch event - não interceptar nada
self.addEventListener('fetch', event => {
  // Não fazer nada - deixar o navegador lidar normalmente
  return;
});
