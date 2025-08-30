/**
 * 🧭 ROUTING MANAGER - Módulo de Gerenciamento de Roteamento
 * Responsável por toda a lógica de navegação e roteamento
 */

class RoutingManager {
    constructor() {
        this.currentPage = 'dashboard';
        this.routes = new Map();
        this.pageHistory = [];
        this.maxHistoryLength = 10;
        this.init();
    }

    init() {
        console.log('🧭 Inicializando RoutingManager...');
        this.setupRoutes();
        this.setupEventListeners();
        this.handleInitialRoute();
    }

    setupRoutes() {
        // Definir rotas disponíveis
        this.routes.set('dashboard', {
            title: 'Dashboard',
            path: '/#dashboard',
            requiresAuth: true,
            handler: () => this.loadDashboard()
        });

        this.routes.set('produtos', {
            title: 'Produtos',
            path: '/#produtos',
            requiresAuth: true,
            handler: () => this.loadProdutos()
        });

        this.routes.set('clientes', {
            title: 'Clientes',
            path: '/#clientes',
            requiresAuth: true,
            handler: () => this.loadClientes()
        });

        this.routes.set('vendas', {
            title: 'Vendas',
            path: '/#vendas',
            requiresAuth: true,
            handler: () => this.loadVendas()
        });

        this.routes.set('orcamentos', {
            title: 'Orçamentos',
            path: '/#orcamentos',
            requiresAuth: true,
            handler: () => this.loadOrcamentos()
        });

        this.routes.set('relatorios', {
            title: 'Relatórios',
            path: '/#relatorios',
            requiresAuth: true,
            handler: () => this.loadRelatorios()
        });

        this.routes.set('estoque', {
            title: 'Estoque',
            path: '/#estoque',
            requiresAuth: true,
            handler: () => this.loadEstoque()
        });
    }

