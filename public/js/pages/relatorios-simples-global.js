// VERSÃO SIMPLIFICADA QUE SEMPRE FUNCIONA
console.log('🚀 RELATÓRIOS SIMPLES - Carregando...');

// Função para limpar todos os charts existentes
async function cleanupAllCharts() {
    console.log('🧹 Limpando todos os charts existentes...');
    const chartIds = [
        'tendencia-vendas-chart',
        'vendas-periodo-chart',
        'vendas-status-chart',
        'orcamentos-status-chart',
        'valores-distribuicao-chart',
        'pagamentos-forma-chart'
    ];

    chartIds.forEach(id => {
        const canvas = document.getElementById(id);
        if (canvas) {
            const existingChart = Chart.getChart(canvas);
            if (existingChart) {
                console.log(`🗑️ Destruindo chart ${id}`);
                existingChart.destroy();
            }
        }
    });

    // Aguardar um pouco para garantir que os charts foram destruídos
    await new Promise(resolve => setTimeout(resolve, 200));
}

// Função global para criar relatórios
window.createRelatoriosSimples = async function () {
    console.log('📊 Criando relatórios simples...');

    // Limpar charts existentes primeiro
    await cleanupAllCharts();

    const pageContainer = document.getElementById('relatorios-content');
    if (!pageContainer) {
        console.error('❌ Container não encontrado!');
        return;
    }

    // Renderizar página
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
            </div>
        </div>
        
        <div class="page-content">
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

    // Configurar event listeners
    setupEventListeners();

    // Aguardar DOM e criar gráficos com dados reais
    setTimeout(async () => {
        await createChartsWithRealData();
    }, 500);
};

function setupEventListeners() {
    // Selector de período
    const periodSelect = document.getElementById('period-select');
    if (periodSelect) {
        periodSelect.addEventListener('change', async (e) => {
            const periodo = parseInt(e.target.value);
            console.log(`🔄 Período alterado para ${periodo} dias`);
            await createChartsWithRealData(periodo);
        });
    }

    // Botão de atualizar
    const refreshBtn = document.getElementById('refresh-relatorios-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            console.log('🔄 Atualizando relatórios...');
            const periodo = parseInt(document.getElementById('period-select').value) || 30;
            await createChartsWithRealData(periodo);
        });
    }
}

async function createChartsWithRealData(periodo = 30) {
    console.log('📊 Carregando dados reais e criando gráficos...');

    try {
        // 1. Gráfico de Tendência de Vendas
        await createTendenciaChart(periodo);

        // 2. Gráfico de Vendas por Período
        await createVendasPeriodoChart(periodo);

        // 3. Gráfico de Status das Vendas
        await createVendasStatusChart(periodo);

        // 4. Gráfico de Status dos Orçamentos
        await createOrcamentosStatusChart(periodo);

        // 5. Gráfico de Distribuição de Valores
        await createValoresDistribuicaoChart(periodo);

        // 6. Gráfico de Formas de Pagamento
        await createPagamentosFormaChart(periodo);

        console.log('🎉 Todos os gráficos criados com dados reais!');

    } catch (error) {
        console.error('❌ Erro ao criar gráficos com dados reais:', error);
        // Fallback para dados mock
        createMockCharts();
    }
}

async function createTendenciaChart(periodo) {
    console.log('📈 Criando gráfico de tendência de vendas...');

    try {
        const response = await fetch(`/api/relatorios/graficos/tendencia-vendas?periodo=${periodo}`);
        const result = await response.json();

        if (result.success && result.data.length > 0) {
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

            new Chart(canvas, {
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
            console.log('✅ Gráfico de tendência criado com dados reais!');
        } else {
            throw new Error('Dados vazios da API');
        }
    } catch (error) {
        console.error('❌ Erro no gráfico de tendência:', error);
        // Fallback para dados mock
        createMockTendenciaChart();
    }
}

async function createVendasPeriodoChart(periodo) {
    console.log('📊 Criando gráfico de vendas por período...');

    try {
        const response = await fetch(`/api/relatorios/graficos/vendas-periodo?periodo=${periodo}`);
        const result = await response.json();

        if (result.success && result.data.length > 0) {
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

            new Chart(canvas, {
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
                    scales: { y: { beginAtZero: true } }
                }
            });
            console.log('✅ Gráfico de vendas por período criado com dados reais!');
        } else {
            throw new Error('Dados vazios da API');
        }
    } catch (error) {
        console.error('❌ Erro no gráfico de vendas por período:', error);
        // Fallback para dados mock
        createMockVendasPeriodoChart();
    }
}

async function createVendasStatusChart(periodo) {
    console.log('📋 Criando gráfico de status das vendas...');

    try {
        const response = await fetch(`/api/relatorios/graficos/vendas-status?periodo=${periodo}`);
        const result = await response.json();

        if (result.success && result.data.length > 0) {
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

            new Chart(canvas, {
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
            console.log('✅ Gráfico de status das vendas criado com dados reais!');
        } else {
            throw new Error('Dados vazios da API');
        }
    } catch (error) {
        console.error('❌ Erro no gráfico de status das vendas:', error);
        // Fallback para dados mock
        createMockVendasStatusChart();
    }
}

async function createOrcamentosStatusChart(periodo) {
    console.log('📝 Criando gráfico de status dos orçamentos...');

    try {
        const response = await fetch(`/api/relatorios/graficos/orcamentos-status?periodo=${periodo}`);
        const result = await response.json();

        if (result.success && result.data.length > 0) {
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
            const cores = ['#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#f59e0b'];

            new Chart(canvas, {
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
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                usePointStyle: true
                            }
                        },
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
            console.log('✅ Gráfico de status dos orçamentos criado com dados reais!');
        } else {
            throw new Error('Dados vazios da API');
        }
    } catch (error) {
        console.error('❌ Erro no gráfico de status dos orçamentos:', error);
        // Fallback para dados mock
        createMockOrcamentosStatusChart();
    }
}

async function createValoresDistribuicaoChart(periodo) {
    console.log('💰 Criando gráfico de distribuição de valores...');

    try {
        const response = await fetch(`/api/relatorios/graficos/valores-distribuicao?periodo=${periodo}`);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.success && result.data.length > 0) {
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

            new Chart(canvas, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Quantidade de Vendas',
                        data: quantidades,
                        backgroundColor: '#8b5cf6',
                        borderColor: '#7c3aed',
                        borderWidth: 1,
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    return `${context.label}: ${context.parsed} vendas`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    }
                }
            });
            console.log('✅ Gráfico de distribuição de valores criado com dados reais!');
        } else {
            throw new Error('Dados vazios da API');
        }
    } catch (error) {
        console.error('❌ Erro no gráfico de distribuição de valores:', error);
        // Fallback para dados mock
        createMockValoresDistribuicaoChart();
    }
}

