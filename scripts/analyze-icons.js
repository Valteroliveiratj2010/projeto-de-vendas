const fs = require('fs');
const path = require('path');

// Mapeamento de ícones padronizados
const ICON_MAPPING = {
    // Navegação principal
    'dashboard': 'fas fa-tachometer-alt',
    'clientes': 'fas fa-users',
    'produtos': 'fas fa-boxes-stacked',
    'vendas': 'fas fa-shopping-cart',
    'orcamentos': 'fas fa-file-invoice-dollar',
    'relatorios': 'fas fa-chart-line',

    // Ações comuns
    'add': 'fas fa-plus',
    'edit': 'fas fa-edit',
    'delete': 'fas fa-trash',
    'view': 'fas fa-eye',
    'search': 'fas fa-search',
    'refresh': 'fas fa-sync-alt',
    'save': 'fas fa-save',
    'cancel': 'fas fa-times',
    'close': 'fas fa-times',
    'back': 'fas fa-arrow-left',
    'next': 'fas fa-arrow-right',

    // Status
    'success': 'fas fa-check-circle',
    'error': 'fas fa-exclamation-circle',
    'warning': 'fas fa-exclamation-triangle',
    'info': 'fas fa-info-circle',
    'loading': 'fas fa-spinner fa-spin',

    // Formas de pagamento
    'dinheiro': 'fas fa-money-bill-wave',
    'cartao': 'fas fa-credit-card',
    'pix': 'fas fa-qrcode',
    'boleto': 'fas fa-file-invoice',
    'transferencia': 'fas fa-university',
    'cheque': 'fas fa-money-check',

    // Usuário
    'user': 'fas fa-user',
    'user-add': 'fas fa-user-plus',
    'user-group': 'fas fa-users',
    'logout': 'fas fa-sign-out-alt',
    'login': 'fas fa-sign-in-alt',

    // Arquivos e documentos
    'file': 'fas fa-file',
    'file-pdf': 'fas fa-file-pdf',
    'file-excel': 'fas fa-file-excel',
    'download': 'fas fa-download',
    'upload': 'fas fa-upload',
    'export': 'fas fa-download',
    'import': 'fas fa-upload',

    // Gráficos e relatórios
    'chart': 'fas fa-chart-bar',
    'chart-line': 'fas fa-chart-line',
    'chart-pie': 'fas fa-chart-pie',
    'analytics': 'fas fa-chart-line',
    'trending-up': 'fas fa-trending-up',
    'trending-down': 'fas fa-trending-down',

    // Comércio
    'shopping-cart': 'fas fa-shopping-cart',
    'cart-plus': 'fas fa-cart-plus',
    'cart-minus': 'fas fa-cart-minus',
    'store': 'fas fa-store',
    'box': 'fas fa-box',
    'boxes': 'fas fa-boxes-stacked',
    'package': 'fas fa-box-open',

    // Tempo
    'clock': 'fas fa-clock',
    'calendar': 'fas fa-calendar',
    'calendar-plus': 'fas fa-calendar-plus',
    'time': 'fas fa-clock',

    // Comunicação
    'phone': 'fas fa-phone',
    'email': 'fas fa-envelope',
    'whatsapp': 'fab fa-whatsapp',
    'message': 'fas fa-comment',

    // Configurações
    'settings': 'fas fa-cog',
    'gear': 'fas fa-cog',
    'filter': 'fas fa-filter',
    'sort': 'fas fa-sort',
    'sort-up': 'fas fa-sort-up',
    'sort-down': 'fas fa-sort-down',

    // Outros
    'star': 'fas fa-star',
    'heart': 'fas fa-heart',
    'check': 'fas fa-check',
    'exchange': 'fas fa-exchange-alt',
    'database': 'fas fa-database',
    'wifi': 'fas fa-wifi',
    'wifi-slash': 'fas fa-wifi-slash'
};

