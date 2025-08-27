/**
 * SISTEMA DE VENDAS - VERSÃO FUNCIONAL
 * Sistema principal da aplicação
 */

class SistemaVendas {
    constructor() {
        this.currentPage = 'dashboard';
        this.isOnline = navigator.onLine;
        this.isInitialized = false;
        
        // Verificar autenticação imediatamente
        this.checkInitialAuth();
        
        this.init();
    }
    
    async init() {
        try {
            console.log('🚀 Inicializando Sistema de Vendas...');
            
            // Aguardar sistema de autenticação estar pronto
            await this.waitForAuthSystem();
            
            // Verificar se o usuário está autenticado
            if (!this.checkUserAuthentication()) {
                console.log('🚫 Usuário não autenticado, redirecionando para login...');
                window.location.replace('/login');
                return;
            }
            
            // Configurar roteamento
            this.setupRouting();
            
            // Configurar eventos
            this.setupEventListeners();
            
            // Inicializar responsividade
            this.handleResize();
            
            // Forçar responsividade inicial
            this.forceResponsiveness();
            
            // Carregar página inicial
            await this.loadPage(this.currentPage);
            
            // Esconder tela de loading
            this.hideLoadingScreen();
            
            // Marcar como inicializado
            this.isInitialized = true;
            
            // Forçar carregamento dos dados do dashboard após inicialização
            console.log('🎯 Forçando carregamento dos dados do dashboard...');
            setTimeout(() => {
                this.loadDashboardData();
            }, 1000);
            
            console.log('✅ Sistema inicializado com sucesso!');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar sistema:', error);
            this.hideLoadingScreen();
        }
    }
    
    async waitForAuthSystem() {
        return new Promise((resolve) => {
            const checkAuth = () => {
                if (window.checkAuthStatus) {
                    resolve();
                } else {
                    setTimeout(checkAuth, 100);
                }
            };
            checkAuth();
        });
    }
    
    checkUserAuthentication() {
        try {
            const token = localStorage.getItem('authToken');
            const userData = localStorage.getItem('userData');
            
            if (token && userData) {
                console.log('✅ Usuário autenticado');
                return true;
            } else {
                console.log('❌ Usuário não autenticado');
                return false;
            }
        } catch (error) {
            console.error('❌ Erro ao verificar autenticação:', error);
            return false;
        }
    }
    
    checkInitialAuth() {
        // Verificar autenticação imediatamente no construtor
        setTimeout(() => {
            if (!this.checkUserAuthentication()) {
                console.log('🚫 Usuário não autenticado no construtor, redirecionando...');
                window.location.replace('/login');
                return; // Parar execução
            }
        }, 100);
    }
    
    createSidebarOverlay() {
        // Remover overlay existente se houver
        this.removeSidebarOverlay();
        
        const overlay = document.createElement('div');
        overlay.id = 'sidebar-overlay';
        overlay.className = 'sidebar-overlay';
        
        // Garantir que o overlay funcione corretamente
        overlay.style.pointerEvents = 'auto';
        
        document.body.appendChild(overlay);
        
        // Adicionar evento de clique para fechar sidebar
        overlay.addEventListener('click', () => {
            const sidebar = document.getElementById('sidebar');
            if (sidebar && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
                this.removeSidebarOverlay();
            }
        });
        
        console.log('✅ Overlay da sidebar criado');
    }
    
    removeSidebarOverlay() {
        const overlay = document.getElementById('sidebar-overlay');
        if (overlay) {
            overlay.remove();
            console.log('✅ Overlay da sidebar removido');
        }
    }
    
