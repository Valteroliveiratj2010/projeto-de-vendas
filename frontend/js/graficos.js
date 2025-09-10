// Gerenciador de Gráficos
class GraficosManager {
    constructor() {
        this.vendas = [];
        this.produtos = [];
        this.clientes = [];
        this.charts = {};
    }

    // Inicializar página de gráficos
    async init() {
        console.log("Inicializando gráficos...");
        try {
            await this.loadVendas();
            await this.loadProdutos();
            await this.loadClientes();
            
            console.log("Dados carregados - Vendas:", this.vendas.length, "Produtos:", this.produtos.length, "Clientes:", this.clientes.length);
            
            // Renderizar a página após carregar todos os dados
            this.renderGraficosPage();
            this.setupCharts();
        } catch (error) {
            console.error("Erro ao inicializar gráficos:", error);
        }
    }

    // Carregar dados de vendas
    async loadVendas() {
        try {
            const response = await fetch("http://localhost:3000/vendas");
            if (response.ok) {
                this.vendas = await response.json();
                console.log("Vendas carregadas:", this.vendas.length);
            } else {
                console.error("Erro ao carregar vendas:", response.status);
            }
        } catch (error) {
            console.error("Erro ao carregar vendas:", error);
            this.vendas = [];
        }
    }

    // Carregar dados de produtos
    async loadProdutos() {
        try {
            const response = await fetch("http://localhost:3000/produtos");
            if (response.ok) {
                this.produtos = await response.json();
                console.log("Produtos carregados:", this.produtos.length);
            } else {
                console.error("Erro ao carregar produtos:", response.status);
            }
        } catch (error) {
            console.error("Erro ao carregar produtos:", error);
            this.produtos = [];
        }
    }

    // Carregar dados de clientes
    async loadClientes() {
        try {
            const response = await fetch("http://localhost:3000/clientes");
            if (response.ok) {
                this.clientes = await response.json();
                console.log("Clientes carregados:", this.clientes.length);
            } else {
                console.error("Erro ao carregar clientes:", response.status);
            }
        } catch (error) {
            console.error("Erro ao carregar clientes:", error);
            this.clientes = [];
        }
    }

    // Renderizar página de gráficos
    renderGraficosPage() {
        console.log("Renderizando página com dados:", {
            vendas: this.vendas.length,
            produtos: this.produtos.length,
            clientes: this.clientes.length,
            receita: this.getTotalReceita()
        });
        
        const content = document.getElementById('content');
        content.innerHTML = `
            <div class="mb-6">
                <h3 class="text-xl font-semibold flex items-center"><i class="fas fa-chart-bar mr-3 text-purple-600"></i>Relatórios e Gráficos</h3>
                <p class="text-gray-600">Análise de vendas, produtos e clientes</p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <!-- Gráfico de Vendas por Mês -->
                <div class="bg-white p-6 rounded-lg shadow">
                    <div class="flex justify-between items-center mb-4">
                        <h4 class="text-lg font-semibold">Vendas por Mês</h4>
                    </div>
                    <div class="h-64">
                        <canvas id="vendasChart"></canvas>
                    </div>
                </div>

                <!-- Gráfico de Formas de Pagamento -->
                <div class="bg-white p-6 rounded-lg shadow">
                    <div class="flex justify-between items-center mb-4">
                        <h4 class="text-lg font-semibold">Formas de Pagamento</h4>
                    </div>
                    <div class="h-64">
                        <canvas id="pagamentoChart"></canvas>
                    </div>
                </div>
            </div>

            <!-- KPIs -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-blue-100">Total de Vendas</p>
                            <p class="text-3xl font-bold">${this.vendas.length}</p>
                        </div>
                        <i class="fas fa-shopping-cart w-8 h-8 text-blue-200"></i>
                    </div>
                </div>

                <div class="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-green-100">Receita Total</p>
                            <p class="text-3xl font-bold">R$ ${this.formatPrice(this.getTotalReceita())}</p>
                        </div>
                        <i class="fas fa-chart-line w-8 h-8 text-green-200"></i>
                    </div>
                </div>

                <div class="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-purple-100">Produtos</p>
                            <p class="text-3xl font-bold">${this.produtos.length}</p>
                        </div>
                        <i class="fas fa-box w-8 h-8 text-purple-200"></i>
                    </div>
                </div>

                <div class="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-orange-100">Clientes</p>
                            <p class="text-3xl font-bold">${this.clientes.length}</p>
                        </div>
                        <i class="fas fa-users w-8 h-8 text-orange-200"></i>
                    </div>
                </div>
            </div>
        `;
    }

    // Configurar gráficos
    setupCharts() {
        setTimeout(() => {
            console.log("Configurando gráficos após timeout...");
            this.createVendasChart();
            this.createPagamentoChart();
        }, 500);
    }

    // Criar gráfico de vendas por mês
    createVendasChart() {
        const ctx = document.getElementById('vendasChart');
        console.log("Criando gráfico de vendas, elemento encontrado:", !!ctx);
        if (!ctx) {
            console.error("Elemento vendasChart não encontrado!");
            return;
        }

        const vendasPorMes = this.getVendasPorMes();
        
        if (this.charts.vendas) {
            this.charts.vendas.destroy();
        }

        this.charts.vendas = new Chart(ctx, {
            type: 'line',
            data: {
                labels: vendasPorMes.labels,
                datasets: [{
                    label: 'Vendas',
                    data: vendasPorMes.values,
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Criar gráfico de formas de pagamento
    createPagamentoChart() {
        const ctx = document.getElementById('pagamentoChart');
        console.log("Criando gráfico de pagamento, elemento encontrado:", !!ctx);
        if (!ctx) {
            console.error("Elemento pagamentoChart não encontrado!");
            return;
        }

        const formasPagamento = this.getFormasPagamento();
        
        if (this.charts.pagamento) {
            this.charts.pagamento.destroy();
        }

        this.charts.pagamento = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: formasPagamento.labels,
                datasets: [{
                    data: formasPagamento.values,
                    backgroundColor: [
                        '#10B981',
                        '#3B82F6',
                        '#8B5CF6',
                        '#F59E0B'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    // Obter vendas por mês
    getVendasPorMes() {
        const vendasPorMes = {};
        
        this.vendas.forEach(venda => {
            const data = new Date(venda.data);
            const mesAno = `${data.getMonth() + 1}/${data.getFullYear()}`;
            
            if (!vendasPorMes[mesAno]) {
                vendasPorMes[mesAno] = 0;
            }
            vendasPorMes[mesAno] += venda.valor_total;
        });

        const labels = Object.keys(vendasPorMes).sort();
        const values = labels.map(label => vendasPorMes[label]);

        return { labels, values };
    }

    // Obter formas de pagamento
    getFormasPagamento() {
        const formas = {};
        
        this.vendas.forEach(venda => {
            const forma = venda.forma_pagamento;
            if (!formas[forma]) {
                formas[forma] = 0;
            }
            formas[forma]++;
        });

        const labels = Object.keys(formas);
        const values = Object.values(formas);

        return { labels, values };
    }

    // Obter receita total
    getTotalReceita() {
        return this.vendas.reduce((total, venda) => total + (venda.valor_total || 0), 0);
    }

    // Formatar preço
    formatPrice(price) {
        return new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(price);
    }
}

// Variável global para o gerenciador de gráficos
let graficosManager;

// Função para inicializar página de gráficos
function initGraficosPage() {
    graficosManager = new GraficosManager();
    graficosManager.init();
}
