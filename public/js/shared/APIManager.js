/**
 * 🌐 Gerenciador de API Avançado
 * Cliente HTTP com interceptors, cache, retry e offline support
 */

class APIManager {
    constructor() {
        this.config = {
            baseURL: '/api',
            timeout: 30000,
            retryAttempts: 3,
            retryDelay: 1000,
            cacheTTL: 5 * 60 * 1000, // 5 minutos
            maxCacheSize: 100,
            enableOfflineQueue: true,
            enableCache: true,
            enableRetry: true,
            enableLogging: true
        };

        // Cache de requisições
        this.cache = new Map();
        this.cacheTimestamps = new Map();

        // Fila offline
        this.offlineQueue = [];
        this.isOnline = navigator.onLine;

        // Interceptors
        this.requestInterceptors = [];
        this.responseInterceptors = [];
        this.errorInterceptors = [];

        // Estatísticas
        this.stats = {
            requests: 0,
            responses: 0,
            errors: 0,
            cacheHits: 0,
            cacheMisses: 0,
            offlineRequests: 0
        };

        // Inicializar
        this.initialize();
    }

    /**
     * Inicializar o gerenciador de API
     */
    initialize() {
        // Configurar listeners de conectividade
        this.setupConnectivityListeners();

        // Configurar interceptors padrão
        this.setupDefaultInterceptors();

        // Processar fila offline se estiver online
        if (this.isOnline) {
            this.processOfflineQueue();
        }

        console.log('✅ APIManager inicializado');
    }

