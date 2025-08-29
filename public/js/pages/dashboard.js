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
            console.log('🚀 Inicializando DashboardPage...');
            
            // Carregar dados iniciais
            await this.loadDashboardData();
            
            // Configurar listeners de atualização
            this.setupUpdateListeners();
            
            // ✅ INICIAR MONITORAMENTO AUTOMÁTICO DO ESTOQUE
            this.startEstoqueMonitoring();
            
            console.log('✅ DashboardPage inicializada com sucesso!');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar DashboardPage:', error);
        }
    }

    async loadDashboardData() {
        try {
            // Carregar estatísticas
            const stats = await window.api.get('/api/relatorios/dashboard');
            if (stats.data && stats.data.success) {
                this.updateDashboardStats(stats.data.data);
            }
            
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

    async loadRecentActivities() {
        try {
            const activityList = document.getElementById('activity-list');
            if (!activityList) return;
            
            // Buscar atividades recentes
            const activities = await this.getRecentActivities();
            
            // Limpar lista atual
            activityList.innerHTML = '';
            
            if (activities.length === 0) {
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
            
            // Adicionar atividades
            activities.forEach(activity => {
                const activityElement = this.createActivityElement(activity);
                activityList.appendChild(activityElement);
            });
            
        } catch (error) {
            console.error('❌ Erro ao carregar atividades:', error);
        }
    }

    // Carregar alertas de estoque baixo
    async loadEstoqueAlerts() {
        try {
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

    async getRecentActivities() {
        try {
            // Buscar vendas recentes
            const vendas = await window.api.get('/api/vendas?limit=5');
            const activities = [];
            
            if (vendas.data && vendas.data.success && vendas.data.data.length > 0) {
                vendas.data.data.forEach(venda => {
                    activities.push({
                        type: 'venda',
                        icon: 'fas fa-shopping-cart',
                        text: `Nova venda para ${venda.cliente_nome || 'Cliente'}`,
                        time: this.formatTimeAgo(venda.created_at),
                        value: this.formatCurrency(venda.total)
                    });
                });
            }
            
            // Buscar pagamentos recentes
            const pagamentos = await window.api.get('/api/pagamentos?limit=5');
            if (pagamentos.data && pagamentos.data.success && pagamentos.data.data.length > 0) {
                pagamentos.data.data.forEach(pagamento => {
                    activities.push({
                        type: 'pagamento',
                        icon: 'fas fa-credit-card',
                        text: `Pagamento recebido de ${pagamento.cliente_nome || 'Cliente'}`,
                        time: this.formatTimeAgo(pagamento.data_pagto),
                        value: this.formatCurrency(pagamento.valor_pago)
                    });
                });
            }
            
            // Ordenar por data e retornar os 10 mais recentes
            return activities
                .sort((a, b) => new Date(b.time) - new Date(a.time))
                .slice(0, 10);
                
        } catch (error) {
            console.error('❌ Erro ao buscar atividades:', error);
            return [];
        }
    }

    createActivityElement(activity) {
        const div = document.createElement('div');
        div.className = 'activity-item';
        div.innerHTML = `
            <div class="activity-icon">
                <i class="${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <p>${activity.text}</p>
                <span class="activity-time">${activity.time}</span>
            </div>
        `;
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
        // Atualizar dashboard a cada 30 segundos
        setInterval(() => {
            this.loadDashboardData();
        }, 30000);
        
        // Atualizar alertas de estoque a cada 60 segundos
        setInterval(() => {
            this.loadEstoqueAlerts();
        }, 60000);
        
        console.log('🔄 Listeners de atualização automática configurados');
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
        
        // Verificar a cada 5 minutos (300.000 ms)
        this.estoqueMonitoringInterval = setInterval(() => {
            this.checkEstoqueStatus();
        }, 5 * 60 * 1000);
        
        // ✅ VERIFICAÇÃO IMEDIATA APÓS INICIALIZAÇÃO
        setTimeout(() => {
            console.log('🔍 Verificação imediata após inicialização...');
            this.checkEstoqueStatus();
        }, 1000);
        
        // ✅ VERIFICAÇÃO ADICIONAL APÓS 5 SEGUNDOS
        setTimeout(() => {
            console.log('🔍 Verificação adicional após 5 segundos...');
            this.checkEstoqueStatus();
        }, 5000);
        
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

    // ✅ CLEANUP - PARAR MONITORAMENTO E LIMPAR RECURSOS
    cleanup() {
        console.log('🧹 Fazendo cleanup da DashboardPage...');
        
        // Parar monitoramento automático
        this.stopEstoqueMonitoring();
        
        // Remover event listeners se necessário
        // (implementar conforme necessário)
        
        console.log('✅ Cleanup da DashboardPage concluído');
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