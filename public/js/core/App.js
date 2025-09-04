/**
 * 🚀 Sistema de Vendas - Core Application
 * Arquitetura modular e escalável
 */

class App {
    constructor() {
        this.modules = new Map();
        this.eventBus = new EventBus();
        this.cache = new CacheManager();
        this.router = new Router();
        this.store = new Store();

        this.isInitialized = false;
        this.config = {
            debug: true, // Sempre true no navegador
            apiBaseUrl: '/api',
            cacheTTL: 5 * 60 * 1000, // 5 minutos
            maxRetries: 3
        };

        this.init();
    }

    async init() {
        try {
            console.log('🚀 Inicializando Sistema de Vendas...');

            // Inicializar módulos core
            await this.initializeCoreModules();

            // Configurar event listeners
            this.setupEventListeners();

            // Inicializar roteamento
            await this.router.init();

            // Marcar como inicializado
            this.isInitialized = true;

            console.log('✅ Sistema de Vendas inicializado com sucesso!');

            // Emitir evento de inicialização
            this.eventBus.publish('app:initialized');

        } catch (error) {
            console.error('❌ Erro ao inicializar Sistema de Vendas:', error);
            this.handleError(error);
        }
    }

    async initializeCoreModules() {
        const coreModules = [
            { name: 'auth', module: AuthModule },
            { name: 'ui', module: UIModule },
            { name: 'api', module: APIModule },
            { name: 'data', module: DataModule }
        ];

        for (const { name, module } of coreModules) {
            try {
                const instance = new module(this);
                await instance.init();
                this.modules.set(name, instance);
                console.log(`✅ Módulo ${name} inicializado`);
            } catch (error) {
                console.error(`❌ Erro ao inicializar módulo ${name}:`, error);
                throw error;
            }
        }
    }

    setupEventListeners() {
        // Event listeners globais
        window.addEventListener('online', () => {
            this.eventBus.publish('network:online');
        });

        window.addEventListener('offline', () => {
            this.eventBus.publish('network:offline');
        });

        window.addEventListener('resize', () => {
            this.eventBus.publish('window:resize', {
                width: window.innerWidth,
                height: window.innerHeight
            });
        });

        // Interceptar erros não capturados
        window.addEventListener('error', (event) => {
            this.handleError(event.error);
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason);
        });
    }

    getModule(name) {
        return this.modules.get(name);
    }

    async loadModule(name) {
        if (this.modules.has(name)) {
            return this.modules.get(name);
        }

        try {
            const module = await import(`../modules/${name}.js`);
            const instance = new module.default(this);
            await instance.init();
            this.modules.set(name, instance);
            return instance;
        } catch (error) {
            console.error(`❌ Erro ao carregar módulo ${name}:`, error);
            throw error;
        }
    }

    handleError(error) {
        console.error('❌ Erro no sistema:', error);

        // Emitir evento de erro
        this.eventBus.publish('app:error', { error });

        // Mostrar notificação de erro
        const ui = this.getModule('ui');
        if (ui) {
            ui.showError('Erro do Sistema', 'Ocorreu um erro inesperado. Tente novamente.');
        }
    }

    // Getters para módulos comuns
    get auth() { return this.getModule('auth'); }
    get ui() { return this.getModule('ui'); }
    get api() { return this.getModule('api'); }
    get data() { return this.getModule('data'); }
}

// Event Bus para comunicação entre módulos
class EventBus {
    constructor() {
        this.events = new Map();
    }

    subscribe(event, callback) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event).push(callback);
    }

    unsubscribe(event, callback) {
        if (this.events.has(event)) {
            const callbacks = this.events.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    publish(event, data) {
        if (this.events.has(event)) {
            this.events.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`❌ Erro no callback do evento ${event}:`, error);
                }
            });
        }
    }
}

// Cache Manager para otimização de performance
class CacheManager {
    constructor() {
        this.cache = new Map();
        this.maxSize = 100;
        this.defaultTTL = 5 * 60 * 1000; // 5 minutos
    }

    set(key, data, ttl = this.defaultTTL) {
        if (this.cache.size >= this.maxSize) {
            this.evictOldest();
        }

        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl
        });
    }

    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;

        if (Date.now() - item.timestamp > item.ttl) {
            this.cache.delete(key);
            return null;
        }

        return item.data;
    }

    has(key) {
        return this.cache.has(key) && !this.isExpired(key);
    }

    delete(key) {
        return this.cache.delete(key);
    }

    clear() {
        this.cache.clear();
    }

    isExpired(key) {
        const item = this.cache.get(key);
        if (!item) return true;
        return Date.now() - item.timestamp > item.ttl;
    }

    evictOldest() {
        let oldestKey = null;
        let oldestTime = Date.now();

        for (const [key, item] of this.cache.entries()) {
            if (item.timestamp < oldestTime) {
                oldestTime = item.timestamp;
                oldestKey = key;
            }
        }

        if (oldestKey) {
            this.cache.delete(oldestKey);
        }
    }

    getStats() {
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            hitRate: this.calculateHitRate()
        };
    }

    calculateHitRate() {
        // Implementação simplificada de hit rate
        return this.cache.size / this.maxSize;
    }
}

