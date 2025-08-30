/**
 * Página do Dashboard - Sistema de Vendas
 */

class DashboardPage {
    constructor() {
        console.log('🚀 DashboardPage sendo inicializada...');
        this.updateListenerId = null;
        this.init();
        console.log('✅ DashboardPage inicializada com sucesso!');
    }

    async init() {
        try {
            // ✅ MARCAR COMO INICIALIZANDO
            this._initializing = true;
            console.log('🚀 Inicializando DashboardPage...');
            
            // ❌ REMOVIDO: Chamada de cleanup() durante init() - causa erro!
            // O cleanup deve ser chamado APENAS quando a instância for destruída
            
            // ✅ RESETAR ESTADO INTERNO
            this.lastPaymentIds = new Set();
            this.estoqueMonitoringInterval = null;
            this.dashboardStatsInterval = null;
            this.estoqueInterval = null;
            this.paymentPollingInterval = null;
            this.hasError = false;
            this.initializationTime = Date.now();
            
            // ✅ RESETAR ESTADO DE PAGINAÇÃO
            this.paginationState = {
                currentLimit: this.constructor.PAGINATION_CONFIG.INITIAL_LIMIT,
                totalActivities: 0,
                isExpanded: false,
                isLoading: false
            };
            
            console.log('🔄 Estado interno resetado');
            
            // ✅ CARREGAR DADOS SEQUENCIALMENTE (EVITAR CONCORRÊNCIA)
            console.log('📊 Carregando dados sequencialmente...');
            
            // 1. Primeiro: Atividades recentes
            await this.loadRecentActivities();
            console.log('✅ Atividades carregadas');
            
            // 2. Segundo: Estatísticas do dashboard
            await this.loadDashboardStats();
            console.log('✅ Estatísticas carregadas');
            
            // 3. Terceiro: Alertas de estoque
            await this.loadEstoqueAlerts();
            console.log('✅ Alertas de estoque carregados');
            
            // Configurar listeners de atualização
            this.setupUpdateListeners();
            
            // ✅ INICIAR MONITORAMENTO AUTOMÁTICO DO ESTOQUE
            this.startEstoqueMonitoring();
            
            // ✅ MARCAR COMO INICIALIZADA
            this._initialized = true;
            this._initializing = false;
            
            console.log('✅ DashboardPage inicializada com sucesso!');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar DashboardPage:', error);
            this.hasError = true;
            this._initializing = false;
            throw error;
        }
    }
    
    // ✅ VERIFICAR SE ESTÁ INICIALIZADA
    isInitialized() {
        return this._initialized === true && !this.hasError;
    }
    
    // ✅ VERIFICAR SE ESTÁ ATIVA
    isActive() {
        return this.isInitialized() && 
               (Date.now() - this.initializationTime) < (30 * 60 * 1000); // 30 minutos
    }

    async loadDashboardStats() {
        try {
            // ✅ VERIFICAR SE JÁ ESTÁ CARREGANDO
            if (this.constructor.loadDebounceTimers.get('loadDashboardStats')) {
                console.log('⚠️ Carregamento de estatísticas já em andamento, aguardando...');
                return;
            }
            
            // ✅ ATIVAR DEBOUNCE
            const debounceTimer = setTimeout(() => {
                this.constructor.loadDebounceTimers.delete('loadDashboardStats');
            }, 1000);
            this.constructor.loadDebounceTimers.set('loadDashboardStats', debounceTimer);
            
            console.log('📊 Carregando estatísticas do dashboard...');
            
            // Carregar estatísticas
            const stats = await window.api.get('/api/relatorios/dashboard');
            if (stats.data && stats.data.success) {
                this.updateDashboardStats(stats.data.data);
                console.log('✅ Estatísticas carregadas com sucesso');
            }
        } catch (error) {
            console.error('❌ Erro ao carregar estatísticas do dashboard:', error);
        } finally {
            // ✅ SEMPRE LIMPAR DEBOUNCE
            this.constructor.loadDebounceTimers.delete('loadDashboardStats');
        }
    }
    
    async loadDashboardData() {
        try {
            // Carregar estatísticas
            await this.loadDashboardStats();
            
            // Carregar alertas de estoque baixo
            await this.loadEstoqueAlerts();
            
            // Carregar atividades recentes
            await this.loadRecentActivities();
            
        } catch (error) {
            console.error('❌ Erro ao carregar dados do dashboard:', error);
        }
    }

    updateDashboardStats(data) {
        const { estatisticas } = data;
        
        // Atualizar contadores
        const totalClientes = document.getElementById('total-clientes');
        const totalProdutos = document.getElementById('total-produtos');
        const totalVendas = document.getElementById('total-vendas');
        const orcamentosAtivos = document.getElementById('orcamentos-ativos');
        
        if (totalClientes) totalClientes.textContent = estatisticas.total_clientes || 0;
        if (totalProdutos) totalProdutos.textContent = estatisticas.total_produtos || 0;
        if (totalVendas) totalVendas.textContent = estatisticas.total_vendas || 0;
        if (orcamentosAtivos) orcamentosAtivos.textContent = estatisticas.orcamentos_ativos || 0;
        
        // Atualizar estatísticas de orçamentos por status
        const orcamentosAprovados = document.getElementById('orcamentos-aprovados');
        const orcamentosConvertidos = document.getElementById('orcamentos-convertidos');
        const orcamentosExpirados = document.getElementById('orcamentos-expirados');
        
        if (orcamentosAprovados) orcamentosAprovados.textContent = estatisticas.orcamentos_aprovados || 0;
        if (orcamentosConvertidos) orcamentosConvertidos.textContent = estatisticas.orcamentos_convertidos || 0;
        if (orcamentosExpirados) orcamentosExpirados.textContent = estatisticas.orcamentos_expirados || 0;
        
        // Atualizar valores financeiros
        const valorTotalVendas = document.getElementById('valor-total-vendas');
        const valorTotalPago = document.getElementById('valor-total-pago');
        const valorTotalDevido = document.getElementById('valor-total-devido');
        
        if (valorTotalVendas) valorTotalVendas.textContent = this.formatCurrency(estatisticas.valor_total_vendas || 0);
        if (valorTotalPago) valorTotalPago.textContent = this.formatCurrency(estatisticas.valor_total_pago || 0);
        if (valorTotalDevido) valorTotalDevido.textContent = this.formatCurrency(estatisticas.valor_total_devido || 0);
    }

    // ✅ SISTEMA DE DEBOUNCE PARA EVITAR CHAMADAS SIMULTÂNEAS
    static loadDebounceTimers = new Map();
    
    // ✅ CONFIGURAÇÕES DE PAGINAÇÃO
    static PAGINATION_CONFIG = {
        INITIAL_LIMIT: 5,        // Primeira carga: 5 itens
        LOAD_MORE_LIMIT: 5,      // Carregar mais: 5 itens
        MAX_VISIBLE: 20,         // Máximo visível antes de scroll
        AUTO_COLLAPSE: true      // Recolher automaticamente após navegação
    };
    
    // ✅ ESTADO DE PAGINAÇÃO
    paginationState = {
        currentLimit: 5,
        totalActivities: 0,
        isExpanded: false,
        isLoading: false
    };
    
