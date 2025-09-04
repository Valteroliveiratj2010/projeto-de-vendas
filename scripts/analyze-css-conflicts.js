const fs = require('fs');
const path = require('path');

// Função para analisar conflitos de CSS
function analyzeCSSConflicts() {
    console.log('🔍 ANALISANDO CONFLITOS DE CSS E ÍCONES...\n');

    const cssFiles = [
        'public/css/critical.css',
        'public/css/styles.css',
        'public/css/components.css',
        'public/css/ui.css',
        'public/css/buttons-consolidated.css',
        'public/css/icons-unified.css',
        'public/css/fontawesome-local.css',
        'public/css/responsive-consolidated.css',
        'public/css/hamburger-menu-enhanced.css',
        'public/css/sidebar-overlay.css',
        'public/css/modals.css',
        'public/css/tables.css',
        'public/css/forms.css',
        'public/css/charts.css',
        'public/css/payment-notifications.css',
        'public/css/payment-activities.css',
        'public/css/page-margins.css',
        'public/css/dashboard-desktop-improvements.css',
        'public/css/responsive-field-hiding.css',
        'public/css/venda-details-modal.css'
    ];

    const conflicts = {
        duplicateRules: [],
        conflictingIcons: [],
        missingFiles: [],
        fontAwesomeConflicts: []
    };

    // Verificar arquivos existentes
    cssFiles.forEach(file => {
        if (!fs.existsSync(file)) {
            conflicts.missingFiles.push(file);
        }
    });

    console.log('📁 ARQUIVOS CSS VERIFICADOS:');
    cssFiles.forEach(file => {
        const exists = fs.existsSync(file);
        const size = exists ? fs.statSync(file).size : 0;
        console.log(`  ${exists ? '✅' : '❌'} ${file} (${size} bytes)`);
    });

    // Analisar conflitos específicos
    console.log('\n🔍 ANALISANDO CONFLITOS ESPECÍFICOS...');

    // Verificar fontawesome-local.css
    if (fs.existsSync('public/css/fontawesome-local.css')) {
        const content = fs.readFileSync('public/css/fontawesome-local.css', 'utf8');
        const iconDefinitions = content.match(/\.fa-[^:]+::before\s*{[^}]*content:\s*"\\[^"]+"/g);

        console.log('\n📊 DEFINIÇÕES DE ÍCONES EM FONTAWESOME-LOCAL.CSS:');
        if (iconDefinitions) {
            iconDefinitions.forEach(def => {
                const iconName = def.match(/\.fa-([^:]+)::before/)?.[1];
                const content = def.match(/content:\s*"\\[^"]+"/)?.[0];
                console.log(`  - ${iconName}: ${content}`);
            });
        }
    }

    // Verificar icons-unified.css
    if (fs.existsSync('public/css/icons-unified.css')) {
        const content = fs.readFileSync('public/css/icons-unified.css', 'utf8');
        const iconDefinitions = content.match(/\.fa-[^:]+::before\s*{[^}]*content:\s*"\\[^"]+"/g);

        console.log('\n📊 DEFINIÇÕES DE ÍCONES EM ICONS-UNIFIED.CSS:');
        if (iconDefinitions) {
            iconDefinitions.forEach(def => {
                const iconName = def.match(/\.fa-([^:]+)::before/)?.[1];
                const content = def.match(/content:\s*"\\[^"]+"/)?.[0];
                console.log(`  - ${iconName}: ${content}`);
            });
        }
    }

    // Verificar se há duplicatas
    console.log('\n🔍 VERIFICANDO DUPLICATAS...');

    const allIconDefinitions = new Map();

    cssFiles.forEach(file => {
        if (fs.existsSync(file)) {
            const content = fs.readFileSync(file, 'utf8');
            const iconMatches = content.match(/\.fa-[^:]+::before\s*{[^}]*content:\s*"\\[^"]+"/g);

            if (iconMatches) {
                iconMatches.forEach(def => {
                    const iconName = def.match(/\.fa-([^:]+)::before/)?.[1];
                    const content = def.match(/content:\s*"\\[^"]+"/)?.[0];

                    if (iconName && content) {
                        if (allIconDefinitions.has(iconName)) {
                            const existing = allIconDefinitions.get(iconName);
                            if (existing.content !== content) {
                                conflicts.conflictingIcons.push({
                                    icon: iconName,
                                    file1: existing.file,
                                    content1: existing.content,
                                    file2: file,
                                    content2: content
                                });
                            }
                        } else {
                            allIconDefinitions.set(iconName, {
                                file: file,
                                content: content
                            });
                        }
                    }
                });
            }
        }
    });

    // Relatório de conflitos
    console.log('\n⚠️ CONFLITOS IDENTIFICADOS:');

    if (conflicts.missingFiles.length > 0) {
        console.log('\n❌ ARQUIVOS FALTANDO:');
        conflicts.missingFiles.forEach(file => {
            console.log(`  - ${file}`);
        });
    }

    if (conflicts.conflictingIcons.length > 0) {
        console.log('\n🔄 CONFLITOS DE ÍCONES:');
        conflicts.conflictingIcons.forEach(conflict => {
            console.log(`  - ${conflict.icon}:`);
            console.log(`    ${conflict.file1}: ${conflict.content1}`);
            console.log(`    ${conflict.file2}: ${conflict.content2}`);
        });
    } else {
        console.log('  ✅ Nenhum conflito de ícones encontrado');
    }

    // Sugestões de correção
    console.log('\n💡 SUGESTÕES DE CORREÇÃO:');

    if (conflicts.missingFiles.length > 0) {
        console.log('  1. Remover referências a arquivos CSS inexistentes do index.html');
    }

    if (conflicts.conflictingIcons.length > 0) {
        console.log('  2. Consolidar definições de ícones em um único arquivo');
        console.log('  3. Remover duplicatas de definições de ícones');
    }

    console.log('  4. Verificar ordem de carregamento dos CSS');
    console.log('  5. Usar apenas um arquivo de ícones principal');

    // Verificar ordem de carregamento no HTML
    console.log('\n📋 ORDEM DE CARREGAMENTO NO INDEX.HTML:');
    const htmlContent = fs.readFileSync('public/index.html', 'utf8');
    const cssLinks = htmlContent.match(/href="[^"]*\.css[^"]*"/g);

    if (cssLinks) {
        cssLinks.forEach((link, index) => {
            console.log(`  ${index + 1}. ${link}`);
        });
    }

    console.log('\n✅ ANÁLISE CONCLUÍDA!');
}

// Executar análise
analyzeCSSConflicts(); 