    setupEventListeners() {
        // Toggle da sidebar
        const sidebarToggle = document.getElementById('sidebar-toggle');
        const sidebar = document.getElementById('sidebar');
        
        if (sidebarToggle && sidebar) {
            sidebarToggle.addEventListener('click', () => {
                console.log('🔄 Toggle da sidebar clicado');
                sidebar.classList.toggle('open');
                
                // Gerenciar overlay baseado no estado
                if (sidebar.classList.contains('open')) {
                    this.createSidebarOverlay();
                    console.log('✅ Sidebar aberta');
                } else {
                    this.removeSidebarOverlay();
                    console.log('❌ Sidebar fechada');
                }
            });
        }
        
        // Fechar sidebar ao clicar fora (mobile)
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 1024 && sidebar && sidebar.classList.contains('open')) {
                // Permitir cliques no botão de toggle
                if (e.target === sidebarToggle || sidebarToggle.contains(e.target)) {
                    return;
                }
                
                // Permitir cliques na sidebar
                if (sidebar.contains(e.target)) {
                    return;
                }
                
                // Fechar sidebar para outros cliques
                sidebar.classList.remove('open');
                this.removeSidebarOverlay();
            }
        });

        // Navegação da sidebar
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                console.log(`🔄 Navegando para: ${page}`);
                
                // Fechar sidebar no mobile após navegação
                if (window.innerWidth <= 1024) {
                    const sidebar = document.getElementById('sidebar');
                    if (sidebar && sidebar.classList.contains('open')) {
                        sidebar.classList.remove('open');
                        this.removeSidebarOverlay();
                    }
                }
                
                this.navigateToPage(page);
            });
        });

        // Ações rápidas
        const actionButtons = document.querySelectorAll('.action-btn');
        actionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleQuickAction(action);
            });
        });
        
        // Listener para mudanças de tamanho de tela
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }
    
    handleResize() {
        const sidebar = document.getElementById('sidebar');
        const sidebarToggle = document.getElementById('sidebar-toggle');
        
        if (sidebar && sidebarToggle) {
            const width = window.innerWidth;
            
            console.log(`🔄 Redimensionamento detectado: ${width}px`);
            
            if (width > 1024) {
                // Desktop: sidebar sempre visível, remover overlay
                sidebar.classList.remove('open');
                this.removeSidebarOverlay();
                console.log('🖥️ Modo Desktop: Sidebar sempre visível');
            } else if (width <= 1024) {
                // Tablet e Mobile: sidebar oculta por padrão, toggle visível
                sidebar.classList.remove('open');
                this.removeSidebarOverlay();
                console.log('📱 Modo Mobile/Tablet: Sidebar oculta, toggle visível');
            }
            
            // Log adicional para debug
            const computedStyle = window.getComputedStyle(sidebar);
            console.log(`🎯 CSS aplicado - Transform: ${computedStyle.transform}, Display: ${computedStyle.display}`);
        }
    }
    
    setupRouting() {
        // Roteamento baseado em hash
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.slice(1) || 'dashboard';
            
            // Verificar autenticação antes de navegar
            if (!this.checkUserAuthentication()) {
                console.log('🚫 Usuário não autenticado, redirecionando para login...');
                window.location.replace('/login');
                return;
            }
            
            this.navigateToPage(hash);
        });

        // Roteamento inicial
        const hash = window.location.hash.slice(1) || 'dashboard';
        this.navigateToPage(hash);
    }
    
    async navigateToPage(page) {
        try {
            // Verificar autenticação antes de navegar
            if (!this.checkUserAuthentication()) {
                console.log('🚫 Usuário não autenticado, redirecionando para login...');
                window.location.replace('/login');
                return;
            }
            
            this.updateActiveNavigation(page);
            await this.loadPage(page);
            window.location.hash = page;
            this.currentPage = page;
            
        } catch (error) {
            console.error('❌ Erro ao navegar para página:', error);
        }
    }
    
    updateActiveNavigation(page) {
        // Remover classe ativa de todos os itens
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Adicionar classe ativa ao item atual
        const activeItem = document.querySelector(`[data-page="${page}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
    }
    
    async loadPage(page) {
        try {
            console.log(`🔄 Carregando página: ${page}`);
            
            // Verificar autenticação antes de carregar página
            if (!this.checkUserAuthentication()) {
                console.log('🚫 Usuário não autenticado, redirecionando para login...');
                window.location.replace('/login');
                return;
            }
            
            // Ocultar todas as páginas
            const allPages = document.querySelectorAll('.page');
            console.log(`🔍 Páginas encontradas:`, allPages.length);
            
            allPages.forEach(p => {
                p.classList.remove('active');
                console.log(`🔍 Ocultando página: ${p.id}`);
            });
            
            // Mostrar página solicitada
            const targetPage = document.getElementById(`${page}-page`);
            if (targetPage) {
                targetPage.classList.add('active');
                console.log(`✅ Página ${page} ativada com sucesso`);
                
                // Carregar dados específicos da página
                await this.loadPageData(page);
                
            } else {
                console.warn(`⚠️ Página ${page}-page não encontrada`);
                console.log(`🔍 Páginas disponíveis:`, Array.from(allPages).map(p => p.id));
                
                // Tentar encontrar página alternativa
                const alternativePage = document.querySelector(`[data-page="${page}"]`);
                if (alternativePage) {
                    console.log(`🔄 Tentando página alternativa:`, alternativePage);
                    alternativePage.classList.add('active');
                } else {
                    console.error(`❌ Nenhuma página encontrada para: ${page}`);
                }
            }
            
        } catch (error) {
            console.error(`❌ Erro ao carregar página ${page}:`, error);
        }
    }
    
    async loadPageData(page) {
        console.log(`📊 Carregando dados para a página: ${page}`);
        
        switch (page) {
            case 'dashboard':
                console.log('🏠 Carregando dados do dashboard...');
                await this.loadDashboardData();
                break;
            case 'clientes':
                if (window.ClientesPage) {
                    const clientesPage = new window.ClientesPage();
                    await clientesPage.init();
                }
                break;
            case 'produtos':
                if (window.ProdutosPage) {
                    const produtosPage = new window.ProdutosPage();
                    await produtosPage.init();
                }
                break;
            case 'vendas':
                if (window.VendasPage) {
                    const vendasPage = new window.VendasPage();
                    await vendasPage.init();
                }
                break;
            case 'orcamentos':
                if (window.OrcamentosPage) {
                    const orcamentosPage = new window.OrcamentosPage();
                    await orcamentosPage.init();
                }
                break;
            case 'relatorios':
                await this.loadRelatoriosData();
                break;
            default:
                console.log(`⚠️ Página não reconhecida: ${page}`);
        }
    }
    
    async loadClientesData() {
        try {
            console.log('👥 Carregando módulo de Clientes...');
            
            // Verificar se a classe ClientesPage está disponível
            if (window.ClientesPage) {
                if (!window.clientesPageInstance) {
                    window.clientesPageInstance = new window.ClientesPage();
                    console.log('✅ Nova instância de ClientesPage criada');
                }
                
                // Inicializar se necessário
                if (window.clientesPageInstance.init) {
                    await window.clientesPageInstance.init();
                }
                
                console.log('✅ Módulo de Clientes carregado com sucesso');
            } else {
                console.warn('⚠️ Classe ClientesPage não encontrada');
            }
        } catch (error) {
            console.error('❌ Erro ao carregar módulo de Clientes:', error);
        }
    }
    
    async loadProdutosData() {
        try {
            console.log('📦 Carregando módulo de Produtos...');
            
            // Verificar se a classe ProdutosPage está disponível
            if (window.ProdutosPage) {
                if (!window.produtosPageInstance) {
                    window.produtosPageInstance = new window.ProdutosPage();
                    console.log('✅ Nova instância de ProdutosPage criada');
                }
                
                // Inicializar se necessário
                if (window.produtosPageInstance.init) {
                    await window.produtosPageInstance.init();
                }
                
                console.log('✅ Módulo de Produtos carregado com sucesso');
            } else {
                console.warn('⚠️ Classe ProdutosPage não encontrada');
            }
        } catch (error) {
            console.error('❌ Erro ao carregar módulo de Produtos:', error);
        }
    }
    
    async loadVendasData() {
        try {
            console.log('🛒 Carregando módulo de Vendas...');
            
            // Verificar se a classe VendasPage está disponível
            if (window.VendasPage) {
                if (!window.vendasPageInstance) {
                    window.vendasPageInstance = new window.VendasPage();
                    console.log('✅ Nova instância de VendasPage criada');
                }
                
                // Inicializar se necessário
                if (window.vendasPageInstance.init) {
                    await window.vendasPageInstance.init();
                }
                
                console.log('✅ Módulo de Vendas carregado com sucesso');
            } else {
                console.warn('⚠️ Classe VendasPage não encontrada');
            }
        } catch (error) {
            console.error('❌ Erro ao carregar módulo de Vendas:', error);
        }
    }
    
    async loadOrcamentosData() {
        try {
            console.log('📋 Carregando módulo de Orçamentos...');
            
            // Verificar se a classe OrcamentosPage está disponível
            if (window.OrcamentosPage) {
                if (!window.orcamentosPageInstance) {
                    window.orcamentosPageInstance = new window.OrcamentosPage();
                    console.log('✅ Nova instância de OrcamentosPage criada');
                }
                
                // Inicializar se necessário
                if (window.orcamentosPageInstance.init) {
                    await window.orcamentosPageInstance.init();
                }
                
                console.log('✅ Módulo de Orçamentos carregado com sucesso');
            } else {
                console.warn('⚠️ Classe OrcamentosPage não encontrada');
            }
        } catch (error) {
            console.error('❌ Erro ao carregar módulo de Orçamentos:', error);
        }
    }
    
    async loadDashboardData() {
        try {
            console.log('🔄 Carregando dados do dashboard...');
            
            // Mostrar loading
            this.showDashboardLoading();
            
            // Buscar dados reais do sistema
            const response = await fetch('/api/relatorios/dashboard', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Resposta não é JSON válido');
            }

            const data = await response.json();
            console.log('✅ Dados do dashboard carregados:', data);
            
            // Verificar se a resposta tem a estrutura esperada
            if (data.success && data.data && data.data.estatisticas) {
                const estatisticas = data.data.estatisticas;
                console.log('📊 Estatísticas extraídas:', estatisticas);
                
                // Atualizar cards com dados reais da estrutura correta
                this.updateDashboardCards(estatisticas);
                
                // Atualizar resumo financeiro
                this.updateFinancialSummary(estatisticas);
                
                // Atualizar atividade recente
                this.updateRecentActivity(estatisticas);
                
                // Esconder loading
                this.hideDashboardLoading();
            } else {
                throw new Error('Estrutura de dados inválida na resposta da API');
            }
            
        } catch (error) {
            console.error('❌ Erro ao carregar dados do dashboard:', error);
            
            // Carregar dados padrão em caso de erro
            this.loadDefaultDashboardData();
            
            // Esconder loading
            this.hideDashboardLoading();
        }
    }

    showDashboardLoading() {
        try {
            console.log('🔄 Mostrando loading do dashboard...');
            
            // Mostrar indicadores de loading nos cards EXISTENTES
            const totalClientes = document.getElementById('total-clientes');
            const totalVendas = document.getElementById('total-vendas');
            const totalProdutos = document.getElementById('total-produtos');
            
            if (totalClientes) totalClientes.textContent = '...';
            if (totalVendas) totalVendas.textContent = '...';
            if (totalProdutos) totalProdutos.textContent = '...';
            
            // Verificar e mostrar loading nos outros cards se existirem
            const orcamentosAtivos = document.getElementById('orcamentos-ativos');
            const orcamentosAprovados = document.getElementById('orcamentos-aprovados');
            const orcamentosConvertidos = document.getElementById('orcamentos-convertidos');
            const orcamentosExpirados = document.getElementById('orcamentos-expirados');
            
            if (orcamentosAtivos) orcamentosAtivos.textContent = '...';
            if (orcamentosAprovados) orcamentosAprovados.textContent = '...';
            if (orcamentosConvertidos) orcamentosConvertidos.textContent = '...';
            if (orcamentosExpirados) orcamentosExpirados.textContent = '...';
            
            // Verificar e mostrar loading no resumo financeiro se existir
            const valorTotalVendas = document.getElementById('valor-total-vendas');
            const valorTotalPago = document.getElementById('valor-total-pago');
            const valorTotalDevido = document.getElementById('valor-total-devido');
            
            if (valorTotalVendas) valorTotalVendas.textContent = 'R$ ...';
            if (valorTotalPago) valorTotalPago.textContent = 'R$ ...';
            if (valorTotalDevido) valorTotalDevido.textContent = 'R$ ...';
            
            // Mostrar loading na atividade recente se existir
            const activityList = document.getElementById('activity-list');
            if (activityList) {
                activityList.innerHTML = `
                    <div class="loading-placeholder">
                        <i class="fas fa-spinner fa-spin"></i>
                        <span>Carregando dados...</span>
                    </div>
                `;
            }
            
            console.log('✅ Loading do dashboard exibido com sucesso');
            
        } catch (error) {
            console.warn('⚠️ Erro ao mostrar loading do dashboard:', error);
        }
    }

    hideDashboardLoading() {
        // Esconder indicadores de loading (já preenchidos com dados)
        console.log('✅ Loading do dashboard finalizado');
    }

    updateDashboardCards(data) {
        try {
            console.log('🔄 Atualizando cards do dashboard...');
            
            // Atualizar cards principais (apenas os que existem)
            const totalClientes = document.getElementById('total-clientes');
            if (totalClientes && data.total_clientes !== undefined) {
                totalClientes.textContent = data.total_clientes;
            }
            
            const totalVendas = document.getElementById('total-vendas');
            if (totalVendas && data.total_vendas !== undefined) {
                totalVendas.textContent = data.total_vendas;
            }
            
            const totalProdutos = document.getElementById('total-produtos');
            if (totalProdutos && data.total_produtos !== undefined) {
                totalProdutos.textContent = data.total_produtos;
            }
            
            // Atualizar cards de orçamentos se existirem
            const orcamentosAtivos = document.getElementById('orcamentos-ativos');
            if (orcamentosAtivos && data.orcamentos_ativos !== undefined) {
                orcamentosAtivos.textContent = data.orcamentos_ativos;
            }
            
            const orcamentosAprovados = document.getElementById('orcamentos-aprovados');
            if (orcamentosAprovados && data.orcamentos_aprovados !== undefined) {
                orcamentosAprovados.textContent = data.orcamentos_aprovados;
            }
            
            const orcamentosConvertidos = document.getElementById('orcamentos-convertidos');
            if (orcamentosConvertidos && data.orcamentos_convertidos !== undefined) {
                orcamentosConvertidos.textContent = data.orcamentos_convertidos;
            }
            
            const orcamentosExpirados = document.getElementById('orcamentos-expirados');
            if (orcamentosExpirados && data.orcamentos_expirados !== undefined) {
                orcamentosExpirados.textContent = data.orcamentos_expirados;
            }
            
            console.log('✅ Cards do dashboard atualizados com sucesso');
            
        } catch (error) {
            console.error('❌ Erro ao atualizar cards do dashboard:', error);
        }
    }

    updateFinancialSummary(data) {
        try {
            console.log('🔄 Atualizando resumo financeiro...');
            
            // Atualizar valores financeiros se os elementos existirem
            const valorTotalVendas = document.getElementById('valor-total-vendas');
            if (valorTotalVendas && data.valor_total_vendas) {
                const valor = parseFloat(data.valor_total_vendas);
                valorTotalVendas.textContent = `R$ ${valor.toFixed(2).replace('.', ',')}`;
            }
            
            const valorTotalPago = document.getElementById('valor-total-pago');
            if (valorTotalPago && data.valor_total_pago) {
                const valor = parseFloat(data.valor_total_pago);
                valorTotalPago.textContent = `R$ ${valor.toFixed(2).replace('.', ',')}`;
            }
            
            const valorTotalDevido = document.getElementById('valor-total-devido');
            if (valorTotalDevido && data.valor_total_devido) {
                const valor = parseFloat(data.valor_total_devido);
                valorTotalDevido.textContent = `R$ ${valor.toFixed(2).replace('.', ',')}`;
            }
            
            console.log('✅ Resumo financeiro atualizado com sucesso');
            
        } catch (error) {
            console.error('❌ Erro ao atualizar resumo financeiro:', error);
        }
    }

    updateRecentActivity(data) {
        try {
            console.log('🔄 Atualizando atividade recente...');
            
            const activityList = document.getElementById('activity-list');
            if (!activityList) {
                console.log('⚠️ Lista de atividades não encontrada');
                return;
            }
            
            // Criar lista de atividades baseada nos dados reais
            const activities = [];
            
            // Adicionar atividades baseadas nos dados disponíveis
            if (data.total_clientes && data.total_clientes > 0) {
                activities.push({
                    icon: 'fas fa-user-plus',
                    text: `${data.total_clientes} cliente(s) cadastrado(s) no sistema`,
                    time: 'Hoje',
                    type: 'info'
                });
            }
            
            if (data.total_vendas && data.total_vendas > 0) {
                activities.push({
                    icon: 'fas fa-shopping-cart',
                    text: `${data.total_vendas} venda(s) realizadas`,
                    time: 'Hoje',
                    type: 'success'
                });
            }
            
            if (data.orcamentos_ativos && data.orcamentos_ativos > 0) {
                activities.push({
                    icon: 'fas fa-file-invoice',
                    text: `${data.orcamentos_ativos} orçamento(s) ativo(s)`,
                    time: 'Hoje',
                    type: 'warning'
                });
            }
            
            // Se não houver atividades, mostrar mensagem
            if (activities.length === 0) {
                activities.push({
                    icon: 'fas fa-info-circle',
                    text: 'Nenhuma atividade recente',
                    time: 'Hoje',
                    type: 'info'
                });
            }
            
            // Renderizar atividades
            activityList.innerHTML = activities.map(activity => `
                <div class="activity-item ${activity.type}">
                    <div class="activity-icon">
                        <i class="${activity.icon}"></i>
                    </div>
                    <div class="activity-content">
                        <span class="activity-text">${activity.text}</span>
                        <span class="activity-time">${activity.time}</span>
                    </div>
                </div>
            `).join('');
            
            console.log('✅ Atividade recente atualizada com sucesso');
            
        } catch (error) {
            console.error('❌ Erro ao atualizar atividade recente:', error);
        }
    }

    loadDefaultDashboardData() {
        try {
            console.log('📊 Carregando dados padrão do dashboard...');
            
            const defaultData = {
                total_clientes: '0',
                total_produtos: '0',
                total_vendas: '0',
                orcamentos_ativos: '0',
                orcamentos_aprovados: '0',
                orcamentos_convertidos: '0',
                orcamentos_expirados: '0',
                valor_total_vendas: '0.00',
                valor_total_pago: '0.00',
                valor_total_devido: '0.00'
            };
            
            // Atualizar cards com dados padrão
            this.updateDashboardCards(defaultData);
            this.updateFinancialSummary(defaultData);
            this.updateRecentActivity(defaultData);
            
            console.log('✅ Dados padrão carregados com sucesso');
            
        } catch (error) {
            console.error('❌ Erro ao carregar dados padrão:', error);
        }
    }

    setupDashboardRefresh() {
        const refreshBtn = document.getElementById('refresh-dashboard');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                console.log('🔄 Atualizando dashboard...');
                this.loadDashboardData();
            });
        }
    }
    
    async loadRelatoriosData() {
        try {
            // Verificar se a classe RelatoriosPageFinal está disponível
            if (window.RelatoriosPageFinal) {
                const relatoriosPage = new window.RelatoriosPageFinal();
                await relatoriosPage.init();
            } else if (window.RelatoriosPage) {
                const relatoriosPage = new window.RelatoriosPage();
                await relatoriosPage.init();
            } else {
                console.warn('⚠️ Classe RelatoriosPage não encontrada');
            }
        } catch (error) {
            console.error('❌ Erro ao carregar página de relatórios:', error);
        }
    }
    
    updateDashboardStats(data) {
        try {
            console.log('🔄 Atualizando estatísticas do dashboard...');
            
            // Verificar se os dados têm a estrutura esperada
            const estatisticas = data.estatisticas || data;
            
            // Atualizar estatísticas (com verificação de segurança)
            const totalClientes = document.getElementById('total-clientes');
            if (totalClientes && estatisticas.total_clientes) {
                totalClientes.textContent = estatisticas.total_clientes;
            }
            
            const totalProdutos = document.getElementById('total-produtos');
            if (totalProdutos && estatisticas.total_produtos) {
                totalProdutos.textContent = estatisticas.total_produtos;
            }
            
            const totalVendas = document.getElementById('total-vendas');
            if (totalVendas && estatisticas.total_vendas) {
                totalVendas.textContent = estatisticas.total_vendas;
            }
            
            const orcamentosAtivos = document.getElementById('orcamentos-ativos');
            if (orcamentosAtivos && estatisticas.orcamentos_ativos) {
                orcamentosAtivos.textContent = estatisticas.orcamentos_ativos;
            }
            
            const orcamentosAprovados = document.getElementById('orcamentos-aprovados');
            if (orcamentosAprovados && estatisticas.orcamentos_aprovados) {
                orcamentosAprovados.textContent = estatisticas.orcamentos_aprovados;
            }
            
            const orcamentosConvertidos = document.getElementById('orcamentos-convertidos');
            if (orcamentosConvertidos && estatisticas.orcamentos_convertidos) {
                orcamentosConvertidos.textContent = estatisticas.orcamentos_convertidos;
            }
            
            const orcamentosExpirados = document.getElementById('orcamentos-expirados');
            if (orcamentosExpirados && estatisticas.orcamentos_expirados) {
                orcamentosExpirados.textContent = estatisticas.orcamentos_expirados;
            }
            
            // Atualizar valores financeiros (com verificação de segurança)
            const valorTotalVendas = document.getElementById('valor-total-vendas');
            if (valorTotalVendas && estatisticas.valor_total_vendas) {
                const valor = parseFloat(estatisticas.valor_total_vendas);
                valorTotalVendas.textContent = `R$ ${valor.toFixed(2).replace('.', ',')}`;
            }
            
            const valorTotalPago = document.getElementById('valor-total-pago');
            if (valorTotalPago && estatisticas.valor_total_pago) {
                const valor = parseFloat(estatisticas.valor_total_pago);
                valorTotalPago.textContent = `R$ ${valor.toFixed(2).replace('.', ',')}`;
            }
            
            const valorTotalDevido = document.getElementById('valor-total-devido');
            if (valorTotalDevido && estatisticas.valor_total_devido) {
                const valor = parseFloat(estatisticas.valor_total_devido);
                valorTotalDevido.textContent = `R$ ${valor.toFixed(2).replace('.', ',')}`;
            }
            
            console.log('✅ Estatísticas do dashboard atualizadas com sucesso');
            
        } catch (error) {
            console.error('❌ Erro ao atualizar estatísticas do dashboard:', error);
        }
    }
    
    handleQuickAction(action) {
        switch (action) {
            case 'nova-venda':
                this.navigateToPage('vendas');
                break;
            case 'novo-cliente':
                this.navigateToPage('clientes');
                break;
            case 'novo-produto':
                this.navigateToPage('produtos');
                break;
            case 'novo-orcamento':
                this.navigateToPage('orcamentos');
                break;
        }
    }
    
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    }
    
    forceResponsiveness() {
        const sidebar = document.getElementById('sidebar');
        const sidebarToggle = document.getElementById('sidebar-toggle');
        
        if (sidebar && sidebarToggle) {
            const width = window.innerWidth;
            console.log(`🔧 Forçando responsividade - Largura: ${width}px`);
            
            if (width > 1024) {
                // Desktop: forçar sidebar visível
                sidebar.style.transform = 'translateX(0)';
                sidebarToggle.style.display = 'none';
                console.log('🖥️ Responsividade forçada: Desktop');
            } else {
                // Mobile/Tablet: forçar sidebar oculta
                sidebar.style.transform = 'translateX(-100%)';
                sidebarToggle.style.display = 'block';
                console.log('📱 Responsividade forçada: Mobile/Tablet');
            }
        }
    }
}

// Inicializar sistema quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM carregado, inicializando Sistema de Vendas...');
    window.sistemaVendas = new SistemaVendas();
    
    // Verificar autenticação após inicialização
    setTimeout(() => {
        if (window.checkAuthStatus) {
            window.checkAuthStatus();
        }
    }, 500);
}); 