    /**
     * Configurar listeners de conectividade
     */
    setupConnectivityListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.processOfflineQueue();
            this.log('info', 'Conexão restaurada');
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.log('warn', 'Conexão perdida - Modo offline ativado');
        });
    }

    /**
     * Configurar interceptors padrão
     */
    setupDefaultInterceptors() {
        // Interceptor de requisição para adicionar token
        this.addRequestInterceptor(async (config) => {
            const token = this.getAuthToken();
            if (token) {
                config.headers = {
                    ...config.headers,
                    'Authorization': `Bearer ${token}`
                };
            }

            // Adicionar timestamp para cache busting
            if (config.method === 'GET' && !config.cache) {
                config.url += `&_t=${Date.now()}`;
            }

            return config;
        });

        // Interceptor de resposta para tratamento de erros
        this.addResponseInterceptor(async (response) => {
            this.stats.responses++;

            // Verificar se o token expirou
            if (response.status === 401) {
                this.handleTokenExpiration();
            }

            return response;
        });

        // Interceptor de erro para retry
        this.addErrorInterceptor(async (error, config) => {
            this.stats.errors++;

            // Tentar novamente se configurado
            if (this.config.enableRetry && config.retryCount < this.config.retryAttempts) {
                return this.retryRequest(config);
            }

            // Adicionar à fila offline se não estiver online
            if (!this.isOnline && this.config.enableOfflineQueue) {
                return this.addToOfflineQueue(config);
            }

            throw error;
        });
    }

    /**
     * Adicionar interceptor de requisição
     */
    addRequestInterceptor(interceptor) {
        this.requestInterceptors.push(interceptor);
    }

    /**
     * Adicionar interceptor de resposta
     */
    addResponseInterceptor(interceptor) {
        this.responseInterceptors.push(interceptor);
    }

    /**
     * Adicionar interceptor de erro
     */
    addErrorInterceptor(interceptor) {
        this.errorInterceptors.push(interceptor);
    }

    /**
     * Executar interceptors de requisição
     */
    async executeRequestInterceptors(config) {
        for (const interceptor of this.requestInterceptors) {
            try {
                config = await interceptor(config);
            } catch (error) {
                console.error('Erro no interceptor de requisição:', error);
                throw error;
            }
        }
        return config;
    }

    /**
     * Executar interceptors de resposta
     */
    async executeResponseInterceptors(response) {
        for (const interceptor of this.responseInterceptors) {
            try {
                response = await interceptor(response);
            } catch (error) {
                console.error('Erro no interceptor de resposta:', error);
                throw error;
            }
        }
        return response;
    }

    /**
     * Executar interceptors de erro
     */
    async executeErrorInterceptors(error, config) {
        for (const interceptor of this.errorInterceptors) {
            try {
                const result = await interceptor(error, config);
                if (result) return result;
            } catch (interceptorError) {
                console.error('Erro no interceptor de erro:', interceptorError);
            }
        }
        throw error;
    }

    /**
     * Fazer requisição HTTP
     */
    async request(config) {
        this.stats.requests++;

        // Configuração padrão
        const defaultConfig = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: this.config.timeout,
            retryCount: 0,
            cache: this.config.enableCache,
            ...config
        };

        try {
            // Executar interceptors de requisição
            const finalConfig = await this.executeRequestInterceptors(defaultConfig);

            // Verificar cache para GET requests
            if (finalConfig.method === 'GET' && finalConfig.cache) {
                const cachedResponse = this.getFromCache(finalConfig.url);
                if (cachedResponse) {
                    this.stats.cacheHits++;
                    return cachedResponse;
                }
            }

            this.stats.cacheMisses++;

            // Fazer requisição
            const response = await this.makeRequest(finalConfig);

            // Executar interceptors de resposta
            const finalResponse = await this.executeResponseInterceptors(response);

            // Salvar no cache se for GET
            if (finalConfig.method === 'GET' && finalConfig.cache) {
                this.setCache(finalConfig.url, finalResponse);
            }

            return finalResponse;

        } catch (error) {
            // Executar interceptors de erro
            return await this.executeErrorInterceptors(error, defaultConfig);
        }
    }

    /**
     * Fazer requisição HTTP real
     */
    async makeRequest(config) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.timeout);

        try {
            const response = await fetch(this.buildURL(config.url), {
                method: config.method,
                headers: config.headers,
                body: config.body,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            // Verificar se a resposta é ok
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // Parse da resposta
            const contentType = response.headers.get('content-type');
            let data;

            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            return {
                data,
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries()),
                config
            };

        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    /**
     * Construir URL completa
     */
    buildURL(url) {
        if (url.startsWith('http')) {
            return url;
        }

        return `${this.config.baseURL}${url.startsWith('/') ? url : `/${url}`}`;
    }

    /**
     * Tentar requisição novamente
     */
    async retryRequest(config) {
        config.retryCount++;

        this.log('warn', `Tentativa ${config.retryCount} de ${this.config.retryAttempts} para ${config.url}`);

        // Aguardar antes de tentar novamente
        await this.delay(this.config.retryDelay * config.retryCount);

        return this.request(config);
    }

    /**
     * Adicionar à fila offline
     */
    async addToOfflineQueue(config) {
        const offlineRequest = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            config,
            retries: 0
        };

        this.offlineQueue.push(offlineRequest);
        this.stats.offlineRequests++;

        this.log('info', `Requisição adicionada à fila offline: ${config.url}`);

        // Persistir fila
        this.persistOfflineQueue();

        // Retornar resposta simulada
        return {
            data: { message: 'Requisição enfileirada para processamento offline' },
            status: 202,
            statusText: 'Accepted',
            headers: {},
            config,
            offline: true
        };
    }

    /**
     * Processar fila offline
     */
    async processOfflineQueue() {
        if (this.offlineQueue.length === 0) return;

        this.log('info', `Processando ${this.offlineQueue.length} requisições offline`);

        const queue = [...this.offlineQueue];
        this.offlineQueue = [];

        for (const request of queue) {
            try {
                await this.request(request.config);
                this.log('info', `Requisição offline processada: ${request.config.url}`);
            } catch (error) {
                // Re-adicionar à fila se falhar
                request.retries++;
                if (request.retries < 3) {
                    this.offlineQueue.push(request);
                } else {
                    this.log('error', `Falha ao processar requisição offline após ${request.retries} tentativas: ${request.config.url}`);
                }
            }
        }

        // Persistir fila atualizada
        this.persistOfflineQueue();
    }

    /**
     * Persistir fila offline
     */
    persistOfflineQueue() {
        try {
            localStorage.setItem('api_offline_queue', JSON.stringify(this.offlineQueue));
        } catch (error) {
            console.warn('Erro ao persistir fila offline:', error);
        }
    }

    /**
     * Carregar fila offline
     */
    loadOfflineQueue() {
        try {
            const persisted = localStorage.getItem('api_offline_queue');
            if (persisted) {
                this.offlineQueue = JSON.parse(persisted);
            }
        } catch (error) {
            console.warn('Erro ao carregar fila offline:', error);
        }
    }

    /**
     * Gerenciar cache
     */
    getFromCache(key) {
        if (!this.config.enableCache) return null;

        const cached = this.cache.get(key);
        const timestamp = this.cacheTimestamps.get(key);

        if (!cached || !timestamp) return null;

        // Verificar se expirou
        if (Date.now() - timestamp > this.config.cacheTTL) {
            this.cache.delete(key);
            this.cacheTimestamps.delete(key);
            return null;
        }

        return cached;
    }

    setCache(key, data) {
        if (!this.config.enableCache) return;

        // Limpar cache se exceder tamanho máximo
        if (this.cache.size >= this.config.maxCacheSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
            this.cacheTimestamps.delete(firstKey);
        }

        this.cache.set(key, data);
        this.cacheTimestamps.set(key, Date.now());
    }

    clearCache() {
        this.cache.clear();
        this.cacheTimestamps.clear();
        this.log('info', 'Cache limpo');
    }

    /**
     * Métodos de conveniência para HTTP
     */
    async get(url, config = {}) {
        return this.request({ ...config, method: 'GET', url });
    }

    async post(url, data, config = {}) {
        return this.request({
            ...config,
            method: 'POST',
            url,
            body: JSON.stringify(data)
        });
    }

    async put(url, data, config = {}) {
        return this.request({
            ...config,
            method: 'PUT',
            url,
            body: JSON.stringify(data)
        });
    }

    async delete(url, config = {}) {
        return this.request({ ...config, method: 'DELETE', url });
    }

    async patch(url, data, config = {}) {
        return this.request({
            ...config,
            method: 'PATCH',
            url,
            body: JSON.stringify(data)
        });
    }

    /**
     * Upload de arquivo
     */
    async upload(url, file, config = {}) {
        const formData = new FormData();
        formData.append('file', file);

        return this.request({
            ...config,
            method: 'POST',
            url,
            body: formData,
            headers: {
                // Remover Content-Type para deixar o browser definir
            }
        });
    }

    /**
     * Download de arquivo
     */
    async download(url, filename, config = {}) {
        const response = await this.request({
            ...config,
            method: 'GET',
            url,
            cache: false
        });

        // Criar link de download
        const blob = new Blob([response.data]);
        const downloadUrl = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(downloadUrl);

        return response;
    }

    /**
     * Utilitários
     */
    getAuthToken() {
        if (window.state) {
            return window.state.get('auth.token');
        }
        return localStorage.getItem('authToken');
    }

    handleTokenExpiration() {
        this.log('warn', 'Token expirado, redirecionando para login');

        // Limpar estado de autenticação
        if (window.state) {
            window.state.clearAuth();
        } else {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
        }

        // Redirecionar para login
        if (window.router) {
            window.router.navigate('/login', { replace: true });
        } else {
            window.location.href = '/login';
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    log(level, message, ...args) {
        if (!this.config.enableLogging) return;

        const prefix = '[APIManager]';
        switch (level) {
            case 'error':
                console.error(prefix, message, ...args);
                break;
            case 'warn':
                console.warn(prefix, message, ...args);
                break;
            case 'info':
                console.info(prefix, message, ...args);
                break;
            case 'debug':
                console.debug(prefix, message, ...args);
                break;
            default:
                console.log(prefix, message, ...args);
        }
    }

    /**
     * Obter estatísticas
     */
    getStats() {
        return { ...this.stats };
    }

    /**
     * Resetar estatísticas
     */
    resetStats() {
        this.stats = {
            requests: 0,
            responses: 0,
            errors: 0,
            cacheHits: 0,
            cacheMisses: 0,
            offlineRequests: 0
        };
    }

    /**
     * Obter status da conexão
     */
    getConnectionStatus() {
        return {
            isOnline: this.isOnline,
            offlineQueueSize: this.offlineQueue.length,
            cacheSize: this.cache.size,
            stats: this.getStats()
        };
    }
}

// Criar instância global
const apiManager = new APIManager();

// Exportar para uso global
window.APIManager = apiManager;
window.api = apiManager;

// Métodos de conveniência globais
window.apiGet = (url, config) => apiManager.get(url, config);
window.apiPost = (url, data, config) => apiManager.post(url, data, config);
window.apiPut = (url, data, config) => apiManager.put(url, data, config);
window.apiDelete = (url, config) => apiManager.delete(url, config);
window.apiUpload = (url, file, config) => apiManager.upload(url, file, config);
window.apiDownload = (url, filename, config) => apiManager.download(url, filename, config); 