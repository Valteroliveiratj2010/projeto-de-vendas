// Gerenciador de Orçamentos
class OrcamentosManager {
    constructor() {
        this.apiUrl = "http://localhost:3000/orcamentos";
        this.orcamentos = [];
        this.currentOrcamento = null;
        this.isEditMode = false;
        this.produtosOrcamento = [];
        this.produtos = [];
        this.clientes = [];
    }

    async init() {
        await this.loadOrcamentos();
        await this.loadProdutos();
        await this.loadClientes();
        this.renderOrcamentosTable();
        this.setupEventListeners();
    }

    async loadOrcamentos() {
        try {
            const response = await fetch(this.apiUrl);
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            this.orcamentos = await response.json();
        } catch (error) {
            console.error("Erro ao carregar orçamentos:", error);
            this.showError("Erro ao carregar lista de orçamentos");
        }
    }

    async loadProdutos() {
        try {
            const response = await fetch("http://localhost:3000/produtos");
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            this.produtos = await response.json();
        } catch (error) {
            console.error("Erro ao carregar produtos:", error);
            this.showError("Erro ao carregar lista de produtos");
        }
    }

    async loadClientes() {
        try {
            const response = await fetch("http://localhost:3000/clientes");
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            this.clientes = await response.json();
        } catch (error) {
            console.error("Erro ao carregar clientes:", error);
            this.showError("Erro ao carregar lista de clientes");
        }
    }

    renderOrcamentosTable() {
        const content = document.getElementById("content");
        content.innerHTML = `
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-semibold flex items-center">
                    <i class="fas fa-file-invoice-dollar mr-3 text-indigo-600"></i>
                    Gerenciar Orçamentos
                </h3>
                <button class="btn btn-primary" onclick="orcamentosManager.openModal()">
                    <i class="fas fa-plus w-4 h-4 mr-2"></i>
                    Novo Orçamento
                </button>
            </div>
            
            <div class="bg-white rounded-lg shadow overflow-hidden">
                <table class="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Cliente</th>
                            <th>Data</th>
                            <th>Valor Total</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody id="orcamentos-table-body">
                        ${this.renderOrcamentosRows()}
                    </tbody>
                </table>
            </div>

            <div id="orcamento-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50">
                <div class="flex items-center justify-center min-h-screen p-4">
                    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
                        <div class="flex justify-between items-center p-6 border-b">
                            <h3 class="text-lg font-semibold" id="modal-title">Novo Orçamento</h3>
                            <button onclick="orcamentosManager.closeModal()" class="text-gray-400 hover:text-gray-600">
                                <i class="fas fa-times w-6 h-6"></i>
                            </button>
                        </div>
                        
                        <form id="orcamento-form" class="p-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="form-group">
                                    <label class="form-label" for="data">Data *</label>
                                    <input type="date" id="data" name="data" class="form-input" required>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label" for="cliente_id">Cliente *</label>
                                    <select id="cliente_id" name="cliente_id" class="form-input" required>
                                        <option value="">Selecione um cliente...</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="form-group mt-4">
                                <label class="form-label">Produtos</label>
                                <div class="border rounded-lg p-4 bg-gray-50">
                                    <div class="flex space-x-2 mb-3">
                                        <select id="produto_select" class="form-input flex-1">
                                            <option value="">Selecione um produto...</option>
                                        </select>
                                        <input type="number" id="quantidade_produto" placeholder="Qtd" min="1" value="1" class="form-input w-20">
                                        <button type="button" onclick="orcamentosManager.adicionarProduto()" class="btn btn-primary">
                                            <i class="fas fa-plus w-4 h-4"></i>
                                        </button>
                                    </div>
                                    <div id="produtos-lista" class="space-y-2">
                                        <!-- Produtos adicionados aparecerão aqui -->
                                    </div>
                                    <div class="mt-3 p-3 bg-blue-50 rounded-lg">
                                        <div class="flex justify-between items-center">
                                            <span class="font-semibold">Total do Orçamento:</span>
                                            <span id="total-orcamento" class="text-lg font-bold text-blue-600">R$ 0,00</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label" for="status">Status *</label>
                                <select id="status" name="status" class="form-input" required>
                                    <option value="">Selecione...</option>
                                    <option value="Pendente">Pendente</option>
                                    <option value="Aprovado">Aprovado</option>
                                    <option value="Rejeitado">Rejeitado</option>
                                    <option value="Expirado">Expirado</option>
                                </select>
                            </div>
                            
                            <div class="flex justify-end space-x-3 mt-6">
                                <button type="button" onclick="orcamentosManager.closeModal()" class="btn btn-secondary">
                                    Cancelar
                                </button>
                                <button type="submit" class="btn btn-primary">
                                    Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }

    renderOrcamentosRows() {
        if (this.orcamentos.length === 0) {
            return `
                <tr>
                    <td colspan="6" class="text-center py-8 text-gray-500">
                        Nenhum orçamento registrado
                    </td>
                </tr>
            `;
        }

        return this.orcamentos.map(orcamento => {
            const cliente = this.clientes.find(c => c.id === orcamento.cliente_id);
            const nomeCliente = cliente ? cliente.nome : "Cliente não encontrado";
            
            return `
                <tr>
                    <td class="font-medium">${orcamento.id}</td>
                    <td class="font-medium">${nomeCliente}</td>
                    <td>${new Date(orcamento.data).toLocaleDateString("pt-BR")}</td>
                    <td class="font-medium">R$ ${this.formatPrice(orcamento.valor_total)}</td>
                    <td>
                        <span class="px-2 py-1 rounded-full text-xs font-medium ${this.getStatusClass(orcamento.status)}">
                            ${orcamento.status}
                        </span>
                    </td>
                    <td>
                        <div class="flex space-x-2">
                            <button onclick="orcamentosManager.editOrcamento(${orcamento.id})" 
                                    class="text-blue-600 hover:text-blue-800" title="Editar">
                                <i class="fas fa-edit w-4 h-4"></i>
                            </button>
                            <button onclick="orcamentosManager.deleteOrcamento(${orcamento.id})" 
                                    class="text-red-600 hover:text-red-800" title="Excluir">
                                <i class="fas fa-trash w-4 h-4"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join("");
    }

