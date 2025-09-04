// Configuração de serviços externos
// Este arquivo controla quais serviços estão habilitados

const config = {
    // Configurações de email
    email: {
        enabled: process.env.EMAIL_ENABLED === 'true' || process.env.NODE_ENV === 'production',
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
        secure: process.env.EMAIL_SECURE === 'true'
    },

    // Configurações de WhatsApp
    whatsapp: {
        enabled: process.env.WHATSAPP_ENABLED === 'true' || process.env.NODE_ENV === 'production',
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        phoneNumber: process.env.TWILIO_PHONE_NUMBER
    },

    // Configurações de notificações push
    pushNotifications: {
        enabled: process.env.PUSH_ENABLED === 'true' || process.env.NODE_ENV === 'production',
        vapidPublicKey: process.env.VAPID_PUBLIC_KEY,
        vapidPrivateKey: process.env.VAPID_PRIVATE_KEY
    },

    // Configurações de sincronização
    sync: {
        enabled: true, // Sempre habilitado
        interval: process.env.SYNC_INTERVAL || 5000 // 5 segundos
    },

    // Configurações de segurança
    security: {
        jwtSecret: process.env.JWT_SECRET || 'sua_chave_secreta_jwt_aqui_muito_segura_123456789',
        jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
        bcryptRounds: 12
    },

    // Configurações de banco de dados
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        name: process.env.DB_NAME || 'sistema_vendas',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'sua_senha_aqui',
        ssl: process.env.NODE_ENV === 'production'
    },

    // Configurações do servidor
    server: {
        port: process.env.PORT || 3000,
        environment: process.env.NODE_ENV || 'development',
        cors: {
            origin: process.env.CORS_ORIGIN || '*',
            credentials: true
        }
    }
};

// Função para validar configurações
function validateConfig() {
    const errors = [];

    // Validar configurações críticas
    if (!config.security.jwtSecret || config.security.jwtSecret === 'sua_chave_secreta_jwt_aqui_muito_segura_123456789') {
        errors.push('JWT_SECRET deve ser configurado no arquivo .env');
    }

    if (!config.database.password || config.database.password === 'sua_senha_aqui') {
        errors.push('DB_PASSWORD deve ser configurado no arquivo .env');
    }

    // Validar configurações opcionais baseadas no ambiente
    if (config.email.enabled && (!config.email.user || !config.email.pass)) {
        errors.push('EMAIL_USER e EMAIL_PASS devem ser configurados para usar email');
    }

    if (config.whatsapp.enabled && (!config.whatsapp.accountSid || !config.whatsapp.authToken)) {
        errors.push('TWILIO_ACCOUNT_SID e TWILIO_AUTH_TOKEN devem ser configurados para usar WhatsApp');
    }

    if (config.pushNotifications.enabled && (!config.pushNotifications.vapidPublicKey || !config.pushNotifications.vapidPrivateKey)) {
        errors.push('VAPID_PUBLIC_KEY e VAPID_PRIVATE_KEY devem ser configurados para usar notificações push');
    }

    return errors;
}

// Função para obter status dos serviços
function getServiceStatus() {
    return {
        email: config.email.enabled,
        whatsapp: config.whatsapp.enabled,
        pushNotifications: config.pushNotifications.enabled,
        sync: config.sync.enabled,
        database: true, // Assumindo que está funcionando
        environment: config.server.environment
    };
}

module.exports = {
    config,
    validateConfig,
    getServiceStatus
}; 