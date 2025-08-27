/**
 * Página de Clientes - Sistema de Vendas
 * Gerencia cadastro, edição e visualização de clientes
 */

class ClientesPage {
    constructor() {
        this.clientes = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.init();
    }

    /**
     * Inicializa a página
     */
    async init() {
        try {
            console.log('🚀 Inicializando página de clientes...');
            
            // Renderizar estrutura HTML
            this.renderPage();
            
            // Carregar dados
            await this.loadClientes();
            
            // Configurar event listeners
            this.setupEventListeners();
            
            console.log('✅ Página de clientes inicializada!');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar página de clientes:', error);
            this.showError('Erro ao carregar página', error.message);
        }
    }

    /**
     * Renderiza a estrutura HTML da página
     */
    renderPage() {
        const pageContainer = document.getElementById('clientes-page');
        if (!pageContainer) return;

        pageContainer.innerHTML = `
            <div class="page-header">
                <div class="header-content">
                    <h2>Gestão de Clientes</h2>
                    <p>Cadastre, edite e gerencie seus clientes</p>
                </div>
                <div class="header-actions">
                    <button class="btn btn-secondary" id="refresh-btn">
                        <i class="fas fa-sync-alt"></i>
                        Atualizar
                    </button>
                    <button class="btn btn-primary" id="new-cliente-btn">
                        <i class="fas fa-plus"></i>
                        Novo Cliente
                    </button>
                </div>
            </div>

            <div class="page-content">
                <!-- Filtros e Busca -->
                <div class="filters-section">
                    <div class="search-box">
                        <input type="text" id="search-input" placeholder="Buscar por nome, email ou documento...">
                        <button id="search-btn">
                            <i class="fas fa-search"></i>
                        </button>
                    </div>
                    <div class="filters">
                        <select id="status-filter">
                            <option value="">Todos os Status</option>
                            <option value="ativo">Ativo</option>
                            <option value="inativo">Inativo</option>
                        </select>
                    </div>
                </div>

                <!-- Tabela de Clientes -->
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nome</th>
                                <th>Telefone</th>
                                <th>Email</th>
                                <th>Documento</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody id="clientes-table-body">
                            <tr>
                                <td colspan="7" class="loading-row">
                                    <div class="loading-spinner"></div>
                                    <span>Carregando clientes...</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Paginação -->
                <div class="pagination" id="pagination">
                    <!-- Paginação será renderizada aqui -->
                </div>
            </div>

            <!-- Modal será criado dinamicamente pelo sistema UI -->
        `;
    }