    setupEventListeners() {
        // Event listener para mudanças na URL
        window.addEventListener('hashchange', () => {
            this.handleRouteChange();
        });

        // Event listener para navegação da sidebar
        document.addEventListener('click', (e) => {
            if (e.target.closest('.nav-item')) {
                e.preventDefault();
                const navItem = e.target.closest('.nav-item');
                const page = navItem.dataset.page;
                if (page) {
                    this.navigateTo(page);
                }
            }
        });

        // Event listener para botões de navegação
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-navigate]')) {
                e.preventDefault();
                const page = e.target.dataset.navigate;
                this.navigateTo(page);
            }
        });
    }

    handleInitialRoute() {
        // Verificar se há hash na URL
        if (window.location.hash) {
            this.handleRouteChange();
        } else {
            // Rota padrão
            this.navigateTo('dashboard');
        }
    }

    handleRouteChange() {
        const hash = window.location.hash.substring(1);
        const page = hash || 'dashboard';
        
        if (this.routes.has(page)) {
            this.navigateTo(page);
        } else {
            console.warn(`Rota não encontrada: ${page}`);
            this.navigateTo('dashboard');
        }
    }

    async navigateTo(page) {
        try {
            const route = this.routes.get(page);
            if (!route) {
                console.error(`Rota não encontrada: ${page}`);
                return false;
            }

            // Verificar autenticação se necessário
            if (route.requiresAuth && !window.authManager?.getAuthStatus()) {
                console.log('Usuário não autenticado para rota protegida:', page);
                
                // NÃO redirecionar automaticamente - deixar o sistema principal decidir
                console.log('🔐 Mantendo na página atual, não redirecionando automaticamente');
                return false;
            }

            // Atualizar estado
            this.currentPage = page;
            this.addToHistory(page);
            
            // Atualizar URL
            window.location.hash = page;
            
            // Atualizar interface
            this.updateActiveNavigation(page);
            this.updatePageTitle(route.title);
            
            // Carregar conteúdo da página
            if (route.handler) {
                await route.handler();
            }
            
            console.log(`✅ Navegação para: ${page}`);
            return true;
            
        } catch (error) {
            console.error(`❌ Erro na navegação para ${page}:`, error);
            return false;
        }
    }

    updateActiveNavigation(page) {
        // Remover classe active de todos os itens
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Adicionar classe active ao item atual
        const activeItem = document.querySelector(`[data-page="${page}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
    }

    updatePageTitle(title) {
        // Atualizar título da página
        document.title = `Sistema de Vendas - ${title}`;
        
        // Atualizar título no header se existir
        const pageTitle = document.getElementById('page-title');
        if (pageTitle) {
            pageTitle.textContent = title;
        }
    }

    addToHistory(page) {
        this.pageHistory.push(page);
        
        // Manter apenas os últimos X itens
        if (this.pageHistory.length > this.maxHistoryLength) {
            this.pageHistory.shift();
        }
    }

    goBack() {
        if (this.pageHistory.length > 1) {
            this.pageHistory.pop(); // Remover página atual
            const previousPage = this.pageHistory[this.pageHistory.length - 1];
            this.navigateTo(previousPage);
        }
    }

    // Handlers de páginas
    async loadDashboard() {
        try {
            await this.loadPageContent('dashboard');
            this.initializeDashboard();
        } catch (error) {
            console.error('Erro ao carregar dashboard:', error);
        }
    }

    async loadProdutos() {
        try {
            await this.loadPageContent('produtos');
            this.initializeProdutos();
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
        }
    }

    async loadClientes() {
        try {
            await this.loadPageContent('clientes');
            this.initializeClientes();
        } catch (error) {
            console.error('Erro ao carregar clientes:', error);
        }
    }

    async loadVendas() {
        try {
            await this.loadPageContent('vendas');
            this.initializeVendas();
        } catch (error) {
            console.error('Erro ao carregar vendas:', error);
        }
    }

    async loadOrcamentos() {
        try {
            await this.loadPageContent('orcamentos');
            this.initializeOrcamentos();
        } catch (error) {
            console.error('Erro ao carregar orçamentos:', error);
        }
    }

    async loadRelatorios() {
        try {
            await this.loadPageContent('relatorios');
            this.initializeRelatorios();
        } catch (error) {
            console.error('Erro ao carregar relatórios:', error);
        }
    }

    async loadEstoque() {
        try {
            await this.loadPageContent('estoque');
            this.initializeEstoque();
        } catch (error) {
            console.error('Erro ao carregar estoque:', error);
        }
    }

    async loadPageContent(page) {
        // Aqui você pode implementar carregamento dinâmico de conteúdo
        // Por enquanto, vamos apenas simular
        return new Promise(resolve => {
            setTimeout(resolve, 100);
        });
    }

    // Inicializadores de páginas (serão implementados nos módulos específicos)
    initializeDashboard() {
        // Será implementado no DashboardManager
        console.log('Dashboard inicializado');
    }

    initializeProdutos() {
        // Será implementado no ProdutosManager
        console.log('Produtos inicializado');
    }

    initializeClientes() {
        // Será implementado no ClientesManager
        console.log('Clientes inicializado');
    }

    initializeVendas() {
        // Será implementado no VendasManager
        console.log('Vendas inicializado');
    }

    initializeOrcamentos() {
        // Será implementado no OrcamentosManager
        console.log('Orçamentos inicializado');
    }

    initializeRelatorios() {
        // Será implementado no RelatoriosManager
        console.log('Relatórios inicializado');
    }

    initializeEstoque() {
        // Será implementado no EstoqueManager
        console.log('Estoque inicializado');
    }

    // Getters para uso externo
    getCurrentPage() {
        return this.currentPage;
    }

    getCurrentRoute() {
        return this.routes.get(this.currentPage);
    }

    getPageHistory() {
        return [...this.pageHistory];
    }

    // Verificar se uma rota existe
    hasRoute(page) {
        return this.routes.has(page);
    }

    // Obter todas as rotas
    getAllRoutes() {
        return Array.from(this.routes.keys());
    }
}

// Exportar para uso global
window.RoutingManager = RoutingManager; 