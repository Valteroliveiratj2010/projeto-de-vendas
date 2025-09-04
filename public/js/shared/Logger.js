/**
 * 📝 Sistema de Logging - Refatorado
 * Logging estruturado e configurável
 */

class Logger {
    constructor(config = {}) {
        this.config = {
            level: config.level || 'info',
            enableConsole: config.enableConsole !== false,
            enableServer: config.enableServer !== false,
            enableFile: config.enableFile || false,
            maxFileSize: config.maxFileSize || 5 * 1024 * 1024, // 5MB
            maxFiles: config.maxFiles || 5,
            timestamp: config.timestamp !== false,
            colors: config.colors !== false,
            ...config
        };

        this.levels = {
            error: 0,
            warn: 1,
            info: 2,
            debug: 3
        };

        this.colors = {
            error: '#ef4444',
            warn: '#f59e0b',
            info: '#3b82f6',
            debug: '#10b981'
        };

        this.logQueue = [];
        this.isProcessing = false;
    }

    /**
     * Log de erro
     * @param {string} message - Mensagem
     * @param {*} data - Dados adicionais
     * @param {Object} context - Contexto
     */
    error(message, data = null, context = {}) {
        this.log('error', message, data, context);
    }

    /**
     * Log de aviso
     * @param {string} message - Mensagem
     * @param {*} data - Dados adicionais
     * @param {Object} context - Contexto
     */
    warn(message, data = null, context = {}) {
        this.log('warn', message, data, context);
    }

    /**
     * Log de informação
     * @param {string} message - Mensagem
     * @param {*} data - Dados adicionais
     * @param {Object} context - Contexto
     */
    info(message, data = null, context = {}) {
        this.log('info', message, data, context);
    }

    /**
     * Log de debug
     * @param {string} message - Mensagem
     * @param {*} data - Dados adicionais
     * @param {Object} context - Contexto
     */
    debug(message, data = null, context = {}) {
        this.log('debug', message, data, context);
    }

    /**
     * Log principal
     * @param {string} level - Nível do log
     * @param {string} message - Mensagem
     * @param {*} data - Dados adicionais
     * @param {Object} context - Contexto
     */
    log(level, message, data = null, context = {}) {
        // Verificar se o nível está habilitado
        if (this.levels[level] > this.levels[this.config.level]) {
            return;
        }

        const logEntry = this.createLogEntry(level, message, data, context);

        // Adicionar à fila
        this.logQueue.push(logEntry);

        // Processar fila
        this.processQueue();
    }

    /**
     * Criar entrada de log
     * @param {string} level - Nível do log
     * @param {string} message - Mensagem
     * @param {*} data - Dados adicionais
     * @param {Object} context - Contexto
     * @returns {Object} Entrada de log
     */
    createLogEntry(level, message, data, context) {
        const entry = {
            level,
            message,
            data,
            context: {
                url: window.location.href,
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString(),
                ...context
            }
        };

        if (this.config.timestamp) {
            entry.timestamp = new Date().toISOString();
        }

        return entry;
    }

