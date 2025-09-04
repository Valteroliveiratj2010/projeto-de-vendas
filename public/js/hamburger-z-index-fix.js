// ===== CORREÇÃO DO Z-INDEX DO MENU HAMBÚRGUER =====
console.log('🔧 CORRIGINDO Z-INDEX DO MENU HAMBÚRGUER...');

class HamburgerZIndexFix {
    constructor() {
        this.init();
    }

    init() {
        console.log('🔧 Inicializando correção do z-index...');

        // Aguardar DOM estar pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.fixZIndex());
        } else {
            this.fixZIndex();
        }
    }

    fixZIndex() {
        console.log('🔧 Aplicando correção do z-index...');

        const style = document.createElement('style');
        style.textContent = `
            /* ===== CORREÇÃO DO Z-INDEX DO MENU HAMBÚRGUER ===== */
            
            /* ===== SIDEBAR - Z-INDEX MAIOR ===== */
            .sidebar,
            #sidebar {
                z-index: 1002 !important; /* ✅ MAIOR QUE O MENU HAMBÚRGUER */
            }
            
            /* ===== MENU HAMBÚRGUER - Z-INDEX MENOR ===== */
            .sidebar-toggle,
            #sidebar-toggle {
                z-index: 1000 !important; /* ✅ MENOR QUE A SIDEBAR */
            }
            
            /* ===== OVERLAY - Z-INDEX INTERMEDIÁRIO ===== */
            .sidebar-overlay {
                z-index: 1001 !important; /* ✅ ENTRE O MENU E A SIDEBAR */
            }
            
            /* ===== RESPONSIVIDADE ===== */
            @media (max-width: 1024px) {
                /* ===== SIDEBAR MOBILE ===== */
                .sidebar,
                #sidebar {
                    z-index: 1002 !important; /* ✅ SEMPRE ACIMA DO MENU */
                }
                
                .sidebar.open,
                #sidebar.open {
                    z-index: 1002 !important; /* ✅ MANTÉM Z-INDEX ALTO QUANDO ABERTA */
                }
                
                /* ===== MENU HAMBÚRGUER MOBILE ===== */
                .sidebar-toggle,
                #sidebar-toggle {
                    z-index: 1000 !important; /* ✅ SEMPRE ABAIXO DA SIDEBAR */
                }
                
                /* ===== OVERLAY MOBILE ===== */
                .sidebar-overlay {
                    z-index: 1001 !important; /* ✅ ENTRE O MENU E A SIDEBAR */
                }
            }
            
            /* ===== TABLET ===== */
            @media (max-width: 768px) {
                .sidebar,
                #sidebar {
                    z-index: 1002 !important;
                }
                
                .sidebar-toggle,
                #sidebar-toggle {
                    z-index: 1000 !important;
                }
                
                .sidebar-overlay {
                    z-index: 1001 !important;
                }
            }
            
            /* ===== MOBILE ===== */
            @media (max-width: 480px) {
                .sidebar,
                #sidebar {
                    z-index: 1002 !important;
                }
                
                .sidebar-toggle,
                #sidebar-toggle {
                    z-index: 1000 !important;
                }
                
                .sidebar-overlay {
                    z-index: 1001 !important;
                }
            }
            
            /* ===== GARANTIR QUE A SIDEBAR SEMPRE FIQUE POR CIMA ===== */
            .sidebar *,
            #sidebar * {
                z-index: inherit !important;
            }
            
            /* ===== ANIMAÇÃO SUAVE ===== */
            .sidebar-toggle,
            #sidebar-toggle {
                transition: opacity 0.3s ease, visibility 0.3s ease !important;
            }
            
            /* ===== OCULTAR MENU QUANDO SIDEBAR ABERTA ===== */
            .sidebar.open ~ .main-content .sidebar-toggle,
            .sidebar.open + .main-content .sidebar-toggle,
            #sidebar.open ~ .main-content #sidebar-toggle,
            #sidebar.open + .main-content #sidebar-toggle {
                opacity: 0 !important;
                visibility: hidden !important;
                pointer-events: none !important;
            }
            
            /* ===== MOSTRAR MENU QUANDO SIDEBAR FECHADA ===== */
            .sidebar:not(.open) ~ .main-content .sidebar-toggle,
            .sidebar:not(.open) + .main-content .sidebar-toggle,
            #sidebar:not(.open) ~ .main-content #sidebar-toggle,
            #sidebar:not(.open) + .main-content #sidebar-toggle {
                opacity: 1 !important;
                visibility: visible !important;
                pointer-events: auto !important;
            }
        `;

        document.head.appendChild(style);
        console.log('✅ Z-index corrigido com sucesso!');

        // Aplicar z-index diretamente aos elementos
        this.applyZIndexToElements();
    }

    applyZIndexToElements() {
        console.log('🔧 Aplicando z-index diretamente aos elementos...');

        // Sidebar
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.style.setProperty('z-index', '1002', 'important');
            console.log('✅ Z-index da sidebar aplicado: 1002');
        }

        // Menu hambúrguer
        const hamburger = document.getElementById('sidebar-toggle');
        if (hamburger) {
            hamburger.style.setProperty('z-index', '1000', 'important');
            console.log('✅ Z-index do menu hambúrguer aplicado: 1000');
        }

        // Configurar observador para mudanças de classe
        this.setupObserver();
    }

    setupObserver() {
        console.log('🔧 Configurando observador de mudanças...');

        const sidebar = document.getElementById('sidebar');
        const hamburger = document.getElementById('sidebar-toggle');

        if (sidebar && hamburger) {
            // Observar mudanças na classe da sidebar
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        const isOpen = sidebar.classList.contains('open');

                        if (isOpen) {
                            // Sidebar aberta: ocultar menu hambúrguer
                            hamburger.style.setProperty('opacity', '0', 'important');
                            hamburger.style.setProperty('visibility', 'hidden', 'important');
                            hamburger.style.setProperty('pointer-events', 'none', 'important');
                            console.log('🔧 Menu hambúrguer oculto - sidebar aberta');
                        } else {
                            // Sidebar fechada: mostrar menu hambúrguer
                            hamburger.style.setProperty('opacity', '1', 'important');
                            hamburger.style.setProperty('visibility', 'visible', 'important');
                            hamburger.style.setProperty('pointer-events', 'auto', 'important');
                            console.log('🔧 Menu hambúrguer visível - sidebar fechada');
                        }
                    }
                });
            });

            observer.observe(sidebar, {
                attributes: true,
                attributeFilter: ['class']
            });

            console.log('✅ Observador configurado para mudanças de classe');
        }
    }
}

// Inicializar correção
const hamburgerZIndexFix = new HamburgerZIndexFix();

// Expor métodos globalmente
window.hamburgerZIndexFix = hamburgerZIndexFix;

console.log('✅ Correção do z-index do menu hambúrguer inicializada!'); 