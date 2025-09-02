/**
 * ===== PADRONIZAÇÃO DE ÍCONES DO SISTEMA =====
 * Baseado nos ícones do Dashboard e Sidebar
 */

console.log('🎨 Icon Standardization JS carregado!');

class IconStandardization {
    constructor() {
        this.icons = {
            // Ícones principais do sistema
            system: 'fas fa-store',
            dashboard: 'fas fa-tachometer-alt',
            clientes: 'fas fa-user-group',
            produtos: 'fas fa-boxes-stacked',
            vendas: 'fas fa-shopping-bag',
            orcamentos: 'fas fa-file-invoice-dollar',
            relatorios: 'fas fa-chart-line',

            // Ícones de ações
            add: 'fas fa-plus',
            edit: 'fas fa-edit',
            delete: 'fas fa-trash',
            view: 'fas fa-eye',
            search: 'fas fa-search',
            refresh: 'fas fa-sync-alt',
            download: 'fas fa-download',
            filter: 'fas fa-filter',

            // Ícones de status
            success: 'fas fa-check-circle',
            warning: 'fas fa-exclamation-triangle',
            error: 'fas fa-times-circle',
            info: 'fas fa-info-circle',

            // Ícones de pagamento
            money: 'fas fa-dollar-sign',
            creditCard: 'fas fa-credit-card',

            // Ícones de tempo
            clock: 'fas fa-clock',
            calendar: 'fas fa-calendar',

            // Ícones de usuário
            user: 'fas fa-user',
            users: 'fas fa-users',

            // Ícones de gráficos
            chartBar: 'fas fa-chart-bar',
            chartLine: 'fas fa-chart-line',
            trending: 'fas fa-trending-up',

            // Ícones de navegação
            expand: 'fas fa-expand-alt',
            compress: 'fas fa-compress-alt',
            logout: 'fas fa-sign-out-alt',

            // Ícones de carregamento
            loading: 'fas fa-spinner',

            // Ícones de conexão
            online: 'fas fa-circle',
            offline: 'fas fa-wifi-slash',

            // Ícones de estoque
            stock: 'fas fa-boxes-stacked',
            lowStock: 'fas fa-exclamation-triangle',

            // Ícones de atividade
            activity: 'fas fa-info-circle',

            // Ícones de conversão
            convert: 'fas fa-exchange-alt'
        };

        this.init();
    }

    /**
     * Inicializa a padronização de ícones
     */
    init() {
        console.log('🎨 Inicializando padronização de ícones...');
        this.standardizeIcons();
        this.setupEventListeners();
    }

    /**
     * Padroniza os ícones em todo o sistema
     */
    standardizeIcons() {
        // Padronizar ícones da sidebar
        this.standardizeSidebarIcons();

        // Padronizar ícones dos cards do dashboard
        this.standardizeDashboardIcons();

        // Padronizar ícones das páginas
        this.standardizePageIcons();

        // Padronizar ícones de ações
        this.standardizeActionIcons();

        console.log('✅ Ícones padronizados com sucesso!');
    }

    /**
     * Padroniza os ícones da sidebar
     */
    standardizeSidebarIcons() {
        const sidebarItems = document.querySelectorAll('.sidebar-nav .nav-item i');

        sidebarItems.forEach(item => {
            const page = item.closest('.nav-item').getAttribute('data-page');
            if (page && this.icons[page]) {
                item.className = this.icons[page];
            }
        });
    }

    /**
     * Padroniza os ícones dos cards do dashboard
     */
    standardizeDashboardIcons() {
        const statCards = document.querySelectorAll('.stat-card .stat-icon i');

        statCards.forEach((icon, index) => {
            const cardNumber = index + 1;
            switch (cardNumber) {
                case 1: // Total de Clientes
                    icon.className = this.icons.clientes;
                    break;
                case 2: // Total de Produtos
                    icon.className = this.icons.produtos;
                    break;
                case 3: // Total de Vendas
                    icon.className = this.icons.vendas;
                    break;
                case 4: // Orçamentos Ativos
                    icon.className = this.icons.orcamentos;
                    break;
                case 5: // Orçamentos Aprovados
                    icon.className = this.icons.success;
                    break;
                case 6: // Convertidos em Vendas
                    icon.className = this.icons.convert;
                    break;
                case 7: // Orçamentos Expirados
                    icon.className = this.icons.clock;
                    break;
            }
        });
    }

    /**
     * Padroniza os ícones das páginas
     */
    standardizePageIcons() {
        // Padronizar ícones das estatísticas das páginas
        this.standardizePageStatsIcons();

        // Padronizar ícones dos botões de ação
        this.standardizePageActionIcons();
    }

