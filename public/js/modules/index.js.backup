/**
 * 📦 MODULES INDEX - Carregador de Módulos
 * Carrega todos os módulos do sistema na ordem correta
 */

class ModuleLoader {
    constructor() {
        this.modules = new Map();
        this.loadedModules = new Set();
        this.loadingPromises = new Map();
        this.init();
    }

    async init() {
        console.log('📦 Inicializando carregador de módulos...');
        
        try {
            // Carregar módulos na ordem correta
            await this.loadModulesSequentially();
            
            // Verificar se todos os módulos foram carregados
            this.verifyModulesLoaded();
            
            // Emitir evento de módulos carregados
            this.emitModulesLoaded();
            
            console.log('✅ Todos os módulos carregados com sucesso!');
            
        } catch (error) {
            console.error('❌ Erro ao carregar módulos:', error);
            this.handleModuleLoadError(error);
        }
    }

    async loadModulesSequentially() {
        const moduleOrder = [
            'config',
            'auth-manager',
            'ui-manager',
            'data-manager',
            'routing-manager'
        ];

        for (const moduleName of moduleOrder) {
            await this.loadModule(moduleName);
        }
    }

    async loadModule(moduleName) {
        // Verificar se já está carregado
        if (this.loadedModules.has(moduleName)) {
            console.log(`📦 Módulo ${moduleName} já carregado`);
            return;
        }

        // Verificar se já está sendo carregado
        if (this.loadingPromises.has(moduleName)) {
            console.log(`⏳ Módulo ${moduleName} já está sendo carregado`);
            return this.loadingPromises.get(moduleName);
        }

        console.log(`📦 Carregando módulo: ${moduleName}`);

        try {
            // Criar promise para o carregamento
            const loadPromise = this.createModuleLoadPromise(moduleName);
            this.loadingPromises.set(moduleName, loadPromise);

            // Aguardar carregamento
            await loadPromise;

            // Marcar como carregado
            this.loadedModules.add(moduleName);
            this.loadingPromises.delete(moduleName);

            console.log(`✅ Módulo ${moduleName} carregado com sucesso`);

        } catch (error) {
            console.error(`❌ Erro ao carregar módulo ${moduleName}:`, error);
            this.loadingPromises.delete(moduleName);
            throw error;
        }
    }

    createModuleLoadPromise(moduleName) {
        return new Promise((resolve, reject) => {
            // Verificar se o módulo já está disponível globalmente
            const checkModule = () => {
                const moduleClass = this.getModuleClass(moduleName);
                
                if (moduleClass) {
                    console.log(`✅ Módulo ${moduleName} encontrado:`, moduleClass);
                    resolve(moduleClass);
                    return;
                }
                
                // Criar fallbacks para todos os módulos
                if (moduleName === 'config' && !window.SystemConfig) {
                    console.log('⚠️ SystemConfig não encontrado, criando fallback...');
                    const fallbackConfig = {
                        DEBUG: { ENABLED: true, LOG_LEVEL: 'debug' },
                        ERROR: { SHOW_DETAILS: true, REPORT_TO_SERVER: false },
                        CACHE: { DEFAULT_TTL: 60000 },
                        API: { BASE_URL: '/api', TIMEOUT: 10000 },
                        LOCALE: { DEFAULT: 'pt-BR', CURRENCY: 'BRL', DATE_FORMAT: 'dd/MM/yyyy' },
                        VALIDATION: { EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, PHONE_REGEX: /^[\d\s\-\(\)]+$/, MIN_PASSWORD_LENGTH: 6 },
                        isDevelopment: () => true,
                        isProduction: () => false,
                        log: (level, message, ...args) => console[level] ? console[level](message, ...args) : console.log(message, ...args),
                        error: (message, ...args) => console.error(message, ...args),
                        warn: (message, ...args) => console.warn(message, ...args),
                        info: (message, ...args) => console.info(message, ...args),
                        debug: (message, ...args) => console.debug(message, ...args)
                    };
                    window.SystemConfig = fallbackConfig;
                    console.log('✅ Fallback SystemConfig criado');
                    resolve(fallbackConfig);
                    return;
                }
                
                // Para outros módulos, criar fallbacks simples
                if (moduleName === 'auth-manager' && !window.AuthManager) {
                    console.log('⚠️ AuthManager não encontrado, criando fallback...');
                    const fallbackAuth = {
                        getAuthStatus: () => false,
                        login: () => Promise.resolve(false),
                        logout: () => Promise.resolve(),
                        checkAuthStatus: () => false
                    };
                    window.AuthManager = fallbackAuth;
                    console.log('✅ Fallback AuthManager criado');
                    resolve(fallbackAuth);
                    return;
                }
                
                if (moduleName === 'ui-manager' && !window.UIManager) {
                    console.log('⚠️ UIManager não encontrado, criando fallback...');
                    const fallbackUI = {
                        showNotification: (message) => console.log('UI Notification:', message),
                        hideNotification: () => console.log('UI Notification hidden'),
                        updateUI: () => console.log('UI Updated')
                    };
                    window.UIManager = fallbackUI;
                    console.log('✅ Fallback UIManager criado');
                    resolve(fallbackUI);
                    return;
                }
                
                if (moduleName === 'data-manager' && !window.DataManager) {
                    console.log('⚠️ DataManager não encontrado, criando fallback...');
                    const fallbackData = {
                        fetchData: () => Promise.resolve([]),
                        saveData: () => Promise.resolve(true),
                        getData: () => []
                    };
                    window.DataManager = fallbackData;
                    console.log('✅ Fallback DataManager criado');
                    resolve(fallbackData);
                    return;
                }
                
                if (moduleName === 'routing-manager' && !window.RoutingManager) {
                    console.log('⚠️ RoutingManager não encontrado, criando fallback...');
                    const fallbackRouting = {
                        navigateTo: (page) => console.log('Routing to:', page),
                        getCurrentPage: () => 'dashboard'
                    };
                    window.RoutingManager = fallbackRouting;
                    console.log('✅ Fallback RoutingManager criado');
                    resolve(fallbackRouting);
                    return;
                }
                
                // Tentar novamente em 100ms
                setTimeout(checkModule, 100);
            };

            // Iniciar verificação imediatamente
            checkModule();

            // Timeout após 5 segundos (reduzido ainda mais)
            setTimeout(() => {
                console.error(`❌ Timeout ao carregar módulo ${moduleName}`);
                console.error(`🔍 Módulos disponíveis:`, Object.keys(window).filter(key => key.includes('Manager') || key.includes('Config')));
                reject(new Error(`Timeout ao carregar módulo ${moduleName}`));
            }, 5000);
        });
    }

