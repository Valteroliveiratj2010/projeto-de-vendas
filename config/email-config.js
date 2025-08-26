/**
 * Configuração do Sistema de Email
 * Este arquivo contém todas as configurações necessárias para o sistema de email
 */

const emailConfig = {
    // Configurações Gmail (Recomendado para desenvolvimento)
    gmail: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true para 465, false para outras portas
        auth: {
            user: process.env.EMAIL_USER || 'seu_email@gmail.com',
            pass: process.env.EMAIL_PASS || 'sua_senha_app'
        },
        tls: {
            rejectUnauthorized: false
        }
    },

    // Configurações Outlook/Hotmail
    outlook: {
        host: 'smtp-mail.outlook.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER || 'seu_email@outlook.com',
            pass: process.env.EMAIL_PASS || 'sua_senha'
        },
        tls: {
            rejectUnauthorized: false
        }
    },

    // Configurações Yahoo
    yahoo: {
        host: 'smtp.mail.yahoo.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER || 'seu_email@yahoo.com',
            pass: process.env.EMAIL_PASS || 'sua_senha_app'
        },
        tls: {
            rejectUnauthorized: false
        }
    },

    // Configurações para servidores SMTP próprios
    custom: {
        host: process.env.EMAIL_HOST || 'smtp.seudominio.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_PORT === '465',
        auth: {
            user: process.env.EMAIL_USER || 'usuario@seudominio.com',
            pass: process.env.EMAIL_PASS || 'sua_senha'
        },
        tls: {
            rejectUnauthorized: false
        }
    }
};

/**
 * Valida se as configurações de email estão corretas
 */
function validateEmailConfig() {
    const requiredVars = ['EMAIL_HOST', 'EMAIL_USER', 'EMAIL_PASS'];
    const missing = requiredVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
        console.warn('⚠️ Variáveis de email não configuradas:', missing.join(', '));
        return false;
    }
    
    return true;
}

/**
 * Obtém a configuração de email baseada no host
 */
function getEmailConfig() {
    const host = process.env.EMAIL_HOST || '';
    
    if (host.includes('gmail.com')) {
        return emailConfig.gmail;
    } else if (host.includes('outlook.com') || host.includes('hotmail.com')) {
        return emailConfig.outlook;
    } else if (host.includes('yahoo.com')) {
        return emailConfig.yahoo;
    } else {
        return emailConfig.custom;
    }
}

/**
 * Testa a configuração de email
 */
async function testEmailConfig() {
    const nodemailer = require('nodemailer');
    
    try {
        const config = getEmailConfig();
        const transporter = nodemailer.createTransport(config);
        
        await transporter.verify();
        return { success: true, message: 'Configuração de email válida!' };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

module.exports = {
    emailConfig,
    validateEmailConfig,
    getEmailConfig,
    testEmailConfig
}; 