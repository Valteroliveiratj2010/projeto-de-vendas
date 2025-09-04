// ===== VERIFICAÇÃO DE ÍCONES FONT AWESOME =====
// Script para verificar se os ícones estão sendo exibidos corretamente

console.log('🔍 Iniciando verificação de ícones Font Awesome...');

// Função para verificar se um ícone está sendo exibido
function checkIcon(iconClass, iconName) {
    const icon = document.querySelector(iconClass);
    if (icon) {
        const computedStyle = window.getComputedStyle(icon, '::before');
        const content = computedStyle.getPropertyValue('content');

        if (content && content !== 'none' && content !== 'normal') {
            console.log(`✅ ${iconName}: ${content}`);
            return true;
        } else {
            console.log(`❌ ${iconName}: Não encontrado (${content})`);
            return false;
        }
    } else {
        console.log(`⚠️ ${iconName}: Elemento não encontrado`);
        return false;
    }
}

// Função para verificar todos os ícones importantes
function checkAllIcons() {
    console.log('📋 Verificando ícones do sistema...');

    const icons = [
        { class: '.fa-store', name: 'Sistema' },
        { class: '.fa-tachometer-alt', name: 'Dashboard' },
        { class: '.fa-user-group', name: 'Clientes' },
        { class: '.fa-boxes-stacked', name: 'Produtos' },
        { class: '.fa-shopping-cart', name: 'Vendas' },
        { class: '.fa-file-invoice-dollar', name: 'Orçamentos' },
        { class: '.fa-chart-line', name: 'Relatórios' },
        { class: '.fa-cart-plus', name: 'Nova Venda' },
        { class: '.fa-user-plus', name: 'Novo Cliente' },
        { class: '.fa-box-open', name: 'Novo Produto' },
        { class: '.fa-file-circle-plus', name: 'Novo Orçamento' }
    ];

    let successCount = 0;
    let totalCount = icons.length;

    icons.forEach(icon => {
        if (checkIcon(icon.class, icon.name)) {
            successCount++;
        }
    });

    console.log(`📊 Resultado: ${successCount}/${totalCount} ícones funcionando`);

    if (successCount === totalCount) {
        console.log('🎉 Todos os ícones estão funcionando corretamente!');
    } else {
        console.log('⚠️ Alguns ícones não estão funcionando. Verifique o CSS.');
    }
}

// Função para forçar a aplicação dos ícones
function forceIcons() {
    console.log('🔧 Forçando aplicação dos ícones...');

    // Forçar font-family em todos os ícones
    const allIcons = document.querySelectorAll('.fa, .fas, .far, .fab');
    allIcons.forEach(icon => {
        icon.style.fontFamily = '"Font Awesome 6 Free"';
        icon.style.fontWeight = '900';
        icon.style.display = 'inline-block';
        icon.style.visibility = 'visible';
        icon.style.opacity = '1';
    });

    console.log(`🔧 Aplicado em ${allIcons.length} elementos`);
}

// Executar verificações
document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 DOM carregado, verificando ícones...');

    // Aguardar um pouco para o CSS carregar
    setTimeout(() => {
        checkAllIcons();
        forceIcons();

        // Verificar novamente após 2 segundos
        setTimeout(checkAllIcons, 2000);
    }, 1000);
});

// Verificar quando a página estiver totalmente carregada
window.addEventListener('load', function () {
    console.log('🌐 Página totalmente carregada, verificação final...');
    setTimeout(checkAllIcons, 500);
});

// Exportar funções para uso global
window.IconChecker = {
    checkAllIcons,
    forceIcons,
    checkIcon
};

console.log('🎨 Icon Checker JS carregado!'); 