    async loadRecentActivities() {
        try {
            // ✅ VERIFICAR SE JÁ ESTÁ CARREGANDO
            if (this.constructor.loadDebounceTimers.get('loadRecentActivities')) {
                console.log('⚠️ Carregamento de atividades já em andamento, aguardando...');
                return;
            }
            
            // ✅ ATIVAR DEBOUNCE
            const debounceTimer = setTimeout(() => {
                this.constructor.loadDebounceTimers.delete('loadRecentActivities');
            }, 1000);
            this.constructor.loadDebounceTimers.set('loadRecentActivities', debounceTimer);
            
            console.log('🔍 Iniciando carregamento de atividades recentes...');
            
            const activityList = document.getElementById('activity-list');
            if (!activityList) {
                console.error('❌ Container activity-list não encontrado!');
                return;
            }
            
            console.log('✅ Container activity-list encontrado:', activityList);
            
            // ✅ MOSTRAR LOADING IMEDIATAMENTE
            activityList.innerHTML = `
                <div class="activity-item loading">
                    <div class="activity-icon">
                        <i class="fas fa-spinner fa-spin"></i>
                    </div>
                    <div class="activity-content">
                        <p>Carregando atividades...</p>
                        <span class="activity-time">Agora</span>
                    </div>
                </div>
            `;
            
            console.log('🔄 Buscando atividades recentes...');
            
            // Buscar atividades recentes
            const activities = await this.getRecentActivities();
            
            console.log('📊 Atividades encontradas:', activities);
            
            // ✅ LIMPAR E ADICIONAR ATIVIDADES IMEDIATAMENTE
            activityList.innerHTML = '';
            
            if (activities.length === 0) {
                console.log('ℹ️ Nenhuma atividade encontrada');
                activityList.innerHTML = `
                    <div class="activity-item">
                        <div class="activity-icon">
                            <i class="fas fa-info-circle"></i>
                        </div>
                        <div class="activity-content">
                            <p>Nenhuma atividade recente</p>
                            <span class="activity-time">Agora</span>
                        </div>
                    </div>
                `;
                return;
            }
            
            console.log(`🎯 Adicionando ${activities.length} atividades...`);
            
            // ✅ ADICIONAR ATIVIDADES COM ANIMAÇÃO
            activities.forEach((activity, index) => {
                console.log(`➕ Criando elemento para atividade ${index + 1}:`, activity);
                
                const activityElement = this.createActivityElement(activity);
                
                // Adicionar classe para animação
                if (activity.type === 'pagamento') {
                    activityElement.classList.add('new');
                    console.log(`💰 Pagamento detectado: ${activity.text}`);
                }
                
                // Adicionar com pequeno delay para animação
                setTimeout(() => {
                    activityList.appendChild(activityElement);
                    console.log(`✅ Atividade ${index + 1} adicionada ao DOM`);
                }, index * 50); // 50ms entre cada atividade
            });
            
            // ✅ ADICIONAR CONTROLES DE PAGINAÇÃO
            this.addPaginationControls(activityList);
            
            console.log(`✅ ${activities.length} atividades carregadas com sucesso`);
            
        } catch (error) {
            console.error('❌ Erro ao carregar atividades:', error);
            
            // ✅ MOSTRAR MENSAGEM DE ERRO AMIGÁVEL
            const activityList = document.getElementById('activity-list');
            if (activityList) {
                activityList.innerHTML = `
                    <div class="activity-item error">
                        <div class="activity-icon">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div class="activity-content">
                            <p>Erro ao carregar atividades</p>
                            <span class="activity-time">Tente novamente</span>
                        </div>
                    </div>
                `;
            }
        } finally {
            // ✅ SEMPRE LIMPAR DEBOUNCE
            this.constructor.loadDebounceTimers.delete('loadRecentActivities');
        }
    }
    
    // ✅ ADICIONAR CONTROLES DE PAGINAÇÃO
    addPaginationControls(activityList) {
        try {
            // Remover controles existentes
            const existingControls = activityList.querySelector('.pagination-controls');
            if (existingControls) {
                existingControls.remove();
            }
            
            // Criar controles de paginação
            const controlsContainer = document.createElement('div');
            controlsContainer.className = 'pagination-controls';
            
            const totalActivities = this.paginationState.totalActivities;
            const currentLimit = this.paginationState.currentLimit;
            const hasMore = totalActivities > currentLimit;
            
            if (hasMore) {
                // Botão "Ver Mais"
                const loadMoreBtn = document.createElement('button');
                loadMoreBtn.className = 'pagination-btn load-more-btn';
                loadMoreBtn.innerHTML = `
                    <i class="fas fa-plus"></i>
                    Ver Mais (${Math.min(this.constructor.PAGINATION_CONFIG.LOAD_MORE_LIMIT, totalActivities - currentLimit)})
                `;
                loadMoreBtn.onclick = () => this.loadMoreActivities();
                
                // Botão "Ver Todos"
                const expandAllBtn = document.createElement('button');
                expandAllBtn.className = 'pagination-btn expand-all-btn';
                expandAllBtn.innerHTML = `
                    <i class="fas fa-expand-alt"></i>
                    Ver Todos (${totalActivities})
                `;
                expandAllBtn.onclick = () => this.expandAllActivities();
                
                controlsContainer.appendChild(loadMoreBtn);
                controlsContainer.appendChild(expandAllBtn);
                
            } else if (totalActivities > this.constructor.PAGINATION_CONFIG.INITIAL_LIMIT) {
                // Botão "Recolher" quando expandido
                const collapseBtn = document.createElement('button');
                collapseBtn.className = 'pagination-btn collapse-btn';
                collapseBtn.innerHTML = `
                    <i class="fas fa-compress-alt"></i>
                    Recolher
                `;
                collapseBtn.onclick = () => this.collapseActivities();
                
                controlsContainer.appendChild(collapseBtn);
            }
            
            // Adicionar controles ao final da lista
            if (controlsContainer.children.length > 0) {
                activityList.appendChild(controlsContainer);
                console.log('✅ Controles de paginação adicionados');
            }
            
        } catch (error) {
            console.error('❌ Erro ao adicionar controles de paginação:', error);
        }
    }
    
    // ✅ CARREGAR MAIS ATIVIDADES
    async loadMoreActivities() {
        try {
            if (this.paginationState.isLoading) {
                console.log('⚠️ Já está carregando mais atividades...');
                return;
            }
            
            this.paginationState.isLoading = true;
            console.log('🔄 Carregando mais atividades...');
            
            // Calcular novo limite
            const newLimit = Math.min(
                this.paginationState.currentLimit + this.constructor.PAGINATION_CONFIG.LOAD_MORE_LIMIT,
                this.paginationState.totalActivities
            );
            
            // Buscar atividades com novo limite
            const activities = await this.getRecentActivities(newLimit);
            
            // Atualizar estado
            this.paginationState.currentLimit = newLimit;
            
            // Recarregar lista completa
            await this.loadRecentActivities();
            
            console.log(`✅ ${newLimit} atividades carregadas`);
            
        } catch (error) {
            console.error('❌ Erro ao carregar mais atividades:', error);
        } finally {
            this.paginationState.isLoading = false;
        }
    }
    
    // ✅ EXPANDIR TODAS AS ATIVIDADES
    async expandAllActivities() {
        try {
            if (this.paginationState.isLoading) {
                console.log('⚠️ Já está carregando...');
                return;
            }
            
            this.paginationState.isLoading = true;
            console.log('🔄 Expandindo todas as atividades...');
            
            // Expandir para mostrar todas
            const activities = await this.getRecentActivities(this.paginationState.totalActivities);
            
            // Atualizar estado
            this.paginationState.currentLimit = this.paginationState.totalActivities;
            this.paginationState.isExpanded = true;
            
            // Recarregar lista completa
            await this.loadRecentActivities();
            
            console.log(`✅ Todas as ${this.paginationState.totalActivities} atividades expandidas`);
            
        } catch (error) {
            console.error('❌ Erro ao expandir atividades:', error);
        } finally {
            this.paginationState.isLoading = false;
        }
    }
    