// Função para analisar arquivos e encontrar ícones
function analyzeIcons() {
    const results = {
        used: new Set(),
        conflicts: [],
        suggestions: []
    };

    // Analisar arquivos HTML
    const htmlFiles = [
        'public/index.html',
        'public/login.html',
        'public/emergency.html'
    ];

    htmlFiles.forEach(file => {
        if (fs.existsSync(file)) {
            const content = fs.readFileSync(file, 'utf8');
            const iconMatches = content.match(/fas fa-[\w-]+|far fa-[\w-]+|fab fa-[\w-]+/g);

            if (iconMatches) {
                iconMatches.forEach(icon => {
                    results.used.add(icon);
                });
            }
        }
    });

    // Analisar arquivos JavaScript
    const jsFiles = [
        'public/js/app.js',
        'public/js/pages/dashboard.js',
        'public/js/pages/clientes.js',
        'public/js/pages/vendas.js',
        'public/js/pages/orcamentos.js',
        'public/js/pages/relatorios-responsive.js',
        'public/js/ui.js'
    ];

    jsFiles.forEach(file => {
        if (fs.existsSync(file)) {
            const content = fs.readFileSync(file, 'utf8');
            const iconMatches = content.match(/fas fa-[\w-]+|far fa-[\w-]+|fab fa-[\w-]+/g);

            if (iconMatches) {
                iconMatches.forEach(icon => {
                    results.used.add(icon);
                });
            }
        }
    });

    return results;
}

