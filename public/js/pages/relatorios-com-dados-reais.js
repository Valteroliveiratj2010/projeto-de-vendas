/**
 * RELATÓRIOS - VERSÃO COM DADOS REAIS
 * 6 gráficos: Tendência de Vendas, Vendas por Período, Status das Vendas, 
 * Status dos Orçamentos, Distribuição de Valores e Formas de Pagamento
 */

console.log('🚀 RELATÓRIOS COM DADOS REAIS - Carregando...');

class RelatoriosPageComDadosReais {
    constructor() {
        console.log('🎯 RelatoriosPageComDadosReais - Construtor iniciado');
        this.chartInstances = {};
        this.periodo = 30; // Padrão: 30 dias
        this.init();
    }

    async init() {
        console.log('🔧 RelatoriosPageComDadosReais - Inicializando...');

        try {
            // 1. Renderizar página
            this.renderPage();

            // 2. Aguardar DOM
            await this.waitForDOM();

            // 3. Carregar dados reais e criar gráficos
            await this.loadDataAndCreateCharts();

            // 4. Configurar event listeners
            this.setupEventListeners();

            console.log('✅ RelatoriosPageComDadosReais - Inicialização completa!');

        } catch (error) {
            console.error('❌ RelatoriosPageComDadosReais - Erro na inicialização:', error);
        }
    }

    renderPage() {
        console.log('📝 Renderizando página de relatórios...');

        const pageContainer = document.getElementById('relatorios-content');
        if (!pageContainer) {
            console.error('❌ Container relatorios-content não encontrado!');
            return;
        }

        pageContainer.innerHTML = `
            <div class="page-header">
                <div class="header-content">
                    <h2>Relatórios e Análises</h2>
                    <p>Visualize dados e insights do seu negócio</p>
                </div>
                <div class="header-actions">
                    <button class="btn btn-secondary" id="refresh-relatorios-btn">
                        <i class="fas fa-sync-alt"></i>
                        Atualizar
                    </button>
                    <button class="btn btn-primary" id="export-relatorios-btn">
                        <i class="fas fa-download"></i>
                        Exportar
                    </button>
                </div>
            </div>

            <div class="page-content">
                <!-- Filtros de Período -->
                <div class="filters-section">
                    <div class="period-selector">
                        <label for="period-select">Período:</label>
                        <select id="period-select">
                            <option value="7">Últimos 7 dias</option>
                            <option value="30" selected>Últimos 30 dias</option>
                            <option value="90">Últimos 3 meses</option>
                            <option value="365">Último ano</option>
                        </select>
                    </div>
                </div>

                <!-- Estatísticas Rápidas -->
                <div class="stats-row">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-chart-bar"></i>
                        </div>
                        <div class="stat-content">
                            <h3 id="total-vendas-periodo-stat">0</h3>
                            <p>Vendas no Período</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-dollar-sign"></i>
                        </div>
                        <div class="stat-content">
                            <h3 id="receita-periodo-stat">R$ 0,00</h3>
                            <p>Receita no Período</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-trending-up"></i>
                        </div>
                        <div class="stat-content">
                            <h3 id="crescimento-stat">0%</h3>
                            <p>Crescimento</p>
                        </div>
                    </div>
                </div>

                <!-- Gráficos -->
                <div class="charts-container">
                    <div class="chart-row">
                        <div class="chart-card">
                            <h3>Tendência de Vendas</h3>
                            <canvas id="tendencia-vendas-chart"></canvas>
                        </div>
                        <div class="chart-card">
                            <h3>Vendas por Período</h3>
                            <canvas id="vendas-periodo-chart"></canvas>
                        </div>
                    </div>
                    <div class="chart-row">
                        <div class="chart-card">
                            <h3>Status das Vendas</h3>
                            <canvas id="vendas-status-chart"></canvas>
                        </div>
                        <div class="chart-card">
                            <h3>Status dos Orçamentos</h3>
                            <canvas id="orcamentos-status-chart"></canvas>
                        </div>
                    </div>
                    <div class="chart-row">
                        <div class="chart-card">
                            <h3>Distribuição de Valores</h3>
                            <canvas id="valores-distribuicao-chart"></canvas>
                        </div>
                        <div class="chart-card">
                            <h3>Formas de Pagamento</h3>
                            <canvas id="pagamentos-forma-chart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        `;

        console.log('✅ Página renderizada com sucesso!');
    }

    async waitForDOM() {
        console.log('⏳ Aguardando DOM ser renderizado...');
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Verificar se todos os canvases estão disponíveis
        const canvases = [
            'tendencia-vendas-chart',
            'vendas-periodo-chart',
            'vendas-status-chart',
            'orcamentos-status-chart',
            'valores-distribuicao-chart',
            'pagamentos-forma-chart'
        ];

        for (const canvasId of canvases) {
            const canvas = document.getElementById(canvasId);
            if (!canvas) {
                console.error(`❌ Canvas ${canvasId} não encontrado`);
            } else {
                console.log(`✅ Canvas ${canvasId} encontrado`);
            }
        }

        console.log('✅ Todos os canvases verificados');
    }

