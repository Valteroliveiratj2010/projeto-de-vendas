/**
 * Script de Configuração do Sistema de WhatsApp
 * Este script ajuda a configurar e testar o sistema de WhatsApp
 */

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');

console.log('📱 CONFIGURADOR DO SISTEMA DE WHATSAPP');
console.log('========================================\n');

async function setupWhatsApp() {
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

        // Verificar variáveis do WhatsApp
        const whatsappVars = {
            TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
            TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
            TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER
        };

        console.log('\n📋 Configurações do WhatsApp:');
        console.log('-------------------------------');

        Object.entries(whatsappVars).forEach(([key, value]) => {
            if (value) {
                if (key === 'TWILIO_AUTH_TOKEN') {
                    console.log(`${key}: ${'*'.repeat(Math.min(value.length, 8))}`);
                } else {
                    console.log(`${key}: ${value}`);
                }
            } else {
                console.log(`${key}: ❌ NÃO CONFIGURADO`);
            }
        });

        // Verificar se todas as variáveis estão configuradas
        const missingVars = Object.entries(whatsappVars)
            .filter(([key, value]) => !value)
            .map(([key]) => key);

        if (missingVars.length > 0) {
            console.log(`\n⚠️  Variáveis faltando: ${missingVars.join(', ')}`);
            console.log('\n🔧 Para configurar, adicione no arquivo .env:');

            if (!envExists) {
                console.log('\n📝 CRIE um arquivo .env na raiz do projeto com:');
            } else {
                console.log('\n📝 ADICIONE no arquivo .env:');
            }

            console.log(`
# Configurações WhatsApp (Twilio)
TWILIO_ACCOUNT_SID=seu_account_sid_aqui
TWILIO_AUTH_TOKEN=seu_auth_token_aqui
TWILIO_PHONE_NUMBER=seu_numero_whatsapp
            `);

            console.log('\n📚 INSTRUÇÕES PARA CONFIGURAR:');
            console.log('1. Crie uma conta em: https://www.twilio.com/');
            console.log('2. Obtenha seu Account SID e Auth Token no console');
            console.log('3. Configure um número WhatsApp Business no Twilio');
            console.log('4. Adicione as credenciais no arquivo .env');

            console.log('\n💰 CUSTOS:');
            console.log('- Twilio: $0.0049 por mensagem (aproximadamente R$ 0,025)');
            console.log('- Número WhatsApp: $1.00/mês (aproximadamente R$ 5,00)');

            return false;
        }

        console.log('\n✅ Todas as variáveis do WhatsApp estão configuradas!');

        // Testar configuração
        console.log('\n🧪 Testando configuração do WhatsApp...');

        try {
            const WhatsAppService = require('../utils/whatsapp-service');
            const whatsappService = new WhatsAppService();

            // Aguardar inicialização
            await new Promise(resolve => setTimeout(resolve, 2000));

            const testResult = await whatsappService.testConnection();

            if (testResult.success) {
                console.log('✅ Configuração do WhatsApp válida!');
                console.log('🎉 Sistema de WhatsApp pronto para uso!');
                return true;
            } else {
                console.log('❌ Erro na configuração do WhatsApp:');
                console.log(`   ${testResult.message}`);
                return false;
            }

        } catch (error) {
            console.log('❌ Erro ao testar configuração:');
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
`;

        const envPath = path.join(__dirname, '..', '.env');
        await fs.writeFile(envPath, envTemplate);

        console.log('✅ Arquivo .env criado com sucesso!');
        console.log('📝 Edite o arquivo e configure suas credenciais do WhatsApp');

    } catch (error) {
        console.error('❌ Erro ao criar arquivo .env:', error.message);
    }
}

// Menu principal
async function main() {
    const args = process.argv.slice(2);

    if (args.includes('--create-env')) {
        await createEnvTemplate();
        return;
    }

    if (args.includes('--help')) {
        console.log(`
📱 CONFIGURADOR DO SISTEMA DE WHATSAPP

Uso:
  node scripts/setup-whatsapp.js           - Verifica configuração atual
  node scripts/setup-whatsapp.js --create-env  - Cria arquivo .env template
  node scripts/setup-whatsapp.js --help        - Mostra esta ajuda

Opções:
  --create-env    Cria um arquivo .env template
  --help          Mostra esta mensagem de ajuda

Exemplos:
  node scripts/setup-whatsapp.js
  node scripts/setup-whatsapp.js --create-env
        `);
        return;
    }

    // Executar configuração padrão
    const success = await setupWhatsApp();

    if (success) {
        console.log('\n🎯 Próximos passos:');
        console.log('1. Configure as variáveis do WhatsApp no .env');
        console.log('2. Teste o envio de mensagens WhatsApp via API');
        console.log('3. Use as APIs de WhatsApp no seu sistema');
        console.log('4. Configure notificações automáticas');
    } else {
        console.log('\n🔧 Para resolver:');
        console.log('1. Configure as variáveis do WhatsApp no .env');
        console.log('2. Execute: node scripts/setup-whatsapp.js --create-env');
        console.log('3. Execute novamente: node scripts/setup-whatsapp.js');
        console.log('4. Configure sua conta Twilio');
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { setupWhatsApp, createEnvTemplate }; 