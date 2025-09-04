/**
 * 🚀 Carregador de Módulos Compartilhados
 * Carrega e inicializa todos os módulos compartilhados da aplicação
 */

class SharedModulesLoader {
    constructor() {
        this.modules = new Map();
        this.loadingPromises = new Map();
        this.initialized = false;

        // Ordem de carregamento dos módulos
        this.loadOrder = [
            'AppConfig',
            'Logger',
            'Validation',
            'StateManager',
            'APIManager',
            'Router',
            'UIModule'
        ];

        // Configurações de carregamento
        this.config = {
            timeout: 10000,
            retryAttempts: 3,
            enableParallelLoading: false
        };
    }

    /**
     * Inicializar carregador
     */
    async initialize() {
        try {
            console.log('🔄 Inicializando módulos compartilhados...');

            // Carregar módulos na ordem especificada
            await this.loadModulesSequentially();

            // Configurar integrações entre módulos
            this.setupModuleIntegrations();

            // Marcar como inicializado
            this.initialized = true;

            console.log('✅ Módulos compartilhados inicializados com sucesso');

            // Disparar evento de inicialização
            this.dispatchEvent('modules:initialized');

        } catch (error) {
            console.error('❌ Erro ao inicializar módulos compartilhados:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * Carregar módulos sequencialmente
     */
    async loadModulesSequentially() {
        for (const moduleName of this.loadOrder) {
            try {
                await this.loadModule(moduleName);
            } catch (error) {
                console.error(`Erro ao carregar módulo ${moduleName}:`, error);
                throw error;
            }
        }
    }

    /**
     * Carregar módulo individual
     */
    async loadModule(moduleName) {
        // Verificar se já está carregado
        if (this.modules.has(moduleName)) {
            return this.modules.get(moduleName);
        }

        // Verificar se já está carregando
        if (this.loadingPromises.has(moduleName)) {
            return this.loadingPromises.get(moduleName);
        }

        // Criar promise de carregamento
        const loadPromise = this.loadModuleScript(moduleName);
        this.loadingPromises.set(moduleName, loadPromise);

        try {
            const module = await loadPromise;
            this.modules.set(moduleName, module);
            this.loadingPromises.delete(moduleName);

            console.log(`✅ Módulo ${moduleName} carregado`);
            return module;

        } catch (error) {
            this.loadingPromises.delete(moduleName);
            throw error;
        }
    }

    /**
     * Carregar script do módulo
     */
    async loadModuleScript(moduleName) {
        const scriptPath = this.getModulePath(moduleName);

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = scriptPath;
            script.type = 'text/javascript';

            // Timeout
            const timeoutId = setTimeout(() => {
                reject(new Error(`Timeout ao carregar módulo ${moduleName}`));
            }, this.config.timeout);

            script.onload = () => {
                clearTimeout(timeoutId);

                // Verificar se o módulo foi carregado
                const module = this.getModuleInstance(moduleName);
                if (module) {
                    resolve(module);
                } else {
                    reject(new Error(`Módulo ${moduleName} não foi inicializado corretamente`));
                }
            };

            script.onerror = () => {
                clearTimeout(timeoutId);
                reject(new Error(`Erro ao carregar script do módulo ${moduleName}`));
            };

            document.head.appendChild(script);
        });
    }

    /**
     * Obter caminho do módulo
     */
    getModulePath(moduleName) {
        const modulePaths = {
            'AppConfig': '/js/shared/AppConfig.js',
            'Logger': '/js/utils/logger.js',
            'Validation': '/js/utils/validation.js',
            'StateManager': '/js/shared/StateManager.js',
            'APIManager': '/js/shared/APIManager.js',
            'Router': '/js/shared/Router.js',
            'UIModule': '/js/modules/ui-manager.js'
        };

        return modulePaths[moduleName] || `/js/shared/${moduleName}.js`;
    }

    /**
     * Obter instância do módulo
     */
    getModuleInstance(moduleName) {
        const moduleInstances = {
            'AppConfig': window.AppConfig,
            'Logger': window.Logger,
            'Validation': window.Validation,
            'StateManager': window.StateManager,
            'APIManager': window.APIManager,
            'Router': window.Router,
            'UIModule': window.UIModule
        };

        return moduleInstances[moduleName];
    }

    /**
     * Configurar integrações entre módulos
     */
    setupModuleIntegrations() {
        // Integração entre StateManager e APIManager
        if (window.state && window.api) {
            // Interceptor para adicionar token automaticamente
            window.api.addRequestInterceptor(async (config) => {
                const token = window.state.get('auth.token');
                if (token) {
                    config.headers = {
                        ...config.headers,
                        'Authorization': `Bearer ${token}`
                    };
                }
                return config;
            });

            // Interceptor para atualizar estado de conectividade
            window.api.addResponseInterceptor(async (response) => {
                window.state.setState('app.isOnline', true);
                return response;
            });

            // Interceptor para tratamento de erros de autenticação
            window.api.addErrorInterceptor(async (error, config) => {
                if (error.message.includes('401')) {
                    window.state.clearAuth();
                    if (window.router) {
                        window.router.navigate('/login', { replace: true });
                    }
                }
                throw error;
            });
        }

        // Integração entre Router e StateManager
        if (window.router && window.state) {
            // Listener para mudanças de rota
            document.addEventListener('router:routeChanged', (event) => {
                const { route } = event.detail;
                window.state.setState('app.currentPage', route.path);
            });
        }

        // Integração entre UIModule e StateManager
        if (window.UIModule && window.state) {
            // Listener para mudanças de tema
            window.state.subscribe('ui.theme', (theme) => {
                if (window.UIModule.setTheme) {
                    window.UIModule.setTheme(theme);
                }
            });

            // Listener para mudanças de sidebar
            window.state.subscribe('ui.sidebarOpen', (isOpen) => {
                if (window.UIModule.setSidebarState) {
                    window.UIModule.setSidebarState(isOpen);
                }
            });
        }

        // Integração entre Logger e AppConfig
        if (window.Logger && window.AppConfig) {
            // Configurar logger baseado na configuração
            const logLevel = window.AppConfig.isDevelopment() ? 'debug' : 'info';
            window.Logger.setLogLevel(logLevel);
        }

        console.log('🔗 Integrações entre módulos configuradas');
    }

    /**
     * Verificar se todos os módulos estão carregados
     */
    areModulesLoaded() {
        return this.loadOrder.every(moduleName =>
            this.modules.has(moduleName) && this.getModuleInstance(moduleName)
        );
    }

    /**
     * Obter módulo carregado
     */
    getModule(moduleName) {
        return this.modules.get(moduleName);
    }

    /**
     * Obter todos os módulos
     */
    getAllModules() {
        return Array.from(this.modules.entries());
    }

    /**
     * Verificar status de carregamento
     */
    getLoadingStatus() {
        const status = {};

        this.loadOrder.forEach(moduleName => {
            status[moduleName] = {
                loaded: this.modules.has(moduleName),
                loading: this.loadingPromises.has(moduleName),
                instance: this.getModuleInstance(moduleName)
            };
        });

        return status;
    }

    /**
     * Recarregar módulo
     */
    async reloadModule(moduleName) {
        if (this.modules.has(moduleName)) {
            this.modules.delete(moduleName);
        }

        if (this.loadingPromises.has(moduleName)) {
            this.loadingPromises.delete(moduleName);
        }

        return this.loadModule(moduleName);
    }

    /**
     * Recarregar todos os módulos
     */
    async reloadAllModules() {
        this.modules.clear();
        this.loadingPromises.clear();
        this.initialized = false;

        return this.initialize();
    }

    /**
     * Manipular erro de inicialização
     */
    handleInitializationError(error) {
        // Mostrar notificação de erro
        if (window.state) {
            window.state.addNotification({
                type: 'error',
                title: 'Erro de Inicialização',
                message: 'Não foi possível inicializar os módulos do sistema.',
                duration: 10000,
                persistent: true
            });
        }

        // Log detalhado do erro
        console.error('Detalhes do erro de inicialização:', {
            error: error.message,
            stack: error.stack,
            modules: this.getLoadingStatus()
        });

        // Disparar evento de erro
        this.dispatchEvent('modules:error', { error });
    }

    /**
     * Disparar evento customizado
     */
    dispatchEvent(name, data = {}) {
        const event = new CustomEvent(name, {
            detail: data,
            bubbles: true
        });

        document.dispatchEvent(event);
    }

    /**
     * Aguardar inicialização
     */
    async waitForInitialization() {
        if (this.initialized) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Timeout aguardando inicialização dos módulos'));
            }, this.config.timeout);

            const checkInitialization = () => {
                if (this.initialized) {
                    clearTimeout(timeout);
                    resolve();
                } else {
                    setTimeout(checkInitialization, 100);
                }
            };

            checkInitialization();
        });
    }
}

// Criar instância global
const sharedModulesLoader = new SharedModulesLoader();

// Exportar para uso global
window.SharedModulesLoader = sharedModulesLoader;
window.ModulesLoader = sharedModulesLoader; // Adicionar alias
window.modulesLoader = sharedModulesLoader;

// Inicializar automaticamente quando o DOM estiver pronto
// DESABILITADO TEMPORARIAMENTE PARA EVITAR CONFLITOS
/*
document.addEventListener('DOMContentLoaded', () => {
    sharedModulesLoader.initialize();
});
*/

// Função de conveniência para aguardar inicialização
window.waitForModules = () => sharedModulesLoader.waitForInitialization();

// Função para verificar se módulos estão prontos
window.areModulesReady = () => sharedModulesLoader.areModulesLoaded();

// Função para obter módulo
window.getModule = (name) => sharedModulesLoader.getModule(name);

// Função para recarregar módulo
window.reloadModule = (name) => sharedModulesLoader.reloadModule(name); 