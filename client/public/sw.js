// Service Worker para ENSO - Sistema de Controle de Qualidade
// Versão: 2025.08.19.2225

const CACHE_NAME = 'enso-cache-2025.08.19.2225';
const STATIC_CACHE_NAME = 'enso-static-2025.08.19.2225';
const DYNAMIC_CACHE_NAME = 'enso-dynamic-2025.08.19.2225';

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
  '/favicon-32x32.png'
];

// Estratégia de cache: Network First para HTML, Cache First para assets
const CACHE_STRATEGIES = {
  // HTML e API calls - Network First
  'html': 'network-first',
  'api': 'network-first',
  // Assets estáticos - Cache First
  'js': 'cache-first',
  'css': 'cache-first',
  'images': 'cache-first',
  'fonts': 'cache-first',
  'assets': 'cache-first'
};

// Função para determinar a estratégia baseada na URL
function getCacheStrategy(url) {
  const pathname = new URL(url).pathname;
  
  if (pathname.endsWith('.html') || pathname === '/' || pathname.includes('/api/')) {
    return 'network-first';
  }
  
  if (pathname.includes('/js/') || pathname.includes('/css/') || 
      pathname.includes('/images/') || pathname.includes('/fonts/') ||
      pathname.includes('/assets/')) {
    return 'cache-first';
  }
  
  return 'network-first';
}

// Função para limpar caches antigos
async function cleanOldCaches() {
  const cacheNames = await caches.keys();
  const cachesToDelete = cacheNames.filter(name => 
    name !== CACHE_NAME && 
    name !== STATIC_CACHE_NAME && 
    name !== DYNAMIC_CACHE_NAME
  );
  
  await Promise.all(cachesToDelete.map(name => caches.delete(name)));
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

// Fetch event - estratégia de cache
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorar requisições não-GET
  if (request.method !== 'GET') {
    return;
  }
  
  // Ignorar requisições para APIs externas (exceto nossa API)
  if (!url.origin.includes('onrender.com') && !url.origin.includes('localhost')) {
    return;
  }
  
  const strategy = getCacheStrategy(request.url);
  
  if (strategy === 'network-first') {
    event.respondWith(handleNetworkFirst(request));
  } else if (strategy === 'cache-first') {
    event.respondWith(handleCacheFirst(request));
  }
});

// Estratégia Network First - para HTML e APIs
async function handleNetworkFirst(request) {
  try {
    // Tentar buscar da rede primeiro
    const networkResponse = await fetch(request);
    
    // Se a resposta for válida, cachear
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Rede indisponível, buscando do cache:', request.url);
    
    // Se a rede falhar, buscar do cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Se não estiver no cache, retornar página offline
    if (request.destination === 'document') {
      return caches.match('/index.html');
    }
    
    throw error;
  }
}

// Estratégia Cache First - para assets estáticos
async function handleCacheFirst(request) {
  // Buscar do cache primeiro
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Verificar se o cache não está muito antigo (mais de 1 dia)
    const cacheDate = new Date(cachedResponse.headers.get('date'));
    const now = new Date();
    const cacheAge = now - cacheDate;
    const oneDay = 24 * 60 * 60 * 1000;
    
    if (cacheAge < oneDay) {
      return cachedResponse;
    }
  }
  
  try {
    // Se não estiver no cache ou estiver antigo, buscar da rede
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Se a rede falhar e tivermos cache, usar o cache
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Função para forçar atualização do cache
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      })
    );
  }
});

// Função para verificar atualizações
async function checkForUpdates() {
  try {
    const response = await fetch('/index.html', { cache: 'no-cache' });
    const newETag = response.headers.get('etag');
    
    // Comparar com ETag anterior (se existir)
    // Se diferente, limpar cache e recarregar
    if (newETag && newETag !== self.currentETag) {
      self.currentETag = newETag;
      await cleanOldCaches();
      
      // Notificar clientes sobre a atualização
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'UPDATE_AVAILABLE',
          timestamp: Date.now()
        });
      });
    }
  } catch (error) {
    console.log('[SW] Erro ao verificar atualizações:', error);
  }
}

// Verificar atualizações periodicamente (a cada 1 hora)
setInterval(checkForUpdates, 60 * 60 * 1000);
