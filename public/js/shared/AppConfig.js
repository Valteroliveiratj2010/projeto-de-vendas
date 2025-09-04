/**
 * ⚙️ Configuração Centralizada - Refatorada
 * Configurações organizadas e tipadas
 * Compatível com navegador (sem process.env)
 */

const AppConfig = {
    // Configurações da aplicação
    app: {
        name: 'Sistema de Vendas',
        version: '2.0.0',
        environment: 'development', // Fixo para navegador
        debug: true, // Sempre true no navegador
        buildDate: new Date().toISOString()
    },

    // Configurações da API
    api: {
        baseUrl: '/api',
        timeout: 30000,
        retryAttempts: 3,
        retryDelay: 1000,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    },

    // Configurações de autenticação
    auth: {
        tokenKey: 'authToken',
        userDataKey: 'userData',
        tokenExpiry: 24 * 60 * 60 * 1000, // 24 horas
        refreshThreshold: 5 * 60 * 1000, // 5 minutos
        checkInterval: 30 * 1000, // 30 segundos
        loginRedirect: '/login',
        dashboardRedirect: '/#dashboard'
    },

    // Configurações de cache
    cache: {
        defaultTTL: 5 * 60 * 1000, // 5 minutos
        maxSize: 100,
        cleanupInterval: 60 * 1000 // 1 minuto
    },

    // Configurações de UI
    ui: {
        breakpoints: {
            mobile: 768,
            tablet: 1024,
            desktop: 1025
        },
        animationDuration: 300,
        notificationDuration: 5000,
        maxNotifications: 5,
        theme: {
            default: 'light',
            available: ['light', 'dark', 'auto']
        }
    },

    // Configurações de validação
    validation: {
        minPasswordLength: 8,
        maxNameLength: 100,
        maxDescriptionLength: 500,
        phoneRegex: /^[\+]?[1-9][\d]{0,15}$/,
        emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        cpfRegex: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
        cnpjRegex: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/
    },

    // Configurações de paginação
    pagination: {
        defaultPageSize: 20,
        maxPageSize: 100,
        pageSizeOptions: [10, 20, 50, 100]
    },

    // Configurações de upload
    upload: {
        maxFileSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
        maxFiles: 10
    },

    // Configurações de gráficos
    charts: {
        colors: [
            '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
            '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
        ],
        animationDuration: 1000,
        responsive: true
    },

    // Configurações de localização
    locale: {
        default: 'pt-BR',
        supported: ['pt-BR', 'en-US', 'es-ES'],
        dateFormat: 'DD/MM/YYYY',
        timeFormat: 'HH:mm',
        currency: 'BRL',
        numberFormat: {
            decimal: ',',
            thousands: '.',
            precision: 2
        }
    },

    // Configurações de segurança
    security: {
        cspEnabled: true,
        xssProtection: true,
        csrfProtection: true,
        rateLimiting: true,
        maxLoginAttempts: 5,
        lockoutDuration: 15 * 60 * 1000 // 15 minutos
    },

    // Configurações de performance
    performance: {
        lazyLoading: true,
        imageOptimization: true,
        bundleAnalysis: false,
        maxConcurrentRequests: 5,
        requestTimeout: 10000
    },

    // Configurações de erro
    error: {
        showDetails: true, // Sempre true no navegador
        logToConsole: true,
        reportToServer: true,
        maxErrorLogs: 100
    },

    // Configurações de sincronização
    sync: {
        interval: 30 * 1000, // 30 segundos
        maxQueueSize: 100,
        maxRetries: 3,
        retryDelay: 5 * 1000 // 5 segundos
    },

    // Configurações de notificações
    notifications: {
        push: {
            enabled: false,
            vapidPublicKey: '', // Configurar via variáveis de ambiente no servidor
            vapidPrivateKey: '' // Configurar via variáveis de ambiente no servidor
        },
        email: {
            enabled: false,
            host: '', // Configurar via variáveis de ambiente no servidor
            port: 587,
            secure: false
        },
        whatsapp: {
            enabled: false,
            accountSid: '', // Configurar via variáveis de ambiente no servidor
            authToken: '' // Configurar via variáveis de ambiente no servidor
        }
    },

    // Configurações de banco de dados
    database: {
        host: 'localhost',
        port: 5432,
        name: 'sistema_vendas',
        user: 'postgres',
        password: '', // Configurar via variáveis de ambiente no servidor
        ssl: false, // Sempre false no navegador
        maxConnections: 20,
        idleTimeout: 30 * 1000 // 30 segundos
    },

    // Métodos utilitários
    isDevelopment() {
        return this.app.environment === 'development';
    },

    isProduction() {
        return this.app.environment === 'production';
    },

    isTest() {
        return this.app.environment === 'test';
    },

    getApiUrl(endpoint) {
        return `${this.api.baseUrl}${endpoint}`;
    },

    isMobile() {
        return window.innerWidth <= this.ui.breakpoints.mobile;
    },

    isTablet() {
        return window.innerWidth > this.ui.breakpoints.mobile &&
            window.innerWidth <= this.ui.breakpoints.tablet;
    },

    isDesktop() {
        return window.innerWidth > this.ui.breakpoints.desktop;
    },

    getDeviceType() {
        if (this.isMobile()) return 'mobile';
        if (this.isTablet()) return 'tablet';
        return 'desktop';
    },

    validateEmail(email) {
        return this.validation.emailRegex.test(email);
    },

    validatePhone(phone) {
        return this.validation.phoneRegex.test(phone);
    },

    validatePassword(password) {
        return password.length >= this.validation.minPasswordLength;
    },

    formatCurrency(value, currency = this.locale.currency) {
        return new Intl.NumberFormat(this.locale.default, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: this.locale.numberFormat.precision,
            maximumFractionDigits: this.locale.numberFormat.precision
        }).format(value);
    },

    formatDate(date, format = this.locale.dateFormat) {
        if (!date) return '';

        const d = new Date(date);
        if (isNaN(d.getTime())) return '';

        return d.toLocaleDateString(this.locale.default);
    },

    formatDateTime(date) {
        if (!date) return '';

        const d = new Date(date);
        if (isNaN(d.getTime())) return '';

        return `${this.formatDate(d)} ${d.toLocaleTimeString(this.locale.default)}`;
    },

    formatNumber(value, options = {}) {
        const defaultOptions = {
            minimumFractionDigits: this.locale.numberFormat.precision,
            maximumFractionDigits: this.locale.numberFormat.precision,
            ...options
        };

        return new Intl.NumberFormat(this.locale.default, defaultOptions).format(value);
    },

    log(level, message, ...args) {
        if (!this.app.debug) return;

        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

        switch (level) {
            case 'error':
                console.error(prefix, message, ...args);
                break;
            case 'warn':
                console.warn(prefix, message, ...args);
                break;
            case 'info':
                console.info(prefix, message, ...args);
                break;
            case 'debug':
                console.debug(prefix, message, ...args);
                break;
            default:
                console.log(prefix, message, ...args);
        }
    },

    error(message, ...args) {
        this.log('error', message, ...args);
    },

    warn(message, ...args) {
        this.log('warn', message, ...args);
    },

    info(message, ...args) {
        this.log('info', message, ...args);
    },

    debug(message, ...args) {
        this.log('debug', message, ...args);
    },

    // Configurações específicas por ambiente
    getEnvironmentConfig() {
        if (this.isDevelopment()) {
            return {
                debug: true,
                logLevel: 'debug',
                showErrorDetails: true,
                cacheTTL: 60 * 1000, // 1 minuto em desenvolvimento
                apiTimeout: 60000 // 60 segundos em desenvolvimento
            };
        }

        if (this.isProduction()) {
            return {
                debug: false,
                logLevel: 'info',
                showErrorDetails: false,
                cacheTTL: 5 * 60 * 1000, // 5 minutos em produção
                apiTimeout: 30000 // 30 segundos em produção
            };
        }

        return {
            debug: false,
            logLevel: 'warn',
            showErrorDetails: false,
            cacheTTL: 5 * 60 * 1000,
            apiTimeout: 30000
        };
    },

    // Obter configuração completa
    getConfig() {
        const envConfig = this.getEnvironmentConfig();

        return {
            ...this,
            ...envConfig
        };
    }
};

