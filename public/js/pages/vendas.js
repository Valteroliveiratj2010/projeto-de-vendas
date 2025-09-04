/**
 * Página de Vendas - Sistema de Vendas
 */

class VendasPage {
    constructor() {
        this.vendas = [];
        this.filteredVendas = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.isLoading = false;
        this.clientes = [];
        this.produtos = [];
        this.init();
    }

    init() {
        try {
            console.log('🚀 Inicializando página de vendas...');

            // Renderizar estrutura HTML
            this.renderPage();

            // Carregar dados
            this.loadInitialData();

            // Configurar event listeners
            this.setupEventListeners();

            console.log('✅ Página de vendas inicializada!');

        } catch (error) {
            console.error('❌ Erro ao inicializar página de vendas:', error);
            this.showError('Erro ao carregar página', error.message);
        }
    }

    /**
     * Renderiza a estrutura HTML da página
     */
    renderPage() {
        const pageContainer = document.getElementById('vendas-content');
        if (!pageContainer) {
            console.error('Container de vendas não encontrado!');
            return;
        }

        pageContainer.innerHTML = `
            <div class="page-header">
                <div class="header-content">
                    <h2>Gestão de Vendas</h2>
                    <p>Controle suas vendas e receitas</p>
                </div>
                <div class="header-actions">
                    <button class="btn btn-secondary" id="refresh-vendas-btn">
                        <i class="fas fa-sync-alt"></i>
                        Atualizar
                    </button>
                    <button class="btn btn-primary" id="new-venda-btn">
                        <i class="fas fa-plus"></i>
                        Nova Venda
                    </button>
                </div>
            </div>

            <div class="page-content">
                <!-- Filtros e Busca -->
                <div class="filters-section">
                    <div class="search-box">
                        <input type="text" id="search-vendas" placeholder="Buscar vendas por cliente ou produto...">
                        <button id="search-vendas-btn">
                            <i class="fas fa-search"></i>
                        </button>
                    </div>
                    <div class="filter-buttons">
                        <button class="btn btn-outline" id="filter-all-vendas">Todas</button>
                        <button class="btn btn-outline" id="filter-today-vendas">Hoje</button>
                        <button class="btn btn-outline" id="filter-month-vendas">Este Mês</button>
                    </div>
                </div>

                <!-- Estatísticas Rápidas -->
                <div class="stats-row">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-shopping-cart"></i>
                        </div>
                        <div class="stat-content">
                            <h3 id="total-vendas-stat">0</h3>
                            <p>Total de Vendas</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-dollar-sign"></i>
                        </div>
                        <div class="stat-content">
                            <h3 id="receita-total-stat">R$ 0,00</h3>
                            <p>Receita Total</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-chart-line"></i>
                        </div>
                        <div class="stat-content">
                            <h3 id="media-venda-stat">R$ 0,00</h3>
                            <p>Média por Venda</p>
                        </div>
                    </div>
                </div>

                <!-- Tabela de Vendas -->
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Cliente</th>
                                <th>Produtos</th>
                                <th>Total</th>
                                <th>Data</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody id="vendas-table-body">
                            <tr>
                                <td colspan="7" class="loading-row">
                                    <div class="loading-spinner"></div>
                                    <span>Carregando vendas...</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Paginação -->
                <div id="vendas-pagination" class="pagination-container"></div>
            </div>
        `;
    }

    async loadInitialData() {
        await Promise.all([
            this.loadVendas(),
            this.loadClientes(),
            this.loadProdutos()
        ]);
    }

    renderPage() {
        const pageContainer = document.getElementById('vendas-page');
        if (!pageContainer) return;

        pageContainer.innerHTML = `
            <div class="page-header">
                <div class="header-content">
                    <h2>Gestão de Vendas</h2>
                    <p>Gerencie suas vendas e pedidos</p>
                </div>
                <div class="header-actions">
                    <button class="btn btn-secondary" id="refresh-vendas-btn">
                        <i class="fas fa-sync-alt"></i>
                        Atualizar
                    </button>
                    <button class="btn btn-primary" id="new-venda-btn">
                        <i class="fas fa-plus"></i>
                        Nova Venda
                    </button>
                </div>
            </div>

            <div class="page-content">
                <!-- Filtros e Busca -->
                <div class="filters-section">
                    <div class="search-box">
                        <input type="text" id="search-vendas" placeholder="Buscar por cliente ou número da venda...">
                        <button id="search-vendas-btn">
                            <i class="fas fa-search"></i>
                        </button>
                    </div>
                    <div class="filter-buttons">
                        <button class="btn btn-outline" id="filter-all">Todas</button>
                        <button class="btn btn-outline" id="filter-pendente">Pendentes</button>
                        <button class="btn btn-outline" id="filter-pago">Pagas</button>
                        <button class="btn btn-outline" id="filter-cancelado">Canceladas</button>
                    </div>
                </div>

                <!-- Estatísticas Rápidas -->
                <div class="stats-row">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-shopping-cart"></i>
                        </div>
                        <div class="stat-content">
                            <h3 id="total-vendas-stat">0</h3>
                            <p>Total de Vendas</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-dollar-sign"></i>
                        </div>
                        <div class="stat-content">
                            <h3 id="valor-vendas-stat">R$ 0,00</h3>
                            <p>Valor Total</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="stat-content">
                            <h3 id="vendas-pendentes-stat">0</h3>
                            <p>Pendentes</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div class="stat-content">
                            <h3 id="vendas-pagas-stat">0</h3>
                            <p>Pagas</p>
                        </div>
                    </div>
                </div>

                <!-- Tabela de Vendas -->
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Data</th>
                                <th>Cliente</th>
                                <th>Total</th>
                                <th>Pago</th>
                                <th>Saldo</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody id="vendas-table-body">
                            <tr>
                                <td colspan="8" class="loading-row">
                                    <div class="loading-spinner"></div>
                                    <span>Carregando vendas...</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Paginação -->
                <div id="vendas-pagination" class="pagination-container"></div>
            </div>
        `;

        this.setupEventListeners();
    }

