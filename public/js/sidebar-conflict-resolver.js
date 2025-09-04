// ===== RESOLUÇÃO DE CONFLITOS DA SIDEBAR =====
console.log('🔧 RESOLVENDO CONFLITOS DA SIDEBAR...');

class SidebarConflictResolver {
    constructor() {
        this.init();
    }

    init() {
        console.log('🔧 Inicializando resolução de conflitos da sidebar...');

        // Aguardar DOM estar pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.resolveConflicts());
        } else {
            this.resolveConflicts();
        }
    }

    resolveConflicts() {
        console.log('🔧 Resolvendo conflitos da sidebar...');

        // Aguardar um pouco para garantir que todos os scripts carregaram
        setTimeout(() => {
            this.checkAndFixSidebarToggle();
            this.ensureSingleEventListener();
        }, 500);
    }

    checkAndFixSidebarToggle() {
        console.log('🔧 Verificando botão sidebar-toggle...');

        const sidebarToggle = document.getElementById('sidebar-toggle');
        const sidebar = document.getElementById('sidebar');

        if (!sidebarToggle) {
            console.log('❌ Botão sidebar-toggle não encontrado');
            return;
        }

        if (!sidebar) {
            console.log('❌ Sidebar não encontrada');
            return;
        }

        console.log('✅ Botão e sidebar encontrados');

        // Verificar se o botão tem funcionalidade
        if (!sidebarToggle._hasClickListener) {
            console.log('🔧 Botão não tem funcionalidade, configurando...');
            this.setupSidebarToggleFunctionality(sidebarToggle, sidebar);
        }
    }

    ensureSingleEventListener() {
        console.log('🔧 Garantindo listener único...');

        const sidebarToggle = document.getElementById('sidebar-toggle');
        if (!sidebarToggle) return;

        // Remover todos os event listeners existentes
        const newButton = sidebarToggle.cloneNode(true);
        sidebarToggle.parentNode.replaceChild(newButton, sidebarToggle);

        console.log('✅ Event listeners removidos, configurando novo...');

        // Configurar funcionalidade no novo botão
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            this.setupSidebarToggleFunctionality(newButton, sidebar);
        }
    }

    setupSidebarToggleFunctionality(button, sidebar) {
        console.log('🔧 Configurando funcionalidade da sidebar...');

        // Verificar se já tem listener
        if (button._hasClickListener) {
            console.log('✅ Botão já tem funcionalidade');
            return;
        }

        // Adicionar event listener principal
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            console.log('🍔 Botão sidebar-toggle clicado');

            const isOpen = sidebar.classList.contains('open');
            sidebar.classList.toggle('open');

            // Atualizar atributos de acessibilidade
            button.setAttribute('aria-expanded', !isOpen);

            // Adicionar/remover classe de estado
            if (sidebar.classList.contains('open')) {
                button.classList.add('active');
                console.log('✅ Sidebar aberta');

                // Criar overlay em mobile
                if (window.innerWidth <= 1024) {
                    this.createOverlay(sidebar);
                }
            } else {
                button.classList.remove('active');
                console.log('❌ Sidebar fechada');

                // Remover overlay em mobile
                if (window.innerWidth <= 1024) {
                    this.removeOverlay();
                }
            }
        });

        // Adicionar estados de hover
        button.addEventListener('mouseenter', () => {
            if (!sidebar.classList.contains('open')) {
                button.classList.add('hover');
            }
        });

        button.addEventListener('mouseleave', () => {
            button.classList.remove('hover');
        });

        // Adicionar estado de pressionado
        button.addEventListener('mousedown', () => {
            button.classList.add('pressed');
        });

        button.addEventListener('mouseup', () => {
            setTimeout(() => {
                button.classList.remove('pressed');
            }, 150);
        });

        // Marcar como configurado
        button._hasClickListener = true;

        console.log('✅ Funcionalidade da sidebar configurada');
    }

    createOverlay(sidebar) {
        console.log('🔧 Criando overlay...');

        // Remover overlay existente
        this.removeOverlay();

        // Criar overlay
        const overlay = document.createElement('div');
        overlay.id = 'sidebar-overlay';
        overlay.className = 'sidebar-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 1001;
            opacity: 0;
            transition: opacity 0.3s ease;
            cursor: pointer;
        `;

        // Adicionar ao body
        document.body.appendChild(overlay);

        // Animar entrada
        setTimeout(() => {
            overlay.style.opacity = '1';
        }, 10);

        // Event listener para fechar
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            const button = document.getElementById('sidebar-toggle');
            if (button) {
                button.classList.remove('active');
                button.setAttribute('aria-expanded', 'false');
            }
            this.removeOverlay();
        });

        console.log('✅ Overlay criado');
    }

    removeOverlay() {
        const overlay = document.getElementById('sidebar-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => {
                if (overlay.parentElement) {
                    overlay.remove();
                }
            }, 300);
            console.log('✅ Overlay removido');
        }
    }
}

// Inicializar resolução de conflitos
const sidebarConflictResolver = new SidebarConflictResolver();

console.log('✅ Resolução de conflitos da sidebar inicializada!'); 