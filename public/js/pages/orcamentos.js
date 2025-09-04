/**
 * Página de Orçamentos - Sistema de Vendas
 */

class OrcamentosPage {
    constructor() {
        this.orcamentos = [];
        this.filteredOrcamentos = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.isLoading = false;
        this.clientes = [];
        this.produtos = [];
        this.init();
    }

    init() {
        try {
            console.log('🚀 Inicializando página de orçamentos...');

            // Renderizar estrutura HTML
            this.renderPage();

            // Carregar dados
            this.loadInitialData();

            // Configurar event listeners
            this.setupEventListeners();

            console.log('✅ Página de orçamentos inicializada!');

        } catch (error) {
            console.error('❌ Erro ao inicializar página de orçamentos:', error);
            this.showError('Erro ao carregar página', error.message);
        }
    }

    /**
     * Renderiza a estrutura HTML da página
     */
    renderPage() {
        const pageContainer = document.getElementById('orcamentos-content');
        if (!pageContainer) {
            console.error('Container de orçamentos não encontrado!');
            return;
        }

        pageContainer.innerHTML = `
            <div class="page-header">
                <div class="header-content">
                    <h2>Gestão de Orçamentos</h2>
                    <p>Gerencie seus orçamentos e propostas</p>
                </div>
                <div class="header-actions">
                    <button class="btn btn-secondary" id="refresh-orcamentos-btn">
                        <i class="fas fa-sync-alt"></i>
                        Atualizar
                    </button>
                    <button class="btn btn-primary" id="new-orcamento-btn">
                        <i class="fas fa-plus"></i>
                        Novo Orçamento
                    </button>
                </div>
            </div>

            <div class="page-content">
                <!-- Filtros e Busca -->
                <div class="filters-section">
                    <div class="search-box">
                        <input type="text" id="search-orcamentos" placeholder="Buscar orçamentos por cliente...">
                        <button id="search-orcamentos-btn">
                            <i class="fas fa-search"></i>
                        </button>
                    </div>
                    <div class="filter-buttons">
                        <button class="btn btn-outline" id="filter-all-orcamentos">Todos</button>
                        <button class="btn btn-outline" id="filter-pendentes-orcamentos">Pendentes</button>
                        <button class="btn btn-outline" id="filter-aprovados-orcamentos">Aprovados</button>
                    </div>
                </div>

                <!-- Estatísticas Rápidas -->
                <div class="stats-row">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-file-invoice"></i>
                        </div>
                        <div class="stat-content">
                            <h3 id="total-orcamentos-stat">0</h3>
                            <p>Total de Orçamentos</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="stat-content">
                            <h3 id="orcamentos-pendentes-stat">0</h3>
                            <p>Pendentes</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div class="stat-content">
                            <h3 id="orcamentos-aprovados-stat">0</h3>
                            <p>Aprovados</p>
                        </div>
                    </div>
                </div>

                <!-- Tabela de Orçamentos -->
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Cliente</th>
                                <th>Valor</th>
                                <th>Data</th>
                                <th>Validade</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody id="orcamentos-table-body">
                            <tr>
                                <td colspan="7" class="loading-row">
                                    <div class="loading-spinner"></div>
                                    <span>Carregando orçamentos...</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Paginação -->
                <div id="orcamentos-pagination" class="pagination-container"></div>
            </div>
        `;
    }

    async loadInitialData() {
        await Promise.all([
            this.loadOrcamentos(),
            this.loadClientes(),
            this.loadProdutos()
        ]);
    }

