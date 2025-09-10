// Gerenciador do Dashboard
class DashboardManager {
    constructor() {
        this.vendas = [];
        this.produtos = [];
        this.clientes = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.totalPages = 0;
    }

    // Inicializar página do dashboard
    async init() {
        console.log("Inicializando dashboard...");
        try {
            await this.loadVendas();
            await this.loadProdutos();
            await this.loadClientes();
            
            console.log("Dados carregados - Vendas:", this.vendas.length, "Produtos:", this.produtos.length, "Clientes:", this.clientes.length);
            
            // Renderizar a página após carregar todos os dados
            this.renderDashboardPage();
        } catch (error) {
            console.error("Erro ao inicializar dashboard:", error);
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

    // Renderizar página do dashboard
    renderDashboardPage() {
        console.log("Renderizando dashboard com dados:", {
            vendas: this.vendas.length,
            produtos: this.produtos.length,
            clientes: this.clientes.length,
            receita: this.getTotalReceita(),
            vendasHoje: this.getVendasHoje()
        });
        
        const content = document.getElementById('content');
        content.innerHTML = `
            <div class="mb-6">
                <h3 class="text-xl font-semibold flex items-center">
                    <i class="fas fa-tachometer-alt mr-3 text-blue-600"></i>
                    Dashboard
                </h3>
                <p class="text-gray-600">Visão geral do sistema</p>
            </div>

            <!-- KPIs Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-blue-100">Total de Clientes</p>
                            <p class="text-3xl font-bold">${this.clientes.length}</p>
                        </div>
                        <i class="fas fa-users w-8 h-8 text-blue-200"></i>
                    </div>
                </div>

                <div class="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-green-100">Total de Produtos</p>
                            <p class="text-3xl font-bold">${this.produtos.length}</p>
                        </div>
                        <i class="fas fa-box w-8 h-8 text-green-200"></i>
                    </div>
                </div>

                <div class="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-orange-100">Vendas Hoje</p>
                            <p class="text-3xl font-bold">${this.getVendasHoje()}</p>
                        </div>
                        <i class="fas fa-shopping-cart w-8 h-8 text-orange-200"></i>
                    </div>
                </div>

                <div class="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-purple-100">Receita Total</p>
                            <p class="text-3xl font-bold">R$ ${this.formatPrice(this.getTotalReceita())}</p>
                        </div>
                        <i class="fas fa-chart-line w-8 h-8 text-purple-200"></i>
                    </div>
                </div>
            </div>

            <!-- Seções de Conteúdo -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <!-- Vendas Recentes -->
                <div class="bg-white p-6 rounded-lg shadow">
                    <h4 class="text-lg font-semibold mb-4 flex items-center">
                        <i class="fas fa-clock mr-2 text-blue-600"></i>
                        Vendas Recentes
                    </h4>
                    <div class="space-y-3" id="vendas-recentes-container">
                        ${this.renderVendasRecentes()}
                    </div>
                </div>

                <!-- Produtos em Estoque Baixo -->
                <div class="bg-white p-6 rounded-lg shadow">
                    <h4 class="text-lg font-semibold mb-4 flex items-center">
                        <i class="fas fa-exclamation-triangle mr-2 text-orange-600"></i>
                        Produtos em Estoque Baixo
                    </h4>
                    <div class="space-y-3" id="produtos-estoque-container">
                        ${this.renderProdutosEstoqueBaixo()}
                    </div>
                </div>
            </div>
        `;
    }

    // Renderizar vendas recentes com paginação
    renderVendasRecentes() {
        if (this.vendas.length === 0) {
            return '<p class="text-gray-500 text-center py-4">Nenhuma venda registrada ainda</p>';
        }

        // Calcular paginação
        this.totalPages = Math.ceil(this.vendas.length / this.itemsPerPage);
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        
        const vendasRecentes = this.vendas
            .sort((a, b) => new Date(b.data) - new Date(a.data))
            .slice(startIndex, endIndex);

        let html = vendasRecentes.map(venda => {
            const cliente = this.clientes.find(c => c.id === venda.cliente_id);
            const nomeCliente = cliente ? cliente.nome : "Cliente não encontrado";
            
            return `
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                        <p class="font-medium">Venda #${venda.id}</p>
                        <p class="text-sm text-gray-600">${nomeCliente}</p>
                    </div>
                    <div class="text-right">
                        <p class="font-bold text-green-600">R$ ${this.formatPrice(venda.valor_total)}</p>
                        <p class="text-xs text-gray-500">${new Date(venda.data).toLocaleDateString("pt-BR")}</p>
                    </div>
                </div>
            `;
        }).join("");

        // Adicionar controles de paginação
        html += this.renderPaginationControls();
        
        return html;
    }

    // Renderizar controles de paginação
    renderPaginationControls() {
        if (this.totalPages <= 1) {
            return '';
        }

        let html = '<div class="mt-4 flex items-center justify-between">';
        
        // Informações da página
        const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
        const endItem = Math.min(this.currentPage * this.itemsPerPage, this.vendas.length);
        
        html += `<div class="text-sm text-gray-600">
            Mostrando ${startItem} a ${endItem} de ${this.vendas.length} vendas
        </div>`;
        
        // Botões de paginação
        html += '<div class="flex space-x-2">';
        
        // Botão Anterior
        if (this.currentPage > 1) {
            html += `<button onclick="dashboardManager.goToPage(${this.currentPage - 1})" 
                    class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                <i class="fas fa-chevron-left"></i>
            </button>`;
        }
        
        // Números das páginas
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(this.totalPages, this.currentPage + 2);
        
        for (let i = startPage; i <= endPage; i++) {
            const isActive = i === this.currentPage;
            html += `<button onclick="dashboardManager.goToPage(${i})" 
                    class="px-3 py-1 rounded transition-colors ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}">
                ${i}
            </button>`;
        }
        
        // Botão Próximo
        if (this.currentPage < this.totalPages) {
            html += `<button onclick="dashboardManager.goToPage(${this.currentPage + 1})" 
                    class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                <i class="fas fa-chevron-right"></i>
            </button>`;
        }
        
        html += '</div></div>';
        
        return html;
    }

    // Ir para página específica
    goToPage(page) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.updateVendasRecentes();
        }
    }

