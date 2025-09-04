// ===== DIAGNÓSTICO E CORREÇÃO DOS DADOS DA DASHBOARD =====
console.log('🔍 DIAGNÓSTICANDO DADOS DA DASHBOARD...');

// Função para diagnosticar problemas de dados
async function diagnoseDashboardData() {
    console.log('🔍 DIAGNÓSTICO DOS DADOS:');

    try {
        // 1. Verificar token
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.log('❌ Token não encontrado');
            return;
        }
        console.log('✅ Token encontrado');

        // 2. Fazer requisição para API
        console.log('🔄 Fazendo requisição para API...');
        const response = await fetch('/api/relatorios/dashboard', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`📊 Status da resposta: ${response.status}`);

        if (!response.ok) {
            console.log(`❌ Erro HTTP: ${response.status} ${response.statusText}`);
            return;
        }

        const data = await response.json();
        console.log('📊 Dados da API:', data);

        if (data.success) {
            const stats = data.data.estatisticas;
            console.log('📈 Estatísticas da API:');
            console.log(`  - Total de clientes: ${stats.total_clientes}`);
            console.log(`  - Total de produtos: ${stats.total_produtos}`);
            console.log(`  - Total de vendas: ${stats.total_vendas}`);
            console.log(`  - Orçamentos ativos: ${stats.orcamentos_ativos}`);
            console.log(`  - Orçamentos aprovados: ${stats.orcamentos_aprovados}`);
            console.log(`  - Orçamentos convertidos: ${stats.orcamentos_convertidos}`);
            console.log(`  - Orçamentos expirados: ${stats.orcamentos_expirados}`);

            // 3. Verificar dados na página
            console.log('🔍 Verificando dados na página:');
            const pageElements = {
                'total-clientes': 'Total de Clientes',
                'total-produtos': 'Total de Produtos',
                'total-vendas': 'Total de Vendas',
                'orcamentos-ativos': 'Orçamentos Ativos',
                'orcamentos-aprovados': 'Orçamentos Aprovados',
                'orcamentos-convertidos': 'Orçamentos Convertidos',
                'orcamentos-expirados': 'Orçamentos Expirados'
            };

            Object.entries(pageElements).forEach(([id, label]) => {
                const element = document.getElementById(id);
                if (element) {
                    console.log(`  - ${label}: ${element.textContent}`);
                } else {
                    console.log(`  - ${label}: Elemento não encontrado`);
                }
            });

            // 4. Comparar dados
            console.log('🔍 COMPARAÇÃO DE DADOS:');
            console.log(`  API produtos: ${stats.total_produtos}`);
            const pageProdutos = document.getElementById('total-produtos');
            if (pageProdutos) {
                console.log(`  Página produtos: ${pageProdutos.textContent}`);

                if (parseInt(pageProdutos.textContent.replace(/\D/g, '')) !== stats.total_produtos) {
                    console.log('❌ DIFERENÇA DETECTADA!');
                    console.log('🔧 Corrigindo dados...');
                    fixDashboardData(stats);
                } else {
                    console.log('✅ Dados estão corretos');
                }
            }

        } else {
            console.log('❌ API retornou erro:', data.error);
        }

    } catch (error) {
        console.log('❌ Erro no diagnóstico:', error.message);
    }
}

