/**
 * 🚀 LAZY LOADING SYSTEM - SISTEMA PROFISSIONAL
 * Carregamento sob demanda de páginas e módulos
 */

class LazyLoadingSystem {
    constructor() {
        this.loadedModules = new Set();
        this.loadingModules = new Set();
        this.moduleCache = new Map();
        this.config = {
            timeout: 10000, // 10 segundos
            retryAttempts: 3,
            preloadCritical: ['dashboard', 'clientes'],
            preloadDelay: 2000 // 2 segundos após carregamento inicial
        };

        this.init();
    }

    init() {
        console.log('🚀 Inicializando sistema de lazy loading...');
        this.setupIntersectionObserver();
        this.setupPreloading();
        this.setupErrorHandling();

        // Marcar módulos já carregados no HTML
        this.markPreloadedModules();
    }

    /**
     * Marcar módulos já carregados no HTML
     */
    markPreloadedModules() {
        const preloadedModules = [
            'dashboard', 'clientes', 'produtos', 'vendas',
            'orcamentos', 'relatorios', 'relatorios-com-dados-reais',
            'relatorios-simples-global', 'relatorios-responsive'
        ];

        preloadedModules.forEach(moduleName => {
            this.loadedModules.add(moduleName);
            console.log(`✅ Módulo ${moduleName} já carregado no HTML`);
        });
    }

    /**
     * Carregar módulo sob demanda
     */
    async loadModule(moduleName) {
        // Verificar se já está carregado
        if (this.loadedModules.has(moduleName)) {
            console.log(`✅ Módulo ${moduleName} já carregado`);
            return this.getModuleInstance(moduleName);
        }

        // Verificar se está carregando
        if (this.loadingModules.has(moduleName)) {
            console.log(`⏳ Módulo ${moduleName} já está carregando...`);
            return this.waitForModule(moduleName);
        }

        // Se chegou aqui, o módulo não foi carregado no HTML
        console.log(`⚠️ Módulo ${moduleName} não encontrado no HTML, carregando dinamicamente...`);

        // Iniciar carregamento
        this.loadingModules.add(moduleName);
        console.log(`🔄 Carregando módulo: ${moduleName}`);

        try {
            const module = await this.loadModuleFile(moduleName);
            this.loadedModules.add(moduleName);
            this.moduleCache.set(moduleName, module);
            this.loadingModules.delete(moduleName);

            console.log(`✅ Módulo ${moduleName} carregado com sucesso`);
            this.dispatchEvent('module:loaded', { moduleName, module });

            return module;
        } catch (error) {
            this.loadingModules.delete(moduleName);
            console.error(`❌ Erro ao carregar módulo ${moduleName}:`, error);
            this.dispatchEvent('module:error', { moduleName, error });
            throw error;
        }
    }

    /**
     * Carregar arquivo do módulo
     */
    async loadModuleFile(moduleName) {
        const moduleMap = {
            'dashboard': '/js/pages/dashboard.js',
            'clientes': '/js/pages/clientes.js',
            'produtos': '/js/pages/produtos.js',
            'vendas': '/js/pages/vendas.js',
            'orcamentos': '/js/pages/orcamentos.js',
            'relatorios': '/js/pages/relatorios.js',
            'relatorios-com-dados-reais': '/js/pages/relatorios-com-dados-reais.js',
            'relatorios-simples-global': '/js/pages/relatorios-simples-global.js',
            'relatorios-responsive': '/js/pages/relatorios-responsive.js'
        };

        const modulePath = moduleMap[moduleName];
        if (!modulePath) {
            throw new Error(`Módulo ${moduleName} não encontrado`);
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = modulePath;
            script.async = true;

            const timeout = setTimeout(() => {
                reject(new Error(`Timeout ao carregar ${moduleName}`));
            }, this.config.timeout);

            script.onload = () => {
                clearTimeout(timeout);
                resolve(window[`${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Page`]);
            };

            script.onerror = () => {
                clearTimeout(timeout);
                reject(new Error(`Erro ao carregar ${moduleName}`));
            };

            document.head.appendChild(script);
        });
    }

    /**
     * Aguardar módulo em carregamento
     */
    async waitForModule(moduleName) {
        return new Promise((resolve, reject) => {
            const checkInterval = setInterval(() => {
                if (this.loadedModules.has(moduleName)) {
                    clearInterval(checkInterval);
                    resolve(this.moduleCache.get(moduleName));
                }
            }, 100);

            // Timeout para evitar loop infinito
            setTimeout(() => {
                clearInterval(checkInterval);
                reject(new Error(`Timeout aguardando ${moduleName}`));
            }, this.config.timeout);
        });
    }

    /**
     * Configurar Intersection Observer para lazy loading
     */
    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const pageName = entry.target.dataset.page;
                    if (pageName && !this.loadedModules.has(pageName)) {
                        this.loadModule(pageName);
                    }
                }
            });
        }, {
            rootMargin: '50px', // Carregar 50px antes de entrar na viewport
            threshold: 0.1
        });

        // Observar elementos de navegação
        document.querySelectorAll('[data-page]').forEach(element => {
            observer.observe(element);
        });
    }

    /**
     * Configurar preloading de módulos críticos
     */
    setupPreloading() {
        setTimeout(() => {
            this.config.preloadCritical.forEach(moduleName => {
                if (!this.loadedModules.has(moduleName)) {
                    console.log(`🔄 Precarregando módulo crítico: ${moduleName}`);
                    this.loadModule(moduleName);
                }
            });
        }, this.config.preloadDelay);
    }

    /**
     * Configurar tratamento de erros
     */
    setupErrorHandling() {
        window.addEventListener('module:error', (event) => {
            const { moduleName, error } = event.detail;
            console.error(`❌ Erro no módulo ${moduleName}:`, error);

            // Tentar recarregar em caso de erro
            if (!this.loadedModules.has(moduleName)) {
                setTimeout(() => {
                    console.log(`🔄 Tentando recarregar módulo: ${moduleName}`);
                    this.loadModule(moduleName);
                }, 2000);
            }
        });
    }

    /**
     * Obter instância do módulo já carregado
     */
    getModuleInstance(moduleName) {
        const classNameMap = {
            'dashboard': 'DashboardPage',
            'clientes': 'ClientesPage',
            'produtos': 'ProdutosPage',
            'vendas': 'VendasPage',
            'orcamentos': 'OrcamentosPage',
            'relatorios': 'RelatoriosPageFinal',
            'relatorios-com-dados-reais': 'RelatoriosPageComDadosReais',
            'relatorios-simples-global': 'RelatoriosSimplesGlobal',
            'relatorios-responsive': 'RelatoriosResponsivos'
        };

        const className = classNameMap[moduleName];
        if (!className) {
            throw new Error(`Classe não encontrada para módulo ${moduleName}`);
        }

        if (window[className]) {
            return window[className];
        }

        throw new Error(`Instância da classe ${className} não encontrada`);
    }

    /**
     * Disparar evento customizado
     */
    dispatchEvent(name, data) {
        const event = new CustomEvent(name, {
            detail: data,
            bubbles: true
        });
        document.dispatchEvent(event);
    }

    /**
     * Obter estatísticas de carregamento
     */
    getStats() {
        return {
            loaded: Array.from(this.loadedModules),
            loading: Array.from(this.loadingModules),
            cached: Array.from(this.moduleCache.keys()),
            total: this.loadedModules.size
        };
    }
}

// Inicializar sistema de lazy loading
window.lazyLoadingSystem = new LazyLoadingSystem();
console.log('🚀 Sistema de lazy loading inicializado!'); 