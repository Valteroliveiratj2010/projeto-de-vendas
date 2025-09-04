/**
 * 🚀 SERVICE WORKER OTIMIZADO - SISTEMA PROFISSIONAL
 * Cache inteligente e otimização de performance
 */

const CACHE_NAME = 'sistema-vendas-v3.0.0';
const STATIC_CACHE = 'static-v3.0.0';
const DYNAMIC_CACHE = 'dynamic-v3.0.0';
const API_CACHE = 'api-v3.0.0';

// Recursos críticos para cache imediato
const CRITICAL_RESOURCES = [
    '/',
    '/login',
    '/css/styles.css',
    '/css/components.css',
    '/css/ui.css',
    '/css/buttons-consolidated.css',
    '/js/app.js',
    '/js/api.js',
    '/js/auth.js',
    '/js/lazy-loading-system.js'
];

// Recursos estáticos para cache
const STATIC_RESOURCES = [
    '/css/responsive-consolidated.css',
    '/css/icons-unified.css',
    '/css/modals.css',
    '/css/tables.css',
    '/css/forms.css',
    '/css/charts.css',
    '/js/database.js',
    '/js/ui.js',
    '/webfonts/fa-solid-900.woff2',
    '/manifest.json',
    '/favicon.ico'
];

// Estratégias de cache
const CACHE_STRATEGIES = {
    CRITICAL: 'cache-first',
    STATIC: 'stale-while-revalidate',
    API: 'network-first',
    IMAGES: 'cache-first',
    FONTS: 'cache-first'
};

// Configuração de cache
const CACHE_CONFIG = {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    maxEntries: 100,
    maxSize: 50 * 1024 * 1024 // 50MB
};

/**
 * Instalação do Service Worker
 */
self.addEventListener('install', (event) => {
    console.log('🚀 Service Worker instalando...');

    event.waitUntil(
        Promise.all([
            // Cache de recursos críticos
            caches.open(STATIC_CACHE).then(cache => {
                console.log('📦 Cacheando recursos críticos...');
                return cache.addAll(CRITICAL_RESOURCES);
            }),

            // Cache de recursos estáticos
            caches.open(DYNAMIC_CACHE).then(cache => {
                console.log('📦 Cacheando recursos estáticos...');
                return cache.addAll(STATIC_RESOURCES);
            })
        ]).then(() => {
            console.log('✅ Service Worker instalado com sucesso!');
            return self.skipWaiting();
        })
    );
});

/**
 * Ativação do Service Worker
 */
self.addEventListener('activate', (event) => {
    console.log('🔄 Service Worker ativando...');

    event.waitUntil(
        Promise.all([
            // Limpar caches antigos
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (![STATIC_CACHE, DYNAMIC_CACHE, API_CACHE].includes(cacheName)) {
                            console.log('🗑️ Removendo cache antigo:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),

            // Tomar controle imediato
            self.clients.claim()
        ]).then(() => {
            console.log('✅ Service Worker ativado!');
        })
    );
});

/**
 * Interceptação de requisições
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Pular requisições não-GET
    if (request.method !== 'GET') {
        return;
    }

    // Estratégia baseada no tipo de recurso
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(handleApiRequest(request));
    } else if (url.pathname.startsWith('/css/') || url.pathname.startsWith('/js/')) {
        event.respondWith(handleStaticRequest(request));
    } else if (url.pathname.startsWith('/webfonts/') || url.pathname.includes('.woff')) {
        event.respondWith(handleFontRequest(request));
    } else if (url.pathname.includes('.png') || url.pathname.includes('.jpg') || url.pathname.includes('.ico')) {
        event.respondWith(handleImageRequest(request));
    } else {
        event.respondWith(handlePageRequest(request));
    }
});

/**
 * Estratégia para requisições de API
 */
async function handleApiRequest(request) {
    const cache = await caches.open(API_CACHE);

    try {
        // Tentar rede primeiro
        const networkResponse = await fetch(request);

        // Cache da resposta se for bem-sucedida
        if (networkResponse.ok) {
            const clonedResponse = networkResponse.clone();
            cache.put(request, clonedResponse);
        }

        return networkResponse;
    } catch (error) {
        // Fallback para cache
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
            console.log('📦 API servida do cache:', request.url);
            return cachedResponse;
        }

        // Resposta de erro offline
        return new Response(JSON.stringify({
            error: 'Offline',
            message: 'Não foi possível conectar ao servidor'
        }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

/**
 * Estratégia para recursos estáticos
 */
async function handleStaticRequest(request) {
    const cache = await caches.open(DYNAMIC_CACHE);

    // Verificar cache primeiro
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
        // Atualizar cache em background
        fetch(request).then(response => {
            if (response.ok) {
                cache.put(request, response);
            }
        });

        return cachedResponse;
    }

    // Tentar rede
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        return new Response('Recurso não disponível offline', { status: 404 });
    }
}

/**
 * Estratégia para fontes
 */
async function handleFontRequest(request) {
    const cache = await caches.open(DYNAMIC_CACHE);

    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }

    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        return new Response('Fonte não disponível offline', { status: 404 });
    }
}

/**
 * Estratégia para imagens
 */
async function handleImageRequest(request) {
    const cache = await caches.open(DYNAMIC_CACHE);

    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }

    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        return new Response('Imagem não disponível offline', { status: 404 });
    }
}

/**
 * Estratégia para páginas
 */
async function handlePageRequest(request) {
    const cache = await caches.open(STATIC_CACHE);

    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        // Fallback para página offline
        if (request.url.includes('/login')) {
            return cache.match('/login');
        }
        return cache.match('/');
    }
}

/**
 * Limpeza automática de cache
 */
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CLEAN_CACHE') {
        event.waitUntil(cleanOldCaches());
    }
});

async function cleanOldCaches() {
    const cacheNames = await caches.keys();
    const now = Date.now();

    for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();

        for (const request of requests) {
            const response = await cache.match(request);
            const headers = response.headers;
            const date = headers.get('date');

            if (date && (now - new Date(date).getTime()) > CACHE_CONFIG.maxAge) {
                await cache.delete(request);
            }
        }
    }
}

console.log('🚀 Service Worker otimizado carregado!'); 