// Gerenciador de Clientes
class ClientesManager {
    constructor() {
        this.apiUrl = 'http://localhost:3000/clientes';
        this.clientes = [];
        this.currentCliente = null;
        this.isEditMode = false;
    }

    // Inicializar página de clientes
    async init() {
        await this.loadClientes();
        this.renderClientesTable();
        this.setupEventListeners();
    }

    // Carregar lista de clientes da API
    async loadClientes() {
        try {
            const response = await fetch(this.apiUrl);
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            this.clientes = await response.json();
        } catch (error) {
            console.error('Erro ao carregar clientes:', error);
            this.showError('Erro ao carregar lista de clientes');
        }
    }

    // Renderizar tabela de clientes
    renderClientesTable() {
        const content = document.getElementById('content');
        content.innerHTML = `
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-semibold flex items-center"><i class="fas fa-users mr-3 text-blue-600"></i>Gerenciar Clientes</h3>
                <button class="btn btn-primary" onclick="clientesManager.openModal()">
                    <i class="fas fa-plus w-4 h-4 mr-2"></i>
                    Novo Cliente
                </button>
            </div>
            
            <div class="bg-white rounded-lg shadow overflow-hidden">
                <table class="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>Telefone</th>
                            <th>Email</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody id="clientes-table-body">
                        ${this.renderClientesRows()}
                    </tbody>
                </table>
            </div>

            <!-- Modal de Cliente -->
            <div id="cliente-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50">
                <div class="flex items-center justify-center min-h-screen p-4">
                    <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div class="flex justify-between items-center p-6 border-b">
                            <h3 class="text-lg font-semibold" id="modal-title">Novo Cliente</h3>
                            <button onclick="clientesManager.closeModal()" class="text-gray-400 hover:text-gray-600">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                
                            </button>
                        </div>
                        
                        <form id="cliente-form" class="p-6">
                            <div class="form-group">
                                <label class="form-label" for="nome">Nome *</label>
                                <input type="text" id="nome" name="nome" class="form-input" required>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label" for="telefone">Telefone</label>
                                <input type="tel" id="telefone" name="telefone" class="form-input">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label" for="email">Email</label>
                                <input type="email" id="email" name="email" class="form-input">
                            </div>
                            
                            <div class="flex justify-end space-x-3 mt-6">
                                <button type="button" onclick="clientesManager.closeModal()" class="btn btn-secondary">
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
    renderClientesRows() {
        if (this.clientes.length === 0) {
            return `
                <tr>
                    <td colspan="5" class="text-center py-8 text-gray-500">
                        Nenhum cliente cadastrado
                    </td>
                </tr>
            `;
        }

        return this.clientes.map(cliente => `
            <tr>
                <td class="font-medium">${cliente.id}</td>
                <td>${cliente.nome}</td>
                <td>${cliente.telefone || '-'}</td>
                <td>${cliente.email || '-'}</td>
                <td>
                    <div class="flex space-x-2">
                        <button onclick="clientesManager.editCliente(${cliente.id})" class="text-blue-600 hover:text-blue-800" title="Editar"><i class="fas fa-edit w-4 h-4"></i>
                        </button>
                        <button onclick="clientesManager.deleteCliente(${cliente.id})" 
                                class="text-red-600 hover:text-red-800" title="Excluir">
                            <i class="fas fa-trash w-4 h-4"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Configurar event listeners
    setupEventListeners() {
        const form = document.getElementById('cliente-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveCliente();
            });
        }
    }

    // Abrir modal
    openModal(cliente = null) {
        this.currentCliente = cliente;
        this.isEditMode = !!cliente;
        
        const modal = document.getElementById('cliente-modal');
        const title = document.getElementById('modal-title');
        const form = document.getElementById('cliente-form');
        
        title.textContent = this.isEditMode ? 'Editar Cliente' : 'Novo Cliente';
        
        if (this.isEditMode && cliente) {
            document.getElementById('nome').value = cliente.nome || '';
            document.getElementById('telefone').value = cliente.telefone || '';
            document.getElementById('email').value = cliente.email || '';
        } else {
            form.reset();
        }
        
        modal.classList.remove('hidden');
    }

    // Fechar modal
    closeModal() {
        const modal = document.getElementById('cliente-modal');
        modal.classList.add('hidden');
        this.currentCliente = null;
        this.isEditMode = false;
    }

    // Salvar cliente
    async saveCliente() {
        const formData = new FormData(document.getElementById('cliente-form'));
        const clienteData = {
            nome: formData.get('nome'),
            telefone: formData.get('telefone'),
            email: formData.get('email')
        };

        try {
            let response;
            if (this.isEditMode) {
                // Atualizar cliente existente
                response = await fetch(`${this.apiUrl}/${this.currentCliente.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(clienteData)
                });
            } else {
                // Criar novo cliente
                response = await fetch(this.apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(clienteData)
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao salvar cliente');
            }

            const savedCliente = await response.json();
            
            if (this.isEditMode) {
                // Atualizar cliente na lista
                const index = this.clientes.findIndex(c => c.id === savedCliente.id);
                if (index !== -1) {
                    this.clientes[index] = savedCliente;
                }
            } else {
                // Adicionar novo cliente à lista
                this.clientes.push(savedCliente);
            }

            this.closeModal();
            this.renderClientesTable();
            this.setupEventListeners();
            this.showSuccess(this.isEditMode ? 'Cliente atualizado com sucesso!' : 'Cliente criado com sucesso!');

        } catch (error) {
            console.error('Erro ao salvar cliente:', error);
            this.showError(error.message || 'Erro ao salvar cliente');
        }
    }

    // Editar cliente
    editCliente(id) {
        const cliente = this.clientes.find(c => c.id === id);
        if (cliente) {
            this.openModal(cliente);
        }
    }

    // Excluir cliente
    async deleteCliente(id) {
        const cliente = this.clientes.find(c => c.id === id);
        if (!cliente) return;

        if (!confirm(`Tem certeza que deseja excluir o cliente "${cliente.nome}"?`)) {
            return;
        }

        try {
            const response = await fetch(`${this.apiUrl}/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao excluir cliente');
            }

            // Remover cliente da lista
            this.clientes = this.clientes.filter(c => c.id !== id);
            this.renderClientesTable();
            this.setupEventListeners();
            this.showSuccess('Cliente excluído com sucesso!');

        } catch (error) {
            console.error('Erro ao excluir cliente:', error);
            this.showError(error.message || 'Erro ao excluir cliente');
        }
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

// Instância global do gerenciador de clientes
let clientesManager;

// Função para inicializar página de clientes
function initClientesPage() {
    clientesManager = new ClientesManager();
    clientesManager.init();
}