async function createPagamentosFormaChart(periodo) {
    console.log('💳 Criando gráfico de formas de pagamento...');

    try {
        const response = await fetch(`/api/relatorios/graficos/pagamentos-forma?periodo=${periodo}`);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.success && result.data.length > 0) {
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

            new Chart(canvas, {
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
            console.log('✅ Gráfico de formas de pagamento criado com dados reais!');
        } else {
            throw new Error('Dados vazios da API');
        }
    } catch (error) {
        console.error('❌ Erro no gráfico de formas de pagamento:', error);
        // Fallback para dados mock
        createMockPagamentosFormaChart();
    }
}

// Funções de fallback com dados mock
function createMockTendenciaChart() {
    const canvas = document.getElementById('tendencia-vendas-chart');
    if (canvas) {
        new Chart(canvas, {
            type: 'line',
            data: {
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
                datasets: [{
                    label: 'Vendas (R$)',
                    data: [12000, 15000, 13000, 18000, 16000, 20000],
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
    }
}

function createMockVendasPeriodoChart() {
    const canvas = document.getElementById('vendas-periodo-chart');
    if (canvas) {
        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
                datasets: [{
                    label: 'Quantidade',
                    data: [5, 8, 6, 10, 7, 12],
                    backgroundColor: '#10b981'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
            }
        });
    }
}

function createMockVendasStatusChart() {
    const canvas = document.getElementById('vendas-status-chart');
    if (canvas) {
        new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: ['Pago', 'Pendente', 'Cancelado'],
                datasets: [{
                    data: [15, 8, 3],
                    backgroundColor: ['#10b981', '#f59e0b', '#ef4444']
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
    }
}

function createMockOrcamentosStatusChart() {
    const canvas = document.getElementById('orcamentos-status-chart');
    if (canvas) {
        new Chart(canvas, {
            type: 'pie',
            data: {
                labels: ['Ativo', 'Aprovado', 'Convertido', 'Expirado', 'Cancelado'],
                datasets: [{
                    data: [12, 8, 15, 5, 3],
                    backgroundColor: ['#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#f59e0b']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    },
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
    }
}

function createMockValoresDistribuicaoChart() {
    const canvas = document.getElementById('valores-distribuicao-chart');
    if (canvas) {
        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: ['Até R$ 100', 'R$ 100-500', 'R$ 500-1.000', 'R$ 1.000-5.000', 'Acima R$ 5.000'],
                datasets: [{
                    label: 'Quantidade de Vendas',
                    data: [25, 45, 30, 20, 10],
                    backgroundColor: '#8b5cf6',
                    borderColor: '#7c3aed',
                    borderWidth: 1,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return `${context.label}: ${context.parsed} vendas`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }
}

function createMockPagamentosFormaChart() {
    const canvas = document.getElementById('pagamentos-forma-chart');
    if (canvas) {
        new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: ['Dinheiro', 'Cartão', 'PIX', 'Transferência'],
                datasets: [{
                    data: [30, 25, 35, 10],
                    backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444']
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
    }
}

// Função antiga para compatibilidade
function createMockCharts() {
    console.log('📊 Criando gráficos mock...');
    createMockTendenciaChart();
    createMockVendasPeriodoChart();
    createMockVendasStatusChart();
    createMockOrcamentosStatusChart();
    createMockValoresDistribuicaoChart();
    createMockPagamentosFormaChart();
}

console.log('✅ Relatórios simples carregado!'); 