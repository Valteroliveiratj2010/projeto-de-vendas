/**
 * 🚀 SERVICE WORKER SIMPLIFICADO - SEM COMUNICAÇÃO DE MENSAGENS
 * Apenas cache inteligente, sem postMessage problemático
 */

const CACHE_NAME = 'sistema-vendas-v3.1.0';
const STATIC_CACHE = 'static-v3.1.0';
const DYNAMIC_CACHE = 'dynamic-v3.1.0';
const API_CACHE = 'api-v3.1.0';

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
    '/js/auth.js'
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

/**
 * Instalação do Service Worker
 */
self.addEventListener('install', (event) => {
    console.log('🚀 Service Worker (Simplificado) instalando...');

    event.waitUntil(
        Promise.all([
            // Cache de recursos críticos
            caches.open(STATIC_CACHE).then(cache => {
                console.log('📦 Cacheando recursos críticos...');
                return cache.addAll(CRITICAL_RESOURCES).catch(error => {
                    console.warn('⚠️ Alguns recursos críticos falharam:', error);
                    // Continuar mesmo com falhas
                });
            }),

            // Cache de recursos estáticos
            caches.open(DYNAMIC_CACHE).then(cache => {
                console.log('📦 Cacheando recursos estáticos...');
                return cache.addAll(STATIC_RESOURCES).catch(error => {
                    console.warn('⚠️ Alguns recursos estáticos falharam:', error);
                    // Continuar mesmo com falhas
                });
            })
        ]).then(() => {
            console.log('✅ Service Worker instalado com sucesso!');
            return self.skipWaiting();
        }).catch(error => {
            console.error('❌ Erro na instalação:', error);
            // Forçar ativação mesmo com erros
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
        }).catch(error => {
            console.error('❌ Erro na ativação:', error);
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

    // Pular extensões do Chrome/Firefox
    if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') {
        return;
    }

    // Pular protocolos não HTTP/HTTPS
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
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
    try {
        // Tentar rede primeiro
        const networkResponse = await fetch(request);

        // Cache da resposta se for bem-sucedida
        if (networkResponse.ok) {
            const cache = await caches.open(API_CACHE);
            const clonedResponse = networkResponse.clone();
            cache.put(request, clonedResponse).catch(error => {
                console.warn('⚠️ Falha ao cachear API:', error);
            });
        }

        return networkResponse;
    } catch (error) {
        // Fallback para cache
        const cache = await caches.open(API_CACHE);
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
    try {
        const cache = await caches.open(DYNAMIC_CACHE);

        // Verificar cache primeiro
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
            // Atualizar cache em background (não esperar)
            fetch(request).then(response => {
                if (response.ok) {
                    cache.put(request, response).catch(() => {
                        // Ignorar erros de cache em background
                    });
                }
            }).catch(() => {
                // Ignorar erros de rede em background
            });

            return cachedResponse;
        }

        // Tentar rede
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone()).catch(() => {
                // Ignorar erros de cache
            });
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
    try {
        const cache = await caches.open(DYNAMIC_CACHE);

        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone()).catch(() => {
                // Ignorar erros de cache
            });
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
    try {
        const cache = await caches.open(DYNAMIC_CACHE);

        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone()).catch(() => {
                // Ignorar erros de cache
            });
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
    try {
        const cache = await caches.open(STATIC_CACHE);

        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone()).catch(() => {
                // Ignorar erros de cache
            });
        }
        return networkResponse;
    } catch (error) {
        // Fallback para página offline
        if (request.url.includes('/login')) {
            const cachedLogin = await cache.match('/login');
            if (cachedLogin) return cachedLogin;
        }

        const cachedIndex = await cache.match('/');
        if (cachedIndex) return cachedIndex;

        return new Response('Página não disponível offline', { status: 404 });
    }
}

// ❌ REMOVIDO: Toda comunicação de mensagens problemática
// ❌ REMOVIDO: event.ports[0].postMessage()
// ❌ REMOVIDO: client.postMessage()
// ❌ REMOVIDO: addEventListener('message')

console.log('🚀 Service Worker simplificado carregado (sem comunicação de mensagens)!');

/**
 * Registro do Service Worker
 */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            // Desregistrar Service Workers antigos primeiro
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (const registration of registrations) {
                console.log('🗑️ Desregistrando Service Worker antigo:', registration.scope);
                await registration.unregister();
            }

            // Registrar o novo Service Worker
            const registration = await navigator.serviceWorker.register('/service-worker.js', {
                scope: '/'
            });

            console.log('✅ Service Worker registrado:', registration.scope);

            // Verificar se há uma atualização
            if (registration.waiting) {
                console.log('🔄 Service Worker aguardando ativação');
            }

            // Atualizar quando necessário
            registration.addEventListener('updatefound', () => {
                console.log('🔄 Nova versão do Service Worker encontrada');
                const newWorker = registration.installing;

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        console.log('✅ Nova versão do Service Worker instalada');
                    }
                });
            });

        } catch (error) {
            console.error('❌ Erro ao registrar Service Worker:', error);
        }
    });

    // ❌ REMOVIDO: Toda comunicação navigator.serviceWorker.addEventListener('message')
    // ❌ REMOVIDO: Toda comunicação navigator.serviceWorker.controller.postMessage()

} else {
    console.warn('⚠️ Service Worker não suportado neste navegador');
} 