    // ✅ RECOLHER ATIVIDADES
    async collapseActivities() {
        try {
            if (this.paginationState.isLoading) {
                console.log('⚠️ Já está carregando...');
                return;
            }
            
            this.paginationState.isLoading = true;
            console.log('🔄 Recolhendo atividades...');
            
            // Voltar ao limite inicial
            const activities = await this.getRecentActivities(this.constructor.PAGINATION_CONFIG.INITIAL_LIMIT);
            
            // Atualizar estado
            this.paginationState.currentLimit = this.constructor.PAGINATION_CONFIG.INITIAL_LIMIT;
            this.paginationState.isExpanded = false;
            
            // Recarregar lista completa
            await this.loadRecentActivities();
            
            console.log(`✅ Atividades recolhidas para ${this.constructor.PAGINATION_CONFIG.INITIAL_LIMIT} itens`);
            
        } catch (error) {
            console.error('❌ Erro ao recolher atividades:', error);
        } finally {
            this.paginationState.isLoading = false;
        }
    }

    // Carregar alertas de estoque baixo
    async loadEstoqueAlerts() {
        try {
            // ✅ VERIFICAR SE JÁ ESTÁ CARREGANDO
            if (this.constructor.loadDebounceTimers.get('loadEstoqueAlerts')) {
                console.log('⚠️ Carregamento de alertas de estoque já em andamento, aguardando...');
                return;
            }
            
            // ✅ ATIVAR DEBOUNCE
            const debounceTimer = setTimeout(() => {
                this.constructor.loadDebounceTimers.delete('loadEstoqueAlerts');
            }, 1000);
            this.constructor.loadDebounceTimers.set('loadEstoqueAlerts', debounceTimer);
            
            console.log('🔍 Carregando alertas de estoque...');
            const estoqueAlertsContainer = document.getElementById('estoque-alerts');
            if (!estoqueAlertsContainer) {
                console.log('❌ Container estoque-alerts não encontrado');
                return;
            }

            console.log('✅ Container estoque-alerts encontrado, fazendo requisição...');
            
            // Buscar produtos com estoque baixo
            const response = await window.api.get('/api/produtos/estoque/baixo?limite=10');
            
            console.log('📡 Resposta da API:', response);
            
            if (response.data && response.data.success) {
                const produtosEstoqueBaixo = response.data.data;
                console.log('📦 Produtos com estoque baixo:', produtosEstoqueBaixo);
                
                if (produtosEstoqueBaixo.length === 0) {
                    console.log('ℹ️ Nenhum produto com estoque baixo encontrado');
                    estoqueAlertsContainer.innerHTML = `
                        <div class="estoque-alert success" style="background: #d1fae5; border-color: #10b981;">
                            <div class="estoque-alert-header">
                                <div class="estoque-alert-icon" style="background: #10b981;">
                                    <i class="fas fa-check-circle"></i>
                                </div>
                                <h3 class="estoque-alert-title">✅ Estoque em Dia</h3>
                            </div>
                            <div class="estoque-alert-content">
                                <p>Todos os produtos têm estoque adequado!</p>
                            </div>
                        </div>
                    `;
                    
                    // ✅ OCULTAR NOTIFICAÇÃO QUANDO NÃO HÁ PRODUTOS COM ESTOQUE BAIXO
                    this.hideEstoqueNotification();
                    console.log('✅ Notificação de estoque ocultada - estoque em dia');
                    
                    // ✅ VERIFICAÇÃO ADICIONAL PARA GARANTIR OCULTAÇÃO
                    setTimeout(() => {
                        const notificationContainer = document.getElementById('estoque-notification');
                        if (notificationContainer && notificationContainer.style.display !== 'none') {
                            console.log('⚠️ Notificação ainda visível após 100ms - forçando ocultação');
                            this.hideEstoqueNotification();
                        }
                    }, 100);
                    
                    return;
                }

                // Separar produtos críticos (estoque = 0) e de aviso (estoque <= 5)
                const produtosCriticos = produtosEstoqueBaixo.filter(p => p.estoque === 0);
                const produtosAviso = produtosEstoqueBaixo.filter(p => p.estoque > 0 && p.estoque <= 5);

                console.log('🚨 Produtos críticos (estoque = 0):', produtosCriticos);
                console.log('⚠️ Produtos de aviso (estoque ≤5):', produtosAviso);

                let alertsHTML = '';

                // Alerta crítico para produtos sem estoque
                if (produtosCriticos.length > 0) {
                    console.log('🔴 Criando alerta crítico...');
                    alertsHTML += this.createEstoqueAlert('critical', '🚨 Produtos SEM ESTOQUE', produtosCriticos, 'danger');
                }

                // Alerta de aviso para produtos com estoque baixo
                if (produtosAviso.length > 0) {
                    console.log('🟡 Criando alerta de aviso...');
                    alertsHTML += this.createEstoqueAlert('warning', '⚠️ Estoque Baixo', produtosAviso, 'warning');
                }

                console.log('📝 HTML dos alertas gerado:', alertsHTML);
                estoqueAlertsContainer.innerHTML = alertsHTML;

                // ✅ CAIXA DE TESTE DE TOOLTIPS REMOVIDA - NÃO É NECESSÁRIA EM PRODUÇÃO

                // Adicionar event listeners para os botões
                this.setupEstoqueAlertListeners();

                // Mostrar notificação no topo
                this.showEstoqueNotification(produtosCriticos.length, produtosAviso.length);

            } else {
                console.log('❌ Resposta da API não foi bem-sucedida:', response);
                estoqueAlertsContainer.innerHTML = `
                    <div class="estoque-alert error" style="background: #fee2e2; border-color: #ef4444;">
                        <div class="estoque-alert-header">
                            <div class="estoque-alert-icon" style="background: #ef4444;">
                                <i class="fas fa-exclamation-triangle"></i>
                            </div>
                            <h3 class="estoque-alert-title">❌ Erro ao Carregar</h3>
                        </div>
                        <div class="estoque-alert-content">
                            <p>Não foi possível carregar os alertas de estoque.</p>
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            console.error('❌ Erro ao carregar alertas de estoque:', error);
            const estoqueAlertsContainer = document.getElementById('estoque-alerts');
            if (estoqueAlertsContainer) {
                estoqueAlertsContainer.innerHTML = `
                    <div class="estoque-alert error" style="background: #fee2e2; border-color: #ef4444;">
                        <div class="estoque-alert-header">
                            <div class="estoque-alert-icon" style="background: #ef4444;">
                                <i class="fas fa-exclamation-triangle"></i>
                            </div>
                            <h3 class="estoque-alert-title">❌ Erro ao Carregar</h3>
                        </div>
                        <div class="estoque-alert-content">
                            <p>Erro: ${error.message}</p>
                        </div>
                    </div>
                `;
            }
        } finally {
            // ✅ SEMPRE LIMPAR DEBOUNCE
            this.constructor.loadDebounceTimers.delete('loadEstoqueAlerts');
        }
    }

    // Mostrar notificação de estoque no topo - SOLUÇÃO SIMPLES E EFICAZ
    showEstoqueNotification(criticosCount, avisoCount) {
        const notificationContainer = document.getElementById('estoque-notification');
        if (!notificationContainer) {
            console.log('❌ Container de notificação não encontrado');
            return;
        }

        const total = criticosCount + avisoCount;
        
        // ✅ VERIFICAR SE HÁ PRODUTOS COM ESTOQUE BAIXO
        if (total === 0) {
            console.log('✅ Nenhum produto com estoque baixo - ocultando notificação');
            this.hideEstoqueNotification();
            return;
        }
        
        // ✅ VERIFICAÇÃO ADICIONAL DE SEGURANÇA
        if (criticosCount < 0 || avisoCount < 0) {
            console.log('⚠️ Valores negativos detectados - ocultando notificação por segurança');
            this.hideEstoqueNotification();
            return;
        }
        
        console.log(`🔍 Exibindo notificação para: ${criticosCount} críticos, ${avisoCount} avisos (Total: ${total})`);
        
        const isCritical = criticosCount > 0;
        const type = isCritical ? 'critical' : 'warning';
        const icon = isCritical ? '🚨' : '⚠️';
        const text = isCritical 
            ? `ATENÇÃO: ${criticosCount} produto(s) SEM ESTOQUE e ${avisoCount} com estoque baixo!`
            : `${avisoCount} produto(s) com estoque baixo`;
        
        const tooltip = isCritical 
            ? 'Estoque CRÍTICO - Ação imediata necessária!'
            : 'Estoque baixo - Atenção necessária';

        // ✅ SOLUÇÃO SIMPLES - APENAS O NECESSÁRIO
        notificationContainer.className = `estoque-notification ${type}`;
        notificationContainer.title = tooltip;
        
        // ✅ REMOVER TODOS OS ESTILOS INLINE PROBLEMÁTICOS
        notificationContainer.removeAttribute('style');
        
        notificationContainer.innerHTML = `
            <div class="estoque-notification-content">
                <span class="estoque-notification-icon">${icon}</span>
                <span class="estoque-notification-text">${text}</span>
                <span class="estoque-notification-count">${total}</span>
                <button class="estoque-notification-close" title="Fechar notificação">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        // ✅ APLICAR APENAS O ESTILO ESSENCIAL
        notificationContainer.style.display = 'block';
        notificationContainer.style.visibility = 'visible';
        notificationContainer.style.opacity = '1';
        notificationContainer.style.height = 'auto';
        notificationContainer.style.overflow = 'visible';
        
        // ✅ ADICIONAR EVENT LISTENER PARA FECHAR NOTIFICAÇÃO
        const closeButton = notificationContainer.querySelector('.estoque-notification-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                notificationContainer.style.display = 'none';
            });
        }
        
        console.log(`✅ Notificação de estoque criada: ${total} produto(s) com estoque baixo`);
    }

