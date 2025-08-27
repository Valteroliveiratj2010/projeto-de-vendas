/**
 * Service Worker para Sistema de Vendas
 * Gerencia cache offline e funcionalidades PWA
 */

const CACHE_NAME = 'sistema-vendas-v1.0.0';
const STATIC_CACHE = 'static-v1.0.0';
const DYNAMIC_CACHE = 'dynamic-v1.0.0';

// Arquivos para cache estático
const STATIC_FILES = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/css/components.css',
    '/css/responsive.css',
    '/js/app.js',
    '/js/api.js',
    '/js/database.js',
    '/js/ui.js',
    '/js/pages/dashboard.js',
    '/js/pages/clientes.js',
    '/js/pages/produtos.js',
    '/js/pages/vendas.js',
    '/js/pages/orcamentos.js',
    '/js/pages/relatorios.js',
    '/manifest.json',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Estratégias de cache
const CACHE_STRATEGIES = {
    // Cache First para arquivos estáticos
    STATIC: 'static',
    // Network First para APIs
    API: 'api',
    // Cache First para imagens
    IMAGE: 'image'
};

/**
 * Instalação do Service Worker
 */
self.addEventListener('install', (event) => {
    console.log('🔄 Service Worker instalando...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('📦 Cache estático aberto');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('✅ Cache estático preenchido');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('❌ Erro ao preencher cache estático:', error);
            })
    );
});

/**
 * Ativação do Service Worker
 */
self.addEventListener('activate', (event) => {
    console.log('🚀 Service Worker ativando...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        // Remover caches antigos
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('🗑️ Removendo cache antigo:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('✅ Service Worker ativado');
                return self.clients.claim();
            })
    );
});

/**
 * Intercepta requisições
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Ignorar requisições não-GET
    if (request.method !== 'GET') {
        return;
    }
    
    // Determinar estratégia de cache
    const strategy = getCacheStrategy(url);
    
    switch (strategy) {
        case CACHE_STRATEGIES.STATIC:
            event.respondWith(cacheFirst(request, STATIC_CACHE));
            break;
        case CACHE_STRATEGIES.API:
            event.respondWith(networkFirst(request, DYNAMIC_CACHE));
            break;
        case CACHE_STRATEGIES.IMAGE:
            event.respondWith(cacheFirst(request, DYNAMIC_CACHE));
            break;
        default:
            event.respondWith(networkFirst(request, DYNAMIC_CACHE));
    }
});

/**
 * Determina estratégia de cache baseada na URL
 */
function getCacheStrategy(url) {
    // Arquivos estáticos
    if (url.pathname.startsWith('/css/') || 
        url.pathname.startsWith('/js/') || 
        url.pathname.startsWith('/manifest.json') ||
        url.pathname === '/' ||
        url.pathname === '/index.html') {
        return CACHE_STRATEGIES.STATIC;
    }
    
    // APIs
    if (url.pathname.startsWith('/api/')) {
        return CACHE_STRATEGIES.API;
    }
    
    // Imagens
    if (url.pathname.match(/\.(jpg|jpeg|png|gif|svg|ico)$/)) {
        return CACHE_STRATEGIES.IMAGE;
    }
    
    // Fontes
    if (url.pathname.match(/\.(woff|woff2|ttf|eot)$/)) {
        return CACHE_STRATEGIES.STATIC;
    }
    
    return CACHE_STRATEGIES.API;
}

/**
 * Estratégia Cache First
 */
async function cacheFirst(request, cacheName) {
    try {
        // Tentar buscar do cache primeiro
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Se não estiver no cache, buscar da rede
        const networkResponse = await fetch(request);
        
        // Armazenar no cache para uso futuro
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
        
    } catch (error) {
        console.error('❌ Erro na estratégia Cache First:', error);
        
        // Em caso de erro, tentar buscar do cache mesmo que seja antigo
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Retornar página offline se disponível
        return getOfflinePage();
    }
}

/**
 * Estratégia Network First
 */
async function networkFirst(request, cacheName) {
    try {
        // Tentar buscar da rede primeiro
        const networkResponse = await fetch(request);
        
        // Armazenar no cache se for bem-sucedida
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
        
    } catch (error) {
        console.error('❌ Erro na estratégia Network First:', error);
        
        // Se a rede falhar, tentar buscar do cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Retornar página offline se disponível
        return getOfflinePage();
    }
}

/**
 * Retorna página offline
 */
