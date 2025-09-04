// ===== SISTEMA DE HEADERS PROFISSIONAIS =====
console.log('🎨 INICIALIZANDO SISTEMA DE HEADERS PROFISSIONAIS...');

class ProfessionalHeaderSystem {
    constructor() {
        this.currentPage = null;
        this.isInitialized = false;
        this.headerConfigs = this.initializeHeaderConfigs();
        this.init();
    }

    init() {
        console.log('🎨 Inicializando sistema de headers...');

        // Aguardar DOM estar pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupSystem());
        } else {
            this.setupSystem();
        }
    }

    setupSystem() {
        try {
            // 1. Criar estrutura do header se não existir
            this.createHeaderStructure();

            // 2. Configurar event listeners
            this.setupEventListeners();

            // 3. Atualizar header inicial
            this.updateHeaderForCurrentPage();

            // 4. Integrar com SistemaVendas
            this.integrateWithSistemaVendas();

            this.isInitialized = true;
            console.log('✅ Sistema de headers inicializado com sucesso!');

        } catch (error) {
            console.error('❌ Erro ao inicializar sistema de headers:', error);
        }
    }

    initializeHeaderConfigs() {
        return {
            dashboard: {
                title: 'Dashboard',
                subtitle: 'Visão geral do sistema de vendas',
                breadcrumb: ['Dashboard'],
                actions: [
                    {
                        type: 'refresh',
                        label: 'Atualizar',
                        icon: 'fas fa-sync-alt',
                        variant: 'primary',
                        action: () => this.refreshDashboard()
                    },
                    {
                        type: 'notifications',
                        label: 'Notificações',
                        icon: 'fas fa-bell',
                        variant: 'secondary',
                        badge: '3',
                        action: () => this.showNotifications()
                    }
                ]
            },
            clientes: {
                title: 'Gestão de Clientes',
                subtitle: 'Cadastro e gerenciamento de clientes',
                breadcrumb: ['Clientes'],
                actions: [
                    {
                        type: 'add',
                        label: 'Novo Cliente',
                        icon: 'fas fa-plus',
                        variant: 'success',
                        action: () => this.addNewCliente()
                    },
                    {
                        type: 'export',
                        label: 'Exportar',
                        icon: 'fas fa-download',
                        variant: 'secondary',
                        action: () => this.exportClientes()
                    },
                    {
                        type: 'search',
                        label: 'Buscar',
                        icon: 'fas fa-search',
                        variant: 'info',
                        action: () => this.searchClientes()
                    }
                ]
            },
            produtos: {
                title: 'Catálogo de Produtos',
                subtitle: 'Gerenciamento de produtos e estoque',
                breadcrumb: ['Produtos'],
                actions: [
                    {
                        type: 'add',
                        label: 'Novo Produto',
                        icon: 'fas fa-plus',
                        variant: 'success',
                        action: () => this.addNewProduto()
                    },
                    {
                        type: 'stock',
                        label: 'Estoque Baixo',
                        icon: 'fas fa-exclamation-triangle',
                        variant: 'warning',
                        badge: '5',
                        action: () => this.showLowStock()
                    },
                    {
                        type: 'import',
                        label: 'Importar',
                        icon: 'fas fa-upload',
                        variant: 'secondary',
                        action: () => this.importProdutos()
                    }
                ]
            },
            vendas: {
                title: 'Gestão de Vendas',
                subtitle: 'Controle de vendas e pedidos',
                breadcrumb: ['Vendas'],
                actions: [
                    {
                        type: 'add',
                        label: 'Nova Venda',
                        icon: 'fas fa-plus',
                        variant: 'success',
                        action: () => this.addNewVenda()
                    },
                    {
                        type: 'pending',
                        label: 'Pendentes',
                        icon: 'fas fa-clock',
                        variant: 'warning',
                        badge: '12',
                        action: () => this.showPendingVendas()
                    },
                    {
                        type: 'reports',
                        label: 'Relatórios',
                        icon: 'fas fa-chart-bar',
                        variant: 'info',
                        action: () => this.showVendasReports()
                    }
                ]
            },
            orcamentos: {
                title: 'Orçamentos',
                subtitle: 'Gestão de orçamentos e propostas',
                breadcrumb: ['Orçamentos'],
                actions: [
                    {
                        type: 'add',
                        label: 'Novo Orçamento',
                        icon: 'fas fa-plus',
                        variant: 'success',
                        action: () => this.addNewOrcamento()
                    },
                    {
                        type: 'active',
                        label: 'Ativos',
                        icon: 'fas fa-file-invoice',
                        variant: 'primary',
                        badge: '8',
                        action: () => this.showActiveOrcamentos()
                    },
                    {
                        type: 'expired',
                        label: 'Expirados',
                        icon: 'fas fa-calendar-times',
                        variant: 'danger',
                        action: () => this.showExpiredOrcamentos()
                    }
                ]
            },
            relatorios: {
                title: 'Relatórios',
                subtitle: 'Análises e relatórios do sistema',
                breadcrumb: ['Relatórios'],
                actions: [
                    {
                        type: 'generate',
                        label: 'Gerar Relatório',
                        icon: 'fas fa-file-alt',
                        variant: 'primary',
                        action: () => this.generateReport()
                    },
                    {
                        type: 'export',
                        label: 'Exportar PDF',
                        icon: 'fas fa-file-pdf',
                        variant: 'danger',
                        action: () => this.exportPDF()
                    },
                    {
                        type: 'schedule',
                        label: 'Agendar',
                        icon: 'fas fa-calendar-plus',
                        variant: 'info',
                        action: () => this.scheduleReport()
                    }
                ]
            }
        };
    }

    createHeaderStructure() {
        console.log('🎨 Criando estrutura do header...');

        // Verificar se já existe um header
        let header = document.querySelector('.page-header');

        if (!header) {
            // Criar header se não existir
            header = document.createElement('header');
            header.className = 'page-header';
            header.innerHTML = this.getHeaderTemplate();

            // Inserir no início do main-content
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                mainContent.insertBefore(header, mainContent.firstChild);
                console.log('✅ Header criado e inserido');
            }
        } else {
            console.log('✅ Header já existe, atualizando estrutura...');
            header.innerHTML = this.getHeaderTemplate();
        }
    }

    getHeaderTemplate() {
        return `
            <div class="header-content">
                <div class="header-left">
                    <h1 class="page-title">Dashboard</h1>
                    <p class="page-subtitle">Visão geral do sistema</p>
                    <nav class="breadcrumb">
                        <span class="breadcrumb-item breadcrumb-current">Dashboard</span>
                    </nav>
                </div>
                <div class="header-right">
                    <div class="header-actions">
                        <button class="action-btn primary" data-action="refresh">
                            <i class="fas fa-sync-alt"></i>
                            <span>Atualizar</span>
                        </button>
                        <button class="action-btn secondary" data-action="notifications">
                            <i class="fas fa-bell"></i>
                            <span>Notificações</span>
                            <span class="notification-badge">3</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        console.log('🎨 Configurando event listeners...');

        // Event listeners para botões de ação
        document.addEventListener('click', (e) => {
            if (e.target.closest('.action-btn')) {
                const button = e.target.closest('.action-btn');
                const action = button.getAttribute('data-action');

                if (action) {
                    this.handleActionClick(action, button);
                }
            }
        });
    }

    handleActionClick(action, button) {
        console.log(`🎨 Ação clicada: ${action}`);

        // Adicionar estado de loading
        button.classList.add('loading');
        const originalContent = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Carregando...</span>';

        // Executar ação baseada no tipo
        setTimeout(() => {
            switch (action) {
                case 'refresh':
                    this.refreshCurrentPage();
                    break;
                case 'notifications':
                    this.showNotifications();
                    break;
                case 'add':
                    this.handleAddAction();
                    break;
                case 'export':
                    this.handleExportAction();
                    break;
                default:
                    console.log(`Ação não implementada: ${action}`);
            }

            // Restaurar botão
            button.classList.remove('loading');
            button.innerHTML = originalContent;
        }, 1000);
    }

    updateHeaderForCurrentPage() {
        const currentPage = this.getCurrentPage();
        console.log(`🎨 Atualizando header para página: ${currentPage}`);

        if (currentPage && this.headerConfigs[currentPage]) {
            this.updateHeader(this.headerConfigs[currentPage]);
        } else {
            // Fallback para dashboard
            this.updateHeader(this.headerConfigs.dashboard);
        }
    }

    getCurrentPage() {
        // Tentar obter página atual de várias formas
        const hash = window.location.hash.slice(1);
        const currentPage = window.currentPage || hash || 'dashboard';
        return currentPage;
    }

    updateHeader(config) {
        console.log('🎨 Atualizando header com configuração:', config);

        const header = document.querySelector('.page-header');
        if (!header) {
            console.log('❌ Header não encontrado');
            return;
        }

        // Atualizar título
        const title = header.querySelector('.page-title');
        if (title) {
            title.textContent = config.title;
        }

        // Atualizar subtítulo
        const subtitle = header.querySelector('.page-subtitle');
        if (subtitle) {
            subtitle.textContent = config.subtitle;
        }

        // Atualizar breadcrumb
        const breadcrumb = header.querySelector('.breadcrumb');
        if (breadcrumb) {
            breadcrumb.innerHTML = config.breadcrumb.map(item =>
                `<span class="breadcrumb-item breadcrumb-current">${item}</span>`
            ).join('');
        }

        // Atualizar ações
        const actions = header.querySelector('.header-actions');
        if (actions) {
            actions.innerHTML = config.actions.map(action =>
                this.createActionButton(action)
            ).join('');
        }

        // Adicionar classe da página
        header.className = `page-header page-${this.getCurrentPage()}`;

        console.log('✅ Header atualizado com sucesso');
    }

    createActionButton(action) {
        const badge = action.badge ? `<span class="notification-badge">${action.badge}</span>` : '';

        return `
            <button class="action-btn ${action.variant}" data-action="${action.type}">
                <i class="${action.icon}"></i>
                <span>${action.label}</span>
                ${badge}
            </button>
        `;
    }

    integrateWithSistemaVendas() {
        console.log('🎨 Integrando com SistemaVendas...');

        // Aguardar SistemaVendas estar disponível
        const checkSistemaVendas = () => {
            if (window.SistemaVendas) {
                // Sobrescrever método de navegação para atualizar header
                const originalNavigateToPage = window.SistemaVendas.navigateToPage;

                window.SistemaVendas.navigateToPage = async function (page) {
                    // Chamar método original
                    const result = await originalNavigateToPage.call(this, page);

                    // Atualizar header
                    if (window.professionalHeaderSystem) {
                        window.professionalHeaderSystem.updateHeaderForCurrentPage();
                    }

                    return result;
                };

                console.log('✅ Integração com SistemaVendas concluída');
            } else {
                setTimeout(checkSistemaVendas, 100);
            }
        };

        checkSistemaVendas();
    }

    // Métodos de ação
    refreshCurrentPage() {
        console.log('🔄 Atualizando página atual...');
        location.reload();
    }

    showNotifications() {
        console.log('🔔 Mostrando notificações...');
        alert('Sistema de notificações em desenvolvimento');
    }

    handleAddAction() {
        const page = this.getCurrentPage();
        console.log(`➕ Adicionando novo item na página: ${page}`);

        switch (page) {
            case 'clientes':
                this.addNewCliente();
                break;
            case 'produtos':
                this.addNewProduto();
                break;
            case 'vendas':
                this.addNewVenda();
                break;
            case 'orcamentos':
                this.addNewOrcamento();
                break;
            default:
                console.log('Ação de adicionar não implementada para esta página');
        }
    }

    handleExportAction() {
        const page = this.getCurrentPage();
        console.log(`📤 Exportando dados da página: ${page}`);

        switch (page) {
            case 'clientes':
                this.exportClientes();
                break;
            case 'produtos':
                this.exportProdutos();
                break;
            case 'relatorios':
                this.exportPDF();
                break;
            default:
                console.log('Ação de exportar não implementada para esta página');
        }
    }

    // Métodos específicos de cada página
    addNewCliente() {
        console.log('👤 Adicionando novo cliente...');
        // Implementar lógica de adicionar cliente
    }

    addNewProduto() {
        console.log('📦 Adicionando novo produto...');
        // Implementar lógica de adicionar produto
    }

    addNewVenda() {
        console.log('🛒 Adicionando nova venda...');
        // Implementar lógica de adicionar venda
    }

    addNewOrcamento() {
        console.log('📄 Adicionando novo orçamento...');
        // Implementar lógica de adicionar orçamento
    }

    exportClientes() {
        console.log('📤 Exportando clientes...');
        // Implementar lógica de exportar clientes
    }

    exportProdutos() {
        console.log('📤 Exportando produtos...');
        // Implementar lógica de exportar produtos
    }

    exportPDF() {
        console.log('📄 Exportando PDF...');
        // Implementar lógica de exportar PDF
    }

    showLowStock() {
        console.log('⚠️ Mostrando produtos com estoque baixo...');
        // Implementar lógica de mostrar estoque baixo
    }

    showPendingVendas() {
        console.log('⏳ Mostrando vendas pendentes...');
        // Implementar lógica de mostrar vendas pendentes
    }

    showActiveOrcamentos() {
        console.log('📋 Mostrando orçamentos ativos...');
        // Implementar lógica de mostrar orçamentos ativos
    }

    generateReport() {
        console.log('📊 Gerando relatório...');
        // Implementar lógica de gerar relatório
    }

    scheduleReport() {
        console.log('📅 Agendando relatório...');
        // Implementar lógica de agendar relatório
    }
}

// Inicializar sistema quando DOM estiver pronto
let professionalHeaderSystem = null;

function initializeProfessionalHeaders() {
    if (!professionalHeaderSystem) {
        professionalHeaderSystem = new ProfessionalHeaderSystem();
        window.professionalHeaderSystem = professionalHeaderSystem;
    }
}

// Executar inicialização
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeProfessionalHeaders);
} else {
    initializeProfessionalHeaders();
}

// Expor funções globalmente
window.ProfessionalHeaderSystem = ProfessionalHeaderSystem;
window.initializeProfessionalHeaders = initializeProfessionalHeaders;

console.log('✅ Sistema de headers profissionais carregado!'); 