// Service Worker para ENSO - Sistema de Controle de Qualidade
// Versão: 2025.01.20.002 - SIMPLIFICADA

const CACHE_NAME = 'enso-cache-v2025.01.20.002';

// Arquivos que devem ser cacheados estaticamente
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/site.webmanifest',
  '/favicon.ico'
];

// Função para limpar caches antigos
async function cleanOldCaches() {
  const cacheNames = await caches.keys();
  const cachesToDelete = cacheNames.filter(name => 
    name !== CACHE_NAME
  );
  
  await Promise.all(cachesToDelete.map(name => caches.delete(name)));
  console.log('[SW] Caches antigos removidos:', cachesToDelete);
}

// Install event - cachear assets estáticos
self.addEventListener('install', event => {
  console.log('[SW] Service Worker instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Cacheando assets estáticos');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Service Worker instalado com sucesso');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Erro ao instalar:', error);
      })
  );
});

// Activate event - limpar caches antigos e assumir controle
self.addEventListener('activate', event => {
  console.log('[SW] Service Worker ativando...');
  
  event.waitUntil(
    Promise.all([
      cleanOldCaches(),
      self.clients.claim()
    ]).then(() => {
      console.log('[SW] Service Worker ativado com sucesso');
    })
  );
});

// Fetch event - estratégia simples
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorar requisições não-GET
  if (request.method !== 'GET') {
    return;
  }
  
  // Ignorar requisições para APIs externas
  if (url.origin !== location.origin) {
    return;
  }
  
  // Estratégia simples: Network First para tudo
  event.respondWith(
    fetch(request)
      .then(response => {
        // Se a resposta for válida, cachear
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(request, responseClone);
            });
        }
        return response;
      })
      .catch(() => {
        // Se a rede falhar, buscar do cache
        return caches.match(request);
      })
  );
});

// Message event para comunicação com a aplicação
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    cleanOldCaches();
  }
});

// Error handling global
self.addEventListener('error', event => {
  console.error('[SW] Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
  console.error('[SW] Unhandled promise rejection:', event.reason);
});