    /**
     * Processar fila de logs
     */
    async processQueue() {
        if (this.isProcessing || this.logQueue.length === 0) {
            return;
        }

        this.isProcessing = true;

        try {
            while (this.logQueue.length > 0) {
                const entry = this.logQueue.shift();
                await this.processLogEntry(entry);
            }
        } catch (error) {
            console.error('❌ Erro ao processar fila de logs:', error);
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Processar entrada de log
     * @param {Object} entry - Entrada de log
     */
    async processLogEntry(entry) {
        try {
            // Log no console
            if (this.config.enableConsole) {
                this.logToConsole(entry);
            }

            // Log no servidor
            if (this.config.enableServer) {
                await this.logToServer(entry);
            }

            // Log em arquivo
            if (this.config.enableFile) {
                await this.logToFile(entry);
            }

        } catch (error) {
            console.error('❌ Erro ao processar entrada de log:', error);
        }
    }

    /**
     * Log no console
     * @param {Object} entry - Entrada de log
     */
    logToConsole(entry) {
        const { level, message, data, context } = entry;

        let logMessage = `[${level.toUpperCase()}] ${message}`;

        if (this.config.timestamp) {
            logMessage = `[${entry.timestamp}] ${logMessage}`;
        }

        if (this.config.colors) {
            const color = this.colors[level];
            const style = `color: ${color}; font-weight: bold;`;

            switch (level) {
                case 'error':
                    console.error(`%c${logMessage}`, style, data || '', context);
                    break;
                case 'warn':
                    console.warn(`%c${logMessage}`, style, data || '', context);
                    break;
                case 'info':
                    console.info(`%c${logMessage}`, style, data || '', context);
                    break;
                case 'debug':
                    console.debug(`%c${logMessage}`, style, data || '', context);
                    break;
                default:
                    console.log(`%c${logMessage}`, style, data || '', context);
            }
        } else {
            switch (level) {
                case 'error':
                    console.error(logMessage, data || '', context);
                    break;
                case 'warn':
                    console.warn(logMessage, data || '', context);
                    break;
                case 'info':
                    console.info(logMessage, data || '', context);
                    break;
                case 'debug':
                    console.debug(logMessage, data || '', context);
                    break;
                default:
                    console.log(logMessage, data || '', context);
            }
        }
    }

    /**
     * Log no servidor
     * @param {Object} entry - Entrada de log
     */
    async logToServer(entry) {
        try {
            // Verificar se a API está disponível
            if (window.app && window.app.api) {
                await window.app.api.post('/api/logs', entry);
            }
        } catch (error) {
            // Se falhar, não mostrar erro para evitar loop infinito
            console.warn('⚠️ Erro ao enviar log para servidor:', error);
        }
    }

    /**
     * Log em arquivo (simulado)
     * @param {Object} entry - Entrada de log
     */
    async logToFile(entry) {
        try {
            // Em um ambiente real, isso seria implementado com File System API
            // Por enquanto, vamos simular salvando no localStorage
            const logs = JSON.parse(localStorage.getItem('app_logs') || '[]');
            logs.push(entry);

            // Manter apenas os últimos 1000 logs
            if (logs.length > 1000) {
                logs.splice(0, logs.length - 1000);
            }

            localStorage.setItem('app_logs', JSON.stringify(logs));

        } catch (error) {
            console.warn('⚠️ Erro ao salvar log em arquivo:', error);
        }
    }

    /**
     * Log de performance
     * @param {string} name - Nome da operação
     * @param {Function} fn - Função a ser medida
     * @returns {Promise} Resultado da função
     */
    async time(name, fn) {
        const start = performance.now();

        try {
            const result = await fn();
            const duration = performance.now() - start;

            this.info(`Performance: ${name}`, {
                duration: `${duration.toFixed(2)}ms`,
                name
            });

            return result;
        } catch (error) {
            const duration = performance.now() - start;

            this.error(`Performance Error: ${name}`, {
                duration: `${duration.toFixed(2)}ms`,
                name,
                error: error.message
            });

            throw error;
        }
    }

    /**
     * Log de erro com stack trace
     * @param {Error} error - Erro
     * @param {Object} context - Contexto
     */
    logError(error, context = {}) {
        this.error(error.message, {
            stack: error.stack,
            name: error.name,
            ...context
        });
    }

    /**
     * Log de requisição HTTP
     * @param {string} method - Método HTTP
     * @param {string} url - URL
     * @param {Object} requestData - Dados da requisição
     * @param {Object} responseData - Dados da resposta
     * @param {number} status - Status da resposta
     * @param {number} duration - Duração da requisição
     */
    logHttpRequest(method, url, requestData, responseData, status, duration) {
        const level = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'info';

        this[level]('HTTP Request', {
            method,
            url,
            status,
            duration: `${duration.toFixed(2)}ms`,
            requestData: this.sanitizeData(requestData),
            responseData: this.sanitizeData(responseData)
        });
    }

    /**
     * Sanitizar dados sensíveis
     * @param {*} data - Dados a serem sanitizados
     * @returns {*} Dados sanitizados
     */
    sanitizeData(data) {
        if (!data || typeof data !== 'object') {
            return data;
        }

        const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
        const sanitized = { ...data };

        for (const field of sensitiveFields) {
            if (sanitized[field]) {
                sanitized[field] = '***HIDDEN***';
            }
        }

        return sanitized;
    }

    /**
     * Obter logs salvos
     * @returns {Array} Logs salvos
     */
    getSavedLogs() {
        try {
            return JSON.parse(localStorage.getItem('app_logs') || '[]');
        } catch (error) {
            console.error('❌ Erro ao obter logs salvos:', error);
            return [];
        }
    }

    /**
     * Limpar logs salvos
     */
    clearSavedLogs() {
        try {
            localStorage.removeItem('app_logs');
        } catch (error) {
            console.error('❌ Erro ao limpar logs salvos:', error);
        }
    }

    /**
     * Exportar logs
     * @returns {string} Logs em formato JSON
     */
    exportLogs() {
        const logs = this.getSavedLogs();
        return JSON.stringify(logs, null, 2);
    }

    /**
     * Configurar logger
     * @param {Object} config - Nova configuração
     */
    configure(config) {
        this.config = {
            ...this.config,
            ...config
        };
    }

    /**
     * Verificar se um nível está habilitado
     * @param {string} level - Nível a ser verificado
     * @returns {boolean} True se habilitado
     */
    isLevelEnabled(level) {
        return this.levels[level] <= this.levels[this.config.level];
    }
}

// Instância global do logger
window.logger = new Logger({
    level: 'debug', // Sempre debug no navegador
    enableConsole: true,
    enableServer: true,
    enableFile: false,
    timestamp: true,
    colors: true
});

// Exportar para uso global
window.Logger = Logger;

// Métodos de conveniência
window.logError = (error, context) => window.logger.logError(error, context);
window.logInfo = (message, data, context) => window.logger.info(message, data, context);
window.logWarn = (message, data, context) => window.logger.warn(message, data, context);
window.logDebug = (message, data, context) => window.logger.debug(message, data, context); 