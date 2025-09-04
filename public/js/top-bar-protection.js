// ===== PREVENÇÃO DE REMOÇÃO DO TOP-BAR =====
console.log('🛡️ PREVENÇÃO DE REMOÇÃO DO TOP-BAR...');

class TopBarProtection {
    constructor() {
        this.init();
    }

    init() {
        console.log('🛡️ Inicializando proteção do top-bar...');

        // Aguardar DOM estar pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupProtection());
        } else {
            this.setupProtection();
        }
    }

    setupProtection() {
        console.log('🛡️ Configurando proteção do top-bar...');

        // Monitorar remoções do top-bar
        this.monitorTopBarRemoval();

        // Proteger top-bar existente
        this.protectExistingTopBar();
    }

    monitorTopBarRemoval() {
        console.log('🛡️ Monitorando remoções do top-bar...');

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.removedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Verificar se o top-bar foi removido
                        if (node.classList && node.classList.contains('top-bar')) {
                            console.log('🚨 TOP-BAR REMOVIDO! Restaurando...');
                            this.restoreTopBar();
                        }

                        // Verificar se o botão sidebar-toggle foi removido
                        if (node.id === 'sidebar-toggle') {
                            console.log('🚨 BOTÃO SIDEBAR-TOGGLE REMOVIDO! Restaurando...');
                            this.restoreSidebarToggle();
                        }
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        console.log('✅ Monitoramento de remoções configurado');
    }

    protectExistingTopBar() {
        console.log('🛡️ Protegendo top-bar existente...');

        const topBar = document.querySelector('.top-bar');
        if (topBar) {
            // Marcar como protegido
            topBar.setAttribute('data-protected', 'true');

            // Verificar se tem o botão sidebar-toggle
            const sidebarToggle = topBar.querySelector('#sidebar-toggle');
            if (!sidebarToggle) {
                console.log('🔧 Botão sidebar-toggle não encontrado no top-bar, criando...');
                this.createSidebarToggleInTopBar(topBar);
            }

            console.log('✅ Top-bar protegido');
        }
    }

    restoreTopBar() {
        console.log('🛡️ Restaurando top-bar...');

        // Aguardar um pouco para evitar conflitos
        setTimeout(() => {
            const mainContent = document.querySelector('.main-content');
            if (!mainContent) {
                console.error('❌ Main content não encontrado');
                return;
            }

            // Verificar se já existe um top-bar
            const existingTopBar = document.querySelector('.top-bar');
            if (existingTopBar) {
                console.log('✅ Top-bar já existe');
                return;
            }

            // Criar top-bar
            const topBar = document.createElement('div');
            topBar.className = 'top-bar';
            topBar.setAttribute('data-protected', 'true');

            topBar.innerHTML = `
                <div class="top-bar-left">
                    <button id="sidebar-toggle" class="sidebar-toggle" aria-label="Abrir/Fechar Menu" aria-expanded="false">
                        <i class="fas fa-bars"></i>
                    </button>
                    <h1 id="page-title">Dashboard</h1>
                </div>
                <div class="top-bar-right">
                    <div class="top-bar-actions">
                        <button id="sync-btn" class="action-btn" title="Sincronizar">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                        <button id="notifications-btn" class="action-btn" title="Notificações">
                            <i class="fas fa-bell"></i>
                        </button>
                    </div>
                </div>
            `;

            // Inserir no início do main-content
            mainContent.insertBefore(topBar, mainContent.firstChild);

            console.log('✅ Top-bar restaurado');

            // Configurar funcionalidade do botão
            const button = document.getElementById('sidebar-toggle');
            if (button) {
                this.setupSidebarToggleFunctionality(button);
            }
        }, 100);
    }

    restoreSidebarToggle() {
        console.log('🛡️ Restaurando botão sidebar-toggle...');

        setTimeout(() => {
            const topBar = document.querySelector('.top-bar');
            if (topBar) {
                this.createSidebarToggleInTopBar(topBar);
            } else {
                console.log('❌ Top-bar não encontrado para restaurar botão');
            }
        }, 100);
    }

    createSidebarToggleInTopBar(topBar) {
        console.log('🔧 Criando botão sidebar-toggle no top-bar...');

        // Verificar se já existe
        const existingButton = topBar.querySelector('#sidebar-toggle');
        if (existingButton) {
            console.log('✅ Botão sidebar-toggle já existe no top-bar');
            return;
        }

        // Criar botão
        const button = document.createElement('button');
        button.id = 'sidebar-toggle';
        button.className = 'sidebar-toggle';
        button.setAttribute('aria-label', 'Abrir/Fechar Menu');
        button.setAttribute('aria-expanded', 'false');

        // Adicionar ícone
        button.innerHTML = '<i class="fas fa-bars"></i>';

        // Inserir no top-bar
        const topBarLeft = topBar.querySelector('.top-bar-left');
        if (topBarLeft) {
            topBarLeft.insertBefore(button, topBarLeft.firstChild);
        } else {
            topBar.insertBefore(button, topBar.firstChild);
        }

        console.log('✅ Botão sidebar-toggle criado no top-bar');

        // Configurar funcionalidade
        this.setupSidebarToggleFunctionality(button);
    }

    setupSidebarToggleFunctionality(button) {
        console.log('🔧 Configurando funcionalidade do botão sidebar-toggle...');

        // Verificar se já tem event listener
        if (button._hasClickListener) {
            console.log('✅ Botão já tem funcionalidade');
            return;
        }

        // Adicionar event listener
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            console.log('🍔 Botão sidebar-toggle clicado');

            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                const isOpen = sidebar.classList.contains('open');
                sidebar.classList.toggle('open');

                // Atualizar atributos de acessibilidade
                button.setAttribute('aria-expanded', !isOpen);

                // Adicionar/remover classe de estado
                if (sidebar.classList.contains('open')) {
                    button.classList.add('active');
                    console.log('✅ Sidebar aberta');
                } else {
                    button.classList.remove('active');
                    console.log('❌ Sidebar fechada');
                }
            }
        });

        // Marcar como configurado
        button._hasClickListener = true;

        console.log('✅ Funcionalidade do botão sidebar-toggle configurada');
    }
}

// Inicializar proteção
const topBarProtection = new TopBarProtection();

console.log('✅ Proteção do top-bar inicializada!'); 