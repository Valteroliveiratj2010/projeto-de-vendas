/**
 * Script de Configuração do Sistema de Email
 * Este script ajuda a configurar e testar o sistema de email
 */

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const { testEmailConfig } = require('../config/email-config');

console.log('📧 CONFIGURADOR DO SISTEMA DE EMAIL');
console.log('=====================================\n');

async function setupEmail() {
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
        
        // Verificar variáveis de email
        const emailVars = {
            EMAIL_HOST: process.env.EMAIL_HOST,
            EMAIL_PORT: process.env.EMAIL_PORT,
            EMAIL_USER: process.env.EMAIL_USER,
            EMAIL_PASS: process.env.EMAIL_PASS
        };
        
        console.log('\n📋 Configurações de Email:');
        console.log('----------------------------');
        
        Object.entries(emailVars).forEach(([key, value]) => {
            if (value) {
                if (key === 'EMAIL_PASS') {
                    console.log(`${key}: ${'*'.repeat(Math.min(value.length, 8))}`);
                } else {
                    console.log(`${key}: ${value}`);
                }
            } else {
                console.log(`${key}: ❌ NÃO CONFIGURADO`);
            }
        });
        
        // Verificar se todas as variáveis estão configuradas
        const missingVars = Object.entries(emailVars)
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
# Configurações de Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_app
            `);
            
            console.log('\n📚 INSTRUÇÕES PARA GMAIL:');
            console.log('1. Ative a verificação em 2 etapas na sua conta Google');
            console.log('2. Gere uma senha de app em: https://myaccount.google.com/apppasswords');
            console.log('3. Use essa senha no EMAIL_PASS');
            
            console.log('\n📚 INSTRUÇÕES PARA OUTLOOK:');
            console.log('1. Ative a autenticação de app na sua conta Microsoft');
            console.log('2. Use sua senha normal no EMAIL_PASS');
            
            return false;
        }
        
        console.log('\n✅ Todas as variáveis de email estão configuradas!');
        
        // Testar configuração
        console.log('\n🧪 Testando configuração de email...');
        const testResult = await testEmailConfig();
        
        if (testResult.success) {
            console.log('✅ Configuração de email válida!');
            console.log('🎉 Sistema de email pronto para uso!');
            return true;
        } else {
            console.log('❌ Erro na configuração de email:');
            console.log(`   ${testResult.message}`);
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
TWILIO_ACCOUNT_SID=seu_account_sid
TWILIO_AUTH_TOKEN=seu_auth_token
TWILIO_PHONE_NUMBER=seu_numero_whatsapp
`;
        
        const envPath = path.join(__dirname, '..', '.env');
        await fs.writeFile(envPath, envTemplate);
        
        console.log('✅ Arquivo .env criado com sucesso!');
        console.log('📝 Edite o arquivo e configure suas credenciais de email');
        
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
📧 CONFIGURADOR DO SISTEMA DE EMAIL

Uso:
  node scripts/setup-email.js           - Verifica configuração atual
  node scripts/setup-email.js --create-env  - Cria arquivo .env template
  node scripts/setup-email.js --help        - Mostra esta ajuda

Opções:
  --create-env    Cria um arquivo .env template
  --help          Mostra esta mensagem de ajuda

Exemplos:
  node scripts/setup-email.js
  node scripts/setup-email.js --create-env
        `);
        return;
    }
    
    // Executar configuração padrão
    const success = await setupEmail();
    
    if (success) {
        console.log('\n🎯 Próximos passos:');
        console.log('1. Acesse: http://localhost:3000/test-email.html');
        console.log('2. Teste o envio de emails');
        console.log('3. Use as APIs de email no seu sistema');
    } else {
        console.log('\n🔧 Para resolver:');
        console.log('1. Configure as variáveis de email no .env');
        console.log('2. Execute: node scripts/setup-email.js --create-env');
        console.log('3. Execute novamente: node scripts/setup-email.js');
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { setupEmail, createEnvTemplate }; 