/**
 * ⚙️ CONFIG - Configurações do Sistema
 * Centraliza todas as configurações do sistema
 */

const SystemConfig = {
    // Configurações gerais
    APP_NAME: 'Sistema de Vendas',
    APP_VERSION: '2.0.0',
    APP_ENV: 'development', // Fixo para navegador

    // Configurações de API
    API: {
        BASE_URL: '/api',
        TIMEOUT: 30000,
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 1000
    },

    // Configurações de autenticação
    AUTH: {
        TOKEN_KEY: 'authToken',
        USER_DATA_KEY: 'userData',
        TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24 horas
        REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutos
        CHECK_INTERVAL: 30000 // 30 segundos
    },

    // Configurações de cache
    CACHE: {
        DEFAULT_TTL: 300000, // 5 minutos
        MAX_SIZE: 100,
        CLEANUP_INTERVAL: 60000 // 1 minuto
    },

    // Configurações de sincronização
    SYNC: {
        INTERVAL: 30000, // 30 segundos
        MAX_QUEUE_SIZE: 100,
        MAX_RETRIES: 3,
        RETRY_DELAY: 5000 // 5 segundos
    },

    // Configurações de notificações
    NOTIFICATIONS: {
        DEFAULT_DURATION: 5000,
        MAX_VISIBLE: 5,
        POSITION: 'top-right'
    },

    // Configurações de responsividade
    BREAKPOINTS: {
        MOBILE: 768,
        TABLET: 1024,
        DESKTOP: 1025
    },

    // Configurações de paginação
    PAGINATION: {
        DEFAULT_PAGE_SIZE: 20,
        MAX_PAGE_SIZE: 100,
        PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
    },

    // Configurações de upload
    UPLOAD: {
        MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
        ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
        MAX_FILES: 10
    },

    // Configurações de gráficos
    CHARTS: {
        COLORS: [
            '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
            '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
        ],
        ANIMATION_DURATION: 1000,
        RESPONSIVE: true
    },

    // Configurações de validação
    VALIDATION: {
        MIN_PASSWORD_LENGTH: 6,
        MAX_NAME_LENGTH: 100,
        MAX_DESCRIPTION_LENGTH: 500,
        PHONE_REGEX: /^[\+]?[1-9][\d]{0,15}$/,
        EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },

    // Configurações de erro
    ERROR: {
        SHOW_DETAILS: true, // Sempre true no navegador
        LOG_TO_CONSOLE: true,
        REPORT_TO_SERVER: true
    },

    // Configurações de debug
    DEBUG: {
        ENABLED: true, // Sempre true no navegador
        LOG_LEVEL: 'info', // 'error', 'warn', 'info', 'debug'
        SHOW_PERFORMANCE: true
    },

    // Configurações de performance
    PERFORMANCE: {
        LAZY_LOADING: true,
        IMAGE_OPTIMIZATION: true,
        BUNDLE_ANALYSIS: false
    },

    // Configurações de segurança
    SECURITY: {
        CSP_ENABLED: true,
        XSS_PROTECTION: true,
        CSRF_PROTECTION: true,
        RATE_LIMITING: true
    },

    // Configurações de localização
    LOCALE: {
        DEFAULT: 'pt-BR',
        SUPPORTED: ['pt-BR', 'en-US', 'es-ES'],
        DATE_FORMAT: 'DD/MM/YYYY',
        TIME_FORMAT: 'HH:mm',
        CURRENCY: 'BRL'
    },

    // Configurações de tema
    THEME: {
        DEFAULT: 'light',
        AVAILABLE: ['light', 'dark', 'auto'],
        ACCENT_COLOR: '#3B82F6',
        BORDER_RADIUS: '8px'
    },

    // Configurações de acessibilidade
    ACCESSIBILITY: {
        HIGH_CONTRAST: false,
        LARGE_TEXT: false,
        REDUCED_MOTION: false,
        SCREEN_READER: false
    },

    // Métodos utilitários
    isDevelopment() {
        return this.APP_ENV === 'development';
    },

    isProduction() {
        return this.APP_ENV === 'production';
    },

    isTest() {
        return this.APP_ENV === 'test';
    },

    getApiUrl(endpoint) {
        return `${this.API.BASE_URL}${endpoint}`;
    },

    isMobile() {
        return window.innerWidth <= this.BREAKPOINTS.MOBILE;
    },

    isTablet() {
        return window.innerWidth > this.BREAKPOINTS.MOBILE &&
            window.innerWidth <= this.BREAKPOINTS.TABLET;
    },

    isDesktop() {
        return window.innerWidth > this.BREAKPOINTS.DESKTOP;
    },

    getDeviceType() {
        if (this.isMobile()) return 'mobile';
        if (this.isTablet()) return 'tablet';
        return 'desktop';
    },

    validateEmail(email) {
        return this.VALIDATION.EMAIL_REGEX.test(email);
    },

    validatePhone(phone) {
        return this.VALIDATION.PHONE_REGEX.test(phone);
    },

    validatePassword(password) {
        return password.length >= this.VALIDATION.MIN_PASSWORD_LENGTH;
    },

    formatCurrency(value, currency = this.LOCALE.CURRENCY) {
        return new Intl.NumberFormat(this.LOCALE.DEFAULT, {
            style: 'currency',
            currency: currency
        }).format(value);
    },

    formatDate(date, format = this.LOCALE.DATE_FORMAT) {
        if (!date) return '';

        const d = new Date(date);
        if (isNaN(d.getTime())) return '';

        return d.toLocaleDateString(this.LOCALE.DEFAULT);
    },

    formatDateTime(date) {
        if (!date) return '';

        const d = new Date(date);
        if (isNaN(d.getTime())) return '';

        return `${this.formatDate(d)} ${d.toLocaleTimeString(this.LOCALE.DEFAULT)}`;
    },

    log(level, message, ...args) {
        if (!this.DEBUG.ENABLED) return;

        const levels = ['error', 'warn', 'info', 'debug'];
        const currentLevel = levels.indexOf(this.DEBUG.LOG_LEVEL);
        const messageLevel = levels.indexOf(level);

        if (messageLevel <= currentLevel) {
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
            }
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
    }
};

// Função para inicializar o SystemConfig
function initializeSystemConfig() {
    // Exportar para uso global
    window.SystemConfig = SystemConfig;

    // Configurações específicas por ambiente
    if (SystemConfig.isDevelopment()) {
        SystemConfig.DEBUG.LOG_LEVEL = 'debug';
        SystemConfig.ERROR.SHOW_DETAILS = true;
        SystemConfig.CACHE.DEFAULT_TTL = 60000; // 1 minuto em desenvolvimento
    }

    if (SystemConfig.isProduction()) {
        SystemConfig.DEBUG.ENABLED = false;
        SystemConfig.ERROR.SHOW_DETAILS = false;
        SystemConfig.ERROR.REPORT_TO_SERVER = true;
    }

    console.log('✅ SystemConfig inicializado:', SystemConfig);
}

// Inicializar imediatamente se possível
if (typeof window !== 'undefined') {
    initializeSystemConfig();
} else {
    // Aguardar DOM estar pronto
    document.addEventListener('DOMContentLoaded', initializeSystemConfig);
} 