/**
 * Script inteligente que detecta o ambiente e usa o setup correto
 * Detecta automaticamente se está no Render e usa SSL
 */

const { execSync } = require('child_process');
const path = require('path');

// Função para detectar se está no Render
function isRenderEnvironment() {
    return process.env.DB_HOST && process.env.DB_HOST.includes('render.com');
}

// Função para detectar se está em produção
function isProductionEnvironment() {
    return process.env.NODE_ENV === 'production';
}

async function runIntelligentSetup() {
    try {
        console.log('🧠 Iniciando setup inteligente...');
        console.log('🔍 Detectando ambiente...');

        const isRender = isRenderEnvironment();
        const isProduction = isProductionEnvironment();

        console.log(`   Render: ${isRender ? 'Sim' : 'Não'}`);
        console.log(`   Produção: ${isProduction ? 'Sim' : 'Não'}`);
        console.log(`   DB_HOST: ${process.env.DB_HOST || 'Não definido'}`);

        let setupScript;

        if (isRender) {
            console.log('🎯 Ambiente Render detectado - Usando setup com SSL forçado');
            setupScript = 'npm run db:setup:render';
        } else if (isProduction) {
            console.log('🎯 Ambiente de produção detectado - Usando setup com NODE_ENV=production');
            setupScript = 'npm run db:setup:prod';
        } else {
            console.log('🎯 Ambiente de desenvolvimento detectado - Usando setup padrão');
            setupScript = 'npm run db:setup';
        }

        console.log(`🚀 Executando: ${setupScript}`);

        // Executar o script apropriado
        execSync(setupScript, {
            stdio: 'inherit',
            cwd: process.cwd()
        });

        console.log('✅ Setup do banco concluído com sucesso!');

        // Executar otimização CSS
        console.log('🎨 Executando otimização CSS...');
        execSync('npm run css:optimize', {
            stdio: 'inherit',
            cwd: process.cwd()
        });

        console.log('🎉 Setup completo concluído com sucesso!');

    } catch (error) {
        console.error('❌ Erro durante setup inteligente:', error.message);
        process.exit(1);
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    runIntelligentSetup();
}

module.exports = { runIntelligentSetup }; 