/**
 * 🎨 CORES PROFISSIONAIS PARA BOTÕES DE TABELA
 * JavaScript complementar para garantir persistência das cores dos botões de tabela
 */

console.log('🎨 Table Buttons Professional Colors JS carregado!');

class TableButtonsProfessionalColors {
    constructor() {
        this.init();
    }

    init() {
        console.log('🔧 Inicializando TableButtonsProfessionalColors...');
        this.applyProfessionalColors();
        this.setupObserver();
        this.setupIntervalCheck();
    }

    applyProfessionalColors() {
        console.log('🎨 Aplicando cores profissionais aos botões de tabela...');
        const tableButtons = document.querySelectorAll('.btn-icon.btn-view, .btn-icon.btn-edit, .btn-icon.btn-delete, .btn-icon.btn-payment, .btn-icon.btn-convert');

        tableButtons.forEach((button, index) => {
            this.setProfessionalColors(button, index);
        });
    }

    setProfessionalColors(button, index) {
        // Identificar tipo de botão
        const buttonType = this.getButtonType(button);
        const colors = this.getProfessionalColors(buttonType);

        // Aplicar cores profissionais via inline styles
        const professionalStyles = `
            background: ${colors.background} !important;
            background-color: ${colors.background} !important;
            color: #ffffff !important;
            border: none !important;
            box-shadow: ${colors.shadow} !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 32px !important;
            height: 32px !important;
            border-radius: 50% !important;
            cursor: pointer !important;
            transition: all 0.2s ease !important;
            text-decoration: none !important;
            box-sizing: border-box !important;
            margin: 2px !important;
            flex-shrink: 0 !important;
            position: relative !important;
            z-index: 10 !important;
        `;

        button.style.cssText = professionalStyles;

        // Aplicar cores nos ícones
        const icons = button.querySelectorAll('i');
        icons.forEach(icon => {
            icon.style.cssText = `
                color: #ffffff !important;
                font-size: 14px !important;
                margin: 0 !important;
                padding: 0 !important;
                width: auto !important;
                height: auto !important;
                position: static !important;
                background: none !important;
                background-image: none !important;
                border: none !important;
                outline: none !important;
                box-shadow: none !important;
                transform: none !important;
                transition: all 0.2s ease !important;
                animation: none !important;
                display: inline-block !important;
                visibility: visible !important;
                opacity: 1 !important;
                z-index: 11 !important;
            `;
        });

        // Adicionar event listeners para hover
        this.addHoverEffects(button, colors);
    }

    getButtonType(button) {
        if (button.classList.contains('btn-view')) return 'view';
        if (button.classList.contains('btn-edit')) return 'edit';
        if (button.classList.contains('btn-delete')) return 'delete';
        if (button.classList.contains('btn-payment')) return 'payment';
        if (button.classList.contains('btn-convert')) return 'convert';
        return 'default';
    }

    getProfessionalColors(buttonType) {
        const colors = {
            view: {
                background: '#3b82f6',
                hover: '#2563eb',
                shadow: '0 2px 4px rgba(59, 130, 246, 0.2)',
                hoverShadow: '0 4px 8px rgba(59, 130, 246, 0.3)'
            },
            edit: {
                background: '#f59e0b',
                hover: '#d97706',
                shadow: '0 2px 4px rgba(245, 158, 11, 0.2)',
                hoverShadow: '0 4px 8px rgba(245, 158, 11, 0.3)'
            },
            delete: {
                background: '#ef4444',
                hover: '#dc2626',
                shadow: '0 2px 4px rgba(239, 68, 68, 0.2)',
                hoverShadow: '0 4px 8px rgba(239, 68, 68, 0.3)'
            },
            payment: {
                background: '#10b981',
                hover: '#059669',
                shadow: '0 2px 4px rgba(16, 185, 129, 0.2)',
                hoverShadow: '0 4px 8px rgba(16, 185, 129, 0.3)'
            },
            convert: {
                background: '#8b5cf6',
                hover: '#7c3aed',
                shadow: '0 2px 4px rgba(139, 92, 246, 0.2)',
                hoverShadow: '0 4px 8px rgba(139, 92, 246, 0.3)'
            },
            default: {
                background: '#3b82f6',
                hover: '#2563eb',
                shadow: '0 2px 4px rgba(59, 130, 246, 0.2)',
                hoverShadow: '0 4px 8px rgba(59, 130, 246, 0.3)'
            }
        };

        return colors[buttonType] || colors.default;
    }

