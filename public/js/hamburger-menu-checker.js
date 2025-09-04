// ===== VERIFICAÇÃO E CORREÇÃO DO MENU HAMBÚRGUER =====
console.log('🍔 VERIFICANDO MENU HAMBÚRGUER...');

class HamburgerMenuChecker {
    constructor() {
        this.init();
    }

    init() {
        console.log('🍔 Inicializando verificação do menu hambúrguer...');

        // Aguardar DOM estar pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.checkHamburgerMenu());
        } else {
            this.checkHamburgerMenu();
        }
    }

    checkHamburgerMenu() {
        console.log('🍔 Verificando menu hambúrguer...');

        const sidebarToggle = document.getElementById('sidebar-toggle');
        const sidebar = document.getElementById('sidebar');

        if (!sidebarToggle) {
            console.error('❌ Botão sidebar-toggle não encontrado!');
            this.createHamburgerButton();
            return;
        }

        if (!sidebar) {
            console.error('❌ Sidebar não encontrada!');
            return;
        }

        console.log('✅ Menu hambúrguer encontrado');
        this.setupHamburgerMenu(sidebarToggle, sidebar);
        this.checkResponsiveDisplay();
    }

    createHamburgerButton() {
        console.log('🔧 Criando botão hambúrguer...');

        // Verificar se já existe um botão
        let existingButton = document.querySelector('.sidebar-toggle, #sidebar-toggle');
        if (existingButton) {
            console.log('✅ Botão hambúrguer já existe');
            return;
        }

        // Criar botão hambúrguer
        const button = document.createElement('button');
        button.id = 'sidebar-toggle';
        button.className = 'sidebar-toggle';
        button.setAttribute('aria-label', 'Abrir/Fechar Menu');
        button.setAttribute('aria-expanded', 'false');

        // Adicionar linhas do hambúrguer
        button.innerHTML = `
            <span class="hamburger-line"></span>
        `;

        // Inserir no início do main-content
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.insertBefore(button, mainContent.firstChild);
            console.log('✅ Botão hambúrguer criado');

            // Configurar funcionalidade
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                this.setupHamburgerMenu(button, sidebar);
            }
        }
    }

    setupHamburgerMenu(button, sidebar) {
        console.log('🔧 Configurando funcionalidade do menu hambúrguer...');

        // Remover event listeners existentes
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);

        // Adicionar event listener
        newButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            console.log('🍔 Menu hambúrguer clicado');

            const isOpen = sidebar.classList.contains('open');
            sidebar.classList.toggle('open');

            // Atualizar atributos de acessibilidade
            newButton.setAttribute('aria-expanded', !isOpen);

            // Adicionar/remover classe de estado
            if (sidebar.classList.contains('open')) {
                newButton.classList.add('active');
                console.log('✅ Sidebar aberta');

                // Criar overlay em mobile
                if (window.innerWidth <= 1024) {
                    this.createOverlay(sidebar);
                }
            } else {
                newButton.classList.remove('active');
                console.log('❌ Sidebar fechada');

                // Remover overlay em mobile
                if (window.innerWidth <= 1024) {
                    this.removeOverlay();
                }
            }
        });

        // Fechar sidebar ao clicar fora (mobile)
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 1024 && sidebar.classList.contains('open')) {
                if (!sidebar.contains(e.target) && !newButton.contains(e.target)) {
                    sidebar.classList.remove('open');
                    newButton.classList.remove('active');
                    newButton.setAttribute('aria-expanded', 'false');
                    this.removeOverlay();
                    console.log('🍔 Sidebar fechada ao clicar fora');
                }
            }
        });

        console.log('✅ Funcionalidade do menu hambúrguer configurada');
    }

    createOverlay(sidebar) {
        console.log('🔧 Criando overlay para mobile...');

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
            z-index: 999;
            opacity: 0;
            transition: opacity 0.3s ease;
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

    checkResponsiveDisplay() {
        console.log('📱 Verificando responsividade do menu hambúrguer...');

        const button = document.getElementById('sidebar-toggle');
        if (!button) return;

        // Verificar se está visível em mobile
        const isMobile = window.innerWidth <= 1024;
        const isVisible = window.getComputedStyle(button).display !== 'none';

        console.log(`📱 Mobile: ${isMobile}, Visível: ${isVisible}`);

        if (isMobile && !isVisible) {
            console.log('⚠️ Menu hambúrguer não está visível em mobile!');
            this.forceMobileDisplay();
        }
    }

    forceMobileDisplay() {
        console.log('🔧 Forçando exibição em mobile...');

        const style = document.createElement('style');
        style.textContent = `
            @media (max-width: 1024px) {
                .sidebar-toggle {
                    display: block !important;
                    position: fixed !important;
                    top: 20px !important;
                    left: 20px !important;
                    z-index: 1000 !important;
                    width: 50px !important;
                    height: 50px !important;
                    background: linear-gradient(135deg, #2563EB 0%, #1d4ed8 100%) !important;
                    border: none !important;
                    border-radius: 50% !important;
                    cursor: pointer !important;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12) !important;
                }
                
                .sidebar-toggle::before,
                .sidebar-toggle::after,
                .sidebar-toggle .hamburger-line {
                    content: '' !important;
                    position: absolute !important;
                    left: 50% !important;
                    width: 24px !important;
                    height: 3px !important;
                    background: white !important;
                    border-radius: 2px !important;
                    transform: translateX(-50%) !important;
                }
                
                .sidebar-toggle::before {
                    top: calc(50% - 9px) !important;
                }
                
                .sidebar-toggle .hamburger-line {
                    top: 50% !important;
                    transform: translateX(-50%) translateY(-50%) !important;
                }
                
                .sidebar-toggle::after {
                    bottom: calc(50% - 9px) !important;
                }
                
                .sidebar-toggle:hover {
                    transform: translateY(-2px) scale(1.05) !important;
                }
                
                .sidebar-toggle.active::before {
                    top: 50% !important;
                    transform: translateX(-50%) translateY(-50%) rotate(45deg) !important;
                }
                
                .sidebar-toggle.active .hamburger-line {
                    opacity: 0 !important;
                }
                
                .sidebar-toggle.active::after {
                    bottom: 50% !important;
                    transform: translateX(-50%) translateY(50%) rotate(-45deg) !important;
                }
            }
            
            @media (max-width: 768px) {
                .sidebar-toggle {
                    top: 15px !important;
                    left: 15px !important;
                    width: 45px !important;
                    height: 45px !important;
                }
            }
            
            @media (max-width: 480px) {
                .sidebar-toggle {
                    top: 10px !important;
                    left: 10px !important;
                    width: 40px !important;
                    height: 40px !important;
                }
                
                .sidebar-toggle::before,
                .sidebar-toggle::after,
                .sidebar-toggle .hamburger-line {
                    width: 20px !important;
                }
            }
        `;

        document.head.appendChild(style);
        console.log('✅ Estilos forçados aplicados');
    }
}

// Inicializar verificação
const hamburgerChecker = new HamburgerMenuChecker();

// Expor métodos globalmente
window.hamburgerChecker = hamburgerChecker;

console.log('✅ Verificação do menu hambúrguer inicializada!'); 