// Função para inicializar a configuração
function initializeConfig() {
    // Aplicar configurações específicas do ambiente
    const envConfig = AppConfig.getEnvironmentConfig();

    // Atualizar configurações baseadas no ambiente
    AppConfig.api.timeout = envConfig.apiTimeout;
    AppConfig.cache.defaultTTL = envConfig.cacheTTL;
    AppConfig.app.debug = envConfig.debug;
    AppConfig.error.showDetails = envConfig.showErrorDetails;

    // Configurar logging baseado no ambiente
    if (window.logger) {
        window.logger.configure({
            level: envConfig.logLevel,
            enableConsole: envConfig.debug,
            enableServer: !envConfig.debug
        });
    }

    console.log('✅ Configuração inicializada:', {
        environment: AppConfig.app.environment,
        version: AppConfig.app.version,
        debug: AppConfig.app.debug
    });
}

// Inicializar configuração quando possível
if (typeof window !== 'undefined') {
    initializeConfig();
} else {
    // Aguardar DOM estar pronto
    document.addEventListener('DOMContentLoaded', initializeConfig);
}

// Exportar para uso global
window.AppConfig = AppConfig;

// Métodos de conveniência
window.isDevelopment = () => AppConfig.isDevelopment();
window.isProduction = () => AppConfig.isProduction();
window.isMobile = () => AppConfig.isMobile();
window.isDesktop = () => AppConfig.isDesktop();
window.formatCurrency = (value) => AppConfig.formatCurrency(value);
window.formatDate = (date) => AppConfig.formatDate(date);
window.validateEmail = (email) => AppConfig.validateEmail(email);
window.validatePhone = (phone) => AppConfig.validatePhone(phone); 