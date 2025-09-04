/**
 * ===== SCRIPT DE BUILD SIMPLIFICADO =====
 * Gera arquivos otimizados para produção
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Iniciando build simplificado...');

// Criar pasta dist se não existir
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath, { recursive: true });
    console.log('✅ Pasta dist criada');
}

// Criar pasta js em dist
const jsPath = path.join(distPath, 'js');
if (!fs.existsSync(jsPath)) {
    fs.mkdirSync(jsPath, { recursive: true });
    console.log('✅ Pasta js criada');
}

// Criar pasta css em dist
const cssPath = path.join(distPath, 'css');
if (!fs.existsSync(cssPath)) {
    fs.mkdirSync(cssPath, { recursive: true });
    console.log('✅ Pasta css criada');
}

// Copiar arquivos JavaScript essenciais
const jsFiles = [
    'public/js/app.js',
    'public/js/api.js',
    'public/js/auth.js',
    'public/js/database.js',
    'public/js/ui.js',
    'public/js/dashboard.js',
    'public/js/shared/ModulesLoader.js',
    'public/js/shared/AppConfig.js',
    'public/js/shared/StateManager.js',
    'public/js/shared/Router.js',
    'public/js/shared/APIManager.js',
    'public/js/shared/Logger.js',
    'public/js/shared/Validator.js'
];

console.log('📁 Copiando arquivos JavaScript...');
jsFiles.forEach(file => {
    const sourcePath = path.join(__dirname, file);
    const fileName = path.basename(file);
    const destPath = path.join(jsPath, fileName);

    if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`✅ ${fileName} copiado`);
    } else {
        console.log(`⚠️ ${fileName} não encontrado`);
    }
});

// Copiar arquivos CSS essenciais
const cssFiles = [
    'public/css/styles.css',
    'public/css/icons-unified.css',
    'public/css/responsive-consolidated.css',
    'public/css/button-enhancements.css',
    'public/css/pages-responsive.css',
    'public/css/forms.css',
    'public/css/components.css',
    'public/css/ui.css',
    'public/css/tables.css',
    'public/css/modals.css',
    'public/css/charts.css'
];

console.log('🎨 Copiando arquivos CSS...');
cssFiles.forEach(file => {
    const sourcePath = path.join(__dirname, file);
    const fileName = path.basename(file);
    const destPath = path.join(cssPath, fileName);

    if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`✅ ${fileName} copiado`);
    } else {
        console.log(`⚠️ ${fileName} não encontrado`);
    }
});

// Copiar HTML principal
const htmlSource = path.join(__dirname, 'public/index.html');
const htmlDest = path.join(distPath, 'index.html');

if (fs.existsSync(htmlSource)) {
    let htmlContent = fs.readFileSync(htmlSource, 'utf8');

    // Atualizar referências para arquivos otimizados
    htmlContent = htmlContent.replace(/href="\/css\//g, 'href="css/');
    htmlContent = htmlContent.replace(/src="\/js\//g, 'src="js/');

    fs.writeFileSync(htmlDest, htmlContent);
    console.log('✅ index.html copiado e otimizado');
}

// Copiar outros arquivos essenciais
const otherFiles = [
    'public/favicon.ico',
    'public/manifest.json',
    'public/service-worker.js'
];

console.log('📄 Copiando outros arquivos...');
otherFiles.forEach(file => {
    const sourcePath = path.join(__dirname, file);
    const fileName = path.basename(file);
    const destPath = path.join(distPath, fileName);

    if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`✅ ${fileName} copiado`);
    } else {
        console.log(`⚠️ ${fileName} não encontrado`);
    }
});

console.log('🎉 Build simplificado concluído com sucesso!');
console.log('📁 Arquivos gerados em: dist/');
console.log('🚀 Para testar: npm start'); 