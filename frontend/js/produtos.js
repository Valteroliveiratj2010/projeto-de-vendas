// Gerenciador de Produtos
class ProdutosManager {
    constructor() {
        this.apiUrl = 'http://localhost:3000/api/produtos';
        this.produtos = [];
        this.currentProduto = null;
        this.isEditMode = false;
    }

    // Inicializar página de produtos
    async init() {
        await this.loadProdutos();
        this.renderProdutosTable();
        this.setupEventListeners();
    }

    // Carregar lista de produtos da API
    async loadProdutos() {
        try {
            const response = await fetch(this.apiUrl);
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            this.produtos = await response.json();
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            this.showError('Erro ao carregar lista de produtos');
        }
    }

    // Renderizar tabela de produtos
    renderProdutosTable() {
        const content = document.getElementById('content');
        content.innerHTML = `
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-semibold flex items-center"><i class="fas fa-box mr-3 text-green-600"></i>Gerenciar Produtos</h3>
                <button class="btn btn-primary" onclick="produtosManager.openModal()">
                    <i class="fas fa-plus w-4 h-4 mr-2"></i>
                    Novo Produto
                </button>
            </div>
            
            <div class="bg-white rounded-lg shadow overflow-hidden">
                <table class="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>Preço</th>
                            <th>Estoque</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody id="produtos-table-body">
                        ${this.renderProdutosRows()}
                    </tbody>
                </table>
            </div>

            <!-- Modal de Produto -->
            <div id="produto-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50">
                <div class="flex items-center justify-center min-h-screen p-4">
                    <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div class="flex justify-between items-center p-6 border-b">
                            <h3 class="text-lg font-semibold" id="modal-title">Novo Produto</h3>
                            <button onclick="produtosManager.closeModal()" class="text-gray-400 hover:text-gray-600">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                
                            </button>
                        </div>
                        
                        <form id="produto-form" class="p-6">
                            <div class="form-group">
                                <label class="form-label" for="nome">Nome *</label>
                                <input type="text" id="nome" name="nome" class="form-input" required>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label" for="preco">Preço *</label>
                                <div class="relative">
                                    <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                                    <input type="number" id="preco" name="preco" class="form-input pl-8" step="0.01" min="0" required>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label" for="estoque">Estoque</label>
                                <input type="number" id="estoque" name="estoque" class="form-input" min="0" value="0">
                            </div>
                            
                            <div class="flex justify-end space-x-3 mt-6">
                                <button type="button" onclick="produtosManager.closeModal()" class="btn btn-secondary">
                                    Cancelar
                                </button>
                                <button type="submit" class="btn btn-primary">
                                    ${this.isEditMode ? 'Atualizar' : 'Salvar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }

    // Renderizar linhas da tabela
    renderProdutosRows() {
        if (this.produtos.length === 0) {
            return `
                <tr>
                    <td colspan="6" class="text-center py-8 text-gray-500">
                        Nenhum produto cadastrado
                    </td>
                </tr>
            `;
        }

        return this.produtos.map(produto => `
            <tr>
                <td class="font-medium">${produto.id}</td>
                <td>${produto.nome}</td>
                <td class="font-medium">R$ ${this.formatPrice(produto.preco)}</td>
                <td>
                    <span class="px-2 py-1 rounded-full text-xs font-medium ${
                        produto.estoque === 0 ? 'bg-red-100 text-red-800' :
                        produto.estoque < 10 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                    }">
                        ${produto.estoque}
                    </span>
                </td>
                <td>
                    <span class="px-2 py-1 rounded-full text-xs font-medium ${
                        produto.estoque > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }">
                        ${produto.estoque > 0 ? 'Disponível' : 'Indisponível'}
                    </span>
                </td>
                <td>
                    <div class="flex space-x-2">
                        <button onclick="produtosManager.editProduto(${produto.id})" class="text-blue-600 hover:text-blue-800" title="Editar"><i class="fas fa-edit w-4 h-4"></i>
                                
                            
                        </button>
                        <button onclick="produtosManager.deleteProduto(${produto.id})" class="text-red-600 hover:text-red-800" title="Excluir"><i class="fas fa-trash w-4 h-4"></i>
                                
                            
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Configurar event listeners
    setupEventListeners() {
        const form = document.getElementById('produto-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProduto();
            });
        }
    }

    // Abrir modal
    openModal(produto = null) {
        this.currentProduto = produto;
        this.isEditMode = !!produto;
        
        const modal = document.getElementById('produto-modal');
        const title = document.getElementById('modal-title');
        const form = document.getElementById('produto-form');
        
        title.textContent = this.isEditMode ? 'Editar Produto' : 'Novo Produto';
        
        if (this.isEditMode && produto) {
            document.getElementById('nome').value = produto.nome || '';
            document.getElementById('preco').value = produto.preco || '';
            document.getElementById('estoque').value = produto.estoque || 0;
        } else {
            form.reset();
        }
        
        modal.classList.remove('hidden');
    }

    // Fechar modal
    closeModal() {
        const modal = document.getElementById('produto-modal');
        modal.classList.add('hidden');
        this.currentProduto = null;
        this.isEditMode = false;
    }

    // Salvar produto
    async saveProduto() {
        const formData = new FormData(document.getElementById('produto-form'));
        const produtoData = {
            nome: formData.get('nome'),
            preco: parseFloat(formData.get('preco')),
            estoque: parseInt(formData.get('estoque')) || 0
        };

        // Validações
        if (!produtoData.nome || produtoData.nome.trim() === '') {
            this.showError('Nome do produto é obrigatório');
            return;
        }

        if (!produtoData.preco || produtoData.preco < 0) {
            this.showError('Preço deve ser maior ou igual a zero');
            return;
        }

        if (produtoData.estoque < 0) {
            this.showError('Estoque não pode ser negativo');
            return;
        }

        try {
            let response;
            if (this.isEditMode) {
                // Atualizar produto existente
                response = await fetch(`${this.apiUrl}/${this.currentProduto.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(produtoData)
                });
            } else {
                // Criar novo produto
                response = await fetch(this.apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(produtoData)
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao salvar produto');
            }

            const savedProduto = await response.json();
            
            if (this.isEditMode) {
                // Atualizar produto na lista
                const index = this.produtos.findIndex(p => p.id === savedProduto.id);
                if (index !== -1) {
                    this.produtos[index] = savedProduto;
                }
            } else {
                // Adicionar novo produto à lista
                this.produtos.push(savedProduto);
            }

            this.closeModal();
            this.renderProdutosTable();
            this.setupEventListeners();
            this.showSuccess(this.isEditMode ? 'Produto atualizado com sucesso!' : 'Produto criado com sucesso!');

        } catch (error) {
            console.error('Erro ao salvar produto:', error);
            this.showError(error.message || 'Erro ao salvar produto');
        }
    }

    // Editar produto
    editProduto(id) {
        const produto = this.produtos.find(p => p.id === id);
        if (produto) {
            this.openModal(produto);
        }
    }

    // Excluir produto
    async deleteProduto(id) {
        const produto = this.produtos.find(p => p.id === id);
        if (!produto) return;

        if (!confirm(`Tem certeza que deseja excluir o produto "${produto.nome}"?`)) {
            return;
        }

        try {
            const response = await fetch(`${this.apiUrl}/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao excluir produto');
            }

            // Remover produto da lista
            this.produtos = this.produtos.filter(p => p.id !== id);
            this.renderProdutosTable();
            this.setupEventListeners();
            this.showSuccess('Produto excluído com sucesso!');

        } catch (error) {
            console.error('Erro ao excluir produto:', error);
            this.showError(error.message || 'Erro ao excluir produto');
        }
    }

    // Formatar preço
    formatPrice(price) {
        return parseFloat(price).toFixed(2).replace('.', ',');
    }

    // Mostrar mensagem de sucesso
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    // Mostrar mensagem de erro
    showError(message) {
        this.showNotification(message, 'error');
    }

    // Mostrar notificação
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        
        notification.innerHTML = `
            <div class="flex items-center">
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    ${type === 'success' ? 
                        '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>' :
                        '<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>'
                    }
                
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Instância global do gerenciador de produtos
let produtosManager;

// Função para inicializar página de produtos
function initProdutosPage() {
    produtosManager = new ProdutosManager();
    produtosManager.init();
}










