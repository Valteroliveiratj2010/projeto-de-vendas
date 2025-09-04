// ===== FORÇAR APLICAÇÃO DOS HEADERS PROFISSIONAIS =====
console.log('🔧 INICIANDO FORÇA APLICAÇÃO DOS HEADERS...');

class ForceHeaderApplication {
    constructor() {
        this.isApplied = false;
        this.init();
    }

    init() {
        console.log('🔧 Inicializando força aplicação...');

        // Aguardar um pouco para garantir que tudo carregou
        setTimeout(() => {
            this.applyHeaders();
        }, 1000);
    }

    applyHeaders() {
        if (this.isApplied) {
            console.log('🔧 Headers já aplicados, pulando...');
            return;
        }

        console.log('🔧 Aplicando headers profissionais...');

        try {
            // 1. Remover elementos conflitantes
            this.removeConflictingElements();

            // 2. Criar header profissional
            this.createProfessionalHeader();

            // 3. Aplicar estilos forçados
            this.applyForcedStyles();

            // 4. Configurar event listeners
            this.setupEventListeners();

            this.isApplied = true;
            console.log('✅ Headers profissionais aplicados com sucesso!');

        } catch (error) {
            console.error('❌ Erro ao aplicar headers:', error);
        }
    }

    removeConflictingElements() {
        console.log('🔧 Removendo elementos conflitantes...');

        // Remover top-bar se existir
        const topBar = document.querySelector('.top-bar');
        if (topBar) {
            console.log('🔧 Removendo top-bar...');
            topBar.remove();
        }

        // Remover dashboard-header se existir
        const dashboardHeader = document.querySelector('.dashboard-header');
        if (dashboardHeader) {
            console.log('🔧 Removendo dashboard-header...');
            dashboardHeader.remove();
        }

        // Remover page-header antigo se existir
        const oldPageHeader = document.querySelector('.page-header');
        if (oldPageHeader) {
            console.log('🔧 Removendo page-header antigo...');
            oldPageHeader.remove();
        }
    }

    createProfessionalHeader() {
        console.log('🔧 Criando header profissional...');

        const mainContent = document.querySelector('.main-content');
        if (!mainContent) {
            console.error('❌ Main content não encontrado');
            return;
        }

        // Criar header profissional
        const header = document.createElement('header');
        header.className = 'page-header page-dashboard';
        header.innerHTML = this.getHeaderTemplate();

        // Inserir no início do main-content
        mainContent.insertBefore(header, mainContent.firstChild);

        console.log('✅ Header profissional criado');
    }

