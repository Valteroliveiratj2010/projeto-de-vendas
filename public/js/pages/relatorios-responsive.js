/**
 * 📊 RELATÓRIOS RESPONSIVOS - Versão Melhorada
 * Sistema de relatórios com responsividade completa para todas as telas
 */

console.log('🚀 RELATÓRIOS RESPONSIVOS - Carregando sistema melhorado...');

class RelatoriosResponsivos {
    constructor() {
        this.charts = new Map();
        this.currentPeriod = 30;
        this.isMobile = window.innerWidth <= 768;
        this.isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
        this.init();
    }

    init() {
        console.log('📱 Relatórios Responsivos - Inicializando...');
        this.setupResizeListener();
        this.renderPage();
        this.setupEventListeners();
    }

    setupResizeListener() {
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    handleResize() {
        const wasMobile = this.isMobile;
        const wasTablet = this.isTablet;
        
        this.isMobile = window.innerWidth <= 768;
        this.isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
        
        // Se mudou de categoria de dispositivo, recriar gráficos
        if (wasMobile !== this.isMobile || wasTablet !== this.isTablet) {
            console.log('📱 Mudança de dispositivo detectada, recriando gráficos...');
            this.recreateCharts();
        }
    }

    renderPage() {
        const container = document.getElementById('relatorios-content');
        if (!container) {
            console.error('❌ Container de relatórios não encontrado');
            return;
        }

        container.innerHTML = `
            <div class="page-header">
                <div class="header-content">
                    <h1>📊 Relatórios e Análises</h1>
                    <p>Visualize dados e insights do seu negócio em tempo real</p>
                </div>
                <div class="header-actions">
                    <button class="btn btn-primary" id="refresh-reports-btn">
                        <i class="fas fa-sync-alt"></i>
                        <span class="btn-text">Atualizar</span>
                    </button>
                    <button class="btn btn-secondary" id="export-reports-btn">
                        <i class="fas fa-download"></i>
                        <span class="btn-text">Exportar</span>
                    </button>
                </div>
            </div>

            <div class="filters-section">
                <div class="filter-group">
                    <label for="period-select">📅 Período:</label>
                    <select id="period-select" class="form-select">
                        <option value="7">Últimos 7 dias</option>
                        <option value="30" selected>Últimos 30 dias</option>
                        <option value="90">Últimos 3 meses</option>
                        <option value="365">Último ano</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label for="chart-type-select">📈 Tipo de Gráfico:</label>
                    <select id="chart-type-select" class="form-select">
                        <option value="auto">Automático</option>
                        <option value="bar">Barras</option>
                        <option value="line">Linha</option>
                        <option value="pie">Pizza</option>
                    </select>
                </div>
                <div class="filter-group">
                    <button class="btn btn-outline" id="apply-filters-btn">
                        <i class="fas fa-filter"></i>
                        <span class="btn-text">Aplicar</span>
                    </button>
                </div>
            </div>

            <div class="stats-row">
                <div class="stats-grid">
                    <div class="stat-card">
                        <h4>Total de Vendas</h4>
                        <div class="value" id="total-vendas">R$ 0,00</div>
                    </div>
                    <div class="stat-card">
                        <h4>Vendas do Mês</h4>
                        <div class="value" id="vendas-mes">R$ 0,00</div>
                    </div>
                    <div class="stat-card">
                        <h4>Orçamentos</h4>
                        <div class="value" id="total-orcamentos">0</div>
                    </div>
                    <div class="stat-card">
                        <h4>Taxa de Conversão</h4>
                        <div class="value" id="taxa-conversao">0%</div>
                    </div>
                </div>
            </div>

            <div class="charts-container">
                <div class="chart-row">
                    <div class="chart-card">
                        <h3>📈 Tendência de Vendas</h3>
                        <div class="chart-container">
                            <canvas id="tendencia-vendas-chart"></canvas>
                        </div>
                    </div>
                    <div class="chart-card">
                        <h3>📊 Vendas por Período</h3>
                        <div class="chart-container">
                            <canvas id="vendas-periodo-chart"></canvas>
                        </div>
                    </div>
                </div>
                
                <div class="chart-row">
                    <div class="chart-card">
                        <h3>✅ Status das Vendas</h3>
                        <div class="chart-container">
                            <canvas id="vendas-status-chart"></canvas>
                        </div>
                    </div>
                    <div class="chart-card">
                        <h3>📋 Status dos Orçamentos</h3>
                        <div class="chart-container">
                            <canvas id="orcamentos-status-chart"></canvas>
                        </div>
                    </div>
                </div>
                
                <div class="chart-row">
                    <div class="chart-card">
                        <h3>💰 Distribuição de Valores</h3>
                        <div class="chart-container">
                            <canvas id="valores-distribuicao-chart"></canvas>
                        </div>
                    </div>
                    <div class="chart-card">
                        <h3>💳 Formas de Pagamento</h3>
                        <div class="chart-container">
                            <canvas id="pagamentos-forma-chart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Aguardar DOM estar pronto
        setTimeout(() => {
            this.createAllCharts();
            this.loadStatistics();
        }, 100);
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.id === 'refresh-reports-btn') {
                this.refreshReports();
            } else if (e.target.id === 'export-reports-btn') {
                this.exportReports();
            } else if (e.target.id === 'apply-filters-btn') {
                this.applyFilters();
            }
        });

        document.addEventListener('change', (e) => {
            if (e.target.id === 'period-select') {
                this.currentPeriod = parseInt(e.target.value);
                this.refreshReports();
            }
        });
    }

    async createAllCharts() {
        console.log('📊 Criando todos os gráficos...');
        
        try {
            await this.cleanupCharts();
            
            // Criar gráficos com configurações responsivas
            await Promise.all([
                this.createTendenciaChart(),
                this.createVendasPeriodoChart(),
                this.createVendasStatusChart(),
                this.createOrcamentosStatusChart(),
                this.createValoresDistribuicaoChart(),
                this.createPagamentosFormaChart()
            ]);
            
            console.log('✅ Todos os gráficos criados com sucesso!');
            
        } catch (error) {
            console.error('❌ Erro ao criar gráficos:', error);
            this.showErrorState();
        }
    }

    async cleanupCharts() {
        console.log('🧹 Limpando gráficos existentes...');
        
        const chartIds = [
            'tendencia-vendas-chart',
            'vendas-periodo-chart',
            'vendas-status-chart',
            'orcamentos-status-chart',
            'valores-distribuicao-chart',
            'pagamentos-forma-chart'
        ];
        
        for (const id of chartIds) {
            const canvas = document.getElementById(id);
            if (canvas) {
                const existingChart = Chart.getChart(canvas);
                if (existingChart) {
                    existingChart.destroy();
                }
            }
        }
        
        // Aguardar limpeza
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    getResponsiveConfig() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: !this.isMobile,
                    position: this.isMobile ? 'bottom' : 'top',
                    labels: {
                        boxWidth: this.isMobile ? 12 : 16,
                        padding: this.isMobile ? 8 : 12,
                        font: {
                            size: this.isMobile ? 10 : 12
                        }
                    }
                },
                tooltip: {
                    enabled: true,
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#2563eb',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true,
                    titleFont: {
                        size: this.isMobile ? 11 : 13
                    },
                    bodyFont: {
                        size: this.isMobile ? 10 : 12
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    grid: {
                        display: !this.isMobile
                    },
                    ticks: {
                        maxRotation: this.isMobile ? 45 : 0,
                        minRotation: this.isMobile ? 45 : 0,
                        font: {
                            size: this.isMobile ? 9 : 11
                        }
                    }
                },
                y: {
                    display: true,
                    grid: {
                        display: !this.isMobile
                    },
                    ticks: {
                        font: {
                            size: this.isMobile ? 9 : 11
                        }
                    }
                }
            }
        };
    }

    async createTendenciaChart() {
        const canvas = document.getElementById('tendencia-vendas-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const config = this.getResponsiveConfig();
        
        const chartData = {
            labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
            datasets: [{
                label: 'Vendas',
                data: [12000, 19000, 15000, 25000, 22000, 30000],
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        };

        this.charts.set('tendencia', new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
                ...config,
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        }));
    }

    async createVendasPeriodoChart() {
        const canvas = document.getElementById('vendas-periodo-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const config = this.getResponsiveConfig();
        
        const chartData = {
            labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'],
            datasets: [{
                label: 'Vendas',
                data: [5000, 8000, 12000, 15000],
                backgroundColor: [
                    '#2563eb',
                    '#3b82f6',
                    '#60a5fa',
                    '#93c5fd'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        };

        this.charts.set('vendas-periodo', new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: config
        }));
    }

    async createVendasStatusChart() {
        const canvas = document.getElementById('vendas-status-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const config = this.getResponsiveConfig();
        
        const chartData = {
            labels: ['Concluídas', 'Pendentes', 'Canceladas'],
            datasets: [{
                data: [75, 20, 5],
                backgroundColor: [
                    '#10b981',
                    '#f59e0b',
                    '#ef4444'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        };

        this.charts.set('vendas-status', new Chart(ctx, {
            type: 'doughnut',
            data: chartData,
            options: {
                ...config,
                cutout: '60%'
            }
        }));
    }

    async createOrcamentosStatusChart() {
        const canvas = document.getElementById('orcamentos-status-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const config = this.getResponsiveConfig();
        
        const chartData = {
            labels: ['Aprovados', 'Pendentes', 'Rejeitados'],
            datasets: [{
                data: [60, 30, 10],
                backgroundColor: [
                    '#10b981',
                    '#f59e0b',
                    '#ef4444'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        };

        this.charts.set('orcamentos-status', new Chart(ctx, {
            type: 'doughnut',
            data: chartData,
            options: {
                ...config,
                cutout: '60%'
            }
        }));
    }

    async createValoresDistribuicaoChart() {
        const canvas = document.getElementById('valores-distribuicao-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const config = this.getResponsiveConfig();
        
        const chartData = {
            labels: ['Até R$ 100', 'R$ 100-500', 'R$ 500-1000', 'Acima R$ 1000'],
            datasets: [{
                label: 'Quantidade',
                data: [25, 40, 20, 15],
                backgroundColor: [
                    '#fbbf24',
                    '#f59e0b',
                    '#d97706',
                    '#92400e'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        };

        this.charts.set('valores-distribuicao', new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: config
        }));
    }

    async createPagamentosFormaChart() {
        const canvas = document.getElementById('pagamentos-forma-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const config = this.getResponsiveConfig();
        
        const chartData = {
            labels: ['Cartão', 'PIX', 'Dinheiro', 'Boleto'],
            datasets: [{
                data: [45, 30, 15, 10],
                backgroundColor: [
                    '#2563eb',
                    '#10b981',
                    '#f59e0b',
                    '#ef4444'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        };

        this.charts.set('pagamentos-forma', new Chart(ctx, {
            type: 'pie',
            data: chartData,
            options: config
        }));
    }

    async loadStatistics() {
        try {
            // Simular carregamento de estatísticas
            const stats = {
                totalVendas: 125000,
                vendasMes: 45000,
                totalOrcamentos: 150,
                taxaConversao: 75
            };

            document.getElementById('total-vendas').textContent = 
                new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalVendas);
            
            document.getElementById('vendas-mes').textContent = 
                new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.vendasMes);
            
            document.getElementById('total-orcamentos').textContent = stats.totalOrcamentos;
            document.getElementById('taxa-conversao').textContent = `${stats.taxaConversao}%`;

        } catch (error) {
            console.error('❌ Erro ao carregar estatísticas:', error);
        }
    }

    async refreshReports() {
        console.log('🔄 Atualizando relatórios...');
        
        try {
            await this.createAllCharts();
            await this.loadStatistics();
            
            // Mostrar feedback visual
            const btn = document.getElementById('refresh-reports-btn');
            if (btn) {
                btn.innerHTML = '<i class="fas fa-check"></i><span class="btn-text">Atualizado</span>';
                setTimeout(() => {
                    btn.innerHTML = '<i class="fas fa-sync-alt"></i><span class="btn-text">Atualizar</span>';
                }, 2000);
            }
            
        } catch (error) {
            console.error('❌ Erro ao atualizar relatórios:', error);
        }
    }

    async exportReports() {
        console.log('📤 Exportando relatórios...');
        
        try {
            // Simular exportação
            const btn = document.getElementById('export-reports-btn');
            if (btn) {
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span class="btn-text">Exportando...</span>';
                setTimeout(() => {
                    btn.innerHTML = '<i class="fas fa-download"></i><span class="btn-text">Exportar</span>';
                    alert('Relatórios exportados com sucesso!');
                }, 2000);
            }
        } catch (error) {
            console.error('❌ Erro ao exportar relatórios:', error);
        }
    }

    applyFilters() {
        console.log('🔍 Aplicando filtros...');
        this.refreshReports();
    }

    recreateCharts() {
        this.createAllCharts();
    }

    showErrorState() {
        const containers = document.querySelectorAll('.chart-container');
        containers.forEach(container => {
            container.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Erro ao carregar gráfico</p>
                    <button class="btn btn-sm btn-outline" onclick="window.relatoriosResponsivos.refreshReports()">
                        Tentar Novamente
                    </button>
                </div>
            `;
        });
    }
}

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.relatoriosResponsivos = new RelatoriosResponsivos();
});

// Exportar para uso global
window.RelatoriosResponsivos = RelatoriosResponsivos; 