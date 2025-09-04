/**
 * 🧭 Sistema de Roteamento Avançado
 * Roteamento baseado em hash com middleware e lazy loading
 */

class Router {
    constructor() {
        this.routes = new Map();
        this.middleware = [];
        this.currentRoute = null;
        this.history = [];
        this.maxHistorySize = 50;

        // Configurações
        this.config = {
            defaultRoute: '/dashboard',
            notFoundRoute: '/404',
            enableHistory: true,
            enableAnalytics: false,
            transitionDuration: 300
        };

        // Estado de navegação
        this.navigationState = {
            isLoading: false,
            isTransitioning: false,
            lastNavigation: null
        };

        // Inicializar
        this.initialize();
    }

    /**
     * Inicializar o roteador
     */
    initialize() {
        // Configurar listeners de eventos
        this.setupEventListeners();

        // Registrar rotas padrão
        this.registerDefaultRoutes();

        // Navegar para rota inicial
        this.navigateToInitialRoute();

        console.log('✅ Router inicializado');
    }

    /**
     * Configurar listeners de eventos
     */
    setupEventListeners() {
        // Listener para mudanças de hash
        window.addEventListener('hashchange', (event) => {
            this.handleHashChange(event);
        });

        // Listener para popstate (navegação do browser)
        window.addEventListener('popstate', (event) => {
            this.handlePopState(event);
        });

        // Listener para cliques em links
        document.addEventListener('click', (event) => {
            this.handleLinkClick(event);
        });
    }

    /**
     * Registrar rotas padrão
     */
    registerDefaultRoutes() {
        // Dashboard
        this.register('/dashboard', {
            title: 'Dashboard',
            component: 'DashboardPage',
            auth: true,
            roles: ['admin', 'gerente', 'vendedor'],
            icon: 'fas fa-tachometer-alt',
            order: 1
        });

        // Produtos
        this.register('/produtos', {
            title: 'Produtos',
            component: 'ProdutosPage',
            auth: true,
            roles: ['admin', 'gerente', 'vendedor'],
            icon: 'fas fa-box',
            order: 2
        });

        // Clientes
        this.register('/clientes', {
            title: 'Clientes',
            component: 'ClientesPage',
            auth: true,
            roles: ['admin', 'gerente', 'vendedor'],
            icon: 'fas fa-users',
            order: 3
        });

        // Vendas
        this.register('/vendas', {
            title: 'Vendas',
            component: 'VendasPage',
            auth: true,
            roles: ['admin', 'gerente', 'vendedor'],
            icon: 'fas fa-shopping-cart',
            order: 4
        });

        // Orçamentos
        this.register('/orcamentos', {
            title: 'Orçamentos',
            component: 'OrcamentosPage',
            auth: true,
            roles: ['admin', 'gerente', 'vendedor'],
            icon: 'fas fa-file-invoice',
            order: 5
        });

        // Relatórios
        this.register('/relatorios', {
            title: 'Relatórios',
            component: 'RelatoriosPage',
            auth: true,
            roles: ['admin', 'gerente'],
            icon: 'fas fa-chart-bar',
            order: 6
        });

        // Sistema (Admin)
        this.register('/sistema', {
            title: 'Sistema',
            component: 'SistemaPage',
            auth: true,
            roles: ['admin'],
            icon: 'fas fa-cog',
            order: 7
        });

        // Login
        this.register('/login', {
            title: 'Login',
            component: 'LoginPage',
            auth: false,
            roles: [],
            icon: 'fas fa-sign-in-alt',
            order: 0
        });

        // 404
        this.register('/404', {
            title: 'Página não encontrada',
            component: 'NotFoundPage',
            auth: false,
            roles: [],
            icon: 'fas fa-exclamation-triangle',
            order: 999
        });
    }

    /**
     * Registrar uma rota
     */
    register(path, config) {
        const route = {
            path,
            ...config,
            params: this.extractParams(path),
            regex: this.pathToRegex(path)
        };

        this.routes.set(path, route);

        console.log(`📝 Rota registrada: ${path}`);
    }

    /**
     * Extrair parâmetros da rota
     */
    extractParams(path) {
        const params = [];
        const regex = /:(\w+)/g;
        let match;

        while ((match = regex.exec(path)) !== null) {
            params.push(match[1]);
        }

        return params;
    }

    /**
     * Converter path para regex
     */
    pathToRegex(path) {
        const regexPath = path
            .replace(/:[^\/]+/g, '([^/]+)')
            .replace(/\*/g, '.*');

        return new RegExp(`^${regexPath}$`);
    }

    /**
     * Adicionar middleware
     */
    use(middleware) {
        this.middleware.push(middleware);
    }

    /**
     * Navegar para rota inicial
     */
    navigateToInitialRoute() {
        const hash = window.location.hash.slice(1) || this.config.defaultRoute;
        this.navigate(hash);
    }

