/**
 * Script de teste para verificar se as correções funcionaram
 * Execute este script no console do navegador após carregar a página
 */

console.log('🧪 Iniciando testes de correção...');

// Teste 1: Verificar se RequestManager está disponível
console.log('📋 Teste 1: RequestManager');
if (window.requestManager) {
    console.log('✅ RequestManager disponível');
    console.log('📊 Stats:', window.requestManager.getStats());
} else {
    console.error('❌ RequestManager não disponível');
}

// Teste 2: Verificar se API está disponível
console.log('📋 Teste 2: API');
if (window.api) {
    console.log('✅ API disponível');
} else {
    console.error('❌ API não disponível');
}

// Teste 3: Testar requisição direta para produtos
console.log('📋 Teste 3: Requisição direta produtos');
async function testProdutosDirect() {
    try {
        const response = await window.api.get('/api/produtos');
        console.log('✅ Requisição direta produtos OK:', response);
        return true;
    } catch (error) {
        console.error('❌ Erro na requisição direta produtos:', error);
        return false;
    }
}

// Teste 4: Testar requisição direta para vendas
console.log('📋 Teste 4: Requisição direta vendas');
async function testVendasDirect() {
    try {
        const response = await window.api.get('/api/vendas');
        console.log('✅ Requisição direta vendas OK:', response);
        return true;
    } catch (error) {
        console.error('❌ Erro na requisição direta vendas:', error);
        return false;
    }
}

// Teste 5: Testar RequestManager para produtos
console.log('📋 Teste 5: RequestManager produtos');
async function testProdutosRequestManager() {
    try {
        const response = await window.requestManager.manageRequest('TEST-PRODUTOS', async () => {
            return window.api.get('/api/produtos');
        });
        console.log('✅ RequestManager produtos OK:', response);
        return true;
    } catch (error) {
        console.error('❌ Erro no RequestManager produtos:', error);
        return false;
    }
}

// Teste 6: Testar RequestManager para vendas
console.log('📋 Teste 6: RequestManager vendas');
async function testVendasRequestManager() {
    try {
        const response = await window.requestManager.manageRequest('TEST-VENDAS', async () => {
            return window.api.get('/api/vendas');
        });
        console.log('✅ RequestManager vendas OK:', response);
        return true;
    } catch (error) {
        console.error('❌ Erro no RequestManager vendas:', error);
        return false;
    }
}

// Executar todos os testes
async function runAllTests() {
    console.log('🚀 Executando todos os testes...');

    const results = {
        directProdutos: await testProdutosDirect(),
        directVendas: await testVendasDirect(),
        requestManagerProdutos: await testProdutosRequestManager(),
        requestManagerVendas: await testVendasRequestManager()
    };

    console.log('📊 Resultados dos testes:', results);

    const allPassed = Object.values(results).every(result => result);

    if (allPassed) {
        console.log('🎉 Todos os testes passaram! As correções funcionaram.');
    } else {
        console.log('⚠️ Alguns testes falharam. Verificar logs acima.');
    }

    return results;
}

// Executar testes
runAllTests().then(results => {
    console.log('🏁 Testes concluídos. Resultados:', results);
}); 