    async loadDataAndCreateCharts() {
        console.log('📊 Carregando dados reais e criando gráficos...');

        try {
            // 1. Carregar estatísticas gerais
            await this.loadEstatisticasGerais();

            // 2. Carregar dados e criar gráficos
            await this.createTendenciaVendasChart();
            await this.createVendasPeriodoChart();
            await this.createVendasStatusChart();
            await this.createOrcamentosStatusChart();
            await this.createValoresDistribuicaoChart();
            await this.createPagamentosFormaChart();

            console.log('✅ Todos os gráficos criados com dados reais!');

        } catch (error) {
            console.error('❌ Erro ao carregar dados e criar gráficos:', error);
        }
    }

    async loadEstatisticasGerais() {
        console.log('📈 Carregando estatísticas gerais...');

        try {
            const response = await fetch(`/api/relatorios/graficos/estatisticas-gerais?periodo=${this.periodo}`);
            const result = await response.json();

            if (result.success) {
                const stats = result.data;

                // Atualizar cards de estatísticas com verificação de existência
                const totalVendasElement = document.getElementById('total-vendas-periodo-stat');
                const receitaElement = document.getElementById('receita-periodo-stat');
                const crescimentoElement = document.getElementById('crescimento-stat');

                if (totalVendasElement) {
                    totalVendasElement.textContent = stats.total_vendas || 0;
                }

                if (receitaElement) {
                    receitaElement.textContent = `R$ ${(stats.receita_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
                }

                if (crescimentoElement) {
                    crescimentoElement.textContent = `${stats.crescimento || 0}%`;
                }

                console.log('✅ Estatísticas gerais carregadas:', stats);
            } else {
                console.error('❌ Erro ao carregar estatísticas:', result.error);
            }

        } catch (error) {
            console.error('❌ Erro ao carregar estatísticas gerais:', error);
        }
    }

    async createTendenciaVendasChart() {
        console.log('📈 Criando gráfico de tendência de vendas...');

        try {
            const response = await fetch(`/api/relatorios/graficos/tendencia-vendas?periodo=${this.periodo}`);
            const result = await response.json();

            if (!result.success) {
                throw new Error('Erro ao carregar dados de tendência');
            }

            const canvas = document.getElementById('tendencia-vendas-chart');
            if (!canvas) return;

            // Destruir gráfico existente
            const existingChart = Chart.getChart(canvas);
            if (existingChart) {
                existingChart.destroy();
            }

            const data = result.data;
            const labels = data.map(item => {
                const date = new Date(item.data);
                return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            });
            const valores = data.map(item => parseFloat(item.valor_total));

            const chart = new Chart(canvas, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Valor Total (R$)',
                        data: valores,
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function (value) {
                                    return `R$ ${value.toLocaleString('pt-BR')}`;
                                }
                            }
                        }
                    }
                }
            });

            this.chartInstances['tendencia-vendas'] = chart;
            console.log('✅ Gráfico de tendência de vendas criado!');

        } catch (error) {
            console.error('❌ Erro no gráfico de tendência de vendas:', error);
        }
    }

    async createVendasPeriodoChart() {
        console.log('📊 Criando gráfico de vendas por período...');

        try {
            const response = await fetch(`/api/relatorios/graficos/vendas-periodo?periodo=${this.periodo}`);
            const result = await response.json();

            if (!result.success) {
                throw new Error('Erro ao carregar dados de vendas por período');
            }

            const canvas = document.getElementById('vendas-periodo-chart');
            if (!canvas) return;

            // Destruir gráfico existente
            const existingChart = Chart.getChart(canvas);
            if (existingChart) {
                existingChart.destroy();
            }

            const data = result.data;
            const labels = data.map(item => {
                const date = new Date(item.data);
                return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            });
            const quantidades = data.map(item => parseInt(item.quantidade));

            const chart = new Chart(canvas, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Quantidade de Vendas',
                        data: quantidades,
                        backgroundColor: '#10b981',
                        borderColor: '#059669',
                        borderWidth: 1,
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });

            this.chartInstances['vendas-periodo'] = chart;
            console.log('✅ Gráfico de vendas por período criado!');

        } catch (error) {
            console.error('❌ Erro no gráfico de vendas por período:', error);
        }
    }

    async createVendasStatusChart() {
        console.log('📋 Criando gráfico de status das vendas...');

        try {
            const response = await fetch(`/api/relatorios/graficos/vendas-status?periodo=${this.periodo}`);
            const result = await response.json();

            if (!result.success) {
                throw new Error('Erro ao carregar dados de status das vendas');
            }

            const canvas = document.getElementById('vendas-status-chart');
            if (!canvas) return;

            // Destruir gráfico existente
            const existingChart = Chart.getChart(canvas);
            if (existingChart) {
                existingChart.destroy();
            }

            const data = result.data;
            const labels = data.map(item => item.status);
            const quantidades = data.map(item => parseInt(item.quantidade));
            const cores = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

            const chart = new Chart(canvas, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: quantidades,
                        backgroundColor: cores.slice(0, labels.length),
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom' },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((context.parsed / total) * 100).toFixed(1);
                                    return `${context.label}: ${context.parsed} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });

            this.chartInstances['vendas-status'] = chart;
            console.log('✅ Gráfico de status das vendas criado!');

        } catch (error) {
            console.error('❌ Erro no gráfico de status das vendas:', error);
        }
    }

