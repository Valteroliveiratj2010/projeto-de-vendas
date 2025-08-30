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
            const response = await window.api.get('/api/vendas');
            
            if (response.data && response.data.success) {
                this.vendas = response.data.data || [];
                this.filteredVendas = [...this.vendas];
                
                console.log(`✅ ${this.vendas.length} vendas carregadas`);
                this.updateStats();
                this.renderVendasTable();
                this.renderPagination();
            } else {
                throw new Error(response.data?.error || 'Erro ao carregar vendas');
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
            const response = await window.api.get('/api/clientes?limit=all');
            
            if (response.data && response.data.success) {
                this.clientes = response.data.data || [];
            } else {
                console.warn('⚠️ Resposta da API não tem sucesso:', response.data);
                this.clientes = [];
            }
        } catch (error) {
            console.error('❌ Erro ao carregar clientes:', error);
            this.clientes = [];
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

    renderVendasTable() {
        const tbody = document.getElementById('vendas-table-body');
        if (!tbody) return;

        if (this.filteredVendas.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-state">
                        <div class="empty-icon">
                            <i class="fas fa-shopping-cart"></i>
                        </div>
                        <p>Nenhuma venda encontrada</p>
                        <button class="btn btn-primary" id="first-venda-btn">
                            Registrar Primeira Venda
                        </button>
                    </td>
                </tr>
            `;
            
            const firstVendaBtn = document.getElementById('first-venda-btn');
            if (firstVendaBtn) {
                firstVendaBtn.addEventListener('click', () => {
                    this.showNewVendaModal();
                });
            }
            
            return;
        }

        // Paginação
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageVendas = this.filteredVendas.slice(startIndex, endIndex);

        tbody.innerHTML = pageVendas.map(venda => `
            <tr data-id="${venda.id}">
                <td>#${venda.id}</td>
                <td>${this.formatDate(venda.created_at)}</td>
                <td>
                    <div class="cliente-info">
                        <strong>${venda.cliente_nome}</strong>
                        <small>${venda.cliente_telefone || ''}</small>
                    </div>
                </td>
                <td>
                    <span class="price-value">${this.formatCurrency(venda.total)}</span>
                </td>
                <td>
                    <span class="price-value">${this.formatCurrency(venda.pago || 0)}</span>
                </td>
                <td>
                    <span class="price-value ${venda.saldo > 0 ? 'text-danger' : 'text-success'}">
                        ${this.formatCurrency(venda.saldo || 0)}
                    </span>
                </td>
                <td>
                    <span class="status-badge status-${venda.status}">
                        ${this.getStatusText(venda.status)}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon btn-view" data-id="${venda.id}" data-action="view" title="Visualizar">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon btn-payment" data-id="${venda.id}" data-action="payment" title="Pagamento">
                            <i class="fas fa-credit-card"></i>
                        </button>
                        <button class="btn-icon btn-pdf" data-id="${venda.id}" data-action="pdf" title="Gerar PDF">
                            📄
                        </button>
                        <button class="btn-icon btn-edit" data-id="${venda.id}" data-action="edit" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" data-id="${venda.id}" data-action="delete" title="Cancelar">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        this.setupActionButtons();
    }

    setupActionButtons() {
        const tbody = document.getElementById('vendas-table-body');
        if (!tbody) return;
        
        // Botões de visualizar
        const viewButtons = tbody.querySelectorAll('.btn-view');
        viewButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const vendaId = parseInt(button.dataset.id);
                this.viewVenda(vendaId);
            });
        });
        
        // Botões de pagamento
        const paymentButtons = tbody.querySelectorAll('.btn-payment');
        paymentButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const vendaId = parseInt(button.dataset.id);
                this.showPaymentModal(vendaId);
            });
        });
        
        // Botões de PDF
        const pdfButtons = tbody.querySelectorAll('.btn-pdf');
        pdfButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const vendaId = parseInt(button.dataset.id);
                this.generatePDF(vendaId);
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
                await this.loadVendas();
                
                // 🔄 DISPARAR EVENTO DE ATUALIZAÇÃO AUTOMÁTICA
                this.notifyDashboardUpdate();
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
                this.showVendaDetails(venda);
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
            console.log('📄 Gerando PDF para venda:', vendaId);
            
            // Mostrar loading
            if (window.UI) {
                window.UI.showLoading('Gerando PDF...');
            }
            
            // Fazer download do PDF
            const response = await fetch(`/api/pdf/venda/${vendaId}`, {
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
                a.download = `venda-${vendaId.toString().padStart(6, '0')}.pdf`;
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
            this.showErrorWithTitle('Erro ao gerar PDF', error.message);
        } finally {
            // Esconder loading
            if (window.UI) {
                window.UI.hideLoading();
            }
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
        switch(filterType) {
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

    editVenda(id) {
        console.log('✏️ Editar venda:', id);
        // Implementar edição de venda
        this.showSuccess('Funcionalidade de edição em desenvolvimento');
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
}

// Inicializar página quando carregar
document.addEventListener('DOMContentLoaded', () => {
    if (window.currentPage === 'vendas') {
        window.vendasPage = new VendasPage();
    }
});

// Exportar para uso global
window.VendasPage = VendasPage; 