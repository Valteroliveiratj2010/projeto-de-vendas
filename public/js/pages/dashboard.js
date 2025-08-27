/**
 * Página do Dashboard - Sistema de Vendas
 */

class DashboardPage {
    constructor() {
        this.init();
    }

    init() {
        console.log('🚀 Dashboard inicializado!');
        this.loadDashboardData();
        
        // 🔄 ESCUTAR EVENTOS DE ATUALIZAÇÃO AUTOMÁTICA
        this.setupUpdateListeners();
    }

    async loadDashboardData() {
        try {
            // Carregar estatísticas
            const stats = await window.api.get('/api/relatorios/dashboard');
            if (stats.data && stats.data.success) {
                this.updateDashboardStats(stats.data.data);
            }
            
            // Carregar atividades recentes
            await this.loadRecentActivities();
            
        } catch (error) {
            console.error('❌ Erro ao carregar dados do dashboard:', error);
        }
    }

    updateDashboardStats(data) {
        const { estatisticas } = data;
        
        // Atualizar contadores
        const totalClientes = document.getElementById('total-clientes');
        const totalProdutos = document.getElementById('total-produtos');
        const totalVendas = document.getElementById('total-vendas');
        const orcamentosAtivos = document.getElementById('orcamentos-ativos');
        
        if (totalClientes) totalClientes.textContent = estatisticas.total_clientes || 0;
        if (totalProdutos) totalProdutos.textContent = estatisticas.total_produtos || 0;
        if (totalVendas) totalVendas.textContent = estatisticas.total_vendas || 0;
        if (orcamentosAtivos) orcamentosAtivos.textContent = estatisticas.orcamentos_ativos || 0;
        
        // Atualizar estatísticas de orçamentos por status
        const orcamentosAprovados = document.getElementById('orcamentos-aprovados');
        const orcamentosConvertidos = document.getElementById('orcamentos-convertidos');
        const orcamentosExpirados = document.getElementById('orcamentos-expirados');
        
        if (orcamentosAprovados) orcamentosAprovados.textContent = estatisticas.orcamentos_aprovados || 0;
        if (orcamentosConvertidos) orcamentosConvertidos.textContent = estatisticas.orcamentos_convertidos || 0;
        if (orcamentosExpirados) orcamentosExpirados.textContent = estatisticas.orcamentos_expirados || 0;
        
        // Atualizar valores financeiros
        const valorTotalVendas = document.getElementById('valor-total-vendas');
        const valorTotalPago = document.getElementById('valor-total-pago');
        const valorTotalDevido = document.getElementById('valor-total-devido');
        
        if (valorTotalVendas) valorTotalVendas.textContent = this.formatCurrency(estatisticas.valor_total_vendas || 0);
        if (valorTotalPago) valorTotalPago.textContent = this.formatCurrency(estatisticas.valor_total_pago || 0);
        if (valorTotalDevido) valorTotalDevido.textContent = this.formatCurrency(estatisticas.valor_total_devido || 0);
    }

    async loadRecentActivities() {
        try {
            const activityList = document.getElementById('activity-list');
            if (!activityList) return;
            
            // Buscar atividades recentes
            const activities = await this.getRecentActivities();
            
            // Limpar lista atual
            activityList.innerHTML = '';
            
            if (activities.length === 0) {
                activityList.innerHTML = `
                    <div class="activity-item">
                        <div class="activity-icon">
                            <i class="fas fa-info-circle"></i>
                        </div>
                        <div class="activity-content">
                            <p>Nenhuma atividade recente</p>
                            <span class="activity-time">Agora</span>
                        </div>
                    </div>
                `;
                return;
            }
            
            // Adicionar atividades
            activities.forEach(activity => {
                const activityElement = this.createActivityElement(activity);
                activityList.appendChild(activityElement);
            });
            
        } catch (error) {
            console.error('❌ Erro ao carregar atividades:', error);
        }
    }

