// ===== DIAGNÓSTICO E CORREÇÃO DO ERRO 400 NA API DE PRODUTOS =====
console.log('🔍 DIAGNÓSTICANDO ERRO 400 NA API DE PRODUTOS...');

// Função para diagnosticar o problema
async function diagnoseProdutoError() {
    console.log('🔍 DIAGNÓSTICO DO ERRO 400:');

    try {
        // 1. Verificar token
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.log('❌ Token não encontrado');
            return;
        }
        console.log('✅ Token encontrado');

        // 2. Verificar se o produto existe
        console.log('🔄 Verificando se o produto 20 existe...');
        const checkResponse = await fetch('/api/produtos/20', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`📊 Status da verificação: ${checkResponse.status}`);

        if (checkResponse.ok) {
            const produto = await checkResponse.json();
            console.log('✅ Produto encontrado:', produto);

            // 3. Verificar se o produto tem vendas ou orçamentos
            console.log('🔄 Verificando dependências do produto...');
            await checkProdutoDependencies(20);

        } else {
            console.log('❌ Produto não encontrado');
        }

    } catch (error) {
        console.log('❌ Erro no diagnóstico:', error.message);
    }
}

// Função para verificar dependências do produto
async function checkProdutoDependencies(produtoId) {
    try {
        const token = localStorage.getItem('authToken');

        // Verificar vendas
        const vendasResponse = await fetch(`/api/vendas?produto_id=${produtoId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (vendasResponse.ok) {
            const vendas = await vendasResponse.json();
            console.log(`📊 Vendas do produto: ${vendas.data?.length || 0}`);
        }

        // Verificar orçamentos
        const orcamentosResponse = await fetch(`/api/orcamentos?produto_id=${produtoId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (orcamentosResponse.ok) {
            const orcamentos = await orcamentosResponse.json();
            console.log(`📊 Orçamentos do produto: ${orcamentos.data?.length || 0}`);
        }

    } catch (error) {
        console.log('❌ Erro ao verificar dependências:', error.message);
    }
}

// Função para testar a exclusão sem autenticação
async function testDeleteWithoutAuth() {
    console.log('🧪 TESTANDO EXCLUSÃO SEM AUTENTICAÇÃO...');

    try {
        const response = await fetch('/api/produtos/20', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log(`📊 Status sem auth: ${response.status}`);

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Exclusão bem-sucedida:', result);
        } else {
            const error = await response.json();
            console.log('❌ Erro na exclusão:', error);
        }

    } catch (error) {
        console.log('❌ Erro no teste:', error.message);
    }
}

// Função para testar a exclusão com autenticação
async function testDeleteWithAuth() {
    console.log('🧪 TESTANDO EXCLUSÃO COM AUTENTICAÇÃO...');

    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.log('❌ Token não encontrado');
            return;
        }

        const response = await fetch('/api/produtos/20', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`📊 Status com auth: ${response.status}`);

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Exclusão bem-sucedida:', result);
        } else {
            const error = await response.json();
            console.log('❌ Erro na exclusão:', error);
        }

    } catch (error) {
        console.log('❌ Erro no teste:', error.message);
    }
}

// Função para corrigir o problema
async function fixProdutoDelete() {
    console.log('🔧 CORRIGINDO PROBLEMA DE EXCLUSÃO...');

    try {
        // 1. Verificar se o produto existe
        const token = localStorage.getItem('authToken');
        const checkResponse = await fetch('/api/produtos/20', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!checkResponse.ok) {
            console.log('❌ Produto não encontrado');
            return;
        }

        // 2. Tentar exclusão sem token (já que a rota não requer autenticação)
        console.log('🔄 Tentando exclusão sem token...');
        const deleteResponse = await fetch('/api/produtos/20', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log(`📊 Status da exclusão: ${deleteResponse.status}`);

        if (deleteResponse.ok) {
            const result = await deleteResponse.json();
            console.log('✅ Produto excluído com sucesso:', result);
        } else {
            const error = await deleteResponse.json();
            console.log('❌ Erro na exclusão:', error);

            // 3. Se o erro for por dependências, mostrar detalhes
            if (error.error && error.error.includes('venda') || error.error.includes('orçamento')) {
                console.log('ℹ️ Produto não pode ser excluído devido a dependências');
                console.log('💡 Solução: Remover dependências primeiro ou usar exclusão lógica');
            }
        }

    } catch (error) {
        console.log('❌ Erro na correção:', error.message);
    }
}

// Função para mostrar informações do produto
async function showProdutoInfo() {
    console.log('📊 INFORMAÇÕES DO PRODUTO 20:');

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/produtos/20', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const produto = await response.json();
            console.log('📦 Produto:', produto.data);
        } else {
            console.log('❌ Produto não encontrado');
        }

    } catch (error) {
        console.log('❌ Erro ao buscar produto:', error.message);
    }
}

// Executar diagnóstico
setTimeout(diagnoseProdutoError, 1000);

// Expor funções globalmente
window.diagnoseProdutoError = diagnoseProdutoError;
window.testDeleteWithoutAuth = testDeleteWithoutAuth;
window.testDeleteWithAuth = testDeleteWithAuth;
window.fixProdutoDelete = fixProdutoDelete;
window.showProdutoInfo = showProdutoInfo;

console.log('✅ Script de diagnóstico da API de produtos carregado!'); 