    renderPage() {
        const pageContainer = document.getElementById('orcamentos-page');
        if (!pageContainer) return;

        pageContainer.innerHTML = `
            <div class="page-header">
                <div class="header-content">
                    <h2>Gestão de Orçamentos</h2>
                    <p>Crie e gerencie seus orçamentos</p>
                </div>
                <div class="header-actions">
                    <button class="btn btn-secondary" id="refresh-orcamentos-btn">
                        <i class="fas fa-sync-alt"></i>
                        Atualizar
                    </button>
                    <button class="btn btn-primary" id="new-orcamento-btn">
                        <i class="fas fa-plus"></i>
                        Novo Orçamento
                    </button>
                </div>
            </div>

            <div class="page-content">
                <!-- Filtros e Busca -->
                <div class="filters-section">
                    <div class="search-box">
                        <input type="text" id="search-orcamentos" placeholder="Buscar por cliente ou número do orçamento...">
                        <button id="search-orcamentos-btn">
                            <i class="fas fa-search"></i>
                        </button>
                    </div>
                    <div class="filter-buttons">
                        <button class="btn btn-outline" id="filter-all">Todos</button>
                        <button class="btn btn-outline" id="filter-ativo">Ativos</button>
                        <button class="btn btn-outline" id="filter-aprovado">Aprovados</button>
                        <button class="btn btn-outline" id="filter-expirado">Expirados</button>
                    </div>
                </div>

                <!-- Estatísticas Rápidas -->
                <div class="stats-row">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-file-invoice"></i>
                        </div>
                        <div class="stat-content">
                            <h3 id="total-orcamentos-stat">0</h3>
                            <p>Total de Orçamentos</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-dollar-sign"></i>
                        </div>
                        <div class="stat-content">
                            <h3 id="valor-orcamentos-stat">R$ 0,00</h3>
                            <p>Valor Total</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div class="stat-content">
                            <h3 id="orcamentos-aprovados-stat">0</h3>
                            <p>Aprovados</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="stat-content">
                            <h3 id="orcamentos-pendentes-stat">0</h3>
                            <p>Pendentes</p>
                        </div>
                    </div>
                </div>

                <!-- Tabela de Orçamentos -->
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Data</th>
                                <th>Cliente</th>
                                <th>Total</th>
                                <th>Validade</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody id="orcamentos-table-body">
                            <tr>
                                <td colspan="7" class="loading-row">
                                    <div class="loading-spinner"></div>
                                    <span>Carregando orçamentos...</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Paginação -->
                <div id="orcamentos-pagination" class="pagination-container"></div>
            </div>
        `;

        this.setupEventListeners();
    }