    getStatusClass(status) {
        switch (status) {
            case "Pendente": return "bg-yellow-100 text-yellow-800";
            case "Aprovado": return "bg-green-100 text-green-800";
            case "Rejeitado": return "bg-red-100 text-red-800";
            case "Expirado": return "bg-gray-100 text-gray-800";
            default: return "bg-gray-100 text-gray-800";
        }
    }

    setupEventListeners() {
        const form = document.getElementById("orcamento-form");
        if (form) {
            form.addEventListener("submit", (e) => {
                e.preventDefault();
                this.saveOrcamento();
            });
        }
    }

    async openModal(orcamento = null) {
        this.currentOrcamento = orcamento;
        this.isEditMode = !!orcamento;
        this.produtosOrcamento = [];
        
        const modal = document.getElementById("orcamento-modal");
        const title = document.getElementById("modal-title");
        const form = document.getElementById("orcamento-form");
        
        title.textContent = this.isEditMode ? "Editar Orçamento" : "Novo Orçamento";
        
        this.loadClientesDropdown();
        this.loadProdutosDropdown();
        this.updateProdutosLista();
        this.updateTotalOrcamento();
        
        if (this.isEditMode && orcamento) {
            document.getElementById("data").value = orcamento.data || "";
            document.getElementById("status").value = orcamento.status || "";
            document.getElementById("cliente_id").value = orcamento.cliente_id || "";
        } else {
            form.reset();
            document.getElementById("data").value = new Date().toISOString().split("T")[0];
        }
        
        modal.classList.remove("hidden");
    }

    loadClientesDropdown() {
        const select = document.getElementById("cliente_id");
        select.innerHTML = "<option value=\"\">Selecione um cliente...</option>";
        
        this.clientes.forEach(cliente => {
            const option = document.createElement("option");
            option.value = cliente.id;
            option.textContent = `${cliente.nome} - ${cliente.email}`;
            select.appendChild(option);
        });
    }

    loadProdutosDropdown() {
        const select = document.getElementById("produto_select");
        select.innerHTML = "<option value=\"\">Selecione um produto...</option>";
        
        this.produtos.forEach(produto => {
            const option = document.createElement("option");
            option.value = produto.id;
            option.textContent = `${produto.nome} - R$ ${this.formatPrice(produto.preco)}`;
            option.dataset.preco = produto.preco;
            select.appendChild(option);
        });
    }

    adicionarProduto() {
        const produtoSelect = document.getElementById("produto_select");
        const quantidadeInput = document.getElementById("quantidade_produto");
        
        const produtoId = parseInt(produtoSelect.value);
        const quantidade = parseInt(quantidadeInput.value) || 1;
        
        if (!produtoId) {
            this.showError("Selecione um produto");
            return;
        }
        
        const produto = this.produtos.find(p => p.id === produtoId);
        if (!produto) {
            this.showError("Produto não encontrado");
            return;
        }
        
        const produtoExistente = this.produtosOrcamento.find(p => p.id === produtoId);
        if (produtoExistente) {
            produtoExistente.quantidade += quantidade;
        } else {
            this.produtosOrcamento.push({
                id: produto.id,
                nome: produto.nome,
                preco: produto.preco,
                quantidade: quantidade
            });
        }
        
        produtoSelect.value = "";
        quantidadeInput.value = "1";
        this.updateProdutosLista();
        this.updateTotalOrcamento();
    }

    removerProduto(produtoId) {
        this.produtosOrcamento = this.produtosOrcamento.filter(p => p.id !== produtoId);
        this.updateProdutosLista();
        this.updateTotalOrcamento();
    }

