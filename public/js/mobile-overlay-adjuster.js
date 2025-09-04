// ===== AJUSTE DO OVERLAY PARA SIDEBAR MOBILE =====
console.log('🖤 AJUSTANDO OVERLAY PARA SIDEBAR MOBILE...');

class MobileOverlayAdjuster {
    constructor() {
        this.init();
    }

    init() {
        console.log('🖤 Inicializando ajuste do overlay...');

        // Aguardar DOM estar pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupOverlayAdjustment());
        } else {
            this.setupOverlayAdjustment();
        }
    }

    setupOverlayAdjustment() {
        console.log('🖤 Configurando ajuste do overlay...');

        // Monitorar criação de overlays
        this.monitorOverlayCreation();

        // Ajustar overlay existente se houver
        this.adjustExistingOverlay();
    }

    monitorOverlayCreation() {
        console.log('🖤 Monitorando criação de overlays...');

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Verificar se é um overlay
                        if (node.id === 'sidebar-overlay' ||
                            (node.classList && node.classList.contains('sidebar-overlay'))) {
                            console.log('🖤 Overlay detectado, ajustando...');
                            setTimeout(() => this.adjustOverlay(node), 10);
                        }
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        console.log('✅ Monitoramento de overlays configurado');
    }

    adjustExistingOverlay() {
        console.log('🖤 Ajustando overlay existente...');

        const overlay = document.getElementById('sidebar-overlay');
        if (overlay) {
            this.adjustOverlay(overlay);
        }
    }

    adjustOverlay(overlay) {
        console.log('🖤 Ajustando overlay...');

        const isMobile = window.innerWidth <= 1024;

        if (isMobile) {
            console.log('📱 Aplicando ajustes mobile ao overlay...');

            // Ajustar largura para 50% da tela
            overlay.style.width = '50vw';
            overlay.style.left = '0';
            overlay.style.right = 'auto';

            // Garantir que o overlay cubra apenas a área da sidebar
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.height = '100vh';
            overlay.style.zIndex = '1001';

            console.log('✅ Overlay ajustado para mobile (50% da largura)');
        } else {
            console.log('🖥️ Aplicando ajustes desktop ao overlay...');

            // Restaurar largura completa para desktop
            overlay.style.width = '100vw';
            overlay.style.left = '0';
            overlay.style.right = 'auto';

            console.log('✅ Overlay ajustado para desktop (100% da largura)');
        }
    }

    // Método para forçar reajuste
    forceAdjust() {
        console.log('🖤 Forçando reajuste do overlay...');
        this.adjustExistingOverlay();
    }
}

// Inicializar ajuste do overlay
const mobileOverlayAdjuster = new MobileOverlayAdjuster();

// Expor método globalmente
window.mobileOverlayAdjuster = mobileOverlayAdjuster;

console.log('✅ Ajuste do overlay para mobile inicializado!'); 