    addHoverEffects(button, colors) {
        // Remover event listeners anteriores
        button.removeEventListener('mouseenter', this.handleMouseEnter);
        button.removeEventListener('mouseleave', this.handleMouseLeave);

        // Adicionar novos event listeners
        button.addEventListener('mouseenter', () => {
            button.style.background = colors.hover + ' !important';
            button.style.backgroundColor = colors.hover + ' !important';
            button.style.transform = 'translateY(-1px) !important';
            button.style.boxShadow = colors.hoverShadow + ' !important';
        });

        button.addEventListener('mouseleave', () => {
            button.style.background = colors.background + ' !important';
            button.style.backgroundColor = colors.background + ' !important';
            button.style.transform = 'translateY(0) !important';
            button.style.boxShadow = colors.shadow + ' !important';
        });
    }

    setupObserver() {
        console.log('👀 Configurando observer para botões de tabela...');
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.matches('.btn-icon.btn-view, .btn-icon.btn-edit, .btn-icon.btn-delete, .btn-icon.btn-payment, .btn-icon.btn-convert')) {
                                console.log('➕ Novo botão de tabela detectado, aplicando cores profissionais...');
                                this.setProfessionalColors(node, 0);
                            } else {
                                const newButtons = node.querySelectorAll('.btn-icon.btn-view, .btn-icon.btn-edit, .btn-icon.btn-delete, .btn-icon.btn-payment, .btn-icon.btn-convert');
                                if (newButtons.length > 0) {
                                    console.log(`➕ ${newButtons.length} novos botões de tabela detectados, aplicando cores profissionais...`);
                                    newButtons.forEach((button, index) => {
                                        this.setProfessionalColors(button, index);
                                    });
                                }
                            }
                        }
                    });
                } else if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    if (mutation.target.matches('.btn-icon.btn-view, .btn-icon.btn-edit, .btn-icon.btn-delete, .btn-icon.btn-payment, .btn-icon.btn-convert')) {
                        // Verificar se algum estilo azul foi aplicado incorretamente
                        const computedStyle = window.getComputedStyle(mutation.target);
                        const background = computedStyle.background;

                        if (background.includes('#3b82f6') && !mutation.target.classList.contains('btn-view')) {
                            console.warn('⚠️ Botão de tabela com cor azul incorreta detectado, reaplicando cores profissionais...');
                            this.setProfessionalColors(mutation.target, 0);
                        }
                    }
                }
            });
        });

        const targetNode = document.body;
        if (targetNode) {
            observer.observe(targetNode, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['style', 'class']
            });
            console.log('✅ Observer configurado para botões de tabela');
        }
    }

    setupIntervalCheck() {
        console.log('⏰ Configurando verificação de intervalo para botões de tabela...');
        setInterval(() => {
            this.checkAndFixTableButtons();
        }, 1000); // A cada 1 segundo
    }

    checkAndFixTableButtons() {
        const tableButtons = document.querySelectorAll('.btn-icon.btn-view, .btn-icon.btn-edit, .btn-icon.btn-delete, .btn-icon.btn-payment, .btn-icon.btn-convert');
        tableButtons.forEach((button, index) => {
            const computedStyle = window.getComputedStyle(button);
            const background = computedStyle.background;
            const buttonType = this.getButtonType(button);

            // Verificar se o botão está com a cor incorreta
            if (background.includes('#3b82f6') && buttonType !== 'view') {
                console.warn(`⚠️ Botão de tabela ${index + 1} com cor azul incorreta (tipo: ${buttonType}), reaplicando cores profissionais...`);
                this.setProfessionalColors(button, index);
            }
        });
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Aguardar um pouco para garantir que outros scripts tenham carregado
    setTimeout(() => {
        window.tableButtonsProfessionalColors = new TableButtonsProfessionalColors();
    }, 500);
});

// Inicializar imediatamente se o DOM já estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            window.tableButtonsProfessionalColors = new TableButtonsProfessionalColors();
        }, 500);
    });
} else {
    setTimeout(() => {
        window.tableButtonsProfessionalColors = new TableButtonsProfessionalColors();
    }, 500);
} 