    updateProdutosLista() {
        const lista = document.getElementById("produtos-lista");
        
        if (this.produtosOrcamento.length === 0) {
            lista.innerHTML = '<p class="text-gray-500 text-sm">Nenhum produto adicionado</p>';
            return;
        }
        
        lista.innerHTML = this.produtosOrcamento.map(produto => `
            <div class="flex items-center justify-between p-2 bg-white rounded border">
                <div class="flex-1">
                    <span class="font-medium">${produto.nome}</span>
                    <span class="text-sm text-gray-600 ml-2">x${produto.quantidade}</span>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="font-medium">R$ ${this.formatPrice(produto.preco * produto.quantidade)}</span>
                    <button type="button" onclick="orcamentosManager.removerProduto(${produto.id})" 
                            class="text-red-600 hover:text-red-800">
                        <i class="fas fa-trash w-4 h-4"></i>
                    </button>
                </div>
            </div>
        `).join("");
    }

    updateTotalOrcamento() {
        const total = this.produtosOrcamento.reduce((sum, produto) => sum + (produto.preco * produto.quantidade), 0);
        const totalElement = document.getElementById("total-orcamento");
        if (totalElement) {
            totalElement.textContent = `R$ ${this.formatPrice(total)}`;
        }
    }

    async saveOrcamento() {
        const form = document.getElementById("orcamento-form");
        const formData = new FormData(form);
        
        if (this.produtosOrcamento.length === 0) {
            this.showError("Adicione pelo menos um produto ao orçamento");
            return;
        }
        
        const totalOrcamento = this.produtosOrcamento.reduce((sum, produto) => sum + (produto.preco * produto.quantidade), 0);
        
        const orcamentoData = {
            data: formData.get("data"),
            valor_total: totalOrcamento,
            status: formData.get("status"),
            cliente_id: parseInt(formData.get("cliente_id")),
            produtos: this.produtosOrcamento
        };
        
        if (!orcamentoData.data || !orcamentoData.status || !orcamentoData.cliente_id) {
            this.showError("Por favor, preencha todos os campos obrigatórios.");
            return;
        }
        
        try {
            let response;
            if (this.isEditMode) {
                response = await fetch(`${this.apiUrl}/${this.currentOrcamento.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(orcamentoData)
                });
            } else {
                response = await fetch(this.apiUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(orcamentoData)
                });
            }
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Erro ao salvar orçamento");
            }
            
            this.closeModal();
            await this.loadOrcamentos();
            this.renderOrcamentosTable();
            this.setupEventListeners();
            this.showSuccess(this.isEditMode ? "Orçamento atualizado com sucesso!" : "Orçamento criado com sucesso!");
            
        } catch (error) {
            console.error("Erro ao salvar orçamento:", error);
            this.showError(error.message || "Erro ao salvar orçamento");
        }
    }

    async editOrcamento(id) {
        const orcamento = this.orcamentos.find(o => o.id === id);
        if (orcamento) {
            await this.openModal(orcamento);
        }
    }

    async deleteOrcamento(id) {
        const orcamento = this.orcamentos.find(o => o.id === id);
        if (!orcamento) return;

        if (!confirm(`Tem certeza que deseja excluir o orçamento #${orcamento.id}?`)) {
            return;
        }

        try {
            const response = await fetch(`${this.apiUrl}/${id}`, {
                method: "DELETE"
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Erro ao excluir orçamento");
            }

            this.orcamentos = this.orcamentos.filter(o => o.id !== id);
            this.renderOrcamentosTable();
            this.setupEventListeners();
            this.showSuccess("Orçamento excluído com sucesso!");

        } catch (error) {
            console.error("Erro ao excluir orçamento:", error);
            this.showError(error.message || "Erro ao excluir orçamento");
        }
    }

    closeModal() {
        const modal = document.getElementById("orcamento-modal");
        modal.classList.add("hidden");
        this.currentOrcamento = null;
        this.isEditMode = false;
        this.produtosOrcamento = [];
    }

    formatPrice(price) {
        return parseFloat(price).toFixed(2).replace(".", ",");
    }

    showSuccess(message) {
        this.showNotification(message, "success");
    }

    showError(message) {
        this.showNotification(message, "error");
    }

    showNotification(message, type = "info") {
        const notification = document.createElement("div");
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${this.getNotificationClass(type)}`;
        
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${this.getNotificationIcon(type)} w-5 h-5 mr-2"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    getNotificationClass(type) {
        switch (type) {
            case "success": return "bg-green-500 text-white";
            case "error": return "bg-red-500 text-white";
            default: return "bg-blue-500 text-white";
        }
    }

    getNotificationIcon(type) {
        return type === "success" ? "fa-check-circle" : "fa-exclamation-circle";
    }
}

let orcamentosManager;

function initOrcamentosPage() {
    orcamentosManager = new OrcamentosManager();
    orcamentosManager.init();
}