    setupEventListeners() {
        const refreshBtn = document.getElementById('refresh-vendas-btn');
        const newBtn = document.getElementById('new-venda-btn');
        const searchInput = document.getElementById('search-vendas');
        const filterAll = document.getElementById('filter-all');
        const filterPendente = document.getElementById('filter-pendente');
        const filterPago = document.getElementById('filter-pago');
        const filterCancelado = document.getElementById('filter-cancelado');

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadVendas());
        }

        if (newBtn) {
            newBtn.addEventListener('click', () => this.showNewVendaModal());
        }

        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }

        if (filterAll) {
            filterAll.addEventListener('click', () => this.applyFilter('all'));
        }

        if (filterPendente) {
            filterPendente.addEventListener('click', () => this.applyFilter('pendente'));
        }

        if (filterPago) {
            filterPago.addEventListener('click', () => this.applyFilter('pago'));
        }

        if (filterCancelado) {
            filterCancelado.addEventListener('click', () => this.applyFilter('cancelado'));
        }
    }

    async loadVendas() {
        if (this.isLoading) return;

        try {
            this.isLoading = true;
            this.showLoading();

            console.log('🛒 Carregando vendas...');

            // Abordagem simplificada - fazer requisição direta
            const response = await fetch('/api/vendas');

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            // Validar estrutura da resposta
            if (result && result.success && Array.isArray(result.data)) {
                this.vendas = result.data;
                this.filteredVendas = [...this.vendas];

                console.log(`✅ ${this.vendas.length} vendas carregadas`);
                this.updateStats();
                this.renderVendasTable();
                this.renderPagination();
            } else {
                throw new Error('Estrutura de resposta inválida');
            }

        } catch (error) {
            console.error('❌ Erro ao carregar vendas:', error);
            this.showErrorWithTitle('Erro ao carregar vendas', error.message);
            this.showEmptyState();
        } finally {
            this.isLoading = false;
        }
    }

    async loadClientes() {
        try {
            // Abordagem simplificada - fazer requisição direta
            const response = await fetch('/api/clientes?limit=all');

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (result && result.success && Array.isArray(result.data)) {
                this.clientes = result.data;
            } else {
                console.warn('⚠️ Resposta da API não tem sucesso:', result);
                this.clientes = [];
            }
        } catch (error) {
            console.error('❌ Erro ao carregar clientes:', error);
            this.clientes = [];
        }
    }

    async loadProdutos() {
        try {
            // Abordagem simplificada - fazer requisição direta
            const response = await fetch('/api/produtos');

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (result && result.success && Array.isArray(result.data)) {
                this.produtos = result.data;
            } else {
                console.warn('⚠️ Resposta da API não tem sucesso:', result);
                this.produtos = [];
            }
        } catch (error) {
            console.error('❌ Erro ao carregar produtos:', error);
            this.produtos = [];
        }
    }

    renderVendasTable() {
        const tbody = document.getElementById('vendas-table-body');
        if (!tbody) return;

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageVendas = this.filteredVendas.slice(startIndex, endIndex);

        tbody.innerHTML = pageVendas.map(venda => {
            const statusClass = this.getStatusClass(venda);
            const statusText = this.getStatusText(venda);
            const dataVenda = new Date(venda.data_venda).toLocaleDateString('pt-BR');

            return `
            <tr>
                <td>#${venda.id.toString().padStart(6, '0')}</td>
                <td>${venda.cliente_nome}</td>
                <td>${dataVenda}</td>
                <td>${this.formatCurrency(venda.total)}</td>
                <td>${this.formatCurrency(venda.pago || 0)}</td>
                <td>${this.formatCurrency(venda.saldo || venda.total)}</td>
                <td>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon btn-view" data-id="${venda.id}" data-action="view" title="Detalhes">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon btn-edit" data-id="${venda.id}" data-action="edit" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" data-id="${venda.id}" data-action="delete" title="Cancelar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
        }).join('');

        this.setupActionButtons();
    }

    setupActionButtons() {
        const tbody = document.getElementById('vendas-table-body');
        if (!tbody) return;

        // Botões de visualizar (agora detalhes)
        const viewButtons = tbody.querySelectorAll('.btn-view');
        viewButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const vendaId = parseInt(button.dataset.id);
                this.showVendaDetailsModal(vendaId);
            });
        });

        // Botões de editar
        const editButtons = tbody.querySelectorAll('.btn-edit');
        editButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const vendaId = parseInt(button.dataset.id);
                this.editVenda(vendaId);
            });
        });

        // Botões de cancelar
        const deleteButtons = tbody.querySelectorAll('.btn-delete');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const vendaId = parseInt(button.dataset.id);
                this.cancelVenda(vendaId);
            });
        });
    }

    updateStats() {
        const totalVendas = this.vendas.length;

        // Converter valores string para números antes de calcular
        const valorVendas = this.vendas.reduce((total, venda) => {
            const valor = parseFloat(venda.total) || 0;
            return total + valor;
        }, 0);

        // Calcular status baseado nos valores reais, não apenas no campo status
        let vendasPendentes = 0;
        let vendasPagas = 0;
        let vendasParciais = 0;

        this.vendas.forEach(venda => {
            const total = parseFloat(venda.total) || 0;
            const pago = parseFloat(venda.pago) || 0;
            const saldo = parseFloat(venda.saldo) || 0;

            if (pago === 0) {
                vendasPendentes++;
            } else if (saldo === 0) {
                vendasPagas++;
            } else if (pago > 0 && saldo > 0) {
                vendasParciais++;
            }
        });

        const totalVendasStat = document.getElementById('total-vendas-stat');
        const valorVendasStat = document.getElementById('valor-vendas-stat');
        const vendasPendentesStat = document.getElementById('vendas-pendentes-stat');
        const vendasPagasStat = document.getElementById('vendas-pagas-stat');

        if (totalVendasStat) totalVendasStat.textContent = totalVendas;
        if (valorVendasStat) valorVendasStat.textContent = this.formatCurrency(valorVendas);
        if (vendasPendentesStat) vendasPendentesStat.textContent = vendasPendentes;
        if (vendasPagasStat) vendasPagasStat.textContent = vendasPagas;
    }

    showNewVendaModal() {
        if (!window.UI) {
            alert('Sistema de modal não disponível. Recarregue a página.');
            return;
        }

        const content = `
            <form id="venda-form-ui" class="venda-form">
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
                    <label>Itens da Venda</label>
                    <div id="itens-container">
                        <div class="item-row" data-index="0">
                            <select name="produto_id[]" required>
                                <option value="">Selecione um produto</option>
                                ${this.produtos.map(produto => `
                                    <option value="${produto.id}" data-preco="${produto.preco}">
                                        ${produto.nome} - ${this.formatCurrency(produto.preco)} (Estoque: ${produto.estoque})
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
                    <h3>Total: <span id="venda-total">R$ 0,00</span></h3>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" id="cancel-venda-ui">Cancelar</button>
                    <button type="submit" class="btn btn-primary" id="save-venda-ui">Criar Venda</button>
                </div>
            </form>
        `;

        window.UI.showModal({
            title: 'Nova Venda',
            content: content,
            size: 'lg'
        });

        this.setupVendaFormListeners();
    }

    setupVendaFormListeners() {
        const form = document.getElementById('venda-form-ui');
        const cancelBtn = document.getElementById('cancel-venda-ui');
        const addItemBtn = document.getElementById('add-item-btn');
        const itensContainer = document.getElementById('itens-container');

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
                await this.createVenda(form);
            });
        }

        // Configurar listeners iniciais
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
                        ${produto.nome} - ${this.formatCurrency(produto.preco)} (Estoque: ${produto.estoque})
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

        // Remove listeners antigos para evitar duplicação
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

        // Listeners para mudanças nos selects e inputs
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

        const totalElement = document.getElementById('venda-total');
        if (totalElement) {
            totalElement.textContent = this.formatCurrency(total);
        }
    }

    async createVenda(form) {
        try {
            const formData = new FormData(form);

            // Extrair dados do formulário
            const vendaData = {
                cliente_id: parseInt(formData.get('cliente_id')),
                observacoes: formData.get('observacoes') || '',
                itens: []
            };

            // Extrair itens
            const produtoIds = formData.getAll('produto_id[]');
            const quantidades = formData.getAll('quantidade[]');
            const precos = formData.getAll('preco_unit[]');

            for (let i = 0; i < produtoIds.length; i++) {
                if (produtoIds[i] && quantidades[i] && precos[i]) {
                    vendaData.itens.push({
                        produto_id: parseInt(produtoIds[i]),
                        quantidade: parseInt(quantidades[i]),
                        preco_unit: parseFloat(precos[i])  // ✅ Nome correto para o backend
                    });
                }
            }

            if (vendaData.itens.length === 0) {
                throw new Error('Adicione pelo menos um item à venda');
            }

            const response = await window.api.post('/api/vendas', vendaData);
            const data = response.data;

            if (data.success) {
                this.showSuccess('Venda criada com sucesso!');
                window.UI.hideModal();

                // Forçar atualização completa
                await this.forceUpdateAfterEdit();
            } else {
                throw new Error(data.error || 'Erro ao criar venda');
            }

        } catch (error) {
            console.error('❌ Erro ao criar venda:', error);
            this.showErrorWithTitle('Erro ao criar venda', error.message);
        }
    }

    async viewVenda(id) {
        try {
            const response = await window.api.get(`/api/vendas/${id}`);
            if (response.data && response.data.success) {
                const venda = response.data.data;
                this.showVendaDetailsModal(venda.id); // Passar o ID para o modal
            }
        } catch (error) {
            console.error('❌ Erro ao carregar detalhes da venda:', error);
            this.showErrorWithTitle('Erro', 'Não foi possível carregar os detalhes da venda');
        }
    }

    showVendaDetails(venda) {
        if (!window.UI) return;

        const content = `
            <div class="venda-details">
                <div class="detail-header">
                    <h3>Venda #${venda.id}</h3>
                    <span class="status-badge status-${venda.status}">
                        ${this.getStatusText(venda.status)}
                    </span>
                </div>
                
                <div class="detail-section">
                    <h4>Informações Gerais</h4>
                    <div class="detail-row">
                        <div class="detail-item">
                            <strong>Data:</strong> ${this.formatDate(venda.created_at)}
                        </div>
                        <div class="detail-item">
                            <strong>Cliente:</strong> ${venda.cliente_nome}
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4>Valores</h4>
                    <div class="detail-row">
                        <div class="detail-item">
                            <strong>Total:</strong> ${this.formatCurrency(venda.total)}
                        </div>
                        <div class="detail-item">
                            <strong>Pago:</strong> ${this.formatCurrency(venda.pago || 0)}
                        </div>
                        <div class="detail-item">
                            <strong>Saldo:</strong> ${this.formatCurrency(venda.saldo || 0)}
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4>Itens da Venda</h4>
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
                            ${venda.itens ? venda.itens.map(item => `
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
                
                ${venda.observacoes ? `
                    <div class="detail-section">
                        <h4>Observações</h4>
                        <p>${venda.observacoes}</p>
                    </div>
                ` : ''}
            </div>
        `;

        window.UI.showModal({
            title: `Detalhes da Venda #${venda.id}`,
            content: content,
            size: 'lg'
        });
    }

    showPaymentModal(vendaId) {
        const venda = this.vendas.find(v => v.id === vendaId);
        if (!venda || !window.UI) return;

        const saldoRestante = venda.saldo || 0;
        if (saldoRestante <= 0) {
            this.showSuccess('Esta venda já está totalmente paga!');
            return;
        }

        const content = `
            <form id="payment-form-ui" class="payment-form">
                <div class="payment-info">
                    <h4>Venda #${venda.id} - ${venda.cliente_nome}</h4>
                    <div class="payment-summary">
                        <div class="summary-item">
                            <strong>Total:</strong> ${this.formatCurrency(venda.total)}
                        </div>
                        <div class="summary-item">
                            <strong>Já Pago:</strong> ${this.formatCurrency(venda.pago || 0)}
                        </div>
                        <div class="summary-item">
                            <strong>Saldo Restante:</strong> 
                            <span class="text-danger">${this.formatCurrency(saldoRestante)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="valor-pagamento-ui">Valor do Pagamento *</label>
                    <input type="number" id="valor-pagamento-ui" name="valor_pago" 
                           step="0.01" min="0.01" max="${saldoRestante}" 
                           value="${saldoRestante}" required>
                </div>
                
                <div class="form-group">
                    <label for="forma-pagamento-ui">Forma de Pagamento *</label>
                    <select id="forma-pagamento-ui" name="forma_pagamento" required>
                        <option value="dinheiro">Dinheiro</option>
                        <option value="cartao">Cartão</option>
                        <option value="pix">PIX</option>
                        <option value="transferencia">Transferência</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="observacoes-pagamento-ui">Observações</label>
                    <textarea id="observacoes-pagamento-ui" name="observacoes" rows="3"></textarea>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" id="cancel-payment-ui">Cancelar</button>
                    <button type="submit" class="btn btn-primary" id="save-payment-ui">Registrar Pagamento</button>
                </div>
            </form>
        `;

        window.UI.showModal({
            title: 'Registrar Pagamento',
            content: content,
            size: 'md'
        });

        // Configurar event listeners
        const form = document.getElementById('payment-form-ui');
        const cancelBtn = document.getElementById('cancel-payment-ui');

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                window.UI.hideModal();
            });
        }

        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.processPayment(vendaId, form);
            });
        }
    }

    async processPayment(vendaId, form) {
        try {
            const formData = new FormData(form);
            const paymentData = {
                venda_id: vendaId,
                valor_pago: parseFloat(formData.get('valor_pago')),
                forma_pagamento: formData.get('forma_pagamento'),
                observacoes: formData.get('observacoes') || ''
            };

            const response = await window.api.post('/api/pagamentos', paymentData);
            const data = response.data;

            if (data.success) {
                this.showSuccess('Pagamento registrado com sucesso!');
                window.UI.hideModal();

                // Atualizar dados da venda localmente com os novos valores
                if (data.data && data.data.venda_atualizada) {
                    const vendaIndex = this.vendas.findIndex(v => v.id === vendaId);
                    if (vendaIndex !== -1) {
                        this.vendas[vendaIndex] = {
                            ...this.vendas[vendaIndex],
                            pago: data.data.venda_atualizada.pago,
                            saldo: data.data.venda_atualizada.saldo,
                            status: data.data.venda_atualizada.status
                        };

                        // Atualizar estatísticas imediatamente
                        this.updateStats();
                        this.renderVendasTable();
                    }
                }

                // 🔄 DISPARAR EVENTO DE ATUALIZAÇÃO AUTOMÁTICA
                this.notifyDashboardUpdate();
            } else {
                throw new Error(data.error || 'Erro ao registrar pagamento');
            }

        } catch (error) {
            console.error('❌ Erro ao processar pagamento:', error);
            this.showErrorWithTitle('Erro ao processar pagamento', error.message);
        }
    }

    // ===== FUNÇÕES DE PDF =====

    async generatePDF(vendaId) {
        try {
            console.log(`📄 Gerando PDF para venda ${vendaId}...`);

            // Mostrar loading
            const btn = document.getElementById('gerar-pdf-btn');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gerando...';
            btn.disabled = true;

            const response = await fetch(`/api/pdf/venda/${vendaId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `venda-${vendaId}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            console.log(`✅ PDF gerado com sucesso para venda ${vendaId}`);

            // Mostrar notificação de sucesso
            window.UI.showNotification('PDF gerado com sucesso!', 'success');

        } catch (error) {
            console.error('❌ Erro ao gerar PDF:', error);
            window.UI.showNotification('Erro ao gerar PDF. Tente novamente.', 'error');
        } finally {
            // Restaurar botão
            const btn = document.getElementById('gerar-pdf-btn');
            btn.innerHTML = '<i class="fas fa-download"></i> Gerar PDF';
            btn.disabled = false;
        }
    }

    // ===== FUNÇÕES DE PAGAMENTO =====

    // Métodos auxiliares continuam igual...
    renderPagination() {
        const pagination = document.getElementById('vendas-pagination');
        if (!pagination) return;

        const totalPages = Math.ceil(this.filteredVendas.length / this.itemsPerPage);

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
        this.renderVendasTable();
        this.renderPagination();
    }

    handleSearch(query) {
        if (!query.trim()) {
            this.filteredVendas = [...this.vendas];
        } else {
            this.filteredVendas = this.vendas.filter(venda =>
                venda.cliente_nome.toLowerCase().includes(query.toLowerCase()) ||
                venda.id.toString().includes(query)
            );
        }

        this.currentPage = 1;
        this.renderVendasTable();
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
                this.filteredVendas = [...this.vendas];
                break;
            case 'pendente':
                activeButton = document.getElementById('filter-pendente');
                this.filteredVendas = this.vendas.filter(venda => venda.status === 'pendente');
                break;
            case 'pago':
                activeButton = document.getElementById('filter-pago');
                this.filteredVendas = this.vendas.filter(venda => venda.status === 'pago');
                break;
            case 'cancelado':
                activeButton = document.getElementById('filter-cancelado');
                this.filteredVendas = this.vendas.filter(venda => venda.status === 'cancelado');
                break;
        }

        if (activeButton) {
            activeButton.classList.remove('btn-outline');
            activeButton.classList.add('btn-primary');
        }

        this.currentPage = 1;
        this.renderVendasTable();
        this.renderPagination();
    }

    async editVenda(id) {
        console.log('✏️ Editar venda:', id);

        try {
            // Buscar dados completos da venda
            const response = await window.api.get(`/api/vendas/${id}`);
            const data = response.data;

            if (!data.success) {
                throw new Error(data.error || 'Erro ao buscar dados da venda');
            }

            const venda = data.data;
            console.log('📋 Dados da venda carregados:', venda);

            // Verificar se a venda pode ser editada
            if (venda.status === 'cancelado') {
                this.showErrorWithTitle('Não é possível editar', 'Esta venda foi cancelada e não pode ser editada.');
                return;
            }

            console.log('✅ Venda pode ser editada, abrindo modal...');
            await this.showEditVendaModal(venda);

        } catch (error) {
            console.error('❌ Erro ao carregar dados da venda para edição:', error);
            this.showErrorWithTitle('Erro ao carregar dados', error.message);
        }
    }

    async showEditVendaModal(venda) {
        console.log('🎨 Iniciando criação do modal de edição...');

        try {
            // Carregar dados necessários para o modal
            console.log('📥 Carregando clientes e produtos...');
            const [clientesResponse, produtosResponse] = await Promise.all([
                window.api.get('/api/clientes'),
                window.api.get('/api/produtos')
            ]);

            const clientes = clientesResponse.data.data || [];
            const produtos = produtosResponse.data.data || [];

            console.log(`📊 ${clientes.length} clientes e ${produtos.length} produtos carregados`);

            const content = `
                <div class="edit-venda-modal">
                    <form id="edit-venda-form">
                        <!-- Informações do Cliente -->
                        <div class="form-section">
                            <h4><i class="fas fa-user"></i> Cliente</h4>
                            <div class="form-group">
                                <label for="edit-cliente-select">Cliente *</label>
                                <select id="edit-cliente-select" name="cliente_id" required>
                                    <option value="">Selecione um cliente</option>
                                    ${clientes.map(cliente => `
                                        <option value="${cliente.id}" ${cliente.id === venda.cliente_id ? 'selected' : ''}>
                                            ${cliente.nome} - ${cliente.documento || 'Sem documento'}
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                        </div>

                        <!-- Itens da Venda -->
                        <div class="form-section">
                            <h4><i class="fas fa-shopping-cart"></i> Itens da Venda</h4>
                            <div class="venda-itens-container">
                                <div class="itens-header">
                                    <span>Produto</span>
                                    <span>Quantidade</span>
                                    <span>Preço Unit.</span>
                                    <span>Subtotal</span>
                                    <span>Ações</span>
                                </div>
                                <div id="edit-venda-itens-list">
                                    ${venda.itens.map((item, index) => this.renderEditVendaItem(item, index, produtos)).join('')}
                                </div>
                                <button type="button" class="btn btn-outline" id="add-edit-item-btn">
                                    <i class="fas fa-plus"></i> Adicionar Item
                                </button>
                            </div>
                        </div>

                        <!-- Resumo -->
                        <div class="form-section">
                            <h4><i class="fas fa-calculator"></i> Resumo</h4>
                            <div class="venda-resumo">
                                <div class="resumo-item">
                                    <span>Total de Itens:</span>
                                    <span id="edit-total-itens">${venda.itens.length}</span>
                                </div>
                                <div class="resumo-item">
                                    <span>Total da Venda:</span>
                                    <span id="edit-total-venda">${this.formatCurrency(venda.total)}</span>
                                </div>
                                <div class="resumo-item">
                                    <span>Valor Pago:</span>
                                    <span id="edit-valor-pago">${this.formatCurrency(venda.pago || 0)}</span>
                                </div>
                                <div class="resumo-item">
                                    <span>Saldo Restante:</span>
                                    <span id="edit-saldo-restante">${this.formatCurrency(venda.saldo || 0)}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Observações -->
                        <div class="form-section">
                            <h4><i class="fas fa-comment"></i> Observações</h4>
                            <div class="form-group">
                                <label for="edit-observacoes">Observações</label>
                                <textarea id="edit-observacoes" name="observacoes" rows="3" placeholder="Observações adicionais...">${venda.observacoes || ''}</textarea>
                            </div>
                        </div>
                    </form>
                </div>
            `;

            console.log('🎨 Exibindo modal de edição...');

            // Criar modal com botões mais simples
            const modalContent = `
                <div class="edit-venda-modal">
                    ${content}
                    <div class="modal-footer" style="display: flex; justify-content: space-between; padding: 20px; border-top: 1px solid #e5e7eb; background: #f9fafb;">
                        <button type="button" class="btn btn-outline" id="cancel-edit-btn">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                        <div style="display: flex; gap: 10px;">
                            <button type="button" class="btn btn-success" id="confirm-edit-btn" data-venda-id="${venda.id}">
                                <i class="fas fa-check"></i> Confirmar Edição
                            </button>
                            <button type="button" class="btn btn-primary" id="save-edit-btn" data-venda-id="${venda.id}">
                                <i class="fas fa-save"></i> Salvar Alterações
                            </button>
                        </div>
                    </div>
                </div>
            `;

            window.UI.showModal({
                title: `Editar Venda #${venda.id.toString().padStart(6, '0')}`,
                content: modalContent,
                size: 'xl',
                buttons: [] // Remover botões da biblioteca UI
            });

            console.log('✅ Modal de edição exibido, configurando eventos...');
            this.setupEditVendaModal(venda, produtos);

        } catch (error) {
            console.error('❌ Erro ao criar modal de edição:', error);
            this.showErrorWithTitle('Erro ao criar modal', error.message);
        }
    }

    renderEditVendaItem(item, index, produtos) {
        return `
            <div class="venda-item-row" data-index="${index}">
                <div class="item-field">
                    <select name="produto_id" required>
                        <option value="">Selecione um produto</option>
                        ${produtos.map(produto => `
                            <option value="${produto.id}" 
                                    data-preco="${produto.preco}" 
                                    data-estoque="${produto.estoque}"
                                    ${produto.id === item.produto_id ? 'selected' : ''}>
                                ${produto.nome} - Estoque: ${produto.estoque} - ${this.formatCurrency(produto.preco)}
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div class="item-field">
                    <input type="number" name="quantidade" value="${item.quantidade}" min="1" required>
                </div>
                <div class="item-field">
                    <input type="number" name="preco_unit" value="${item.preco_unit}" min="0.01" step="0.01" required>
                </div>
                <div class="item-field">
                    <span class="subtotal">${this.formatCurrency(item.subtotal)}</span>
                </div>
                <div class="item-field">
                    <button type="button" class="btn btn-danger btn-sm remove-item-btn" data-index="${index}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    setupEditVendaModal(venda, produtos) {
        console.log('🔧 Configurando modal de edição...');

        // Configurar eventos para adicionar/remover itens
        const addItemBtn = document.getElementById('add-edit-item-btn');
        if (addItemBtn) {
            addItemBtn.addEventListener('click', () => {
                const itemsList = document.getElementById('edit-venda-itens-list');
                const newIndex = itemsList.children.length;
                const newItem = {
                    produto_id: '',
                    quantidade: 1,
                    preco_unit: 0,
                    subtotal: 0
                };

                const itemHTML = this.renderEditVendaItem(newItem, newIndex, produtos);
                itemsList.insertAdjacentHTML('beforeend', itemHTML);

                this.setupEditItemEvents();
                this.forceEditModalIcons(); // Forçar ícones após adicionar item
            });
        }

        this.setupEditItemEvents();
        this.forceEditModalIcons(); // Forçar ícones na configuração inicial
        this.forceConfirmButton(); // Forçar botão de confirmação
        this.forceEditModalButtons(); // Forçar botões do modal
        this.setupEditModalButtons(venda.id); // Configurar eventos dos botões
    }

    // NOVO MÉTODO: FORÇAR ÍCONES DO MODAL DE EDIÇÃO
    forceEditModalIcons() {
        console.log('🎨 Forçando ícones do modal de edição...');

        // Forçar ícones dos títulos das seções
        const sectionIcons = document.querySelectorAll('.edit-venda-modal .form-section h4 i');
        sectionIcons.forEach((icon, index) => {
            icon.style.setProperty('color', '#3b82f6', 'important'); // Azul primário
            icon.style.setProperty('font-size', '1rem', 'important');
            icon.style.setProperty('font-weight', 'bold', 'important');
            icon.style.setProperty('display', 'inline-block', 'important');
            icon.style.setProperty('visibility', 'visible', 'important');
            icon.style.setProperty('opacity', '1', 'important');
            icon.style.setProperty('font-family', '"Font Awesome 5 Free"', 'important');
            icon.style.setProperty('font-style', 'normal', 'important');
            icon.style.setProperty('text-rendering', 'auto', 'important');
            icon.style.setProperty('-webkit-font-smoothing', 'antialiased', 'important');
            icon.style.setProperty('margin-right', '8px', 'important');
            console.log(`✅ Ícone de seção ${index + 1} forçado`);
        });

        // Forçar ícones dos botões
        const buttonIcons = document.querySelectorAll('.edit-venda-modal .btn i');
        buttonIcons.forEach((icon, index) => {
            const button = icon.closest('.btn');
            let iconColor = '#3b82f6'; // Azul padrão

            if (button.classList.contains('btn-primary')) {
                iconColor = '#ffffff'; // Branco para botões primários
            } else if (button.classList.contains('btn-danger')) {
                iconColor = '#ffffff'; // Branco para botões de perigo
            } else if (button.classList.contains('btn-outline')) {
                iconColor = '#3b82f6'; // Azul para botões outline
            } else if (button.classList.contains('btn-success')) {
                iconColor = '#ffffff'; // Branco para botões de sucesso/confirmação
            }

            icon.style.setProperty('color', iconColor, 'important');
            icon.style.setProperty('font-size', '0.875rem', 'important');
            icon.style.setProperty('font-weight', 'normal', 'important');
            icon.style.setProperty('display', 'inline-block', 'important');
            icon.style.setProperty('visibility', 'visible', 'important');
            icon.style.setProperty('opacity', '1', 'important');
            icon.style.setProperty('font-family', '"Font Awesome 5 Free"', 'important');
            icon.style.setProperty('font-style', 'normal', 'important');
            icon.style.setProperty('text-rendering', 'auto', 'important');
            icon.style.setProperty('-webkit-font-smoothing', 'antialiased', 'important');
            icon.style.setProperty('margin-right', '6px', 'important');
            console.log(`✅ Ícone de botão ${index + 1} forçado com cor: ${iconColor}`);
        });

        // Forçar ícones dos botões de remover item
        const removeIcons = document.querySelectorAll('.edit-venda-modal .remove-item-btn i');
        removeIcons.forEach((icon, index) => {
            icon.style.setProperty('color', '#ffffff', 'important'); // Branco para ícones de remover
            icon.style.setProperty('font-size', '0.75rem', 'important');
            icon.style.setProperty('font-weight', 'normal', 'important');
            icon.style.setProperty('display', 'inline-block', 'important');
            icon.style.setProperty('visibility', 'visible', 'important');
            icon.style.setProperty('opacity', '1', 'important');
            icon.style.setProperty('font-family', '"Font Awesome 5 Free"', 'important');
            icon.style.setProperty('font-style', 'normal', 'important');
            icon.style.setProperty('text-rendering', 'auto', 'important');
            icon.style.setProperty('-webkit-font-smoothing', 'antialiased', 'important');
            console.log(`✅ Ícone de remover ${index + 1} forçado`);
        });

        // Forçar ícone do botão de adicionar item
        const addIcon = document.querySelector('.edit-venda-modal #add-edit-item-btn i');
        if (addIcon) {
            addIcon.style.setProperty('color', '#3b82f6', 'important'); // Azul para ícone de adicionar
            addIcon.style.setProperty('font-size', '0.875rem', 'important');
            addIcon.style.setProperty('font-weight', 'normal', 'important');
            addIcon.style.setProperty('display', 'inline-block', 'important');
            addIcon.style.setProperty('visibility', 'visible', 'important');
            addIcon.style.setProperty('opacity', '1', 'important');
            addIcon.style.setProperty('font-family', '"Font Awesome 5 Free"', 'important');
            addIcon.style.setProperty('font-style', 'normal', 'important');
            addIcon.style.setProperty('text-rendering', 'auto', 'important');
            addIcon.style.setProperty('-webkit-font-smoothing', 'antialiased', 'important');
            addIcon.style.setProperty('margin-right', '6px', 'important');
            console.log('✅ Ícone de adicionar item forçado');
        }

        console.log('✅ Todos os ícones do modal de edição forçados!');
    }

    setupEditItemEvents() {
        // Eventos para remover itens
        document.querySelectorAll('.remove-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const row = e.target.closest('.venda-item-row');
                if (row) {
                    row.remove();
                    this.updateEditVendaTotal();
                }
            });
        });

        // Eventos para atualizar totais
        document.querySelectorAll('.venda-item-row select[name="produto_id"]').forEach(select => {
            select.addEventListener('change', (e) => {
                const row = e.target.closest('.venda-item-row');
                const option = e.target.selectedOptions[0];
                if (option && option.dataset.preco) {
                    const precoInput = row.querySelector('input[name="preco_unit"]');
                    precoInput.value = option.dataset.preco;
                    this.updateItemSubtotal(row);
                }
            });
        });

        document.querySelectorAll('.venda-item-row input[name="quantidade"], .venda-item-row input[name="preco_unit"]').forEach(input => {
            input.addEventListener('input', (e) => {
                const row = e.target.closest('.venda-item-row');
                this.updateItemSubtotal(row);
            });
        });
    }

    updateItemSubtotal(row) {
        const quantidade = parseFloat(row.querySelector('input[name="quantidade[]"]').value) || 0;
        const precoUnit = parseFloat(row.querySelector('input[name="preco_unit[]"]').value) || 0;
        const subtotal = quantidade * precoUnit;

        row.querySelector('.subtotal').textContent = this.formatCurrency(subtotal);
        this.updateEditVendaTotal();
    }

    updateEditVendaTotal() {
        let totalItens = 0;
        let totalVenda = 0;

        document.querySelectorAll('.venda-item-row').forEach(row => {
            const quantidade = parseFloat(row.querySelector('input[name="quantidade[]"]').value) || 0;
            const precoUnit = parseFloat(row.querySelector('input[name="preco_unit[]"]').value) || 0;

            if (quantidade > 0 && precoUnit > 0) {
                totalItens++;
                totalVenda += quantidade * precoUnit;
            }
        });

        document.getElementById('edit-total-itens').textContent = totalItens;
        document.getElementById('edit-total-venda').textContent = this.formatCurrency(totalVenda);
    }

    async saveEditVenda(vendaId) {
        try {
            const form = document.getElementById('edit-venda-form');
            const formData = new FormData(form);

            // Extrair dados do formulário
            const cliente_id = parseInt(formData.get('cliente_id'));
            const observacoes = formData.get('observacoes') || '';

            // Extrair itens
            const itens = [];
            document.querySelectorAll('.venda-item-row').forEach(row => {
                const produto_id = parseInt(row.querySelector('select[name="produto_id"]').value);
                const quantidade = parseInt(row.querySelector('input[name="quantidade"]').value);
                const preco_unit = parseFloat(row.querySelector('input[name="preco_unit"]').value);

                if (produto_id && quantidade > 0 && preco_unit > 0) {
                    itens.push({
                        produto_id,
                        quantidade,
                        preco_unit
                    });
                }
            });

            // Validações
            if (!cliente_id) {
                throw new Error('Selecione um cliente');
            }

            if (itens.length === 0) {
                throw new Error('Adicione pelo menos um item à venda');
            }

            // Preparar dados para envio
            const vendaData = {
                cliente_id,
                itens,
                observacoes
            };

            console.log('💾 Salvando alterações da venda:', vendaData);

            // Enviar para API
            const response = await window.api.put(`/api/vendas/${vendaId}`, vendaData);
            const data = response.data;

            if (data.success) {
                this.showSuccess('Venda atualizada com sucesso!');
                window.UI.hideModal();

                // Forçar atualização completa
                await this.forceUpdateAfterEdit();
            } else {
                throw new Error(data.error || 'Erro ao atualizar venda');
            }

        } catch (error) {
            console.error('❌ Erro ao salvar alterações da venda:', error);
            this.showErrorWithTitle('Erro ao salvar alterações', error.message);
        }
    }

    async cancelVenda(id) {
        const venda = this.vendas.find(v => v.id === id);
        if (!venda) return;

        let confirmed = false;

        if (window.UI) {
            confirmed = await window.UI.showConfirm({
                title: 'Confirmar Cancelamento',
                message: `Tem certeza que deseja cancelar a venda #${venda.id}?`,
                okText: 'Cancelar Venda',
                cancelText: 'Voltar'
            });
        } else {
            confirmed = confirm(`Tem certeza que deseja cancelar a venda #${venda.id}?`);
        }

        if (!confirmed) return;

        try {
            const response = await window.api.delete(`/api/vendas/${id}`);
            const data = response.data;

            if (data.success) {
                this.showSuccess('Venda cancelada com sucesso!');
                await this.loadVendas();

                this.notifyDashboardUpdate();
            } else {
                throw new Error(data.error || 'Erro ao cancelar venda');
            }

        } catch (error) {
            console.error('❌ Erro ao cancelar venda:', error);
            this.showErrorWithTitle('Erro ao cancelar venda', error.message);
        }
    }

    showLoading() {
        const tbody = document.getElementById('vendas-table-body');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="loading-row">
                        <div class="loading-spinner"></div>
                        <span>Carregando vendas...</span>
                    </td>
                </tr>
            `;
        }
    }

    showEmptyState() {
        const tbody = document.getElementById('vendas-table-body');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-state">
                        <div class="empty-icon">
                            <i class="fas fa-shopping-cart"></i>
                        </div>
                        <p>Erro ao carregar vendas</p>
                        <button class="btn btn-primary" id="retry-load-vendas-btn">
                            Tentar Novamente
                        </button>
                    </td>
                </tr>
            `;

            const retryBtn = document.getElementById('retry-load-vendas-btn');
            if (retryBtn) {
                retryBtn.addEventListener('click', () => {
                    this.loadVendas();
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

    showErrorWithTitle(title, message) {
        if (window.UI) {
            window.UI.showErrorWithTitle(title, message);
        } else {
            alert(`${title}: ${message}`);
        }
    }

    formatCurrency(value) {
        // Verificar se o valor é válido
        if (value === null || value === undefined || isNaN(value)) {
            return 'R$ 0,00';
        }

        // Converter para número se for string
        const numericValue = typeof value === 'string' ? parseFloat(value) : value;

        // Verificar se é um número válido
        if (isNaN(numericValue)) {
            return 'R$ 0,00';
        }

        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(numericValue);
    }

    formatDate(dateString) {
        if (!dateString) return '-';

        try {
            const date = new Date(dateString);

            // Verificar se a data é válida
            if (isNaN(date.getTime())) {
                return '-';
            }

            return date.toLocaleDateString('pt-BR');
        } catch (error) {
            console.warn('⚠️ Erro ao formatar data:', dateString, error);
            return '-';
        }
    }

    getStatusText(status) {
        if (!status) return 'Pendente';

        const statusMap = {
            'pendente': 'Pendente',
            'parcial': 'Parcial',
            'pago': 'Pago',
            'cancelado': 'Cancelado',
            'Pendente': 'Pendente',
            'Parcial': 'Parcial',
            'Pago': 'Pago',
            'Cancelado': 'Cancelado'
        };

        return statusMap[status] || status;
    }

    getStatusClass(venda) {
        if (!venda) return '';

        const statusMap = {
            'pendente': 'status-warning',
            'parcial': 'status-info',
            'pago': 'status-success',
            'cancelado': 'status-danger'
        };

        return statusMap[venda.status] || 'status-default';
    }

    notifyDashboardUpdate() {
        console.log('🔄 Notificando dashboard sobre atualização de vendas...');

        if (window.eventManager) {
            window.eventManager.dispatchUpdate('vendas', 'update', {
                action: 'crud',
                timestamp: new Date().toISOString()
            });
        } else {
            const updateEvent = new CustomEvent('dashboard-update', {
                detail: {
                    type: 'vendas',
                    timestamp: new Date().toISOString(),
                    action: 'update'
                }
            });

            window.dispatchEvent(updateEvent);
            document.dispatchEvent(updateEvent);
        }

        console.log('✅ Evento de atualização de vendas disparado!');
    }

    // ✅ MÉTODO DE CLEANUP PARA SER CHAMADO PELO SISTEMA PRINCIPAL
    async cleanup() {
        console.log('🧹 VENDAS - Iniciando cleanup...');

        try {
            // 1. Limpar event listeners
            this.removeEventListeners();

            // 2. Limpar estado interno
            this.vendas = [];
            this.filteredVendas = [];
            this.currentPage = 1;
            this.isLoading = false;
            this.clientes = [];
            this.produtos = [];

            // 3. Limpar referência global
            if (window.vendasPageInstance === this) {
                window.vendasPageInstance = null;
            }

            console.log('✅ VENDAS - Cleanup concluído com sucesso!');

        } catch (error) {
            console.error('❌ VENDAS - Erro durante cleanup:', error);
        }
    }

    // ✅ REMOVER EVENT LISTENERS
    removeEventListeners() {
        console.log('🔌 Removendo event listeners de vendas...');

        try {
            // Botão Atualizar
            const refreshBtn = document.getElementById('refresh-vendas-btn');
            if (refreshBtn) {
                refreshBtn.replaceWith(refreshBtn.cloneNode(true));
            }

            // Botão Nova Venda
            const newBtn = document.getElementById('new-venda-btn');
            if (newBtn) {
                newBtn.replaceWith(newBtn.cloneNode(true));
            }

            // Campo de busca
            const searchInput = document.getElementById('search-vendas');
            if (searchInput) {
                searchInput.replaceWith(searchInput.cloneNode(true));
            }

            // Botões de filtro
            const filterAll = document.getElementById('filter-all');
            const filterPendente = document.getElementById('filter-pendente');
            const filterPago = document.getElementById('filter-pago');
            const filterCancelado = document.getElementById('filter-cancelado');

            if (filterAll) filterAll.replaceWith(filterAll.cloneNode(true));
            if (filterPendente) filterPendente.replaceWith(filterPendente.cloneNode(true));
            if (filterPago) filterPago.replaceWith(filterPago.cloneNode(true));
            if (filterCancelado) filterCancelado.replaceWith(filterCancelado.cloneNode(true));

            console.log('✅ Event listeners de vendas removidos');

        } catch (error) {
            console.error('❌ Erro ao remover event listeners de vendas:', error);
        }
    }

    // ===== MODAL DE DETALHES PROFISSIONAL =====

    showVendaDetailsModal(vendaId) {
        const venda = this.vendas.find(v => v.id === vendaId);
        if (!venda || !window.UI) return;

        const content = `
            <div class="venda-details-modal" data-venda-id="${venda.id}">
                <!-- Header com informações principais -->
                <div class="venda-header">
                    <div class="venda-title">
                        <h3>Venda #${venda.id.toString().padStart(6, '0')}</h3>
                        <span class="venda-cliente">${venda.cliente_nome}</span>
                    </div>
                    <div class="venda-status-info">
                        <span class="status-badge ${this.getStatusClass(venda)}">${this.getStatusText(venda)}</span>
                        <div class="venda-total">
                            <span class="total-label">Total:</span>
                            <span class="total-value">${this.formatCurrency(venda.total)}</span>
                        </div>
                    </div>
                </div>

                <!-- Tabs de navegação -->
                <div class="venda-tabs">
                    <button class="tab-btn active" data-tab="detalhes">
                        <i class="fas fa-info-circle"></i>
                        Detalhes
                    </button>
                    <button class="tab-btn" data-tab="pagamentos">
                        <i class="fas fa-credit-card"></i>
                        Pagamentos
                    </button>
                    <button class="tab-btn" data-tab="documentos">
                        <i class="fas fa-file"></i>
                        Documentos
                    </button>
                    <button class="tab-btn" data-tab="acoes">
                        <i class="fas fa-cog"></i>
                        Ações
                    </button>
                </div>

                <!-- Conteúdo das tabs -->
                <div class="tab-content">
                    <!-- Tab Detalhes -->
                    <div class="tab-pane active" id="detalhes">
                        ${this.renderDetalhesTab(venda)}
                    </div>

                    <!-- Tab Pagamentos -->
                    <div class="tab-pane" id="pagamentos">
                        ${this.renderPagamentosTab(venda)}
                    </div>

                    <!-- Tab Documentos -->
                    <div class="tab-pane" id="documentos">
                        ${this.renderDocumentosTab(venda)}
                    </div>

                    <!-- Tab Ações -->
                    <div class="tab-pane" id="acoes">
                        ${this.renderAcoesTab(venda)}
                    </div>
                </div>
            </div>
        `;

        window.UI.showModal({
            title: `Venda #${venda.id.toString().padStart(6, '0')}`,
            content: content,
            size: 'lg'
        });

        this.setupVendaDetailsTabs();
        this.setupVendaDetailsButtons();
        this.forceTabIconsStyles();
        this.ensureDocumentosIconVisibility();
        this.forceDocumentIcons();
        this.forceRadicalIconCreation();
        this.setupHoverEffects();
    }

    renderDetalhesTab(venda) {
        const dataVenda = new Date(venda.data_venda).toLocaleDateString('pt-BR');
        const horaVenda = new Date(venda.data_venda).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        return `
            <div class="venda-details-content">
                <div class="details-section">
                    <h4>Informações Gerais</h4>
                    <div class="details-grid">
                        <div class="detail-item">
                            <span class="detail-label">Data da Venda:</span>
                            <span class="detail-value">${dataVenda} às ${horaVenda}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Cliente:</span>
                            <span class="detail-value">${venda.cliente_nome}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Telefone:</span>
                            <span class="detail-value">${venda.cliente_telefone || 'Não informado'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Email:</span>
                            <span class="detail-value">${venda.cliente_email || 'Não informado'}</span>
                        </div>
                    </div>
                </div>

                <div class="details-section">
                    <h4>Valores</h4>
                    <div class="values-grid">
                        <div class="value-item">
                            <span class="value-label">Total da Venda:</span>
                            <span class="value-amount">${this.formatCurrency(venda.total)}</span>
                        </div>
                        <div class="value-item">
                            <span class="value-label">Valor Pago:</span>
                            <span class="value-amount paid">${this.formatCurrency(venda.pago || 0)}</span>
                        </div>
                        <div class="value-item">
                            <span class="value-label">Saldo Restante:</span>
                            <span class="value-amount ${venda.saldo > 0 ? 'pending' : 'paid'}">${this.formatCurrency(venda.saldo || 0)}</span>
                        </div>
                    </div>
                </div>

                <div class="details-section">
                    <h4>Observações</h4>
                    <div class="observations">
                        <p>${venda.observacoes || 'Nenhuma observação registrada.'}</p>
                    </div>
                </div>
            </div>
        `;
    }

    renderPagamentosTab(venda) {
        const saldoRestante = venda.saldo || 0;
        const percentualPago = venda.total > 0 ? ((venda.pago || 0) / venda.total) * 100 : 0;

        return `
            <div class="pagamentos-content">
                <div class="payment-summary">
                    <div class="payment-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${percentualPago}%"></div>
                        </div>
                        <div class="progress-info">
                            <span>${percentualPago.toFixed(1)}% pago</span>
                            <span>${this.formatCurrency(venda.pago || 0)} de ${this.formatCurrency(venda.total)}</span>
                        </div>
                    </div>
                    
                    ${saldoRestante > 0 ? `
                        <button class="btn btn-primary" id="novo-pagamento-btn">
                            <i class="fas fa-plus"></i>
                            Novo Pagamento
                        </button>
                    ` : `
                        <div class="payment-complete">
                            <i class="fas fa-check-circle"></i>
                            <span>Venda totalmente paga!</span>
                        </div>
                    `}
                </div>

                <div class="payment-history">
                    <h4>Histórico de Pagamentos</h4>
                    <div class="payment-list" id="payment-history-list">
                        <div class="loading-payments">
                            <i class="fas fa-spinner fa-spin"></i>
                            <span>Carregando histórico...</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderDocumentosTab(venda) {
        return `
            <div class="documentos-content">
                <div class="documents-grid">
                    <div class="document-item">
                        <div class="document-icon">
                            <i class="fas fa-file-pdf"></i>
                        </div>
                        <div class="document-info">
                            <h5>PDF da Venda</h5>
                            <p>Documento completo da venda</p>
                        </div>
                        <button class="btn btn-outline" id="gerar-pdf-btn">
                            <i class="fas fa-download"></i>
                            Gerar PDF
                        </button>
                    </div>

                    <div class="document-item">
                        <div class="document-icon">
                            <i class="fas fa-receipt"></i>
                        </div>
                        <div class="document-info">
                            <h5>Recibo</h5>
                            <p>Comprovante de pagamento</p>
                        </div>
                        <button class="btn btn-outline" id="gerar-recibo-btn">
                            <i class="fas fa-download"></i>
                            Gerar Recibo
                        </button>
                    </div>

                    <div class="document-item">
                        <div class="document-icon">
                            <i class="fas fa-envelope"></i>
                        </div>
                        <div class="document-info">
                            <h5>Enviar por Email</h5>
                            <p>Enviar documentos por email</p>
                        </div>
                        <button class="btn btn-outline" id="enviar-email-btn">
                            <i class="fas fa-paper-plane"></i>
                            Enviar
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderAcoesTab(venda) {
        const canEdit = venda.status !== 'cancelado';
        const canCancel = venda.status !== 'cancelado';

        return `
            <div class="acoes-content">
                <div class="actions-grid">
                    ${canEdit ? `
                        <div class="action-item">
                            <div class="action-icon">
                                <i class="fas fa-edit"></i>
                            </div>
                            <div class="action-info">
                                <h5>Editar Venda</h5>
                                <p>Modificar informações da venda</p>
                            </div>
                            <button class="btn btn-primary" id="editar-venda-btn">
                                Editar
                            </button>
                        </div>
                    ` : ''}

                    <div class="action-item">
                        <div class="action-icon">
                            <i class="fas fa-copy"></i>
                        </div>
                        <div class="action-info">
                            <h5>Duplicar Venda</h5>
                            <p>Criar nova venda baseada nesta</p>
                        </div>
                        <button class="btn btn-outline" id="duplicar-venda-btn">
                            Duplicar
                        </button>
                    </div>

                    ${canCancel ? `
                        <div class="action-item danger">
                            <div class="action-icon">
                                <i class="fas fa-trash"></i>
                            </div>
                            <div class="action-info">
                                <h5>Cancelar Venda</h5>
                                <p>Cancelar esta venda permanentemente</p>
                            </div>
                            <button class="btn btn-danger" id="cancelar-venda-btn">
                                Cancelar
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    setupVendaDetailsTabs() {
        // Configurar navegação das tabs
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabPanes = document.querySelectorAll('.tab-pane');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.dataset.tab;

                // Remover classe active de todas as tabs
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanes.forEach(pane => pane.classList.remove('active'));

                // Adicionar classe active na tab clicada
                button.classList.add('active');
                document.getElementById(targetTab).classList.add('active');

                // Forçar ícones quando mudar de tab
                setTimeout(() => {
                    this.forceRadicalIconCreation();
                    this.forceHoverEffects(); // ADICIONAR FORÇA HOVER
                }, 100);
            });
        });

        // FORÇAR APLICAÇÃO DOS ESTILOS DOS ÍCONES VIA INLINE
        this.forceTabIconsStyles();

        // FORÇAR CRIAÇÃO DO ÍCONE DE DOCUMENTOS
        this.forceDocumentosIcon();

        // FORÇAR ÍCONES DE DOCUMENTOS E AÇÕES
        this.forceDocumentIcons();

        // APLICAR CORREÇÃO RADICAL
        this.forceRadicalIconCreation();

        // APLICAR EFEITOS HOVER FORÇADOS
        this.forceHoverEffects();

        // Configurar botões específicos
        this.setupVendaDetailsButtons();
    }

    // NOVO MÉTODO: FORÇAR ESTILOS DOS ÍCONES VIA INLINE
    forceTabIconsStyles() {
        console.log('🔧 Forçando estilos dos ícones das tabs via inline...');

        const tabIcons = document.querySelectorAll('.tab-btn i');
        tabIcons.forEach((icon, index) => {
            console.log(`🎨 Aplicando estilos forçados ao ícone ${index + 1}:`, icon.className);

            // Aplicar estilos via inline para garantir
            icon.style.setProperty('font-size', '16px', 'important');
            icon.style.setProperty('color', '#1f2937', 'important');
            icon.style.setProperty('font-weight', 'bold', 'important');
            icon.style.setProperty('display', 'inline-block', 'important');
            icon.style.setProperty('visibility', 'visible', 'important');
            icon.style.setProperty('opacity', '1', 'important');
            icon.style.setProperty('font-family', '"Font Awesome 5 Free"', 'important');
            icon.style.setProperty('font-style', 'normal', 'important');
            icon.style.setProperty('font-variant', 'normal', 'important');
            icon.style.setProperty('text-rendering', 'auto', 'important');
            icon.style.setProperty('-webkit-font-smoothing', 'antialiased', 'important');
            icon.style.setProperty('position', 'static', 'important');
            icon.style.setProperty('background', 'none', 'important');
            icon.style.setProperty('background-image', 'none', 'important');
            icon.style.setProperty('border', 'none', 'important');
            icon.style.setProperty('outline', 'none', 'important');
            icon.style.setProperty('box-shadow', 'none', 'important');
            icon.style.setProperty('transform', 'none', 'important');
            icon.style.setProperty('animation', 'none', 'important');
            icon.style.setProperty('z-index', 'auto', 'important');

            console.log(`✅ Estilos aplicados ao ícone ${index + 1}`);
        });

        // CORREÇÃO ESPECÍFICA PARA O ÍCONE DE DOCUMENTOS
        const documentosIcon = document.querySelector('.tab-btn[data-tab="documentos"] i');
        if (documentosIcon) {
            console.log('🔧 Aplicando correção específica para o ícone de Documentos...');

            // Tentar diferentes ícones se o atual não funcionar
            const iconOptions = [
                'fas fa-file',
                'fas fa-file',
                'fas fa-file-pdf',
                'fas fa-folder',
                'fas fa-folder-open'
            ];

            // Aplicar estilos forçados
            documentosIcon.style.setProperty('font-size', '16px', 'important');
            documentosIcon.style.setProperty('color', '#1f2937', 'important');
            documentosIcon.style.setProperty('font-weight', 'bold', 'important');
            documentosIcon.style.setProperty('display', 'inline-block', 'important');
            documentosIcon.style.setProperty('visibility', 'visible', 'important');
            documentosIcon.style.setProperty('opacity', '1', 'important');
            documentosIcon.style.setProperty('font-family', '"Font Awesome 5 Free"', 'important');
            documentosIcon.style.setProperty('font-style', 'normal', 'important');
            documentosIcon.style.setProperty('font-variant', 'normal', 'important');
            documentosIcon.style.setProperty('text-rendering', 'auto', 'important');
            documentosIcon.style.setProperty('-webkit-font-smoothing', 'antialiased', 'important');
            documentosIcon.style.setProperty('position', 'static', 'important');
            documentosIcon.style.setProperty('background', 'none', 'important');
            documentosIcon.style.setProperty('background-image', 'none', 'important');
            documentosIcon.style.setProperty('border', 'none', 'important');
            documentosIcon.style.setProperty('outline', 'none', 'important');
            documentosIcon.style.setProperty('box-shadow', 'none', 'important');
            documentosIcon.style.setProperty('transform', 'none', 'important');
            documentosIcon.style.setProperty('animation', 'none', 'important');
            documentosIcon.style.setProperty('z-index', 'auto', 'important');

            // Verificar se o ícone está visível
            setTimeout(() => {
                const computedStyle = window.getComputedStyle(documentosIcon);
                const isVisible = computedStyle.display !== 'none' &&
                    computedStyle.visibility !== 'hidden' &&
                    computedStyle.opacity !== '0';

                if (!isVisible) {
                    console.log('⚠️ Ícone de Documentos não está visível, tentando ícone alternativo...');
                    // Tentar ícone alternativo
                    documentosIcon.className = 'fas fa-folder';
                    console.log('🔄 Ícone alterado para fa-folder');
                } else {
                    console.log('✅ Ícone de Documentos está visível');
                }
            }, 100);

            console.log('✅ Correção específica aplicada ao ícone de Documentos!');
        }

        // Aplicar estilos de hover e active
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach((button, index) => {
            const icon = button.querySelector('i');
            if (icon) {
                // Hover
                button.addEventListener('mouseenter', () => {
                    icon.style.setProperty('color', '#1e40af', 'important');
                    icon.style.setProperty('font-weight', 'bold', 'important');
                });

                // Mouse leave
                button.addEventListener('mouseleave', () => {
                    if (!button.classList.contains('active')) {
                        icon.style.setProperty('color', '#1f2937', 'important');
                        icon.style.setProperty('font-weight', 'bold', 'important');
                    }
                });

                // Active
                if (button.classList.contains('active')) {
                    icon.style.setProperty('color', '#1e40af', 'important');
                    icon.style.setProperty('font-weight', 'bold', 'important');
                }
            }
        });

        console.log('✅ Estilos dos ícones das tabs forçados via inline!');
    }

    // MÉTODO ADICIONAL: FORÇAR CRIAÇÃO DO ÍCONE DE DOCUMENTOS
    forceDocumentosIcon() {
        console.log('🔧 Forçando criação do ícone de Documentos...');

        const documentosButton = document.querySelector('.tab-btn[data-tab="documentos"]');
        if (documentosButton) {
            // Remover ícone existente se houver
            const existingIcon = documentosButton.querySelector('i');
            if (existingIcon) {
                existingIcon.remove();
            }

            // Criar novo ícone
            const newIcon = document.createElement('i');
            newIcon.className = 'fas fa-folder';
            newIcon.style.cssText = `
                font-size: 16px !important;
                color: #1f2937 !important;
                font-weight: bold !important;
                display: inline-block !important;
                visibility: visible !important;
                opacity: 1 !important;
                font-family: "Font Awesome 5 Free" !important;
                font-style: normal !important;
                font-variant: normal !important;
                text-rendering: auto !important;
                -webkit-font-smoothing: antialiased !important;
                position: static !important;
                background: none !important;
                background-image: none !important;
                border: none !important;
                outline: none !important;
                box-shadow: none !important;
                transform: none !important;
                animation: none !important;
                z-index: auto !important;
            `;

            // Inserir o ícone no início do botão
            documentosButton.insertBefore(newIcon, documentosButton.firstChild);

            console.log('✅ Ícone de Documentos criado forçadamente!');
        }
    }

    // MÉTODO: GARANTIR VISIBILIDADE DO ÍCONE DE DOCUMENTOS
    ensureDocumentosIconVisibility() {
        console.log('🔍 Verificando visibilidade do ícone de Documentos...');

        const documentosIcon = document.querySelector('.tab-btn[data-tab="documentos"] i');
        if (documentosIcon) {
            // Garantir que o ícone está visível
            documentosIcon.style.setProperty('font-size', '16px', 'important');
            documentosIcon.style.setProperty('color', '#1f2937', 'important');
            documentosIcon.style.setProperty('font-weight', 'bold', 'important');
            documentosIcon.style.setProperty('display', 'inline-block', 'important');
            documentosIcon.style.setProperty('visibility', 'visible', 'important');
            documentosIcon.style.setProperty('opacity', '1', 'important');
            documentosIcon.style.setProperty('font-family', '"Font Awesome 5 Free"', 'important');
            documentosIcon.style.setProperty('font-style', 'normal', 'important');
            documentosIcon.style.setProperty('font-variant', 'normal', 'important');
            documentosIcon.style.setProperty('text-rendering', 'auto', 'important');
            documentosIcon.style.setProperty('-webkit-font-smoothing', 'antialiased', 'important');
            documentosIcon.style.setProperty('position', 'static', 'important');
            documentosIcon.style.setProperty('background', 'none', 'important');
            documentosIcon.style.setProperty('background-image', 'none', 'important');
            documentosIcon.style.setProperty('border', 'none', 'important');
            documentosIcon.style.setProperty('outline', 'none', 'important');
            documentosIcon.style.setProperty('box-shadow', 'none', 'important');
            documentosIcon.style.setProperty('transform', 'none', 'important');
            documentosIcon.style.setProperty('animation', 'none', 'important');
            documentosIcon.style.setProperty('z-index', 'auto', 'important');

            // Verificar se o ícone está realmente visível
            const computedStyle = window.getComputedStyle(documentosIcon);
            if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
                console.log('⚠️ Ícone não está visível, recriando...');
                this.forceDocumentosIcon();
            } else {
                console.log('✅ Ícone de Documentos está visível!');
            }
        } else {
            console.log('⚠️ Ícone de Documentos não encontrado, criando...');
            this.forceDocumentosIcon();
        }
    }

    setupVendaDetailsButtons() {
        // Botão Novo Pagamento
        const novoPagamentoBtn = document.getElementById('novo-pagamento-btn');
        if (novoPagamentoBtn) {
            novoPagamentoBtn.addEventListener('click', () => {
                const vendaId = this.getCurrentVendaId();
                if (vendaId) {
                    window.UI.hideModal();
                    setTimeout(() => {
                        this.showPaymentModal(vendaId);
                    }, 300);
                }
            });
        }

        // Botão Gerar PDF
        const gerarPdfBtn = document.getElementById('gerar-pdf-btn');
        if (gerarPdfBtn) {
            gerarPdfBtn.addEventListener('click', () => {
                const vendaId = this.getCurrentVendaId();
                if (vendaId) {
                    this.generatePDF(vendaId);
                }
            });
        }

        // Botão Gerar Recibo
        const gerarReciboBtn = document.getElementById('gerar-recibo-btn');
        if (gerarReciboBtn) {
            gerarReciboBtn.addEventListener('click', () => {
                const vendaId = this.getCurrentVendaId();
                if (vendaId) {
                    this.generateRecibo(vendaId);
                }
            });
        }

        // Botão Enviar Email
        const enviarEmailBtn = document.getElementById('enviar-email-btn');
        if (enviarEmailBtn) {
            enviarEmailBtn.addEventListener('click', () => {
                const vendaId = this.getCurrentVendaId();
                if (vendaId) {
                    this.sendEmail(vendaId);
                }
            });
        }

        // Botão Editar Venda
        const editarVendaBtn = document.getElementById('editar-venda-btn');
        if (editarVendaBtn) {
            editarVendaBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                const vendaId = this.getCurrentVendaId();
                console.log('✏️ Botão Editar clicado para venda:', vendaId);

                if (vendaId) {
                    // Não fechar o modal atual, apenas chamar editVenda
                    this.editVenda(vendaId);
                } else {
                    console.error('❌ ID da venda não encontrado');
                }
            });
        }

        // Botão Duplicar Venda
        const duplicarVendaBtn = document.getElementById('duplicar-venda-btn');
        if (duplicarVendaBtn) {
            duplicarVendaBtn.addEventListener('click', () => {
                const vendaId = this.getCurrentVendaId();
                if (vendaId) {
                    window.UI.hideModal();
                    setTimeout(() => {
                        this.duplicateVenda(vendaId);
                    }, 300);
                }
            });
        }

        // Botão Cancelar Venda
        const cancelarVendaBtn = document.getElementById('cancelar-venda-btn');
        if (cancelarVendaBtn) {
            cancelarVendaBtn.addEventListener('click', () => {
                const vendaId = this.getCurrentVendaId();
                if (vendaId) {
                    window.UI.hideModal();
                    setTimeout(() => {
                        this.cancelVenda(vendaId);
                    }, 300);
                }
            });
        }

        // Carregar histórico de pagamentos quando a tab for ativada
        this.setupPaymentHistoryLoader();
    }

    // MÉTODO: CONFIGURAR CARREGAMENTO DO HISTÓRICO DE PAGAMENTOS
    setupPaymentHistoryLoader() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.dataset.tab;
                if (targetTab === 'pagamentos') {
                    // Carregar histórico de pagamentos quando a tab for clicada
                    setTimeout(() => {
                        this.loadPaymentHistory();
                    }, 200);
                }
            });
        });
    }

    // MÉTODO: CARREGAR HISTÓRICO DE PAGAMENTOS
    async loadPaymentHistory() {
        console.log('🔄 Iniciando carregamento do histórico de pagamentos...');

        const vendaId = this.getCurrentVendaId();
        if (!vendaId) {
            console.error('❌ ID da venda não encontrado');
            return;
        }

        console.log(`✅ ID da venda encontrado: ${vendaId}`);

        const paymentList = document.getElementById('payment-history-list');
        if (!paymentList) {
            console.error('❌ Elemento de lista de pagamentos não encontrado');
            return;
        }

        console.log('✅ Elemento de lista de pagamentos encontrado');

        try {
            console.log(`🔄 Carregando histórico de pagamentos para venda ${vendaId}...`);

            // Mostrar loading
            paymentList.innerHTML = `
                <div class="loading-payments">
                    <i class="fas fa-spinner fa-spin"></i>
                    <span>Carregando histórico...</span>
                </div>
            `;

            // Fazer requisição para buscar pagamentos
            const url = `/api/pagamentos/venda/${vendaId}`;
            console.log(`🌐 Fazendo requisição para: ${url}`);

            const response = await fetch(url);

            console.log(`📡 Resposta recebida:`, {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Erro na resposta:', errorText);
                throw new Error(`Erro HTTP: ${response.status} - ${errorText}`);
            }

            const pagamentos = await response.json();
            console.log(`📊 Pagamentos recebidos:`, pagamentos);

            if (!Array.isArray(pagamentos)) {
                console.error('❌ Resposta não é um array:', pagamentos);
                throw new Error('Resposta inválida do servidor');
            }

            if (pagamentos.length === 0) {
                console.log('ℹ️ Nenhum pagamento encontrado');
                paymentList.innerHTML = `
                    <div class="no-payments">
                        <i class="fas fa-info-circle"></i>
                        <span>Nenhum pagamento registrado ainda.</span>
                    </div>
                `;
                return;
            }

            console.log(`✅ Renderizando ${pagamentos.length} pagamentos`);

            // Renderizar lista de pagamentos
            const paymentHTML = pagamentos.map((pagamento, index) => {
                console.log(`📋 Renderizando pagamento ${index + 1}:`, pagamento);

                return `
                    <div class="payment-item">
                        <div class="payment-info">
                            <div class="payment-date">
                                <i class="fas fa-calendar"></i>
                                <span>${this.formatDate(pagamento.data_pagamento)}</span>
                            </div>
                            <div class="payment-method">
                                <i class="fas fa-credit-card"></i>
                                <span>${this.getPaymentMethodText(pagamento.metodo_pagamento)}</span>
                            </div>
                            <div class="payment-amount">
                                <i class="fas fa-dollar-sign"></i>
                                <span>${this.formatCurrency(pagamento.valor)}</span>
                            </div>
                        </div>
                        <div class="payment-status ${pagamento.status === 'confirmado' ? 'confirmed' : 'pending'}">
                            <i class="fas ${pagamento.status === 'confirmado' ? 'fa-check-circle' : 'fa-clock'}"></i>
                            <span>${this.getPaymentStatusText(pagamento.status)}</span>
                        </div>
                    </div>
                `;
            }).join('');

            paymentList.innerHTML = paymentHTML;
            console.log(`✅ Histórico de pagamentos carregado com sucesso: ${pagamentos.length} pagamentos`);

            // Aplicar estilos forçados aos ícones após renderizar
            this.forcePaymentIconsColors();

        } catch (error) {
            console.error('❌ Erro ao carregar histórico de pagamentos:', error);
            paymentList.innerHTML = `
                <div class="error-payments">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>Erro ao carregar histórico: ${error.message}</span>
                </div>
            `;
        }
    }

    // MÉTODO: FORÇAR CORES DOS ÍCONES DE PAGAMENTOS
    forcePaymentIconsColors() {
        console.log('🎨 Aplicando cores forçadas aos ícones de pagamentos...');

        // Ícones de data, método e valor
        const paymentIcons = document.querySelectorAll('.payment-date i, .payment-method i, .payment-amount i');
        paymentIcons.forEach((icon, index) => {
            console.log(`🎨 Aplicando cor ao ícone ${index + 1}:`, icon.className);

            // Determinar cor baseada no tipo de ícone
            let iconColor = '#6b7280'; // Cinza padrão

            if (icon.closest('.payment-amount')) {
                iconColor = '#10b981'; // Verde para valor
            } else if (icon.closest('.payment-date')) {
                iconColor = '#6b7280'; // Cinza para data
            } else if (icon.closest('.payment-method')) {
                iconColor = '#6b7280'; // Cinza para método
            }

            // Aplicar estilos forçados
            icon.style.setProperty('color', iconColor, 'important');
            icon.style.setProperty('font-size', '0.875rem', 'important');
            icon.style.setProperty('font-weight', 'normal', 'important');
            icon.style.setProperty('display', 'inline-block', 'important');
            icon.style.setProperty('visibility', 'visible', 'important');
            icon.style.setProperty('opacity', '1', 'important');
            icon.style.setProperty('font-family', '"Font Awesome 5 Free"', 'important');
            icon.style.setProperty('font-style', 'normal', 'important');
            icon.style.setProperty('text-rendering', 'auto', 'important');
            icon.style.setProperty('-webkit-font-smoothing', 'antialiased', 'important');
        });

        // Ícones de status
        const statusIcons = document.querySelectorAll('.payment-status i');
        statusIcons.forEach((icon, index) => {
            console.log(`🎨 Aplicando cor ao ícone de status ${index + 1}:`, icon.className);

            const statusElement = icon.closest('.payment-status');
            let iconColor = '#6b7280'; // Cinza padrão

            if (statusElement.classList.contains('confirmed')) {
                iconColor = '#10b981'; // Verde para confirmado
            } else if (statusElement.classList.contains('pending')) {
                iconColor = '#f59e0b'; // Amarelo para pendente
            }

            // Aplicar estilos forçados
            icon.style.setProperty('color', iconColor, 'important');
            icon.style.setProperty('font-size', '0.875rem', 'important');
            icon.style.setProperty('font-weight', 'normal', 'important');
            icon.style.setProperty('display', 'inline-block', 'important');
            icon.style.setProperty('visibility', 'visible', 'important');
            icon.style.setProperty('opacity', '1', 'important');
            icon.style.setProperty('font-family', '"Font Awesome 5 Free"', 'important');
            icon.style.setProperty('font-style', 'normal', 'important');
            icon.style.setProperty('text-rendering', 'auto', 'important');
            icon.style.setProperty('-webkit-font-smoothing', 'antialiased', 'important');
        });

        // Ícone "Venda totalmente paga"
        const completeIcons = document.querySelectorAll('.payment-complete i');
        completeIcons.forEach((icon, index) => {
            console.log(`🎨 Aplicando cor ao ícone "Venda totalmente paga" ${index + 1}:`, icon.className);

            // Aplicar estilos forçados para verde de confirmação
            icon.style.setProperty('color', '#10b981', 'important'); // Verde para confirmação
            icon.style.setProperty('font-size', '1.25rem', 'important');
            icon.style.setProperty('font-weight', 'bold', 'important');
            icon.style.setProperty('display', 'inline-block', 'important');
            icon.style.setProperty('visibility', 'visible', 'important');
            icon.style.setProperty('opacity', '1', 'important');
            icon.style.setProperty('font-family', '"Font Awesome 5 Free"', 'important');
            icon.style.setProperty('font-style', 'normal', 'important');
            icon.style.setProperty('text-rendering', 'auto', 'important');
            icon.style.setProperty('-webkit-font-smoothing', 'antialiased', 'important');
        });

        console.log('✅ Cores dos ícones de pagamentos aplicadas com sucesso');
    }

    // MÉTODO: GERAR PDF
    async generateRecibo(vendaId) {
        try {
            console.log(`🧾 Gerando recibo para venda ${vendaId}...`);

            // Mostrar loading
            const btn = document.getElementById('gerar-recibo-btn');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gerando...';
            btn.disabled = true;

            const response = await fetch(`/api/pdf/recibo/${vendaId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `recibo-venda-${vendaId}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            console.log(`✅ Recibo gerado com sucesso para venda ${vendaId}`);

            // Mostrar notificação de sucesso
            window.UI.showNotification('Recibo gerado com sucesso!', 'success');

        } catch (error) {
            console.error('❌ Erro ao gerar recibo:', error);
            window.UI.showNotification('Erro ao gerar recibo. Tente novamente.', 'error');
        } finally {
            // Restaurar botão
            const btn = document.getElementById('gerar-recibo-btn');
            btn.innerHTML = '<i class="fas fa-download"></i> Gerar Recibo';
            btn.disabled = false;
        }
    }

    // MÉTODO: ENVIAR EMAIL
    async sendEmail(vendaId) {
        try {
            console.log(`📧 Enviando email para venda ${vendaId}...`);

            // Mostrar loading
            const btn = document.getElementById('enviar-email-btn');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            btn.disabled = true;

            const response = await fetch(`/api/email/venda/${vendaId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                console.log(`✅ Email enviado com sucesso para venda ${vendaId}`);
                window.UI.showNotification('Email enviado com sucesso!', 'success');
            } else {
                throw new Error(result.message || 'Erro ao enviar email');
            }

        } catch (error) {
            console.error('❌ Erro ao enviar email:', error);
            window.UI.showNotification('Erro ao enviar email. Tente novamente.', 'error');
        } finally {
            // Restaurar botão
            const btn = document.getElementById('enviar-email-btn');
            btn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar';
            btn.disabled = false;
        }
    }

    // MÉTODO: DUPLICAR VENDA
    async duplicateVenda(vendaId) {
        try {
            console.log(`📋 Duplicando venda ${vendaId}...`);

            const response = await fetch(`/api/vendas/${vendaId}/duplicate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                console.log(`✅ Venda duplicada com sucesso: ${result.vendaId}`);
                window.UI.showNotification('Venda duplicada com sucesso!', 'success');

                // Recarregar lista de vendas
                this.loadVendas();
            } else {
                throw new Error(result.message || 'Erro ao duplicar venda');
            }

        } catch (error) {
            console.error('❌ Erro ao duplicar venda:', error);
            window.UI.showNotification('Erro ao duplicar venda. Tente novamente.', 'error');
        }
    }

    // MÉTODOS AUXILIARES
    getPaymentMethodText(method) {
        const methods = {
            'dinheiro': 'Dinheiro',
            'cartao_credito': 'Cartão de Crédito',
            'cartao_debito': 'Cartão de Débito',
            'pix': 'PIX',
            'transferencia': 'Transferência',
            'boleto': 'Boleto',
            'cheque': 'Cheque'
        };
        return methods[method] || method;
    }

    getPaymentStatusText(status) {
        const statuses = {
            'confirmado': 'Confirmado',
            'pendente': 'Pendente',
            'cancelado': 'Cancelado'
        };
        return statuses[status] || status;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    getCurrentVendaId() {
        // Extrair o ID da venda do título do modal
        const modalTitle = document.querySelector('.modal-title');
        if (modalTitle) {
            const match = modalTitle.textContent.match(/Venda #(\d+)/);
            const vendaId = match ? parseInt(match[1]) : null;
            console.log(`🔍 Buscando ID da venda no título: "${modalTitle.textContent}" -> ID: ${vendaId}`);
            return vendaId;
        }

        // Fallback: tentar buscar em outros elementos
        const modal = document.querySelector('.venda-details-modal');
        if (modal) {
            const vendaIdAttr = modal.getAttribute('data-venda-id');
            if (vendaIdAttr) {
                console.log(`🔍 ID da venda encontrado no atributo data-venda-id: ${vendaIdAttr}`);
                return parseInt(vendaIdAttr);
            }
        }

        console.error('❌ Não foi possível encontrar o ID da venda');
        return null;
    }

    // MÉTODO ADICIONAL: FORÇAR ÍCONES DE DOCUMENTOS E AÇÕES
    forceDocumentIcons() {
        console.log('🔧 Forçando ícones de documentos e ações...');

        // Forçar ícones dos documentos
        const documentIcons = document.querySelectorAll('.document-item .document-icon i');
        documentIcons.forEach((icon, index) => {
            console.log(`🎨 Aplicando estilos forçados ao ícone de documento ${index + 1}:`, icon.className);

            // Aplicar estilos básicos
            icon.style.setProperty('font-size', '1.25rem', 'important');
            icon.style.setProperty('color', 'white', 'important');
            icon.style.setProperty('font-weight', 'bold', 'important');
            icon.style.setProperty('display', 'inline-block', 'important');
            icon.style.setProperty('visibility', 'visible', 'important');
            icon.style.setProperty('opacity', '1', 'important');
            icon.style.setProperty('font-family', '"Font Awesome 5 Free"', 'important');
            icon.style.setProperty('font-style', 'normal', 'important');
            icon.style.setProperty('font-variant', 'normal', 'important');
            icon.style.setProperty('text-rendering', 'auto', 'important');
            icon.style.setProperty('-webkit-font-smoothing', 'antialiased', 'important');
            icon.style.setProperty('position', 'static', 'important');
            icon.style.setProperty('background', 'none', 'important');
            icon.style.setProperty('background-image', 'none', 'important');
            icon.style.setProperty('border', 'none', 'important');
            icon.style.setProperty('outline', 'none', 'important');
            icon.style.setProperty('box-shadow', 'none', 'important');
            icon.style.setProperty('transform', 'none', 'important');
            icon.style.setProperty('animation', 'none', 'important');
            icon.style.setProperty('z-index', 'auto', 'important');
            icon.style.setProperty('content', '""', 'important');
            icon.style.setProperty('line-height', '1', 'important');
            icon.style.setProperty('vertical-align', 'middle', 'important');
            icon.style.setProperty('text-align', 'center', 'important');
            icon.style.setProperty('width', 'auto', 'important');
            icon.style.setProperty('height', 'auto', 'important');
            icon.style.setProperty('min-width', 'auto', 'important');
            icon.style.setProperty('min-height', 'auto', 'important');
            icon.style.setProperty('max-width', 'none', 'important');
            icon.style.setProperty('max-height', 'none', 'important');
            icon.style.setProperty('margin', '0', 'important');
            icon.style.setProperty('padding', '0', 'important');
            icon.style.setProperty('overflow', 'visible', 'important');
            icon.style.setProperty('clip', 'auto', 'important');
            icon.style.setProperty('clip-path', 'none', 'important');

            // Aplicar conteúdo específico baseado na posição
            let content = '';
            if (index === 0) {
                content = '\\f1c1'; // fa-file-pdf
            } else if (index === 1) {
                content = '\\f543'; // fa-receipt
            } else if (index === 2) {
                content = '\\f0e0'; // fa-envelope
            }

            if (content) {
                icon.style.setProperty('content', `"${content}"`, 'important');
                console.log(`📄 Aplicado conteúdo específico: ${content} para ícone ${index + 1}`);
            }

            console.log(`✅ Estilos aplicados ao ícone de documento ${index + 1}`);
        });

        // Forçar ícones dos botões de documentos
        const documentButtonIcons = document.querySelectorAll('.document-item .btn i');
        documentButtonIcons.forEach((icon, index) => {
            console.log(`🎨 Aplicando estilos forçados ao ícone de botão ${index + 1}:`, icon.className);

            // Aplicar estilos básicos
            icon.style.setProperty('font-size', '0.875rem', 'important');
            icon.style.setProperty('color', 'white', 'important'); // FORÇAR COR BRANCA
            icon.style.setProperty('font-weight', 'normal', 'important');
            icon.style.setProperty('display', 'inline-block', 'important');
            icon.style.setProperty('visibility', 'visible', 'important');
            icon.style.setProperty('opacity', '1', 'important');
            icon.style.setProperty('font-family', '"Font Awesome 5 Free"', 'important');
            icon.style.setProperty('font-style', 'normal', 'important');
            icon.style.setProperty('font-variant', 'normal', 'important');
            icon.style.setProperty('text-rendering', 'auto', 'important');
            icon.style.setProperty('-webkit-font-smoothing', 'antialiased', 'important');
            icon.style.setProperty('position', 'static', 'important');
            icon.style.setProperty('background', 'none', 'important');
            icon.style.setProperty('background-image', 'none', 'important');
            icon.style.setProperty('border', 'none', 'important');
            icon.style.setProperty('outline', 'none', 'important');
            icon.style.setProperty('box-shadow', 'none', 'important');
            icon.style.setProperty('transform', 'none', 'important');
            icon.style.setProperty('animation', 'none', 'important');
            icon.style.setProperty('z-index', 'auto', 'important');
            icon.style.setProperty('content', '""', 'important');
            icon.style.setProperty('line-height', '1', 'important');
            icon.style.setProperty('vertical-align', 'middle', 'important');
            icon.style.setProperty('text-align', 'center', 'important');
            icon.style.setProperty('width', 'auto', 'important');
            icon.style.setProperty('height', 'auto', 'important');
            icon.style.setProperty('min-width', 'auto', 'important');
            icon.style.setProperty('min-height', 'auto', 'important');
            icon.style.setProperty('max-width', 'none', 'important');
            icon.style.setProperty('max-height', 'none', 'important');
            icon.style.setProperty('margin', '0', 'important');
            icon.style.setProperty('padding', '0', 'important');
            icon.style.setProperty('overflow', 'visible', 'important');
            icon.style.setProperty('clip', 'auto', 'important');
            icon.style.setProperty('clip-path', 'none', 'important');

            // Aplicar conteúdo específico baseado na posição
            let content = '';
            if (index === 0 || index === 1) {
                content = '\\f019'; // fa-download
            } else if (index === 2) {
                content = '\\f1d8'; // fa-paper-plane
            }

            if (content) {
                icon.style.setProperty('content', `"${content}"`, 'important');
                console.log(`📄 Aplicado conteúdo específico: ${content} para botão ${index + 1}`);
            }

            console.log(`✅ Estilos aplicados ao ícone de botão ${index + 1} com cor branca`);
        });

        // Forçar ícones das ações
        const actionIcons = document.querySelectorAll('.action-item .action-icon i');
        actionIcons.forEach((icon, index) => {
            console.log(`🎨 Aplicando estilos forçados ao ícone de ação ${index + 1}:`, icon.className);

            // Aplicar estilos básicos
            icon.style.setProperty('font-size', '1.25rem', 'important');
            icon.style.setProperty('color', 'white', 'important');
            icon.style.setProperty('font-weight', 'bold', 'important');
            icon.style.setProperty('display', 'inline-block', 'important');
            icon.style.setProperty('visibility', 'visible', 'important');
            icon.style.setProperty('opacity', '1', 'important');
            icon.style.setProperty('font-family', '"Font Awesome 5 Free"', 'important');
            icon.style.setProperty('font-style', 'normal', 'important');
            icon.style.setProperty('font-variant', 'normal', 'important');
            icon.style.setProperty('text-rendering', 'auto', 'important');
            icon.style.setProperty('-webkit-font-smoothing', 'antialiased', 'important');
            icon.style.setProperty('position', 'static', 'important');
            icon.style.setProperty('background', 'none', 'important');
            icon.style.setProperty('background-image', 'none', 'important');
            icon.style.setProperty('border', 'none', 'important');
            icon.style.setProperty('outline', 'none', 'important');
            icon.style.setProperty('box-shadow', 'none', 'important');
            icon.style.setProperty('transform', 'none', 'important');
            icon.style.setProperty('animation', 'none', 'important');
            icon.style.setProperty('z-index', 'auto', 'important');
            icon.style.setProperty('content', '""', 'important');
            icon.style.setProperty('line-height', '1', 'important');
            icon.style.setProperty('vertical-align', 'middle', 'important');
            icon.style.setProperty('text-align', 'center', 'important');
            icon.style.setProperty('width', 'auto', 'important');
            icon.style.setProperty('height', 'auto', 'important');
            icon.style.setProperty('min-width', 'auto', 'important');
            icon.style.setProperty('min-height', 'auto', 'important');
            icon.style.setProperty('max-width', 'none', 'important');
            icon.style.setProperty('max-height', 'none', 'important');
            icon.style.setProperty('margin', '0', 'important');
            icon.style.setProperty('padding', '0', 'important');
            icon.style.setProperty('overflow', 'visible', 'important');
            icon.style.setProperty('clip', 'auto', 'important');
            icon.style.setProperty('clip-path', 'none', 'important');

            // Aplicar conteúdo específico baseado na posição
            let content = '';
            if (index === 0) {
                content = '\\f044'; // fa-edit
            } else if (index === 1) {
                content = '\\f0c5'; // fa-copy
            } else if (index === 2) {
                content = '\\f1f8'; // fa-trash - TROCADO DE fa-times PARA fa-trash
            }

            if (content) {
                icon.style.setProperty('content', `"${content}"`, 'important');
                console.log(`📄 Aplicado conteúdo específico: ${content} para ação ${index + 1}`);
            }

            console.log(`✅ Estilos aplicados ao ícone de ação ${index + 1}`);
        });

        console.log('✅ Ícones de documentos e ações forçados via inline!');
    }

    // MÉTODO RADICAL: FORÇAR CRIAÇÃO DOS ÍCONES
    forceRadicalIconCreation() {
        console.log('🚀 Aplicando correção radical para ícones...');

        // Forçar criação dos ícones de documentos
        const documentItems = document.querySelectorAll('.document-item');
        documentItems.forEach((item, index) => {
            const iconContainer = item.querySelector('.document-icon');
            if (iconContainer) {
                // Remover qualquer ícone existente
                const existingIcon = iconContainer.querySelector('i');
                if (existingIcon) {
                    existingIcon.remove();
                }

                // Criar novo ícone
                const newIcon = document.createElement('i');
                newIcon.className = 'fas';

                // Definir ícone específico baseado na posição
                if (index === 0) {
                    newIcon.className = 'fas fa-file-pdf';
                } else if (index === 1) {
                    newIcon.className = 'fas fa-receipt';
                } else if (index === 2) {
                    newIcon.className = 'fas fa-envelope';
                }

                // Aplicar estilos forçados
                newIcon.style.setProperty('font-size', '1.25rem', 'important');
                newIcon.style.setProperty('color', 'white', 'important');
                newIcon.style.setProperty('font-weight', 'bold', 'important');
                newIcon.style.setProperty('display', 'inline-block', 'important');
                newIcon.style.setProperty('visibility', 'visible', 'important');
                newIcon.style.setProperty('opacity', '1', 'important');
                newIcon.style.setProperty('font-family', '"Font Awesome 5 Free"', 'important');
                newIcon.style.setProperty('font-style', 'normal', 'important');
                newIcon.style.setProperty('text-rendering', 'auto', 'important');
                newIcon.style.setProperty('-webkit-font-smoothing', 'antialiased', 'important');

                // Adicionar ao container
                iconContainer.appendChild(newIcon);
                console.log(`✅ Ícone de documento ${index + 1} criado radicalmente`);
            }
        });

        // Forçar criação dos ícones dos botões
        const documentButtons = document.querySelectorAll('.document-item .btn');
        documentButtons.forEach((button, index) => {
            const existingIcon = button.querySelector('i');
            if (existingIcon) {
                existingIcon.remove();
            }

            // Criar novo ícone
            const newIcon = document.createElement('i');
            if (index === 0 || index === 1) {
                newIcon.className = 'fas fa-download';
            } else if (index === 2) {
                newIcon.className = 'fas fa-paper-plane';
            }

            // Aplicar estilos forçados
            newIcon.style.setProperty('font-size', '0.875rem', 'important');
            newIcon.style.setProperty('color', 'white', 'important');
            newIcon.style.setProperty('font-weight', 'normal', 'important');
            newIcon.style.setProperty('display', 'inline-block', 'important');
            newIcon.style.setProperty('visibility', 'visible', 'important');
            newIcon.style.setProperty('opacity', '1', 'important');
            newIcon.style.setProperty('font-family', '"Font Awesome 5 Free"', 'important');
            newIcon.style.setProperty('font-style', 'normal', 'important');
            newIcon.style.setProperty('text-rendering', 'auto', 'important');
            newIcon.style.setProperty('-webkit-font-smoothing', 'antialiased', 'important');

            // Adicionar ao botão
            button.prepend(newIcon);
            console.log(`✅ Ícone de botão ${index + 1} criado radicalmente`);
        });

        // Forçar criação dos ícones de ações
        const actionItems = document.querySelectorAll('.action-item');
        actionItems.forEach((item, index) => {
            const iconContainer = item.querySelector('.action-icon');
            if (iconContainer) {
                // Remover qualquer ícone existente
                const existingIcon = iconContainer.querySelector('i');
                if (existingIcon) {
                    existingIcon.remove();
                }

                // Criar novo ícone
                const newIcon = document.createElement('i');

                // Definir ícone específico baseado na posição
                if (index === 0) {
                    newIcon.className = 'fas fa-edit';
                } else if (index === 1) {
                    newIcon.className = 'fas fa-copy';
                } else if (index === 2) {
                    newIcon.className = 'fas fa-trash'; // TROCADO DE fa-times PARA fa-trash
                }

                // Aplicar estilos forçados
                newIcon.style.setProperty('font-size', '1.25rem', 'important');
                newIcon.style.setProperty('color', 'white', 'important');
                newIcon.style.setProperty('font-weight', 'bold', 'important');
                newIcon.style.setProperty('display', 'inline-block', 'important');
                newIcon.style.setProperty('visibility', 'visible', 'important');
                newIcon.style.setProperty('opacity', '1', 'important');
                newIcon.style.setProperty('font-family', '"Font Awesome 5 Free"', 'important');
                newIcon.style.setProperty('font-style', 'normal', 'important');
                newIcon.style.setProperty('text-rendering', 'auto', 'important');
                newIcon.style.setProperty('-webkit-font-smoothing', 'antialiased', 'important');

                // Adicionar ao container
                iconContainer.appendChild(newIcon);
                console.log(`✅ Ícone de ação ${index + 1} criado radicalmente`);
            }
        });

        console.log('🚀 Correção radical aplicada com sucesso!');
    }

    // MÉTODO: FORÇAR EFEITOS HOVER VIA JAVASCRIPT PARA TODOS OS ELEMENTOS
    forceHoverEffects() {
        console.log('🎨 Aplicando efeitos hover forçados para todos os elementos...');

        // Forçar efeitos hover nos ícones de documentos
        const documentItems = document.querySelectorAll('.document-item');
        documentItems.forEach((item, index) => {
            const iconContainer = item.querySelector('.document-icon');
            const icon = iconContainer?.querySelector('i');

            if (iconContainer && icon) {
                // Adicionar evento mouseenter
                item.addEventListener('mouseenter', () => {
                    console.log(`🎨 Aplicando hover no documento ${index + 1}`);

                    // Aplicar estilos de hover ao container
                    iconContainer.style.setProperty('background', 'linear-gradient(135deg, #1d4ed8, #1e40af)', 'important');
                    iconContainer.style.setProperty('box-shadow', '0 4px 12px rgba(37, 99, 235, 0.4)', 'important');
                    iconContainer.style.setProperty('transform', 'translateY(-2px)', 'important');
                    iconContainer.style.setProperty('transition', 'all 0.3s ease', 'important');

                    // Aplicar estilos de hover ao ícone
                    icon.style.setProperty('color', 'white', 'important');
                    icon.style.setProperty('transform', 'scale(1.1)', 'important');
                    icon.style.setProperty('transition', 'all 0.3s ease', 'important');
                });

                // Adicionar evento mouseleave
                item.addEventListener('mouseleave', () => {
                    console.log(`🎨 Removendo hover do documento ${index + 1}`);

                    // Restaurar estilos originais do container
                    iconContainer.style.setProperty('background', 'linear-gradient(135deg, #2563eb, #1d4ed8)', 'important');
                    iconContainer.style.setProperty('box-shadow', '0 2px 8px rgba(37, 99, 235, 0.3)', 'important');
                    iconContainer.style.setProperty('transform', 'translateY(0)', 'important');
                    iconContainer.style.setProperty('transition', 'all 0.3s ease', 'important');

                    // Restaurar estilos originais do ícone
                    icon.style.setProperty('color', 'white', 'important');
                    icon.style.setProperty('transform', 'scale(1)', 'important');
                    icon.style.setProperty('transition', 'all 0.3s ease', 'important');
                });
            }
        });

        // Forçar efeitos hover nos ícones de ações
        const actionItems = document.querySelectorAll('.action-item');
        actionItems.forEach((item, index) => {
            const iconContainer = item.querySelector('.action-icon');
            const icon = iconContainer?.querySelector('i');

            if (iconContainer && icon) {
                // Adicionar evento mouseenter
                item.addEventListener('mouseenter', () => {
                    console.log(`🎨 Aplicando hover na ação ${index + 1}`);

                    // Verificar se é ação de perigo
                    const isDanger = item.classList.contains('danger');

                    if (isDanger) {
                        // Aplicar estilos de hover vermelho ao container
                        iconContainer.style.setProperty('background', 'linear-gradient(135deg, #b91c1c, #991b1b)', 'important');
                        iconContainer.style.setProperty('box-shadow', '0 4px 12px rgba(220, 38, 38, 0.4)', 'important');
                    } else {
                        // Aplicar estilos de hover azul ao container
                        iconContainer.style.setProperty('background', 'linear-gradient(135deg, #1d4ed8, #1e40af)', 'important');
                        iconContainer.style.setProperty('box-shadow', '0 4px 12px rgba(37, 99, 235, 0.4)', 'important');
                    }

                    iconContainer.style.setProperty('transform', 'translateY(-2px)', 'important');
                    iconContainer.style.setProperty('transition', 'all 0.3s ease', 'important');

                    // Aplicar estilos de hover ao ícone
                    icon.style.setProperty('color', 'white', 'important');
                    icon.style.setProperty('transform', 'scale(1.1)', 'important');
                    icon.style.setProperty('transition', 'all 0.3s ease', 'important');
                });

                // Adicionar evento mouseleave
                item.addEventListener('mouseleave', () => {
                    console.log(`🎨 Removendo hover da ação ${index + 1}`);

                    // Verificar se é ação de perigo
                    const isDanger = item.classList.contains('danger');

                    if (isDanger) {
                        // Restaurar estilos originais vermelhos do container
                        iconContainer.style.setProperty('background', 'linear-gradient(135deg, #dc2626, #b91c1c)', 'important');
                        iconContainer.style.setProperty('box-shadow', '0 2px 8px rgba(220, 38, 38, 0.3)', 'important');
                    } else {
                        // Restaurar estilos originais azuis do container
                        iconContainer.style.setProperty('background', 'linear-gradient(135deg, #2563eb, #1d4ed8)', 'important');
                        iconContainer.style.setProperty('box-shadow', '0 2px 8px rgba(37, 99, 235, 0.3)', 'important');
                    }

                    iconContainer.style.setProperty('transform', 'translateY(0)', 'important');
                    iconContainer.style.setProperty('transition', 'all 0.3s ease', 'important');

                    // Restaurar estilos originais do ícone
                    icon.style.setProperty('color', 'white', 'important');
                    icon.style.setProperty('transform', 'scale(1)', 'important');
                    icon.style.setProperty('transition', 'all 0.3s ease', 'important');
                });
            }
        });

        // Forçar efeitos hover nos botões de documentos
        const documentButtons = document.querySelectorAll('.document-item .btn');
        documentButtons.forEach((button, index) => {
            const icon = button.querySelector('i');

            if (icon) {
                // Adicionar evento mouseenter
                button.addEventListener('mouseenter', () => {
                    console.log(`🎨 Aplicando hover no botão de documento ${index + 1}`);

                    // Aplicar estilos de hover ao botão
                    button.style.setProperty('background', 'linear-gradient(135deg, #1d4ed8, #1e40af)', 'important');
                    button.style.setProperty('border-color', '#1d4ed8', 'important');
                    button.style.setProperty('box-shadow', '0 4px 12px rgba(37, 99, 235, 0.3)', 'important');
                    button.style.setProperty('transform', 'translateY(-1px)', 'important');
                    button.style.setProperty('transition', 'all 0.3s ease', 'important');
                    button.style.setProperty('color', 'white', 'important');

                    // Aplicar estilos de hover ao ícone
                    icon.style.setProperty('color', 'white', 'important');
                    icon.style.setProperty('transform', 'scale(1.05)', 'important');
                    icon.style.setProperty('transition', 'all 0.3s ease', 'important');
                });

                // Adicionar evento mouseleave
                button.addEventListener('mouseleave', () => {
                    console.log(`🎨 Removendo hover do botão de documento ${index + 1}`);

                    // Restaurar estilos originais do botão
                    button.style.setProperty('background', '', 'important');
                    button.style.setProperty('border-color', '', 'important');
                    button.style.setProperty('box-shadow', '', 'important');
                    button.style.setProperty('transform', 'translateY(0)', 'important');
                    button.style.setProperty('transition', 'all 0.3s ease', 'important');
                    button.style.setProperty('color', '', 'important');

                    // Restaurar estilos originais do ícone
                    icon.style.setProperty('color', 'white', 'important');
                    icon.style.setProperty('transform', 'scale(1)', 'important');
                    icon.style.setProperty('transition', 'all 0.3s ease', 'important');
                });
            }
        });

        // Forçar efeitos hover nos botões de ações
        const actionButtons = document.querySelectorAll('.action-item .btn');
        actionButtons.forEach((button, index) => {
            const icon = button.querySelector('i');

            if (icon) {
                // Adicionar evento mouseenter
                button.addEventListener('mouseenter', () => {
                    console.log(`🎨 Aplicando hover no botão de ação ${index + 1}`);

                    // Verificar se é botão de perigo
                    const isDanger = button.classList.contains('btn-danger');

                    if (isDanger) {
                        // Aplicar estilos de hover vermelho ao botão
                        button.style.setProperty('background', 'linear-gradient(135deg, #dc2626, #b91c1c)', 'important');
                        button.style.setProperty('border-color', '#dc2626', 'important');
                        button.style.setProperty('box-shadow', '0 4px 12px rgba(220, 38, 38, 0.3)', 'important');
                    } else {
                        // Aplicar estilos de hover padrão ao botão
                        button.style.setProperty('box-shadow', '0 4px 8px rgba(0, 0, 0, 0.15)', 'important');
                    }

                    button.style.setProperty('transform', 'translateY(-1px)', 'important');
                    button.style.setProperty('transition', 'all 0.3s ease', 'important');

                    // Aplicar estilos de hover ao ícone
                    if (icon) {
                        icon.style.setProperty('transform', 'scale(1.05)', 'important');
                        icon.style.setProperty('transition', 'all 0.3s ease', 'important');
                    }
                });

                // Adicionar evento mouseleave
                button.addEventListener('mouseleave', () => {
                    console.log(`🎨 Removendo hover do botão de ação ${index + 1}`);

                    // Restaurar estilos originais do botão
                    button.style.setProperty('background', '', 'important');
                    button.style.setProperty('border-color', '', 'important');
                    button.style.setProperty('box-shadow', '', 'important');
                    button.style.setProperty('transform', 'translateY(0)', 'important');
                    button.style.setProperty('transition', 'all 0.3s ease', 'important');

                    // Restaurar estilos originais do ícone
                    if (icon) {
                        icon.style.setProperty('transform', 'scale(1)', 'important');
                        icon.style.setProperty('transition', 'all 0.3s ease', 'important');
                    }
                });
            }
        });

        console.log('✅ Efeitos hover forçados aplicados para todos os elementos via JavaScript!');
    }

    async confirmEditVenda(vendaId) {
        console.log('✅ Confirmando edição da venda:', vendaId);

        try {
            // Validar se o modal está aberto
            const modal = document.querySelector('.modal.show');
            if (!modal) {
                throw new Error('Modal de edição não está aberto');
            }

            // Validar formulário
            const validation = this.validateEditForm();
            if (!validation.isValid) {
                throw new Error(validation.errors.join('\n'));
            }

            // Calcular totais
            const totais = this.calculateEditTotals();

            // Extrair dados do formulário
            const form = document.getElementById('edit-venda-form');
            const formData = new FormData(form);
            const cliente_id = parseInt(formData.get('cliente_id'));
            const observacoes = formData.get('observacoes') || '';

            // Extrair itens
            const itens = [];
            const itemRows = document.querySelectorAll('.venda-item-row');

            itemRows.forEach((row) => {
                const produto_id = parseInt(row.querySelector('select[name="produto_id"]').value);
                const quantidade = parseInt(row.querySelector('input[name="quantidade"]').value);
                const preco_unit = parseFloat(row.querySelector('input[name="preco_unit"]').value);

                itens.push({
                    produto_id,
                    quantidade,
                    preco_unit
                });
            });

            // Mostrar confirmação com detalhes
            const confirmed = await window.UI.showConfirm({
                title: 'Confirmar Edição da Venda',
                message: `
                    <div style="text-align: left; margin: 10px 0;">
                        <p><strong>Venda #${vendaId.toString().padStart(6, '0')}</strong></p>
                        <p><strong>Itens:</strong> ${totais.totalItens}</p>
                        <p><strong>Total da Venda:</strong> ${this.formatCurrency(totais.totalVenda)}</p>
                        <p><strong>Valor Pago:</strong> ${this.formatCurrency(totais.valorPago)}</p>
                        <p><strong>Saldo Restante:</strong> ${this.formatCurrency(totais.saldoRestante)}</p>
                        <p><strong>Observações:</strong> ${observacoes || 'Nenhuma'}</p>
                    </div>
                    <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 10px; margin: 15px 0;">
                        <p style="color: #92400e; font-weight: bold; margin: 0;">
                            ⚠️ ATENÇÃO: Esta ação irá atualizar o estoque dos produtos!
                        </p>
                    </div>
                    <p style="font-weight: bold;">Tem certeza que deseja confirmar as alterações?</p>
                `,
                okText: 'Confirmar Edição',
                cancelText: 'Cancelar',
                okClass: 'btn-success',
                cancelClass: 'btn-outline'
            });

            if (confirmed) {
                console.log('✅ Usuário confirmou a edição, salvando alterações...');

                // Mostrar loading
                const confirmBtn = document.querySelector('.btn-success');
                if (confirmBtn) {
                    const originalText = confirmBtn.innerHTML;
                    confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
                    confirmBtn.disabled = true;
                }

                // Preparar dados para envio
                const vendaData = {
                    cliente_id,
                    itens,
                    observacoes
                };

                console.log('💾 Salvando alterações da venda:', vendaData);

                // Enviar para API
                const response = await window.api.put(`/api/vendas/${vendaId}`, vendaData);
                const data = response.data;

                if (data.success) {
                    // Restaurar botão
                    if (confirmBtn) {
                        confirmBtn.innerHTML = originalText;
                        confirmBtn.disabled = false;
                    }

                    this.showSuccess('Venda editada e confirmada com sucesso!');

                    // Fechar modal
                    window.UI.hideModal();

                    // Forçar atualização completa
                    await this.forceUpdateAfterEdit();

                    console.log('✅ Edição da venda confirmada com sucesso!');
                } else {
                    throw new Error(data.error || 'Erro ao confirmar edição da venda');
                }
            } else {
                console.log('❌ Usuário cancelou a confirmação');
            }

        } catch (error) {
            console.error('❌ Erro ao confirmar edição da venda:', error);

            // Restaurar botão em caso de erro
            const confirmBtn = document.querySelector('.btn-success');
            if (confirmBtn) {
                confirmBtn.innerHTML = '<i class="fas fa-check"></i> Confirmar Edição';
                confirmBtn.disabled = false;
            }

            this.showErrorWithTitle('Erro ao confirmar edição', error.message);
        }
    }

    // NOVO MÉTODO: FORÇAR BOTÃO DE CONFIRMAÇÃO
    forceConfirmButton() {
        console.log('🔧 Forçando botão de confirmação...');

        // Forçar botão de confirmação
        const confirmButton = document.querySelector('.btn-success');
        if (confirmButton) {
            console.log('✅ Botão de confirmação encontrado, aplicando estilos...');

            // Aplicar estilos via inline
            confirmButton.style.setProperty('background', 'linear-gradient(135deg, #10b981, #059669)', 'important');
            confirmButton.style.setProperty('border-color', '#059669', 'important');
            confirmButton.style.setProperty('color', 'white', 'important');
            confirmButton.style.setProperty('font-weight', '600', 'important');
            confirmButton.style.setProperty('box-shadow', '0 2px 8px rgba(16, 185, 129, 0.3)', 'important');
            confirmButton.style.setProperty('display', 'inline-block', 'important');
            confirmButton.style.setProperty('visibility', 'visible', 'important');
            confirmButton.style.setProperty('opacity', '1', 'important');
            confirmButton.style.setProperty('position', 'relative', 'important');
            confirmButton.style.setProperty('z-index', '1000', 'important');
            confirmButton.style.setProperty('min-width', '140px', 'important');
            confirmButton.style.setProperty('padding', '10px 20px', 'important');
            confirmButton.style.setProperty('font-size', '0.875rem', 'important');
            confirmButton.style.setProperty('margin', '0 5px', 'important');
            confirmButton.style.setProperty('text-align', 'center', 'important');
            confirmButton.style.setProperty('white-space', 'nowrap', 'important');
            confirmButton.style.setProperty('overflow', 'hidden', 'important');
            confirmButton.style.setProperty('text-overflow', 'ellipsis', 'important');
            confirmButton.style.setProperty('transition', 'all 0.3s ease', 'important');

            // Forçar ícone do botão
            const icon = confirmButton.querySelector('i');
            if (icon) {
                icon.style.setProperty('color', 'white', 'important');
                icon.style.setProperty('font-size', '0.875rem', 'important');
                icon.style.setProperty('margin-right', '6px', 'important');
                icon.style.setProperty('display', 'inline-block', 'important');
                icon.style.setProperty('visibility', 'visible', 'important');
                icon.style.setProperty('opacity', '1', 'important');
                icon.style.setProperty('font-family', '"Font Awesome 5 Free"', 'important');
                icon.style.setProperty('font-style', 'normal', 'important');
                icon.style.setProperty('text-rendering', 'auto', 'important');
                icon.style.setProperty('-webkit-font-smoothing', 'antialiased', 'important');
                console.log('✅ Ícone do botão de confirmação forçado');
            }

            console.log('✅ Botão de confirmação forçado com sucesso!');
        } else {
            console.log('❌ Botão de confirmação não encontrado');
        }
    }

    // NOVO MÉTODO: FORÇAR BOTÕES DO MODAL DE EDIÇÃO
    forceEditModalButtons() {
        console.log('🔧 Forçando botões do modal de edição...');

        // Aguardar um pouco para o modal ser renderizado
        setTimeout(() => {
            const modalFooter = document.querySelector('.edit-venda-modal .modal-footer');
            if (modalFooter) {
                console.log('✅ Footer do modal encontrado, verificando botões...');

                // Verificar se os botões existem
                const cancelBtn = modalFooter.querySelector('.btn-outline');
                const confirmBtn = modalFooter.querySelector('.btn-success');
                const saveBtn = modalFooter.querySelector('.btn-primary');

                console.log('📋 Botões encontrados:', {
                    cancel: !!cancelBtn,
                    confirm: !!confirmBtn,
                    save: !!saveBtn
                });

                // Forçar estilos nos botões
                [cancelBtn, confirmBtn, saveBtn].forEach(btn => {
                    if (btn) {
                        btn.style.setProperty('display', 'inline-flex', 'important');
                        btn.style.setProperty('align-items', 'center', 'important');
                        btn.style.setProperty('justify-content', 'center', 'important');
                        btn.style.setProperty('gap', '6px', 'important');
                        btn.style.setProperty('padding', '10px 20px', 'important');
                        btn.style.setProperty('font-size', '0.875rem', 'important');
                        btn.style.setProperty('font-weight', '600', 'important');
                        btn.style.setProperty('border-radius', '6px', 'important');
                        btn.style.setProperty('border', 'none', 'important');
                        btn.style.setProperty('cursor', 'pointer', 'important');
                        btn.style.setProperty('transition', 'all 0.3s ease', 'important');
                        btn.style.setProperty('text-decoration', 'none', 'important');
                        btn.style.setProperty('min-width', '120px', 'important');
                        btn.style.setProperty('visibility', 'visible', 'important');
                        btn.style.setProperty('opacity', '1', 'important');
                        btn.style.setProperty('position', 'relative', 'important');
                        btn.style.setProperty('z-index', '1000', 'important');

                        // Forçar ícone
                        const icon = btn.querySelector('i');
                        if (icon) {
                            icon.style.setProperty('font-size', '0.875rem', 'important');
                            icon.style.setProperty('color', 'inherit', 'important');
                            icon.style.setProperty('display', 'inline-block', 'important');
                            icon.style.setProperty('visibility', 'visible', 'important');
                            icon.style.setProperty('opacity', '1', 'important');
                            icon.style.setProperty('font-family', '"Font Awesome 5 Free"', 'important');
                            icon.style.setProperty('font-style', 'normal', 'important');
                            icon.style.setProperty('text-rendering', 'auto', 'important');
                            icon.style.setProperty('-webkit-font-smoothing', 'antialiased', 'important');
                        }

                        console.log('✅ Botão forçado:', btn.textContent.trim());
                    }
                });

                // Forçar estilos específicos do botão de confirmação
                if (confirmBtn) {
                    confirmBtn.style.setProperty('background', 'linear-gradient(135deg, #10b981, #059669)', 'important');
                    confirmBtn.style.setProperty('color', 'white', 'important');
                    confirmBtn.style.setProperty('box-shadow', '0 2px 8px rgba(16, 185, 129, 0.3)', 'important');
                    console.log('✅ Botão de confirmação forçado com sucesso!');
                }

                // Forçar estilos específicos do botão de salvar
                if (saveBtn) {
                    saveBtn.style.setProperty('background', 'linear-gradient(135deg, #3b82f6, #2563eb)', 'important');
                    saveBtn.style.setProperty('color', 'white', 'important');
                    saveBtn.style.setProperty('box-shadow', '0 2px 8px rgba(59, 130, 246, 0.3)', 'important');
                    console.log('✅ Botão de salvar forçado com sucesso!');
                }

                // Forçar estilos específicos do botão de cancelar
                if (cancelBtn) {
                    cancelBtn.style.setProperty('background', 'transparent', 'important');
                    cancelBtn.style.setProperty('color', '#6b7280', 'important');
                    cancelBtn.style.setProperty('border', '2px solid #d1d5db', 'important');
                    console.log('✅ Botão de cancelar forçado com sucesso!');
                }

                console.log('✅ Todos os botões do modal de edição forçados com sucesso!');
            } else {
                console.log('❌ Footer do modal não encontrado');
            }
        }, 100);
    }

    // NOVO MÉTODO: VALIDAR FORMULÁRIO DE EDIÇÃO
    validateEditForm() {
        console.log('🔍 Validando formulário de edição...');

        const errors = [];

        // Validar cliente
        const clienteSelect = document.getElementById('edit-cliente');
        if (!clienteSelect || !clienteSelect.value) {
            errors.push('Selecione um cliente');
        }

        // Validar itens
        const itemRows = document.querySelectorAll('.venda-item-row');
        if (itemRows.length === 0) {
            errors.push('Adicione pelo menos um item à venda');
        } else {
            const produtosIds = [];

            itemRows.forEach((row, index) => {
                const produtoSelect = row.querySelector('select[name="produto_id"]');
                const quantidadeInput = row.querySelector('input[name="quantidade"]');
                const precoInput = row.querySelector('input[name="preco_unit"]');

                if (!produtoSelect || !produtoSelect.value) {
                    errors.push(`Produto não selecionado no item ${index + 1}`);
                } else {
                    produtosIds.push(parseInt(produtoSelect.value));
                }

                if (!quantidadeInput || !quantidadeInput.value || parseInt(quantidadeInput.value) <= 0) {
                    errors.push(`Quantidade inválida no item ${index + 1}`);
                }

                if (!precoInput || !precoInput.value || parseFloat(precoInput.value) <= 0) {
                    errors.push(`Preço inválido no item ${index + 1}`);
                }
            });

            // Verificar produtos duplicados
            const produtosUnicos = [...new Set(produtosIds)];
            if (produtosIds.length !== produtosUnicos.length) {
                errors.push('Não é permitido produtos duplicados na mesma venda');
            }
        }

        // Validar observações (opcional)
        const observacoesTextarea = document.getElementById('edit-observacoes');
        if (observacoesTextarea && observacoesTextarea.value.length > 500) {
            errors.push('Observações não podem ter mais de 500 caracteres');
        }

        console.log('📋 Validação concluída:', errors.length === 0 ? '✅ Válido' : '❌ Erros encontrados');
        if (errors.length > 0) {
            console.log('❌ Erros:', errors);
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // NOVO MÉTODO: CALCULAR TOTAIS DO FORMULÁRIO DE EDIÇÃO
    calculateEditTotals() {
        console.log('🧮 Calculando totais do formulário de edição...');

        let totalItens = 0;
        let totalVenda = 0;

        const itemRows = document.querySelectorAll('.venda-item-row');
        itemRows.forEach((row, index) => {
            const quantidadeInput = row.querySelector('input[name="quantidade"]');
            const precoInput = row.querySelector('input[name="preco_unit"]');
            const subtotalSpan = row.querySelector('.subtotal');

            if (quantidadeInput && precoInput) {
                const quantidade = parseInt(quantidadeInput.value) || 0;
                const preco = parseFloat(precoInput.value) || 0;
                const subtotal = quantidade * preco;

                totalItens += quantidade;
                totalVenda += subtotal;

                // Atualizar subtotal na linha
                if (subtotalSpan) {
                    subtotalSpan.textContent = this.formatCurrency(subtotal);
                }

                console.log(`📦 Item ${index + 1}: ${quantidade} x ${this.formatCurrency(preco)} = ${this.formatCurrency(subtotal)}`);
            }
        });

        // Atualizar totais no resumo
        const totalItensSpan = document.getElementById('edit-total-itens');
        const totalVendaSpan = document.getElementById('edit-total-venda');
        const valorPagoSpan = document.getElementById('edit-valor-pago');
        const saldoRestanteSpan = document.getElementById('edit-saldo-restante');

        if (totalItensSpan) totalItensSpan.textContent = totalItens;
        if (totalVendaSpan) totalVendaSpan.textContent = this.formatCurrency(totalVenda);

        // Calcular saldo (assumindo que o valor pago não muda na edição)
        const valorPago = parseFloat(valorPagoSpan?.textContent?.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
        const saldoRestante = totalVenda - valorPago;

        if (saldoRestanteSpan) saldoRestanteSpan.textContent = this.formatCurrency(saldoRestante);

        console.log('💰 Totais calculados:', {
            totalItens,
            totalVenda: this.formatCurrency(totalVenda),
            valorPago: this.formatCurrency(valorPago),
            saldoRestante: this.formatCurrency(saldoRestante)
        });

        return {
            totalItens,
            totalVenda,
            valorPago,
            saldoRestante
        };
    }

    // NOVO MÉTODO: CONFIGURAR EVENTOS DOS BOTÕES DO MODAL DE EDIÇÃO - FALLBACK
    setupEditModalButtons(vendaId) {
        console.log('🔧 Configurando eventos dos botões do modal de edição...');

        // Aguardar um pouco para os botões serem renderizados
        setTimeout(() => {
            // Botão Cancelar
            const cancelBtn = document.getElementById('cancel-edit-btn');
            if (cancelBtn) {
                cancelBtn.onclick = () => {
                    console.log('❌ Cancelando edição...');
                    window.UI.hideModal();
                };
                console.log('✅ Evento do botão Cancelar configurado');
            } else {
                console.log('❌ Botão Cancelar não encontrado');
            }

            // Botão Confirmar Edição
            const confirmBtn = document.getElementById('confirm-edit-btn');
            if (confirmBtn) {
                confirmBtn.onclick = () => {
                    console.log('✅ Confirmando edição da venda:', vendaId);
                    this.confirmEditVenda(vendaId);
                };
                console.log('✅ Evento do botão Confirmar Edição configurado');
            } else {
                console.log('❌ Botão Confirmar Edição não encontrado');
            }

            // Botão Salvar Alterações
            const saveBtn = document.getElementById('save-edit-btn');
            if (saveBtn) {
                saveBtn.onclick = () => {
                    console.log('💾 Salvando alterações da venda:', vendaId);
                    this.saveEditVenda(vendaId);
                };
                console.log('✅ Evento do botão Salvar Alterações configurado');
            } else {
                console.log('❌ Botão Salvar Alterações não encontrado');
            }

            // FALLBACK: Se os eventos não funcionarem, usar onclick inline
            if (cancelBtn) {
                cancelBtn.setAttribute('onclick', 'window.UI.hideModal()');
            }
            if (confirmBtn) {
                confirmBtn.setAttribute('onclick', `window.vendasPage.confirmEditVenda(${vendaId})`);
            }
            if (saveBtn) {
                saveBtn.setAttribute('onclick', `window.vendasPage.saveEditVenda(${vendaId})`);
            }

            console.log('✅ Todos os eventos dos botões do modal de edição configurados!');
        }, 200);
    }

    // NOVO MÉTODO: FORÇAR ATUALIZAÇÃO COMPLETA APÓS EDIÇÃO
    async forceUpdateAfterEdit() {
        console.log('🔄 Forçando atualização completa após edição...');

        try {
            // Limpar cache
            this.vendas = [];
            this.filteredVendas = [];

            // Recarregar dados com cache limpo
            await this.loadVendas();
            await this.loadClientes();
            await this.loadProdutos();

            // Forçar re-renderização
            this.renderVendasTable();
            this.renderPagination();
            this.updateStats();

            // Atualizar dashboard
            this.notifyDashboardUpdate();

            console.log('✅ Atualização completa realizada com sucesso!');
        } catch (error) {
            console.error('❌ Erro ao forçar atualização:', error);
        }
    }

    // NOVO MÉTODO: VERIFICAR DADOS ATUALIZADOS
    async verifyUpdatedData(vendaId) {
        console.log('🔍 Verificando dados atualizados da venda:', vendaId);

        try {
            // Buscar dados específicos da venda
            const response = await window.api.get(`/api/vendas/${vendaId}`);

            if (response.data && response.data.success) {
                const vendaAtualizada = response.data.data;
                console.log('📊 Dados atualizados da venda:', vendaAtualizada);

                // Verificar se os dados foram realmente atualizados
                const vendaAnterior = this.vendas.find(v => v.id === vendaId);
                if (vendaAnterior) {
                    console.log('📊 Comparação de dados:');
                    console.log('Antes:', vendaAnterior);
                    console.log('Depois:', vendaAtualizada);
                }

                return vendaAtualizada;
            } else {
                console.log('❌ Erro ao buscar dados atualizados:', response.data);
                return null;
            }
        } catch (error) {
            console.error('❌ Erro ao verificar dados atualizados:', error);
            return null;
        }
    }
}

// Inicializar página quando carregar
document.addEventListener('DOMContentLoaded', () => {
    if (window.currentPage === 'vendas') {
        window.vendasPage = new VendasPage();
    }
});

// Exportar para uso global
window.VendasPage = VendasPage; 