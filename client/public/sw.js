// Service Worker mínimo para ENSO
// Versão: 2025.08.21.1842 - MÍNIMO

const CACHE_NAME = 'controlflow-v1.0.0';
const STATIC_CACHE = 'static-v1.0.0';
const DYNAMIC_CACHE = 'dynamic-v1.0.0';
const API_CACHE = 'api-v1.0.0';

// Arquivos para cache estático
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/apple-touch-icon.png',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/site.webmanifest'
];

// Estratégias de cache
const CACHE_STRATEGIES = {
  STATIC_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  CACHE_ONLY: 'cache-only',
  NETWORK_ONLY: 'network-only'
};

// Configurações de cache
const CACHE_CONFIG = {
  STATIC: {
    strategy: CACHE_STRATEGIES.STATIC_FIRST,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dias
    maxEntries: 100
  },
  DYNAMIC: {
    strategy: CACHE_STRATEGIES.NETWORK_FIRST,
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    maxEntries: 50
  },
  API: {
    strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
    maxAge: 5 * 60 * 1000, // 5 minutos
    maxEntries: 20
  }
};

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('🔄 Service Worker instalando...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Cache estático aberto');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('✅ Cache estático preenchido');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Erro ao instalar cache estático:', error);
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker ativando...');
  
  event.waitUntil(
    Promise.all([
      // Limpar caches antigos
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('🗑️ Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Tomar controle imediatamente
      self.clients.claim()
    ]).then(() => {
      console.log('✅ Service Worker ativado e pronto');
    })
  );
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Pular requisições não-GET
  if (request.method !== 'GET') {
    return;
  }
  
  // Pular requisições de extensões do navegador
  if (url.protocol === 'chrome-extension:') {
    return;
  }
  
  // Estratégias baseadas no tipo de recurso
  if (isStaticAsset(url)) {
    event.respondWith(handleStaticAsset(request));
  } else if (isApiRequest(url)) {
    event.respondWith(handleApiRequest(request));
  } else if (isNavigationRequest(request)) {
    event.respondWith(handleNavigationRequest(request));
  } else {
    event.respondWith(handleDynamicRequest(request));
  }
});

// Verificar se é um asset estático
function isStaticAsset(url) {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot'];
  return staticExtensions.some(ext => url.pathname.includes(ext)) || 
         STATIC_FILES.includes(url.pathname);
}

// Verificar se é uma requisição de API
function isApiRequest(url) {
  return url.pathname.startsWith('/api/') || 
         url.hostname.includes('supabase') ||
         url.hostname.includes('api.');
}

// Verificar se é uma requisição de navegação
function isNavigationRequest(request) {
  return request.mode === 'navigate' || 
         (request.method === 'GET' && request.headers.get('accept').includes('text/html'));
}

// Estratégia Cache First para assets estáticos
async function handleStaticAsset(request) {
  try {
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('📦 Asset estático servido do cache:', request.url);
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
      console.log('📦 Asset estático adicionado ao cache:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('❌ Erro ao buscar asset estático:', error);
    return new Response('Asset não encontrado', { status: 404 });
  }
}

// Estratégia Network First para APIs
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE);
  
  try {
    // Tentar rede primeiro
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache da resposta
      cache.put(request, networkResponse.clone());
      console.log('🌐 API servida da rede e cacheada:', request.url);
      return networkResponse;
    }
    
    throw new Error('Rede falhou');
  } catch (error) {
    // Fallback para cache
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('📦 API servida do cache (fallback):', request.url);
      return cachedResponse;
    }
    
    // Fallback offline
    return new Response(JSON.stringify({
      error: 'Serviço indisponível',
      message: 'Você está offline e não há dados em cache'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Estratégia Stale While Revalidate para navegação
async function handleNavigationRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  try {
    // Buscar do cache primeiro
    const cachedResponse = await cache.match(request);
    
    // Buscar da rede em background
    const networkPromise = fetch(request).then(async (response) => {
      if (response.ok) {
        cache.put(request, response.clone());
        console.log('🔄 Página atualizada em background:', request.url);
      }
      return response;
    }).catch(() => null);
    
    // Retornar cache se disponível, senão aguardar rede
    if (cachedResponse) {
      console.log('📦 Página servida do cache:', request.url);
      return cachedResponse;
    }
    
    const networkResponse = await networkPromise;
    if (networkResponse) {
      return networkResponse;
    }
    
    // Fallback offline
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Offline - ControlFlow</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 50px; 
              background: #f5f5f5; 
            }
            .offline-card {
              background: white;
              padding: 40px;
              border-radius: 10px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              max-width: 500px;
              margin: 0 auto;
            }
            .offline-icon {
              font-size: 48px;
              margin-bottom: 20px;
            }
          </style>
        </head>
        <body>
          <div class="offline-card">
            <div class="offline-icon">📱</div>
            <h1>Você está offline</h1>
            <p>Algumas funcionalidades podem não estar disponíveis.</p>
            <p>Tente verificar sua conexão com a internet.</p>
            <button onclick="window.location.reload()">Tentar novamente</button>
          </div>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  } catch (error) {
    console.error('❌ Erro na navegação:', error);
    return new Response('Erro interno', { status: 500 });
  }
}

// Estratégia Network First para requisições dinâmicas
async function handleDynamicRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
      console.log('🌐 Recurso dinâmico servido da rede:', request.url);
      return networkResponse;
    }
    
    throw new Error('Rede falhou');
  } catch (error) {
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('📦 Recurso dinâmico servido do cache:', request.url);
      return cachedResponse;
    }
    
    return new Response('Recurso não encontrado', { status: 404 });
  }
}

// Limpeza periódica de cache
async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const cacheTime = response.headers.get('sw-cache-time');
        if (cacheTime) {
          const age = Date.now() - parseInt(cacheTime);
          const maxAge = CACHE_CONFIG[cacheName]?.maxAge || 24 * 60 * 60 * 1000;
          
          if (age > maxAge) {
            await cache.delete(request);
            console.log('🗑️ Cache expirado removido:', request.url);
          }
        }
      }
    }
  }
}

// Limpeza de cache a cada hora
setInterval(cleanupOldCaches, 60 * 60 * 1000);

// Mensagens do Service Worker
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

console.log('🔄 Service Worker carregado');
