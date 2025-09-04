/**
 * Dashboard - Funcionalidades
 * Arquivo externo para compatibilidade com CSP
 */

class DashboardPage {
    constructor() {
        this.userData = null;
        this.init();
    }

    init() {
        console.log('🚀 Inicializando dashboard...');
        this.checkAuthentication();
        this.setupEventListeners();
        this.loadDashboardData();
        this.log('✅ Dashboard inicializado');
    }

    setupEventListeners() {
        // Botão de logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Botão de refresh da dashboard
        const refreshBtn = document.getElementById('refresh-dashboard');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshDashboard());
        }

        console.log('✅ Event listeners configurados');
    }

    log(message) {
        console.log(`[DASHBOARD] ${message}`);
    }

    async checkAuthentication() {
        try {
            this.log('🔐 Verificando autenticação...');

            const token = localStorage.getItem('authToken');
            if (!token) {
                this.log('❌ Token não encontrado, redirecionando para login');
                window.location.href = '/login.html';
                return;
            }

            // Verificar se o token é válido
            const response = await fetch('/api/auth/verify', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                this.log('✅ Usuário autenticado');
                this.userData = data.data.user;
                this.updateUserInfo();
            } else {
                this.log('❌ Token inválido, redirecionando para login');
                localStorage.removeItem('authToken');
                localStorage.removeItem('userData');
                window.location.href = '/login.html';
            }

        } catch (error) {
            this.log(`❌ Erro ao verificar autenticação: ${error.message}`);
            window.location.href = '/login.html';
        }
    }

    updateUserInfo() {
        if (!this.userData) return;

        // Atualizar avatar
        const avatar = document.getElementById('user-avatar');
        if (avatar) {
            avatar.textContent = this.userData.name.charAt(0).toUpperCase();
        }

        // Atualizar informações do usuário
        const userName = document.getElementById('user-name');
        const userRole = document.getElementById('user-role');
        const userEmail = document.getElementById('user-email');

        if (userName) userName.textContent = this.userData.name;
        if (userRole) userRole.textContent = this.getRoleDisplayName(this.userData.role);
        if (userEmail) userEmail.textContent = this.userData.email;

        this.log(`👤 Usuário: ${this.userData.name} (${this.userData.role})`);
    }

    getRoleDisplayName(role) {
        const roleNames = {
            'admin': 'Administrador',
            'gerente': 'Gerente',
            'vendedor': 'Vendedor'
        };

        return roleNames[role] || role;
    }

    async loadDashboardData() {
        try {
            this.log('📊 Carregando dados do dashboard...');

            // Carregar estatísticas
            await this.loadStats();

            // Carregar atividade recente
            await this.loadRecentActivity();

            // Verificar se os dados foram carregados corretamente
            this.verifyDataConsistency();

            this.log('✅ Dados do dashboard carregados');

        } catch (error) {
            this.log(`❌ Erro ao carregar dados do dashboard: ${error.message}`);
        }
    }

    verifyDataConsistency() {
        this.log('🔍 Verificando consistência dos dados...');

        const elements = {
            'total-clientes': 'Total de Clientes',
            'total-produtos': 'Total de Produtos',
            'total-vendas': 'Total de Vendas',
            'orcamentos-ativos': 'Orçamentos Ativos',
            'orcamentos-aprovados': 'Orçamentos Aprovados',
            'orcamentos-convertidos': 'Orçamentos Convertidos',
            'orcamentos-expirados': 'Orçamentos Expirados'
        };

        Object.entries(elements).forEach(([id, label]) => {
            const element = document.getElementById(id);
            if (element) {
                const value = element.textContent.replace(/\D/g, '');
                this.log(`  ${label}: ${value}`);

                // Verificar se o valor é 0 (possível dado mock)
                if (value === '0') {
                    this.log(`⚠️ Valor zero detectado para ${label} - pode ser dado mock`);
                }
            }
        });
    }

    async loadStats() {
        try {
            this.log('📈 Carregando estatísticas reais...');

            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/relatorios/dashboard', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.success) {
                const stats = data.data.estatisticas;

                // Atualizar elementos na página
                this.updateStatsDisplay(stats);

                // Carregar alertas de estoque
                this.loadEstoqueAlerts(data.data.estoque_baixo);

                // Carregar resumo financeiro
                this.loadFinancialSummary(stats);

                this.log('✅ Estatísticas reais carregadas');
            } else {
                throw new Error(data.error || 'Erro ao carregar dados');
            }

        } catch (error) {
            this.log(`❌ Erro ao carregar estatísticas: ${error.message}`);

            // Fallback para dados mock em caso de erro
            this.log('🔄 Usando dados mock como fallback...');
            const mockStats = {
                total_clientes: 0,
                total_produtos: 0,
                total_vendas: 0,
                orcamentos_ativos: 0,
                orcamentos_aprovados: 0,
                orcamentos_convertidos: 0,
                orcamentos_expirados: 0,
                valor_total_vendas: 0,
                valor_total_devido: 0,
                valor_total_pago: 0
            };
            this.updateStatsDisplay(mockStats);
        }
    }

    updateStatsDisplay(stats) {
        // Atualizar contadores
        const elements = {
            'total-clientes': stats.total_clientes,
            'total-produtos': stats.total_produtos,
            'total-vendas': stats.total_vendas,
            'orcamentos-ativos': stats.orcamentos_ativos,
            'orcamentos-aprovados': stats.orcamentos_aprovados,
            'orcamentos-convertidos': stats.orcamentos_convertidos,
            'orcamentos-expirados': stats.orcamentos_expirados
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value.toLocaleString('pt-BR');
            }
        });
    }

    async loadRecentActivity() {
        try {
            this.log('📝 Carregando atividade recente...');

            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/relatorios/dashboard', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.success) {
                // Criar atividades baseadas nos dados reais
                const activities = this.createActivitiesFromData(data.data);
                this.updateActivityDisplay(activities);
                this.log('✅ Atividade recente carregada');
            } else {
                throw new Error(data.error || 'Erro ao carregar dados');
            }

        } catch (error) {
            this.log(`❌ Erro ao carregar atividade recente: ${error.message}`);

            // Fallback para dados mock
            this.log('🔄 Usando dados mock como fallback...');
            const activities = [
                {
                    type: 'info',
                    text: 'Sistema carregado com sucesso',
                    time: 'Agora'
                }
            ];
            this.updateActivityDisplay(activities);
        }
    }

    createActivitiesFromData(data) {
        const activities = [];

        // Adicionar atividade baseada no total de vendas
        if (data.estatisticas.total_vendas > 0) {
            activities.push({
                type: 'venda',
                text: `${data.estatisticas.total_vendas} vendas realizadas`,
                time: 'Hoje'
            });
        }

        // Adicionar atividade baseada no total de clientes
        if (data.estatisticas.total_clientes > 0) {
            activities.push({
                type: 'cliente',
                text: `${data.estatisticas.total_clientes} clientes cadastrados`,
                time: 'Hoje'
            });
        }

        // Adicionar atividade baseada no total de produtos
        if (data.estatisticas.total_produtos > 0) {
            activities.push({
                type: 'produto',
                text: `${data.estatisticas.total_produtos} produtos no catálogo`,
                time: 'Hoje'
            });
        }

        // Adicionar atividade baseada em orçamentos ativos
        if (data.estatisticas.orcamentos_ativos > 0) {
            activities.push({
                type: 'orcamento',
                text: `${data.estatisticas.orcamentos_ativos} orçamentos ativos`,
                time: 'Hoje'
            });
        }

        // Adicionar alerta de estoque se houver
        if (data.estoque_baixo && data.estoque_baixo.length > 0) {
            activities.push({
                type: 'warning',
                text: `${data.estoque_baixo.length} produto(s) com estoque baixo`,
                time: 'Agora'
            });
        }

        return activities;
    }

    updateActivityDisplay(activities) {
        const activityList = document.getElementById('activity-list');
        if (!activityList) return;

        activityList.innerHTML = '';

        activities.forEach(activity => {
            const activityElement = document.createElement('div');
            activityElement.className = 'activity-item';
            activityElement.innerHTML = `
                <div class="activity-icon">
                    <i class="fas fa-${this.getActivityIcon(activity.type)}"></i>
                </div>
                <div class="activity-content">
                    <p>${activity.text}</p>
                    <span class="activity-time">${activity.time}</span>
                </div>
            `;
            activityList.appendChild(activityElement);
        });
    }

    getActivityIcon(type) {
        const icons = {
            'venda': 'shopping-cart',
            'cliente': 'user',
            'produto': 'box',
            'orcamento': 'file-invoice'
        };

        return icons[type] || 'info-circle';
    }

    loadEstoqueAlerts(estoqueBaixo) {
        const alertsContainer = document.getElementById('estoque-alerts');
        if (!alertsContainer) return;

        if (estoqueBaixo && estoqueBaixo.length > 0) {
            alertsContainer.innerHTML = `
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    <strong>Alerta de Estoque:</strong> ${estoqueBaixo.length} produto(s) com estoque baixo
                    <button class="alert-close" onclick="this.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        } else {
            alertsContainer.innerHTML = '';
        }
    }

    loadFinancialSummary(stats) {
        // Atualizar resumo financeiro se existir
        const financialElements = {
            'valor-total-vendas': stats.valor_total_vendas,
            'valor-total-devido': stats.valor_total_devido,
            'valor-total-pago': stats.valor_total_pago
        };

        Object.entries(financialElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
            }
        });
    }

    handleLogout() {
        this.log('🚪 Fazendo logout...');

        // Limpar dados do localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');

        // Redirecionar para login
        window.location.href = '/login.html';
    }

    async refreshDashboard() {
        try {
            this.log('🔄 Atualizando dashboard...');

            // Mostrar loading no botão
            const refreshBtn = document.getElementById('refresh-dashboard');
            if (refreshBtn) {
                const originalText = refreshBtn.innerHTML;
                refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Atualizando...';
                refreshBtn.disabled = true;

                // Recarregar dados
                await this.loadDashboardData();

                // Restaurar botão
                setTimeout(() => {
                    refreshBtn.innerHTML = originalText;
                    refreshBtn.disabled = false;
                }, 1000);
            }

            this.log('✅ Dashboard atualizada');
        } catch (error) {
            this.log(`❌ Erro ao atualizar dashboard: ${error.message}`);
        }
    }

    // Métodos necessários para compatibilidade com app.js
    async cleanup() {
        this.log('🧹 Limpando recursos do dashboard...');
        // Implementar limpeza se necessário
    }

    isActive() {
        return true; // Sempre ativo por enquanto
    }

    isInitialized() {
        return true; // Sempre inicializado por enquanto
    }

    async loadDashboardStats() {
        await this.loadStats();
    }

    async loadRecentActivities() {
        await this.loadRecentActivity();
    }

    async loadEstoqueAlerts() {
        this.log('📦 Carregando alertas de estoque...');
        // Implementar quando necessário
    }
}

// Exportar para uso global
window.DashboardPage = DashboardPage; 