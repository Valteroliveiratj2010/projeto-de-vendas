/**
 * Página de Produtos - Sistema de Vendas
 */

class ProdutosPage {
    constructor() {
        this.produtos = [];
        this.filteredProdutos = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.isLoading = false;
        this.init();
    }

    init() {
        try {
            console.log('🚀 Inicializando página de produtos...');

            // Renderizar estrutura HTML
            this.renderPage();

            // Carregar dados
            this.loadProdutos();

            // Configurar event listeners
            this.setupEventListeners();

            console.log('✅ Página de produtos inicializada!');

        } catch (error) {
            console.error('❌ Erro ao inicializar página de produtos:', error);
            this.showError('Erro ao carregar página', error.message);
        }
    }

    /**
     * Renderiza a estrutura HTML da página
     */
    renderPage() {
        const pageContainer = document.getElementById('produtos-content');
        if (!pageContainer) {
            console.error('Container de produtos não encontrado!');
            return;
        }

        pageContainer.innerHTML = `
            <div class="page-header">
                <div class="header-content">
                    <h2>Gestão de Produtos</h2>
                    <p>Gerencie seu estoque e produtos</p>
                </div>
                <div class="header-actions">
                    <button class="btn btn-secondary" id="refresh-produtos-btn">
                        <i class="fas fa-sync-alt"></i>
                        Atualizar
                    </button>
                    <button class="btn btn-primary" id="new-produto-btn">
                        <i class="fas fa-plus"></i>
                        Novo Produto
                    </button>
                </div>
            </div>

            <div class="page-content">
                <!-- Filtros e Busca -->
                <div class="filters-section">
                    <div class="search-box">
                        <input type="text" id="search-produtos" placeholder="Buscar produtos por nome...">
                        <button id="search-produtos-btn">
                            <i class="fas fa-search"></i>
                        </button>
                    </div>
                    <div class="filter-buttons">
                        <button class="btn btn-outline" id="filter-all">Todos</button>
                        <button class="btn btn-outline" id="filter-active">Ativos</button>
                        <button class="btn btn-outline" id="filter-low-stock">Estoque Baixo</button>
                    </div>
                </div>

                <!-- Estatísticas Rápidas -->
                <div class="stats-row">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-boxes-stacked"></i>
                        </div>
                        <div class="stat-content">
                            <h3 id="total-produtos-stat">0</h3>
                            <p>Total de Produtos</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-dollar-sign"></i>
                        </div>
                        <div class="stat-content">
                            <h3 id="valor-estoque-stat">R$ 0,00</h3>
                            <p>Valor do Estoque</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div class="stat-content">
                            <h3 id="estoque-baixo-stat">0</h3>
                            <p>Estoque Baixo</p>
                        </div>
                    </div>
                </div>

                <!-- Tabela de Produtos -->
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Produto</th>
                                <th>Preço</th>
                                <th>Estoque</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody id="produtos-table-body">
                            <tr>
                                <td colspan="6" class="loading-row">
                                    <div class="loading-spinner"></div>
                                    <span>Carregando produtos...</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Paginação -->
                <div id="produtos-pagination" class="pagination-container"></div>
            </div>
        `;
    }

