// VERSÃO FORÇADA - QUEBRAR CACHE
const CACHE_VERSION = 'v1.0.0-' + Date.now();
const CACHE_NAME = 'sistema-vendas-' + CACHE_VERSION;

console.log('🔄 Service Worker atualizando para versão:', CACHE_VERSION);

const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';
const API_CACHE = 'api-v1';

// Arquivos para cache estático (sempre disponíveis offline)
const STATIC_FILES = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/css/components.css',
    '/css/ui.css',
    '/css/fontawesome.css',
    '/js/app.js',
    '/js/api.js',
    '/js/database.js',
    '/js/ui.js',
    '/js/utils/event-manager.js',
    '/js/pages/dashboard.js',
    '/js/pages/clientes.js',
    '/js/pages/produtos.js',
    '/js/pages/vendas.js',
    '/js/pages/orcamentos.js',
    // '/js/pages/relatorios.js', // DESABILITADO - Sempre carregar do servidor
    '/js/init.js',
    '/manifest.json',
    '/favicon.ico',
    '/favicon-16x16.png',
    '/favicon-32x32.png',
    '/apple-touch-icon.png'
];

// Estratégias de cache
const CACHE_STRATEGIES = {
    STATIC: 'cache-first',      // Cache primeiro, depois rede
    DYNAMIC: 'stale-while-revalidate', // Cache antigo + atualiza em background
    API: 'network-first',       // Rede primeiro, cache como fallback
    IMAGES: 'cache-first'       // Imagens sempre do cache se disponível
};

// Instalação do Service Worker
self.addEventListener('install', (event) => {
    console.log('🚀 Service Worker instalando...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('📦 Cacheando arquivos estáticos...');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('✅ Service Worker instalado com sucesso!');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('❌ Erro ao instalar Service Worker:', error);
            })
    );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
    console.log('🔄 Service Worker ativando...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        // Remover caches antigos
                        if (cacheName !== STATIC_CACHE && 
                            cacheName !== DYNAMIC_CACHE && 
                            cacheName !== API_CACHE) {
                            console.log('🗑️ Removendo cache antigo:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('✅ Service Worker ativado!');
                return self.clients.claim();
            })
    );
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Ignorar requisições não-GET
    if (request.method !== 'GET') {
        return;
    }
    
    // REGRA ESPECIAL: relatorios.js sempre do servidor (sem cache)
    if (url.pathname === '/js/pages/relatorios.js') {
        console.log('🔄 RELATÓRIOS - Sempre carregando do servidor (sem cache)');
        // Não usar event.respondWith para evitar conflitos
        return;
    }
    
    // Estratégia baseada no tipo de recurso
    if (isStaticFile(url.pathname)) {
        event.respondWith(cacheFirst(request, STATIC_CACHE));
    } else if (isAPIRequest(url.pathname)) {
        event.respondWith(networkFirst(request, API_CACHE));
    } else if (isImageRequest(url.pathname)) {
        event.respondWith(cacheFirst(request, DYNAMIC_CACHE));
    } else {
        event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
    }
});

// Estratégia: Cache First (para arquivos estáticos)
async function cacheFirst(request, cacheName) {
    try {
        // Verificar se é uma requisição válida para cache
        const url = new URL(request.url);
        
        // Ignorar requisições de extensões do Chrome
        if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') {
            console.log('⚠️ Ignorando requisição de extensão:', url.href);
            return fetch(request);
        }
        
        // Ignorar requisições de outros protocolos não suportados
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            console.log('⚠️ Ignorando protocolo não suportado:', url.protocol);
            return fetch(request);
        }
        
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.warn('⚠️ Cache First falhou:', error);
        return new Response('Offline - Recurso não disponível', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Estratégia: Network First (para APIs)
async function networkFirst(request, cacheName) {
    try {
        // Verificar se é uma requisição válida para cache
        const url = new URL(request.url);
        
        // Ignorar requisições de extensões do Chrome
        if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') {
            console.log('⚠️ Ignorando requisição de extensão:', url.href);
            return fetch(request);
        }
        
        // Ignorar requisições de outros protocolos não suportados
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            console.log('⚠️ Ignorando protocolo não suportado:', url.protocol);
            return fetch(request);
        }
        
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.log('🌐 Rede indisponível, usando cache...');
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Retornar dados offline se disponível
        return getOfflineData(request);
    }
}

