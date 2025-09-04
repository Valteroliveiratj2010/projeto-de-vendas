// ===== TESTE DA API DE DASHBOARD =====
console.log('🧪 TESTANDO API DE DASHBOARD...');

// Função para testar a API
async function testDashboardAPI() {
    try {
        console.log('🧪 Testando conexão com a API...');

        const token = localStorage.getItem('authToken');
        if (!token) {
            console.log('❌ Token não encontrado');
            return false;
        }

        const response = await fetch('/api/relatorios/dashboard', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`📊 Status da resposta: ${response.status}`);

        if (!response.ok) {
            console.log(`❌ Erro HTTP: ${response.status} ${response.statusText}`);
            return false;
        }

        const data = await response.json();
        console.log('📊 Dados recebidos:', data);

        if (data.success) {
            console.log('✅ API funcionando corretamente');
            console.log('📈 Estatísticas:', data.data.estatisticas);
            console.log('📦 Estoque baixo:', data.data.estoque_baixo);
            return true;
        } else {
            console.log('❌ API retornou erro:', data.error);
            return false;
        }

    } catch (error) {
        console.log('❌ Erro ao testar API:', error.message);
        return false;
    }
}

// Função para mostrar dados da API
function showDashboardData() {
    console.log('📊 MOSTRANDO DADOS DA DASHBOARD...');

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
            console.log(`${id}: ${element.textContent}`);
        } else {
            console.log(`${id}: Elemento não encontrado`);
        }
    });
}

// Executar teste quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', testDashboardAPI);
} else {
    testDashboardAPI();
}

// Executar também após delay
setTimeout(testDashboardAPI, 3000);

// Expor funções globalmente
window.testDashboardAPI = testDashboardAPI;
window.showDashboardData = showDashboardData;

console.log('✅ Script de teste da API carregado!'); 