    /**
     * Navegar para uma rota
     */
    async navigate(path, options = {}) {
        const {
            replace = false,
            silent = false,
            params = {},
            query = {}
        } = options;

        try {
            // Verificar se já está na rota
            if (this.currentRoute && this.currentRoute.path === path) {
                return;
            }

            // Definir estado de navegação
            this.navigationState.isLoading = true;
            this.navigationState.isTransitioning = true;

            // Executar middleware
            const middlewareResult = await this.executeMiddleware(path, params, query);
            if (!middlewareResult.allowed) {
                console.warn('Navegação bloqueada pelo middleware:', middlewareResult.reason);
                return;
            }

            // Encontrar rota
            const route = this.findRoute(path);
            if (!route) {
                console.warn(`Rota não encontrada: ${path}`);
                return this.navigate(this.config.notFoundRoute);
            }

            // Verificar autenticação
            if (route.auth && !this.isAuthenticated()) {
                console.warn('Usuário não autenticado, redirecionando para login');
                return this.navigate('/login', { replace: true });
            }

            // Verificar permissões
            if (route.roles.length > 0 && !this.hasRole(route.roles)) {
                console.warn('Usuário sem permissão para acessar esta rota');
                return this.navigate('/dashboard', { replace: true });
            }

            // Atualizar URL
            if (!silent) {
                this.updateURL(path, replace);
            }

            // Carregar componente
            await this.loadComponent(route);

            // Atualizar estado
            this.currentRoute = route;
            this.addToHistory(path);

            // Atualizar UI
            this.updateUI(route);

            // Disparar evento
            this.dispatchEvent('routeChanged', { route, path, params, query });

            // Analytics
            if (this.config.enableAnalytics) {
                this.trackPageView(path);
            }

        } catch (error) {
            console.error('Erro na navegação:', error);
            this.handleNavigationError(error, path);
        } finally {
            // Limpar estado de navegação
            this.navigationState.isLoading = false;
            this.navigationState.isTransitioning = false;
            this.navigationState.lastNavigation = Date.now();
        }
    }

    /**
     * Executar middleware
     */
    async executeMiddleware(path, params, query) {
        const context = {
            path,
            params,
            query,
            user: this.getCurrentUser(),
            isAuthenticated: this.isAuthenticated()
        };

        for (const middleware of this.middleware) {
            try {
                const result = await middleware(context);
                if (result && result.allowed === false) {
                    return result;
                }
            } catch (error) {
                console.error('Erro no middleware:', error);
                return { allowed: false, reason: 'Erro no middleware' };
            }
        }

        return { allowed: true };
    }

    /**
     * Encontrar rota
     */
    findRoute(path) {
        // Busca exata
        if (this.routes.has(path)) {
            return this.routes.get(path);
        }

        // Busca por regex
        for (const route of this.routes.values()) {
            if (route.regex.test(path)) {
                return route;
            }
        }

        return null;
    }

    /**
     * Carregar componente
     */
    async loadComponent(route) {
        try {
            // Verificar se o componente já está carregado
            if (window[route.component]) {
                return;
            }

            // Lazy loading do componente
            const componentPath = `pages/${route.component.toLowerCase()}.js`;

            // Simular carregamento dinâmico
            await this.loadScript(componentPath);

            // Verificar se o componente foi carregado
            if (!window[route.component]) {
                throw new Error(`Componente não encontrado: ${route.component}`);
            }

        } catch (error) {
            console.error(`Erro ao carregar componente ${route.component}:`, error);
            throw error;
        }
    }

    /**
     * Carregar script dinamicamente
     */
    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * Atualizar URL
     */
    updateURL(path, replace = false) {
        const url = `#${path}`;

        if (replace) {
            window.location.replace(url);
        } else {
            window.location.hash = url;
        }
    }

    /**
     * Atualizar UI
     */
    updateUI(route) {
        // Atualizar título da página
        document.title = `${route.title} - Sistema de Vendas`;

        // Atualizar navegação ativa
        this.updateActiveNavigation(route.path);

        // Atualizar breadcrumb
        this.updateBreadcrumb(route);

        // Atualizar estado global
        if (window.state) {
            window.state.setState('app.currentPage', route.path);
        }
    }

