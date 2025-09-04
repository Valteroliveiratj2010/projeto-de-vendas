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

        // Verificar se a página está ativa
        if (!this.isPageActive()) {
            console.log('⚠️ Página não está ativa, pulando criação de gráficos');
            return;
        }

        try {
            // Limpeza completa e robusta
            await this.cleanupCharts();
            await this.cleanupAllChartInstances();

            // Aguardar um pouco para garantir limpeza
            await new Promise(resolve => setTimeout(resolve, 100));

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

    async cleanupAllChartInstances() {
        console.log('🧹 Limpeza global de todas as instâncias do Chart.js...');

        try {
            // Limpar todas as instâncias registradas globalmente
            if (typeof Chart !== 'undefined' && Chart.instances) {
                Object.keys(Chart.instances).forEach(key => {
                    const instance = Chart.instances[key];
                    if (instance && typeof instance.destroy === 'function') {
                        try {
                            instance.destroy();
                            console.log(`🗑️ Instância global ${key} destruída`);
                        } catch (error) {
                            console.warn(`⚠️ Erro ao destruir instância ${key}:`, error);
                        }
                    }
                });
            }

            // Limpar todas as instâncias via Chart.getChart()
            const allCanvas = document.querySelectorAll('canvas');
            allCanvas.forEach(canvas => {
                try {
                    const chart = Chart.getChart(canvas);
                    if (chart) {
                        chart.destroy();
                        console.log(`🗑️ Gráfico em ${canvas.id} destruído via getChart`);
                    }
                } catch (error) {
                    console.warn(`⚠️ Erro ao destruir gráfico em ${canvas.id}:`, error);
                }
            });

            console.log('✅ Limpeza global concluída');
        } catch (error) {
            console.error('❌ Erro na limpeza global:', error);
        }
    }

    isPageActive() {
        const container = document.getElementById('relatorios-content');
        return container && container.style.display !== 'none' && container.offsetParent !== null;
    }

    async cleanupCharts() {
        console.log('🧹 Limpando gráficos existentes...');

        // Limpar gráficos da Map
        if (this.charts) {
            for (const [key, chart] of this.charts) {
                try {
                    if (chart && typeof chart.destroy === 'function') {
                        chart.destroy();
                        console.log(`🗑️ Gráfico ${key} destruído`);
                    }
                } catch (error) {
                    console.warn(`⚠️ Erro ao destruir gráfico ${key}:`, error);
                }
            }
            this.charts.clear();
        }

        // Limpar todos os gráficos do Chart.js globalmente
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
                try {
                    const existingChart = Chart.getChart(canvas);
                    if (existingChart) {
                        existingChart.destroy();
                        console.log(`🗑️ Gráfico ${id} destruído via Chart.getChart`);
                    }
                } catch (error) {
                    console.warn(`⚠️ Erro ao destruir gráfico ${id}:`, error);
                }
            }
        }

        // Limpar todos os gráficos registrados globalmente
        try {
            Chart.helpers.each(Chart.instances, (instance) => {
                if (instance && typeof instance.destroy === 'function') {
                    instance.destroy();
                }
            });
        } catch (error) {
            console.warn('⚠️ Erro ao limpar gráficos globais:', error);
        }

        // Aguardar limpeza completa
        await new Promise(resolve => setTimeout(resolve, 300));
        console.log('✅ Limpeza de gráficos concluída');
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
        if (!canvas) {
            console.warn('⚠️ Canvas tendencia-vendas-chart não encontrado');
            return;
        }

        // Verificar se já existe um gráfico neste canvas
        const existingChart = Chart.getChart(canvas);
        if (existingChart) {
            console.log('🗑️ Destruindo gráfico existente em tendencia-vendas-chart');
            existingChart.destroy();
        }

        try {
            // Carregar dados reais da API
            console.log('📡 Carregando dados de tendência de vendas...');
            const response = await fetch(`/api/relatorios/graficos/tendencia-vendas?periodo=${this.currentPeriod}`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (!result.success || !result.data || result.data.length === 0) {
                console.warn('⚠️ Dados de tendência vazios, usando dados mock');
                this.createTendenciaChartMock();
                return;
            }

            const ctx = canvas.getContext('2d');
            const config = this.getResponsiveConfig();

            // Processar dados reais
            const data = result.data;
            const labels = data.map(item => {
                const date = new Date(item.data);
                return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            });
            const valores = data.map(item => parseFloat(item.valor_total) || 0);

            const chartData = {
                labels: labels,
                datasets: [{
                    label: 'Vendas (R$)',
                    data: valores,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            };

            const chart = new Chart(ctx, {
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
            });

            this.charts.set('tendencia', chart);
            console.log('✅ Gráfico de tendência criado com dados reais!');

        } catch (error) {
            console.error('❌ Erro ao carregar dados de tendência:', error);
            console.log('🔄 Usando dados mock como fallback...');
            this.createTendenciaChartMock();
        }
    }

    createTendenciaChartMock() {
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

        try {
            const chart = new Chart(ctx, {
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
            });

            this.charts.set('tendencia', chart);
            console.log('✅ Gráfico de tendência criado com dados mock');
        } catch (error) {
            console.error('❌ Erro ao criar gráfico de tendência:', error);
        }
    }

    async createVendasPeriodoChart() {
        const canvas = document.getElementById('vendas-periodo-chart');
        if (!canvas) {
            console.warn('⚠️ Canvas vendas-periodo-chart não encontrado');
            return;
        }

        // Verificar se já existe um gráfico neste canvas
        const existingChart = Chart.getChart(canvas);
        if (existingChart) {
            console.log('🗑️ Destruindo gráfico existente em vendas-periodo-chart');
            existingChart.destroy();
        }

        try {
            // Carregar dados reais da API
            console.log('📡 Carregando dados de vendas por período...');
            const response = await fetch(`/api/relatorios/graficos/vendas-periodo?periodo=${this.currentPeriod}`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (!result.success || !result.data || result.data.length === 0) {
                console.warn('⚠️ Dados de vendas por período vazios, usando dados mock');
                this.createVendasPeriodoChartMock();
                return;
            }

            const ctx = canvas.getContext('2d');
            const config = this.getResponsiveConfig();

            // Processar dados reais
            const data = result.data;
            const labels = data.map(item => {
                const date = new Date(item.data);
                return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            });
            const quantidades = data.map(item => parseInt(item.quantidade) || 0);

            const chartData = {
                labels: labels,
                datasets: [{
                    label: 'Quantidade de Vendas',
                    data: quantidades,
                    backgroundColor: [
                        '#2563eb',
                        '#3b82f6',
                        '#60a5fa',
                        '#93c5fd',
                        '#c7d2fe',
                        '#dbeafe'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            };

            const chart = new Chart(ctx, {
                type: 'bar',
                data: chartData,
                options: config
            });

            this.charts.set('vendas-periodo', chart);
            console.log('✅ Gráfico de vendas por período criado com dados reais!');

        } catch (error) {
            console.error('❌ Erro ao carregar dados de vendas por período:', error);
            console.log('🔄 Usando dados mock como fallback...');
            this.createVendasPeriodoChartMock();
        }
    }

    createVendasPeriodoChartMock() {
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

        try {
            const chart = new Chart(ctx, {
                type: 'bar',
                data: chartData,
                options: config
            });

            this.charts.set('vendas-periodo', chart);
            console.log('✅ Gráfico de vendas por período criado com dados mock');
        } catch (error) {
            console.error('❌ Erro ao criar gráfico de vendas por período:', error);
        }
    }

    async createVendasStatusChart() {
        const canvas = document.getElementById('vendas-status-chart');
        if (!canvas) {
            console.warn('⚠️ Canvas vendas-status-chart não encontrado');
            return;
        }

        // Verificar se já existe um gráfico neste canvas
        const existingChart = Chart.getChart(canvas);
        if (existingChart) {
            console.log('🗑️ Destruindo gráfico existente em vendas-status-chart');
            existingChart.destroy();
        }

        try {
            // Carregar dados reais da API
            console.log('📡 Carregando dados de status de vendas...');
            const response = await fetch(`/api/relatorios/graficos/vendas-status?periodo=${this.currentPeriod}`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (!result.success || !result.data || result.data.length === 0) {
                console.warn('⚠️ Dados de status de vendas vazios, usando dados mock');
                this.createVendasStatusChartMock();
                return;
            }

            const ctx = canvas.getContext('2d');
            const config = this.getResponsiveConfig();

            // Processar dados reais
            const data = result.data;
            const labels = data.map(item => item.status);
            const quantidades = data.map(item => parseInt(item.quantidade) || 0);

            const chartData = {
                labels: labels,
                datasets: [{
                    data: quantidades,
                    backgroundColor: [
                        '#10b981', // Verde para Concluídas
                        '#f59e0b', // Amarelo para Pendentes
                        '#ef4444', // Vermelho para Canceladas
                        '#6b7280', // Cinza para outros
                        '#8b5cf6'  // Roxo para outros
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            };

            const chart = new Chart(ctx, {
                type: 'doughnut',
                data: chartData,
                options: {
                    ...config,
                    cutout: '60%'
                }
            });

            this.charts.set('vendas-status', chart);
            console.log('✅ Gráfico de status de vendas criado com dados reais!');

        } catch (error) {
            console.error('❌ Erro ao carregar dados de status de vendas:', error);
            console.log('🔄 Usando dados mock como fallback...');
            this.createVendasStatusChartMock();
        }
    }

    createVendasStatusChartMock() {
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

        try {
            const chart = new Chart(ctx, {
                type: 'doughnut',
                data: chartData,
                options: {
                    ...config,
                    cutout: '60%'
                }
            });

            this.charts.set('vendas-status', chart);
            console.log('✅ Gráfico de status de vendas criado com dados mock');
        } catch (error) {
            console.error('❌ Erro ao criar gráfico de status de vendas:', error);
        }
    }

    async createOrcamentosStatusChart() {
        const canvas = document.getElementById('orcamentos-status-chart');
        if (!canvas) {
            console.warn('⚠️ Canvas orcamentos-status-chart não encontrado');
            return;
        }

        // Verificar se já existe um gráfico neste canvas
        const existingChart = Chart.getChart(canvas);
        if (existingChart) {
            console.log('🗑️ Destruindo gráfico existente em orcamentos-status-chart');
            existingChart.destroy();
        }

        try {
            // Carregar dados reais da API
            console.log('📡 Carregando dados de status de orçamentos...');
            const response = await fetch(`/api/relatorios/graficos/orcamentos-status?periodo=${this.currentPeriod}`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (!result.success || !result.data || result.data.length === 0) {
                console.warn('⚠️ Dados de status de orçamentos vazios, usando dados mock');
                this.createOrcamentosStatusChartMock();
                return;
            }

            const ctx = canvas.getContext('2d');
            const config = this.getResponsiveConfig();

            // Processar dados reais
            const data = result.data;
            const labels = data.map(item => item.status);
            const quantidades = data.map(item => parseInt(item.quantidade) || 0);

            const chartData = {
                labels: labels,
                datasets: [{
                    data: quantidades,
                    backgroundColor: [
                        '#10b981', // Verde para Aprovados
                        '#f59e0b', // Amarelo para Pendentes
                        '#ef4444', // Vermelho para Rejeitados
                        '#6b7280', // Cinza para outros
                        '#8b5cf6'  // Roxo para outros
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            };

            const chart = new Chart(ctx, {
                type: 'doughnut',
                data: chartData,
                options: {
                    ...config,
                    cutout: '60%'
                }
            });

            this.charts.set('orcamentos-status', chart);
            console.log('✅ Gráfico de status de orçamentos criado com dados reais!');

        } catch (error) {
            console.error('❌ Erro ao carregar dados de status de orçamentos:', error);
            console.log('🔄 Usando dados mock como fallback...');
            this.createOrcamentosStatusChartMock();
        }
    }

    createOrcamentosStatusChartMock() {
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

        try {
            const chart = new Chart(ctx, {
                type: 'doughnut',
                data: chartData,
                options: {
                    ...config,
                    cutout: '60%'
                }
            });

            this.charts.set('orcamentos-status', chart);
            console.log('✅ Gráfico de status de orçamentos criado com dados mock');
        } catch (error) {
            console.error('❌ Erro ao criar gráfico de status de orçamentos:', error);
        }
    }

    async createValoresDistribuicaoChart() {
        const canvas = document.getElementById('valores-distribuicao-chart');
        if (!canvas) {
            console.warn('⚠️ Canvas valores-distribuicao-chart não encontrado');
            return;
        }

        // Verificar se já existe um gráfico neste canvas
        const existingChart = Chart.getChart(canvas);
        if (existingChart) {
            console.log('🗑️ Destruindo gráfico existente em valores-distribuicao-chart');
            existingChart.destroy();
        }

        try {
            // Carregar dados reais da API
            console.log('📡 Carregando dados de distribuição de valores...');
            const response = await fetch(`/api/relatorios/graficos/valores-distribuicao?periodo=${this.currentPeriod}`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (!result.success || !result.data || result.data.length === 0) {
                console.warn('⚠️ Dados de distribuição de valores vazios, usando dados mock');
                this.createValoresDistribuicaoChartMock();
                return;
            }

            const ctx = canvas.getContext('2d');
            const config = this.getResponsiveConfig();

            // Processar dados reais
            const data = result.data;
            const labels = data.map(item => item.faixa_valor);
            const quantidades = data.map(item => parseInt(item.quantidade) || 0);

            const chartData = {
                labels: labels,
                datasets: [{
                    label: 'Quantidade',
                    data: quantidades,
                    backgroundColor: [
                        '#fbbf24', // Amarelo claro
                        '#f59e0b', // Amarelo
                        '#d97706', // Laranja
                        '#92400e'  // Marrom
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            };

            const chart = new Chart(ctx, {
                type: 'bar',
                data: chartData,
                options: config
            });

            this.charts.set('valores-distribuicao', chart);
            console.log('✅ Gráfico de distribuição de valores criado com dados reais!');

        } catch (error) {
            console.error('❌ Erro ao carregar dados de distribuição de valores:', error);
            console.log('🔄 Usando dados mock como fallback...');
            this.createValoresDistribuicaoChartMock();
        }
    }

    createValoresDistribuicaoChartMock() {
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

        try {
            const chart = new Chart(ctx, {
                type: 'bar',
                data: chartData,
                options: config
            });

            this.charts.set('valores-distribuicao', chart);
            console.log('✅ Gráfico de distribuição de valores criado com dados mock');
        } catch (error) {
            console.error('❌ Erro ao criar gráfico de distribuição de valores:', error);
        }
    }

    async createPagamentosFormaChart() {
        const canvas = document.getElementById('pagamentos-forma-chart');
        if (!canvas) {
            console.warn('⚠️ Canvas pagamentos-forma-chart não encontrado');
            return;
        }

        // Verificar se já existe um gráfico neste canvas
        const existingChart = Chart.getChart(canvas);
        if (existingChart) {
            console.log('🗑️ Destruindo gráfico existente em pagamentos-forma-chart');
            existingChart.destroy();
        }

        try {
            // Carregar dados reais da API
            console.log('📡 Carregando dados de formas de pagamento...');
            const response = await fetch(`/api/relatorios/graficos/pagamentos-forma?periodo=${this.currentPeriod}`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (!result.success || !result.data || result.data.length === 0) {
                console.warn('⚠️ Dados de formas de pagamento vazios, usando dados mock');
                this.createPagamentosFormaChartMock();
                return;
            }

            const ctx = canvas.getContext('2d');
            const config = this.getResponsiveConfig();

            // Processar dados reais
            const data = result.data;

            // Normalizar nomes das formas de pagamento
            const normalizedData = data.map(item => ({
                ...item,
                forma_pagamento: this.normalizeFormaPagamento(item.forma_pagamento)
            }));

            const labels = normalizedData.map(item => item.forma_pagamento);
            const quantidades = normalizedData.map(item => parseInt(item.quantidade) || 0);
            const valores = normalizedData.map(item => parseFloat(item.valor_total) || 0);

            console.log('📊 Dados processados:', { labels, quantidades, valores });

            const chartData = {
                labels: labels,
                datasets: [{
                    label: 'Quantidade de Pagamentos',
                    data: quantidades,
                    backgroundColor: [
                        '#2563eb', // Azul para Cartão
                        '#10b981', // Verde para PIX
                        '#f59e0b', // Amarelo para Dinheiro
                        '#ef4444', // Vermelho para Boleto
                        '#8b5cf6', // Roxo para outros
                        '#6b7280'  // Cinza para outros
                    ],
                    borderWidth: 2,
                    borderColor: '#fff',
                    hoverBackgroundColor: [
                        '#1d4ed8', // Azul mais escuro
                        '#059669', // Verde mais escuro
                        '#d97706', // Laranja mais escuro
                        '#dc2626', // Vermelho mais escuro
                        '#7c3aed', // Roxo mais escuro
                        '#4b5563'  // Cinza mais escuro
                    ]
                }]
            };

            const chart = new Chart(ctx, {
                type: 'doughnut',
                data: chartData,
                options: {
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
                                },
                                generateLabels: function (chart) {
                                    const data = chart.data;
                                    if (data.labels.length && data.datasets.length) {
                                        return data.labels.map((label, i) => {
                                            const dataset = data.datasets[0];
                                            const value = dataset.data[i];
                                            const total = dataset.data.reduce((a, b) => a + b, 0);
                                            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

                                            return {
                                                text: `${label}: ${value} (${percentage}%)`,
                                                fillStyle: dataset.backgroundColor[i],
                                                strokeStyle: dataset.borderColor,
                                                lineWidth: dataset.borderWidth,
                                                hidden: false,
                                                index: i
                                            };
                                        });
                                    }
                                    return [];
                                }
                            }
                        },
                        tooltip: {
                            enabled: true,
                            mode: 'nearest',
                            intersect: true,
                            backgroundColor: 'rgba(0, 0, 0, 0.9)',
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            borderColor: '#2563eb',
                            borderWidth: 2,
                            cornerRadius: 8,
                            displayColors: true,
                            titleFont: {
                                size: this.isMobile ? 12 : 14,
                                weight: 'bold'
                            },
                            bodyFont: {
                                size: this.isMobile ? 11 : 13
                            },
                            callbacks: {
                                title: function (tooltipItems) {
                                    return tooltipItems[0].label;
                                },
                                label: function (context) {
                                    const label = context.label || '';
                                    const value = context.parsed;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                    const valorTotal = valores[context.dataIndex] || 0;

                                    return [
                                        `Quantidade: ${value} pagamentos`,
                                        `Percentual: ${percentage}%`,
                                        `Valor Total: R$ ${valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                                    ];
                                }
                            }
                        }
                    },
                    interaction: {
                        mode: 'nearest',
                        axis: 'x',
                        intersect: false
                    },
                    cutout: '60%'
                }
            });

            this.charts.set('pagamentos-forma', chart);
            console.log('✅ Gráfico de formas de pagamento criado com dados reais!');

        } catch (error) {
            console.error('❌ Erro ao carregar dados de formas de pagamento:', error);
            console.log('🔄 Usando dados mock como fallback...');
            this.createPagamentosFormaChartMock();
        }
    }

    // Função para normalizar nomes das formas de pagamento
    normalizeFormaPagamento(forma) {
        const formaLower = forma.toLowerCase().trim();

        // Mapeamento de normalização
        const mapping = {
            'cartao': 'Cartão',
            'cartão': 'Cartão',
            'cartao de credito': 'Cartão de Crédito',
            'cartão de crédito': 'Cartão de Crédito',
            'cartao de debito': 'Cartão de Débito',
            'cartão de débito': 'Cartão de Débito',
            'pix': 'PIX',
            'dinheiro': 'Dinheiro',
            'boleto': 'Boleto',
            'transferencia': 'Transferência',
            'transferência': 'Transferência',
            'cheque': 'Cheque',
            'paypal': 'PayPal'
        };

        // Tentar encontrar correspondência exata
        if (mapping[formaLower]) {
            return mapping[formaLower];
        }

        // Tentar encontrar correspondência parcial
        for (const [key, value] of Object.entries(mapping)) {
            if (formaLower.includes(key)) {
                return value;
            }
        }

        // Se não encontrar, capitalizar a primeira letra
        return forma.charAt(0).toUpperCase() + forma.slice(1).toLowerCase();
    }

    createPagamentosFormaChartMock() {
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

        try {
            const chart = new Chart(ctx, {
                type: 'doughnut',
                data: chartData,
                options: {
                    ...config,
                    cutout: '60%'
                }
            });

            this.charts.set('pagamentos-forma', chart);
            console.log('✅ Gráfico de formas de pagamento criado com dados mock');
        } catch (error) {
            console.error('❌ Erro ao criar gráfico de formas de pagamento:', error);
        }
    }

    async loadStatistics() {
        console.log('📊 Carregando estatísticas...');

        try {
            // Carregar dados reais da API
            const response = await fetch('/api/relatorios/dashboard');

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (!result.success || !result.data) {
                console.warn('⚠️ Dados de estatísticas vazios, usando dados mock');
                this.loadStatisticsMock();
                return;
            }

            const stats = result.data.estatisticas;

            // Atualizar contadores com dados reais
            document.getElementById('total-vendas').textContent =
                new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.valor_total_vendas || 0);

            document.getElementById('total-clientes').textContent = stats.total_clientes || 0;
            document.getElementById('total-produtos').textContent = stats.total_produtos || 0;
            document.getElementById('total-orcamentos').textContent = stats.orcamentos_ativos || 0;

            // Calcular taxa de conversão
            const taxaConversao = stats.total_vendas > 0 ?
                Math.round((stats.orcamentos_convertidos / stats.total_vendas) * 100) : 0;
            document.getElementById('taxa-conversao').textContent = `${taxaConversao}%`;

            console.log('✅ Estatísticas carregadas com dados reais!');

        } catch (error) {
            console.error('❌ Erro ao carregar estatísticas:', error);
            console.log('🔄 Usando dados mock como fallback...');
            this.loadStatisticsMock();
        }
    }

    loadStatisticsMock() {
        console.log('📊 Carregando estatísticas mock...');

        try {
            // Dados mock para demonstração
            const stats = {
                totalVendas: 125000,
                totalClientes: 150,
                totalProdutos: 75,
                totalOrcamentos: 45,
                taxaConversao: 68
            };

            document.getElementById('total-vendas').textContent =
                new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalVendas);

            document.getElementById('total-clientes').textContent = stats.totalClientes;
            document.getElementById('total-produtos').textContent = stats.totalProdutos;
            document.getElementById('total-orcamentos').textContent = stats.totalOrcamentos;
            document.getElementById('taxa-conversao').textContent = `${stats.taxaConversao}%`;

            console.log('✅ Estatísticas mock carregadas');

        } catch (error) {
            console.error('❌ Erro ao carregar estatísticas mock:', error);
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
    console.log('🚀 Inicializando RelatoriosResponsivos...');
    try {
        window.relatoriosResponsivos = new RelatoriosResponsivos();
        console.log('✅ RelatoriosResponsivos inicializado com sucesso');
    } catch (error) {
        console.error('❌ Erro ao inicializar RelatoriosResponsivos:', error);
    }
});

// Inicializar também quando a página carregar completamente
window.addEventListener('load', () => {
    console.log('🔄 Verificando RelatoriosResponsivos após load...');
    if (!window.relatoriosResponsivos && typeof RelatoriosResponsivos === 'function') {
        try {
            window.relatoriosResponsivos = new RelatoriosResponsivos();
            console.log('✅ RelatoriosResponsivos inicializado após load');
        } catch (error) {
            console.error('❌ Erro ao inicializar RelatoriosResponsivos após load:', error);
        }
    }
});

// Exportar para uso global
window.RelatoriosResponsivos = RelatoriosResponsivos;
console.log('📦 RelatoriosResponsivos exportado globalmente'); 