    // Ocultar notificação de estoque
    hideEstoqueNotification() {
        const notificationContainer = document.getElementById('estoque-notification');
        if (notificationContainer) {
            // ✅ MÚLTIPLOS MÉTODOS DE OCULTAÇÃO PARA GARANTIR
            notificationContainer.style.display = 'none';
            notificationContainer.style.visibility = 'hidden';
            notificationContainer.style.opacity = '0';
            notificationContainer.style.height = '0';
            notificationContainer.style.overflow = 'hidden';
            
            // ✅ REMOVER CONTEÚDO PARA EVITAR EXIBIÇÃO ACIDENTAL
            notificationContainer.innerHTML = '';
            
            // ✅ REMOVER CLASSES QUE PODEM AFETAR A VISIBILIDADE
            notificationContainer.className = 'estoque-notification hidden';
            
            console.log('✅ Notificação de estoque ocultada com múltiplos métodos');
        } else {
            console.log('⚠️ Container de notificação não encontrado para ocultação');
        }
    }

    // Criar HTML do alerta de estoque com tooltips visuais
    createEstoqueAlert(type, title, produtos, stockClass) {
        const isCritical = type === 'critical';
        const iconClass = isCritical ? 'exclamation-triangle' : 'exclamation-circle';
        const stockClassCSS = stockClass === 'warning' ? 'warning' : 'danger';
        
        // Tooltips mais informativos
        const alertTooltip = isCritical 
            ? `🚨 ESTOQUE CRÍTICO!\n\n${produtos.length} produto(s) sem estoque.\nAção imediata necessária para evitar perda de vendas.`
            : `⚠️ ESTOQUE BAIXO!\n\n${produtos.length} produto(s) com estoque reduzido.\nAtenção necessária para reabastecimento.`;
        
        return `
            <div class="estoque-alert ${type}" 
                 data-tooltip="${alertTooltip}"
                 title="${alertTooltip}">
                <div class="estoque-alert-header">
                    <div class="estoque-alert-icon">
                        <i class="fas fa-${iconClass}"></i>
                    </div>
                    <h3 class="estoque-alert-title">${title}</h3>
                    <span class="estoque-alert-count">${produtos.length}</span>
                </div>
                
                <div class="estoque-alert-content">
                    ${produtos.map(produto => {
                        const itemTooltip = produto.estoque === 0 
                            ? `🚨 ${produto.nome}\n\nSEM ESTOQUE!\n\nPreço: ${this.formatCurrency(produto.preco)}\nDescrição: ${produto.descricao || 'Sem descrição'}\n\nAção: Reabastecer imediatamente!`
                            : `⚠️ ${produto.nome}\n\nEstoque: ${produto.estoque} unidades\nPreço: ${this.formatCurrency(produto.preco)}\nDescrição: ${produto.descricao || 'Sem descrição'}\n\nAção: Reabastecer em breve`;
                        
                        return `
                            <div class="estoque-alert-item" 
                                 data-tooltip="${itemTooltip}"
                                 title="${itemTooltip}">
                                <span class="estoque-alert-item-name">${produto.nome}</span>
                                <span class="estoque-alert-item-stock ${stockClassCSS}">
                                    ${produto.estoque === 0 ? 'SEM ESTOQUE' : `${produto.estoque} un.`}
                                </span>
                            </div>
                        `;
                    }).join('')}
                </div>
                
                <div class="estoque-alert-actions">
                    <button class="estoque-alert-btn primary" 
                            data-action="gerenciar-produtos"
                            data-tooltip="Clique para ir para a gestão de produtos e reabastecer estoque"
                            title="Clique para ir para a gestão de produtos e reabastecer estoque">
                        <i class="fas fa-box"></i>
                        Gerenciar Produtos
                    </button>
                    <button class="estoque-alert-btn secondary" 
                            data-action="atualizar-alertas"
                            data-tooltip="Atualizar lista de alertas de estoque"
                            title="Atualizar lista de alertas de estoque">
                        <i class="fas fa-sync-alt"></i>
                        Atualizar
                    </button>
                </div>
            </div>
        `;
    }