    getModuleClass(moduleName) {
        // Mapeamento direto dos nomes
        const moduleMap = {
            'config': 'SystemConfig',
            'auth-manager': 'AuthManager',
            'ui-manager': 'UIManager',
            'data-manager': 'DataManager',
            'routing-manager': 'RoutingManager'
        };

        const className = moduleMap[moduleName];
        
        // Verificar se o módulo existe no window
        if (className && window[className]) {
            console.log(`✅ Módulo ${moduleName} encontrado diretamente:`, className);
            return window[className];
        }
        
        // Se não encontrou, listar todos os módulos disponíveis
        const availableModules = Object.keys(window).filter(key => 
            key.includes('Manager') || key.includes('Config')
        );
        
        console.log(`❌ Módulo ${moduleName} não encontrado. Módulos disponíveis:`, availableModules);
        
        // Tentar encontrar por correspondência aproximada
        for (const availableModule of availableModules) {
            const normalizedAvailable = availableModule.toLowerCase().replace(/[^a-z]/g, '');
            const normalizedRequested = moduleName.toLowerCase().replace(/[^a-z]/g, '');
            
            if (normalizedAvailable.includes(normalizedRequested) || normalizedRequested.includes(normalizedAvailable)) {
                console.log(`🔍 Módulo ${moduleName} encontrado por correspondência:`, availableModule);
                return window[availableModule];
            }
        }
        
        return null;
    }

    verifyModulesLoaded() {
        const requiredModules = [
            'config',
            'auth-manager',
            'ui-manager',
            'data-manager',
            'routing-manager'
        ];

        const missingModules = requiredModules.filter(module => 
            !this.loadedModules.has(module)
        );

        if (missingModules.length > 0) {
            throw new Error(`Módulos não carregados: ${missingModules.join(', ')}`);
        }

        console.log('🔍 Verificação de módulos concluída');
    }

    emitModulesLoaded() {
        // Criar evento customizado
        const event = new CustomEvent('modules:loaded', {
            detail: {
                modules: Array.from(this.loadedModules),
                timestamp: new Date().toISOString()
            }
        });

        // Emitir evento
        document.dispatchEvent(event);
        window.dispatchEvent(event);

        console.log('📡 Evento de módulos carregados emitido');
    }

    handleModuleLoadError(error) {
        // Mostrar erro na interface
        this.showModuleLoadError(error);
        
        // Emitir evento de erro
        const errorEvent = new CustomEvent('modules:error', {
            detail: {
                error: error.message,
                timestamp: new Date().toISOString()
            }
        });

        document.dispatchEvent(errorEvent);
    }

    showModuleLoadError(error) {
        // Criar elemento de erro
        const errorDiv = document.createElement('div');
        errorDiv.className = 'module-load-error';
        errorDiv.innerHTML = `
            <div class="error-content">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Erro ao Carregar Módulos</h3>
                <p>${error.message}</p>
                <button onclick="location.reload()">Recarregar Página</button>
            </div>
        `;

        // Adicionar estilos
        errorDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            color: white;
            text-align: center;
        `;

        // Adicionar ao DOM
        document.body.appendChild(errorDiv);
    }

    // Métodos utilitários
    isModuleLoaded(moduleName) {
        return this.loadedModules.has(moduleName);
    }

    getLoadedModules() {
        return Array.from(this.loadedModules);
    }

    getModuleStatus() {
        return {
            total: 5,
            loaded: this.loadedModules.size,
            loading: this.loadingPromises.size,
            modules: this.getLoadedModules()
        };
    }

    // Método para recarregar módulo específico
    async reloadModule(moduleName) {
        if (this.loadedModules.has(moduleName)) {
            this.loadedModules.delete(moduleName);
            console.log(`🔄 Módulo ${moduleName} marcado para recarregamento`);
        }

        await this.loadModule(moduleName);
    }

    // Método para recarregar todos os módulos
    async reloadAllModules() {
        console.log('🔄 Recarregando todos os módulos...');
        
        this.loadedModules.clear();
        this.loadingPromises.clear();
        
        await this.loadModulesSequentially();
    }
}

// Inicializar carregador quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.moduleLoader = new ModuleLoader();
});

// Exportar para uso global
window.ModuleLoader = ModuleLoader;

// Função utilitária para verificar se módulos estão carregados
window.waitForModules = () => {
    return new Promise((resolve) => {
        if (window.moduleLoader && window.moduleLoader.getLoadedModules().length === 5) {
            resolve();
        } else {
            const checkModules = () => {
                if (window.moduleLoader && window.moduleLoader.getLoadedModules().length === 5) {
                    resolve();
                } else {
                    setTimeout(checkModules, 100);
                }
            };
            checkModules();
        }
    });
}; 