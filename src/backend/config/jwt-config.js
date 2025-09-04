/**
 * Configuração JWT
 * Configurações para tokens de autenticação
 */

require('dotenv').config();

const jwtConfig = {
    // Chave secreta para assinar tokens
    secret: process.env.JWT_SECRET || 'sistema-vendas-secret-key-2024',
    
    // Tempo de expiração padrão (em segundos)
    expiresIn: {
        // Token de acesso padrão (24 horas)
        access: process.env.JWT_ACCESS_EXPIRES || '24h',
        
        // Token de refresh (30 dias)
        refresh: process.env.JWT_REFRESH_EXPIRES || '30d',
        
        // Token para "lembrar de mim" (30 dias)
        remember: process.env.JWT_REMEMBER_EXPIRES || '30d',
        
        // Token para reset de senha (1 hora)
        resetPassword: process.env.JWT_RESET_PASSWORD_EXPIRES || '1h',
        
        // Token para verificação de email (24 horas)
        emailVerification: process.env.JWT_EMAIL_VERIFICATION_EXPIRES || '24h'
    },
    
    // Configurações de algoritmo
    algorithm: process.env.JWT_ALGORITHM || 'HS256',
    
    // Configurações de issuer e audience
    issuer: process.env.JWT_ISSUER || 'sistema-vendas',
    audience: process.env.JWT_AUDIENCE || 'sistema-vendas-users',
    
    // Configurações de refresh token
    refreshToken: {
        // Tamanho do refresh token
        size: 64,
        
        // Tempo de vida do refresh token no banco (em segundos)
        ttl: 30 * 24 * 60 * 60, // 30 dias
    },
    
    // Configurações de segurança
    security: {
        // Número máximo de tokens ativos por usuário
        maxActiveTokens: 5,
        
        // Tempo de inatividade antes de invalidar token (em segundos)
        inactivityTimeout: 30 * 60, // 30 minutos
        
        // Forçar logout em todas as sessões ao alterar senha
        forceLogoutOnPasswordChange: true,
        
        // Permitir múltiplas sessões simultâneas
        allowMultipleSessions: true
    }
};

/**
 * Validar configuração JWT
 */
function validateJwtConfig() {
    const errors = [];
    
    if (!jwtConfig.secret || jwtConfig.secret.length < 32) {
        errors.push('JWT_SECRET deve ter pelo menos 32 caracteres');
    }
    
    if (jwtConfig.secret === 'sistema-vendas-secret-key-2024') {
        console.warn('⚠️ Usando chave JWT padrão. Configure JWT_SECRET no .env para produção.');
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Gerar chave JWT segura
 */
function generateSecureSecret() {
    const crypto = require('crypto');
    return crypto.randomBytes(64).toString('hex');
}

/**
 * Obter configuração JWT
 */
function getJwtConfig() {
    return jwtConfig;
}

/**
 * Testar configuração JWT
 */
async function testJwtConfig() {
    try {
        const jwt = require('jsonwebtoken');
        
        // Testar geração de token
        const testPayload = { userId: 1, test: true };
        const token = jwt.sign(testPayload, jwtConfig.secret, {
            expiresIn: '1m',
            algorithm: jwtConfig.algorithm,
            issuer: jwtConfig.issuer,
            audience: jwtConfig.audience
        });
        
        // Testar verificação de token
        const decoded = jwt.verify(token, jwtConfig.secret, {
            algorithms: [jwtConfig.algorithm],
            issuer: jwtConfig.issuer,
            audience: jwtConfig.audience
        });
        
        return {
            success: true,
            message: 'Configuração JWT funcionando corretamente',
            config: {
                secret: jwtConfig.secret ? '✅ Configurado' : '❌ Não configurado',
                algorithm: jwtConfig.algorithm,
                issuer: jwtConfig.issuer,
                audience: jwtConfig.audience
            }
        };
        
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

module.exports = {
    jwtConfig,
    validateJwtConfig,
    generateSecureSecret,
    getJwtConfig,
    testJwtConfig
}; 