    // Atualizar apenas a seção de vendas recentes
    updateVendasRecentes() {
        const container = document.getElementById('vendas-recentes-container');
        if (container) {
            container.innerHTML = this.renderVendasRecentes();
        }
    }

    // Atualizar apenas a seção de produtos em estoque baixo
    updateProdutosEstoqueBaixo() {
        const container = document.getElementById('produtos-estoque-container');
        if (container) {
            container.innerHTML = this.renderProdutosEstoqueBaixo();
        }
    }

    // Renderizar produtos com estoque baixo
    renderProdutosEstoqueBaixo() {
        const produtosEstoqueBaixo = this.produtos.filter(produto => produto.estoque <= 5);
        
        if (produtosEstoqueBaixo.length === 0) {
            return '<p class="text-gray-500 text-center py-4">Nenhum produto com estoque baixo</p>';
        }

        return produtosEstoqueBaixo.map(produto => `
            <div class="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div>
                    <p class="font-medium">${produto.nome}</p>
                    <p class="text-sm text-gray-600">R$ ${this.formatPrice(produto.preco)}</p>
                </div>
                <div class="text-right">
                    <p class="font-bold text-red-600">${produto.estoque} unidades</p>
                    <p class="text-xs text-red-500">Estoque baixo</p>
                </div>
            </div>
        `).join("");
    }

    // Obter vendas de hoje
    getVendasHoje() {
        const hoje = new Date().toISOString().split('T')[0];
        return this.vendas.filter(venda => venda.data === hoje).length;
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

// Variável global para o gerenciador do dashboard
let dashboardManager;

// Função para inicializar página do dashboard
function initDashboardPage() {
    dashboardManager = new DashboardManager();
    dashboardManager.init();
}


