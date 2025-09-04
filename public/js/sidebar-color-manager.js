// ===== GARANTIR CORES DA SIDEBAR MOBILE =====
console.log('🎨 GARANTINDO CORES DA SIDEBAR MOBILE...');

class SidebarColorManager {
    constructor() {
        this.init();
    }

    init() {
        console.log('🎨 Inicializando gerenciador de cores da sidebar...');

        // Aguardar DOM estar pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.applySidebarColors());
        } else {
            this.applySidebarColors();
        }
    }

    applySidebarColors() {
        console.log('🎨 Aplicando cores da sidebar mobile...');

        const style = document.createElement('style');
        style.textContent = `
            /* ===== FORÇAR CORES DA SIDEBAR MOBILE ===== */
            @media (max-width: 1024px) {
                /* ===== SIDEBAR PRINCIPAL ===== */
                .sidebar,
                #sidebar {
                    background: var(--color-white) !important;
                    background-color: var(--color-white) !important;
                    color: var(--color-gray-900) !important;
                }
                
                /* ===== HEADER DA SIDEBAR ===== */
                .sidebar-header,
                .sidebar .sidebar-header {
                    background: var(--color-white) !important;
                    background-color: var(--color-white) !important;
                    border-bottom: 1px solid var(--color-gray-200) !important;
                    color: var(--color-gray-900) !important;
                }
                
                /* ===== NAVEGAÇÃO DA SIDEBAR ===== */
                .sidebar-nav,
                .sidebar .sidebar-nav {
                    background: var(--color-white) !important;
                    background-color: var(--color-white) !important;
                    color: var(--color-gray-900) !important;
                }
                
                /* ===== ITENS DE NAVEGAÇÃO ===== */
                .nav-item,
                .sidebar .nav-item {
                    background: var(--color-white) !important;
                    background-color: var(--color-white) !important;
                }
                
                .nav-item a,
                .sidebar .nav-item a {
                    background: var(--color-white) !important;
                    background-color: var(--color-white) !important;
                    color: var(--color-gray-700) !important;
                    border-left: 3px solid transparent !important;
                }
                
                .nav-item a:hover,
                .sidebar .nav-item a:hover {
                    background: var(--color-gray-50) !important;
                    background-color: var(--color-gray-50) !important;
                    color: var(--color-gray-900) !important;
                    border-left-color: var(--color-primary) !important;
                }
                
                .nav-item.active a,
                .sidebar .nav-item.active a {
                    background: var(--color-primary) !important;
                    background-color: var(--color-primary) !important;
                    color: white !important;
                    border-left-color: var(--color-primary) !important;
                }
                
                /* ===== ÍCONES ===== */
                .nav-item i,
                .sidebar .nav-item i {
                    color: inherit !important;
                }
                
                /* ===== FOOTER DA SIDEBAR ===== */
                .sidebar-footer,
                .sidebar .sidebar-footer {
                    background: var(--color-white) !important;
                    background-color: var(--color-white) !important;
                    border-top: 1px solid var(--color-gray-200) !important;
                    color: var(--color-gray-900) !important;
                }
                
                /* ===== MENU DO USUÁRIO ===== */
                .user-menu,
                .sidebar .user-menu {
                    background: var(--color-white) !important;
                    background-color: var(--color-white) !important;
                    color: var(--color-gray-900) !important;
                }
                
                .user-info,
                .sidebar .user-info {
                    background: var(--color-white) !important;
                    background-color: var(--color-white) !important;
                    color: var(--color-gray-700) !important;
                }
                
                /* ===== BOTÃO DE LOGOUT ===== */
                .logout-btn,
                .sidebar .logout-btn {
                    background: var(--color-red-50) !important;
                    background-color: var(--color-red-50) !important;
                    color: var(--color-red-600) !important;
                    border: 1px solid var(--color-red-200) !important;
                }
                
                .logout-btn:hover,
                .sidebar .logout-btn:hover {
                    background: var(--color-red-100) !important;
                    background-color: var(--color-red-100) !important;
                    border-color: var(--color-red-300) !important;
                }
                
                /* ===== LOGO ===== */
                .logo,
                .sidebar .logo {
                    background: var(--color-white) !important;
                    background-color: var(--color-white) !important;
                    color: var(--color-primary) !important;
                }
                
                .logo i,
                .sidebar .logo i {
                    color: var(--color-primary) !important;
                }
                
                .logo span,
                .sidebar .logo span {
                    color: var(--color-primary) !important;
                }
                
                /* ===== REMOVER GRADIENTES ESCUROS ===== */
                .sidebar,
                #sidebar,
                .sidebar-header,
                .sidebar-nav,
                .nav-item,
                .nav-item a,
                .sidebar-footer,
                .user-menu,
                .user-info,
                .logo {
                    background-image: none !important;
                    background: var(--color-white) !important;
                    background-color: var(--color-white) !important;
                }
                
                /* ===== GARANTIR BORDAS CORRETAS ===== */
                .sidebar,
                #sidebar {
                    border-right: 1px solid var(--color-gray-200) !important;
                }
                
                .sidebar-header {
                    border-bottom: 1px solid var(--color-gray-200) !important;
                }
                
                .sidebar-footer {
                    border-top: 1px solid var(--color-gray-200) !important;
                }
            }
            
            /* ===== MOBILE PEQUENO ===== */
            @media (max-width: 768px) {
                .sidebar,
                #sidebar {
                    background: var(--color-white) !important;
                    background-color: var(--color-white) !important;
                }
            }
            
            /* ===== MOBILE MUITO PEQUENO ===== */
            @media (max-width: 480px) {
                .sidebar,
                #sidebar {
                    background: var(--color-white) !important;
                    background-color: var(--color-white) !important;
                }
            }
        `;

        document.head.appendChild(style);
        console.log('✅ Cores da sidebar mobile forçadas com sucesso!');

        // Aplicar cores diretamente aos elementos
        this.applyColorsToElements();
    }

    applyColorsToElements() {
        console.log('🎨 Aplicando cores diretamente aos elementos...');

        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            // Aplicar cores diretamente
            sidebar.style.setProperty('background', 'var(--color-white)', 'important');
            sidebar.style.setProperty('background-color', 'var(--color-white)', 'important');
            sidebar.style.setProperty('color', 'var(--color-gray-900)', 'important');

            // Aplicar aos filhos
            const elements = sidebar.querySelectorAll('*');
            elements.forEach(element => {
                if (element.classList.contains('nav-item') ||
                    element.classList.contains('sidebar-header') ||
                    element.classList.contains('sidebar-nav') ||
                    element.classList.contains('sidebar-footer') ||
                    element.classList.contains('user-menu') ||
                    element.classList.contains('user-info') ||
                    element.classList.contains('logo')) {

                    element.style.setProperty('background', 'var(--color-white)', 'important');
                    element.style.setProperty('background-color', 'var(--color-white)', 'important');
                }
            });

            console.log('✅ Cores aplicadas diretamente aos elementos');
        }
    }
}

// Inicializar gerenciador de cores
const sidebarColorManager = new SidebarColorManager();

// Expor métodos globalmente
window.sidebarColorManager = sidebarColorManager;

console.log('✅ Gerenciador de cores da sidebar inicializado!'); 