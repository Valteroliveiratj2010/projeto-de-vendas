/**
 * Script de Configuração do Sistema de Sincronização em Tempo Real
 * Este script ajuda a configurar e testar o sistema de sincronização
 */

require('dotenv').config();

console.log('🔄 CONFIGURADOR DO SISTEMA DE SINCRONIZAÇÃO EM TEMPO REAL');
console.log('==========================================================\n');

async function setupSync() {
    try {
        console.log('🔍 Verificando configurações atuais...\n');

        // Verificar dependências
        console.log('📦 Verificando dependências...');

        try {
            require('socket.io');
            console.log('✅ socket.io instalado');
        } catch {
            console.log('❌ socket.io não instalado');
            console.log('🔧 Execute: npm install socket.io');
            return false;
        }

        // Verificar arquivos do sistema
        console.log('\n📁 Verificando arquivos do sistema...');

        const files = [
            'utils/sync-service.js',
            'routes/sync.js',
            'server.js'
        ];

        for (const file of files) {
            try {
                require('fs').accessSync(file);
                console.log(`✅ ${file}`);
            } catch {
                console.log(`❌ ${file}`);
                return false;
            }
        }

        // Verificar se o servidor pode ser iniciado
        console.log('\n🧪 Testando inicialização do servidor...');

        try {
            // Simular inicialização básica
            const http = require('http');
            const socketIo = require('socket.io');

            const app = require('express')();
            const server = http.createServer(app);
            const io = socketIo(server);

            console.log('✅ Servidor HTTP e Socket.IO criados com sucesso');

            // Fechar servidor de teste
            server.close();

        } catch (error) {
            console.log('❌ Erro ao criar servidor de teste:');
            console.log(`   ${error.message}`);
            return false;
        }

        console.log('\n✅ Sistema de sincronização configurado com sucesso!');

        // Mostrar informações do sistema
        await showSystemInfo();

        return true;

    } catch (error) {
        console.error('❌ Erro durante a configuração:', error.message);
        return false;
    }
}

async function showSystemInfo() {
    try {
        console.log('\n📋 INFORMAÇÕES DO SISTEMA');
        console.log('============================');

        // Verificar Node.js
        console.log(`Node.js: ${process.version}`);

        // Verificar sistema operacional
        console.log(`Sistema: ${process.platform} ${process.arch}`);

        // Verificar diretório atual
        console.log(`Diretório: ${process.cwd()}`);

        // Verificar arquivos importantes
        const files = [
            'package.json',
            'server.js',
            'utils/sync-service.js',
            'routes/sync.js'
        ];

        console.log('\n📁 Arquivos do sistema:');
        for (const file of files) {
            try {
                require('fs').accessSync(file);
                console.log(`   ✅ ${file}`);
            } catch {
                console.log(`   ❌ ${file}`);
            }
        }

        // Verificar dependências no package.json
        try {
            const packageJson = require('../package.json');
            const dependencies = packageJson.dependencies || {};

            console.log('\n📦 Dependências instaladas:');
            console.log(`   ✅ express: ${dependencies.express || 'Não encontrado'}`);
            console.log(`   ✅ socket.io: ${dependencies['socket.io'] || 'Não encontrado'}`);
            console.log(`   ✅ cors: ${dependencies.cors || 'Não encontrado'}`);
            console.log(`   ✅ helmet: ${dependencies.helmet || 'Não encontrado'}`);

        } catch (error) {
            console.log('\n📦 Erro ao verificar dependências:', error.message);
        }

    } catch (error) {
        console.error('❌ Erro ao obter informações do sistema:', error.message);
    }
}

