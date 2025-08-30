/**
 * RELATÓRIOS - VERSÃO SIMPLIFICADA E FUNCIONAL
 * Foco em fazer os gráficos aparecerem
 */

console.log('🚀 RELATÓRIOS SIMPLIFICADO - Carregando...');

class RelatoriosPageSimples {
    constructor() {
        console.log('🎯 RelatoriosPageSimples - Construtor iniciado');
        this.chartInstances = {};
        this.init();
    }
    
    async init() {
        console.log('🔧 RelatoriosPageSimples - Inicializando...');
        
        try {
            // 1. Renderizar página
            this.renderPage();
            
            // 2. Aguardar DOM
            await this.waitForDOM();
            
            // 3. Criar gráficos simples
            this.createSimpleCharts();
            
            console.log('✅ RelatoriosPageSimples - Inicialização completa!');
            
        } catch (error) {
            console.error('❌ RelatoriosPageSimples - Erro na inicialização:', error);
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
                    <div class="filter-buttons">
                        <button class="btn btn-outline active" id="filter-vendas-relatorios">Vendas</button>
                        <button class="btn btn-outline" id="filter-produtos-relatorios">Produtos</button>
                        <button class="btn btn-outline" id="filter-clientes-relatorios">Clientes</button>
                    </div>
                </div>

                <!-- Estatísticas Rápidas -->
                <div class="stats-row">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-chart-bar"></i>
                        </div>
                        <div class="stat-content">
                            <h3 id="total-vendas-periodo-stat">7</h3>
                            <p>Vendas no Período</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-dollar-sign"></i>
                        </div>
                        <div class="stat-content">
                            <h3 id="receita-periodo-stat">R$ 63.000,00</h3>
                            <p>Receita no Período</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-trending-up"></i>
                        </div>
                        <div class="stat-content">
                            <h3 id="crescimento-stat">15%</h3>
                            <p>Crescimento</p>
                        </div>
                    </div>
                </div>

                <!-- Gráficos -->
                <div class="charts-container">
                    <div class="chart-row">
                        <div class="chart-card">
                            <h3>Vendas por Período</h3>
                            <canvas id="vendas-periodo-chart" style="width: 100%; height: 300px;"></canvas>
                        </div>
                        <div class="chart-card">
                            <h3>Formas de Pagamento</h3>
                            <canvas id="pagamentos-forma-chart" style="width: 100%; height: 300px;"></canvas>
                        </div>
                    </div>
                    <div class="chart-row">
                        <div class="chart-card">
                            <h3>Produtos Mais Vendidos</h3>
                            <canvas id="produtos-vendidos-chart" style="width: 100%; height: 300px;"></canvas>
                        </div>
                        <div class="chart-card">
                            <h3>Clientes Mais Ativos</h3>
                            <canvas id="clientes-ativos-chart" style="width: 100%; height: 300px;"></canvas>
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
            'vendas-periodo-chart',
            'pagamentos-forma-chart',
            'produtos-vendidos-chart',
            'clientes-ativos-chart'
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
    
    createSimpleCharts() {
        console.log('📊 Criando gráficos simples...');
        
        try {
            // Gráfico 1: Vendas por Período
            this.createVendasChart();
            
            // Gráfico 2: Formas de Pagamento
            this.createPagamentosChart();
            
            // Gráfico 3: Produtos
            this.createProdutosChart();
            
            // Gráfico 4: Clientes
            this.createClientesChart();
            
            console.log('✅ Todos os gráficos criados!');
            
        } catch (error) {
            console.error('❌ Erro ao criar gráficos:', error);
        }
    }
    
    createVendasChart() {
        console.log('📊 Criando gráfico de vendas...');
        
        try {
            const canvas = document.getElementById('vendas-periodo-chart');
            if (!canvas) {
                console.error('❌ Canvas vendas-periodo-chart não encontrado');
                return;
            }
            
            // Destruir gráfico existente se houver
            const existingChart = Chart.getChart(canvas);
            if (existingChart) {
                existingChart.destroy();
            }
            
            const chart = new Chart(canvas, {
                type: 'bar',
                data: {
                    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
                    datasets: [{
                        label: 'Vendas por Período (R$)',
                        data: [12000, 15000, 13000, 18000, 16000, 20000],
                        backgroundColor: '#3b82f6',
                        borderColor: '#2563eb',
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
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return `R$ ${value.toLocaleString('pt-BR')}`;
                                }
                            }
                        }
                    }
                }
            });
            
            this.chartInstances['vendas'] = chart;
            console.log('✅ Gráfico de vendas criado!');
            
        } catch (error) {
            console.error('❌ Erro no gráfico de vendas:', error);
        }
    }
    
    createPagamentosChart() {
        console.log('🍩 Criando gráfico de pagamentos...');
        
        try {
            const canvas = document.getElementById('pagamentos-forma-chart');
            if (!canvas) {
                console.error('❌ Canvas pagamentos-forma-chart não encontrado');
                return;
            }
            
            // Destruir gráfico existente se houver
            const existingChart = Chart.getChart(canvas);
            if (existingChart) {
                existingChart.destroy();
            }
            
            const chart = new Chart(canvas, {
                type: 'doughnut',
                data: {
                    labels: ['Dinheiro', 'Cartão', 'PIX', 'Transferência'],
                    datasets: [{
                        data: [30, 25, 35, 10],
                        backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
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
                                label: function(context) {
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((context.parsed / total) * 100).toFixed(1);
                                    return `${context.label}: ${context.parsed} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
            
            this.chartInstances['pagamentos'] = chart;
            console.log('✅ Gráfico de pagamentos criado!');
            
        } catch (error) {
            console.error('❌ Erro no gráfico de pagamentos:', error);
        }
    }
    
    createProdutosChart() {
        console.log('📦 Criando gráfico de produtos...');
        
        try {
            const canvas = document.getElementById('produtos-vendidos-chart');
            if (!canvas) {
                console.error('❌ Canvas produtos-vendidos-chart não encontrado');
                return;
            }
            
            // Destruir gráfico existente se houver
            const existingChart = Chart.getChart(canvas);
            if (existingChart) {
                existingChart.destroy();
            }
            
            const chart = new Chart(canvas, {
                type: 'bar',
                data: {
                    labels: ['Produto A', 'Produto B', 'Produto C', 'Produto D'],
                    datasets: [{
                        label: 'Quantidade Vendida',
                        data: [45, 32, 28, 15],
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
            
            this.chartInstances['produtos'] = chart;
            console.log('✅ Gráfico de produtos criado!');
            
        } catch (error) {
            console.error('❌ Erro no gráfico de produtos:', error);
        }
    }
    
    createClientesChart() {
        console.log('👥 Criando gráfico de clientes...');
        
        try {
            const canvas = document.getElementById('clientes-ativos-chart');
            if (!canvas) {
                console.error('❌ Canvas clientes-ativos-chart não encontrado');
                return;
            }
            
            // Destruir gráfico existente se houver
            const existingChart = Chart.getChart(canvas);
            if (existingChart) {
                existingChart.destroy();
            }
            
            const chart = new Chart(canvas, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
                    datasets: [{
                        label: 'Clientes Ativos',
                        data: [12, 15, 18, 22, 25, 28],
                        borderColor: '#8b5cf6',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
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
                            beginAtZero: true
                        }
                    }
                }
            });
            
            this.chartInstances['clientes'] = chart;
            console.log('✅ Gráfico de clientes criado!');
            
        } catch (error) {
            console.error('❌ Erro no gráfico de clientes:', error);
        }
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
window.relatoriosPageSimples = new RelatoriosPageSimples(); 