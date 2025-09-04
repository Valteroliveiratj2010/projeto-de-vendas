// ===== GARANTIR FUNCIONAMENTO DA SIDEBAR EM MOBILE =====
console.log('📱 GARANTINDO FUNCIONAMENTO DA SIDEBAR EM MOBILE...');

class MobileSidebarManager {
    constructor() {
        this.init();
    }

    init() {
        console.log('📱 Inicializando gerenciador de sidebar mobile...');

        // Aguardar DOM estar pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupMobileSidebar());
        } else {
            this.setupMobileSidebar();
        }
    }

    setupMobileSidebar() {
        console.log('📱 Configurando sidebar para mobile...');

        const sidebar = document.getElementById('sidebar');
        if (!sidebar) {
            console.error('❌ Sidebar não encontrada');
            return;
        }

        // Aplicar estilos específicos para mobile
        this.applyMobileStyles();

        // Configurar comportamento responsivo
        this.setupResponsiveBehavior();

        // Configurar navegação
        this.setupMobileNavigation();

        console.log('✅ Sidebar mobile configurada');
    }

    applyMobileStyles() {
        console.log('📱 Aplicando estilos mobile...');

        const style = document.createElement('style');
        style.textContent = `
            /* ===== SIDEBAR MOBILE - MESMA COR DO DESKTOP ===== */
            @media (max-width: 1024px) {
                .sidebar {
                    position: fixed !important;
                    top: 0 !important;
                    left: -100% !important;
                    width: 280px !important;
                    height: 100vh !important;
                    z-index: 1002 !important; /* ✅ Z-INDEX MAIOR QUE O MENU HAMBÚRGUER */
                    transition: left 0.3s ease !important;
                    background: var(--color-white) !important; /* ✅ MESMA COR DO DESKTOP */
                    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.3) !important;
                    overflow-y: auto !important;
                    border-right: 1px solid var(--color-gray-200) !important; /* ✅ MESMA BORDA DO DESKTOP */
                }
                
                .sidebar.open {
                    left: 0 !important;
                    z-index: 1002 !important; /* ✅ MANTÉM Z-INDEX ALTO QUANDO ABERTA */
                }
                
                /* ===== MENU HAMBÚRGUER - Z-INDEX MENOR ===== */
                .sidebar-toggle {
                    z-index: 1000 !important; /* ✅ MENOR QUE A SIDEBAR */
                }
                
                /* ===== OCULTAR MENU QUANDO SIDEBAR ABERTA ===== */
                .sidebar.open ~ .main-content .sidebar-toggle,
                .sidebar.open + .main-content .sidebar-toggle {
                    opacity: 0 !important;
                    visibility: hidden !important;
                    pointer-events: none !important;
                    transition: opacity 0.3s ease, visibility 0.3s ease !important;
                }
                
                /* ===== MOSTRAR MENU QUANDO SIDEBAR FECHADA ===== */
                .sidebar:not(.open) ~ .main-content .sidebar-toggle,
                .sidebar:not(.open) + .main-content .sidebar-toggle {
                    opacity: 1 !important;
                    visibility: visible !important;
                    pointer-events: auto !important;
                    transition: opacity 0.3s ease, visibility 0.3s ease !important;
                }
                
                .sidebar-header {
                    padding: 20px !important;
                    border-bottom: 1px solid var(--color-gray-200) !important; /* ✅ MESMA BORDA DO DESKTOP */
                    background: var(--color-white) !important; /* ✅ MESMA COR DO DESKTOP */
                }
                
                .sidebar-nav {
                    padding: 20px 0 !important;
                    background: var(--color-white) !important; /* ✅ MESMA COR DO DESKTOP */
                }
                
                .nav-item {
                    margin: 0 !important;
                    padding: 0 !important;
                }
                
                .nav-item a {
                    padding: 15px 20px !important;
                    display: flex !important;
                    align-items: center !important;
                    gap: 12px !important;
                    color: var(--color-gray-700) !important; /* ✅ COR DE TEXTO DO DESKTOP */
                    text-decoration: none !important;
                    transition: all 0.3s ease !important;
                    border-left: 3px solid transparent !important;
                    background: var(--color-white) !important; /* ✅ MESMA COR DO DESKTOP */
                }
                
                .nav-item a:hover {
                    background: var(--color-gray-50) !important; /* ✅ HOVER DO DESKTOP */
                    color: var(--color-gray-900) !important;
                    border-left-color: var(--color-primary) !important;
                }
                
                .nav-item.active a {
                    background: var(--color-primary) !important; /* ✅ ATIVO DO DESKTOP */
                    color: white !important;
                    border-left-color: var(--color-primary) !important;
                }
                
                .nav-item i {
                    font-size: 18px !important;
                    width: 20px !important;
                    text-align: center !important;
                    color: inherit !important;
                }
                
                .sidebar-footer {
                    position: absolute !important;
                    bottom: 0 !important;
                    left: 0 !important;
                    right: 0 !important;
                    padding: 20px !important;
                    border-top: 1px solid var(--color-gray-200) !important; /* ✅ MESMA BORDA DO DESKTOP */
                    background: var(--color-white) !important; /* ✅ MESMA COR DO DESKTOP */
                }
                
                .user-menu {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: space-between !important;
                    gap: 10px !important;
                }
                
                .user-info {
                    display: flex !important;
                    align-items: center !important;
                    gap: 10px !important;
                    color: var(--color-gray-700) !important; /* ✅ COR DE TEXTO DO DESKTOP */
                }
                
                .logout-btn {
                    background: var(--color-red-50) !important; /* ✅ COR DE FUNDO DO DESKTOP */
                    color: var(--color-red-600) !important; /* ✅ COR DE TEXTO DO DESKTOP */
                    border: 1px solid var(--color-red-200) !important; /* ✅ COR DE BORDA DO DESKTOP */
                    padding: 8px 12px !important;
                    border-radius: 6px !important;
                    cursor: pointer !important;
                    transition: all 0.3s ease !important;
                    display: flex !important;
                    align-items: center !important;
                    gap: 6px !important;
                    font-size: 12px !important;
                }
                
                .logout-btn:hover {
                    background: var(--color-red-100) !important; /* ✅ HOVER DO DESKTOP */
                    border-color: var(--color-red-300) !important;
                }
                
                /* ===== LOGO ===== */
                .logo {
                    color: var(--color-primary) !important; /* ✅ MESMA COR DO DESKTOP */
                    background: var(--color-white) !important; /* ✅ MESMA COR DO DESKTOP */
                }
                
                .logo i {
                    color: var(--color-primary) !important; /* ✅ MESMA COR DO DESKTOP */
                }
                
                .logo span {
                    color: var(--color-primary) !important; /* ✅ MESMA COR DO DESKTOP */
                }
            }
            
            /* ===== OVERLAY MOBILE ===== */
            .sidebar-overlay {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: 100% !important;
                background: rgba(0, 0, 0, 0.5) !important;
                z-index: 1000 !important;
                opacity: 0 !important;
                transition: opacity 0.3s ease !important;
                pointer-events: none !important;
            }
            
            .sidebar-overlay.active {
                opacity: 1 !important;
                pointer-events: auto !important;
            }
            
            /* ===== ANIMAÇÕES ===== */
            @keyframes slideIn {
                from {
                    transform: translateX(-100%);
                }
                to {
                    transform: translateX(0);
                }
            }
            
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                }
                to {
                    transform: translateX(-100%);
                }
            }
            
            .sidebar.slide-in {
                animation: slideIn 0.3s ease forwards !important;
            }
            
            .sidebar.slide-out {
                animation: slideOut 0.3s ease forwards !important;
            }
        `;

        document.head.appendChild(style);
        console.log('✅ Estilos mobile aplicados com cores do desktop');
    }

    setupResponsiveBehavior() {
        console.log('📱 Configurando comportamento responsivo...');

        // Fechar sidebar ao redimensionar para desktop
        window.addEventListener('resize', () => {
            const sidebar = document.getElementById('sidebar');
            const button = document.getElementById('sidebar-toggle');

            if (window.innerWidth > 1024) {
                // Desktop: sempre visível
                if (sidebar) {
                    sidebar.classList.remove('open');
                    sidebar.style.left = '0';
                    sidebar.style.position = 'relative';
                }
                if (button) {
                    button.classList.remove('active');
                    button.setAttribute('aria-expanded', 'false');
                }
                this.removeOverlay();
            } else {
                // Mobile: oculta por padrão
                if (sidebar) {
                    sidebar.style.position = 'fixed';
                    sidebar.style.left = '-100%';
                }
            }
        });

        console.log('✅ Comportamento responsivo configurado');
    }

    setupMobileNavigation() {
        console.log('📱 Configurando navegação mobile...');

        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();

                const page = item.dataset.page;
                console.log(`📱 Navegando para: ${page}`);

                // Fechar sidebar após navegação
                const sidebar = document.getElementById('sidebar');
                const button = document.getElementById('sidebar-toggle');

                if (sidebar && sidebar.classList.contains('open')) {
                    sidebar.classList.remove('open');
                    if (button) {
                        button.classList.remove('active');
                        button.setAttribute('aria-expanded', 'false');
                    }
                    this.removeOverlay();
                    console.log('📱 Sidebar fechada após navegação');
                }
            });
        });

        console.log('✅ Navegação mobile configurada');
    }

    removeOverlay() {
        const overlay = document.querySelector('.sidebar-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => {
                if (overlay.parentElement) {
                    overlay.remove();
                }
            }, 300);
        }
    }
}

// Inicializar gerenciador
const mobileSidebarManager = new MobileSidebarManager();

// Expor métodos globalmente
window.mobileSidebarManager = mobileSidebarManager;

console.log('✅ Gerenciador de sidebar mobile inicializado!'); 