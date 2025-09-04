/**
 * Módulo de API - Sistema de Vendas
 * Gerencia todas as chamadas HTTP para o backend
 */

class API {
    constructor() {
        this.baseURL = window.location.origin;
        this.timeout = 10000; // 10 segundos
        this.init();
    }

    /**
     * Inicializa o módulo de API
     */
    init() {
        console.log('🚀 Inicializando módulo de API...');

        // Configurar interceptors se necessário
        this.setupInterceptors();

        console.log('✅ Módulo de API inicializado!');
    }

    /**
     * Configura interceptors para requisições
     */
    setupInterceptors() {
        // Interceptor para adicionar headers padrão
        this.addRequestInterceptor((config) => {
            // Adicionar token de autenticação se existir
            const token = localStorage.getItem('auth_token');
            if (token) {
                config.headers = config.headers || {};
                config.headers.Authorization = `Bearer ${token}`;
            }

            // Adicionar timestamp para cache busting
            if (config.method === 'GET') {
                config.url += (config.url.includes('?') ? '&' : '?') + `_t=${Date.now()}`;
            }

            return config;
        });

        // Interceptor para tratamento de erros
        this.addResponseInterceptor((response) => {
            return response;
        }, (error) => {
            console.error('❌ Erro na API:', error);

            // Tratar erros específicos
            if (error.status === 401) {
                // Token expirado ou inválido
                localStorage.removeItem('auth_token');
                window.location.reload();
            } else if (error.status === 500) {
                // Erro interno do servidor
                this.showError('Erro do Servidor', 'Ocorreu um erro interno. Tente novamente.');
            } else if (error.status === 0) {
                // Sem conexão
                this.showError('Sem Conexão', 'Verifique sua conexão com a internet.');
            }

            throw error;
        });
    }

    /**
     * Adiciona interceptor de requisição
     */
    addRequestInterceptor(fulfilled, rejected) {
        this.requestInterceptors = this.requestInterceptors || [];
        this.requestInterceptors.push({ fulfilled, rejected });
    }

    /**
     * Adiciona interceptor de resposta
     */
    addResponseInterceptor(fulfilled, rejected) {
        this.responseInterceptors = this.responseInterceptors || [];
        this.responseInterceptors.push({ fulfilled, rejected });
    }

    /**
     * Aplica interceptors de requisição
     */
    applyRequestInterceptors(config) {
        if (!this.requestInterceptors) return config;

        let finalConfig = config;
        this.requestInterceptors.forEach(interceptor => {
            try {
                finalConfig = interceptor.fulfilled(finalConfig);
            } catch (error) {
                if (interceptor.rejected) {
                    interceptor.rejected(error);
                }
            }
        });

        return finalConfig;
    }

    /**
     * Aplica interceptors de resposta
     */
    applyResponseInterceptors(response) {
        if (!this.responseInterceptors) return response;

        let finalResponse = response;
        this.responseInterceptors.forEach(interceptor => {
            try {
                finalResponse = interceptor.fulfilled(finalResponse);
            } catch (error) {
                if (interceptor.rejected) {
                    interceptor.rejected(error);
                }
            }
        });

        return finalResponse;
    }

    /**
     * Faz uma requisição HTTP com debounce e cache
     */
    async request(config) {
        try {
            // Aplicar interceptors de requisição
            config = this.applyRequestInterceptors(config);

            // Construir URL completa
            const fullUrl = config.url.startsWith('http') ? config.url : `${this.baseURL}${config.url}`;

            // Usar RequestManager se disponível
            if (window.requestManager) {
                console.log(`🔄 Requisição via RequestManager: ${fullUrl}`);
                const result = await window.requestManager.request(fullUrl, {
                    method: config.method || 'GET',
                    headers: config.headers || {},
                    body: config.body,
                    forceRefresh: config.forceRefresh || false
                });

                // CORREÇÃO: Garantir estrutura de resposta consistente
                return {
                    data: result,
                    status: 200,
                    statusText: 'OK',
                    headers: {}
                };
            }

            // Fallback para requisição tradicional
            console.log(`🔄 Requisição tradicional: ${fullUrl}`);

            // Configurar timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            // Fazer requisição
            const response = await fetch(fullUrl, {
                method: config.method || 'GET',
                headers: config.headers || {},
                body: config.body,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            // Verificar se a resposta é ok
            if (!response.ok) {
                // Tentar capturar dados de erro da resposta
                let errorData = null;
                try {
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        errorData = await response.json();
                    } else {
                        errorData = await response.text();
                    }
                } catch (parseError) {
                    console.warn('❌ Erro ao parsear dados de erro:', parseError);
                }

                throw {
                    status: response.status,
                    statusText: response.statusText,
                    message: `HTTP ${response.status}: ${response.statusText}`,
                    response: {
                        status: response.status,
                        data: errorData
                    }
                };
            }

            // Processar resposta
            let data;
            const contentType = response.headers.get('content-type');

            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            // Aplicar interceptors de resposta
            const finalResponse = this.applyResponseInterceptors({
                data,
                status: response.status,
                statusText: response.statusText,
                headers: response.headers
            });

            return finalResponse;

        } catch (error) {
            if (error.name === 'AbortError') {
                throw {
                    status: 0,
                    message: 'Timeout da requisição'
                };
            }
            throw error;
        }
    }

    /**
     * Requisição GET
     */
    async get(url, config = {}) {
        return this.request({
            method: 'GET',
            url,
            ...config
        });
    }

    /**
     * Requisição POST
     */
    async post(url, data, config = {}) {
        return this.request({
            method: 'POST',
            url,
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
                ...config.headers
            },
            ...config
        });
    }

    /**
     * Requisição PUT
     */
    async put(url, data, config = {}) {
        return this.request({
            method: 'PUT',
            url,
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
                ...config.headers
            },
            ...config
        });
    }

    /**
     * Requisição DELETE
     */
    async delete(url, config = {}) {
        return this.request({
            method: 'DELETE',
            url,
            ...config
        });
    }

    /**
     * Upload de arquivo
     */
    async upload(url, file, config = {}) {
        const formData = new FormData();
        formData.append('file', file);

        return this.request({
            method: 'POST',
            url,
            body: formData,
            headers: {
                ...config.headers
            },
            ...config
        });
    }

    /**
     * Download de arquivo
     */
    async download(url, filename, config = {}) {
        try {
            const response = await this.request({
                method: 'GET',
                url,
                ...config
            });

            // Criar link para download
            const blob = new Blob([response.data]);
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);

            return { success: true };

        } catch (error) {
            console.error('❌ Erro no download:', error);
            throw error;
        }
    }

    /**
     * Testa conectividade com o servidor
     */
    async testConnection() {
        try {
            const response = await this.get('/api/health');
            return response.status === 200;
        } catch (error) {
            return false;
        }
    }

    /**
     * Verifica se está online
     */
    isOnline() {
        return navigator.onLine;
    }

    /**
     * Mostra erro
     */
    showError(title, message) {
        if (window.UI && window.UI.showError) {
            window.UI.showError(title, message);
        } else {
            console.error(`${title}: ${message}`);
            alert(`${title}: ${message}`);
        }
    }

    /**
     * Mostra toast
     */
    showToast(message, type = 'info') {
        if (window.UI && window.UI.showToast) {
            window.UI.showToast(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Criar instância global da API
window.api = new API();

// Exportar para uso global
window.API = API; 