async function getOfflinePage() {
    try {
        const cache = await caches.open(STATIC_CACHE);
        const offlineResponse = await cache.match('/index.html');
        
        if (offlineResponse) {
            return offlineResponse;
        }
        
        // Criar resposta offline básica
        const offlineHTML = `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Offline - Sistema de Vendas</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        text-align: center; 
                        padding: 50px; 
                        background: #f5f5f5; 
                    }
                    .offline-container { 
                        background: white; 
                        padding: 40px; 
                        border-radius: 10px; 
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
                        max-width: 500px; 
                        margin: 0 auto; 
                    }
                    .offline-icon { 
                        font-size: 48px; 
                        color: #f59e0b; 
                        margin-bottom: 20px; 
                    }
                    h1 { color: #333; margin-bottom: 20px; }
                    p { color: #666; line-height: 1.6; }
                    .retry-btn { 
                        background: #2563eb; 
                        color: white; 
                        border: none; 
                        padding: 12px 24px; 
                        border-radius: 6px; 
                        cursor: pointer; 
                        margin-top: 20px; 
                    }
                    .retry-btn:hover { background: #1d4ed8; }
                </style>
            </head>
            <body>
                <div class="offline-container">
                    <div class="offline-icon">📶</div>
                    <h1>Sem Conexão</h1>
                    <p>Você está offline no momento. Algumas funcionalidades podem não estar disponíveis.</p>
                    <p>Os dados serão sincronizados automaticamente quando a conexão for restaurada.</p>
                    <button class="retry-btn" onclick="window.location.reload()">Tentar Novamente</button>
                </div>
            </body>
            </html>
        `;
        
        return new Response(offlineHTML, {
            headers: { 'Content-Type': 'text/html' }
        });
        
    } catch (error) {
        console.error('❌ Erro ao criar página offline:', error);
        
        // Retornar resposta de erro básica
        return new Response('Offline - Sistema de Vendas', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

/**
 * Sincronização em background
 */
self.addEventListener('sync', (event) => {
    console.log('🔄 Sincronização em background:', event.tag);
    
    if (event.tag === 'sync-data') {
        event.waitUntil(syncData());
    }
});

/**
 * Sincroniza dados pendentes
 */
async function syncData() {
    try {
        console.log('🔄 Iniciando sincronização em background...');
        
        // Implementar sincronização de dados pendentes
        // Esta função será chamada quando a conexão for restaurada
        
        console.log('✅ Sincronização em background concluída');
        
    } catch (error) {
        console.error('❌ Erro na sincronização em background:', error);
    }
}

/**
 * Notificações push
 */
self.addEventListener('push', (event) => {
    console.log('📱 Notificação push recebida:', event);
    
    if (event.data) {
        const data = event.data.json();
        
        const options = {
            body: data.body || 'Nova notificação do Sistema de Vendas',
            icon: '/favicon-32x32.png',
            badge: '/favicon-16x16.png',
            tag: 'sistema-vendas',
            data: data.data || {},
            actions: data.actions || [],
            requireInteraction: true
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title || 'Sistema de Vendas', options)
        );
    }
});

/**
 * Clique em notificação
 */
self.addEventListener('notificationclick', (event) => {
    console.log('👆 Notificação clicada:', event);
    
    event.notification.close();
    
    if (event.action) {
        // Ação específica da notificação
        handleNotificationAction(event.action, event.notification.data);
    } else {
        // Clique na notificação principal
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

/**
 * Manipula ações de notificação
 */
function handleNotificationAction(action, data) {
    switch (action) {
        case 'view':
            clients.openWindow('/#vendas');
            break;
        case 'sync':
            // Sincronizar dados
            syncData();
            break;
        default:
            clients.openWindow('/');
    }
}

/**
 * Mensagens do cliente
 */
self.addEventListener('message', (event) => {
    console.log('💬 Mensagem recebida do cliente:', event.data);
    
    const { type, data } = event.data;
    
    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
        case 'GET_VERSION':
            event.ports[0].postMessage({ version: CACHE_NAME });
            break;
        case 'CLEAR_CACHE':
            clearAllCaches();
            break;
        default:
            console.log('📝 Tipo de mensagem não reconhecido:', type);
    }
});

/**
 * Limpa todos os caches
 */
async function clearAllCaches() {
    try {
        const cacheNames = await caches.keys();
        await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('🗑️ Todos os caches foram limpos');
    } catch (error) {
        console.error('❌ Erro ao limpar caches:', error);
    }
}

/**
 * Log de eventos para debug
 */
self.addEventListener('error', (event) => {
    console.error('❌ Erro no Service Worker:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Promise rejeitada não tratada:', event.reason);
});

console.log('🔄 Service Worker carregado:', CACHE_NAME); 