// Estratégia: Stale While Revalidate (para recursos dinâmicos)
async function staleWhileRevalidate(request, cacheName) {
    try {
        // Verificar se é uma requisição válida para cache
        const url = new URL(request.url);
        
        // Ignorar requisições de extensões do Chrome
        if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') {
            console.log('⚠️ Ignorando requisição de extensão:', url.href);
            return fetch(request);
        }
        
        // Ignorar requisições de outros protocolos não suportados
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            console.log('⚠️ Ignorando protocolo não suportado:', url.protocol);
            return fetch(request);
        }
        
        const cachedResponse = await caches.match(request);
        const fetchPromise = fetch(request).then(async (networkResponse) => {
            if (networkResponse.ok) {
                const cache = await caches.open(cacheName);
                cache.put(request, networkResponse.clone());
            }
            return networkResponse;
        });
        
        return cachedResponse || fetchPromise;
    } catch (error) {
        console.warn('⚠️ Stale While Revalidate falhou:', error);
        return new Response('Offline - Recurso não disponível', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Verificar se é arquivo estático
function isStaticFile(pathname) {
    return STATIC_FILES.some(file => pathname === file || 
        pathname.endsWith('.css') || 
        pathname.endsWith('.js') || 
        pathname.endsWith('.png') || 
        pathname.endsWith('.ico'));
}

// Verificar se é requisição de API
function isAPIRequest(pathname) {
    return pathname.startsWith('/api/');
}

// Verificar se é requisição de imagem
function isImageRequest(pathname) {
    return pathname.match(/\.(jpg|jpeg|png|gif|svg|ico)$/i);
}

// Obter dados offline para APIs
async function getOfflineData(request) {
    const url = new URL(request.url);
    
    // Se for uma requisição de API, tentar buscar do IndexedDB
    if (url.pathname.startsWith('/api/')) {
        try {
            // Enviar mensagem para o cliente buscar dados offline
            const clients = await self.clients.matchAll();
            clients.forEach(client => {
                client.postMessage({
                    type: 'OFFLINE_API_REQUEST',
                    url: request.url,
                    requestId: Date.now()
                });
            });
            
            // Retornar resposta temporária
            return new Response(JSON.stringify({
                success: false,
                error: 'Offline - Dados não disponíveis',
                offline: true
            }), {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {
            console.error('❌ Erro ao buscar dados offline:', error);
        }
    }
    
    return new Response('Offline - Recurso não disponível', {
        status: 503,
        statusText: 'Service Unavailable'
    });
}

// Sincronização em background
self.addEventListener('sync', (event) => {
    console.log('🔄 Sincronização em background:', event.tag);
    
    if (event.tag === 'sync-offline-data') {
        event.waitUntil(syncOfflineData());
    }
});

// Sincronizar dados offline
async function syncOfflineData() {
    try {
        console.log('🔄 Iniciando sincronização de dados offline...');
        
        // Enviar mensagem para o cliente sincronizar
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'SYNC_OFFLINE_DATA',
                timestamp: Date.now()
            });
        });
        
        console.log('✅ Sincronização iniciada!');
    } catch (error) {
        console.error('❌ Erro na sincronização:', error);
    }
}

// Mensagens do cliente
self.addEventListener('message', (event) => {
    const { type, data } = event.data;
    
    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'CACHE_API_RESPONSE':
            cacheAPIResponse(data.url, data.response);
            break;
            
        case 'GET_CACHE_INFO':
            getCacheInfo(event.source);
            break;
            
        default:
            console.log('📨 Mensagem não reconhecida:', type);
    }
});

// Cachear resposta de API
async function cacheAPIResponse(url, response) {
    try {
        const cache = await caches.open(API_CACHE);
        const request = new Request(url);
        await cache.put(request, new Response(JSON.stringify(response), {
            headers: { 'Content-Type': 'application/json' }
        }));
        console.log('💾 API cacheada:', url);
    } catch (error) {
        console.error('❌ Erro ao cachear API:', error);
    }
}

// Obter informações do cache
async function getCacheInfo(client) {
    try {
        const cacheNames = await caches.keys();
        const cacheInfo = {};
        
        for (const cacheName of cacheNames) {
            const cache = await caches.open(cacheName);
            const keys = await cache.keys();
            cacheInfo[cacheName] = keys.length;
        }
        
        client.postMessage({
            type: 'CACHE_INFO',
            data: cacheInfo
        });
    } catch (error) {
        console.error('❌ Erro ao obter info do cache:', error);
    }
}

// Notificações push (para futuras funcionalidades)
self.addEventListener('push', (event) => {
    console.log('📱 Push notification recebida:', event);
    
    const options = {
        body: 'Sistema de Vendas - Nova atualização disponível',
        icon: '/favicon-32x32.png',
        badge: '/favicon-16x16.png',
        tag: 'sistema-vendas-update',
        data: {
            url: '/'
        }
    };
    
    event.waitUntil(
        self.registration.showNotification('Sistema de Vendas', options)
    );
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
    console.log('👆 Notificação clicada:', event);
    
    event.notification.close();
    
    event.waitUntil(
        clients.matchAll({ type: 'window' })
            .then(clientList => {
                if (clientList.length > 0) {
                    return clientList[0].focus();
                }
                return clients.openWindow('/');
            })
    );
});

console.log('🚀 Service Worker carregado!'); 