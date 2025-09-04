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

            // Verificar autenticação inicial
            this.checkInitialAuth();

            // Configurar roteamento
            this.setupRouting();

            // Configurar event listeners
            this.setupEventListeners();

            // Configurar responsividade
            this.handleResize();

            // ✅ VERIFICAR E INICIALIZAR PÁGINAS
            setTimeout(() => {
                this.checkAndInitializePages();
            }, 1000);

            // Ocultar tela de carregamento
            this.hideLoadingScreen();

            console.log('✅ Sistema de Vendas inicializado com sucesso!');

        } catch (error) {
            console.error('❌ Erro ao inicializar Sistema de Vendas:', error);
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
            // ✅ VERIFICAR TOKEN NA URL PRIMEIRO (para rotas protegidas)
            const urlParams = new URLSearchParams(window.location.search);
            const urlToken = urlParams.get('token');

            // ✅ VERIFICAR TOKEN NO LOCALSTORAGE
            const localStorageToken = localStorage.getItem('authToken');
            const userData = localStorage.getItem('userData');

            // ✅ VERIFICAR SE HÁ TOKEN VÁLIDO NA URL (PRIORIDADE MÁXIMA)
            if (urlToken && urlToken.trim() !== '') {
                console.log('✅ Token encontrado na URL');
                // Salvar token da URL no localStorage se não existir
                if (!localStorageToken) {
                    localStorage.setItem('authToken', urlToken);
                    console.log('✅ Token da URL salvo no localStorage');
                }
                return true;
            }

            // ✅ SE NÃO HÁ TOKEN NA URL, VERIFICAR SE ESTAMOS EM ROTA PROTEGIDA
            if (this.isOnProtectedRoute()) {
                console.log('🚫 Rota protegida sem token na URL, acesso negado');
                return false;
            }

            // ✅ SE NÃO ESTAMOS EM ROTA PROTEGIDA, VERIFICAR LOCALSTORAGE
            if (localStorageToken && userData) {
                console.log('✅ Usuário autenticado via localStorage');
                return true;
            }

            console.log('❌ Usuário não autenticado');
            return false;
        } catch (error) {
            console.error('❌ Erro ao verificar autenticação:', error);
            return false;
        }
    }

    checkInitialAuth() {
        // ✅ VERIFICAR AUTENTICAÇÃO IMEDIATAMENTE NO CONSTRUTOR
        setTimeout(() => {
            // ✅ SEMPRE VERIFICAR SE ESTAMOS EM ROTA PROTEGIDA
            if (this.isOnProtectedRoute()) {
                if (!this.checkUserAuthentication()) {
                    console.log('🚫 Usuário não autenticado em rota protegida, redirecionando para login...');
                    // ✅ REDIRECIONAR PARA LOGIN COM MENSAGEM DE SEGURANÇA
                    window.location.replace('/login?message=security_required');
                    return; // Parar execução
                }
            } else {
                // ✅ SE NÃO ESTAMOS EM ROTA PROTEGIDA, VERIFICAR AUTENTICAÇÃO NORMAL
                if (!this.checkUserAuthentication()) {
                    console.log('🚫 Usuário não autenticado, redirecionando para login...');
                    // ✅ REDIRECIONAR PARA LOGIN COM MENSAGEM DE SEGURANÇA
                    window.location.replace('/login?message=authentication_required');
                    return; // Parar execução
                }
            }
        }, 100);
    }

    // MUTATION OBSERVER - REMOVER OVERLAY ASSIM QUE FOR CRIADO
    // COMENTADO PARA PERMITIR OVERLAY FUNCIONAR CORRETAMENTE
    /*
    setupOverlayObserver() {
        console.log('👁️ CONFIGURANDO OBSERVADOR PARA REMOVER OVERLAY AUTOMATICAMENTE');
        
        // Criar observer que monitora mudanças no DOM
        this.overlayObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Verificar se o nó adicionado é um overlay
                            if (node.id === 'sidebar-overlay' || 
                                node.className && node.className.includes('sidebar-overlay')) {
                                console.log('🚨 OVERLAY DETECTADO PELO OBSERVADOR!');
                                console.log('🚨 Removendo imediatamente...');
                                node.remove();
                            }
                            
                            // Verificar se há overlays dentro do nó adicionado
                            const overlaysInside = node.querySelectorAll('#sidebar-overlay, .sidebar-overlay');
                            if (overlaysInside.length > 0) {
                                console.log(`🚨 ${overlaysInside.length} OVERLAYS DETECTADOS DENTRO DO NÓ!`);
                                overlaysInside.forEach(overlay => {
                                    console.log('🚨 Removendo overlay interno...');
                                    overlay.remove();
                                });
                            }
                        }
                    });
                }
            });
        });
        
        // Iniciar observação
        this.overlayObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('👁️ Observador configurado e ativo');
    }
    */

    // Parar observador
    stopOverlayObserver() {
        if (this.overlayObserver) {
            this.overlayObserver.disconnect();
            this.overlayObserver = null;
            console.log('👁️ Observador parado');
        }
    }

    // REMOÇÃO CONTÍNUA DO OVERLAY - INTERVALO
    // COMENTADO PARA PERMITIR OVERLAY FUNCIONAR CORRETAMENTE
    /*
    startContinuousOverlayRemoval() {
        console.log('🔄 INICIANDO REMOÇÃO CONTÍNUA DO OVERLAY');
        
        // Remover imediatamente
        this.forceRemoveOverlayAggressive();
        
        // Configurar intervalo para remover a cada 100ms
        this.overlayRemovalInterval = setInterval(() => {
            const overlays = document.querySelectorAll('#sidebar-overlay, .sidebar-overlay, [id*="sidebar-overlay"], [class*="sidebar-overlay"]');
            if (overlays.length > 0) {
                console.log(`🔄 Removendo ${overlays.length} overlays encontrados...`);
                overlays.forEach(overlay => {
                    overlay.remove();
                });
            }
        }, 100);
        
        console.log('🔄 Remoção contínua do overlay iniciada');
    }
    */

    // Parar remoção contínua
    stopContinuousOverlayRemoval() {
        if (this.overlayRemovalInterval) {
            clearInterval(this.overlayRemovalInterval);
            this.overlayRemovalInterval = null;
            console.log('🔄 Remoção contínua do overlay parada');
        }
    }

    // REMOÇÃO FORÇADA DO OVERLAY - ABORDAGEM AGRESSIVA
    // COMENTADO PARA PERMITIR OVERLAY FUNCIONAR CORRETAMENTE
    /*
    forceRemoveOverlayAggressive() {
        console.log('🚨 REMOÇÃO FORÇADA DO OVERLAY INICIADA');
        
        // Método 1: Remover por ID
        const overlayById = document.getElementById('sidebar-overlay');
        if (overlayById) {
            console.log('🚨 Overlay encontrado por ID, removendo...');
            overlayById.remove();
        }
        
        // Método 2: Remover por classe
        const overlaysByClass = document.querySelectorAll('.sidebar-overlay');
        if (overlaysByClass.length > 0) {
            console.log(`🚨 ${overlaysByClass.length} overlays encontrados por classe, removendo...`);
            overlaysByClass.forEach(overlay => overlay.remove());
        }
        
        // Método 3: Remover por seletor genérico
        const overlaysGeneric = document.querySelectorAll('[id*="sidebar-overlay"], [class*="sidebar-overlay"]');
        if (overlaysGeneric.length > 0) {
            console.log(`🚨 ${overlaysGeneric.length} overlays encontrados por seletor genérico, removendo...`);
            overlaysGeneric.forEach(overlay => overlay.remove());
        }
        
        // Método 4: Forçar CSS inline
        const allOverlays = document.querySelectorAll('div');
        allOverlays.forEach(div => {
            if (div.id && div.id.includes('sidebar-overlay') || 
                div.className && div.className.includes('sidebar-overlay')) {
                console.log('🚨 Overlay encontrado por busca genérica, removendo...');
                div.style.display = 'none';
                div.style.visibility = 'hidden';
                div.style.opacity = '0';
                div.style.position = 'absolute';
                div.style.top = '-9999px';
                div.style.left = '-9999px';
                div.style.width = '0';
                div.style.height = '0';
                div.style.background = 'transparent';
                div.style.zIndex = '-9999';
                div.style.pointerEvents = 'none';
            }
        });
        
        // Método 5: Verificar se ainda existe
        setTimeout(() => {
            const remainingOverlays = document.querySelectorAll('#sidebar-overlay, .sidebar-overlay, [id*="sidebar-overlay"], [class*="sidebar-overlay"]');
            if (remainingOverlays.length === 0) {
                console.log('✅ TODOS OS OVERLAYS FORAM REMOVIDOS COM SUCESSO!');
            } else {
                console.log(`❌ Ainda existem ${remainingOverlays.length} overlays!`);
                remainingOverlays.forEach(overlay => {
                    console.log('❌ Overlay restante:', overlay);
                    overlay.remove();
                });
            }
        }, 100);
        
        console.log('🚨 REMOÇÃO FORÇADA DO OVERLAY CONCLUÍDA');
    }
    */

    // Verificar estado atual do overlay
    checkOverlayStatus() {
        console.log('🔍 === VERIFICAÇÃO DO OVERLAY ===');
        console.log('🔍 window.innerWidth:', window.innerWidth);
        console.log('🔍 É desktop?', window.innerWidth > 1024);

        const overlay = document.getElementById('sidebar-overlay');
        console.log('🔍 Overlay no DOM:', overlay);

        if (overlay) {
            console.log('🔍 Overlay encontrado:');
            console.log('  - ID:', overlay.id);
            console.log('  - Classes:', overlay.className);
            console.log('  - Display:', overlay.style.display);
            console.log('  - Background:', overlay.style.background);
            console.log('  - Z-index:', overlay.style.zIndex);
            console.log('  - Position:', overlay.style.position);
        }

        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            console.log('🔍 Sidebar:');
            console.log('  - Classes:', sidebar.className);
            console.log('  - Transform:', sidebar.style.transform);
            console.log('  - Display:', sidebar.style.display);
        }

        console.log('🔍 === FIM DA VERIFICAÇÃO ===');
    }

    // Forçar remoção do overlay no desktop
    forceRemoveOverlayOnDesktop() {
        console.log('🔄 forceRemoveOverlayOnDesktop chamado');
        console.log('🔄 window.innerWidth:', window.innerWidth);
        console.log('🔄 É desktop?', window.innerWidth > 1024);

        if (window.innerWidth > 1024) {
            console.log('🖥️ Forçando remoção do overlay no desktop');

            // Verificar se há overlay existente
            const existingOverlay = document.getElementById('sidebar-overlay');
            console.log('🔄 Overlay existente:', existingOverlay);

            this.removeSidebarOverlay();

            // Também remover classe 'open' da sidebar
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                console.log('🔄 Removendo classe open da sidebar');
                sidebar.classList.remove('open');
            }

            // Verificar novamente se o overlay foi removido
            const overlayAfter = document.getElementById('sidebar-overlay');
            console.log('🔄 Overlay após remoção:', overlayAfter);
        } else {
            console.log('📱 Não é desktop, não forçando remoção do overlay');
        }
    }

    createSidebarOverlay() {
        console.log('🔄 Criando overlay discreto para sidebar...');

        // NUNCA criar overlay no desktop (> 1024px)
        if (window.innerWidth > 1024) {
            console.log('🖥️ Desktop detectado, NUNCA criando overlay');
            // Remover overlay existente se houver
            this.removeSidebarOverlay();
            return;
        }

        console.log('📱 Mobile/Tablet detectado, criando overlay discreto');

        // Remover overlay existente se houver
        this.removeSidebarOverlay();

        // ✅ CRIAR OVERLAY DISCRETO
        const overlay = document.createElement('div');
        overlay.id = 'sidebar-overlay';
        overlay.className = 'sidebar-overlay';
        overlay.setAttribute('aria-label', 'Fechar menu de navegação');
        overlay.setAttribute('role', 'button');
        overlay.setAttribute('tabindex', '0');

        // ✅ VERIFICAR SE HÁ NOTIFICAÇÃO DE ESTOQUE
        const estoqueNotification = document.querySelector('.estoque-notification');
        if (estoqueNotification && window.getComputedStyle(estoqueNotification).display !== 'none') {
            overlay.classList.add('has-notification');
            console.log('✅ Overlay ajustado para notificação de estoque');
        }

        // ✅ ADICIONAR CONTEÚDO VISUAL DISCRETO
        overlay.innerHTML = `
            <div class="overlay-content">
                <div class="overlay-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </div>
                <div class="overlay-text">Fechar</div>
            </div>
        `;

        console.log('🔄 Overlay discreto criado:', overlay);
        document.body.appendChild(overlay);

        // ✅ ADICIONAR EVENTOS DE INTERAÇÃO
        const closeSidebar = () => {
            const sidebar = document.getElementById('sidebar');
            const sidebarToggle = document.getElementById('sidebar-toggle');

            if (sidebar && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
                if (sidebarToggle) {
                    sidebarToggle.classList.remove('active');
                    sidebarToggle.setAttribute('aria-expanded', 'false');
                }
                this.removeSidebarOverlay();
                console.log('✅ Sidebar fechada via overlay');
            }
        };

        // ✅ CLIQUE NO OVERLAY
        overlay.addEventListener('click', closeSidebar);

        // ✅ TECLA ENTER/ESPAÇO (acessibilidade)
        overlay.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                closeSidebar();
            }
        });

        // ✅ ESCAPE KEY (fechar com ESC)
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                const sidebar = document.getElementById('sidebar');
                if (sidebar && sidebar.classList.contains('open')) {
                    closeSidebar();
                }
            }
        };

        // ✅ ADICIONAR LISTENER PARA ESCAPE
        document.addEventListener('keydown', escapeHandler);

        // ✅ ARMAZENAR REFERÊNCIA PARA REMOÇÃO POSTERIOR
        overlay._escapeHandler = escapeHandler;

        // ✅ ANIMAÇÃO DE ENTRADA IMEDIATA
        overlay.classList.add('visible');

        console.log('✅ Overlay discreto da sidebar criado (mobile/tablet)');
    }

    removeSidebarOverlay() {
        console.log('🔄 removeSidebarOverlay chamado');
        const overlay = document.getElementById('sidebar-overlay');
        console.log('🔄 Overlay encontrado:', overlay);

        if (overlay) {
            console.log('🔄 Removendo overlay com animação...');

            // ✅ REMOVER LISTENER DE ESCAPE
            if (overlay._escapeHandler) {
                document.removeEventListener('keydown', overlay._escapeHandler);
                console.log('✅ Listener de escape removido');
            }

            // ✅ ANIMAÇÃO DE SAÍDA ELEGANTE
            overlay.classList.remove('visible');
            overlay.classList.add('fade-out');

            // ✅ AGUARDAR ANIMAÇÃO TERMINAR ANTES DE REMOVER
            setTimeout(() => {
                if (overlay && overlay.parentNode) {
                    overlay.remove();
                    console.log('✅ Overlay da sidebar removido com sucesso');
                }
            }, 300); // Tempo da animação CSS

            // Verificar se foi removido
            setTimeout(() => {
                const overlayAfter = document.getElementById('sidebar-overlay');
                console.log('🔄 Overlay após remoção:', overlayAfter);
            }, 350);
        } else {
            console.log('ℹ️ Nenhum overlay encontrado para remover');
        }
    }

    setupEventListeners() {
        // Toggle da sidebar
        const sidebarToggle = document.getElementById('sidebar-toggle');
        const sidebar = document.getElementById('sidebar');

        if (sidebarToggle && sidebar) {
            sidebarToggle.addEventListener('click', () => {
                console.log('🔄 Toggle da sidebar clicado');

                // ✅ ATUALIZAR ESTADO DO BOTÃO
                const isOpen = sidebar.classList.contains('open');
                sidebar.classList.toggle('open');

                // ✅ ATUALIZAR ATRIBUTOS DE ACESSIBILIDADE
                sidebarToggle.setAttribute('aria-expanded', !isOpen);

                // ✅ ADICIONAR/REMOVER CLASSE DE ESTADO
                if (sidebar.classList.contains('open')) {
                    sidebarToggle.classList.add('active');
                    console.log('✅ Sidebar aberta - botão ativo');

                    // ✅ CRIAR OVERLAY IMEDIATAMENTE APÓS ABRIR A SIDEBAR
                    if (window.innerWidth <= 1024) {
                        // CRIAR OVERLAY IMEDIATAMENTE SEM DELAY
                        this.createSidebarOverlay();
                        console.log('✅ Overlay criado imediatamente após sidebar aberta (mobile/tablet)');
                    }
                } else {
                    sidebarToggle.classList.remove('active');
                    console.log('❌ Sidebar fechada - botão inativo');

                    // ✅ REMOVER OVERLAY IMEDIATAMENTE AO FECHAR
                    if (window.innerWidth <= 1024) {
                        this.removeSidebarOverlay();
                        console.log('❌ Overlay removido ao fechar sidebar (mobile/tablet)');
                    }
                }

                console.log('🖥️ Desktop: sidebar sempre visível, sem overlay');
            });

            // ✅ ADICIONAR ESTADOS DE HOVER E FOCUS
            sidebarToggle.addEventListener('mouseenter', () => {
                if (!sidebar.classList.contains('open')) {
                    sidebarToggle.classList.add('hover');
                }
            });

            sidebarToggle.addEventListener('mouseleave', () => {
                sidebarToggle.classList.remove('hover');
            });

            // ✅ ADICIONAR ESTADO DE LOADING (opcional)
            sidebarToggle.addEventListener('mousedown', () => {
                sidebarToggle.classList.add('pressed');
            });

            sidebarToggle.addEventListener('mouseup', () => {
                setTimeout(() => {
                    sidebarToggle.classList.remove('pressed');
                }, 150);
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
                sidebarToggle.classList.remove('active');
                sidebarToggle.setAttribute('aria-expanded', 'false');
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
                        sidebarToggle.classList.remove('active');
                        sidebarToggle.setAttribute('aria-expanded', 'false');
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
            this.forceRemoveOverlayOnDesktop(); // Chamar forçar remoção no redimensionamento
        });
    }

    handleResize() {
        const sidebar = document.getElementById('sidebar');
        const sidebarToggle = document.getElementById('sidebar-toggle');

        if (sidebar && sidebarToggle) {
            const width = window.innerWidth;
            console.log(`🔄 Redimensionamento detectado: ${width}px`);

            if (width > 1024) {
                // Desktop: sidebar sempre visível
                console.log('🖥️ Modo Desktop: Sidebar sempre visível');
                sidebar.classList.remove('open');
                sidebarToggle.classList.remove('active');
                sidebarToggle.setAttribute('aria-expanded', 'false');
                sidebar.style.transform = 'translateX(0)';

                // ✅ OCULTAR BOTÃO NO DESKTOP
                sidebarToggle.style.display = 'none';

                // Remover overlay se existir
                this.removeSidebarOverlay();

            } else {
                // Mobile/Tablet: sidebar oculta por padrão
                console.log('📱 Modo Mobile/Tablet: Sidebar oculta por padrão');
                sidebar.classList.remove('open');
                sidebarToggle.classList.remove('active');
                sidebarToggle.setAttribute('aria-expanded', 'false');
                sidebar.style.transform = 'translateX(-100%)';

                // ✅ MOSTRAR BOTÃO NO MOBILE/TABLET
                sidebarToggle.style.display = 'block';

                // Remover overlay se existir
                this.removeSidebarOverlay();
            }
        }
    }

    setupRouting() {
        // Roteamento baseado em hash
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.slice(1) || 'dashboard';

            // ✅ PROTEÇÃO CONTRA LOOP INFINITO
            if (this._navigatingTo === hash) {
                console.log('⚠️ Hash change ignorado - navegação em andamento para:', hash);
                return;
            }

            // ✅ VERIFICAR AUTENTICAÇÃO ANTES DE NAVEGAR
            if (!this.checkUserAuthentication()) {
                console.log('🚫 Usuário não autenticado, redirecionando para login...');
                window.location.replace('/login?message=session_expired');
                return;
            }

            console.log('🔄 Hash mudou para:', hash);
            this.navigateToPage(hash);
        });

        // ✅ ROTEAMENTO INICIAL - VERIFICAR AUTENTICAÇÃO PRIMEIRO
        const hash = window.location.hash.slice(1);
        let initialPage = hash || 'dashboard';

        // ✅ SEMPRE VERIFICAR AUTENTICAÇÃO ANTES DE INICIAR
        if (!this.checkUserAuthentication()) {
            console.log('🚫 Usuário não autenticado no roteamento inicial, redirecionando para login...');
            // ✅ SEMPRE INCLUIR MENSAGEM DE SEGURANÇA
            const message = this.isOnProtectedRoute() ? 'security_required' : 'authentication_required';
            window.location.replace(`/login?message=${message}`);
            return;
        }

        // ✅ PERMITIR QUE O HASH DEFINA A PÁGINA INICIAL (APÓS AUTENTICAÇÃO)
        console.log('🔄 Roteamento inicial para:', initialPage);
        window.currentPage = initialPage; // Definir para uso global
        this.navigateToPage(initialPage);
    }

    async navigateToPage(page) {
        try {
            console.log('🔄 navigateToPage chamado com:', page);
            console.log('🔄 window.currentPage antes:', window.currentPage);
            console.log('🔄 this.currentPage antes:', this.currentPage);

            // ✅ PROTEÇÃO CONTRA LOOP INFINITO
            if (this._navigatingTo === page) {
                console.log('⚠️ Tentativa de navegação duplicada para:', page, '- IGNORANDO');
                return;
            }

            // ✅ VERIFICAR AUTENTICAÇÃO ANTES DE NAVEGAR
            if (!this.checkUserAuthentication()) {
                console.log('🚫 Usuário não autenticado, redirecionando para login...');
                // ✅ SEMPRE INCLUIR MENSAGEM DE SEGURANÇA
                const message = this.isOnProtectedRoute() ? 'security_required' : 'navigation_blocked';
                window.location.replace(`/login?message=${message}`);
                return;
            }

            // ✅ PERMITIR NAVEGAÇÃO NORMAL - REMOVER FORÇAMENTO DO DASHBOARD
            console.log('🔄 Navegando para página:', page);

            // ✅ MARCAR COMO NAVEGANDO PARA EVITAR LOOP
            this._navigatingTo = page;

            window.currentPage = page; // Definir para uso global
            this.currentPage = page;

            console.log('🔄 window.currentPage depois:', window.currentPage);
            console.log('🔄 this.currentPage depois:', this.currentPage);

            // ✅ ATUALIZAR HASH PRIMEIRO PARA EVITAR RECURSÃO
            window.location.hash = `#${page}`;

            // ✅ CARREGAR PÁGINA
            await this.loadPage(page);

            // ✅ LIMPAR FLAG DE NAVEGAÇÃO APÓS CONCLUIR
            this._navigatingTo = null;

        } catch (error) {
            console.error('❌ Erro ao navegar para página:', error);
            // ✅ SEMPRE LIMPAR FLAG EM CASO DE ERRO
            this._navigatingTo = null;
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

    async loadPage(pageName) {
        try {
            console.log(`🔄 loadPage chamado com: ${pageName}`);
            console.log(`🔄 window.currentPage antes: ${window.currentPage}`);

            // ✅ PROTEÇÃO CONTRA MÚLTIPLAS CHAMADAS SIMULTÂNEAS
            if (this._loadingPage === pageName) {
                console.log('⚠️ Página já está sendo carregada:', pageName, '- IGNORANDO');
                return;
            }

            // ✅ MARCAR COMO CARREGANDO
            this._loadingPage = pageName;

            // ✅ VERIFICAR AUTENTICAÇÃO ANTES DE CARREGAR PÁGINA
            if (!this.checkUserAuthentication()) {
                console.log('🚫 Usuário não autenticado, redirecionando para login...');
                // ✅ SEMPRE INCLUIR MENSAGEM DE SEGURANÇA
                const message = this.isOnProtectedRoute() ? 'security_required' : 'page_access_denied';
                window.location.replace(`/login?message=${message}`);
                return;
            }

            // ✅ OCULTAR TODAS AS PÁGINAS PRIMEIRO
            const allPages = document.querySelectorAll('.page');
            console.log(`🔍 Encontradas ${allPages.length} páginas para ocultar`);
            allPages.forEach(page => {
                page.classList.remove('active');
                console.log(`🔍 Ocultando página: ${page.id}`);
            });

            // ✅ MOSTRAR APENAS A PÁGINA SOLICITADA
            const targetPage = document.getElementById(`${pageName}-page`);
            if (targetPage) {
                targetPage.classList.add('active');
                console.log(`✅ Página ${pageName} ativada com sucesso`);

                // ✅ DISPARAR EVENTO DE ATIVAÇÃO DA PÁGINA
                const eventName = `${pageName}-page-activated`;
                console.log(`🔔 Disparando evento ${eventName}...`);
                window.dispatchEvent(new CustomEvent(eventName));

                // ✅ ATUALIZAR NAVEGAÇÃO E CARREGAR DADOS
                console.log('🔄 Navegando para página:', pageName);
                window.currentPage = pageName; // Definir para uso global
                this.currentPage = pageName;

                console.log('🔄 window.currentPage depois:', window.currentPage);
                console.log('🔄 this.currentPage depois:', window.currentPage);

                this.updateActiveNavigation(pageName);

                // ✅ REINICIALIZAR PÁGINA SE FOR DASHBOARD
                if (pageName === 'dashboard') {
                    console.log('🔄 Dashboard detectado - forçando reinicialização...');

                    // ✅ LIMPEZA COMPLETA E AGUARDAR FINALIZAÇÃO
                    if (window.dashboardPage) {
                        console.log('🧹 Limpando instância anterior do dashboard...');

                        try {
                            // Aguardar cleanup completo
                            if (window.dashboardPage.cleanup) {
                                await window.dashboardPage.cleanup();
                                console.log('✅ Cleanup da instância anterior concluído');
                            }

                            // Aguardar um pouco para garantir que tudo foi limpo
                            await new Promise(resolve => setTimeout(resolve, 100));

                        } catch (cleanupError) {
                            console.warn('⚠️ Erro no cleanup:', cleanupError);
                        } finally {
                            // ✅ FORÇAR NULL E AGUARDAR GARBAGE COLLECTION
                            window.dashboardPage = null;
                            console.log('✅ Instância anterior removida da memória');

                            // Aguardar um pouco mais para garantir limpeza
                            await new Promise(resolve => setTimeout(resolve, 200));
                        }
                    }
                }

                await this.loadPageData(pageName);

            } else {
                console.warn(`⚠️ Página ${pageName}-page não encontrada`);
                console.log(`🔍 Páginas disponíveis:`, Array.from(allPages).map(p => p.id));

                // ✅ REDIRECIONAR PARA DASHBOARD SE PÁGINA NÃO ENCONTRADA
                console.log(`🔄 Redirecionando para dashboard...`);
                this.navigateToPage('dashboard');
                return;
            }

            // ✅ LIMPAR FLAG DE CARREGAMENTO
            this._loadingPage = null;

        } catch (error) {
            console.error('❌ Erro ao navegar para página:', error);
            // ✅ SEMPRE LIMPAR FLAG EM CASO DE ERRO
            this._loadingPage = null;
        }
    }

    async loadPageData(pageName) {
        console.log(`📊 Carregando dados para a página: ${pageName}`);

        try {
            switch (pageName) {
                case 'dashboard':
                    console.log('🏠 Carregando dados do dashboard...');

                    // ✅ VERIFICAR SE JÁ EXISTE UMA INSTÂNCIA ATIVA
                    if (window.dashboardPage) {
                        console.log('⚠️ Instância do dashboard já existe, verificando se está válida...');

                        // Verificar se a instância está funcionando
                        if (window.dashboardPage.isActive && window.dashboardPage.isActive()) {
                            console.log('✅ Instância existente está ativa, reutilizando...');
                        } else {
                            console.log('🔄 Instância existente não está ativa, criando nova...');
                            window.dashboardPage = null;
                        }
                    }

                    // ✅ CRIAR NOVA INSTÂNCIA SE NECESSÁRIO
                    if (!window.dashboardPage) {
                        console.log('🆕 Criando nova instância do DashboardPage...');
                        if (window.DashboardPage) {
                            window.dashboardPage = new window.DashboardPage();
                            console.log('✅ Nova instância criada com sucesso');
                        } else {
                            console.error('❌ Classe DashboardPage não encontrada');
                            return;
                        }
                    }

                    await this.loadDashboardDataApp();
                    break;
                case 'clientes':
                case 'produtos':
                case 'vendas':
                case 'orcamentos':
                    console.log(`🔄 Inicializando página: ${pageName}...`);
                    await this.initializePage(pageName);
                    break;
                case 'relatorios':
                    console.log('📊 Carregando dados de relatórios...');
                    await this.loadRelatoriosData();
                    break;
                default:
                    console.log(`⚠️ Página não reconhecida: ${pageName}`);
            }
        } catch (error) {
            console.error(`❌ Erro ao carregar dados da página ${pageName}:`, error);
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

    // ❌ REMOVIDO: loadProdutosData() - FUNÇÃO DUPLICADA
    // A página de produtos agora é gerenciada pelo initializePage()

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

    // ✅ BLOQUEIO GLOBAL PARA EVITAR MÚLTIPLAS INICIALIZAÇÕES
    static dashboardLoadingLock = false;

    async loadDashboardDataApp() {
        try {
            // ✅ VERIFICAR SE JÁ ESTÁ CARREGANDO
            if (this.constructor.dashboardLoadingLock) {
                console.log('⚠️ Dashboard já está sendo carregado, aguardando...');
                while (this.constructor.dashboardLoadingLock) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                console.log('✅ Dashboard carregado por outra operação');
                return;
            }

            // ✅ ATIVAR BLOQUEIO
            this.constructor.dashboardLoadingLock = true;
            console.log('🔒 Bloqueio ativado para carregamento do dashboard');

            console.log('🔄 Carregando dados do dashboard...');

            // ✅ VERIFICAR SE A INSTÂNCIA DO DASHBOARD EXISTE E ESTÁ VÁLIDA
            if (!window.dashboardPage || !this.isDashboardInstanceValid()) {
                console.log('⚠️ Instância do dashboard não encontrada ou inválida, criando nova...');

                // Limpar instância anterior se existir
                if (window.dashboardPage) {
                    try {
                        if (window.dashboardPage.cleanup) {
                            await window.dashboardPage.cleanup();
                        }
                    } catch (cleanupError) {
                        console.warn('⚠️ Erro ao limpar instância anterior:', cleanupError);
                    }
                    window.dashboardPage = null;
                }

                // Criar nova instância
                if (window.DashboardPage) {
                    window.dashboardPage = new window.DashboardPage();
                    console.log('✅ Nova instância do DashboardPage criada');
                } else {
                    console.error('❌ Classe DashboardPage não encontrada');
                    this.constructor.dashboardLoadingLock = false;
                    return;
                }
            }

            // ✅ VERIFICAR SE A INSTÂNCIA JÁ ESTÁ INICIALIZADA
            if (window.dashboardPage.isInitialized && window.dashboardPage.isInitialized()) {
                console.log('✅ Dashboard já está inicializado, atualizando dados...');
                await this.updateDashboardData();
            } else {
                console.log('🔄 Inicializando dashboard...');
                await window.dashboardPage.init();
            }

            console.log('✅ Dashboard carregado com sucesso');

        } catch (error) {
            console.error('❌ Erro ao carregar dados do dashboard:', error);

            // ✅ TENTAR CARREGAR DADOS PADRÃO EM CASO DE ERRO
            try {
                if (window.dashboardPage && window.dashboardPage.loadDashboardStats) {
                    await window.dashboardPage.loadDashboardStats();
                }
            } catch (fallbackError) {
                console.error('❌ Erro no fallback:', fallbackError);
            }
        } finally {
            // ✅ SEMPRE LIBERAR O BLOQUEIO
            this.constructor.dashboardLoadingLock = false;
            console.log('🔓 Bloqueio liberado para carregamento do dashboard');
        }
    }

    // ✅ VERIFICAR SE A INSTÂNCIA DO DASHBOARD É VÁLIDA
    isDashboardInstanceValid() {
        if (!window.dashboardPage) return false;

        // Verificar se tem métodos essenciais
        const hasEssentialMethods = window.dashboardPage.init &&
            window.dashboardPage.cleanup &&
            window.dashboardPage.loadRecentActivities;

        // Verificar se não está em estado de erro
        const isNotInError = !window.dashboardPage.hasError;

        return hasEssentialMethods && isNotInError;
    }

    // ✅ ATUALIZAR DADOS DO DASHBOARD SEM REINICIALIZAR
    async updateDashboardData() {
        try {
            console.log('🔄 Atualizando dados do dashboard...');

            if (window.dashboardPage.loadDashboardStats) {
                await window.dashboardPage.loadDashboardStats();
            }

            if (window.dashboardPage.loadRecentActivities) {
                await window.dashboardPage.loadRecentActivities();
            }

            if (window.dashboardPage.loadEstoqueAlerts) {
                await window.dashboardPage.loadEstoqueAlerts();
            }

            console.log('✅ Dados do dashboard atualizados com sucesso');

        } catch (error) {
            console.error('❌ Erro ao atualizar dados do dashboard:', error);
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
                this.loadDashboardDataApp();
            });
        }
    }

    async loadRelatoriosData() {
        console.log('📊 Carregando dados de relatórios...');

        try {
            // Verificar se a função global está disponível
            if (typeof window.createRelatoriosSimples === 'function') {
                console.log('🆕 Usando função global de relatórios...');
                window.createRelatoriosSimples();
                return;
            }

            // Fallback para versões anteriores
            console.log('🔍 Verificando classes disponíveis...');
            console.log('RelatoriosPageComDadosReais:', typeof window.RelatoriosPageComDadosReais);
            console.log('RelatoriosPageFinal:', typeof window.RelatoriosPageFinal);

            // Limpar instâncias anteriores
            if (window.relatoriosPageComDadosReais) {
                console.log('🗑️ Limpando instância anterior...');
                if (window.relatoriosPageComDadosReais.cleanup) {
                    await window.relatoriosPageComDadosReais.cleanup();
                }
                window.relatoriosPageComDadosReais = null;
            }

            if (window.relatoriosPage) {
                console.log('🗑️ Limpando relatoriosPage anterior...');
                if (window.relatoriosPage.cleanup) {
                    await window.relatoriosPage.cleanup();
                }
                window.relatoriosPage = null;
            }

            // Aguardar um pouco
            await new Promise(resolve => setTimeout(resolve, 500));

            // Tentar criar instância com RelatoriosResponsivos primeiro
            if (typeof window.RelatoriosResponsivos === 'function') {
                console.log('🆕 Criando RelatoriosResponsivos...');
                window.relatoriosPage = new window.RelatoriosResponsivos();
                console.log('✅ RelatoriosResponsivos criado com sucesso');
            } else if (typeof window.RelatoriosPageComDadosReais === 'function') {
                console.log('🆕 Criando RelatoriosPageComDadosReais...');
                window.relatoriosPageComDadosReais = new window.RelatoriosPageComDadosReais();
            } else if (typeof window.RelatoriosPageFinal === 'function') {
                console.log('🆕 Criando RelatoriosPageFinal...');
                window.relatoriosPage = new window.RelatoriosPageFinal();
            } else {
                console.error('❌ Nenhuma classe de relatórios encontrada!');
                console.log('🔍 Verificando classes disponíveis:', {
                    RelatoriosResponsivos: typeof window.RelatoriosResponsivos,
                    RelatoriosPageComDadosReais: typeof window.RelatoriosPageComDadosReais,
                    RelatoriosPageFinal: typeof window.RelatoriosPageFinal,
                    relatoriosResponsivos: typeof window.relatoriosResponsivos
                });

                // Aguardar mais tempo e tentar novamente
                setTimeout(async () => {
                    console.log('🔄 Tentando novamente após delay...');
                    console.log('🔍 Classes disponíveis após delay:', {
                        RelatoriosResponsivos: typeof window.RelatoriosResponsivos,
                        relatoriosResponsivos: typeof window.relatoriosResponsivos
                    });

                    if (typeof window.RelatoriosResponsivos === 'function') {
                        console.log('✅ Classe RelatoriosResponsivos encontrada após delay');
                        window.relatoriosPage = new window.RelatoriosResponsivos();
                    } else if (window.relatoriosResponsivos) {
                        console.log('✅ Instância relatoriosResponsivos encontrada');
                        window.relatoriosPage = window.relatoriosResponsivos;
                    } else {
                        console.error('❌ Classe ainda não encontrada, criando emergência');
                        this.createEmergencyRelatorios();
                    }
                }, 2000);
            }

        } catch (error) {
            console.error('❌ Erro ao carregar relatórios:', error);
            // Criar uma versão de emergência
            this.createEmergencyRelatorios();
        }
    }

    createEmergencyRelatorios() {
        console.log('🚨 Relatórios de emergência DESABILITADOS para evitar conflitos');
        console.log('📊 Usando apenas RelatoriosResponsivos');
        return;
    }

    createSimpleCharts() {
        console.log('📊 Gráficos simples DESABILITADOS para evitar conflitos');
        console.log('📊 Usando apenas RelatoriosResponsivos');
        return;
    }

    updateDashboardStats(data) {
        try {
            console.log('�� Atualizando estatísticas do dashboard...');

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
        const width = window.innerWidth;
        console.log(`🔧 Forçando responsividade - Largura: ${width}px`);

        if (width > 1024) {
            console.log('🖥️ Responsividade forçada: Desktop');
            // Forçar modo desktop
            const sidebar = document.getElementById('sidebar');
            const sidebarToggle = document.getElementById('sidebar-toggle');

            if (sidebar) {
                sidebar.classList.remove('open');
                sidebar.style.transform = 'translateX(0)';
            }

            if (sidebarToggle) {
                sidebarToggle.style.display = 'none';
            }

            // Remover overlay se existir
            this.removeSidebarOverlay();

        } else {
            console.log('📱 Responsividade forçada: Mobile/Tablet');
            // Forçar modo mobile
            const sidebar = document.getElementById('sidebar');
            const sidebarToggle = document.getElementById('sidebar-toggle');

            if (sidebar) {
                sidebar.classList.remove('open');
                sidebar.style.transform = 'translateX(-100%)';
            }

            if (sidebarToggle) {
                sidebarToggle.style.display = 'block';
            }
        }
    }

    // Navegar para uma página específica
    navigateTo(page) {
        try {
            console.log(`🔄 Navegando para: ${page}`);

            // Verificar autenticação
            if (!this.checkUserAuthentication()) {
                console.log('🚫 Usuário não autenticado, redirecionando para login...');
                window.location.replace('/login');
                return;
            }

            // Atualizar hash da URL
            window.location.hash = `#${page}`;

            // Carregar página
            this.loadPage(page);

        } catch (error) {
            console.error(`❌ Erro ao navegar para ${page}:`, error);
        }
    }

    // ✅ VERIFICAR E INICIALIZAR PÁGINAS
    checkAndInitializePages() {
        console.log('🔍 Verificando páginas disponíveis...');

        const pages = [
            { name: 'clientes', class: 'ClientesPage' },
            { name: 'produtos', class: 'ProdutosPage' },
            { name: 'vendas', class: 'VendasPage' },
            { name: 'orcamentos', class: 'OrcamentosPage' },
            { name: 'relatorios', class: 'RelatoriosResponsivos' }
        ];

        pages.forEach(page => {
            const pageClass = window[page.class];
            if (pageClass) {
                console.log(`✅ ${page.name}: ${page.class} encontrada`);
            } else {
                console.warn(`⚠️ ${page.name}: Classe ${page.class} não encontrada`);
            }
        });

        console.log('🔍 Verificação de páginas concluída');
    }

    // ✅ INICIALIZAR PÁGINA ESPECÍFICA
    async initializePage(pageName) {
        try {
            console.log(`🚀 Inicializando página: ${pageName}`);

            // ✅ VERIFICAR SE JÁ EXISTE UMA INSTÂNCIA ATIVA
            const instanceKey = `${pageName}PageInstance`;
            if (window[instanceKey]) {
                console.log(`⚠️ Instância de ${pageName} já existe, fazendo cleanup...`);
                try {
                    // Tentar fazer cleanup da instância existente
                    if (window[instanceKey].cleanup && typeof window[instanceKey].cleanup === 'function') {
                        await window[instanceKey].cleanup();
                        console.log(`✅ Cleanup da instância ${pageName} concluído`);
                    }
                } catch (cleanupError) {
                    console.warn(`⚠️ Erro no cleanup da instância ${pageName}:`, cleanupError);
                }
                // Limpar referência
                window[instanceKey] = null;
            }

            // Mapear nome da página para classe correta
            const pageClassMap = {
                'clientes': 'ClientesPage',
                'produtos': 'ProdutosPage',
                'vendas': 'VendasPage',
                'orcamentos': 'OrcamentosPage',
                'relatorios': 'RelatoriosResponsivos'
            };

            const className = pageClassMap[pageName];
            const pageClass = window[className];

            if (pageClass) {
                console.log(`✅ Classe ${className} encontrada, criando nova instância...`);

                // ✅ CRIAR NOVA INSTÂNCIA
                const pageInstance = new pageClass();

                // ✅ ARMAZENAR REFERÊNCIA GLOBAL
                window[instanceKey] = pageInstance;

                if (pageInstance.init && typeof pageInstance.init === 'function') {
                    console.log(`✅ Inicializando ${pageName}...`);
                    await pageInstance.init();
                    console.log(`✅ ${pageName} inicializada com sucesso!`);
                } else {
                    console.warn(`⚠️ Método init não encontrado em ${pageName}`);
                }
            } else {
                console.warn(`⚠️ Classe ${className} para ${pageName} não encontrada`);
            }
        } catch (error) {
            console.error(`❌ Erro ao inicializar ${pageName}:`, error);
        }
    }

    // ✅ FUNÇÃO DE LOGOUT PARA SEGURANÇA
    logout() {
        try {
            console.log('🚪 Logout iniciado...');

            // ✅ LIMPAR DADOS DE AUTENTICAÇÃO
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');

            // ✅ LIMPAR VARIÁVEIS DE ESTADO
            this.currentPage = null;
            window.currentPage = null;

            console.log('✅ Dados de autenticação limpos');

            // ✅ REDIRECIONAR PARA LOGIN
            window.location.replace('/login?message=logout_success');

        } catch (error) {
            console.error('❌ Erro durante logout:', error);
            // ✅ FORÇAR REDIRECIONAMENTO MESMO COM ERRO
            window.location.replace('/login?message=logout_error');
        }
    }

    // ✅ VERIFICAR SE O USUÁRIO ESTÁ NA PÁGINA DE LOGIN
    isOnLoginPage() {
        return window.location.pathname === '/login';
    }

    // ✅ VERIFICAR SE O USUÁRIO ESTÁ EM ROTA PROTEGIDA
    isOnProtectedRoute() {
        return window.location.pathname === '/dashboard' ||
            window.location.pathname === '/system';
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