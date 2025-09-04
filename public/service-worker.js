/**
 * 🚀 SERVICE WORKER ULTRA-SIMPLIFICADO - SEM ERROS
 * Versão final corrigida para evitar todos os problemas de Response
 */

const CACHE_NAME = 'sistema-vendas-v3.2.0';
const STATIC_CACHE = 'static-v3.2.0';
const DYNAMIC_CACHE = 'dynamic-v3.2.0';

console.log('🚀 Service Worker ULTRA-SIMPLIFICADO carregando...');

/**
 * Instalação do Service Worker
 */
self.addEventListener('install', (event) => {
    console.log('🚀 Service Worker instalando...');

    // Instalação simples sem cache prévio
    event.waitUntil(
        self.skipWaiting()
    );
});

/**
 * Ativação do Service Worker
 */
self.addEventListener('activate', (event) => {
    console.log('🔄 Service Worker ativando...');

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (![STATIC_CACHE, DYNAMIC_CACHE].includes(cacheName)) {
                        console.log('🗑️ Removendo cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('✅ Service Worker ativado!');
            return self.clients.claim();
        })
    );
});

/**
 * Interceptação de requisições - VERSÃO ULTRA-SIMPLES
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

    // ESTRATÉGIA ULTRA-SIMPLES: Rede primeiro, cache como fallback
    event.respondWith(
        fetch(request)
            .then(response => {
                // SÓ cachear se a resposta for válida E clonável
                if (response.ok && response.status !== 206) {
                    // Clonar ANTES de qualquer uso
                    const clonedResponse = response.clone();

                    // Cachear em background (não esperar)
                    caches.open(DYNAMIC_CACHE).then(cache => {
                        cache.put(request, clonedResponse).catch(error => {
                            console.warn('⚠️ Falha ao cachear:', error);
                        });
                    }).catch(error => {
                        console.warn('⚠️ Falha ao abrir cache:', error);
                    });
                }

                return response;
            })
            .catch(error => {
                console.log('🌐 Rede falhou, tentando cache:', request.url);

                // Tentar cache como fallback
                return caches.match(request).then(cachedResponse => {
                    if (cachedResponse) {
                        console.log('📦 Servido do cache:', request.url);
                        return cachedResponse;
                    }

                    // Resposta de erro offline
                    return new Response('Recurso não disponível offline', {
                        status: 404,
                        statusText: 'Offline'
                    });
                });
            })
    );
});

// ❌ ZERO comunicação de mensagens
// ❌ ZERO postMessage
// ❌ ZERO addEventListener('message')
// ❌ ZERO problemas de Response.clone()

console.log('✅ Service Worker ULTRA-SIMPLIFICADO carregado (ZERO ERROS)!'); 