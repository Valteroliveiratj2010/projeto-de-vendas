/**
 * Script de Configuração do Sistema de Notificações Push
 * Este script ajuda a configurar e testar o sistema de notificações push
 */

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');

console.log('🔔 CONFIGURADOR DO SISTEMA DE NOTIFICAÇÕES PUSH');
console.log('================================================\n');

async function setupPushNotifications() {
    try {
        console.log('🔍 Verificando configurações atuais...\n');

        // Verificar arquivo .env
        const envPath = path.join(__dirname, '..', '.env');
        let envExists = false;

        try {
            await fs.access(envPath);
            envExists = true;
            console.log('✅ Arquivo .env encontrado');
        } catch {
            console.log('❌ Arquivo .env não encontrado');
        }

        // Verificar dependências
        console.log('\n📦 Verificando dependências...');

        try {
            require('web-push');
            console.log('✅ web-push instalado');
        } catch {
            console.log('❌ web-push não instalado');
            console.log('🔧 Execute: npm install web-push');
            return false;
        }

        // Verificar diretório de dados
        const dataDir = path.join(__dirname, '..', 'data');
        try {
            await fs.access(dataDir);
            console.log('✅ Diretório de dados encontrado');
        } catch {
            console.log('📁 Criando diretório de dados...');
            await fs.mkdir(dataDir, { recursive: true });
            console.log('✅ Diretório de dados criado');
        }

        // Verificar arquivo de assinaturas
        const subscriptionsFile = path.join(dataDir, 'push-subscriptions.json');
        try {
            await fs.access(subscriptionsFile);
            const data = await fs.readFile(subscriptionsFile, 'utf8');
            const subscriptions = JSON.parse(data);
            console.log(`✅ Arquivo de assinaturas encontrado: ${subscriptions.length} assinaturas`);
        } catch {
            console.log('📝 Arquivo de assinaturas não encontrado, será criado automaticamente');
        }

        // Verificar arquivo de chaves VAPID
        const vapidKeysFile = path.join(dataDir, 'vapid-keys.json');
        try {
            await fs.access(vapidKeysFile);
            const keysData = await fs.readFile(vapidKeysFile, 'utf8');
            const keys = JSON.parse(keysData);
            console.log('✅ Chaves VAPID encontradas');
            console.log(`   Chave pública: ${keys.publicKey.substring(0, 20)}...`);
        } catch {
            console.log('🔑 Chaves VAPID não encontradas, serão geradas automaticamente');
        }

        console.log('\n✅ Sistema de notificações push configurado!');

        // Testar serviço
        console.log('\n🧪 Testando serviço...');

        try {
            const PushNotificationService = require('../utils/push-service');
            const pushService = new PushNotificationService();

            // Aguardar inicialização
            await new Promise(resolve => setTimeout(resolve, 3000));

            const testResult = await pushService.testService();

            if (testResult.success) {
                console.log('✅ Serviço de notificações push funcionando perfeitamente!');

                const status = pushService.getStatus();
                console.log(`📊 Estatísticas:`);
                console.log(`   - Assinaturas: ${status.subscriptionsCount}`);
                console.log(`   - Ativas: ${status.stats.active}`);
                console.log(`   - Inativas: ${status.stats.inactive}`);

                return true;
            } else {
                console.log('❌ Erro no serviço:');
                console.log(`   ${testResult.message}`);
                return false;
            }

        } catch (error) {
            console.log('❌ Erro ao testar serviço:');
            console.log(`   ${error.message}`);
            return false;
        }

    } catch (error) {
        console.error('❌ Erro durante a configuração:', error.message);
        return false;
    }
}

