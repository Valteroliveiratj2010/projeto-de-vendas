// ===== VERIFICAÇÃO DIRETA DO BANCO DE DADOS =====
console.log('🔍 VERIFICANDO DADOS DIRETAMENTE DO BANCO...');

// Função para verificar dados do banco
async function checkDatabaseData() {
    console.log('🔍 VERIFICAÇÃO DIRETA DO BANCO:');

    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.log('❌ Token não encontrado');
            return;
        }

        // Fazer requisição para API
        const response = await fetch('/api/relatorios/dashboard', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.log(`❌ Erro HTTP: ${response.status}`);
            return;
        }

        const data = await response.json();

        if (data.success) {
            const stats = data.data.estatisticas;

            console.log('📊 DADOS DO BANCO:');
            console.log(`  - Total de clientes: ${stats.total_clientes}`);
            console.log(`  - Total de produtos: ${stats.total_produtos}`);
            console.log(`  - Total de vendas: ${stats.total_vendas}`);
            console.log(`  - Orçamentos ativos: ${stats.orcamentos_ativos}`);
            console.log(`  - Orçamentos aprovados: ${stats.orcamentos_aprovados}`);
            console.log(`  - Orçamentos convertidos: ${stats.orcamentos_convertidos}`);
            console.log(`  - Orçamentos expirados: ${stats.orcamentos_expirados}`);

            // Verificar dados na página
            console.log('📊 DADOS NA PÁGINA:');
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
                    const pageValue = parseInt(element.textContent.replace(/\D/g, '')) || 0;
                    const dbValue = stats[id.replace('-', '_')] || 0;

                    console.log(`  ${label}:`);
                    console.log(`    Banco: ${dbValue}`);
                    console.log(`    Página: ${pageValue}`);

                    if (pageValue !== dbValue) {
                        console.log(`    ❌ DIFERENÇA: ${pageValue} ≠ ${dbValue}`);

                        // Corrigir imediatamente
                        element.textContent = dbValue.toLocaleString('pt-BR');
                        console.log(`    ✅ Corrigido: ${element.textContent}`);
                    } else {
                        console.log(`    ✅ OK`);
                    }
                }
            });

        } else {
            console.log('❌ Erro na API:', data.error);
        }

    } catch (error) {
        console.log('❌ Erro ao verificar banco:', error.message);
    }
}

// Função para forçar sincronização
async function forceSync() {
    console.log('🔄 FORÇANDO SINCRONIZAÇÃO...');

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
            const stats = data.data.estatisticas;

            // 2. Atualizar todos os elementos
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
                }
            });

            console.log('✅ Sincronização concluída!');

        } else {
            throw new Error(data.error || 'Erro ao carregar dados');
        }

    } catch (error) {
        console.log('❌ Erro na sincronização:', error.message);
    }
}

// Função para mostrar diferenças
function showDifferences() {
    console.log('🔍 MOSTRANDO DIFERENÇAS:');

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
            const value = element.textContent;
            console.log(`  ${id}: ${value}`);
        }
    });
}

// Executar verificação
setTimeout(checkDatabaseData, 2000);

// Expor funções globalmente
window.checkDatabaseData = checkDatabaseData;
window.forceSync = forceSync;
window.showDifferences = showDifferences;

console.log('✅ Script de verificação do banco carregado!'); 