// Função para corrigir dados da dashboard
function fixDashboardData(stats) {
    console.log('🔧 CORRIGINDO DADOS DA DASHBOARD...');

    // Atualizar elementos com dados corretos
    const elements = {
        'total-clientes': stats.total_clientes,
        'total-produtos': stats.total_produtos,
        'total-vendas': stats.total_vendas,
        'orcamentos-ativos': stats.orcamentos_ativos,
        'orcamentos-aprovados': stats.orcamentos_aprovados,
        'orcamentos-convertidos': stats.orcamentos_convertidos,
        'orcamentos-expirados': stats.orcamentos_expirados
    };

    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            const oldValue = element.textContent;
            element.textContent = value.toLocaleString('pt-BR');
            console.log(`✅ ${id}: ${oldValue} → ${element.textContent}`);
        } else {
            console.log(`❌ Elemento ${id} não encontrado`);
        }
    });

    // Atualizar resumo financeiro se existir
    const financialElements = {
        'valor-total-vendas': stats.valor_total_vendas,
        'valor-total-devido': stats.valor_total_devido,
        'valor-total-pago': stats.valor_total_pago
    };

    Object.entries(financialElements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            const oldValue = element.textContent;
            element.textContent = `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
            console.log(`✅ ${id}: ${oldValue} → ${element.textContent}`);
        }
    });

    console.log('✅ Dados corrigidos!');
}

// Função para forçar atualização da dashboard
async function forceDashboardUpdate() {
    console.log('🔄 FORÇANDO ATUALIZAÇÃO DA DASHBOARD...');

    try {
        // 1. Recarregar dados da API
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/relatorios/dashboard', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success) {
            // 2. Atualizar dados na página
            fixDashboardData(data.data.estatisticas);

            // 3. Atualizar alertas de estoque
            if (data.data.estoque_baixo) {
                const alertsContainer = document.getElementById('estoque-alerts');
                if (alertsContainer && data.data.estoque_baixo.length > 0) {
                    alertsContainer.innerHTML = `
                        <div class="alert alert-warning">
                            <i class="fas fa-exclamation-triangle"></i>
                            <strong>Alerta de Estoque:</strong> ${data.data.estoque_baixo.length} produto(s) com estoque baixo
                            <button class="alert-close" onclick="this.parentElement.remove()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `;
                }
            }

            console.log('✅ Dashboard atualizada com sucesso!');
        } else {
            throw new Error(data.error || 'Erro ao carregar dados');
        }

    } catch (error) {
        console.log('❌ Erro ao atualizar dashboard:', error.message);
    }
}

// Função para verificar se há dados mock sendo usados
function checkForMockData() {
    console.log('🔍 VERIFICANDO DADOS MOCK...');

    const mockPatterns = [
        { id: 'total-clientes', pattern: /^(150|0)$/ },
        { id: 'total-produtos', pattern: /^(89|0)$/ },
        { id: 'total-vendas', pattern: /^(234|0)$/ },
        { id: 'orcamentos-ativos', pattern: /^(12|0)$/ },
        { id: 'orcamentos-aprovados', pattern: /^(45|0)$/ },
        { id: 'orcamentos-convertidos', pattern: /^(38|0)$/ },
        { id: 'orcamentos-expirados', pattern: /^(5|0)$/ }
    ];

    let mockDataFound = false;

    mockPatterns.forEach(({ id, pattern }) => {
        const element = document.getElementById(id);
        if (element) {
            const value = element.textContent.replace(/\D/g, '');
            if (pattern.test(value)) {
                console.log(`⚠️ Possível dado mock encontrado: ${id} = ${value}`);
                mockDataFound = true;
            }
        }
    });

    if (mockDataFound) {
        console.log('🔧 Dados mock detectados - forçando atualização...');
        forceDashboardUpdate();
    } else {
        console.log('✅ Nenhum dado mock detectado');
    }
}

// Função para mostrar status atual
function showCurrentStatus() {
    console.log('📊 STATUS ATUAL DA DASHBOARD:');

    const elements = [
        'total-clientes',
        'total-produtos',
        'total-vendas',
        'orcamentos-ativos',
        'orcamentos-aprovados',
        'orcamentos-convertidos',
        'orcamentos-expirados'
    ];

    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            console.log(`  ${id}: ${element.textContent}`);
        }
    });
}

// Executar diagnóstico quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(diagnoseDashboardData, 1000);
        setTimeout(checkForMockData, 2000);
    });
} else {
    setTimeout(diagnoseDashboardData, 1000);
    setTimeout(checkForMockData, 2000);
}

// Expor funções globalmente
window.diagnoseDashboardData = diagnoseDashboardData;
window.fixDashboardData = fixDashboardData;
window.forceDashboardUpdate = forceDashboardUpdate;
window.checkForMockData = checkForMockData;
window.showCurrentStatus = showCurrentStatus;

console.log('✅ Script de diagnóstico da dashboard carregado!'); 