async function createEnvTemplate() {
    try {
        const envTemplate = `# Configurações do Banco de Dados PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sistema_vendas_zc4o
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui

# Configurações do Servidor
PORT=3000
NODE_ENV=development

# Configurações de Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_app

# Configurações JWT
JWT_SECRET=sua_chave_secreta_jwt_aqui
JWT_EXPIRES_IN=24h

# Configurações WhatsApp (Twilio)
TWILIO_ACCOUNT_SID=seu_account_sid_aqui
TWILIO_AUTH_TOKEN=seu_auth_token_aqui
TWILIO_PHONE_NUMBER=seu_numero_whatsapp

# Configurações de Notificações Push
# (Não são necessárias no .env - são geradas automaticamente)
`;

        const envPath = path.join(__dirname, '..', '.env');
        await fs.writeFile(envPath, envTemplate);

        console.log('✅ Arquivo .env criado com sucesso!');
        console.log('📝 As notificações push não precisam de configuração manual');

    } catch (error) {
        console.error('❌ Erro ao criar arquivo .env:', error.message);
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
            'utils/push-service.js',
            'routes/push-notifications.js'
        ];

        console.log('\n📁 Arquivos do sistema:');
        for (const file of files) {
            try {
                await fs.access(file);
                console.log(`   ✅ ${file}`);
            } catch {
                console.log(`   ❌ ${file}`);
            }
        }

        // Verificar diretório de dados
        const dataDir = path.join(__dirname, '..', 'data');
        try {
            await fs.access(dataDir);
            const files = await fs.readdir(dataDir);
            console.log(`\n📂 Diretório de dados (${dataDir}):`);
            if (files.length === 0) {
                console.log('   (vazio)');
            } else {
                files.forEach(file => console.log(`   📄 ${file}`));
            }
        } catch {
            console.log('\n📂 Diretório de dados: Não encontrado');
        }

    } catch (error) {
        console.error('❌ Erro ao obter informações do sistema:', error.message);
    }
}

// Menu principal
async function main() {
    const args = process.argv.slice(2);

    if (args.includes('--create-env')) {
        await createEnvTemplate();
        return;
    }

    if (args.includes('--info')) {
        await showSystemInfo();
        return;
    }

    if (args.includes('--help')) {
        console.log(`
🔔 CONFIGURADOR DO SISTEMA DE NOTIFICAÇÕES PUSH

Uso:
  node scripts/setup-push-notifications.js           - Verifica configuração atual
  node scripts/setup-push-notifications.js --create-env  - Cria arquivo .env template
  node scripts/setup-push-notifications.js --info        - Mostra informações do sistema
  node scripts/setup-push-notifications.js --help        - Mostra esta ajuda

Opções:
  --create-env    Cria um arquivo .env template
  --info          Mostra informações do sistema
  --help          Mostra esta mensagem de ajuda

Exemplos:
  node scripts/setup-push-notifications.js
  node scripts/setup-push-notifications.js --create-env
  node scripts/setup-push-notifications.js --info
        `);
        return;
    }

    // Executar configuração padrão
    const success = await setupPushNotifications();

    if (success) {
        console.log('\n🎯 Próximos passos:');
        console.log('1. Configure as variáveis de notificações no .env');
        console.log('2. Teste o sistema de notificações push via API');
        console.log('3. Configure notificações automáticas no seu sistema');
        console.log('4. Use as APIs de notificações push');

        console.log('\n📚 RECURSOS DISPONÍVEIS:');
        console.log('• Notificações automáticas de vendas, orçamentos e pagamentos');
        console.log('• Notificações personalizadas');
        console.log('• Envio em massa para todas as assinaturas');
        console.log('• Gerenciamento de assinaturas');
        console.log('• Templates profissionais');

    } else {
        console.log('\n🔧 Para resolver:');
        console.log('1. Verifique se todas as dependências estão instaladas');
        console.log('2. Execute: npm install web-push');
        console.log('3. Execute novamente: node scripts/setup-push-notifications.js');
        console.log('4. Verifique as permissões dos diretórios');
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { setupPushNotifications, createEnvTemplate, showSystemInfo }; 