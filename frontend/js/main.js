// Sistema de navegação SPA (Single Page Application)
class NavigationManager {
    constructor() {
        this.currentPage = 'dashboard';
        this.pageTitleElement = document.getElementById('page-title');
        this.pageSubtitleElement = document.getElementById('page-subtitle');
        this.contentElement = document.getElementById('content');
        this.currentDateElement = document.getElementById('current-date');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateCurrentDate();
        this.loadPage(this.currentPage);
        
        // Atualizar data a cada minuto
        setInterval(() => this.updateCurrentDate(), 60000);
    }

    setupEventListeners() {
        // Event listeners para navegação
        document.addEventListener('click', (e) => {
            if (e.target.closest('.nav-link')) {
                e.preventDefault();
                const page = e.target.closest('.nav-link').dataset.page;
                if (page && page !== this.currentPage) {
                    this.navigateToPage(page);
                }
            }
        });
    }

    navigateToPage(page) {
        this.currentPage = page;
        this.updateActiveLink(page);
        this.updatePageTitle(page);
        this.updatePageSubtitle(page);
        this.loadPage(page);
    }

    updateActiveLink(page) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === page) {
                link.classList.add('active');
            }
        });
    }

    updatePageTitle(page) {
        const titles = {
            'dashboard': '<i class="fas fa-tachometer-alt mr-2 text-blue-600"></i>Dashboard',
            'clientes': '<i class="fas fa-users mr-2 text-blue-600"></i>Clientes',
            'produtos': '<i class="fas fa-box mr-2 text-green-600"></i>Produtos',
            'vendas': '<i class="fas fa-shopping-cart mr-2 text-yellow-600"></i>Vendas',
            'orcamentos': '<i class="fas fa-file-invoice-dollar mr-2 text-indigo-600"></i>Orçamentos',
            'graficos': '<i class="fas fa-chart-bar mr-2 text-purple-600"></i>Gráficos'
        };
        
        this.pageTitleElement.innerHTML = titles[page] || 'Página';
    }

    updatePageSubtitle(page) {
        const subtitles = {
            'dashboard': 'Visão geral do sistema',
            'clientes': 'Gerenciar clientes',
            'produtos': 'Gerenciar produtos',
            'vendas': 'Gerenciar vendas',
            'orcamentos': 'Gerenciar orçamentos',
            'graficos': 'Relatórios e análises'
        };
        
        this.pageSubtitleElement.textContent = subtitles[page] || 'Página do sistema';
    }

    async loadPage(page) {
        try {
            // Mostrar loading
            this.showLoading();

            // Simular delay para demonstração
            await this.delay(300);

            // Carregar conteúdo da página
            const content = await this.getPageContent(page);
            
            // Atualizar conteúdo
            this.contentElement.innerHTML = content;
            
            // Inicializar funcionalidades específicas da página
            this.initializePageFeatures(page);
            
        } catch (error) {
            console.error('Erro ao carregar página:', error);
            this.showError('Erro ao carregar página');
        }
    }

    async getPageContent(page) {
        switch (page) {
            case 'dashboard':
                return this.getDashboardContent();
            case 'clientes':
                return this.getClientesContent();
            case 'produtos':
                return this.getProdutosContent();
            case 'vendas':
                return this.getVendasContent();
            case 'orcamentos':
                return this.getOrcamentosContent();
            case 'graficos':
                return this.getGraficosContent();
            default:
                return '<div class="text-center py-8 text-gray-500">Página não encontrada</div>';
        }
    }

    initializePageFeatures(page) {
        switch (page) {
            case 'dashboard':
                if (typeof initDashboardPage === 'function') {
                    initDashboardPage();
                }
                break;
            case 'clientes':
                if (typeof initClientesPage === 'function') {
                    initClientesPage();
                }
                break;
            case 'produtos':
                if (typeof initProdutosPage === 'function') {
                    initProdutosPage();
                }
                break;
            case 'vendas':
                if (typeof initVendasPage === 'function') {
                    initVendasPage();
                }
                break;
            case 'orcamentos':
                if (typeof initOrcamentosPage === 'function') {
                    initOrcamentosPage();
                }
                break;
            case 'graficos':
                if (typeof initGraficosPage === 'function') {
                    initGraficosPage();
                }
                break;
        }
    }

    getDashboardContent() {
        return `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div class="bg-blue-500 text-white p-6 rounded-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-blue-100">Total de Clientes</p>
                            <p class="text-3xl font-bold">0</p>
                        </div>
                        <i class="fas fa-users w-8 h-8 text-blue-200"></i>
                    </div>
                </div>
                
                <div class="bg-green-500 text-white p-6 rounded-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-green-100">Total de Produtos</p>
                            <p class="text-3xl font-bold">0</p>
                        </div>
                        <i class="fas fa-box w-8 h-8 text-green-200"></i>
                    </div>
                </div>
                
                <div class="bg-yellow-500 text-white p-6 rounded-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-yellow-100">Total de Vendas</p>
                            <p class="text-3xl font-bold">0</p>
                        </div>
                        <i class="fas fa-shopping-cart w-8 h-8 text-yellow-200"></i>
                    </div>
                </div>
                
                <div class="bg-purple-500 text-white p-6 rounded-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-purple-100">Receita Total</p>
                            <p class="text-3xl font-bold">R$ 0,00</p>
                        </div>
                        <i class="fas fa-dollar-sign w-8 h-8 text-purple-200"></i>
                    </div>
                </div>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="bg-white p-6 rounded-lg shadow">
                    <h3 class="text-lg font-semibold mb-4">Vendas Recentes</h3>
                    <div class="space-y-3">
                        <p class="text-gray-500 text-center py-4">Nenhuma venda registrada</p>
                    </div>
                </div>
                
                <div class="bg-white p-6 rounded-lg shadow">
                    <h3 class="text-lg font-semibold mb-4">Produtos em Estoque Baixo</h3>
                    <div class="space-y-3">
                        <p class="text-gray-500 text-center py-4">Nenhum produto com estoque baixo</p>
                    </div>
                </div>
            </div>
        `;
    }

    getClientesContent() {
        if (typeof clientesManager !== 'undefined') {
            return clientesManager.renderClientesTable();
        }
        return '<div class="text-center py-8 text-gray-500">Carregando clientes...</div>';
    }

    getProdutosContent() {
        if (typeof produtosManager !== 'undefined') {
            return produtosManager.renderProdutosTable();
        }
        return '<div class="text-center py-8 text-gray-500">Carregando produtos...</div>';
    }

    getVendasContent() {
        if (typeof vendasManager !== 'undefined') {
            return vendasManager.renderVendasTable();
        }
        return '<div class="text-center py-8 text-gray-500">Carregando vendas...</div>';
    }

    getOrcamentosContent() {
        if (typeof orcamentosManager !== 'undefined') {
            return orcamentosManager.renderOrcamentosTable();
        }
        return '<div class="text-center py-8 text-gray-500">Carregando orçamentos...</div>';
    }

    getGraficosContent() {
        if (typeof graficosManager !== 'undefined') {
            return graficosManager.renderGraficosPage();
        }
        return '<div class="text-center py-8 text-gray-500">Carregando gráficos...</div>';
    }

    updateCurrentDate() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        if (this.currentDateElement) {
            this.currentDateElement.textContent = now.toLocaleDateString('pt-BR', options);
        }
    }

    showLoading() {
        this.contentElement.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p class="loading-text">Carregando...</p>
            </div>
        `;
    }

    showError(message) {
        this.contentElement.innerHTML = `
            <div class="text-center py-8 text-red-500">
                <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                <p>${message}</p>
            </div>
        `;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new NavigationManager();
});



