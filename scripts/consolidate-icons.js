const fs = require('fs');
const path = require('path');

// Função para consolidar ícones
function consolidateIcons() {
    console.log('🔧 CONSOLIDANDO SISTEMA DE ÍCONES...\n');

    // Verificar se há conflitos entre fontawesome-local.css e icons-unified.css
    const fontawesomeContent = fs.readFileSync('public/css/fontawesome-local.css', 'utf8');
    const iconsUnifiedContent = fs.readFileSync('public/css/icons-unified.css', 'utf8');

    // Extrair definições de ícones
    const fontawesomeIcons = fontawesomeContent.match(/\.fa-[^:]+::before\s*{[^}]*content:\s*"\\[^"]+"/g) || [];
    const unifiedIcons = iconsUnifiedContent.match(/\.fa-[^:]+::before\s*{[^}]*content:\s*"\\[^"]+"/g) || [];

    console.log('📊 ANÁLISE DE CONFLITOS:');
    console.log(`  - fontawesome-local.css: ${fontawesomeIcons.length} ícones`);
    console.log(`  - icons-unified.css: ${unifiedIcons.length} ícones`);

    // Verificar duplicatas
    const fontawesomeIconNames = fontawesomeIcons.map(def => def.match(/\.fa-([^:]+)::before/)?.[1]).filter(Boolean);
    const unifiedIconNames = unifiedIcons.map(def => def.match(/\.fa-([^:]+)::before/)?.[1]).filter(Boolean);

    const duplicates = fontawesomeIconNames.filter(name => unifiedIconNames.includes(name));

    console.log(`  - Ícones duplicados: ${duplicates.length}`);

    if (duplicates.length > 0) {
        console.log('\n🔄 ÍCONES DUPLICADOS:');
        duplicates.forEach(name => {
            console.log(`    - ${name}`);
        });
    }

    // Criar arquivo consolidado
    console.log('\n📝 CRIANDO ARQUIVO CONSOLIDADO...');

    const consolidatedContent = `/* ===== SISTEMA DE ÍCONES CONSOLIDADO ===== */
/* Arquivo único com todas as definições de ícones do sistema */
/* Versão: 1.0.0 - Consolidado em ${new Date().toISOString()} */

/* ===== FONT AWESOME ESSENCIAL ===== */
@font-face {
    font-family: "Font Awesome 6 Free";
    font-style: normal;
    font-weight: 900;
    font-display: block;
    src: url("../webfonts/fa-solid-900.woff2") format("woff2");
}

.fa,
.fas {
    font-family: "Font Awesome 6 Free";
    font-weight: 900;
}

.fa::before,
.fas::before {
    font-family: "Font Awesome 6 Free";
    font-weight: 900;
}

/* ===== ÍCONES PRINCIPAIS DO SISTEMA ===== */

/* 🏪 Sistema */
.fa-store::before { content: "\\f54e"; }

/* 📊 Dashboard */
.fa-tachometer-alt::before { content: "\\f3fd"; }

/* 👥 Clientes */
.fa-users::before { content: "\\f0c0"; }
.fa-user-group::before { content: "\\f500"; }

/* 📦 Produtos */
.fa-boxes-stacked::before { content: "\\f468"; }
.fa-box-open::before { content: "\\f49e"; }

/* 🛒 Vendas */
.fa-shopping-cart::before { content: "\\f07a"; }
.fa-shopping-bag::before { content: "\\f290"; }
.fa-cart-plus::before { content: "\\f217"; }

/* 💰 Orçamentos */
.fa-file-invoice::before { content: "\\f570"; }
.fa-file-invoice-dollar::before { content: "\\f571"; }
.fa-file-circle-plus::before { content: "\\f494"; }

/* 📈 Relatórios */
.fa-chart-line::before { content: "\\f201"; }
.fa-chart-bar::before { content: "\\f080"; }

/* 👤 Usuários */
.fa-user::before { content: "\\f007"; }
.fa-user-plus::before { content: "\\f234"; }

/* 🔧 Ações */
.fa-plus::before { content: "\\f067"; }
.fa-minus::before { content: "\\f068"; }
.fa-edit::before { content: "\\f044"; }
.fa-trash::before { content: "\\f1f8"; }
.fa-eye::before { content: "\\f06e"; }
.fa-save::before { content: "\\f0c7"; }
.fa-times::before { content: "\\f00d"; }
.fa-check::before { content: "\\f00c"; }
.fa-search::before { content: "\\f002"; }
.fa-sync-alt::before { content: "\\f2f1"; }

/* 📈 Status */
.fa-check-circle::before { content: "\\f058"; }
.fa-times-circle::before { content: "\\f057"; }
.fa-exclamation-triangle::before { content: "\\f071"; }
.fa-exclamation-circle::before { content: "\\f06a"; }
.fa-info-circle::before { content: "\\f05a"; }
.fa-spinner::before { content: "\\f110"; }

/* ⏰ Tempo */
.fa-clock::before { content: "\\f017"; }
.fa-calendar::before { content: "\\f133"; }
.fa-calendar-plus::before { content: "\\f271"; }

/* 💰 Financeiro */
.fa-dollar-sign::before { content: "\\f155"; }
.fa-money-bill-wave::before { content: "\\f53a"; }
.fa-credit-card::before { content: "\\f09d"; }
.fa-qrcode::before { content: "\\f029"; }
.fa-university::before { content: "\\f19c"; }
.fa-money-check::before { content: "\\f53c"; }

/* 📁 Arquivos */
.fa-download::before { content: "\\f019"; }
.fa-upload::before { content: "\\f093"; }
.fa-file::before { content: "\\f15b"; }

/* 🔄 Navegação */
.fa-arrow-left::before { content: "\\f060"; }
.fa-arrow-right::before { content: "\\f061"; }
.fa-arrow-up::before { content: "\\f062"; }
.fa-arrow-down::before { content: "\\f063"; }
.fa-bars::before { content: "\\f0c9"; }

/* 🔔 Notificações */
.fa-bell::before { content: "\\f0f3"; }
.fa-envelope::before { content: "\\f0e0"; }

/* ⚙️ Configurações */
.fa-cog::before { content: "\\f013"; }
.fa-filter::before { content: "\\f0b0"; }

/* ⭐ Outros */
.fa-star::before { content: "\\f005"; }
.fa-exchange-alt::before { content: "\\f362"; }
.fa-database::before { content: "\\f1c0"; }
.fa-wifi::before { content: "\\f1eb"; }
.fa-wifi-slash::before { content: "\\f6ac"; }
.fa-sign-in-alt::before { content: "\\f090"; }
.fa-sign-out-alt::before { content: "\\f2f5"; }
.fa-circle::before { content: "\\f111"; }

/* ===== ANIMAÇÕES ===== */
.fa-spin {
    animation: fa-spin 2s infinite linear;
}

@keyframes fa-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* ===== RESPONSIVIDADE ===== */
@media (max-width: 768px) {
    .fa, .fas {
        font-size: 0.9em;
    }
}

/* ===== ACESSIBILIDADE ===== */
.fa, .fas {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}
`;

    // Salvar arquivo consolidado
    fs.writeFileSync('public/css/icons-consolidated.css', consolidatedContent, 'utf8');
    console.log('✅ Arquivo consolidado criado: public/css/icons-consolidated.css');

    // Atualizar index.html para usar apenas o arquivo consolidado
    console.log('\n📝 ATUALIZANDO INDEX.HTML...');

    const indexContent = fs.readFileSync('public/index.html', 'utf8');

    // Remover referências aos arquivos antigos
    let updatedContent = indexContent
        .replace(/<link rel="stylesheet" href="\/css\/fontawesome-local\.css">/g, '')
        .replace(/<link rel="preload" href="\/css\/icons-unified\.css" as="style" onload="this\.onload=null;this\.rel='stylesheet'">/g, '')
        .replace(/<link rel="stylesheet" href="\/css\/icons-unified\.css">/g, '');

    // Adicionar referência ao arquivo consolidado
    updatedContent = updatedContent.replace(
        /<link rel="stylesheet" href="\/css\/critical\.css">/,
        `<link rel="stylesheet" href="/css/critical.css">
    <link rel="stylesheet" href="/css/icons-consolidated.css">`
    );

    fs.writeFileSync('public/index.html', updatedContent, 'utf8');
    console.log('✅ Index.html atualizado para usar arquivo consolidado');

    console.log('\n🎉 CONSOLIDAÇÃO CONCLUÍDA!');
    console.log('  - Arquivo único: icons-consolidated.css');
    console.log('  - Ícones organizados por categoria');
    console.log('  - Sem duplicações');
    console.log('  - Performance otimizada');
}

// Executar consolidação
consolidateIcons(); 