    getHeaderTemplate() {
        const currentPage = this.getCurrentPage();
        const config = this.getHeaderConfig(currentPage);

        return `
            <div class="header-content">
                <div class="header-left">
                    <h1 class="page-title">${config.title}</h1>
                    <p class="page-subtitle">${config.subtitle}</p>
                    <nav class="breadcrumb">
                        ${config.breadcrumb.map(item =>
            `<span class="breadcrumb-item breadcrumb-current">${item}</span>`
        ).join('')}
                    </nav>
                </div>
                <div class="header-right">
                    <div class="header-actions">
                        ${config.actions.map(action => `
                            <button class="action-btn ${action.variant}" data-action="${action.type}">
                                <i class="${action.icon}"></i>
                                <span>${action.label}</span>
                                ${action.badge ? `<span class="notification-badge">${action.badge}</span>` : ''}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    getCurrentPage() {
        const hash = window.location.hash.slice(1);
        return hash || 'dashboard';
    }

    getHeaderConfig(page) {
        const configs = {
            dashboard: {
                title: 'Dashboard',
                subtitle: 'Visão geral do sistema de vendas',
                breadcrumb: ['Dashboard'],
                actions: [
                    {
                        type: 'refresh',
                        label: 'Atualizar',
                        icon: 'fas fa-sync-alt',
                        variant: 'primary'
                    },
                    {
                        type: 'notifications',
                        label: 'Notificações',
                        icon: 'fas fa-bell',
                        variant: 'secondary',
                        badge: '3'
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
                        variant: 'success'
                    },
                    {
                        type: 'export',
                        label: 'Exportar',
                        icon: 'fas fa-download',
                        variant: 'secondary'
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
                        variant: 'success'
                    },
                    {
                        type: 'stock',
                        label: 'Estoque Baixo',
                        icon: 'fas fa-exclamation-triangle',
                        variant: 'warning',
                        badge: '5'
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
                        variant: 'success'
                    },
                    {
                        type: 'pending',
                        label: 'Pendentes',
                        icon: 'fas fa-clock',
                        variant: 'warning',
                        badge: '12'
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
                        variant: 'success'
                    },
                    {
                        type: 'active',
                        label: 'Ativos',
                        icon: 'fas fa-file-invoice',
                        variant: 'primary',
                        badge: '8'
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
                        variant: 'primary'
                    },
                    {
                        type: 'export',
                        label: 'Exportar PDF',
                        icon: 'fas fa-file-pdf',
                        variant: 'danger'
                    }
                ]
            }
        };

        return configs[page] || configs.dashboard;
    }

    applyForcedStyles() {
        console.log('🔧 Aplicando estilos forçados...');

        // Criar estilos inline para garantir aplicação
        const style = document.createElement('style');
        style.textContent = `
            /* FORÇAR APLICAÇÃO DOS HEADERS PROFISSIONAIS */
            .page-header {
                background: linear-gradient(135deg, #2563EB 0%, #10B981 100%) !important;
                padding: 2rem 3rem !important;
                margin: 0 0 2rem 0 !important;
                border-radius: 0 0 1.5rem 1.5rem !important;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
                position: relative !important;
                overflow: hidden !important;
                z-index: 100 !important;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            }

            .page-header::before {
                content: '' !important;
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
                background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%) !important;
                animation: headerShine 3s ease-in-out infinite !important;
                pointer-events: none !important;
            }

            .page-header:hover {
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
                transform: translateY(-2px) !important;
            }

            .header-content {
                display: flex !important;
                justify-content: space-between !important;
                align-items: flex-start !important;
                position: relative !important;
                z-index: 2 !important;
                gap: 1rem !important;
            }

            .header-left {
                flex: 1 !important;
                min-width: 0 !important;
            }

            .header-right {
                flex-shrink: 0 !important;
                display: flex !important;
                align-items: center !important;
                gap: 1rem !important;
            }

            .page-title {
                font-size: 2.5rem !important;
                font-weight: 700 !important;
                color: #ffffff !important;
                margin: 0 0 0.5rem 0 !important;
                line-height: 1.2 !important;
                letter-spacing: -0.025em !important;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            }

            .page-title::after {
                content: '' !important;
                display: block !important;
                width: 60px !important;
                height: 4px !important;
                background: linear-gradient(90deg, #f093fb, transparent) !important;
                border-radius: 2px !important;
                margin-top: 0.5rem !important;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            }

            .page-header:hover .page-title::after {
                width: 80px !important;
            }

            .page-subtitle {
                font-size: 1.1rem !important;
                font-weight: 400 !important;
                color: rgba(255, 255, 255, 0.9) !important;
                margin: 0 0 1rem 0 !important;
                line-height: 1.4 !important;
                opacity: 0.9 !important;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            }

            .breadcrumb {
                display: flex !important;
                align-items: center !important;
                gap: 0.5rem !important;
                font-size: 0.9rem !important;
                font-weight: 500 !important;
                color: rgba(255, 255, 255, 0.7) !important;
                margin: 0 !important;
                padding: 0 !important;
                list-style: none !important;
            }

            .breadcrumb-item {
                display: flex !important;
                align-items: center !important;
                gap: 0.5rem !important;
            }

            .breadcrumb-item:not(:last-child)::after {
                content: '/' !important;
                color: rgba(255, 255, 255, 0.5) !important;
                margin-left: 0.5rem !important;
            }

            .breadcrumb-current {
                color: #ffffff !important;
                font-weight: 600 !important;
            }

            .header-actions {
                display: flex !important;
                gap: 0.75rem !important;
                align-items: center !important;
                flex-wrap: wrap !important;
            }

            .action-btn {
                padding: 0.75rem 1.5rem !important;
                border: none !important;
                border-radius: 0.75rem !important;
                font-size: 0.95rem !important;
                font-weight: 600 !important;
                cursor: pointer !important;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                display: flex !important;
                align-items: center !important;
                gap: 0.5rem !important;
                text-decoration: none !important;
                position: relative !important;
                overflow: hidden !important;
                backdrop-filter: blur(10px) !important;
                -webkit-backdrop-filter: blur(10px) !important;
            }

            .action-btn::before {
                content: '' !important;
                position: absolute !important;
                top: 0 !important;
                left: -100% !important;
                width: 100% !important;
                height: 100% !important;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent) !important;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            }

            .action-btn:hover::before {
                left: 100% !important;
            }

            .action-btn.primary {
                background: rgba(255, 255, 255, 0.2) !important;
                color: #ffffff !important;
                border: 1px solid rgba(255, 255, 255, 0.3) !important;
            }

            .action-btn.primary:hover {
                background: rgba(255, 255, 255, 0.3) !important;
                border-color: rgba(255, 255, 255, 0.5) !important;
                transform: translateY(-1px) !important;
            }

            .action-btn.secondary {
                background: rgba(255, 255, 255, 0.1) !important;
                color: #ffffff !important;
                border: 1px solid rgba(255, 255, 255, 0.2) !important;
            }

            .action-btn.secondary:hover {
                background: rgba(255, 255, 255, 0.2) !important;
                border-color: rgba(255, 255, 255, 0.4) !important;
                transform: translateY(-1px) !important;
            }

            .action-btn.success {
                background: #10b981 !important;
                color: white !important;
                border: 1px solid #10b981 !important;
            }

            .action-btn.warning {
                background: #f59e0b !important;
                color: white !important;
                border: 1px solid #f59e0b !important;
            }

            .action-btn.danger {
                background: #ef4444 !important;
                color: white !important;
                border: 1px solid #ef4444 !important;
            }

            .action-btn.info {
                background: #3b82f6 !important;
                color: white !important;
                border: 1px solid #3b82f6 !important;
            }

            .action-btn i {
                font-size: 1rem !important;
                transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1) !important;
            }

            .action-btn:hover i {
                transform: scale(1.1) !important;
            }

            .notification-badge {
                background: #ef4444 !important;
                color: white !important;
                font-size: 0.75rem !important;
                font-weight: 600 !important;
                padding: 0.25rem 0.5rem !important;
                border-radius: 1rem !important;
                min-width: 1.5rem !important;
                text-align: center !important;
                position: absolute !important;
                top: -0.5rem !important;
                right: -0.5rem !important;
                animation: pulse 2s infinite !important;
            }

            @keyframes headerShine {
                0%, 100% {
                    transform: translateX(-100%);
                }
                50% {
                    transform: translateX(100%);
                }
            }

            @keyframes pulse {
                0%, 100% {
                    transform: scale(1);
                    opacity: 1;
                }
                50% {
                    transform: scale(1.1);
                    opacity: 0.8;
                }
            }

            /* RESPONSIVIDADE */
            @media (max-width: 768px) {
                .page-header {
                    padding: 1.5rem !important;
                }
                
                .page-title {
                    font-size: 2rem !important;
                }
                
                .page-subtitle {
                    font-size: 1rem !important;
                }
                
                .header-content {
                    flex-direction: column !important;
                    align-items: flex-start !important;
                    gap: 1rem !important;
                }
                
                .header-right {
                    width: 100% !important;
                    justify-content: flex-start !important;
                }
                
                .header-actions {
                    gap: 0.5rem !important;
                }
                
                .action-btn {
                    padding: 0.625rem 1.25rem !important;
                    font-size: 0.9rem !important;
                }
            }

            @media (max-width: 480px) {
                .page-header {
                    padding: 1rem !important;
                }
                
                .page-title {
                    font-size: 1.75rem !important;
                }
                
                .page-subtitle {
                    font-size: 0.95rem !important;
                }
                
                .header-actions {
                    flex-direction: column !important;
                    width: 100% !important;
                }
                
                .action-btn {
                    width: 100% !important;
                    justify-content: center !important;
                }
            }
        `;

        document.head.appendChild(style);
        console.log('✅ Estilos forçados aplicados');
    }

    setupEventListeners() {
        console.log('🔧 Configurando event listeners...');

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

        // Atualizar header quando mudar de página
        window.addEventListener('hashchange', () => {
            setTimeout(() => {
                this.updateHeaderForCurrentPage();
            }, 100);
        });
    }

    handleActionClick(action, button) {
        console.log(`🔧 Ação clicada: ${action}`);

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
        console.log(`🔧 Atualizando header para página: ${currentPage}`);

        const header = document.querySelector('.page-header');
        if (!header) {
            console.log('❌ Header não encontrado, recriando...');
            this.applyHeaders();
            return;
        }

        const config = this.getHeaderConfig(currentPage);

        // Atualizar conteúdo
        const title = header.querySelector('.page-title');
        const subtitle = header.querySelector('.page-subtitle');
        const breadcrumb = header.querySelector('.breadcrumb');
        const actions = header.querySelector('.header-actions');

        if (title) title.textContent = config.title;
        if (subtitle) subtitle.textContent = config.subtitle;
        if (breadcrumb) {
            breadcrumb.innerHTML = config.breadcrumb.map(item =>
                `<span class="breadcrumb-item breadcrumb-current">${item}</span>`
            ).join('');
        }
        if (actions) {
            actions.innerHTML = config.actions.map(action => `
                <button class="action-btn ${action.variant}" data-action="${action.type}">
                    <i class="${action.icon}"></i>
                    <span>${action.label}</span>
                    ${action.badge ? `<span class="notification-badge">${action.badge}</span>` : ''}
                </button>
            `).join('');
        }

        // Atualizar classe da página
        header.className = `page-header page-${currentPage}`;

        console.log('✅ Header atualizado');
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
        alert(`Funcionalidade de adicionar ${page} em desenvolvimento`);
    }

    handleExportAction() {
        const page = this.getCurrentPage();
        console.log(`📤 Exportando dados da página: ${page}`);
        alert(`Funcionalidade de exportar ${page} em desenvolvimento`);
    }
}

// Inicializar força aplicação
const forceHeaderApp = new ForceHeaderApplication();

// Expor métodos globalmente
window.forceHeaderApp = forceHeaderApp;
window.forceApplyHeaders = () => forceHeaderApp.applyHeaders();

console.log('✅ Força aplicação dos headers inicializada!');
console.log('💡 Use window.forceApplyHeaders() para forçar aplicação'); 