    /**
     * Atualizar navegação ativa
     */
    updateActiveNavigation(path) {
        // Remover classe ativa de todos os links
        document.querySelectorAll('.nav-link, .sidebar-link').forEach(link => {
            link.classList.remove('active');
        });

        // Adicionar classe ativa ao link correspondente
        const activeLink = document.querySelector(`[href="#${path}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    /**
     * Atualizar breadcrumb
     */
    updateBreadcrumb(route) {
        const breadcrumbContainer = document.querySelector('.breadcrumb');
        if (!breadcrumbContainer) return;

        const breadcrumb = `
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb">
                    <li class="breadcrumb-item">
                        <a href="#/dashboard">
                            <i class="fas fa-home"></i> Início
                        </a>
                    </li>
                    <li class="breadcrumb-item active" aria-current="page">
                        <i class="${route.icon}"></i> ${route.title}
                    </li>
                </ol>
            </nav>
        `;

        breadcrumbContainer.innerHTML = breadcrumb;
    }

    /**
     * Adicionar ao histórico
     */
    addToHistory(path) {
        if (!this.config.enableHistory) return;

        this.history.push({
            path,
            timestamp: Date.now()
        });

        // Manter tamanho máximo do histórico
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }
    }

    /**
     * Disparar evento customizado
     */
    dispatchEvent(name, data) {
        const event = new CustomEvent(`router:${name}`, {
            detail: data,
            bubbles: true
        });

        document.dispatchEvent(event);
    }

    /**
     * Rastrear visualização de página
     */
    trackPageView(path) {
        if (typeof gtag !== 'undefined') {
            gtag('config', 'GA_MEASUREMENT_ID', {
                page_path: path
            });
        }
    }

    /**
     * Manipular mudança de hash
     */
    handleHashChange(event) {
        const path = window.location.hash.slice(1) || this.config.defaultRoute;
        this.navigate(path, { silent: true });
    }

    /**
     * Manipular popstate
     */
    handlePopState(event) {
        const path = window.location.hash.slice(1) || this.config.defaultRoute;
        this.navigate(path, { silent: true });
    }

    /**
     * Manipular clique em link
     */
    handleLinkClick(event) {
        const link = event.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href || !href.startsWith('#')) return;

        event.preventDefault();

        const path = href.slice(1);
        this.navigate(path);
    }

    /**
     * Manipular erro de navegação
     */
    handleNavigationError(error, path) {
        console.error(`Erro ao navegar para ${path}:`, error);

        // Mostrar notificação de erro
        if (window.state) {
            window.state.addNotification({
                type: 'error',
                title: 'Erro de Navegação',
                message: 'Não foi possível carregar a página solicitada.',
                duration: 5000
            });
        }

        // Navegar para página de erro
        this.navigate('/404', { replace: true });
    }

    /**
     * Verificar se usuário está autenticado
     */
    isAuthenticated() {
        if (window.state) {
            return window.state.get('auth.isAuthenticated');
        }
        return false;
    }

    /**
     * Verificar se usuário tem role
     */
    hasRole(roles) {
        if (!window.state) return false;

        const userRoles = window.state.get('auth.user.roles') || [];
        return roles.some(role => userRoles.includes(role));
    }

    /**
     * Obter usuário atual
     */
    getCurrentUser() {
        if (window.state) {
            return window.state.get('auth.user');
        }
        return null;
    }

    /**
     * Obter rota atual
     */
    getCurrentRoute() {
        return this.currentRoute;
    }

    /**
     * Obter histórico de navegação
     */
    getHistory() {
        return [...this.history];
    }

    /**
     * Navegar para trás
     */
    goBack() {
        if (this.history.length > 1) {
            this.history.pop(); // Remover rota atual
            const previousRoute = this.history[this.history.length - 1];
            if (previousRoute) {
                this.navigate(previousRoute.path);
            }
        }
    }

    /**
     * Navegar para frente
     */
    goForward() {
        // Implementar lógica de navegação para frente
        window.history.forward();
    }

    /**
     * Obter todas as rotas
     */
    getRoutes() {
        return Array.from(this.routes.values()).sort((a, b) => a.order - b.order);
    }

    /**
     * Obter rotas por role
     */
    getRoutesByRole(role) {
        return this.getRoutes().filter(route =>
            !route.auth || route.roles.includes(role)
        );
    }

    /**
     * Gerar menu de navegação
     */
    generateNavigationMenu(role = null) {
        const routes = role ? this.getRoutesByRole(role) : this.getRoutes();

        return routes
            .filter(route => route.auth && route.order > 0)
            .map(route => ({
                path: route.path,
                title: route.title,
                icon: route.icon,
                order: route.order
            }))
            .sort((a, b) => a.order - b.order);
    }
}

// Criar instância global
const router = new Router();

// Exportar para uso global
window.Router = router;
window.router = router;

// Middleware padrão
router.use(async (context) => {
    // Middleware de logging
    console.log(`🧭 Navegando para: ${context.path}`);

    // Middleware de analytics
    if (window.gtag) {
        window.gtag('event', 'page_view', {
            page_title: context.path,
            page_location: window.location.href
        });
    }

    return { allowed: true };
});

// Middleware de autenticação
router.use(async (context) => {
    const route = router.findRoute(context.path);

    if (route && route.auth && !context.isAuthenticated) {
        return {
            allowed: false,
            reason: 'authentication_required',
            redirect: '/login'
        };
    }

    return { allowed: true };
});

// Middleware de permissões
router.use(async (context) => {
    const route = router.findRoute(context.path);

    if (route && route.roles.length > 0 && context.user) {
        const userRoles = context.user.roles || [];
        const hasPermission = route.roles.some(role => userRoles.includes(role));

        if (!hasPermission) {
            return {
                allowed: false,
                reason: 'insufficient_permissions',
                redirect: '/dashboard'
            };
        }
    }

    return { allowed: true };
}); 