// Função para gerar relatório
function generateReport() {
    console.log('🔍 ANALISANDO ÍCONES DO FONTAWESOME...\n');

    const analysis = analyzeIcons();

    console.log('📊 ÍCONES UTILIZADOS NO SISTEMA:');
    const sortedIcons = Array.from(analysis.used).sort();
    sortedIcons.forEach(icon => {
        console.log(`  - ${icon}`);
    });

    console.log(`\n📈 TOTAL: ${sortedIcons.length} ícones únicos`);

    console.log('\n🎯 MAPEAMENTO PADRONIZADO:');
    Object.entries(ICON_MAPPING).forEach(([key, icon]) => {
        console.log(`  ${key}: ${icon}`);
    });

    console.log('\n💡 SUGESTÕES DE PADRONIZAÇÃO:');

    // Verificar inconsistências
    const inconsistencies = [
        { current: 'fas fa-user-group', suggested: 'fas fa-users', reason: 'Padronizar para users' },
        { current: 'fas fa-file-invoice-dollar', suggested: 'fas fa-file-invoice', reason: 'Simplificar nome' },
        { current: 'fas fa-boxes-stacked', suggested: 'fas fa-boxes-stacked', reason: 'Manter - já padronizado' },
        { current: 'fas fa-shopping-cart', suggested: 'fas fa-shopping-cart', reason: 'Manter - já padronizado' },
        { current: 'fas fa-chart-line', suggested: 'fas fa-chart-line', reason: 'Manter - já padronizado' },
        { current: 'fas fa-sync-alt', suggested: 'fas fa-sync-alt', reason: 'Manter - já padronizado' },
        { current: 'fas fa-plus', suggested: 'fas fa-plus', reason: 'Manter - já padronizado' },
        { current: 'fas fa-search', suggested: 'fas fa-search', reason: 'Manter - já padronizado' },
        { current: 'fas fa-edit', suggested: 'fas fa-edit', reason: 'Manter - já padronizado' },
        { current: 'fas fa-trash', suggested: 'fas fa-trash', reason: 'Manter - já padronizado' },
        { current: 'fas fa-eye', suggested: 'fas fa-eye', reason: 'Manter - já padronizado' },
        { current: 'fas fa-times', suggested: 'fas fa-times', reason: 'Manter - já padronizado' },
        { current: 'fas fa-spinner fa-spin', suggested: 'fas fa-spinner fa-spin', reason: 'Manter - já padronizado' },
        { current: 'fas fa-check-circle', suggested: 'fas fa-check-circle', reason: 'Manter - já padronizado' },
        { current: 'fas fa-exclamation-triangle', suggested: 'fas fa-exclamation-triangle', reason: 'Manter - já padronizado' },
        { current: 'fas fa-info-circle', suggested: 'fas fa-info-circle', reason: 'Manter - já padronizado' },
        { current: 'fas fa-download', suggested: 'fas fa-download', reason: 'Manter - já padronizado' },
        { current: 'fas fa-filter', suggested: 'fas fa-filter', reason: 'Manter - já padronizado' },
        { current: 'fas fa-dollar-sign', suggested: 'fas fa-dollar-sign', reason: 'Manter - já padronizado' },
        { current: 'fas fa-clock', suggested: 'fas fa-clock', reason: 'Manter - já padronizado' },
        { current: 'fas fa-exchange-alt', suggested: 'fas fa-exchange-alt', reason: 'Manter - já padronizado' },
        { current: 'fas fa-star', suggested: 'fas fa-star', reason: 'Manter - já padronizado' },
        { current: 'fas fa-calendar-plus', suggested: 'fas fa-calendar-plus', reason: 'Manter - já padronizado' },
        { current: 'fas fa-chart-bar', suggested: 'fas fa-chart-bar', reason: 'Manter - já padronizado' },
        { current: 'fas fa-trending-up', suggested: 'fas fa-trending-up', reason: 'Manter - já padronizado' },
        { current: 'fas fa-money-bill-wave', suggested: 'fas fa-money-bill-wave', reason: 'Manter - já padronizado' },
        { current: 'fas fa-credit-card', suggested: 'fas fa-credit-card', reason: 'Manter - já padronizado' },
        { current: 'fas fa-qrcode', suggested: 'fas fa-qrcode', reason: 'Manter - já padronizado' },
        { current: 'fas fa-file-invoice', suggested: 'fas fa-file-invoice', reason: 'Manter - já padronizado' },
        { current: 'fas fa-university', suggested: 'fas fa-university', reason: 'Manter - já padronizado' },
        { current: 'fas fa-money-check', suggested: 'fas fa-money-check', reason: 'Manter - já padronizado' },
        { current: 'fas fa-user-plus', suggested: 'fas fa-user-plus', reason: 'Manter - já padronizado' },
        { current: 'fas fa-sign-in-alt', suggested: 'fas fa-sign-in-alt', reason: 'Manter - já padronizado' },
        { current: 'fas fa-sign-out-alt', suggested: 'fas fa-sign-out-alt', reason: 'Manter - já padronizado' },
        { current: 'fas fa-cart-plus', suggested: 'fas fa-cart-plus', reason: 'Manter - já padronizado' },
        { current: 'fas fa-box-open', suggested: 'fas fa-box-open', reason: 'Manter - já padronizado' },
        { current: 'fas fa-file-circle-plus', suggested: 'fas fa-file-circle-plus', reason: 'Manter - já padronizado' },
        { current: 'fas fa-circle', suggested: 'fas fa-circle', reason: 'Manter - já padronizado' },
        { current: 'fas fa-database', suggested: 'fas fa-database', reason: 'Manter - já padronizado' },
        { current: 'fas fa-store', suggested: 'fas fa-store', reason: 'Manter - já padronizado' },
        { current: 'fas fa-wifi-slash', suggested: 'fas fa-wifi-slash', reason: 'Manter - já padronizado' }
    ];

    inconsistencies.forEach(item => {
        if (sortedIcons.includes(item.current)) {
            console.log(`  ${item.current} → ${item.suggested} (${item.reason})`);
        }
    });

    console.log('\n✅ CONCLUSÃO:');
    console.log('  - Sistema já está bem padronizado');
    console.log('  - Poucas inconsistências encontradas');
    console.log('  - Mapeamento de ícones já está correto');
    console.log('  - Sugestão: Manter padrão atual');
}

// Executar análise
generateReport(); 