    /**
     * Padroniza os ícones das estatísticas das páginas
     */
    standardizePageStatsIcons() {
        const pageStats = document.querySelectorAll('.stats-row .stat-card .stat-icon i');

        pageStats.forEach(icon => {
            const card = icon.closest('.stat-card');
            const content = card.querySelector('.stat-content p');

            if (content) {
                const text = content.textContent.toLowerCase();

                if (text.includes('cliente')) {
                    icon.className = this.icons.clientes;
                } else if (text.includes('produto')) {
                    icon.className = this.icons.produtos;
                } else if (text.includes('venda')) {
                    icon.className = this.icons.vendas;
                } else if (text.includes('orçamento')) {
                    icon.className = this.icons.orcamentos;
                } else if (text.includes('receita') || text.includes('valor')) {
                    icon.className = this.icons.money;
                } else if (text.includes('crescimento') || text.includes('tendência')) {
                    icon.className = this.icons.chartLine;
                } else if (text.includes('estoque baixo')) {
                    icon.className = this.icons.lowStock;
                } else if (text.includes('aprovado')) {
                    icon.className = this.icons.success;
                } else if (text.includes('pendente')) {
                    icon.className = this.icons.clock;
                }
            }
        });
    }

    /**
     * Padroniza os ícones dos botões de ação
     */
    standardizePageActionIcons() {
        // Botões de adicionar
        const addButtons = document.querySelectorAll('button[class*="btn-primary"] i, .btn-primary i');
        addButtons.forEach(icon => {
            const button = icon.closest('button');
            if (button && button.textContent.toLowerCase().includes('novo')) {
                icon.className = this.icons.add;
            }
        });

        // Botões de atualizar
        const refreshButtons = document.querySelectorAll('button[class*="btn-secondary"] i, .btn-secondary i');
        refreshButtons.forEach(icon => {
            const button = icon.closest('button');
            if (button && button.textContent.toLowerCase().includes('atualizar')) {
                icon.className = this.icons.refresh;
            }
        });

        // Botões de busca
        const searchButtons = document.querySelectorAll('button[id*="search"] i');
        searchButtons.forEach(icon => {
            icon.className = this.icons.search;
        });
    }

    /**
     * Padroniza os ícones de ações
     */
    standardizeActionIcons() {
        // Ícones de editar
        const editIcons = document.querySelectorAll('i[class*="edit"], .edit-icon');
        editIcons.forEach(icon => {
            icon.className = this.icons.edit;
        });

        // Ícones de excluir
        const deleteIcons = document.querySelectorAll('i[class*="trash"], .delete-icon');
        deleteIcons.forEach(icon => {
            icon.className = this.icons.delete;
        });

        // Ícones de visualizar
        const viewIcons = document.querySelectorAll('i[class*="eye"], .view-icon');
        viewIcons.forEach(icon => {
            icon.className = this.icons.view;
        });

        // Ícones de download
        const downloadIcons = document.querySelectorAll('i[class*="download"], .download-icon');
        downloadIcons.forEach(icon => {
            icon.className = this.icons.download;
        });
    }

    /**
     * Configura event listeners para novos elementos
     */
    setupEventListeners() {
        // Observar mudanças no DOM para padronizar novos ícones
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.standardizeNewIcons(node);
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Padroniza ícones em novos elementos
     */
    standardizeNewIcons(element) {
        const icons = element.querySelectorAll('i[class*="fa-"]');
        icons.forEach(icon => {
            this.standardizeIcon(icon);
        });
    }

    /**
     * Padroniza um ícone específico
     */
    standardizeIcon(icon) {
        const className = icon.className;
        const parent = icon.closest('[data-page], .stat-card, button, .nav-item');

        if (parent) {
            const page = parent.getAttribute('data-page');
            if (page && this.icons[page]) {
                icon.className = this.icons[page];
                return;
            }
        }

        // Verificar por classes específicas
        if (className.includes('user') || className.includes('client')) {
            icon.className = this.icons.clientes;
        } else if (className.includes('box') || className.includes('product')) {
            icon.className = this.icons.produtos;
        } else if (className.includes('shopping') || className.includes('sale')) {
            icon.className = this.icons.vendas;
        } else if (className.includes('invoice') || className.includes('quote')) {
            icon.className = this.icons.orcamentos;
        } else if (className.includes('chart') || className.includes('report')) {
            icon.className = this.icons.relatorios;
        }
    }

    /**
     * Retorna o ícone para uma funcionalidade específica
     */
    getIcon(type) {
        return this.icons[type] || this.icons.info;
    }

    /**
     * Aplica ícone a um elemento
     */
    applyIcon(element, type) {
        if (element && this.icons[type]) {
            element.className = this.icons[type];
        }
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.iconStandardization = new IconStandardization();
});

// Exportar para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IconStandardization;
} 