    async createOrcamentosStatusChart() {
        console.log('📝 Criando gráfico de status dos orçamentos...');

        try {
            const response = await fetch(`/api/relatorios/graficos/orcamentos-status?periodo=${this.periodo}`);
            const result = await response.json();

            if (!result.success) {
                throw new Error('Erro ao carregar dados de status dos orçamentos');
            }

            const canvas = document.getElementById('orcamentos-status-chart');
            if (!canvas) return;

            // Destruir gráfico existente
            const existingChart = Chart.getChart(canvas);
            if (existingChart) {
                existingChart.destroy();
            }

            const data = result.data;
            const labels = data.map(item => item.status);
            const quantidades = data.map(item => parseInt(item.quantidade));
            const cores = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

            const chart = new Chart(canvas, {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        data: quantidades,
                        backgroundColor: cores.slice(0, labels.length),
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom' },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((context.parsed / total) * 100).toFixed(1);
                                    return `${context.label}: ${context.parsed} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });

            this.chartInstances['orcamentos-status'] = chart;
            console.log('✅ Gráfico de status dos orçamentos criado!');

        } catch (error) {
            console.error('❌ Erro no gráfico de status dos orçamentos:', error);
        }
    }

    async createValoresDistribuicaoChart() {
        console.log('💰 Criando gráfico de distribuição de valores...');

        try {
            const response = await fetch(`/api/relatorios/graficos/valores-distribuicao?periodo=${this.periodo}`);
            const result = await response.json();

            if (!result.success) {
                throw new Error('Erro ao carregar dados de distribuição de valores');
            }

            const canvas = document.getElementById('valores-distribuicao-chart');
            if (!canvas) return;

            // Destruir gráfico existente
            const existingChart = Chart.getChart(canvas);
            if (existingChart) {
                existingChart.destroy();
            }

            const data = result.data;
            const labels = data.map(item => item.faixa_valor);
            const quantidades = data.map(item => parseInt(item.quantidade));

            const chart = new Chart(canvas, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Quantidade de Vendas',
                        data: quantidades,
                        backgroundColor: '#8b5cf6',
                        borderColor: '#7c3aed',
                        borderWidth: 1,
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });

            this.chartInstances['valores-distribuicao'] = chart;
            console.log('✅ Gráfico de distribuição de valores criado!');

        } catch (error) {
            console.error('❌ Erro no gráfico de distribuição de valores:', error);
        }
    }

    async createPagamentosFormaChart() {
        console.log('💳 Criando gráfico de formas de pagamento...');

        try {
            const response = await fetch(`/api/relatorios/graficos/pagamentos-forma?periodo=${this.periodo}`);
            const result = await response.json();

            if (!result.success) {
                throw new Error('Erro ao carregar dados de formas de pagamento');
            }

            const canvas = document.getElementById('pagamentos-forma-chart');
            if (!canvas) return;

            // Destruir gráfico existente
            const existingChart = Chart.getChart(canvas);
            if (existingChart) {
                existingChart.destroy();
            }

            const data = result.data;
            const labels = data.map(item => item.forma_pagamento);
            const valores = data.map(item => parseFloat(item.valor_total));
            const cores = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

            const chart = new Chart(canvas, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: valores,
                        backgroundColor: cores.slice(0, labels.length),
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom' },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((context.parsed / total) * 100).toFixed(1);
                                    return `${context.label}: R$ ${context.parsed.toLocaleString('pt-BR')} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });

            this.chartInstances['pagamentos-forma'] = chart;
            console.log('✅ Gráfico de formas de pagamento criado!');

        } catch (error) {
            console.error('❌ Erro no gráfico de formas de pagamento:', error);
        }
    }

    setupEventListeners() {
        console.log('🎧 Configurando event listeners...');

        // Selector de período
        const periodSelect = document.getElementById('period-select');
        if (periodSelect) {
            periodSelect.addEventListener('change', async (e) => {
                this.periodo = parseInt(e.target.value);
                console.log(`🔄 Período alterado para ${this.periodo} dias`);
                await this.loadDataAndCreateCharts();
            });
        }

        // Botão de atualizar
        const refreshBtn = document.getElementById('refresh-relatorios-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', async () => {
                console.log('🔄 Atualizando relatórios...');
                await this.loadDataAndCreateCharts();
            });
        }

        console.log('✅ Event listeners configurados');
    }

    cleanup() {
        console.log('🧹 Limpando gráficos...');

        try {
            // Destruir todos os gráficos
            Object.values(this.chartInstances).forEach(chart => {
                if (chart && typeof chart.destroy === 'function') {
                    chart.destroy();
                }
            });

            this.chartInstances = {};
            console.log('✅ Gráficos limpos!');

        } catch (error) {
            console.error('❌ Erro ao limpar gráficos:', error);
        }
    }
}

// Criar instância global
window.relatoriosPageComDadosReais = new RelatoriosPageComDadosReais(); 