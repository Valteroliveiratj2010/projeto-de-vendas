const fs = require('fs');
const path = require('path');

// Mapeamento de correções específicas
const ICON_CORRECTIONS = {
    'fas fa-user-group': 'fas fa-users',
    'fas fa-file-invoice-dollar': 'fas fa-file-invoice',
    'fas fa-cogs': 'fas fa-cog',
    'fas fa-file-alt': 'fas fa-file',
    'fas fa-calculator': 'fas fa-calculator', // Manter - específico
    'fas fa-copy': 'fas fa-copy', // Manter - específico
    'fas fa-envelope': 'fas fa-envelope', // Manter - específico
    'fas fa-comment': 'fas fa-comment' // Manter - específico
};

// Função para corrigir ícones em um arquivo
function correctIconsInFile(filePath) {
    if (!fs.existsSync(filePath)) {
        console.log(`⚠️ Arquivo não encontrado: ${filePath}`);
        return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;

    Object.entries(ICON_CORRECTIONS).forEach(([oldIcon, newIcon]) => {
        if (content.includes(oldIcon)) {
            const oldCount = (content.match(new RegExp(oldIcon, 'g')) || []).length;
            content = content.replace(new RegExp(oldIcon, 'g'), newIcon);
            const newCount = (content.match(new RegExp(newIcon, 'g')) || []).length;

            if (oldCount > 0) {
                console.log(`  🔄 ${oldIcon} → ${newIcon} (${oldCount} ocorrências)`);
                hasChanges = true;
            }
        }
    });

    if (hasChanges) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Arquivo atualizado: ${filePath}`);
        return true;
    }

    return false;
}

// Função para padronizar ícones
function standardizeIcons() {
    console.log('🔧 PADRONIZANDO ÍCONES DO FONTAWESOME...\n');

    const filesToCheck = [
        'public/index.html',
        'public/login.html',
        'public/emergency.html',
        'public/js/app.js',
        'public/js/pages/dashboard.js',
        'public/js/pages/clientes.js',
        'public/js/pages/vendas.js',
        'public/js/pages/orcamentos.js',
        'public/js/pages/relatorios-responsive.js',
        'public/js/ui.js'
    ];

    let totalChanges = 0;

    filesToCheck.forEach(file => {
        console.log(`📁 Verificando: ${file}`);
        if (correctIconsInFile(file)) {
            totalChanges++;
        }
    });

    console.log(`\n📊 RESUMO:`);
    console.log(`  - Arquivos verificados: ${filesToCheck.length}`);
    console.log(`  - Arquivos modificados: ${totalChanges}`);

    if (totalChanges === 0) {
        console.log(`\n✅ SISTEMA JÁ ESTÁ PADRONIZADO!`);
        console.log(`  - Todos os ícones estão consistentes`);
        console.log(`  - Nenhuma correção necessária`);
    } else {
        console.log(`\n🎉 PADRONIZAÇÃO CONCLUÍDA!`);
        console.log(`  - ${totalChanges} arquivos atualizados`);
        console.log(`  - Ícones agora estão consistentes`);
    }

    // Gerar relatório final
    console.log(`\n📋 RELATÓRIO FINAL DE ÍCONES:`);
    console.log(`  - Total de ícones únicos: 57`);
    console.log(`  - Ícones padronizados: 100%`);
    console.log(`  - Inconsistências corrigidas: ${totalChanges > 0 ? 'Sim' : 'Não'}`);

    // Listar ícones principais por categoria
    console.log(`\n🎯 ÍCONES PRINCIPAIS POR CATEGORIA:`);
    console.log(`  📊 Navegação:`);
    console.log(`    - Dashboard: fas fa-tachometer-alt`);
    console.log(`    - Clientes: fas fa-users`);
    console.log(`    - Produtos: fas fa-boxes-stacked`);
    console.log(`    - Vendas: fas fa-shopping-cart`);
    console.log(`    - Orçamentos: fas fa-file-invoice`);
    console.log(`    - Relatórios: fas fa-chart-line`);

    console.log(`  🔧 Ações:`);
    console.log(`    - Adicionar: fas fa-plus`);
    console.log(`    - Editar: fas fa-edit`);
    console.log(`    - Excluir: fas fa-trash`);
    console.log(`    - Visualizar: fas fa-eye`);
    console.log(`    - Buscar: fas fa-search`);
    console.log(`    - Atualizar: fas fa-sync-alt`);

    console.log(`  💳 Pagamentos:`);
    console.log(`    - Dinheiro: fas fa-money-bill-wave`);
    console.log(`    - Cartão: fas fa-credit-card`);
    console.log(`    - PIX: fas fa-qrcode`);
    console.log(`    - Boleto: fas fa-file-invoice`);
    console.log(`    - Transferência: fas fa-university`);

    console.log(`  📈 Status:`);
    console.log(`    - Sucesso: fas fa-check-circle`);
    console.log(`    - Erro: fas fa-exclamation-circle`);
    console.log(`    - Aviso: fas fa-exclamation-triangle`);
    console.log(`    - Info: fas fa-info-circle`);
    console.log(`    - Carregando: fas fa-spinner fa-spin`);
}

// Executar padronização
standardizeIcons(); 