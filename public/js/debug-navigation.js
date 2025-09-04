// Script para diagnosticar problemas de navegação
console.log('🔍 DIAGNÓSTICO DE NAVEGAÇÃO - INICIANDO...');

// Verificar se as páginas existem no DOM
const pages = ['dashboard', 'clientes', 'produtos', 'vendas', 'orcamentos', 'relatorios'];
console.log('📋 VERIFICANDO PÁGINAS NO DOM:');

pages.forEach(page => {
    const pageElement = document.getElementById(`${page}-page`);
    if (pageElement) {
        console.log(`✅ ${page}-page: ENCONTRADA`);
        console.log(`   - Classes: ${pageElement.className}`);
        console.log(`   - Display: ${window.getComputedStyle(pageElement).display}`);
        console.log(`   - Visibility: ${window.getComputedStyle(pageElement).visibility}`);
        console.log(`   - Active: ${pageElement.classList.contains('active')}`);
    } else {
        console.log(`❌ ${page}-page: NÃO ENCONTRADA`);
    }
});

// Verificar se o app.js está carregado
console.log('\n📋 VERIFICANDO APP.JS:');
if (window.SistemaVendas) {
    console.log('✅ SistemaVendas: CARREGADO');
    console.log(`   - Current page: ${window.SistemaVendas.currentPage}`);
    console.log(`   - Window currentPage: ${window.currentPage}`);
} else {
    console.log('❌ SistemaVendas: NÃO CARREGADO');
}

// Verificar se as classes das páginas estão carregadas
console.log('\n📋 VERIFICANDO CLASSES DAS PÁGINAS:');
const pageClasses = ['DashboardPage', 'ClientesPage', 'ProdutosPage', 'VendasPage', 'OrcamentosPage', 'RelatoriosResponsivos'];
pageClasses.forEach(className => {
    if (window[className]) {
        console.log(`✅ ${className}: CARREGADA`);
    } else {
        console.log(`❌ ${className}: NÃO CARREGADA`);
    }
});

// Verificar event listeners da sidebar
console.log('\n📋 VERIFICANDO EVENT LISTENERS DA SIDEBAR:');
const navItems = document.querySelectorAll('.nav-item');
console.log(`📊 Total de itens de navegação: ${navItems.length}`);

navItems.forEach((item, index) => {
    const page = item.getAttribute('data-page');
    const link = item.querySelector('a');
    console.log(`📋 Item ${index + 1}: ${page}`);
    console.log(`   - Link href: ${link ? link.href : 'N/A'}`);
    console.log(`   - Active: ${item.classList.contains('active')}`);
});

// Verificar hash atual
console.log('\n📋 VERIFICANDO HASH ATUAL:');
console.log(`   - Hash: ${window.location.hash}`);
console.log(`   - Pathname: ${window.location.pathname}`);
console.log(`   - Search: ${window.location.search}`);

// Verificar se há erros no console
console.log('\n📋 VERIFICANDO ERROS:');
window.addEventListener('error', (event) => {
    console.error('❌ ERRO DETECTADO:', event.error);
});

// Testar navegação manual
console.log('\n📋 TESTANDO NAVEGAÇÃO MANUAL:');
setTimeout(() => {
    console.log('🔄 Testando navegação para clientes...');
    if (window.SistemaVendas && window.SistemaVendas.navigateToPage) {
        window.SistemaVendas.navigateToPage('clientes');
    } else {
        console.log('❌ SistemaVendas.navigateToPage não disponível');
    }
}, 2000);

console.log('✅ DIAGNÓSTICO CONCLUÍDO!'); 