// Classe para gerenciar a lógica de vendas
class VendasManager {
    constructor() {
        this.apiUrl = "/api/vendas";
        this.vendas = [];
        this.currentVenda = null;
        this.isEditMode = false;
        this.produtosVenda = [];
        this.produtos = [];
        this.clientes = [];
    }

    // Inicializa a aplicação de vendas, carregando dados e configurando a interface
    async init() {
        await this.loadVendas();
        await this.loadProdutos();
        await this.loadClientes();
        this.renderVendasTable();
        this.setupEventListeners();
        console.log("Página de vendas inicializada.");
    }

    // Carrega a lista de vendas da API
    async loadVendas() {
        try {
            const response = await fetch(this.apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const text = await response.text();
            if (!text) {
                this.vendas = [];
                return;
            }
            this.vendas = JSON.parse(text);
        } catch (error) {
            console.error("Erro ao carregar vendas:", error);
            this.showError("Erro ao carregar lista de vendas.");
        }
    }

    // Carrega a lista de produtos da API
    async loadProdutos() {
        try {
            const response = await fetch("/api/produtos");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const text = await response.text();
            if (!text) {
                this.produtos = [];
                return;
            }
            this.produtos = JSON.parse(text);
        } catch (error) {
            console.error("Erro ao carregar produtos:", error);
            this.showError("Erro ao carregar lista de produtos.");
        }
    }

    // Carrega a lista de clientes da API
    async loadClientes() {
        try {
            const response = await fetch("/api/clientes");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const text = await response.text();
            if (!text) {
                this.clientes = [];
                return;
            }
            this.clientes = JSON.parse(text);
        } catch (error) {
            console.error("Erro ao carregar clientes:", error);
            this.showError("Erro ao carregar lista de clientes.");
        }
    }

    // Renderiza a tabela principal de vendas e o modal
    renderVendasTable() {
        const content = document.getElementById("content");
        content.innerHTML = `
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-semibold flex items-center">
                    <i class="fas fa-shopping-cart mr-3 text-yellow-600"></i>
                    Gerenciar Vendas
                </h3>
                <button class="btn btn-primary" onclick="vendasManager.openModal()">
                    <i class="fas fa-plus w-4 h-4 mr-2"></i>
                    Nova Venda
                </button>
            </div>
            
            <div class="bg-white rounded-lg shadow overflow-hidden">
                <table class="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Data</th>
                            <th>Cliente</th>
                            <th>Valor Total</th>
                            <th>Forma de Pagamento</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody id="vendas-table-body">
                        ${this.renderVendasRows()}
                    </tbody>
                </table>
            </div>

            <!-- Modal de Edição/Criação de Venda -->
            <div id="venda-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50">
                <div class="flex items-center justify-center min-h-screen p-4">
                    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
                        <div class="flex justify-between items-center p-6 border-b">
                            <h3 class="text-lg font-semibold" id="modal-title">Nova Venda</h3>
                            <button onclick="vendasManager.closeModal()" class="text-gray-400 hover:text-gray-600">
                                <i class="fas fa-times w-6 h-6"></i>
                            </button>
                        </div>
                        
                        <form id="venda-form" class="p-6">
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
                                        <button type="button" onclick="vendasManager.adicionarProduto()" class="btn btn-primary">
                                            <i class="fas fa-plus w-4 h-4"></i>
                                        </button>
                                    </div>
                                    <div id="produtos-lista" class="space-y-2">
                                        <!-- Produtos adicionados aparecerão aqui -->
                                    </div>
                                    <div class="mt-3 p-3 bg-blue-50 rounded-lg">
                                        <div class="flex justify-between items-center">
                                            <span class="font-semibold">Total da Venda:</span>
                                            <span id="total-venda" class="text-lg font-bold text-blue-600">R$ 0,00</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label" for="forma_pagamento">Forma de Pagamento *</label>
                                <select id="forma_pagamento" name="forma_pagamento" class="form-input" required>
                                    <option value="">Selecione...</option>
                                    <option value="Dinheiro">Dinheiro</option>
                                    <option value="Cartão">Cartão</option>
                                    <option value="PIX">PIX</option>
                                    <option value="Transferência">Transferência</option>
                                </select>
                            </div>
                            
                            <div class="flex justify-end space-x-3 mt-6">
                                <button type="button" onclick="vendasManager.closeModal()" class="btn btn-secondary">
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

            <!-- Modal de Detalhes da Venda -->
            <div id="venda-details-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50">
                <div class="flex items-center justify-center min-h-screen p-4">
                    <div class="bg-white rounded-lg shadow-xl max-w-lg w-full">
                        <div class="flex justify-between items-center p-6 border-b">
                            <h3 class="text-lg font-semibold">Detalhes da Venda</h3>
                            <button onclick="vendasManager.closeDetailsModal()" class="text-gray-400 hover:text-gray-600">
                                <i class="fas fa-times w-6 h-6"></i>
                            </button>
                        </div>
                        <div id="venda-modal-content" class="p-6">
                            <!-- Conteúdo do modal de detalhes será carregado aqui -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal de Confirmação de Exclusão -->
            <div id="confirm-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50">
                <div class="flex items-center justify-center min-h-screen p-4">
                    <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm text-center">
                        <h3 class="text-lg font-semibold mb-4">Confirmar Exclusão</h3>
                        <p id="confirm-message" class="mb-6"></p>
                        <div class="flex justify-center space-x-4">
                            <button onclick="vendasManager.cancelConfirmation()" class="btn btn-secondary">Cancelar</button>
                            <button onclick="vendasManager.confirmDeletion()" class="btn btn-danger">Excluir</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Renderiza as linhas da tabela de vendas
    renderVendasRows() {
        if (this.vendas.length === 0) {
            return `
                <tr>
                    <td colspan="6" class="text-center py-8 text-gray-500">
                        Nenhuma venda registrada.
                    </td>
                </tr>
            `;
        }

        return this.vendas.map(venda => {
            const cliente = this.clientes.find(c => c.id === venda.cliente_id);
            const nomeCliente = cliente ? cliente.nome : "Cliente não encontrado";
            
            return `
            <tr>
                <td class="font-medium">${venda.id}</td>
                <td>${new Date(venda.data).toLocaleDateString("pt-BR")}</td>
                <td class="font-medium">${nomeCliente}</td>
                <td class="font-medium">R$ ${this.formatPrice(venda.valor_total)}</td>
                <td>
                    <span class="px-2 py-1 rounded-full text-xs font-medium ${this.getStatusClass(venda.forma_pagamento)}">
                        ${venda.forma_pagamento}
                    </span>
                </td>
                <td>
                    <div class="flex space-x-2">
                        <button onclick="vendasManager.showDetailsModal(${venda.id})" class="text-gray-600 hover:text-gray-800" title="Ver Detalhes">
                            <i class="fas fa-eye w-4 h-4"></i>
                        </button>
                        <button onclick="vendasManager.editVenda(${venda.id})" class="text-blue-600 hover:text-blue-800" title="Editar">
                            <i class="fas fa-edit w-4 h-4"></i>
                        </button>
                        <button onclick="vendasManager.deleteVenda(${venda.id})" class="text-red-600 hover:text-red-800" title="Excluir">
                            <i class="fas fa-trash w-4 h-4"></i>
                        </button>
                    </div>
                </td>
            </tr>
            `;
        }).join("");
    }

    // Retorna a classe CSS para o badge de forma de pagamento
    getStatusClass(formaPagamento) {
        switch (formaPagamento) {
            case "Dinheiro": return "bg-green-100 text-green-800";
            case "Cartão": return "bg-blue-100 text-blue-800";
            case "PIX": return "bg-purple-100 text-purple-800";
            default: return "bg-gray-100 text-gray-800";
        }
    }

    // Configura os event listeners
    setupEventListeners() {
        const form = document.getElementById("venda-form");
        if (form) {
            form.addEventListener("submit", (e) => {
                e.preventDefault();
                this.saveVenda();
            });
        }
    }

    // Abre o modal de nova venda ou edição
    async openModal(venda = null) {
        this.currentVenda = venda;
        this.isEditMode = !!venda;
        this.produtosVenda = [];
        
        const modal = document.getElementById("venda-modal");
        const title = document.getElementById("modal-title");
        const form = document.getElementById("venda-form");
        
        title.textContent = this.isEditMode ? "Editar Venda" : "Nova Venda";
        
        this.loadClientesDropdown();
        this.loadProdutosDropdown();
        
        if (this.isEditMode && venda) {
            document.getElementById("data").value = venda.data ? new Date(venda.data).toISOString().split("T")[0] : '';
            document.getElementById("forma_pagamento").value = venda.forma_pagamento || "";
            document.getElementById("cliente_id").value = venda.cliente_id || "";
            this.produtosVenda = venda.produtos || [];
        } else {
            form.reset();
            document.getElementById("data").value = new Date().toISOString().split("T")[0];
        }
        
        this.updateProdutosLista();
        this.updateTotalVenda();
        
        modal.classList.remove("hidden");
    }

    // Preenche o dropdown de clientes
    loadClientesDropdown() {
        const select = document.getElementById("cliente_id");
        select.innerHTML = "<option value=\"\">Selecione um cliente...</option>";
        
        this.clientes.forEach(cliente => {
            const option = document.createElement("option");
            option.value = cliente.id;
            option.textContent = `${cliente.nome}`;
            select.appendChild(option);
        });
    }

    // Preenche o dropdown de produtos
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

    // Adiciona um produto à lista de produtos da venda
    adicionarProduto() {
        const produtoSelect = document.getElementById("produto_select");
        const quantidadeInput = document.getElementById("quantidade_produto");
        
        const produtoId = parseInt(produtoSelect.value);
        const quantidade = parseInt(quantidadeInput.value) || 1;
        
        if (!produtoId) {
            this.showError("Selecione um produto para adicionar.");
            return;
        }
        
        const produto = this.produtos.find(p => p.id === produtoId);
        if (!produto) {
            this.showError("Produto não encontrado.");
            return;
        }
        
        const produtoExistente = this.produtosVenda.find(p => p.id === produtoId);
        if (produtoExistente) {
            produtoExistente.quantidade += quantidade;
        } else {
            this.produtosVenda.push({
                id: produto.id,
                nome: produto.nome,
                preco: produto.preco,
                quantidade: quantidade
            });
        }
        
        produtoSelect.value = "";
        quantidadeInput.value = "1";
        this.updateProdutosLista();
        this.updateTotalVenda();
    }

    // Remove um produto da lista de produtos da venda
    removerProduto(produtoId) {
        this.produtosVenda = this.produtosVenda.filter(p => p.id !== produtoId);
        this.updateProdutosLista();
        this.updateTotalVenda();
    }

    // Atualiza a lista de produtos exibida no modal
    updateProdutosLista() {
        const lista = document.getElementById("produtos-lista");
        
        if (this.produtosVenda.length === 0) {
            lista.innerHTML = '<p class="text-gray-500 text-sm">Nenhum produto adicionado.</p>';
            return;
        }
        
        lista.innerHTML = this.produtosVenda.map(produto => `
            <div class="flex items-center justify-between p-2 bg-white rounded border">
                <div class="flex-1">
                    <span class="font-medium">${produto.nome}</span>
                    <span class="text-sm text-gray-600 ml-2">x${produto.quantidade}</span>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="font-medium">R$ ${this.formatPrice(produto.preco * produto.quantidade)}</span>
                    <button type="button" onclick="vendasManager.removerProduto(${produto.id})" 
                            class="text-red-600 hover:text-red-800" title="Remover Produto">
                        <i class="fas fa-trash w-4 h-4"></i>
                    </button>
                </div>
            </div>
        `).join("");
    }

    // Atualiza o valor total da venda
    updateTotalVenda() {
        const total = this.produtosVenda.reduce((sum, produto) => sum + (produto.preco * produto.quantidade), 0);
        const totalElement = document.getElementById("total-venda");
        if (totalElement) {
            totalElement.textContent = `R$ ${this.formatPrice(total)}`;
        }
    }

    // Salva ou atualiza a venda
    async saveVenda() {
        const form = document.getElementById("venda-form");
        const formData = new FormData(form);
        
        if (this.produtosVenda.length === 0) {
            this.showError("Adicione pelo menos um produto à venda.");
            return;
        }
        
        const vendaData = {
            cliente_id: parseInt(formData.get("cliente_id")),
            forma_pagamento: formData.get("forma_pagamento"),
            itens: this.produtosVenda.map(p => ({
                produto_id: p.id,
                quantidade: p.quantidade
            }))
        };
        
        if (!vendaData.cliente_id || !vendaData.forma_pagamento || !vendaData.itens || vendaData.itens.length === 0) {
            this.showError("Por favor, preencha todos os campos obrigatórios.");
            return;
        }
        
        try {
            let response;
            if (this.isEditMode) {
                response = await fetch(`${this.apiUrl}/${this.currentVenda.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(vendaData)
                });
            } else {
                response = await fetch(this.apiUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(vendaData)
                });
            }
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Erro ao salvar venda.");
            }
            
            this.closeModal();
            await this.loadVendas();
            this.renderVendasTable();
            this.showSuccess(this.isEditMode ? "Venda atualizada com sucesso!" : "Venda criada com sucesso!");
            
        } catch (error) {
            console.error("Erro ao salvar venda:", error);
            this.showError(error.message || "Erro ao salvar venda.");
        }
    }

    // Abre o modal para editar uma venda
    async editVenda(id) {
        const venda = this.vendas.find(v => v.id === id);
        if (venda) {
            await this.openModal(venda);
        }
    }

    // Abre o modal de detalhes da venda
    showDetailsModal(id) {
        const venda = this.vendas.find(v => v.id === id);
        if (!venda) {
            this.showError("Venda não encontrada.");
            return;
        }

        const modal = document.getElementById("venda-details-modal");
        const modalContent = document.getElementById("venda-modal-content");
        modalContent.innerHTML = `
            <h3 class="text-xl font-bold mb-4">Detalhes da Venda #${venda.id}</h3>
            <div class="space-y-2 text-gray-700">
                <p><strong>Data:</strong> ${new Date(venda.data).toLocaleDateString("pt-BR")}</p>
                <p><strong>Cliente:</strong> ${this.clientes.find(c => c.id === venda.cliente_id)?.nome || 'Não Encontrado'}</p>
                <p><strong>Valor Total:</strong> R$ ${this.formatPrice(venda.valor_total)}</p>
                <p><strong>Forma de Pagamento:</strong> ${venda.forma_pagamento}</p>
                <h4 class="font-semibold mt-4">Produtos:</h4>
                <ul class="list-disc list-inside space-y-1">
                    ${(venda.produtos || []).map(p => {
                        const produtoInfo = this.produtos.find(prod => prod.id === p.produto_id);
                        const nomeProduto = produtoInfo ? produtoInfo.nome : p.produto_nome || 'Produto desconhecido';
                        return `<li>${nomeProduto} (${p.quantidade}x) - R$ ${this.formatPrice(p.preco_unitario * p.quantidade)}</li>`;
                    }).join('')}
                </ul>
            </div>
        `;
        modal.classList.remove("hidden");
    }

    // Fecha o modal de detalhes da venda
    closeDetailsModal() {
        document.getElementById("venda-details-modal").classList.add("hidden");
    }

    // Abre o modal de confirmação para exclusão
    async deleteVenda(id) {
        this.vendaToDeleteId = id;
        const confirmModal = document.getElementById("confirm-modal");
        const confirmMessage = document.getElementById("confirm-message");
        confirmMessage.textContent = `Tem certeza que deseja excluir a venda #${id}?`;
        confirmModal.classList.remove("hidden");
    }

    // Confirma a exclusão após o modal
    async confirmDeletion() {
        const id = this.vendaToDeleteId;
        this.cancelConfirmation(); // Fecha o modal
        try {
            const response = await fetch(`${this.apiUrl}/${id}`, {
                method: "DELETE"
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Erro ao excluir venda.");
            }

            await this.loadVendas();
            this.renderVendasTable();
            this.showSuccess("Venda excluída com sucesso!");

        } catch (error) {
            console.error("Erro ao excluir venda:", error);
            this.showError(error.message || "Erro ao excluir venda.");
        }
    }

    // Cancela a exclusão
    cancelConfirmation() {
        document.getElementById("confirm-modal").classList.add("hidden");
        this.vendaToDeleteId = null;
    }

    // Fecha o modal de edição/criação
    closeModal() {
        const modal = document.getElementById("venda-modal");
        modal.classList.add("hidden");
        this.currentVenda = null;
        this.isEditMode = false;
        this.produtosVenda = [];
    }

    // Formata o preço para R$ 0,00
    formatPrice(price) {
        return parseFloat(price).toFixed(2).replace(".", ",");
    }

    // Exibe notificações de sucesso e erro
    showSuccess(message) {
        this.showNotification(message, "success");
    }

    showError(message) {
        this.showNotification(message, "error");
    }

    // Cria e exibe uma notificação
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

    // Retorna a classe CSS para o tipo de notificação
    getNotificationClass(type) {
        switch (type) {
            case "success": return "bg-green-500 text-white";
            case "error": return "bg-red-500 text-white";
            default: return "bg-blue-500 text-white";
        }
    }

    // Retorna o ícone para o tipo de notificação
    getNotificationIcon(type) {
        return type === "success" ? "fa-check-circle" : "fa-exclamation-circle";
    }
}

let vendasManager;

function initVendasPage() {
    vendasManager = new VendasManager();
    vendasManager.init();
}