    // Configurar event listeners dos alertas de estoque
    setupEstoqueAlertListeners() {
        // Configurar tooltips personalizados
        this.setupTooltips();
        
        // Adicionar listeners para os botões
        document.querySelectorAll('.estoque-alert-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const action = event.target.getAttribute('data-action');
                if (action === 'gerenciar-produtos') {
                    window.location.hash = '#produtos';
                } else if (action === 'atualizar-alertas') {
                    this.loadEstoqueAlerts();
                }
            });
        });

        console.log('🔧 Event listeners dos alertas de estoque configurados');
    }

    // Sistema de tooltips personalizado
    setupTooltips() {
        // Aguardar um pouco para garantir que o DOM esteja pronto
        setTimeout(() => {
            const tooltipElements = document.querySelectorAll('[data-tooltip], [title]');
            
            console.log('🔧 Configurando tooltips para', tooltipElements.length, 'elementos');
            
            tooltipElements.forEach((element, index) => {
                console.log(`🔧 Elemento ${index}:`, element.tagName, element.className, element.getAttribute('data-tooltip') || element.getAttribute('title'));
                
                // Remover tooltips nativos do navegador se houver conflito
                if (element.hasAttribute('title') && element.hasAttribute('data-tooltip')) {
                    element.removeAttribute('title');
                }
                
                // Adicionar evento de mouse para tooltips personalizados
                element.addEventListener('mouseenter', this.showTooltip.bind(this));
                element.addEventListener('mouseleave', this.hideTooltip.bind(this));
            });
            
            console.log('🔧 Sistema de tooltips configurado para', tooltipElements.length, 'elementos');
        }, 500);
    }

    // Mostrar tooltip personalizado
    showTooltip(event) {
        const element = event.target;
        const tooltipText = element.getAttribute('data-tooltip') || element.getAttribute('title');
        
        if (!tooltipText) return;
        
        // Remover tooltip existente
        this.hideTooltip();
        
        // Criar tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'custom-tooltip';
        tooltip.textContent = tooltipText;
        tooltip.style.cssText = `
            position: absolute;
            background: rgba(0, 0, 0, 0.95);
            color: white;
            padding: 10px 14px;
            border-radius: 8px;
            font-size: 12px;
            white-space: pre-line;
            z-index: 50; /* ✅ REDUZIDO - não deve interferir com botões */
            pointer-events: none;
            max-width: 350px;
            line-height: 1.5;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
            opacity: 0;
            transition: opacity 0.2s ease;
        `;
        
        // Posicionar tooltip
        const rect = element.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        
        tooltip.style.left = (rect.left + scrollLeft + rect.width / 2) + 'px';
        tooltip.style.top = (rect.top + scrollTop - 10) + 'px';
        tooltip.style.transform = 'translateX(-50%)';
        
        // Adicionar ao DOM
        document.body.appendChild(tooltip);
        
        // Mostrar com animação
        setTimeout(() => {
            tooltip.style.opacity = '1';
        }, 10);
        
        // Armazenar referência
        element._tooltip = tooltip;
    }

    // Esconder tooltip personalizado
    hideTooltip(event) {
        const element = event ? event.target : null;
        
        if (element && element._tooltip) {
            element._tooltip.remove();
            element._tooltip = null;
        } else {
            // Remover todos os tooltips
            document.querySelectorAll('.custom-tooltip').forEach(tooltip => {
                tooltip.remove();
            });
        }
    }

    async getRecentActivities(limit = null) {
        try {
            const requestLimit = limit || this.paginationState.currentLimit;
            console.log(`🔍 Iniciando busca por atividades recentes (limite: ${requestLimit})...`);
            
            const activities = [];
            
            // ✅ BUSCAR PAGAMENTOS PRIMEIRO (PRIORIDADE ALTA)
            try {
                console.log('💰 Buscando pagamentos...');
                const pagamentos = await window.api.get(`/api/pagamentos?limit=${requestLimit + 5}`); // +5 para compensar vendas
                console.log('📡 Resposta da API de pagamentos:', pagamentos);
                
                if (pagamentos.data && pagamentos.data.success && pagamentos.data.data.length > 0) {
                    console.log(`✅ ${pagamentos.data.data.length} pagamentos encontrados`);
                    
                    pagamentos.data.data.forEach((pagamento, index) => {
                        const activity = {
                            type: 'pagamento',
                            icon: 'fas fa-check-circle',
                            text: `Pagamento recebido de ${pagamento.cliente_nome || 'Cliente'}`,
                            time: this.formatTimeAgo(pagamento.data_pagto),
                            value: this.formatCurrency(pagamento.valor_pago),
                            formaPagamento: pagamento.forma_pagamento || 'Não informado',
                            status: 'confirmado'
                        };
                        
                        activities.push(activity);
                        console.log(`💰 Pagamento ${index + 1}:`, activity);
                    });
                } else {
                    console.log('ℹ️ Nenhum pagamento encontrado ou resposta inválida');
                }
            } catch (error) {
                console.warn('⚠️ Erro ao buscar pagamentos:', error);
            }
            
            // Buscar vendas recentes (prioridade menor)
            try {
                console.log('🛒 Buscando vendas...');
                const vendas = await window.api.get('/api/vendas?limit=5');
                console.log('📡 Resposta da API de vendas:', vendas);
                
                if (vendas.data && vendas.data.success && vendas.data.data.length > 0) {
                    console.log(`✅ ${vendas.data.data.length} vendas encontradas`);
                    
                    vendas.data.data.forEach((venda, index) => {
                        const activity = {
                            type: 'venda',
                            icon: 'fas fa-shopping-cart',
                            text: `Nova venda para ${venda.cliente_nome || 'Cliente'}`,
                            time: this.formatTimeAgo(venda.created_at),
                            value: this.formatCurrency(venda.total)
                        };
                        
                        activities.push(activity);
                        console.log(`🛒 Venda ${index + 1}:`, activity);
                    });
                } else {
                    console.log('ℹ️ Nenhuma venda encontrada ou resposta inválida');
                }
            } catch (error) {
                console.warn('⚠️ Erro ao buscar vendas:', error);
            }
            
            console.log(`📊 Total de atividades coletadas: ${activities.length}`);
            
            // ✅ ORDENAR ATIVIDADES (PAGAMENTOS PRIMEIRO)
            const sortedActivities = activities
                .sort((a, b) => {
                    // Priorizar pagamentos
                    if (a.type === 'pagamento' && b.type !== 'pagamento') return -1;
                    if (a.type !== 'pagamento' && b.type === 'pagamento') return 1;
                    
                    // Depois ordenar por data
                    return new Date(b.time) - new Date(a.time);
                });
            
            // ✅ ATUALIZAR ESTADO DE PAGINAÇÃO
            this.paginationState.totalActivities = sortedActivities.length;
            
            // ✅ APLICAR LIMITE DE PAGINAÇÃO
            const limitedActivities = sortedActivities.slice(0, requestLimit);
            
            console.log(`🎯 Total de atividades: ${sortedActivities.length}, Limitadas: ${limitedActivities.length}`);
            return limitedActivities;
                
        } catch (error) {
            console.error('❌ Erro ao buscar atividades:', error);
            return [];
        }
    }

    createActivityElement(activity) {
        const div = document.createElement('div');
        div.className = `activity-item ${activity.type || ''}`;
        
        // Se for um pagamento, criar layout especializado
        if (activity.type === 'pagamento') {
            const formaPagamento = activity.formaPagamento || 'Não informado';
            const formaIcon = this.getPaymentMethodIcon(formaPagamento);
            const formaLabel = this.formatPaymentMethod(formaPagamento);
            const formaClass = this.getPaymentMethodCSSClass(formaPagamento);
            
            // Adicionar classe CSS específica da forma de pagamento
            div.className = `activity-item ${activity.type} ${formaClass}`;
            
            div.innerHTML = `
                <div class="activity-icon payment-confirmed">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-header">
                        <span class="activity-status">✅ PAGO</span>
                        <span class="activity-value">${activity.value}</span>
                    </div>
                    <p class="activity-text">${activity.text}</p>
                    <div class="activity-details">
                        <span class="payment-method">
                            <i class="${formaIcon}"></i>
                            ${formaLabel}
                        </span>
                        <span class="activity-time">${activity.time}</span>
                    </div>
                </div>
            `;
        } else {
            // Layout padrão para outras atividades
            div.innerHTML = `
                <div class="activity-icon">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <p>${activity.text}</p>
                    <span class="activity-time">${activity.time}</span>
                </div>
            `;
        }
        
        return div;
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    formatTimeAgo(dateString) {
        if (!dateString) return 'Agora';
        
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Agora';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m atrás`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h atrás`;
        return `${Math.floor(diffInSeconds / 86400)}d atrás`;
    }
    
    /**
     * 🔄 CONFIGURA LISTENERS PARA ATUALIZAÇÃO AUTOMÁTICA
     * Escuta eventos de mudanças em outras páginas
     */
    setupUpdateListeners() {
        // ✅ VERIFICAR SE ESTAMOS NA PÁGINA DASHBOARD ANTES DE CONFIGURAR INTERVALOS
        if (!this.isOnDashboardPage()) {
            console.log('⚠️ Não estamos na página dashboard, pulando configuração de intervalos');
            return;
        }
        
        // ✅ ATUALIZAR APENAS ESTATÍSTICAS (SEM RECARREGAR ATIVIDADES)
        this.dashboardStatsInterval = setInterval(() => {
            // ✅ VERIFICAR SE AINDA ESTAMOS NA PÁGINA DASHBOARD
            if (!this.isOnDashboardPage()) {
                this.stopAllIntervals();
                return;
            }
            this.loadDashboardStats();
        }, 30000);
        
        // ✅ ATUALIZAR ALERTAS DE ESTOQUE A CADA 2 MINUTOS (REDUZIDO)
        this.estoqueInterval = setInterval(() => {
            // ✅ VERIFICAR SE AINDA ESTAMOS NA PÁGINA DASHBOARD
            if (!this.isOnDashboardPage()) {
                this.stopAllIntervals();
                return;
            }
            this.loadEstoqueAlerts();
        }, 120000); // 2 minutos
        
        // Configurar sistema de notificações de pagamento
        this.setupPaymentNotifications();
        
        console.log('🔄 Listeners de atualização automática configurados (OTIMIZADOS)');
    }
    
    /**
     * ✅ VERIFICAR SE ESTAMOS NA PÁGINA DASHBOARD
     */
    isOnDashboardPage() {
        return window.location.hash === '#dashboard' || 
               window.location.hash === '' ||
               document.getElementById('dashboard-page')?.style.display !== 'none';
    }
    
    /**
     * 🛑 PARAR TODOS OS INTERVALOS
     */
    stopAllIntervals() {
        if (this.dashboardStatsInterval) {
            clearInterval(this.dashboardStatsInterval);
            this.dashboardStatsInterval = null;
            console.log('🛑 Intervalo de estatísticas parado');
        }
        
        if (this.estoqueInterval) {
            clearInterval(this.estoqueInterval);
            this.estoqueInterval = null;
            console.log('🛑 Intervalo de estoque parado');
        }
        
        if (this.paymentPollingInterval) {
            clearInterval(this.paymentPollingInterval);
            this.paymentPollingInterval = null;
            console.log('🛑 Intervalo de pagamentos parado');
        }
        
        this.stopEstoqueMonitoring();
        console.log('🛑 Todos os intervalos parados');
    }
    
    /**
     * 🧹 LIMPA LISTENERS AO DESTRUIR PÁGINA
     * Remove listeners do EventManager para evitar vazamentos de memória
     */
    cleanup() {
        if (this.updateListenerId && window.eventManager) {
            window.eventManager.stopListening(this.updateListenerId);
            console.log('🧹 Listeners de atualização removidos');
        }
    }

    showError(title, message) {
        if (window.UI) {
            window.UI.showErrorWithTitle(title, message);
        } else {
            alert(`${title}: ${message}`);
        }
    }
    
    /**
     * 🎨 Obter ícone para forma de pagamento
     */
    getPaymentMethodIcon(formaPagamento) {
        if (!formaPagamento) return 'fas fa-money-bill-wave';
        
        const forma = formaPagamento.toLowerCase();
        
        if (forma.includes('dinheiro') || forma.includes('cash')) {
            return 'fas fa-money-bill-wave';
        } else if (forma.includes('cartão') || forma.includes('cartao') || forma.includes('card')) {
            return 'fas fa-credit-card';
        } else if (forma.includes('pix')) {
            return 'fas fa-qrcode';
        } else if (forma.includes('transferência') || forma.includes('transferencia')) {
            return 'fas fa-university';
        } else if (forma.includes('boleto')) {
            return 'fas fa-file-invoice';
        } else if (forma.includes('cheque')) {
            return 'fas fa-money-check';
        }
        
        return 'fas fa-money-bill-wave';
    }
    
    /**
     * 📝 Formatar forma de pagamento para exibição
     */
    formatPaymentMethod(formaPagamento) {
        if (!formaPagamento) return 'Não informado';
        
        const forma = formaPagamento.toLowerCase();
        
        if (forma.includes('dinheiro') || forma.includes('cash')) {
            return 'Dinheiro';
        } else if (forma.includes('cartão') || forma.includes('cartao') || forma.includes('card')) {
            return 'Cartão';
        } else if (forma.includes('pix')) {
            return 'PIX';
        } else if (forma.includes('transferência') || forma.includes('transferencia')) {
            return 'Transferência';
        } else if (forma.includes('boleto')) {
            return 'Boleto';
        } else if (forma.includes('cheque')) {
            return 'Cheque';
        }
        
        return formaPagamento;
    }
    
    /**
     * 🎨 Obter classe CSS para forma de pagamento
     */
    getPaymentMethodCSSClass(formaPagamento) {
        if (!formaPagamento) return 'dinheiro';
        
        const forma = formaPagamento.toLowerCase();
        
        if (forma.includes('dinheiro') || forma.includes('cash')) {
            return 'dinheiro';
        } else if (forma.includes('cartão') || forma.includes('cartao') || forma.includes('card')) {
            return 'cartao';
        } else if (forma.includes('pix')) {
            return 'pix';
        } else if (forma.includes('transferência') || forma.includes('transferencia')) {
            return 'transferencia';
        } else if (forma.includes('boleto')) {
            return 'boleto';
        } else if (forma.includes('cheque')) {
            return 'cheque';
        }
        
        return 'dinheiro';
    }
    
    /**
     * 💰 SISTEMA DE NOTIFICAÇÕES DE PAGAMENTO
     * Mostra notificações toast quando pagamentos são recebidos
     */
    setupPaymentNotifications() {
        console.log('💰 Configurando sistema de notificações de pagamento...');
        
        // Verificar se há Socket.IO disponível
        if (window.io) {
            this.setupSocketIOPayments();
        } else {
            // Fallback: verificar pagamentos a cada 10 segundos
            this.setupPollingPayments();
        }
        
        // Monitorar pagamentos existentes para detectar novos
        this.lastPaymentCheck = Date.now();
        this.lastPaymentIds = new Set();
        
        console.log('✅ Sistema de notificações de pagamento configurado');
    }
    
    /**
     * 🔌 Configurar notificações via Socket.IO
     */
    setupSocketIOPayments() {
        try {
            const socket = window.io();
            
            socket.on('pagamento_recebido', (data) => {
                console.log('💰 Pagamento recebido via Socket.IO:', data);
                this.showPaymentNotification(data);
            });
            
            socket.on('pagamento_atualizado', (data) => {
                console.log('💰 Pagamento atualizado via Socket.IO:', data);
                this.showPaymentNotification(data, 'atualizado');
            });
            
            console.log('✅ Socket.IO configurado para notificações de pagamento');
            
        } catch (error) {
            console.warn('⚠️ Erro ao configurar Socket.IO, usando polling:', error);
            this.setupPollingPayments();
        }
    }
    
    /**
     * 🔄 Configurar notificações via polling
     */
    setupPollingPayments() {
        // ✅ VERIFICAR PAGAMENTOS A CADA 30 SEGUNDOS (REDUZIDO)
        this.paymentPollingInterval = setInterval(async () => {
            await this.checkNewPayments();
        }, 30000); // 30 segundos
        
        console.log('✅ Polling configurado para notificações de pagamento (OTIMIZADO)');
    }
    
    /**
     * 🔍 Verificar novos pagamentos
     */
    async checkNewPayments() {
        try {
            const response = await window.api.get('/api/pagamentos?limit=10');
            
            if (response && response.data && response.data.success && response.data.data) {
                const pagamentos = response.data.data;
                
                pagamentos.forEach(pagamento => {
                    const paymentId = pagamento.id;
                    const paymentTime = new Date(pagamento.data_pagto || pagamento.created_at);
                    
                    // Verificar se é um pagamento novo (últimos 30 segundos)
                    const isNew = (Date.now() - paymentTime.getTime()) < 30000;
                    const isNewId = !this.lastPaymentIds.has(paymentId);
                    
                    if (isNew && isNewId) {
                        console.log('💰 Novo pagamento detectado:', pagamento);
                        this.showPaymentNotification(pagamento);
                        this.lastPaymentIds.add(paymentId);
                    }
                });
                
                // Limpar IDs antigos (mais de 1 hora)
                const oneHourAgo = Date.now() - (60 * 60 * 1000);
                this.lastPaymentIds.forEach(id => {
                    if (id < oneHourAgo) {
                        this.lastPaymentIds.delete(id);
                    }
                });
            }
            
        } catch (error) {
            console.warn('⚠️ Erro ao verificar novos pagamentos:', error);
        }
    }
    
    /**
     * 🎉 Mostrar notificação de pagamento
     */
    showPaymentNotification(pagamento, tipo = 'recebido') {
        try {
            // Usar a função especializada do UI
            if (window.UI && window.UI.showPaymentNotification) {
                window.UI.showPaymentNotification(pagamento, tipo);
            } else {
                // Fallback para toast simples
                const cliente = pagamento.cliente_nome || 'Cliente';
                const valor = this.formatCurrency(pagamento.valor_pago);
                const forma = window.UI && window.UI.formatPaymentMethod ? 
                    window.UI.formatPaymentMethod(pagamento.forma_pagamento) : 
                    (pagamento.forma_pagamento || 'Não informado');
                
                const message = tipo === 'recebido' 
                    ? `Pagamento recebido de ${cliente}`
                    : `Pagamento atualizado de ${cliente}`;
                
                const details = `${valor} via ${forma}`;
                
                if (window.UI && window.UI.showSuccess) {
                    window.UI.showSuccess(`${message}<br><small>${details}</small>`, 8000);
                } else {
                    alert(`${message}\n${details}`);
                }
            }
            
            // ✅ ATUALIZAR APENAS ATIVIDADES (SEM RECARREGAR TODO O DASHBOARD)
            this.updateActivitiesOnly();
            
            console.log('✅ Notificação de pagamento exibida:', { 
                cliente: pagamento.cliente_nome, 
                valor: pagamento.valor_pago, 
                forma: pagamento.forma_pagamento 
            });
            
        } catch (error) {
            console.error('❌ Erro ao mostrar notificação de pagamento:', error);
        }
    }
    
    /**
     * ✅ ATUALIZAR APENAS ATIVIDADES (SEM TREMOR)
     * Atualiza as atividades de forma suave sem recarregar todo o dashboard
     */
    async updateActivitiesOnly() {
        try {
            // Buscar apenas atividades recentes
            const activities = await this.getRecentActivities();
            
            const activityList = document.getElementById('activity-list');
            if (!activityList) return;
            
            // ✅ ATUALIZAR APENAS SE HOUVE MUDANÇAS
            const currentActivities = activityList.querySelectorAll('.activity-item');
            const currentCount = currentActivities.length;
            
            if (activities.length === currentCount) {
                // Mesmo número de atividades, não atualizar
                return;
            }
            
            // ✅ ATUALIZAÇÃO SUAVE - ADICIONAR NOVAS ATIVIDADES
            if (activities.length > currentCount) {
                const newActivities = activities.slice(0, activities.length - currentCount);
                
                newActivities.forEach((activity, index) => {
                    const activityElement = this.createActivityElement(activity);
                    activityElement.classList.add('new');
                    
                    // Adicionar com delay para animação suave
                    setTimeout(() => {
                        activityList.insertBefore(activityElement, activityList.firstChild);
                    }, index * 100); // 100ms entre cada nova atividade
                });
                
                console.log(`✅ ${newActivities.length} novas atividades adicionadas suavemente`);
            }
            
        } catch (error) {
            console.warn('⚠️ Erro ao atualizar atividades:', error);
        }
    }
    
    /**
     * 🎨 Obter ícone para forma de pagamento
     */
    getPaymentIcon(formaPagamento) {
        if (!formaPagamento) return 'fas fa-money-bill-wave';
        
        const forma = formaPagamento.toLowerCase();
        
        if (forma.includes('dinheiro') || forma.includes('cash')) {
            return 'fas fa-money-bill-wave';
        } else if (forma.includes('cartão') || forma.includes('cartao') || forma.includes('card')) {
            return 'fas fa-credit-card';
        } else if (forma.includes('pix')) {
            return 'fas fa-qrcode';
        } else if (forma.includes('transferência') || forma.includes('transferencia')) {
            return 'fas fa-university';
        } else if (forma.includes('boleto')) {
            return 'fas fa-file-invoice';
        } else if (forma.includes('cheque')) {
            return 'fas fa-money-check';
        }
        
        return 'fas fa-money-bill-wave';
    }
    
    /**
     * 🌈 Obter cor para forma de pagamento
     */
    getPaymentColor(formaPagamento) {
        if (!formaPagamento) return '#10b981';
        
        const forma = formaPagamento.toLowerCase();
        
        if (forma.includes('dinheiro') || forma.includes('cash')) {
            return '#10b981'; // Verde
        } else if (forma.includes('cartão') || forma.includes('cartao') || forma.includes('card')) {
            return '#3b82f6'; // Azul
        } else if (forma.includes('pix')) {
            return '#8b5cf6'; // Roxo
        } else if (forma.includes('transferência') || forma.includes('transferencia')) {
            return '#f59e0b'; // Amarelo
        } else if (forma.includes('boleto')) {
            return '#ef4444'; // Vermelho
        } else if (forma.includes('cheque')) {
            return '#06b6d4'; // Ciano
        }
        
        return '#10b981'; // Verde padrão
    }
    
    /**
     * 📝 Formatar forma de pagamento para exibição
     */
    formatPaymentMethod(formaPagamento) {
        if (!formaPagamento) return 'Não informado';
        
        const forma = formaPagamento.toLowerCase();
        
        if (forma.includes('dinheiro') || forma.includes('cash')) {
            return 'Dinheiro';
        } else if (forma.includes('cartão') || forma.includes('cartao') || forma.includes('card')) {
            return 'Cartão';
        } else if (forma.includes('pix')) {
            return 'PIX';
        } else if (forma.includes('transferência') || forma.includes('transferencia')) {
            return 'Transferência';
        } else if (forma.includes('boleto')) {
            return 'Boleto';
        } else if (forma.includes('cheque')) {
            return 'Cheque';
        }
        
        return formaPagamento;
    }

    // ✅ VERIFICAR AUTOMATICAMENTE O STATUS DO ESTOQUE
    async checkEstoqueStatus() {
        try {
            console.log('🔍 Verificando status automático do estoque...');
            
            // Buscar produtos com estoque baixo
            const response = await window.api.get('/api/produtos/estoque/baixo?limite=10');
            
            if (response.data && response.data.success) {
                const produtosEstoqueBaixo = response.data.data;
                const total = produtosEstoqueBaixo.length;
                
                console.log(`📊 Status do estoque: ${total} produto(s) com estoque baixo`);
                
                // ✅ OCULTAR NOTIFICAÇÃO SE NÃO HÁ PRODUTOS COM ESTOQUE BAIXO
                if (total === 0) {
                    console.log('✅ Estoque corrigido - ocultando notificação automaticamente');
                    this.hideEstoqueNotification();
                    
                    // ✅ FORÇAR OCULTAÇÃO ADICIONAL PARA GARANTIR
                    const notificationContainer = document.getElementById('estoque-notification');
                    if (notificationContainer) {
                        notificationContainer.style.display = 'none';
                        notificationContainer.style.visibility = 'hidden';
                        notificationContainer.style.opacity = '0';
                        console.log('✅ Notificação forçadamente ocultada com múltiplos métodos');
                    }
                } else {
                    // ✅ ATUALIZAR NOTIFICAÇÃO SE AINDA HÁ PRODUTOS COM ESTOQUE BAIXO
                    const produtosCriticos = produtosEstoqueBaixo.filter(p => p.estoque === 0);
                    const produtosAviso = produtosEstoqueBaixo.filter(p => p.estoque > 0 && p.estoque <= 5);
                    
                    console.log(`🔄 Atualizando notificação: ${produtosCriticos.length} críticos, ${produtosAviso.length} avisos`);
                    this.showEstoqueNotification(produtosCriticos.length, produtosAviso.length);
                }
            } else {
                console.log('⚠️ Resposta da API não foi bem-sucedida - ocultando notificação por segurança');
                this.hideEstoqueNotification();
            }
        } catch (error) {
            console.error('❌ Erro ao verificar status do estoque:', error);
            console.log('⚠️ Ocultando notificação por segurança devido ao erro');
            this.hideEstoqueNotification();
        }
    }

    // ✅ INICIAR VERIFICAÇÃO AUTOMÁTICA DO ESTOQUE
    startEstoqueMonitoring() {
        console.log('🚀 Iniciando monitoramento automático do estoque...');
        
        // ✅ VERIFICAÇÃO INICIAL AGGRESSIVA
        console.log('🔍 Fazendo verificação inicial agressiva...');
        this.forceCheckNotificationState();
        
        // ✅ VERIFICAR A CADA 10 MINUTOS (REDUZIDO)
        this.estoqueMonitoringInterval = setInterval(() => {
            this.checkEstoqueStatus();
        }, 10 * 60 * 1000); // 10 minutos
        
        // ✅ VERIFICAÇÃO ÚNICA APÓS INICIALIZAÇÃO
        setTimeout(() => {
            console.log('🔍 Verificação única após inicialização...');
            this.checkEstoqueStatus();
        }, 3000); // 3 segundos
        
        console.log('✅ Monitoramento automático do estoque iniciado');
    }

    // ✅ PARAR VERIFICAÇÃO AUTOMÁTICA DO ESTOQUE
    stopEstoqueMonitoring() {
        if (this.estoqueMonitoringInterval) {
            clearInterval(this.estoqueMonitoringInterval);
            this.estoqueMonitoringInterval = null;
            console.log('🛑 Monitoramento automático do estoque parado');
        }
    }

    // ✅ CLEANUP - PARAR TODOS OS INTERVALOS E LIMPAR RECURSOS
    async cleanup() {
        console.log('🧹 Fazendo cleanup da DashboardPage...');
        
        try {
            // ✅ PARAR TODOS OS INTERVALOS USANDO O MÉTODO UNIFICADO
            this.stopAllIntervals();
            
            // ✅ LIMPAR ESTADO INTERNO (VERIFICANDO SE EXISTE)
            this._initialized = false;
            this.hasError = false;
            this.initializationTime = null;
            
            // ✅ VERIFICAR SE lastPaymentIds EXISTE ANTES DE LIMPAR
            if (this.lastPaymentIds && typeof this.lastPaymentIds.clear === 'function') {
                this.lastPaymentIds.clear();
                console.log('✅ lastPaymentIds limpo');
            } else {
                console.log('⚠️ lastPaymentIds não existe ou não é um Set válido');
            }
            
            // ✅ LIMPAR ELEMENTOS DO DOM SE NECESSÁRIO
            this.clearDashboardElements();
            
            console.log('✅ Cleanup da DashboardPage concluído - todos os intervalos parados e estado limpo');
            
        } catch (error) {
            console.error('❌ Erro durante cleanup:', error);
        }
    }
    
    // ✅ LIMPAR ELEMENTOS DO DOM PARA EVITAR DUPLICAÇÃO
    clearDashboardElements() {
        try {
            console.log('🧹 Limpando elementos do DOM...');
            
            // Limpar lista de atividades
            const activityList = document.getElementById('activity-list');
            if (activityList) {
                activityList.innerHTML = `
                    <div class="activity-item">
                        <div class="activity-icon">
                            <i class="fas fa-spinner fa-spin"></i>
                        </div>
                        <div class="activity-content">
                            <p>Carregando atividades...</p>
                            <span class="activity-time">Agora</span>
                        </div>
                    </div>
                `;
                console.log('✅ Lista de atividades limpa');
            }
            
            // Limpar notificações de estoque
            const estoqueNotification = document.getElementById('estoque-notification');
            if (estoqueNotification) {
                estoqueNotification.style.display = 'none';
                console.log('✅ Notificação de estoque ocultada');
            }
            
            console.log('✅ Elementos do DOM limpos');
            
        } catch (error) {
            console.warn('⚠️ Erro ao limpar elementos do DOM:', error);
        }
    }

    // ✅ VERIFICAÇÃO FORÇADA DO ESTADO DA NOTIFICAÇÃO
    forceCheckNotificationState() {
        console.log('🔍 Verificação forçada do estado da notificação...');
        
        const notificationContainer = document.getElementById('estoque-notification');
        if (!notificationContainer) {
            console.log('❌ Container de notificação não encontrado');
            return;
        }
        
        // Verificar se a notificação está visível
        const isVisible = notificationContainer.style.display !== 'none' && 
                         notificationContainer.style.visibility !== 'hidden' &&
                         notificationContainer.style.opacity !== '0';
        
        console.log(`📊 Estado da notificação: ${isVisible ? 'VISÍVEL' : 'OCULTA'}`);
        
        if (isVisible) {
            console.log('⚠️ Notificação está visível - verificando se deveria estar oculta...');
            
            // Fazer uma verificação rápida do estoque
            this.checkEstoqueStatus();
        } else {
            console.log('✅ Notificação está oculta corretamente');
        }
    }

    // ✅ FORÇAR OCULTAÇÃO DA NOTIFICAÇÃO
    forceHideNotification() {
        console.log('🛑 Forçando ocultação da notificação...');
        
        const notificationContainer = document.getElementById('estoque-notification');
        if (notificationContainer) {
            // ✅ MÉTODOS AGGRESSIVOS DE OCULTAÇÃO
            notificationContainer.style.cssText = `
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                height: 0 !important;
                overflow: hidden !important;
                position: absolute !important;
                top: -9999px !important;
                left: -9999px !important;
                z-index: -9999 !important;
            `;
            
            // ✅ REMOVER CONTEÚDO COMPLETAMENTE
            notificationContainer.innerHTML = '';
            
            // ✅ ADICIONAR CLASSE DE OCULTAÇÃO
            notificationContainer.className = 'estoque-notification hidden force-hidden';
            
            console.log('✅ Notificação forçadamente ocultada com métodos agressivos');
        } else {
            console.log('⚠️ Container de notificação não encontrado para ocultação forçada');
        }
    }
}