    setupEventListeners() {
        const refreshBtn = document.getElementById('refresh-orcamentos-btn');
        const newBtn = document.getElementById('new-orcamento-btn');
        const searchInput = document.getElementById('search-orcamentos');
        const filterAll = document.getElementById('filter-all');
        const filterAtivo = document.getElementById('filter-ativo');
        const filterAprovado = document.getElementById('filter-aprovado');
        const filterExpirado = document.getElementById('filter-expirado');

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadOrcamentos());
        }

        if (newBtn) {
            newBtn.addEventListener('click', () => this.showNewOrcamentoModal());
        }

        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }

        if (filterAll) {
            filterAll.addEventListener('click', () => this.applyFilter('all'));
        }

        if (filterAtivo) {
            filterAtivo.addEventListener('click', () => this.applyFilter('ativo'));
        }

        if (filterAprovado) {
            filterAprovado.addEventListener('click', () => this.applyFilter('aprovado'));
        }

        if (filterExpirado) {
            filterExpirado.addEventListener('click', () => this.applyFilter('expirado'));
        }
    }

    async loadOrcamentos() {
        try {
            this.isLoading = true;
            this.showLoading();

            console.log('📋 Carregando orçamentos...');

            // Usar RequestManager para otimizar chamadas
            const response = await window.requestManager.manageRequest('GET-/api/orcamentos', async () => {
                return window.api.get('/api/orcamentos');
            }, {
                debounceTime: 1000,
                cacheTTL: 30 * 1000
            });

            if (response.data && response.data.success) {
                this.orcamentos = response.data.data || [];
                this.filteredOrcamentos = [...this.orcamentos];
                console.log(`✅ ${this.orcamentos.length} orçamentos carregados`);
                this.updateStats();
                this.renderOrcamentosTable();
                this.renderPagination();
            } else {
                throw new Error(response.data?.error || 'Erro ao carregar orçamentos');
            }

        } catch (error) {
            console.error('❌ Erro ao carregar orçamentos:', error);
            this.showError('Erro ao carregar orçamentos', error.message);
            this.showEmptyState();
        } finally {
            this.isLoading = false;
        }
    }

    async loadClientes() {
        try {
            const response = await window.api.get('/api/clientes?limit=all');
            if (response.data && response.data.success) {
                this.clientes = response.data.data || [];
            }
        } catch (error) {
            console.error('❌ Erro ao carregar clientes:', error);
        }
    }

    async loadProdutos() {
        try {
            const response = await window.api.get('/api/produtos');
            if (response.data && response.data.success) {
                this.produtos = response.data.data || [];
            }
        } catch (error) {
            console.error('❌ Erro ao carregar produtos:', error);
        }
    }

    renderOrcamentosTable() {
        const tbody = document.getElementById('orcamentos-table-body');
        if (!tbody) return;

        if (this.filteredOrcamentos.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <div class="empty-icon">
                            <i class="fas fa-file-invoice"></i>
                        </div>
                        <p>Nenhum orçamento encontrado</p>
                        <button class="btn btn-primary" id="first-orcamento-btn">
                            Criar Primeiro Orçamento
                        </button>
                    </td>
                </tr>
            `;

            const firstOrcamentoBtn = document.getElementById('first-orcamento-btn');
            if (firstOrcamentoBtn) {
                firstOrcamentoBtn.addEventListener('click', () => {
                    this.showNewOrcamentoModal();
                });
            }

            return;
        }

        // Paginação
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageOrcamentos = this.filteredOrcamentos.slice(startIndex, endIndex);

        tbody.innerHTML = pageOrcamentos.map(orcamento => `
            <tr data-id="${orcamento.id}">
                <td>#${orcamento.id}</td>
                <td>${this.formatDate(orcamento.created_at)}</td>
                <td>
                    <div class="cliente-info">
                        <strong>${orcamento.cliente_nome}</strong>
                        <small>${orcamento.cliente_telefone || ''}</small>
                    </div>
                </td>
                <td>
                    <span class="price-value">${this.formatCurrency(orcamento.total)}</span>
                </td>
                <td>
                    <span class="validity-date ${this.isExpired(orcamento.validade) ? 'expired' : ''}">
                        ${this.formatDate(orcamento.validade)}
                    </span>
                </td>
                <td>
                    <span class="status-badge status-${orcamento.status}">
                        ${this.getStatusText(orcamento.status)}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon btn-view" data-id="${orcamento.id}" data-action="view" title="Visualizar">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon btn-pdf" data-id="${orcamento.id}" data-action="pdf" title="Gerar PDF">
                            📄
                        </button>
                        <button class="btn-icon btn-convert" data-id="${orcamento.id}" data-action="convert" title="Converter em Venda">
                            <i class="fas fa-exchange-alt"></i>
                        </button>
                        <button class="btn-icon btn-edit" data-id="${orcamento.id}" data-action="edit" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" data-id="${orcamento.id}" data-action="delete" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        this.setupActionButtons();
    }

    setupActionButtons() {
        const tbody = document.getElementById('orcamentos-table-body');
        if (!tbody) return;

        // Botões de visualizar
        const viewButtons = tbody.querySelectorAll('.btn-view');
        viewButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const orcamentoId = parseInt(button.dataset.id);
                this.viewOrcamento(orcamentoId);
            });
        });

        // Botões de PDF
        const pdfButtons = tbody.querySelectorAll('.btn-pdf');
        pdfButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const orcamentoId = parseInt(button.dataset.id);
                this.generatePDF(orcamentoId);
            });
        });

        // Botões de converter
        const convertButtons = tbody.querySelectorAll('.btn-convert');
        convertButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const orcamentoId = parseInt(button.dataset.id);
                this.convertToVenda(orcamentoId);
            });
        });

        // Botões de editar
        const editButtons = tbody.querySelectorAll('.btn-edit');
        editButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const orcamentoId = parseInt(button.dataset.id);
                this.editOrcamento(orcamentoId);
            });
        });

        // Botões de excluir
        const deleteButtons = tbody.querySelectorAll('.btn-delete');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const orcamentoId = parseInt(button.dataset.id);
                this.deleteOrcamento(orcamentoId);
            });
        });
    }

    updateStats() {
        const totalOrcamentos = this.orcamentos.length;

        // Calcular valor total corretamente, tratando valores nulos/undefined
        const valorOrcamentos = this.orcamentos.reduce((total, orcamento) => {
            const valor = parseFloat(orcamento.total) || 0;
            return total + valor;
        }, 0);

        // Contar orçamentos por status corretamente
        const orcamentosAprovados = this.orcamentos.filter(orcamento =>
            orcamento.status === 'aprovado' || orcamento.status === 'Aprovado'
        ).length;

        const orcamentosPendentes = this.orcamentos.filter(orcamento =>
            orcamento.status === 'ativo' || orcamento.status === 'Ativo'
        ).length;

        const orcamentosConvertidos = this.orcamentos.filter(orcamento =>
            orcamento.status === 'convertido' || orcamento.status === 'Convertido'
        ).length;

        const orcamentosExpirados = this.orcamentos.filter(orcamento =>
            orcamento.status === 'expirado' || orcamento.status === 'Expirado'
        ).length;

        const totalOrcamentosStat = document.getElementById('total-orcamentos-stat');
        const valorOrcamentosStat = document.getElementById('valor-orcamentos-stat');
        const orcamentosAprovadosStat = document.getElementById('orcamentos-aprovados-stat');
        const orcamentosPendentesStat = document.getElementById('orcamentos-pendentes-stat');

        if (totalOrcamentosStat) totalOrcamentosStat.textContent = totalOrcamentos;
        if (valorOrcamentosStat) valorOrcamentosStat.textContent = this.formatCurrency(valorOrcamentos);
        if (orcamentosAprovadosStat) orcamentosAprovadosStat.textContent = orcamentosAprovados;
        if (orcamentosPendentesStat) orcamentosPendentesStat.textContent = orcamentosPendentes;

        // Log para debug
        console.log('📊 Estatísticas atualizadas:', {
            total: totalOrcamentos,
            valor: valorOrcamentos,
            aprovados: orcamentosAprovados,
            pendentes: orcamentosPendentes,
            convertidos: orcamentosConvertidos,
            expirados: orcamentosExpirados,
            orcamentos: this.orcamentos.map(o => ({ id: o.id, status: o.status, total: o.total }))
        });
    }

    showNewOrcamentoModal() {
        console.log('➕ Abrindo modal de novo orçamento');

        if (!window.UI) {
            alert('Sistema de modal não disponível. Recarregue a página.');
            return;
        }

        const content = `
            <form id="orcamento-form-ui" class="orcamento-form">
                <div class="form-row">
                    <div class="form-group">
                        <label for="cliente-select-ui">Cliente *</label>
                        <select id="cliente-select-ui" name="cliente_id" required>
                            <option value="">Selecione um cliente</option>
                            ${this.clientes.map(cliente => `
                                <option value="${cliente.id}">${cliente.nome} - ${cliente.telefone}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="validade-ui">Válido até *</label>
                        <input type="date" id="validade-ui" name="validade" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Itens do Orçamento</label>
                    <div id="itens-container">
                        <div class="item-row" data-index="0">
                            <select name="produto_id[]" required>
                                <option value="">Selecione um produto</option>
                                ${this.produtos.map(produto => `
                                    <option value="${produto.id}" data-preco="${produto.preco}">
                                        ${produto.nome} - ${this.formatCurrency(produto.preco)}
                                    </option>
                                `).join('')}
                            </select>
                            <input type="number" name="quantidade[]" placeholder="Qtd" min="1" required>
                            <input type="number" name="preco_unit[]" placeholder="Preço" step="0.01" required>
                            <button type="button" class="btn-remove-item">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <button type="button" id="add-item-btn" class="btn btn-secondary btn-sm">
                        <i class="fas fa-plus"></i> Adicionar Item
                    </button>
                </div>
                
                <div class="form-group">
                    <label for="observacoes-ui">Observações</label>
                    <textarea id="observacoes-ui" name="observacoes" rows="3"></textarea>
                </div>
                
                <div class="total-section">
                    <h3>Total: <span id="orcamento-total">R$ 0,00</span></h3>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" id="cancel-orcamento-ui">Cancelar</button>
                    <button type="submit" class="btn btn-primary" id="save-orcamento-ui">Criar Orçamento</button>
                </div>
            </form>
        `;

        window.UI.showModal({
            title: 'Novo Orçamento',
            content: content,
            size: 'lg'
        });

        // Definir data padrão (30 dias a partir de hoje)
        const validadeInput = document.getElementById('validade-ui');
        if (validadeInput) {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 30);
            validadeInput.value = futureDate.toISOString().split('T')[0];
        }

        this.setupOrcamentoFormListeners();
    }

    setupOrcamentoFormListeners() {
        const form = document.getElementById('orcamento-form-ui');
        const cancelBtn = document.getElementById('cancel-orcamento-ui');
        const addItemBtn = document.getElementById('add-item-btn');

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                window.UI.hideModal();
            });
        }

        if (addItemBtn) {
            addItemBtn.addEventListener('click', () => {
                this.addItemRow();
            });
        }

        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.createOrcamento(form);
            });
        }

        this.setupItemListeners();
    }

    addItemRow() {
        const itensContainer = document.getElementById('itens-container');
        const currentRows = itensContainer.querySelectorAll('.item-row');
        const newIndex = currentRows.length;

        const itemRow = document.createElement('div');
        itemRow.className = 'item-row';
        itemRow.dataset.index = newIndex;
        itemRow.innerHTML = `
            <select name="produto_id[]" required>
                <option value="">Selecione um produto</option>
                ${this.produtos.map(produto => `
                    <option value="${produto.id}" data-preco="${produto.preco}">
                        ${produto.nome} - ${this.formatCurrency(produto.preco)}
                    </option>
                `).join('')}
            </select>
            <input type="number" name="quantidade[]" placeholder="Qtd" min="1" required>
                                    <input type="number" name="preco_unit[]" placeholder="Preço" step="0.01" required>
            <button type="button" class="btn-remove-item">
                <i class="fas fa-trash"></i>
            </button>
        `;

        itensContainer.appendChild(itemRow);
        this.setupItemListeners();
    }

    setupItemListeners() {
        const itensContainer = document.getElementById('itens-container');

        // Remover listeners antigos
        const removeButtons = itensContainer.querySelectorAll('.btn-remove-item');
        removeButtons.forEach(btn => {
            btn.replaceWith(btn.cloneNode(true));
        });

        // Adicionar novos listeners
        itensContainer.addEventListener('click', (e) => {
            if (e.target.closest('.btn-remove-item')) {
                const itemRow = e.target.closest('.item-row');
                const allRows = itensContainer.querySelectorAll('.item-row');

                if (allRows.length > 1) {
                    itemRow.remove();
                    this.calculateTotal();
                }
            }
        });

        itensContainer.addEventListener('change', (e) => {
            if (e.target.tagName === 'SELECT') {
                const selectedOption = e.target.selectedOptions[0];
                const preco = selectedOption.dataset.preco;
                const precoInput = e.target.parentElement.querySelector('input[name="preco_unit[]"]');
                if (preco && precoInput) {
                    precoInput.value = preco;
                }
            }
            this.calculateTotal();
        });

        itensContainer.addEventListener('input', (e) => {
            if (e.target.type === 'number') {
                this.calculateTotal();
            }
        });
    }

    calculateTotal() {
        const itensContainer = document.getElementById('itens-container');
        const itemRows = itensContainer.querySelectorAll('.item-row');
        let total = 0;

        itemRows.forEach(row => {
            const quantidade = parseFloat(row.querySelector('input[name="quantidade[]"]').value) || 0;
            const preco = parseFloat(row.querySelector('input[name="preco_unit[]"]').value) || 0;
            total += quantidade * preco;
        });

        const totalElement = document.getElementById('orcamento-total');
        if (totalElement) {
            totalElement.textContent = this.formatCurrency(total);
        }
    }

    async createOrcamento(form) {
        try {
            const formData = new FormData(form);

            const orcamentoData = {
                cliente_id: parseInt(formData.get('cliente_id')),
                validade: formData.get('validade'),
                observacoes: formData.get('observacoes') || '',
                itens: []
            };

            // Extrair itens
            const produtoIds = formData.getAll('produto_id[]');
            const quantidades = formData.getAll('quantidade[]');
            const precos = formData.getAll('preco_unit[]');

            for (let i = 0; i < produtoIds.length; i++) {
                if (produtoIds[i] && quantidades[i] && precos[i]) {
                    orcamentoData.itens.push({
                        produto_id: parseInt(produtoIds[i]),
                        quantidade: parseInt(quantidades[i]),
                        preco_unit: parseFloat(precos[i])  // ✅ Nome correto para o backend
                    });
                }
            }

            if (orcamentoData.itens.length === 0) {
                throw new Error('Adicione pelo menos um item ao orçamento');
            }

            const response = await window.api.post('/api/orcamentos', orcamentoData);
            const data = response.data;

            if (data.success) {
                this.showSuccess('Orçamento criado com sucesso!');
                window.UI.hideModal();
                await this.loadOrcamentos();

                this.notifyDashboardUpdate();
            } else {
                throw new Error(data.error || 'Erro ao criar orçamento');
            }

        } catch (error) {
            console.error('❌ Erro ao criar orçamento:', error);
            this.showError('Erro ao criar orçamento', error.message);
        }
    }

    async viewOrcamento(id) {
        try {
            const response = await window.api.get(`/api/orcamentos/${id}`);
            if (response.data && response.data.success) {
                const orcamento = response.data.data;
                this.showOrcamentoDetails(orcamento);
            }
        } catch (error) {
            console.error('❌ Erro ao carregar detalhes do orçamento:', error);
            this.showError('Erro', 'Não foi possível carregar os detalhes do orçamento');
        }
    }

    showOrcamentoDetails(orcamento) {
        if (!window.UI) return;

        const content = `
            <div class="orcamento-details">
                <div class="detail-header">
                    <h3>Orçamento #${orcamento.id}</h3>
                    <span class="status-badge status-${orcamento.status}">
                        ${this.getStatusText(orcamento.status)}
                    </span>
                </div>
                
                <div class="detail-section">
                    <h4>Informações Gerais</h4>
                    <div class="detail-row">
                        <div class="detail-item">
                            <strong>Data:</strong> ${this.formatDate(orcamento.data_orcamento)}
                        </div>
                        <div class="detail-item">
                            <strong>Cliente:</strong> ${orcamento.cliente_nome}
                        </div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-item">
                            <strong>Válido até:</strong> 
                            <span class="${this.isExpired(orcamento.validade) ? 'text-danger' : ''}">
                                ${this.formatDate(orcamento.validade)}
                            </span>
                        </div>
                        <div class="detail-item">
                            <strong>Total:</strong> ${this.formatCurrency(orcamento.total)}
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4>Itens do Orçamento</h4>
                    <table class="items-table">
                        <thead>
                            <tr>
                                <th>Produto</th>
                                <th>Qtd</th>
                                <th>Preço Unit.</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${orcamento.itens ? orcamento.itens.map(item => `
                                <tr>
                                    <td>${item.produto_nome}</td>
                                    <td>${item.quantidade}</td>
                                    <td>${this.formatCurrency(item.preco_unit)}</td>
                                    <td>${this.formatCurrency(item.subtotal)}</td>
                                </tr>
                            `).join('') : '<tr><td colspan="4">Nenhum item encontrado</td></tr>'}
                        </tbody>
                    </table>
                </div>
                
                ${orcamento.observacoes ? `
                    <div class="detail-section">
                        <h4>Observações</h4>
                        <p>${orcamento.observacoes}</p>
                    </div>
                ` : ''}
            </div>
        `;

        window.UI.showModal({
            title: `Detalhes do Orçamento #${orcamento.id}`,
            content: content,
            size: 'lg'
        });
    }

    async convertToVenda(orcamentoId) {
        const orcamento = this.orcamentos.find(o => o.id === orcamentoId);
        if (!orcamento) return;

        let confirmed = false;

        if (window.UI) {
            confirmed = await window.UI.showConfirm({
                title: 'Converter para Venda',
                message: `Deseja converter o orçamento #${orcamento.id} em uma venda?`,
                okText: 'Converter',
                cancelText: 'Cancelar'
            });
        } else {
            confirmed = confirm(`Deseja converter o orçamento #${orcamento.id} em uma venda?`);
        }

        if (!confirmed) return;

        try {
            const response = await window.api.put(`/api/orcamentos/${orcamentoId}`, {
                status: 'aprovado',
                converter_para_venda: true
            });
            const data = response.data;

            if (data.success) {
                this.showSuccess('Orçamento convertido para venda com sucesso!');
                await this.loadOrcamentos();

                this.notifyDashboardUpdate();

                // Opcional: redirecionar para a página de vendas
                if (data.venda_id) {
                    setTimeout(() => {
                        window.location.hash = '#vendas';
                    }, 1500);
                }
            } else {
                throw new Error(data.error || 'Erro ao converter orçamento');
            }

        } catch (error) {
            console.error('❌ Erro ao converter orçamento:', error);
            this.showError('Erro ao converter orçamento: ' + (error.message || 'Erro desconhecido'));
        }
    }

    editOrcamento(id) {
        console.log('✏️ Editar orçamento:', id);
        this.showSuccess('Funcionalidade de edição em desenvolvimento');
    }

    async deleteOrcamento(id) {
        const orcamento = this.orcamentos.find(o => o.id === id);
        if (!orcamento) return;

        let confirmed = false;

        if (window.UI) {
            confirmed = await window.UI.showConfirm({
                title: 'Confirmar Exclusão',
                message: `Tem certeza que deseja excluir o orçamento #${orcamento.id}?`,
                okText: 'Excluir',
                cancelText: 'Cancelar'
            });
        } else {
            confirmed = confirm(`Tem certeza que deseja excluir o orçamento #${orcamento.id}?`);
        }

        if (!confirmed) return;

        try {
            const response = await window.api.delete(`/api/orcamentos/${id}`);
            const data = response.data;

            if (data.success) {
                this.showSuccess('Orçamento excluído com sucesso!');
                await this.loadOrcamentos();

                this.notifyDashboardUpdate();
            } else {
                throw new Error(data.error || 'Erro ao excluir orçamento');
            }

        } catch (error) {
            console.error('❌ Erro ao excluir orçamento:', error);
            this.showError('Erro ao excluir orçamento: ' + (error.message || 'Erro desconhecido'));
        }
    }

    renderPagination() {
        const pagination = document.getElementById('orcamentos-pagination');
        if (!pagination) return;

        const totalPages = Math.ceil(this.filteredOrcamentos.length / this.itemsPerPage);

        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let paginationHTML = '<div class="pagination-controls">';

        if (this.currentPage > 1) {
            paginationHTML += `<button class="btn-page" data-page="${this.currentPage - 1}">Anterior</button>`;
        }

        for (let i = 1; i <= totalPages; i++) {
            if (i === this.currentPage) {
                paginationHTML += `<button class="btn-page active">${i}</button>`;
            } else {
                paginationHTML += `<button class="btn-page" data-page="${i}">${i}</button>`;
            }
        }

        if (this.currentPage < totalPages) {
            paginationHTML += `<button class="btn-page" data-page="${this.currentPage + 1}">Próximo</button>`;
        }

        paginationHTML += '</div>';
        pagination.innerHTML = paginationHTML;

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
        this.renderOrcamentosTable();
        this.renderPagination();
    }

    handleSearch(query) {
        if (!query.trim()) {
            this.filteredOrcamentos = [...this.orcamentos];
        } else {
            this.filteredOrcamentos = this.orcamentos.filter(orcamento =>
                orcamento.cliente_nome.toLowerCase().includes(query.toLowerCase()) ||
                orcamento.id.toString().includes(query)
            );
        }

        this.currentPage = 1;
        this.renderOrcamentosTable();
        this.renderPagination();
    }

    applyFilter(filterType) {
        document.querySelectorAll('.filter-buttons .btn').forEach(btn => {
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-outline');
        });

        let activeButton;
        switch (filterType) {
            case 'all':
                activeButton = document.getElementById('filter-all');
                this.filteredOrcamentos = [...this.orcamentos];
                break;
            case 'ativo':
                activeButton = document.getElementById('filter-ativo');
                this.filteredOrcamentos = this.orcamentos.filter(orcamento => orcamento.status === 'ativo');
                break;
            case 'aprovado':
                activeButton = document.getElementById('filter-aprovado');
                this.filteredOrcamentos = this.orcamentos.filter(orcamento => orcamento.status === 'aprovado');
                break;
            case 'expirado':
                activeButton = document.getElementById('filter-expirado');
                this.filteredOrcamentos = this.orcamentos.filter(orcamento => this.isExpired(orcamento.validade));
                break;
        }

        if (activeButton) {
            activeButton.classList.remove('btn-outline');
            activeButton.classList.add('btn-primary');
        }

        this.currentPage = 1;
        this.renderOrcamentosTable();
        this.renderPagination();
    }

    showLoading() {
        const tbody = document.getElementById('orcamentos-table-body');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="loading-row">
                        <div class="loading-spinner"></div>
                        <span>Carregando orçamentos...</span>
                    </td>
                </tr>
            `;
        }
    }

    showEmptyState() {
        const tbody = document.getElementById('orcamentos-table-body');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <div class="empty-icon">
                            <i class="fas fa-file-invoice"></i>
                        </div>
                        <p>Erro ao carregar orçamentos</p>
                        <button class="btn btn-primary" id="retry-load-orcamentos-btn">
                            Tentar Novamente
                        </button>
                    </td>
                </tr>
            `;

            const retryBtn = document.getElementById('retry-load-orcamentos-btn');
            if (retryBtn) {
                retryBtn.addEventListener('click', () => {
                    this.loadOrcamentos();
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

    formatDate(dateString) {
        if (!dateString) return '-';

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '-'; // Data inválida

            return date.toLocaleDateString('pt-BR');
        } catch (error) {
            console.error('❌ Erro ao formatar data:', dateString, error);
            return '-';
        }
    }

    isExpired(dateString) {
        if (!dateString) return false;

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return false; // Data inválida

            const now = new Date();
            // Resetar horas para comparar apenas as datas
            const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            return dateOnly < nowOnly;
        } catch (error) {
            console.error('❌ Erro ao verificar validade da data:', dateString, error);
            return false;
        }
    }

    getStatusText(status) {
        const statusMap = {
            'ativo': 'Ativo',
            'Ativo': 'Ativo',
            'aprovado': 'Aprovado',
            'Aprovado': 'Aprovado',
            'convertido': 'Convertido',
            'Convertido': 'Convertido',
            'expirado': 'Expirado',
            'Expirado': 'Expirado',
            'cancelado': 'Cancelado',
            'Cancelado': 'Cancelado'
        };
        return statusMap[status] || status;
    }

    notifyDashboardUpdate() {
        console.log('🔄 Notificando dashboard sobre atualização de orçamentos...');

        if (window.eventManager) {
            window.eventManager.dispatchUpdate('orcamentos', 'update', {
                action: 'crud',
                timestamp: new Date().toISOString()
            });
        } else {
            const updateEvent = new CustomEvent('dashboard-update', {
                detail: {
                    type: 'orcamentos',
                    timestamp: new Date().toISOString(),
                    action: 'update'
                }
            });

            window.dispatchEvent(updateEvent);
            document.dispatchEvent(updateEvent);
        }

        console.log('✅ Evento de atualização de orçamentos disparado!');
    }

    // ===== FUNÇÕES DE PDF =====

    async generatePDF(orcamentoId) {
        try {
            console.log('📄 Gerando PDF para orçamento:', orcamentoId);

            // Mostrar loading
            if (window.UI) {
                window.UI.showLoading('Gerando PDF...');
            }

            // Fazer download do PDF
            const response = await fetch(`/api/pdf/orcamento/${orcamentoId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/pdf'
                }
            });

            if (response.ok) {
                // Criar blob e fazer download
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `orcamento-${orcamentoId.toString().padStart(6, '0')}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                // Mostrar sucesso
                if (window.UI) {
                    window.UI.showSuccess('PDF gerado com sucesso!');
                }

                console.log('✅ PDF gerado com sucesso');
            } else {
                throw new Error('Erro ao gerar PDF');
            }

        } catch (error) {
            console.error('❌ Erro ao gerar PDF:', error);
            this.showError('Erro ao gerar PDF: ' + error.message);
        } finally {
            // Esconder loading
            if (window.UI) {
                window.UI.hideLoading();
            }
        }
    }

    // ===== FUNÇÕES DE CONVERSÃO =====

    // ✅ MÉTODO DE CLEANUP PARA SER CHAMADO PELO SISTEMA PRINCIPAL
    async cleanup() {
        console.log('🧹 ORÇAMENTOS - Iniciando cleanup...');

        try {
            // 1. Limpar event listeners
            this.removeEventListeners();

            // 2. Limpar estado interno
            this.orcamentos = [];
            this.filteredOrcamentos = [];
            this.currentPage = 1;
            this.isLoading = false;
            this.clientes = [];
            this.produtos = [];

            // 3. Limpar referência global
            if (window.orcamentosPageInstance === this) {
                window.orcamentosPageInstance = null;
            }

            console.log('✅ ORÇAMENTOS - Cleanup concluído com sucesso!');

        } catch (error) {
            console.error('❌ ORÇAMENTOS - Erro durante cleanup:', error);
        }
    }

    // ✅ REMOVER EVENT LISTENERS
    removeEventListeners() {
        console.log('🔌 Removendo event listeners de orçamentos...');

        try {
            // Botão Atualizar
            const refreshBtn = document.getElementById('refresh-orcamentos-btn');
            if (refreshBtn) {
                refreshBtn.replaceWith(refreshBtn.cloneNode(true));
            }

            // Botão Novo Orçamento
            const newBtn = document.getElementById('new-orcamento-btn');
            if (newBtn) {
                newBtn.replaceWith(newBtn.cloneNode(true));
            }

            // Campo de busca
            const searchInput = document.getElementById('search-orcamentos');
            if (searchInput) {
                searchInput.replaceWith(searchInput.cloneNode(true));
            }

            // Botões de filtro
            const filterAll = document.getElementById('filter-all');
            const filterAtivo = document.getElementById('filter-ativo');
            const filterAprovado = document.getElementById('filter-aprovado');
            const filterExpirado = document.getElementById('filter-expirado');

            if (filterAll) filterAll.replaceWith(filterAll.cloneNode(true));
            if (filterAtivo) filterAtivo.replaceWith(filterAtivo.cloneNode(true));
            if (filterAprovado) filterAprovado.replaceWith(filterAprovado.cloneNode(true));
            if (filterExpirado) filterExpirado.replaceWith(filterExpirado.cloneNode(true));

            console.log('✅ Event listeners de orçamentos removidos');

        } catch (error) {
            console.error('❌ Erro ao remover event listeners de orçamentos:', error);
        }
    }
}

// Inicializar página quando carregar
document.addEventListener('DOMContentLoaded', () => {
    if (window.currentPage === 'orcamentos') {
        window.orcamentosPage = new OrcamentosPage();
    }
});

// Exportar para uso global
window.OrcamentosPage = OrcamentosPage; 