// Store para gerenciamento de estado global
class Store {
    constructor() {
        this.state = new Map();
        this.subscribers = new Map();
    }

    set(key, value) {
        this.state.set(key, value);
        this.notifySubscribers(key, value);
    }

    get(key) {
        return this.state.get(key);
    }

    has(key) {
        return this.state.has(key);
    }

    delete(key) {
        const deleted = this.state.delete(key);
        if (deleted) {
            this.notifySubscribers(key, undefined);
        }
        return deleted;
    }

    subscribe(key, callback) {
        if (!this.subscribers.has(key)) {
            this.subscribers.set(key, []);
        }
        this.subscribers.get(key).push(callback);
    }

    unsubscribe(key, callback) {
        if (this.subscribers.has(key)) {
            const callbacks = this.subscribers.get(key);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    notifySubscribers(key, value) {
        if (this.subscribers.has(key)) {
            this.subscribers.get(key).forEach(callback => {
                try {
                    callback(value);
                } catch (error) {
                    console.error(`❌ Erro no subscriber do store para ${key}:`, error);
                }
            });
        }
    }

    getState() {
        return Object.fromEntries(this.state);
    }

    setState(newState) {
        for (const [key, value] of Object.entries(newState)) {
            this.set(key, value);
        }
    }
}

// Router para navegação
class Router {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.middleware = [];
    }

    async init() {
        this.setupRoutes();
        this.setupEventListeners();
        await this.handleInitialRoute();
    }

    setupRoutes() {
        // Definir rotas disponíveis
        this.routes.set('dashboard', {
            path: '/#dashboard',
            title: 'Dashboard',
            requiresAuth: true,
            module: 'dashboard'
        });

        this.routes.set('produtos', {
            path: '/#produtos',
            title: 'Produtos',
            requiresAuth: true,
            module: 'products'
        });

        this.routes.set('clientes', {
            path: '/#clientes',
            title: 'Clientes',
            requiresAuth: true,
            module: 'customers'
        });

        this.routes.set('vendas', {
            path: '/#vendas',
            title: 'Vendas',
            requiresAuth: true,
            module: 'sales'
        });

        this.routes.set('orcamentos', {
            path: '/#orcamentos',
            title: 'Orçamentos',
            requiresAuth: true,
            module: 'quotes'
        });

        this.routes.set('relatorios', {
            path: '/#relatorios',
            title: 'Relatórios',
            requiresAuth: true,
            module: 'reports'
        });
    }

    setupEventListeners() {
        window.addEventListener('hashchange', () => {
            this.handleRouteChange();
        });

        // Event listener para navegação programática
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-route]')) {
                e.preventDefault();
                const route = e.target.getAttribute('data-route');
                this.navigate(route);
            }
        });
    }

    async handleInitialRoute() {
        const hash = window.location.hash.slice(1) || 'dashboard';
        await this.navigate(hash);
    }

    async handleRouteChange() {
        const hash = window.location.hash.slice(1) || 'dashboard';
        await this.navigate(hash);
    }

    async navigate(routeName) {
        try {
            const route = this.routes.get(routeName);
            if (!route) {
                console.warn(`Rota não encontrada: ${routeName}`);
                return this.navigate('dashboard');
            }

            // Executar middleware
            for (const middleware of this.middleware) {
                const result = await middleware(route);
                if (result === false) {
                    return false;
                }
            }

            // Atualizar URL
            window.location.hash = routeName;

            // Carregar módulo da página
            await this.loadPageModule(route.module);

            // Atualizar título
            document.title = `Sistema de Vendas - ${route.title}`;

            // Atualizar navegação ativa
            this.updateActiveNavigation(routeName);

            this.currentRoute = routeName;

            console.log(`✅ Navegação para: ${routeName}`);

        } catch (error) {
            console.error(`❌ Erro na navegação para ${routeName}:`, error);
        }
    }

    async loadPageModule(moduleName) {
        try {
            const module = await import(`../modules/${moduleName}.js`);
            const instance = new module.default();
            await instance.init();

            // Emitir evento de carregamento de página
            window.eventBus.publish('page:loaded', { module: moduleName });

        } catch (error) {
            console.error(`❌ Erro ao carregar módulo ${moduleName}:`, error);
            throw error;
        }
    }

    updateActiveNavigation(routeName) {
        // Remover classe ativa de todos os itens
        document.querySelectorAll('[data-route]').forEach(item => {
            item.classList.remove('active');
        });

        // Adicionar classe ativa ao item atual
        const activeItem = document.querySelector(`[data-route="${routeName}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
    }

    addMiddleware(middleware) {
        this.middleware.push(middleware);
    }

    getCurrentRoute() {
        return this.currentRoute;
    }

    getRoutes() {
        return Array.from(this.routes.keys());
    }
}

// Inicializar aplicação quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

// Exportar para uso global
window.App = App;
window.EventBus = EventBus;
window.CacheManager = CacheManager;
window.Store = Store;
window.Router = Router; 