    setupEventListeners() {
        const refreshBtn = document.getElementById('refresh-produtos-btn');
        const newBtn = document.getElementById('new-produto-btn');
        const searchInput = document.getElementById('search-produtos');
        const filterAll = document.getElementById('filter-all');
        const filterActive = document.getElementById('filter-active');
        const filterLowStock = document.getElementById('filter-low-stock');

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadProdutos());
        }

        if (newBtn) {
            newBtn.addEventListener('click', () => this.showNewProdutoModal());
        }

        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }

        if (filterAll) {
            filterAll.addEventListener('click', () => this.applyFilter('all'));
        }

        if (filterActive) {
            filterActive.addEventListener('click', () => this.applyFilter('active'));
        }

        if (filterLowStock) {
            filterLowStock.addEventListener('click', () => this.applyFilter('low-stock'));
        }
    }

    async loadProdutos() {
        if (this.isLoading) return;

        try {
            this.isLoading = true;
            this.showLoading();

            console.log('📦 Carregando produtos...');
            const response = await window.api.get('/api/produtos');

            if (response.data && response.data.success) {
                this.produtos = response.data.data || [];
                this.filteredProdutos = [...this.produtos];

                console.log(`✅ ${this.produtos.length} produtos carregados`);
                this.updateStats();
                this.renderProdutosTable();
                this.renderPagination();
            } else {
                throw new Error(response.data?.error || 'Erro ao carregar produtos');
            }

        } catch (error) {
            console.error('❌ Erro ao carregar produtos:', error);
            this.showError('Erro ao carregar produtos', error.message);
            this.showEmptyState();
        } finally {
            this.isLoading = false;
        }
    }

    renderProdutosTable() {
        const tbody = document.getElementById('produtos-table-body');
        if (!tbody) return;

        if (this.filteredProdutos.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <div class="empty-icon">
                            <i class="fas fa-box"></i>
                        </div>
                        <p>Nenhum produto encontrado</p>
                        <button class="btn btn-primary" id="first-produto-btn">
                            Cadastrar Primeiro Produto
                        </button>
                    </td>
                </tr>
            `;

            // Configurar event listener para o botão
            const firstProdutoBtn = document.getElementById('first-produto-btn');
            if (firstProdutoBtn) {
                firstProdutoBtn.addEventListener('click', () => {
                    this.showNewProdutoModal();
                });
            }

            return;
        }

        // Paginação
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageProdutos = this.filteredProdutos.slice(startIndex, endIndex);

        tbody.innerHTML = pageProdutos.map(produto => `
            <tr data-id="${produto.id}">
                <td>${produto.id}</td>
                <td>
                    <div class="produto-info">
                        <strong>${produto.nome}</strong>
                        <small>${produto.descricao || 'Sem descrição'}</small>
                    </div>
                </td>
                <td>
                    <span class="price-value">${this.formatCurrency(produto.preco)}</span>
                </td>
                <td>
                    <span class="stock-badge ${produto.estoque <= 5 ? 'stock-low' : 'stock-normal'}">
                        ${produto.estoque} un.
                    </span>
                </td>
                <td>
                    <span class="status-badge ${produto.estoque > 0 ? 'status-ativo' : 'status-inativo'}">
                        ${produto.estoque > 0 ? 'Disponível' : 'Sem Estoque'}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon btn-view" data-id="${produto.id}" data-action="view" title="Visualizar">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon btn-edit" data-id="${produto.id}" data-action="edit" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" data-id="${produto.id}" data-action="delete" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Configurar event listeners para os botões de ação
        this.setupActionButtons();
    }

    setupActionButtons() {
        const tbody = document.getElementById('produtos-table-body');
        if (!tbody) return;

        // Botões de visualizar
        const viewButtons = tbody.querySelectorAll('.btn-view');
        viewButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const produtoId = parseInt(button.dataset.id);
                this.viewProduto(produtoId);
            });
        });

        // Botões de editar
        const editButtons = tbody.querySelectorAll('.btn-edit');
        editButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const produtoId = parseInt(button.dataset.id);
                this.editProduto(produtoId);
            });
        });

        // Botões de excluir
        const deleteButtons = tbody.querySelectorAll('.btn-delete');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const produtoId = parseInt(button.dataset.id);
                this.deleteProduto(produtoId);
            });
        });
    }

    renderPagination() {
        const pagination = document.getElementById('produtos-pagination');
        if (!pagination) return;

        const totalPages = Math.ceil(this.filteredProdutos.length / this.itemsPerPage);

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

    setupPaginationButtons() {
        const pagination = document.getElementById('produtos-pagination');
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

    goToPage(page) {
        this.currentPage = page;
        this.renderProdutosTable();
        this.renderPagination();
    }

    updateStats() {
        const totalProdutos = this.produtos.length;
        const valorEstoque = this.produtos.reduce((total, produto) => {
            return total + (produto.preco * produto.estoque);
        }, 0);
        const estoqueBaixo = this.produtos.filter(produto => produto.estoque <= 5).length;

        const totalProdutosStat = document.getElementById('total-produtos-stat');
        const valorEstoqueStat = document.getElementById('valor-estoque-stat');
        const estoqueBaixoStat = document.getElementById('estoque-baixo-stat');

        if (totalProdutosStat) totalProdutosStat.textContent = totalProdutos;
        if (valorEstoqueStat) valorEstoqueStat.textContent = this.formatCurrency(valorEstoque);
        if (estoqueBaixoStat) estoqueBaixoStat.textContent = estoqueBaixo;
    }

    handleSearch(query) {
        if (!query.trim()) {
            this.filteredProdutos = [...this.produtos];
        } else {
            this.filteredProdutos = this.produtos.filter(produto =>
                produto.nome.toLowerCase().includes(query.toLowerCase()) ||
                produto.descricao?.toLowerCase().includes(query.toLowerCase())
            );
        }

        this.currentPage = 1;
        this.renderProdutosTable();
        this.renderPagination();
    }

    applyFilter(filterType) {
        // Remover classe active de todos os filtros
        document.querySelectorAll('.filter-buttons .btn').forEach(btn => {
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-outline');
        });

        // Adicionar classe active ao filtro selecionado
        let activeButton;
        switch (filterType) {
            case 'all':
                activeButton = document.getElementById('filter-all');
                this.filteredProdutos = [...this.produtos];
                break;
            case 'active':
                activeButton = document.getElementById('filter-active');
                this.filteredProdutos = this.produtos.filter(produto => produto.estoque > 0);
                break;
            case 'low-stock':
                activeButton = document.getElementById('filter-low-stock');
                this.filteredProdutos = this.produtos.filter(produto => produto.estoque <= 5);
                break;
        }

        if (activeButton) {
            activeButton.classList.remove('btn-outline');
            activeButton.classList.add('btn-primary');
        }

        this.currentPage = 1;
        this.renderProdutosTable();
        this.renderPagination();
    }

    showNewProdutoModal() {
        console.log('➕ Abrindo modal de novo produto');
        this.showProdutoFormModal(null, 'create');
    }

    showProdutoFormModal(produto, mode) {
        if (!window.UI) {
            alert('Sistema de modal não disponível. Recarregue a página.');
            return;
        }

        const title = mode === 'create' ? 'Novo Produto' : 'Editar Produto';
        const content = `
            <form id="produto-form-ui" class="produto-form">
                <div class="form-row">
                    <div class="form-group">
                        <label for="nome-produto-ui">Nome *</label>
                        <input type="text" id="nome-produto-ui" name="nome" value="${produto ? produto.nome : ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="preco-ui">Preço *</label>
                        <input type="number" id="preco-ui" name="preco" step="0.01" min="0" value="${produto ? produto.preco : ''}" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="estoque-ui">Estoque *</label>
                        <input type="number" id="estoque-ui" name="estoque" min="0" value="${produto ? produto.estoque : ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="estoque-minimo-ui">Estoque Mínimo</label>
                        <input type="number" id="estoque-minimo-ui" name="estoque_minimo" min="0" value="${produto ? produto.estoque_minimo || 5 : 5}">
                    </div>
                </div>
                <div class="form-group">
                    <label for="descricao-ui">Descrição</label>
                    <textarea id="descricao-ui" name="descricao" rows="3">${produto ? produto.descricao || '' : ''}</textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" id="cancel-produto-ui">Cancelar</button>
                    <button type="submit" class="btn btn-primary" id="save-produto-ui">
                        ${mode === 'create' ? 'Criar' : 'Atualizar'}
                    </button>
                </div>
            </form>
        `;

        window.UI.showModal({
            title: title,
            content: content,
            size: 'md'
        });

        // Configurar event listeners do formulário
        const form = document.getElementById('produto-form-ui');
        const cancelBtn = document.getElementById('cancel-produto-ui');

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                window.UI.hideModal();
            });
        }

        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();

                const formData = new FormData(form);
                const produtoData = Object.fromEntries(formData.entries());

                // Converter números
                produtoData.preco = parseFloat(produtoData.preco);
                produtoData.estoque = parseInt(produtoData.estoque);
                produtoData.estoque_minimo = parseInt(produtoData.estoque_minimo);

                try {
                    if (mode === 'create') {
                        await this.createProduto(produtoData);
                    } else {
                        await this.updateProduto(produto.id, produtoData);
                    }

                    window.UI.hideModal();
                    await this.loadProdutos();
                } catch (error) {
                    console.error('❌ Erro ao salvar produto:', error);
                }
            });
        }
    }

    async createProduto(produtoData) {
        try {
            const response = await window.api.post('/api/produtos', produtoData);
            const data = response.data;

            if (data.success) {
                this.showSuccess('Produto criado com sucesso!');

                // 🔄 DISPARAR EVENTO DE ATUALIZAÇÃO AUTOMÁTICA
                this.notifyDashboardUpdate();

                return data.data;
            } else {
                throw new Error(data.error || 'Erro ao criar produto');
            }

        } catch (error) {
            console.error('❌ Erro ao criar produto:', error);
            this.showError('Erro ao criar produto', error.message);
            throw error;
        }
    }

    async updateProduto(id, produtoData) {
        try {
            const response = await window.api.put(`/api/produtos/${id}`, produtoData);
            const data = response.data;

            if (data.success) {
                this.showSuccess('Produto atualizado com sucesso!');

                // 🔄 DISPARAR EVENTO DE ATUALIZAÇÃO AUTOMÁTICA
                this.notifyDashboardUpdate();

                return data.data;
            } else {
                throw new Error(data.error || 'Erro ao atualizar produto');
            }

        } catch (error) {
            console.error('❌ Erro ao atualizar produto:', error);
            this.showError('Erro ao atualizar produto', error.message);
            throw error;
        }
    }

    viewProduto(id) {
        const produto = this.produtos.find(p => p.id === id);
        if (!produto) return;

        if (window.UI) {
            const content = `
                <div class="produto-details">
                    <div class="detail-row">
                        <div class="detail-item">
                            <strong>Nome:</strong> ${produto.nome}
                        </div>
                        <div class="detail-item">
                            <strong>Preço:</strong> ${this.formatCurrency(produto.preco)}
                        </div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-item">
                            <strong>Estoque:</strong> ${produto.estoque} unidades
                        </div>
                        <div class="detail-item">
                            <strong>Estoque Mínimo:</strong> ${produto.estoque_minimo || 5} unidades
                        </div>
                    </div>
                    <div class="detail-item">
                        <strong>Descrição:</strong> ${produto.descricao || 'Não informada'}
                    </div>
                    <div class="detail-item">
                        <strong>Valor Total em Estoque:</strong> ${this.formatCurrency(produto.preco * produto.estoque)}
                    </div>
                </div>
            `;

            window.UI.showModal({
                title: `Detalhes do Produto - ${produto.nome}`,
                content: content,
                size: 'md'
            });
        }
    }

    editProduto(id) {
        const produto = this.produtos.find(p => p.id === id);
        if (produto) {
            this.showProdutoFormModal(produto, 'edit');
        }
    }

    async deleteProduto(id) {
        const produto = this.produtos.find(p => p.id === id);
        if (!produto) return;

        let confirmed = false;

        if (window.UI) {
            confirmed = await window.UI.showConfirm({
                title: 'Confirmar Exclusão',
                message: `Tem certeza que deseja excluir o produto "${produto.nome}"?`,
                okText: 'Excluir',
                cancelText: 'Cancelar'
            });
        } else {
            confirmed = confirm(`Tem certeza que deseja excluir o produto "${produto.nome}"?`);
        }

        if (!confirmed) return;

        try {
            const response = await window.api.delete(`/api/produtos/${id}`);
            const data = response.data;

            if (data.success) {
                this.showSuccess('Produto excluído com sucesso!');
                await this.loadProdutos();

                // 🔄 DISPARAR EVENTO DE ATUALIZAÇÃO AUTOMÁTICA
                this.notifyDashboardUpdate();
            } else {
                throw new Error(data.error || 'Erro ao excluir produto');
            }

        } catch (error) {
            console.error('❌ Erro ao excluir produto:', error);

            // Tratar erros específicos da API
            let errorMessage = 'Erro ao excluir produto';
            let errorTitle = 'Erro';

            if (error.response && error.response.data) {
                const apiError = error.response.data;
                if (apiError.error) {
                    errorMessage = apiError.error;
                    errorTitle = 'Produto não pode ser excluído';
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            this.showError(errorTitle, errorMessage);
        }
    }

    showLoading() {
        const tbody = document.getElementById('produtos-table-body');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="loading-row">
                        <div class="loading-spinner"></div>
                        <span>Carregando produtos...</span>
                    </td>
                </tr>
            `;
        }
    }

    showEmptyState() {
        const tbody = document.getElementById('produtos-table-body');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <div class="empty-icon">
                            <i class="fas fa-box"></i>
                        </div>
                        <p>Erro ao carregar produtos</p>
                        <button class="btn btn-primary" id="retry-load-produtos-btn">
                            Tentar Novamente
                        </button>
                    </td>
                </tr>
            `;

            // Configurar event listener para o botão de tentar novamente
            const retryBtn = document.getElementById('retry-load-produtos-btn');
            if (retryBtn) {
                retryBtn.addEventListener('click', () => {
                    this.loadProdutos();
                });
            }
        }
    }

    showSuccess(message) {
        if (window.UI) {
            window.UI.showSuccess(message);
        } else {
            alert(message);
        }
    }

    showError(title, message) {
        if (window.UI) {
            window.UI.showErrorWithTitle(title, message);
        } else {
            alert(`${title}: ${message}`);
        }
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    /**
     * 🔄 NOTIFICA DASHBOARD SOBRE ATUALIZAÇÕES
     * Dispara evento customizado para atualizar estatísticas automaticamente
     */
    notifyDashboardUpdate() {
        console.log('🔄 Notificando dashboard sobre atualização de produtos...');

        // Usar EventManager global se disponível
        if (window.eventManager) {
            window.eventManager.dispatchUpdate('produtos', 'update', {
                action: 'crud',
                timestamp: new Date().toISOString()
            });
        } else {
            // Fallback para evento local
            const updateEvent = new CustomEvent('dashboard-update', {
                detail: {
                    type: 'produtos',
                    timestamp: new Date().toISOString(),
                    action: 'update'
                }
            });

            window.dispatchEvent(updateEvent);
            document.dispatchEvent(updateEvent);
        }

        console.log('✅ Evento de atualização de produtos disparado!');
    }

    /**
     * 🧹 LIMPA RECURSOS E ELEMENTOS DA PÁGINA
     */
    async cleanup() {
        try {
            console.log('🧹 Fazendo cleanup da ProdutosPage...');

            // ✅ LIMPAR CONTEÚDO HTML PARA EVITAR DUPLICAÇÃO
            const pageContainer = document.getElementById('produtos-content');
            if (pageContainer) {
                pageContainer.innerHTML = `
                    <div class="loading-placeholder">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Carregando módulo de Produtos...</p>
                    </div>
                `;
                console.log('✅ Conteúdo HTML limpo');
            }

            // ✅ LIMPAR ESTADO INTERNO
            this.produtos = [];
            this.filteredProdutos = [];
            this.currentPage = 1;
            this.isLoading = false;

            // ✅ REMOVER EVENT LISTENERS
            this.removeEventListeners();

            console.log('✅ Cleanup da ProdutosPage concluído');

        } catch (error) {
            console.error('❌ Erro durante cleanup:', error);
        }
    }

    /**
     * 🧹 REMOVE EVENT LISTENERS PARA EVITAR MEMORY LEAKS
     */
    removeEventListeners() {
        try {
            console.log('🧹 Removendo event listeners...');

            // ✅ REMOVER LISTENERS DOS BOTÕES
            const refreshBtn = document.getElementById('refresh-produtos-btn');
            const newProdutoBtn = document.getElementById('new-produto-btn');
            const searchBtn = document.getElementById('search-produtos-btn');
            const searchInput = document.getElementById('search-produtos');

            if (refreshBtn) {
                refreshBtn.replaceWith(refreshBtn.cloneNode(true));
            }
            if (newProdutoBtn) {
                newProdutoBtn.replaceWith(newProdutoBtn.cloneNode(true));
            }
            if (searchBtn) {
                searchBtn.replaceWith(searchBtn.cloneNode(true));
            }
            if (searchInput) {
                searchInput.replaceWith(searchInput.cloneNode(true));
            }

            console.log('✅ Event listeners removidos');

        } catch (error) {
            console.warn('⚠️ Erro ao remover event listeners:', error);
        }
    }
}

// Inicializar página quando carregar
document.addEventListener('DOMContentLoaded', () => {
    if (window.currentPage === 'produtos') {
        window.produtosPage = new ProdutosPage();
    }
});

// Exportar para uso global
window.ProdutosPage = ProdutosPage; 