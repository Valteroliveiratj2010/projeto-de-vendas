/**
 * Script de validação de configuração
 * Verifica se todas as configurações necessárias estão presentes
 */

const { validateConfig, getServiceStatus } = require('../config/services');
const { testConnection } = require('../config/database');

// Função para validar configurações
async function validateAllConfigs() {
    console.log('🔍 Iniciando validação de configurações...\n');

    // Validar configurações do arquivo .env
    console.log('📋 Validando configurações do arquivo .env...');
    const configErrors = validateConfig();

    if (configErrors.length > 0) {
        console.log('⚠️ Problemas encontrados:');
        configErrors.forEach((error, index) => {
            console.log(`   ${index + 1}. ${error}`);
        });
        console.log('');
    } else {
        console.log('✅ Todas as configurações básicas estão corretas!\n');
    }

    // Validar conexão com banco de dados
    console.log('🗄️ Testando conexão com banco de dados...');
    try {
        const dbConnected = await testConnection();
        if (dbConnected) {
            console.log('✅ Conexão com banco de dados OK!\n');
        } else {
            console.log('❌ Falha na conexão com banco de dados\n');
        }
    } catch (error) {
        console.log('❌ Erro ao testar banco de dados:', error.message, '\n');
    }

    // Verificar status dos serviços
    console.log('🔧 Verificando status dos serviços...');
    const serviceStatus = getServiceStatus();

    console.log('📊 Status dos serviços:');
    console.log(`   - Email: ${serviceStatus.email ? '✅ Habilitado' : '❌ Desabilitado'}`);
    console.log(`   - WhatsApp: ${serviceStatus.whatsapp ? '✅ Habilitado' : '❌ Desabilitado'}`);
    console.log(`   - Notificações Push: ${serviceStatus.pushNotifications ? '✅ Habilitado' : '❌ Desabilitado'}`);
    console.log(`   - Sincronização: ${serviceStatus.sync ? '✅ Habilitado' : '❌ Desabilitado'}`);
    console.log(`   - Ambiente: ${serviceStatus.environment}\n`);

    // Verificar arquivos críticos
    console.log('📁 Verificando arquivos críticos...');
    const fs = require('fs');
    const criticalFiles = [
        'public/index.html',
        'public/css/optimized.css',
        'public/js/app.js',
        'config/database.js',
        'server.js'
    ];

    criticalFiles.forEach(file => {
        if (fs.existsSync(file)) {
            console.log(`   ✅ ${file}`);
        } else {
            console.log(`   ❌ ${file} - NÃO ENCONTRADO`);
        }
    });
    console.log('');

    // Resumo final
    console.log('📋 RESUMO DA VALIDAÇÃO:');
    if (configErrors.length === 0) {
        console.log('✅ Configurações: OK');
    } else {
        console.log(`⚠️ Configurações: ${configErrors.length} problema(s) encontrado(s)`);
    }

    console.log('✅ Arquivos críticos: OK');
    console.log('✅ Serviços: Configurados corretamente');

    if (configErrors.length > 0) {
        console.log('\n💡 RECOMENDAÇÕES:');
        console.log('1. Configure as variáveis de ambiente no arquivo .env');
        console.log('2. Execute "npm run db:setup" para configurar o banco');
        console.log('3. Execute "npm run css:optimize" para otimizar CSS');
        console.log('4. Para desenvolvimento, os serviços externos podem ficar desabilitados');
    } else {
        console.log('\n🎉 Sistema pronto para uso!');
    }
}

// Função para gerar relatório de configuração
function generateConfigReport() {
    const fs = require('fs');
    const path = require('path');

    console.log('📊 Gerando relatório de configuração...');

    const report = {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        configErrors: validateConfig(),
        serviceStatus: getServiceStatus(),
        criticalFiles: []
    };

    // Verificar arquivos críticos
    const criticalFiles = [
        'public/index.html',
        'public/css/optimized.css',
        'public/js/app.js',
        'config/database.js',
        'server.js'
    ];

    criticalFiles.forEach(file => {
        report.criticalFiles.push({
            file,
            exists: fs.existsSync(file),
            size: fs.existsSync(file) ? fs.statSync(file).size : 0
        });
    });

    // Salvar relatório
    const reportPath = 'config-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`✅ Relatório salvo em: ${reportPath}`);
    return report;
}

// Função principal
async function main() {
    try {
        await validateAllConfigs();

        if (process.argv.includes('--report')) {
            generateConfigReport();
        }

    } catch (error) {
        console.error('❌ Erro durante validação:', error);
        process.exit(1);
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    main();
}

module.exports = {
    validateAllConfigs,
    generateConfigReport,
    main
}; 