async function testSyncService() {
    try {
        console.log('\n🧪 TESTANDO SERVIÇO DE SINCRONIZAÇÃO');
        console.log('=====================================');

        // Verificar se o servidor está rodando
        console.log('🔍 Verificando se o servidor está rodando...');

        try {
            const response = await fetch('http://localhost:3000/api/health');
            const data = await response.json();

            if (data.success && data.features.realTimeSync) {
                console.log('✅ Servidor rodando com sincronização ativa');

                // Testar API de sincronização
                console.log('\n🔍 Testando APIs de sincronização...');

                const apis = [
                    '/api/sync/status',
                    '/api/sync/clients',
                    '/api/sync/stats',
                    '/api/sync/health'
                ];

                for (const api of apis) {
                    try {
                        const apiResponse = await fetch(`http://localhost:3000${api}`);
                        const apiData = await apiResponse.json();

                        if (apiData.success) {
                            console.log(`   ✅ ${api}`);
                        } else {
                            console.log(`   ⚠️ ${api} - ${apiData.error}`);
                        }
                    } catch (error) {
                        console.log(`   ❌ ${api} - ${error.message}`);
                    }
                }

            } else {
                console.log('⚠️ Servidor rodando, mas sincronização não está ativa');
            }

        } catch (error) {
            console.log('❌ Servidor não está rodando ou não responde');
            console.log('   Inicie o servidor com: npm start');
        }

    } catch (error) {
        console.error('❌ Erro no teste do serviço:', error.message);
    }
}

async function showUsageExamples() {
    console.log('\n📚 EXEMPLOS DE USO');
    console.log('===================');

    console.log('\n🔌 Conectar cliente:');
    console.log('   const socket = io("http://localhost:3000");');

    console.log('\n🔐 Autenticar cliente:');
    console.log('   socket.emit("client:auth", {');
    console.log('     userId: "user123",');
    console.log('     deviceInfo: { name: "Meu PC", type: "desktop" }');
    console.log('   });');

    console.log('\n🔄 Solicitar sincronização:');
    console.log('   socket.emit("sync:request", {');
    console.log('     entity: "vendas",');
    console.log('     lastSync: "2024-01-01T00:00:00Z"');
    console.log('   });');

    console.log('\n📝 Criar dados:');
    console.log('   socket.emit("data:create", {');
    console.log('     entity: "clientes",');
    console.log('     record: { nome: "João", email: "joao@email.com" }');
    console.log('   });');

    console.log('\n✏️ Atualizar dados:');
    console.log('   socket.emit("data:update", {');
    console.log('     entity: "vendas",');
    console.log('     recordId: "123",');
    console.log('     changes: { status: "Pago" }');
    console.log('   });');

    console.log('\n🗑️ Excluir dados:');
    console.log('   socket.emit("data:delete", {');
    console.log('     entity: "produtos",');
    console.log('     recordId: "456"');
    console.log('   });');
}

// Menu principal
async function main() {
    const args = process.argv.slice(2);

    if (args.includes('--test')) {
        await testSyncService();
        return;
    }

    if (args.includes('--examples')) {
        await showUsageExamples();
        return;
    }

    if (args.includes('--help')) {
        console.log(`
🔄 CONFIGURADOR DO SISTEMA DE SINCRONIZAÇÃO EM TEMPO REAL

Uso:
  node scripts/setup-sync.js           - Verifica configuração atual
  node scripts/setup-sync.js --test    - Testa serviço em execução
  node scripts/setup-sync.js --examples - Mostra exemplos de uso
  node scripts/setup-sync.js --help    - Mostra esta ajuda

Opções:
  --test       Testa serviço de sincronização em execução
  --examples   Mostra exemplos de uso da API
  --help       Mostra esta mensagem de ajuda

Exemplos:
  node scripts/setup-sync.js
  node scripts/setup-sync.js --test
  node scripts/setup-sync.js --examples
        `);
        return;
    }

    // Executar configuração padrão
    const success = await setupSync();

    if (success) {
        console.log('\n🎯 Próximos passos:');
        console.log('1. Inicie o servidor: npm start');
        console.log('2. Teste a sincronização em tempo real via API');
        console.log('3. Use as APIs de sincronização no seu sistema');

        console.log('\n📚 RECURSOS DISPONÍVEIS:');
        console.log('• Sincronização automática em tempo real');
        console.log('• Operações CRUD com broadcast automático');
        console.log('• Gerenciamento de clientes conectados');
        console.log('• Estatísticas de sincronização');
        console.log('• APIs REST para controle');
        console.log('• Interface de teste completa');

        console.log('\n🔧 PARA TESTAR:');
        console.log('• Execute: node scripts/setup-sync.js --test');
        console.log('• Execute: node scripts/setup-sync.js --examples');

    } else {
        console.log('\n🔧 Para resolver:');
        console.log('1. Instale as dependências: npm install socket.io');
        console.log('2. Verifique se todos os arquivos estão presentes');
        console.log('3. Execute novamente: node scripts/setup-sync.js');
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { setupSync, testSyncService, showUsageExamples }; 