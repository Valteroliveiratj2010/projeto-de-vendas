/**
 * 🚀 SISTEMA DE VENDAS - VERSÃO MODULAR
 * Arquivo principal que coordena todos os módulos
 */

class SistemaVendasModular {
    constructor() {
        this.modules = new Map();
        this.isInitialized = false;
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Inicializando Sistema de Vendas Modular...');
            
            // Verificar se há token na URL (para rotas protegidas)
            this.checkUrlToken();
            
            // Aguardar carregamento dos módulos
            await this.waitForModules();
            
            // Inicializar módulos na ordem correta
            await this.initializeModules();
            
            // Configurar comunicação entre módulos
            this.setupModuleCommunication();
            
            // Configurar sistema de eventos
            this.setupEventSystem();
            
            // Verificar autenticação e configurar rota inicial
            this.setupInitialRoute();
            
            // Ocultar tela de carregamento
            this.hideLoadingScreen();
            
            this.isInitialized = true;
            console.log('✅ Sistema de Vendas Modular inicializado com sucesso!');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar Sistema de Vendas Modular:', error);
            this.showErrorScreen(error);
        }
    }

    async waitForModules() {
        const requiredModules = ['AuthManager', 'RoutingManager', 'UIManager', 'DataManager'];
        
        return new Promise((resolve) => {
            const checkModules = () => {
                const allLoaded = requiredModules.every(module => window[module]);
                
                if (allLoaded) {
                    resolve();
                } else {
                    setTimeout(checkModules, 100);
                }
            };
            
            checkModules();
        });
    }

    async initializeModules() {
        // 1. AuthManager primeiro (autenticação)
        const authManager = new window.AuthManager();
        this.modules.set('auth', authManager);
        
        // 2. UIManager (interface)
        const uiManager = new window.UIManager();
        this.modules.set('ui', uiManager);
        
        // 3. DataManager (dados)
        const dataManager = new window.DataManager();
        this.modules.set('data', dataManager);
        
        // 4. RoutingManager por último (depende dos outros)
        const routingManager = new window.RoutingManager();
        this.modules.set('routing', routingManager);
        
        // Disponibilizar módulos globalmente para compatibilidade
        window.authManager = authManager;
        window.uiManager = uiManager;
        window.dataManager = dataManager;
        window.routingManager = routingManager;
        
        // Aguardar inicialização completa
        await this.waitForModuleInitialization();
    }

    async waitForModuleInitialization() {
        return new Promise((resolve) => {
            const checkInitialization = () => {
                const allInitialized = Array.from(this.modules.values()).every(module => 
                    module.isInitialized !== false
                );
                
                if (allInitialized) {
                    resolve();
                } else {
                    setTimeout(checkInitialization, 100);
                }
            };
            
            checkInitialization();
        });
    }

    setupModuleCommunication() {
        // Sistema de eventos entre módulos
        this.eventBus = {
            listeners: new Map(),
            
            on(event, callback) {
                if (!this.listeners.has(event)) {
                    this.listeners.set(event, []);
                }
                this.listeners.get(event).push(callback);
            },
            
            emit(event, data) {
                const callbacks = this.listeners.get(event);
                if (callbacks) {
                    callbacks.forEach(callback => {
                        try {
                            callback(data);
                        } catch (error) {
                            console.error(`Erro no callback do evento ${event}:`, error);
                        }
                    });
                }
            },
            
            off(event, callback) {
                const callbacks = this.listeners.get(event);
                if (callbacks) {
                    const index = callbacks.indexOf(callback);
                    if (index > -1) {
                        callbacks.splice(index, 1);
                    }
                }
            }
        };

        // Disponibilizar eventBus globalmente
        window.eventBus = this.eventBus;
    }

    setupEventSystem() {
        // Eventos do sistema
        this.eventBus.on('auth:login', (userData) => {
            console.log('👤 Usuário logado:', userData);
            this.handleUserLogin(userData);
        });

        this.eventBus.on('auth:logout', () => {
            console.log('👋 Usuário deslogado');
            this.handleUserLogout();
        });

        this.eventBus.on('routing:pageChange', (pageData) => {
            console.log('🧭 Mudança de página:', pageData);
            this.handlePageChange(pageData);
        });

        this.eventBus.on('ui:sidebarToggle', (state) => {
            console.log('🎨 Sidebar alterada:', state);
            this.handleSidebarToggle(state);
        });

        this.eventBus.on('data:sync', (syncData) => {
            console.log('📊 Sincronização:', syncData);
            this.handleDataSync(syncData);
        });

        // Eventos de erro
        this.eventBus.on('error', (error) => {
            console.error('❌ Erro no sistema:', error);
            this.handleSystemError(error);
        });
    }

    // Handlers de eventos
    handleUserLogin(userData) {
        // Atualizar interface para usuário logado
        this.modules.get('ui').updateUserInterface('logged-in', userData);
        
        // Carregar dados do usuário
        this.modules.get('data').loadUserData(userData.id);
        
        // Navegar para dashboard
        this.modules.get('routing').navigateTo('dashboard');
        
        // Se estamos na página de login, redirecionar para página principal
        if (window.location.pathname === '/login.html') {
            window.location.href = '/#dashboard';
        }
    }

    handleUserLogout() {
        // Limpar dados do usuário
        this.modules.get('data').clearUserData();
        
        // Atualizar interface para usuário não logado
        this.modules.get('ui').updateUserInterface('logged-out');
        
        // Navegar para login
        this.modules.get('routing').navigateTo('login');
    }

    handlePageChange(pageData) {
        // Atualizar título da página
        document.title = `Sistema de Vendas - ${pageData.title}`;
        
        // Atualizar breadcrumb se existir
        this.updateBreadcrumb(pageData);
        
        // Carregar dados específicos da página
        this.loadPageData(pageData.page);
    }

    handleSidebarToggle(state) {
        // Atualizar estado da sidebar
        this.modules.get('ui').updateSidebarState(state);
        
        // Salvar preferência do usuário
        localStorage.setItem('sidebarState', JSON.stringify(state));
    }

    handleDataSync(syncData) {
        // Mostrar notificação de sincronização
        this.modules.get('ui').showNotification(
            `Sincronizados ${syncData.count} itens`,
            syncData.success ? 'success' : 'warning'
        );
        
        // Atualizar indicador offline
        this.modules.get('ui').updateOfflineIndicator(syncData.success);
    }

    handleSystemError(error) {
        // Log do erro
        console.error('Erro do sistema:', error);
        
        // Mostrar notificação para o usuário
        this.modules.get('ui').showNotification(
            'Ocorreu um erro no sistema. Tente novamente.',
            'error'
        );
        
        // Reportar erro se configurado
        this.reportError(error);
    }

    // Verificar token na URL
    checkUrlToken() {
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = urlParams.get('token');
        
        if (urlToken && urlToken.trim() !== '') {
            console.log('🔑 Token encontrado na URL, configurando autenticação...');
            
            // Salvar token da URL no localStorage se não existir
            const existingToken = localStorage.getItem('authToken');
            if (!existingToken) {
                localStorage.setItem('authToken', urlToken);
                console.log('✅ Token da URL salvo no localStorage');
                
                // Limpar token da URL para segurança
                const newUrl = window.location.pathname;
                window.history.replaceState({}, document.title, newUrl);
            }
        }
    }

    // Configurar rota inicial baseada na autenticação
    setupInitialRoute() {
        const authManager = this.modules.get('auth');
        const routingManager = this.modules.get('routing');
        
        if (authManager && routingManager) {
            // Verificar se o usuário está autenticado
            if (authManager.getAuthStatus()) {
                console.log('✅ Usuário autenticado, configurando rota inicial...');
                
                // Se estamos na rota /system, navegar para dashboard
                if (window.location.pathname === '/system') {
                    routingManager.navigateTo('dashboard');
                } else {
                    // Verificar se há hash na URL
                    const hash = window.location.hash.substring(1);
                    if (hash && routingManager.hasRoute(hash)) {
                        routingManager.navigateTo(hash);
                    } else {
                        routingManager.navigateTo('dashboard');
                    }
                }
            } else {
                // Usuário não autenticado - redirecionar para login
                console.log('🔐 Usuário não autenticado, redirecionando para login...');
                
                // Se estamos na página principal, redirecionar para login
                if (window.location.pathname === '/') {
                    console.log('🔐 Redirecionando da página principal para login...');
                    window.location.href = '/login?message=authentication_required';
                }
            }
        }
    }

    // Métodos auxiliares
    updateBreadcrumb(pageData) {
        const breadcrumb = document.getElementById('breadcrumb');
        if (breadcrumb) {
            breadcrumb.innerHTML = `
                <span class="breadcrumb-item">
                    <a href="#dashboard">Dashboard</a>
                </span>
                <span class="breadcrumb-separator">/</span>
                <span class="breadcrumb-item active">${pageData.title}</span>
            `;
        }
    }

    async loadPageData(page) {
        try {
            // Carregar dados específicos da página
            const dataManager = this.modules.get('data');
            
            switch (page) {
                case 'dashboard':
                    await this.loadDashboardData();
                    break;
                case 'produtos':
                    await this.loadProdutosData();
                    break;
                case 'clientes':
                    await this.loadClientesData();
                    break;
                case 'vendas':
                    await this.loadVendasData();
                    break;
                case 'orcamentos':
                    await this.loadOrcamentosData();
                    break;
                case 'relatorios':
                    await this.loadRelatoriosData();
                    break;
                case 'estoque':
                    await this.loadEstoqueData();
                    break;
                default:
                    console.warn(`Página não reconhecida: ${page}`);
            }
        } catch (error) {
            console.error(`Erro ao carregar dados da página ${page}:`, error);
            this.eventBus.emit('error', error);
        }
    }

    // Carregadores de dados específicos
    async loadDashboardData() {
        const dataManager = this.modules.get('data');
        const cacheKey = 'dashboard-data';
        
        // Tentar carregar do cache primeiro
        let data = dataManager.getCache(cacheKey);
        
        if (!data) {
            try {
                const response = await fetch('/api/dashboard/stats', {
                    headers: {
                        'Authorization': `Bearer ${this.modules.get('auth').getToken()}`
                    }
                });
                
                if (response.ok) {
                    data = await response.json();
                    dataManager.setCache(cacheKey, data, 60000); // 1 minuto
                }
            } catch (error) {
                console.error('Erro ao carregar dados do dashboard:', error);
                data = this.getDefaultDashboardData();
            }
        }
        
        this.renderDashboard(data);
    }

    async loadProdutosData() {
        // Implementar carregamento de produtos
        console.log('Carregando dados de produtos...');
    }

    async loadClientesData() {
        // Implementar carregamento de clientes
        console.log('Carregando dados de clientes...');
    }

    async loadVendasData() {
        // Implementar carregamento de vendas
        console.log('Carregando dados de vendas...');
    }

    async loadOrcamentosData() {
        // Implementar carregamento de orçamentos
        console.log('Carregando dados de orçamentos...');
    }

    async loadRelatoriosData() {
        // Implementar carregamento de relatórios
        console.log('Carregando dados de relatórios...');
    }

    async loadEstoqueData() {
        // Implementar carregamento de estoque
        console.log('Carregando dados de estoque...');
    }

    getDefaultDashboardData() {
        return {
            vendas: { total: 0, mes: 0, semana: 0 },
            produtos: { total: 0, baixoEstoque: 0 },
            clientes: { total: 0, novos: 0 },
            receita: { total: 0, mes: 0, semana: 0 }
        };
    }

    renderDashboard(data) {
        // Implementar renderização do dashboard
        console.log('Renderizando dashboard com dados:', data);
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 300);
        }
    }

    showErrorScreen(error) {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.innerHTML = `
                <div class="error-content">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h2>Erro ao Inicializar</h2>
                    <p>${error.message}</p>
                    <button onclick="location.reload()">Tentar Novamente</button>
                </div>
            `;
        }
    }

    reportError(error) {
        // Implementar sistema de report de erros
        console.log('Reportando erro:', error);
    }

    // Getters para uso externo
    getModule(name) {
        return this.modules.get(name);
    }

    getAllModules() {
        return Array.from(this.modules.keys());
    }

    isModuleLoaded(name) {
        return this.modules.has(name);
    }

    // Método para reinicializar módulo específico
    async reloadModule(name) {
        if (this.modules.has(name)) {
            const module = this.modules.get(name);
            if (module.destroy) {
                module.destroy();
            }
            
            // Recriar módulo
            switch (name) {
                case 'auth':
                    this.modules.set('auth', new window.AuthManager());
                    break;
                case 'ui':
                    this.modules.set('ui', new window.UIManager());
                    break;
                case 'data':
                    this.modules.set('data', new window.DataManager());
                    break;
                case 'routing':
                    this.modules.set('routing', new window.RoutingManager());
                    break;
            }
            
            console.log(`✅ Módulo ${name} recarregado`);
        }
    }

    // Método para destruir sistema
    destroy() {
        // Parar todos os módulos
        this.modules.forEach(module => {
            if (module.destroy) {
                module.destroy();
            }
        });
        
        // Limpar módulos
        this.modules.clear();
        
        // Parar eventBus
        if (this.eventBus) {
            this.eventBus.listeners.clear();
        }
        
        console.log('🗑️ Sistema destruído');
    }
}

// Inicializar sistema quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.sistemaVendas = new SistemaVendasModular();
});

// Exportar para uso global
window.SistemaVendasModular = SistemaVendasModular; 