    /**
     * Configura os event listeners
     */
    setupEventListeners() {
        // Botão novo cliente
        const newBtn = document.getElementById('new-cliente-btn');
        if (newBtn) {
            newBtn.addEventListener('click', () => this.showNewClienteModal());
        }

        // Botão atualizar
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadClientes());
        }

        // Busca
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }

        // Modal antigo removido - agora usando apenas window.UI.showModal
        // Os event listeners de modal são configurados dinamicamente em showClienteFormModal
    }

    /**
     * Carrega lista de clientes
     */
    async loadClientes() {
        try {
            this.showLoading();
            
            const response = await window.api.get('/api/clientes');
            const data = response.data;
            
            if (data.success) {
                this.clientes = data.data;
                this.renderClientesTable();
                this.renderPagination();
            } else {
                throw new Error(data.error || 'Erro ao carregar clientes');
            }
            
        } catch (error) {
            console.error('❌ Erro ao carregar clientes:', error);
            this.showError('Erro ao carregar clientes', error.message);
            this.showEmptyState();
        }
    }

    /**
     * Renderiza tabela de clientes
     */
    renderClientesTable() {
        const tbody = document.getElementById('clientes-table-body');
        if (!tbody) return;

        if (this.clientes.length === 0) {
                    tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <p>Nenhum cliente cadastrado</p>
                    <button class="btn btn-primary" id="first-cliente-btn">
                        Cadastrar Primeiro Cliente
                    </button>
                </td>
            </tr>
        `;
        
        // Configurar event listener para o botão de primeiro cliente
        const firstClienteBtn = document.getElementById('first-cliente-btn');
        if (firstClienteBtn) {
            firstClienteBtn.addEventListener('click', () => {
                this.showNewClienteModal();
            });
        }
        
        return;
        }

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageClientes = this.clientes.slice(startIndex, endIndex);

        tbody.innerHTML = pageClientes.map(cliente => `
            <tr data-id="${cliente.id}">
                <td>${cliente.id}</td>
                <td>
                    <div class="cliente-info">
                        <strong>${cliente.nome}</strong>
                        <small>${cliente.email || 'Sem email'}</small>
                    </div>
                </td>
                <td>${cliente.telefone}</td>
                <td>${cliente.email || '-'}</td>
                <td>${cliente.documento || '-'}</td>
                <td>
                    <span class="status-badge status-ativo">Ativo</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon btn-view" data-id="${cliente.id}" data-action="view" title="Visualizar">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon btn-edit" data-id="${cliente.id}" data-action="edit" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" data-id="${cliente.id}" data-action="delete" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        // Configurar event listeners para os botões de ação
        this.setupActionButtons();
    }

    /**
     * Renderiza paginação
     */
    renderPagination() {
        const pagination = document.getElementById('pagination');
        if (!pagination) return;

        const totalPages = Math.ceil(this.clientes.length / this.itemsPerPage);
        
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let paginationHTML = '<div class="pagination-controls">';
        
        // Botão anterior
        if (this.currentPage > 1) {
            paginationHTML += `<button class="btn-page" data-page="${this.currentPage - 1}">Anterior</button>`;
        }
        
        // Páginas
        for (let i = 1; i <= totalPages; i++) {
            if (i === this.currentPage) {
                paginationHTML += `<button class="btn-page active">${i}</button>`;
            } else {
                paginationHTML += `<button class="btn-page" data-page="${i}">${i}</button>`;
            }
        }
        
        // Botão próximo
        if (this.currentPage < totalPages) {
            paginationHTML += `<button class="btn-page" data-page="${this.currentPage + 1}">Próximo</button>`;
        }
        
        paginationHTML += '</div>';
        pagination.innerHTML = paginationHTML;
        
        // Configurar event listeners para a paginação
        this.setupPaginationButtons();
    }

    /**
     * Configura event listeners para os botões de ação
     */
    setupActionButtons() {
        const tbody = document.getElementById('clientes-table-body');
        if (!tbody) return;
        
        // Botões de visualizar
        const viewButtons = tbody.querySelectorAll('.btn-view');
        viewButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const clienteId = parseInt(button.dataset.id);
                this.viewCliente(clienteId);
            });
        });
        
        // Botões de editar
        const editButtons = tbody.querySelectorAll('.btn-edit');
        editButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const clienteId = parseInt(button.dataset.id);
                this.editCliente(clienteId);
            });
        });
        
        // Botões de excluir
        const deleteButtons = tbody.querySelectorAll('.btn-delete');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const clienteId = parseInt(button.dataset.id);
                this.deleteCliente(clienteId);
            });
        });
    }
    
    /**
     * Configura event listeners para a paginação
     */
    setupPaginationButtons() {
        const pagination = document.getElementById('pagination');
        if (!pagination) return;
        
        const pageButtons = pagination.querySelectorAll('.btn-page[data-page]');
        pageButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const page = parseInt(button.dataset.page);
                this.goToPage(page);
            });
        });
    }
    
    /**
     * Vai para uma página específica
     */
    goToPage(page) {
        this.currentPage = page;
        this.renderClientesTable();
        this.renderPagination();
    }

    /**
     * Mostra modal de novo cliente
     */
    showNewClienteModal() {
        console.log('🔄 Abrindo modal de novo cliente...');
        
        if (window.UI && window.UI.showModal) {
            console.log('✅ Usando modal da UI');
            this.showClienteFormModal(null, 'create');
        } else {
            console.error('❌ Módulo UI não disponível');
            // Fallback simples
            alert('Sistema de modal não disponível. Recarregue a página.');
        }
    }

    /**
     * Valida dados do cliente no frontend
     */
    validateClienteData(clienteData) {
        console.log('🔍 Validando dados do cliente:', clienteData);
        
        // Remover espaços em branco
        const nome = (clienteData.nome || '').trim();
        const telefone = (clienteData.telefone || '').trim();
        const email = (clienteData.email || '').trim();
        const documento = (clienteData.documento || '').trim();
        
        // Validar nome (obrigatório, 2-150 caracteres)
        if (!nome || nome.length < 2 || nome.length > 150) {
            return {
                valid: false,
                error: 'Nome é obrigatório e deve ter entre 2 e 150 caracteres'
            };
        }
        
        // Validar telefone (obrigatório, 10-20 caracteres)
        if (!telefone || telefone.length < 10 || telefone.length > 20) {
            return {
                valid: false,
                error: 'Telefone é obrigatório e deve ter entre 10 e 20 caracteres'
            };
        }
        
        // Validar email (opcional, mas se preenchido deve ser válido)
        if (email && !this.isValidEmail(email)) {
            return {
                valid: false,
                error: 'Email deve ser válido'
            };
        }
        
        // Validar documento (opcional, mas se preenchido deve ter 11-30 caracteres)
        if (documento && (documento.length < 11 || documento.length > 30)) {
            return {
                valid: false,
                error: 'Documento deve ter entre 11 e 30 caracteres'
            };
        }
        
        // Atualizar dados limpos
        clienteData.nome = nome;
        clienteData.telefone = telefone;
        clienteData.email = email || null;
        clienteData.documento = documento || null;
        
        return { valid: true };
    }
    
    /**
     * Valida formato de email
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Mostra modal de formulário de cliente usando UI
     */
    showClienteFormModal(cliente, mode) {
        console.log(`🔄 Abrindo modal de cliente: ${mode}`);
        
        const title = mode === 'create' ? 'Novo Cliente' : 'Editar Cliente';
        const content = `
            <form id="cliente-form-ui" class="cliente-form">
                <div class="form-group">
                    <label for="nome-ui">Nome Completo *</label>
                    <input type="text" id="nome-ui" name="nome" 
                           value="${cliente ? cliente.nome : ''}" 
                           placeholder="Digite o nome completo do cliente"
                           minlength="2" maxlength="150" required>
                    <small class="form-help">Mínimo 2 caracteres, máximo 150</small>
                </div>
                <div class="form-group">
                    <label for="telefone-ui">Telefone *</label>
                    <input type="tel" id="telefone-ui" name="telefone" 
                           value="${cliente ? cliente.telefone : ''}" 
                           placeholder="(11) 99999-9999"
                           minlength="10" maxlength="20" required>
                    <small class="form-help">Formato: (11) 99999-9999 ou similar</small>
                </div>
                <div class="form-group">
                    <label for="email-ui">Email</label>
                    <input type="email" id="email-ui" name="email" 
                           value="${cliente ? cliente.email || '' : ''}"
                           placeholder="cliente@email.com">
                    <small class="form-help">Email válido (opcional)</small>
                </div>
                <div class="form-group">
                    <label for="documento-ui">CPF/CNPJ</label>
                    <input type="text" id="documento-ui" name="documento" 
                           value="${cliente ? cliente.documento || '' : ''}"
                           placeholder="000.000.000-00 ou 00.000.000/0001-00"
                           minlength="11" maxlength="30">
                    <small class="form-help">CPF (11 dígitos) ou CNPJ (14 dígitos) - opcional</small>
                </div>
                <div class="form-group">
                    <label for="endereco-ui">Endereço</label>
                    <textarea id="endereco-ui" name="endereco" rows="3" 
                              placeholder="Rua, número, bairro, cidade, CEP"
                              maxlength="500">${cliente ? cliente.endereco || '' : ''}</textarea>
                    <small class="form-help">Endereço completo (opcional)</small>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" id="cancel-cliente-ui">Cancelar</button>
                    <button type="submit" class="btn btn-primary" id="save-cliente-ui">
                        ${mode === 'create' ? 'Criar Cliente' : 'Atualizar Cliente'}
                    </button>
                </div>
            </form>
        `;
        
        try {
            const closeModal = window.UI.showModal({
                title: title,
                content: content,
                size: 'md'
            });
            
            if (closeModal && typeof closeModal === 'function') {
                console.log('✅ Modal aberto com sucesso');
                
                // Configurar event listeners
                setTimeout(() => {
                    const form = document.getElementById('cliente-form-ui');
                    const cancelBtn = document.getElementById('cancel-cliente-ui');
                    const saveBtn = document.getElementById('save-cliente-ui');
                    
                    if (cancelBtn) {
                        cancelBtn.addEventListener('click', () => {
                            console.log('❌ Modal cancelado');
                            closeModal();
                        });
                    }
                    
                    if (form && saveBtn) {
                        form.addEventListener('submit', async (e) => {
                            e.preventDefault();
                            console.log('💾 Salvando cliente...');
                            
                            // Evitar múltiplos submits - desabilitar botão
                            if (saveBtn.disabled) {
                                console.log('⚠️ Já processando, ignorando submit...');
                                return;
                            }
                            
                            saveBtn.disabled = true;
                            saveBtn.textContent = 'Salvando...';
                            
                            const formData = new FormData(form);
                            const clienteData = Object.fromEntries(formData.entries());
                            
                            // Validar dados no frontend antes de enviar
                            const validation = this.validateClienteData(clienteData);
                            if (!validation.valid) {
                                this.showError('Erro de validação', validation.error);
                                // Reabilitar botão em caso de erro de validação
                                saveBtn.disabled = false;
                                saveBtn.textContent = mode === 'create' ? 'Criar Cliente' : 'Atualizar Cliente';
                                return;
                            }
                            
                            try {
                                if (mode === 'create') {
                                    await this.createCliente(clienteData);
                                } else {
                                    await this.updateCliente(cliente.id, clienteData);
                                }
                                
                                closeModal();
                                await this.loadClientes();
                                
                            } catch (error) {
                                console.error('❌ Erro ao salvar cliente:', error);
                                // Reabilitar botão em caso de erro
                                saveBtn.disabled = false;
                                saveBtn.textContent = mode === 'create' ? 'Criar Cliente' : 'Atualizar Cliente';
                            }
                        });
                    }
                }, 100);
            } else {
                console.error('❌ Modal não retornou função de fechar');
            }
        } catch (error) {
            console.error('❌ Erro ao abrir modal:', error);
        }
    }

    /**
     * Cria novo cliente
     */
    async createCliente(clienteData) {
        try {
            console.log('📤 Enviando dados do cliente:', clienteData);
            
            const response = await window.api.post('/api/clientes', clienteData);
            const data = response.data;
            
            if (data.success) {
                this.showSuccess('Cliente criado com sucesso!');
                
                // 🔄 DISPARAR EVENTO DE ATUALIZAÇÃO AUTOMÁTICA
                this.notifyDashboardUpdate();
                
                return data.data;
            } else {
                throw new Error(data.error || 'Erro ao criar cliente');
            }
            
        } catch (error) {
            console.error('❌ Erro ao criar cliente:', error);
            console.error('❌ Resposta completa:', error.response);
            
            // Tratar erros de validação específicos
            if (error.response && error.response.status === 400) {
                const errorData = error.response.data;
                console.error('❌ Dados do erro 400:', errorData);
                
                if (errorData.errors && Array.isArray(errorData.errors)) {
                    // Erro de validação com detalhes
                    const errorMessages = errorData.errors.map(err => err.msg).join(', ');
                    this.showError('Erro de validação', errorMessages);
                } else if (errorData.error) {
                    // Erro específico (ex: documento duplicado)
                    this.showError('Erro ao criar cliente', errorData.error);
                } else {
                    this.showError('Erro ao criar cliente', 'Dados inválidos enviados');
                }
            } else {
                this.showError('Erro ao criar cliente', error.message || 'Erro desconhecido');
            }
            throw error;
        }
    }

    /**
     * Atualiza cliente existente
     */
    async updateCliente(id, clienteData) {
        try {
            const response = await window.api.put(`/api/clientes/${id}`, clienteData);
            const data = response.data;
            
                    if (data.success) {
            this.showSuccess('Cliente atualizado com sucesso!');
            
            // 🔄 DISPARAR EVENTO DE ATUALIZAÇÃO AUTOMÁTICA
            this.notifyDashboardUpdate();
            
            return data.data;
        } else {
            throw new Error(data.error || 'Erro ao atualizar cliente');
        }
            
        } catch (error) {
            console.error('❌ Erro ao atualizar cliente:', error);
            this.showError('Erro ao atualizar cliente', error.message);
            throw error;
        }
    }

    /**
     * Mostra modal de edição
     */
    showEditClienteModal(cliente) {
        if (window.UI) {
            // Usar modal da UI
            this.showClienteFormModal(cliente, 'edit');
        } else {
            // Fallback para modal básico
            const modal = document.getElementById('cliente-modal');
            const modalTitle = document.getElementById('modal-title');
            const form = document.getElementById('cliente-form');
            
            if (modal && modalTitle && form) {
                modalTitle.textContent = 'Editar Cliente';
                form.dataset.mode = 'edit';
                form.dataset.clienteId = cliente.id;
                
                // Preencher campos
                document.getElementById('nome').value = cliente.nome;
                document.getElementById('telefone').value = cliente.telefone;
                document.getElementById('email').value = cliente.email || '';
                document.getElementById('documento').value = cliente.documento || '';
                document.getElementById('endereco').value = cliente.endereco || '';
                
                modal.classList.add('active');
            }
        }
    }

    /**
     * Esconde modal
     */
    hideModal() {
        if (window.UI) {
            window.UI.hideModal();
        } else {
            // Fallback para modal básico
            const modal = document.getElementById('cliente-modal');
            if (modal) {
                modal.classList.remove('active');
            }
        }
    }

    /**
     * Salva cliente
     */
    // Função saveCliente removida - agora usando apenas createCliente e updateCliente
    // através do sistema de modal unificado window.UI.showModal

    /**
     * Visualiza cliente
     */
    viewCliente(id) {
        const cliente = this.clientes.find(c => c.id === id);
        if (cliente) {
            this.showClienteDetails(cliente);
        }
    }

    /**
     * Edita cliente
     */
    editCliente(id) {
        const cliente = this.clientes.find(c => c.id === id);
        if (cliente) {
            this.showEditClienteModal(cliente);
        }
    }

    /**
     * Exclui cliente
     */
    async deleteCliente(id) {
        let confirmed = false;
        
        // Buscar informações do cliente antes de excluir
        try {
            const clienteResponse = await window.api.get(`/api/clientes/${id}`);
            if (!clienteResponse.data.success) {
                throw new Error('Erro ao buscar dados do cliente');
            }
            
            const cliente = clienteResponse.data.data;
            
            // Verificar se cliente tem vendas ou orçamentos
            let message = 'Tem certeza que deseja excluir este cliente?';
            let hasActivities = false;
            
            if (cliente.total_vendas > 0 || cliente.total_orcamentos > 0) {
                hasActivities = true;
                message = `⚠️ ATENÇÃO: Este cliente possui atividades registradas!\n\n` +
                         `• Vendas: ${cliente.total_vendas || 0}\n` +
                         `• Orçamentos: ${cliente.total_orcamentos || 0}\n\n` +
                         `Ao excluir o cliente, TODAS essas atividades serão removidas permanentemente!\n\n` +
                         `Tem certeza que deseja continuar?`;
            }
            
            if (window.UI) {
                confirmed = await window.UI.showConfirm({
                    title: hasActivities ? '⚠️ Confirmação de Exclusão' : 'Confirmar Exclusão',
                    message: message,
                    okText: 'Sim, Excluir Tudo',
                    cancelText: 'Cancelar',
                    type: hasActivities ? 'warning' : 'info'
                });
            } else {
                confirmed = confirm(message);
            }
            
        } catch (error) {
            console.warn('⚠️ Erro ao buscar dados do cliente, usando confirmação simples:', error);
            if (window.UI) {
                confirmed = await window.UI.showConfirm({
                    title: 'Confirmar Exclusão',
                    message: 'Tem certeza que deseja excluir este cliente?',
                    okText: 'Excluir',
                    cancelText: 'Cancelar'
                });
            } else {
                confirmed = confirm('Tem certeza que deseja excluir este cliente?');
            }
        }
        
        if (!confirmed) return;
        
        try {
            const response = await window.api.delete(`/api/clientes/${id}`);
            const data = response.data;
            
            if (data.success) {
                // Mostrar resumo da exclusão se disponível
                let successMessage = 'Cliente excluído com sucesso!';
                
                if (data.data && data.data.resumo) {
                    const resumo = data.data.resumo;
                    successMessage = `✅ Cliente excluído com sucesso!\n\n` +
                                   `📊 Resumo da exclusão:\n` +
                                   `• Vendas removidas: ${resumo.vendas_excluidas}\n` +
                                   `• Orçamentos removidos: ${resumo.orcamentos_excluidos}\n` +
                                   `• Pagamentos removidos: ${resumo.pagamentos_excluidos}\n` +
                                   `• Itens de venda removidos: ${resumo.itens_venda_excluidos}\n` +
                                   `• Itens de orçamento removidos: ${resumo.itens_orcamento_excluidos}`;
                }
                
                this.showSuccess(successMessage);
                await this.loadClientes();
                
                // 🔄 DISPARAR EVENTO DE ATUALIZAÇÃO AUTOMÁTICA
                this.notifyDashboardUpdate();
            } else {
                throw new Error(data.error || 'Erro ao excluir cliente');
            }
            
        } catch (error) {
            console.error('❌ Erro ao excluir cliente:', error);
            if (window.UI) {
                window.UI.showErrorWithTitle('Erro ao excluir cliente', error.message);
            } else {
                alert(`Erro ao excluir cliente: ${error.message}`);
            }
        }
    }

    /**
     * Mostra detalhes do cliente
     */
    async showClienteDetails(cliente) {
        if (window.UI) {
            const content = `
                <div class="cliente-details">
                    <div class="detail-item">
                        <strong>Nome:</strong> ${cliente.nome}
                    </div>
                    <div class="detail-item">
                        <strong>Telefone:</strong> ${cliente.telefone}
                    </div>
                    <div class="detail-item">
                        <strong>Email:</strong> ${cliente.email || 'Não informado'}
                    </div>
                    <div class="detail-item">
                        <strong>Documento:</strong> ${cliente.documento || 'Não informado'}
                    </div>
                    <div class="detail-item">
                        <strong>Endereço:</strong> ${cliente.endereco || 'Não informado'}
                    </div>
                </div>
            `;
            
            window.UI.showModal({
                title: `Detalhes do Cliente`,
                content: content,
                size: 'sm'
            });
        } else {
            alert(`Cliente: ${cliente.nome}\nTelefone: ${cliente.telefone}\nEmail: ${cliente.email || 'Não informado'}`);
        }
    }

    /**
     * Busca clientes
     */
    handleSearch(query) {
        if (!query.trim()) {
            this.renderClientesTable();
            return;
        }
        
        const filtered = this.clientes.filter(cliente => 
            cliente.nome.toLowerCase().includes(query.toLowerCase()) ||
            cliente.email?.toLowerCase().includes(query.toLowerCase()) ||
            cliente.documento?.includes(query)
        );
        
        this.renderFilteredClientes(filtered);
    }

    /**
     * Renderiza clientes filtrados
     */
    renderFilteredClientes(clientes) {
        const tbody = document.getElementById('clientes-table-body');
        if (!tbody) return;

        if (clientes.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <p>Nenhum cliente encontrado para esta busca</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = clientes.map(cliente => `
            <tr data-id="${cliente.id}">
                <td>${cliente.id}</td>
                <td>
                    <div class="cliente-info">
                        <strong>${cliente.nome}</strong>
                        <small>${cliente.email || 'Sem email'}</small>
                    </div>
                </td>
                <td>${cliente.telefone}</td>
                <td>${cliente.email || '-'}</td>
                <td>${cliente.documento || '-'}</td>
                <td>
                    <span class="status-badge status-ativo">Ativo</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon btn-view" data-id="${cliente.id}" data-action="view" title="Visualizar">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon btn-edit" data-id="${cliente.id}" data-action="edit" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" data-id="${cliente.id}" data-action="delete" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    /**
     * Mostra estado de carregamento
     */
    showLoading() {
        const tbody = document.getElementById('clientes-table-body');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="loading-row">
                        <div class="loading-spinner"></div>
                        <span>Carregando clientes...</span>
                    </td>
                </tr>
            `;
        }
    }

    /**
     * Mostra estado vazio
     */
    showEmptyState() {
        const tbody = document.getElementById('clientes-table-body');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <div class="empty-icon">
                            <i class="fas fa-users"></i>
                        </div>
                        <p>Erro ao carregar clientes</p>
                        <button class="btn btn-primary" id="retry-load-btn">
                            Tentar Novamente
                        </button>
                    </td>
                </tr>
            `;
            
            // Configurar event listener para o botão de tentar novamente
            const retryBtn = document.getElementById('retry-load-btn');
            if (retryBtn) {
                retryBtn.addEventListener('click', () => {
                    this.loadClientes();
                });
            }
        }
    }

    /**
     * Mostra mensagem de sucesso
     */
    showSuccess(message) {
        if (window.UI) {
            window.UI.showSuccess(message);
        } else {
            alert(message);
        }
    }

    /**
     * Mostra mensagem de erro
     */
    showError(title, message) {
        if (window.UI) {
            window.UI.showErrorWithTitle(title, message);
        } else {
            alert(`${title}: ${message}`);
        }
    }
    
    /**
     * 🔄 NOTIFICA DASHBOARD SOBRE ATUALIZAÇÕES
     * Dispara evento customizado para atualizar estatísticas automaticamente
     */
    notifyDashboardUpdate() {
        console.log('🔄 Notificando dashboard sobre atualização...');
        
        // Usar EventManager global se disponível
        if (window.eventManager) {
            window.eventManager.dispatchUpdate('clientes', 'update', {
                action: 'crud',
                timestamp: new Date().toISOString()
            });
        } else {
            // Fallback para evento local
            const updateEvent = new CustomEvent('dashboard-update', {
                detail: {
                    type: 'clientes',
                    timestamp: new Date().toISOString(),
                    action: 'update'
                }
            });
            
            window.dispatchEvent(updateEvent);
            document.dispatchEvent(updateEvent);
        }
        
        console.log('✅ Evento de atualização disparado!');
    }
}

// Inicializar página quando carregar
document.addEventListener('DOMContentLoaded', () => {
    if (window.currentPage === 'clientes') {
        window.clientesPage = new ClientesPage();
    }
});

// Exportar para uso global
window.ClientesPage = ClientesPage; 