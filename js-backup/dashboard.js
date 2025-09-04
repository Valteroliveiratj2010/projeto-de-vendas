/**
 * Dashboard - Funcionalidades
 * Arquivo externo para compatibilidade com CSP
 */

class Dashboard {
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
        document.getElementById('logout-btn').addEventListener('click', () => this.handleLogout());
        
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
        avatar.textContent = this.userData.name.charAt(0).toUpperCase();
        
        // Atualizar informações do usuário
        document.getElementById('user-name').textContent = this.userData.name;
        document.getElementById('user-role').textContent = this.getRoleDisplayName(this.userData.role);
        document.getElementById('user-email').textContent = this.userData.email;
        
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
            
            this.log('✅ Dados do dashboard carregados');
            
        } catch (error) {
            this.log(`❌ Erro ao carregar dados: ${error.message}`);
        }
    }
    
    async loadStats() {
        try {
            // Carregar estatísticas de vendas
            const vendasResponse = await fetch('/api/vendas');
            if (vendasResponse.ok) {
                const vendasData = await vendasResponse.json();
                if (vendasData.success) {
                    document.getElementById('total-vendas').textContent = vendasData.data.total || 0;
                }
            }
            
            // Carregar estatísticas de clientes
            const clientesResponse = await fetch('/api/clientes');
            if (clientesResponse.ok) {
                const clientesData = await clientesResponse.json();
                if (clientesData.success) {
                    document.getElementById('total-clientes').textContent = clientesData.data.total || 0;
                }
            }
            
            // Carregar estatísticas de produtos
            const produtosResponse = await fetch('/api/produtos');
            if (produtosResponse.ok) {
                const produtosData = await produtosResponse.json();
                if (produtosData.success) {
                    document.getElementById('total-produtos').textContent = produtosData.data.total || 0;
                }
            }
            
            // Carregar estatísticas de orçamentos
            const orcamentosResponse = await fetch('/api/orcamentos');
            if (orcamentosResponse.ok) {
                const orcamentosData = await orcamentosResponse.json();
                if (orcamentosData.success) {
                    document.getElementById('total-orcamentos').textContent = orcamentosData.data.total || 0;
                }
            }
            
        } catch (error) {
            this.log(`❌ Erro ao carregar estatísticas: ${error.message}`);
        }
    }
    
    async loadRecentActivity() {
        try {
            const activityList = document.getElementById('activity-list');
            
            // Simular atividades recentes (em produção, viria da API)
            const activities = [
                {
                    icon: '🛒',
                    title: 'Nova venda registrada',
                    time: 'Há 5 minutos',
                    color: '#dbeafe'
                },
                {
                    icon: '👤',
                    title: 'Novo cliente cadastrado',
                    time: 'Há 15 minutos',
                    color: '#dcfce7'
                },
                {
                    icon: '📋',
                    title: 'Orçamento aprovado',
                    time: 'Há 1 hora',
                    color: '#fef3c7'
                },
                {
                    icon: '📊',
                    title: 'Relatório gerado',
                    time: 'Há 2 horas',
                    color: '#f3e8ff'
                }
            ];
            
            // Limpar lista atual
            activityList.innerHTML = '';
            
            // Adicionar atividades
            activities.forEach(activity => {
                const activityItem = document.createElement('div');
                activityItem.className = 'activity-item';
                activityItem.innerHTML = `
                    <div class="activity-icon" style="background: ${activity.color}; color: #1f2937;">
                        ${activity.icon}
                    </div>
                    <div class="activity-content">
                        <div class="activity-title">${activity.title}</div>
                        <div class="activity-time">${activity.time}</div>
                    </div>
                `;
                activityList.appendChild(activityItem);
            });
            
        } catch (error) {
            this.log(`❌ Erro ao carregar atividades: ${error.message}`);
        }
    }
    
    async handleLogout() {
        try {
            this.log('🚪 Iniciando logout...');
            
            const token = localStorage.getItem('authToken');
            if (token) {
                // Chamar API de logout
                try {
                    await fetch('/api/auth/logout', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                } catch (error) {
                    this.log(`⚠️ Erro na API de logout: ${error.message}`);
                }
            }
            
            // Limpar dados locais
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            localStorage.removeItem('tokenExpiresAt');
            
            this.log('✅ Logout realizado com sucesso');
            
            // Redirecionar para login
            window.location.href = '/login.html';
            
        } catch (error) {
            this.log(`❌ Erro no logout: ${error.message}`);
            // Forçar redirecionamento mesmo com erro
            window.location.href = '/login.html';
        }
    }
    
    // Método para atualizar estatísticas em tempo real
    updateStats() {
        this.loadStats();
    }
    
    // Método para adicionar nova atividade
    addActivity(icon, title, time = 'Agora') {
        try {
            const activityList = document.getElementById('activity-list');
            const activityItem = document.createElement('div');
            
            // Cores baseadas no tipo de atividade
            const colors = {
                '🛒': '#dbeafe', // Venda - Azul
                '👤': '#dcfce7', // Cliente - Verde
                '📋': '#fef3c7', // Orçamento - Amarelo
                '📊': '#f3e8ff', // Relatório - Roxo
                '📦': '#fef2f2', // Produto - Vermelho
                '💰': '#ecfdf5', // Pagamento - Verde
                '📧': '#eff6ff', // Email - Azul
                '📱': '#f0f9ff'  // WhatsApp - Azul claro
            };
            
            const color = colors[icon] || '#f3f4f6';
            
            activityItem.className = 'activity-item';
            activityItem.innerHTML = `
                <div class="activity-icon" style="background: ${color}; color: #1f2937;">
                    ${icon}
                </div>
                <div class="activity-content">
                    <div class="activity-title">${title}</div>
                    <div class="activity-time">${time}</div>
                </div>
            `;
            
            // Adicionar no topo da lista
            activityList.insertBefore(activityItem, activityList.firstChild);
            
            // Manter apenas as últimas 10 atividades
            const items = activityList.querySelectorAll('.activity-item');
            if (items.length > 10) {
                items[items.length - 1].remove();
            }
            
        } catch (error) {
            this.log(`❌ Erro ao adicionar atividade: ${error.message}`);
        }
    }
    
    // Método para verificar permissões do usuário
    hasPermission(permission) {
        if (!this.userData) return false;
        
        const permissions = {
            'admin': ['all'],
            'gerente': ['read', 'write', 'delete'],
            'vendedor': ['read', 'write']
        };
        
        const userPermissions = permissions[this.userData.role] || [];
        return userPermissions.includes('all') || userPermissions.includes(permission);
    }
    
    // Método para mostrar/esconder elementos baseado em permissões
    updatePermissions() {
        // Exemplo: esconder botão de configurações para vendedores
        const configButton = document.querySelector('a[href="#configuracoes"]');
        if (configButton && !this.hasPermission('admin')) {
            configButton.style.display = 'none';
        }
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM carregado, inicializando dashboard...');
    window.dashboard = new Dashboard();
});

// Verificar autenticação a cada 5 minutos
setInterval(() => {
    if (window.dashboard) {
        window.dashboard.checkAuthentication();
    }
}, 5 * 60 * 1000); 