// Inicializar página quando carregar
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔍 DOMContentLoaded - Verificando currentPage:', window.currentPage);
    console.log('🔍 window.DashboardPage disponível:', !!window.DashboardPage);
    console.log('🔍 window.currentPage === dashboard:', window.currentPage === 'dashboard');
    
    if (window.currentPage === 'dashboard') {
        console.log('✅ Inicializando DashboardPage...');
        window.dashboardPage = new DashboardPage();
        console.log('✅ DashboardPage criado:', window.dashboardPage);
    } else {
        console.log('⚠️ currentPage não é dashboard:', window.currentPage);
        console.log('🔍 Aguardando evento dashboard-page-activated...');
    }
});

// Também tentar inicializar quando a página for ativada
window.addEventListener('dashboard-page-activated', () => {
    console.log('🔍 Evento dashboard-page-activated recebido');
    console.log('🔍 window.currentPage:', window.currentPage);
    console.log('🔍 window.dashboardPage já existe:', !!window.dashboardPage);
    
    if (!window.dashboardPage && window.currentPage === 'dashboard') {
        console.log('✅ Inicializando DashboardPage via evento...');
        window.dashboardPage = new DashboardPage();
        console.log('✅ DashboardPage criado via evento:', window.dashboardPage);
    } else if (window.dashboardPage) {
        console.log('✅ DashboardPage já existe, não precisa criar novamente');
    } else {
        console.log('⚠️ Não foi possível inicializar DashboardPage');
    }
});

// Exportar para uso global
window.DashboardPage = DashboardPage; 