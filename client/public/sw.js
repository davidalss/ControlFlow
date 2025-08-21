// Service Worker para ENSO - Sistema de Controle de Qualidade
// Versão: 2025.01.20.001 - CORRIGIDA

const CACHE_NAME = 'enso-cache-v2025.01.20';
const STATIC_CACHE_NAME = 'enso-static-v2025.01.20';
const DYNAMIC_CACHE_NAME = 'enso-dynamic-v2025.01.20';

// Arquivos que devem ser cacheados estaticamente
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/site.webmanifest',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/apple-touch-icon.png',
  '/favicon.ico',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/logo-white.svg',
  '/logo-dark.svg'
];

// Função para limpar caches antigos
async function cleanOldCaches() {
  const cacheNames = await caches.keys();
  const cachesToDelete = cacheNames.filter(name => 
    name !== CACHE_NAME && 
    name !== STATIC_CACHE_NAME && 
    name !== DYNAMIC_CACHE_NAME &&
    !name.includes('v2025.01.20') // Manter apenas versão atual
  );
  
  await Promise.all(cachesToDelete.map(name => caches.delete(name)));
  console.log('[SW] Caches antigos removidos:', cachesToDelete);
}

// Install event - cachear assets estáticos
self.addEventListener('install', event => {
  console.log('[SW] Service Worker instalando...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
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

// Fetch event - estratégia de cache melhorada
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
  
  // Estratégia para diferentes tipos de recursos
  if (url.pathname === '/' || url.pathname === '/index.html') {
    // HTML principal - Network First
    event.respondWith(networkFirst(request));
  } else if (url.pathname.includes('/api/')) {
    // APIs - Network First, sem cache
    event.respondWith(networkOnly(request));
  } else if (url.pathname.includes('.js') || url.pathname.includes('.css') || 
             url.pathname.includes('.png') || url.pathname.includes('.svg') ||
             url.pathname.includes('.ico') || url.pathname.includes('.woff')) {
    // Assets estáticos - Cache First
    event.respondWith(cacheFirst(request));
  } else {
    // Outros recursos - Network First
    event.respondWith(networkFirst(request));
  }
});

// Estratégia Network First
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', error);
  }
  
  const cachedResponse = await caches.match(request);
  return cachedResponse || new Response('Not found', { status: 404 });
}

// Estratégia Cache First
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache and network failed:', error);
    return new Response('Not found', { status: 404 });
  }
}

// Estratégia Network Only
async function networkOnly(request) {
  try {
    return await fetch(request);
  } catch (error) {
    console.error('[SW] Network failed:', error);
    return new Response('Network error', { status: 503 });
  }
}

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
