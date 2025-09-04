/**
 * 🚀 SISTEMA DE DEBOUNCE E THROTTLE - PREVENÇÃO DE LOOPS
 * Evita múltiplas requisições simultâneas e loops infinitos
 * VERSÃO CORRIGIDA E SIMPLIFICADA
 */

class RequestManager {
    constructor() {
        this.pendingRequests = new Map();
        this.requestCache = new Map();
        this.cacheTTL = 30 * 1000; // 30 segundos
        this.debounceDelay = 300; // 300ms
        this.maxRetries = 3;
        this.retryDelay = 1000; // 1 segundo

        this.setupErrorHandling();
        console.log('🚀 RequestManager construído!');
    }

    /**
     * Método principal para gerenciar requisições - CORRIGIDO
     */
    async manageRequest(key, requestFunction, options = {}) {
        console.log(`🔄 RequestManager.manageRequest chamado para: ${key}`);

        const cacheKey = key;
        const cacheTTL = options.cacheTTL || this.cacheTTL;
        const debounceTime = options.debounceTime || this.debounceDelay;

        // Verificar cache primeiro
        const cached = this.getFromCache(cacheKey);
        if (cached && !options.forceRefresh) {
            console.log(`📦 Cache hit para: ${key}`);
            return cached;
        }

        // Verificar se já há uma requisição pendente
        if (this.pendingRequests.has(cacheKey)) {
            console.log(`⏳ Aguardando requisição pendente: ${key}`);
            return this.pendingRequests.get(cacheKey);
        }

        // Criar nova requisição
        const requestPromise = this.executeManagedRequest(requestFunction, cacheKey);
        this.pendingRequests.set(cacheKey, requestPromise);

        try {
            const result = await requestPromise;

            // CORREÇÃO: Garantir que a estrutura de resposta seja consistente
            if (result && typeof result === 'object') {
                this.cacheResult(cacheKey, result, cacheTTL);
                console.log(`✅ RequestManager.manageRequest concluído para: ${key}`);
                return result;
            } else {
                throw new Error('Resposta inválida do servidor');
            }
        } catch (error) {
            console.error(`❌ Erro no RequestManager para ${key}:`, error);
            throw error;
        } finally {
            this.pendingRequests.delete(cacheKey);
        }
    }

    /**
     * Executar requisição gerenciada - MELHORADO
     */
    async executeManagedRequest(requestFunction, cacheKey) {
        let lastError;

        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                console.log(`🔄 Tentativa ${attempt}/${this.maxRetries}: ${cacheKey}`);

                const result = await requestFunction();

                // CORREÇÃO: Validar estrutura da resposta
                if (!result) {
                    throw new Error('Resposta vazia do servidor');
                }

                console.log(`✅ Requisição bem-sucedida: ${cacheKey}`);
                return result;

            } catch (error) {
                lastError = error;
                console.warn(`⚠️ Tentativa ${attempt} falhou: ${cacheKey}`, error.message);

                if (attempt < this.maxRetries) {
                    await this.delay(this.retryDelay * attempt);
                }
            }
        }

        throw new Error(`Falha após ${this.maxRetries} tentativas: ${lastError.message}`);
    }

    /**
     * Requisição com debounce e cache (método legado) - CORRIGIDO
     */
    async request(url, options = {}) {
        return this.manageRequest(url, async () => {
            const response = await fetch(url, {
                ...options,
                signal: AbortSignal.timeout(10000) // 10 segundos timeout
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            } else {
                return await response.text();
            }
        }, options);
    }

    /**
     * Obter do cache
     */
    getFromCache(key) {
        const cached = this.requestCache.get(key);
        if (cached && Date.now() < cached.expiry) {
            return cached.data;
        }
        if (cached) {
            this.requestCache.delete(key);
        }
        return null;
    }

    /**
     * Salvar no cache
     */
    cacheResult(key, data, ttl) {
        this.requestCache.set(key, {
            data,
            expiry: Date.now() + ttl
        });
    }

    /**
     * Limpar cache
     */
    clearCache() {
        this.requestCache.clear();
        console.log('🗑️ Cache limpo');
    }

    /**
     * Delay utilitário
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Configurar tratamento de erros
     */
    setupErrorHandling() {
        // Interceptor global para erros de rede
        window.addEventListener('online', () => {
            console.log('🌐 Conexão restaurada');
            this.clearCache(); // Limpar cache para forçar refresh
        });

        window.addEventListener('offline', () => {
            console.log('📡 Conexão perdida');
        });
    }

    /**
     * Verificar se está online
     */
    isOnline() {
        return navigator.onLine;
    }

    /**
     * Método para debug
     */
    getStats() {
        return {
            pendingRequests: this.pendingRequests.size,
            cacheSize: this.requestCache.size,
            isOnline: this.isOnline()
        };
    }
}

// Criar instância global
window.requestManager = new RequestManager();
console.log('✅ RequestManager global criado'); 