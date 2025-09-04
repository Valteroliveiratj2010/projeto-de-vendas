/**
 * Script para otimizar carregamento de CSS
 * Consolida múltiplos arquivos CSS em um único arquivo para melhor performance
 */

const fs = require('fs');
const path = require('path');

// Lista de arquivos CSS em ordem de prioridade
const cssFiles = [
    // CSS base
    'public/css/styles.css',
    'public/css/components.css',
    'public/css/ui.css',

    // CSS de componentes específicos
    'public/css/buttons.css',
    'public/css/forms.css',
    'public/css/tables.css',
    'public/css/modals.css',

    // CSS responsivo
    'public/css/responsive-enhanced.css',
    'public/css/global-responsive.css',
    'public/css/responsive-global-enhanced.css',

    // CSS específico de páginas
    'public/css/dashboard-responsive.css',
    'public/css/pages-responsive.css',
    'public/css/reports-responsive.css',
    'public/css/clientes-responsive-fixes.css',

    // CSS de ícones
    'public/css/fontawesome-local.css',
    'public/css/force-cleanup-icons.css',
    'public/css/sidebar-icons.css',

    // CSS de funcionalidades específicas
    'public/css/charts.css',
    'public/css/payment-notifications.css',
    'public/css/payment-activities.css',
    'public/css/venda-details-modal.css',

    // CSS de correções
    'public/css/page-margins.css',
    'public/css/button-responsive-fixes.css',
    'public/css/button-logout-fixes.css',
    'public/css/action-buttons.css',
    'public/css/action-buttons-fixes.css',
    'public/css/mobile-small-fixes.css',
    'public/css/header-margin-fix.css',
    'public/css/sidebar-margin-fix.css',
    'public/css/overlay-height-fix.css',
    'public/css/hamburger-menu-enhanced.css',
    'public/css/sidebar-overlay.css',
    'public/css/hamburger-overlay-sync-fix.css',
    'public/css/table-buttons-professional-colors.css',
    'public/css/dashboard-desktop-improvements.css',
    'public/css/icon-standardization.css',
    'public/css/icon-standardization-complete.css',
    'public/css/icons-professional.css',
    'public/css/icons-emergency-fix.css',
    'public/css/sidebar-icons-enhanced.css',
    'public/css/sidebar-icons-simple.css',
    'public/css/responsive-field-hiding.css',
    'public/css/page-action-buttons-fixes.css'
];

// Função para ler arquivo CSS
function readCssFile(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            console.log(`✅ Lido: ${filePath}`);
            return `/* ${path.basename(filePath)} */\n${content}\n\n`;
        } else {
            console.warn(`⚠️ Arquivo não encontrado: ${filePath}`);
            return '';
        }
    } catch (error) {
        console.error(`❌ Erro ao ler ${filePath}:`, error.message);
        return '';
    }
}

// Função para consolidar CSS
function consolidateCss() {
    console.log('🎨 Iniciando consolidação de CSS...');

    let consolidatedCss = '/* CSS Consolidado - Sistema de Vendas */\n';
    consolidatedCss += '/* Gerado automaticamente - Não editar diretamente */\n\n';

    let totalSize = 0;
    let filesProcessed = 0;

    for (const cssFile of cssFiles) {
        const content = readCssFile(cssFile);
        if (content) {
            consolidatedCss += content;
            totalSize += content.length;
            filesProcessed++;
        }
    }

    // Salvar arquivo consolidado
    const outputPath = 'public/css/consolidated.css';
    fs.writeFileSync(outputPath, consolidatedCss, 'utf8');

    console.log(`✅ CSS consolidado salvo em: ${outputPath}`);
    console.log(`📊 Estatísticas:`);
    console.log(`   - Arquivos processados: ${filesProcessed}/${cssFiles.length}`);
    console.log(`   - Tamanho total: ${(totalSize / 1024).toFixed(2)} KB`);
    console.log(`   - Tamanho do arquivo consolidado: ${(consolidatedCss.length / 1024).toFixed(2)} KB`);

    return outputPath;
}

// Função para criar arquivo CSS otimizado para produção
function createOptimizedCss() {
    console.log('🚀 Criando CSS otimizado para produção...');

    const consolidatedPath = consolidateCss();
    const optimizedPath = 'public/css/optimized.css';

    // Ler CSS consolidado
    let css = fs.readFileSync(consolidatedPath, 'utf8');

    // Otimizações básicas
    css = css
        // Remover comentários desnecessários
        .replace(/\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\//g, '')
        // Remover espaços em branco extras
        .replace(/\s+/g, ' ')
        .replace(/\s*{\s*/g, '{')
        .replace(/\s*}\s*/g, '}')
        .replace(/\s*;\s*/g, ';')
        .replace(/\s*:\s*/g, ':')
        .replace(/\s*,\s*/g, ',')
        // Remover espaços no final
        .trim();

    fs.writeFileSync(optimizedPath, css, 'utf8');

    console.log(`✅ CSS otimizado salvo em: ${optimizedPath}`);
    console.log(`📊 Redução de tamanho: ${((1 - css.length / fs.readFileSync(consolidatedPath, 'utf8').length) * 100).toFixed(2)}%`);

    return optimizedPath;
}

// Função principal
function main() {
    try {
        console.log('🎨 Iniciando otimização de CSS...');

        // Criar versão consolidada
        const consolidatedPath = consolidateCss();

        // Criar versão otimizada
        const optimizedPath = createOptimizedCss();

        console.log('🎉 Otimização de CSS concluída!');
        console.log('💡 Para usar o CSS otimizado, substitua os múltiplos links por:');
        console.log(`   <link rel="stylesheet" href="/css/optimized.css">`);

    } catch (error) {
        console.error('❌ Erro durante otimização:', error);
        process.exit(1);
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    main();
}

module.exports = {
    consolidateCss,
    createOptimizedCss,
    main
}; 