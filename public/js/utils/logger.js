/**
 * 📝 Logger - Sistema de Logs
 * Sistema de logs centralizado para o navegador
 */

class Logger {
    constructor() {
        this.level = 'info'; // debug, info, warn, error
        this.enabled = true;
        this.maxEntries = 1000;
        this.entries = [];

        // Configurar níveis
        this.levels = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3
        };

        // Cores para console
        this.colors = {
            debug: '#6B7280',
            info: '#3B82F6',
            warn: '#F59E0B',
            error: '#EF4444'
        };
    }

    /**
     * Configurar logger
     */
    configure(config = {}) {
        this.level = config.level || this.level;
        this.enabled = config.enabled !== undefined ? config.enabled : this.enabled;
        this.maxEntries = config.maxEntries || this.maxEntries;
    }

    /**
     * Log de debug
     */
    debug(message, data = null) {
        this.log('debug', message, data);
    }

    /**
     * Log de informação
     */
    info(message, data = null) {
        this.log('info', message, data);
    }

    /**
     * Log de aviso
     */
    warn(message, data = null) {
        this.log('warn', message, data);
    }

    /**
     * Log de erro
     */
    error(message, data = null) {
        this.log('error', message, data);
    }

    /**
     * Log principal
     */
    log(level, message, data = null) {
        if (!this.enabled || this.levels[level] < this.levels[this.level]) {
            return;
        }

        const timestamp = new Date().toISOString();
        const entry = {
            timestamp,
            level,
            message,
            data,
            stack: level === 'error' ? new Error().stack : null
        };

        // Adicionar à lista de entradas
        this.entries.push(entry);
        if (this.entries.length > this.maxEntries) {
            this.entries.shift();
        }

        // Log no console
        this.consoleLog(level, message, data, entry);

        // Disparar evento
        this.dispatchEvent('logger:entry', entry);
    }

    /**
     * Log no console
     */
    consoleLog(level, message, data, entry) {
        const prefix = `[${entry.timestamp}] [${level.toUpperCase()}]`;
        const color = this.colors[level];

        if (data) {
            console.group(`%c${prefix} ${message}`, `color: ${color}; font-weight: bold;`);
            console.log('Data:', data);
            if (entry.stack) {
                console.log('Stack:', entry.stack);
            }
            console.groupEnd();
        } else {
            console.log(`%c${prefix} ${message}`, `color: ${color}; font-weight: bold;`);
        }
    }

    /**
     * Obter entradas
     */
    getEntries(level = null, limit = null) {
        let entries = this.entries;

        if (level) {
            entries = entries.filter(entry => entry.level === level);
        }

        if (limit) {
            entries = entries.slice(-limit);
        }

        return entries;
    }

    /**
     * Limpar logs
     */
    clear() {
        this.entries = [];
        this.dispatchEvent('logger:cleared');
    }

    /**
     * Exportar logs
     */
    export() {
        return {
            timestamp: new Date().toISOString(),
            entries: this.entries,
            config: {
                level: this.level,
                enabled: this.enabled,
                maxEntries: this.maxEntries
            }
        };
    }

    /**
     * Disparar evento
     */
    dispatchEvent(name, data = {}) {
        const event = new CustomEvent(name, {
            detail: data,
            bubbles: true
        });
        document.dispatchEvent(event);
    }

    /**
     * Métodos de conveniência
     */
    group(label) {
        if (this.enabled) {
            console.group(label);
        }
    }

    groupEnd() {
        if (this.enabled) {
            console.groupEnd();
        }
    }

    table(data) {
        if (this.enabled) {
            console.table(data);
        }
    }

    time(label) {
        if (this.enabled) {
            console.time(label);
        }
    }

    timeEnd(label) {
        if (this.enabled) {
            console.timeEnd(label);
        }
    }
}

// Criar instância global
const logger = new Logger();

// Configurar com AppConfig se disponível
if (window.AppConfig) {
    logger.configure({
        level: AppConfig.get ? AppConfig.get('logging.level', 'info') : 'info',
        enabled: AppConfig.get ? AppConfig.get('logging.console', true) : true,
        maxEntries: AppConfig.get ? AppConfig.get('logging.maxEntries', 1000) : 1000
    });
}

// Exportar para uso global
window.Logger = logger;
window.logger = logger;

// Funções de conveniência
window.logDebug = (message, data) => logger.debug(message, data);
window.logInfo = (message, data) => logger.info(message, data);
window.logWarn = (message, data) => logger.warn(message, data);
window.logError = (message, data) => logger.error(message, data);

// Interceptar console.error para log automático
const originalConsoleError = console.error;
console.error = function (...args) {
    logger.error(args.join(' '));
    originalConsoleError.apply(console, args);
};

// Interceptar console.warn para log automático
const originalConsoleWarn = console.warn;
console.warn = function (...args) {
    logger.warn(args.join(' '));
    originalConsoleWarn.apply(console, args);
};

console.log('📝 Logger inicializado!');
