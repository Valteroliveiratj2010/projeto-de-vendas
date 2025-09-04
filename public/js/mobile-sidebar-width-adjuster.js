// ===== AJUSTE DE LARGURA DA SIDEBAR PARA MOBILE =====
console.log('📱 AJUSTANDO LARGURA DA SIDEBAR PARA MOBILE...');

class MobileSidebarWidthAdjuster {
    constructor() {
        this.init();
    }

    init() {
        console.log('📱 Inicializando ajuste de largura da sidebar...');

        // Aguardar DOM estar pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.adjustSidebarWidth());
        } else {
            this.adjustSidebarWidth();
        }

        // Monitorar mudanças de tamanho da tela
        window.addEventListener('resize', () => this.adjustSidebarWidth());
    }

    adjustSidebarWidth() {
        console.log('📱 Ajustando largura da sidebar...');

        const isMobile = window.innerWidth <= 1024;

        if (isMobile) {
            console.log('📱 Dispositivo móvel detectado, aplicando largura de 50%...');
            this.applyMobileWidth();
        } else {
            console.log('🖥️ Desktop detectado, mantendo largura padrão...');
            this.applyDesktopWidth();
        }
    }

    applyMobileWidth() {
        console.log('📱 Aplicando largura de 50% para mobile...');

        // Criar ou atualizar CSS para mobile
        const mobileCSS = `
            /* ===== SIDEBAR MOBILE - 50% DA LARGURA ===== */
            @media (max-width: 1024px) {
                :root {
                    --sidebar-width: 50vw !important;
                    --sidebar-width-collapsed: 50vw !important;
                }
                
                #sidebar {
                    width: 50vw !important;
                    max-width: 50vw !important;
                    min-width: 50vw !important;
                }
                
                #sidebar.open {
                    width: 50vw !important;
                    max-width: 50vw !important;
                    min-width: 50vw !important;
                    transform: translateX(0) !important;
                }
                
                #sidebar:not(.open) {
                    transform: translateX(-100%) !important;
                }
                
                .main-content {
                    margin-left: 0 !important;
                    width: 100% !important;
                }
                
                /* Ajustar overlay para cobrir apenas a área da sidebar */
                .sidebar-overlay {
                    width: 50vw !important;
                    left: 0 !important;
                }
                
                /* Ajustar botão hambúrguer para ficar visível */
                .sidebar-toggle {
                    position: fixed !important;
                    top: 20px !important;
                    left: 20px !important;
                    z-index: 1002 !important;
                    display: block !important;
                }
            }
            
            /* ===== SIDEBAR MOBILE PEQUENA - 50% DA LARGURA ===== */
            @media (max-width: 768px) {
                :root {
                    --sidebar-width: 50vw !important;
                    --sidebar-width-collapsed: 50vw !important;
                }
                
                #sidebar {
                    width: 50vw !important;
                    max-width: 50vw !important;
                    min-width: 50vw !important;
                }
                
                #sidebar.open {
                    width: 50vw !important;
                    max-width: 50vw !important;
                    min-width: 50vw !important;
                }
            }
            
            /* ===== SIDEBAR MOBILE MUITO PEQUENA - 50% DA LARGURA ===== */
            @media (max-width: 480px) {
                :root {
                    --sidebar-width: 50vw !important;
                    --sidebar-width-collapsed: 50vw !important;
                }
                
                #sidebar {
                    width: 50vw !important;
                    max-width: 50vw !important;
                    min-width: 50vw !important;
                }
                
                #sidebar.open {
                    width: 50vw !important;
                    max-width: 50vw !important;
                    min-width: 50vw !important;
                }
            }
        `;

        this.injectCSS(mobileCSS, 'mobile-sidebar-width');

        console.log('✅ Largura de 50% aplicada para mobile');
    }

    applyDesktopWidth() {
        console.log('🖥️ Aplicando largura padrão para desktop...');

        // Remover CSS mobile se existir
        this.removeCSS('mobile-sidebar-width');

        console.log('✅ Largura padrão aplicada para desktop');
    }

    injectCSS(css, id) {
        // Remover CSS existente com o mesmo ID
        this.removeCSS(id);

        // Criar novo elemento style
        const style = document.createElement('style');
        style.id = id;
        style.textContent = css;

        // Adicionar ao head
        document.head.appendChild(style);

        console.log(`✅ CSS injetado com ID: ${id}`);
    }

    removeCSS(id) {
        const existingStyle = document.getElementById(id);
        if (existingStyle) {
            existingStyle.remove();
            console.log(`✅ CSS removido com ID: ${id}`);
        }
    }

    // Método para forçar reaplicação
    forceApply() {
        console.log('📱 Forçando reaplicação da largura da sidebar...');
        this.adjustSidebarWidth();
    }
}

// Inicializar ajuste de largura
const mobileSidebarWidthAdjuster = new MobileSidebarWidthAdjuster();

// Expor método globalmente
window.mobileSidebarWidthAdjuster = mobileSidebarWidthAdjuster;

console.log('✅ Ajuste de largura da sidebar para mobile inicializado!'); 