    async getRecentActivities() {
        try {
            // Buscar vendas recentes
            const vendas = await window.api.get('/api/vendas?limit=5');
            const activities = [];
            
            if (vendas.data && vendas.data.success && vendas.data.data.length > 0) {
                vendas.data.data.forEach(venda => {
                    activities.push({
                        type: 'venda',
                        icon: 'fas fa-shopping-cart',
                        text: `Nova venda para ${venda.cliente_nome || 'Cliente'}`,
                        time: this.formatTimeAgo(venda.created_at),
                        value: this.formatCurrency(venda.total)
                    });
                });
            }
            
            // Buscar pagamentos recentes
            const pagamentos = await window.api.get('/api/pagamentos?limit=5');
            if (pagamentos.data && pagamentos.data.success && pagamentos.data.data.length > 0) {
                pagamentos.data.data.forEach(pagamento => {
                    activities.push({
                        type: 'pagamento',
                        icon: 'fas fa-credit-card',
                        text: `Pagamento recebido de ${pagamento.cliente_nome || 'Cliente'}`,
                        time: this.formatTimeAgo(pagamento.data_pagto),
                        value: this.formatCurrency(pagamento.valor_pago)
                    });
                });
            }
            
            // Ordenar por data e retornar os 10 mais recentes
            return activities
                .sort((a, b) => new Date(b.time) - new Date(a.time))
                .slice(0, 10);
                
        } catch (error) {
            console.error('❌ Erro ao buscar atividades:', error);
            return [];
        }
    }

    createActivityElement(activity) {
        const div = document.createElement('div');
        div.className = 'activity-item';
        div.innerHTML = `
            <div class="activity-icon">
                <i class="${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <p>${activity.text}</p>
                <span class="activity-time">${activity.time}</span>
            </div>
        `;
        return div;
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    formatTimeAgo(dateString) {
        if (!dateString) return 'Agora';
        
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Agora';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m atrás`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h atrás`;
        return `${Math.floor(diffInSeconds / 86400)}d atrás`;
    }
    
    /**
     * 🔄 CONFIGURA LISTENERS PARA ATUALIZAÇÃO AUTOMÁTICA
     * Escuta eventos de mudanças em outras páginas
     */
    setupUpdateListeners() {
        console.log('🔄 Configurando listeners de atualização automática...');
        
        // Usar EventManager global se disponível
        if (window.eventManager) {
            console.log('✅ Usando EventManager global para atualizações');
            
            // Registrar listener no EventManager
            this.updateListenerId = window.eventManager.listenForUpdates((updateData) => {
                console.log('🔄 Atualização recebida via EventManager:', updateData);
                
                // Verificar se é uma atualização relevante
                if (updateData.type === 'clientes' || updateData.type === 'produtos') {
                    console.log(`✅ Atualizando dashboard por mudança em ${updateData.type}...`);
                    
                    // Atualizar dados com delay para garantir que a API esteja atualizada
                    setTimeout(() => {
                        this.loadDashboardData();
                    }, 500);
                }
            }, ['clientes', 'produtos']);
            
            // Verificar atualizações pendentes ao inicializar
            const pendingUpdates = window.eventManager.checkPendingUpdates();
            if (pendingUpdates.length > 0) {
                console.log(`🔄 ${pendingUpdates.length} atualizações pendentes encontradas, atualizando dashboard...`);
                setTimeout(() => {
                    this.loadDashboardData();
                }, 1000);
            }
        } else {
            console.log('⚠️ EventManager não disponível, usando listeners locais');
            
            // Fallback para listeners locais
            const handleUpdate = (event) => {
                console.log('🔄 Evento de atualização recebido:', event.detail);
                
                if (event.detail && (event.detail.type === 'clientes' || event.detail.type === 'produtos')) {
                    console.log(`✅ Atualizando dashboard por mudança em ${event.detail.type}...`);
                    
                    setTimeout(() => {
                        this.loadDashboardData();
                    }, 500);
                }
            };
            
            window.addEventListener('dashboard-update', handleUpdate);
            document.addEventListener('dashboard-update', handleUpdate);
        }
        
        // Listener para mudanças de hash (navegação entre páginas)
        window.addEventListener('hashchange', () => {
            if (window.location.hash === '#dashboard') {
                console.log('🔄 Retornando ao dashboard, atualizando dados...');
                this.loadDashboardData();
            }
        });
        
        console.log('✅ Listeners de atualização configurados!');
    }
    
    /**
     * 🧹 LIMPA LISTENERS AO DESTRUIR PÁGINA
     * Remove listeners do EventManager para evitar vazamentos de memória
     */
    cleanup() {
        if (this.updateListenerId && window.eventManager) {
            window.eventManager.stopListening(this.updateListenerId);
            console.log('🧹 Listeners de atualização removidos');
        }
    }

    showError(title, message) {
        if (window.UI) {
            window.UI.showErrorWithTitle(title, message);
        } else {
            alert(`${title}: ${message}`);
        }
    }
}

// Inicializar página quando carregar
document.addEventListener('DOMContentLoaded', () => {
    if (window.currentPage === 'dashboard') {
        window.dashboardPage = new DashboardPage();
    }
});

// Exportar para uso global
window.DashboardPage = DashboardPage; 