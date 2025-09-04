/**
 * 🗂️ Gerenciador de Estado Centralizado
 * Gerencia o estado global da aplicação de forma reativa
 */

class StateManager {
    constructor() {
        this.state = {
            // Estado da aplicação
            app: {
                isInitialized: false,
                currentPage: null,
                isLoading: false,
                isOnline: navigator.onLine,
                lastActivity: Date.now()
            },

            // Estado de autenticação
            auth: {
                isAuthenticated: false,
                user: null,
                token: null,
                permissions: [],
                lastLogin: null
            },

            // Estado de dados
            data: {
                cache: new Map(),
                offlineQueue: [],
                syncStatus: 'idle', // idle, syncing, error
                lastSync: null
            },

            // Estado de UI
            ui: {
                theme: 'light',
                sidebarOpen: false,
                notifications: [],
                modals: [],
                tooltips: [],
                loadingStates: new Map()
            },

            // Estado de páginas
            pages: {
                dashboard: {
                    stats: null,
                    activities: [],
                    alerts: [],
                    lastUpdate: null
                },
                produtos: {
                    items: [],
                    filters: {},
                    pagination: { page: 1, limit: 20, total: 0 },
                    lastUpdate: null
                },
                clientes: {
                    items: [],
                    filters: {},
                    pagination: { page: 1, limit: 20, total: 0 },
                    lastUpdate: null
                },
                vendas: {
                    items: [],
                    filters: {},
                    pagination: { page: 1, limit: 20, total: 0 },
                    lastUpdate: null
                },
                orcamentos: {
                    items: [],
                    filters: {},
                    pagination: { page: 1, limit: 20, total: 0 },
                    lastUpdate: null
                },
                relatorios: {
                    data: null,
                    filters: {},
                    lastUpdate: null
                }
            },

            // Estado de erros
            errors: {
                list: [],
                lastError: null
            }
        };

        // Listeners para mudanças de estado
        this.listeners = new Map();

        // Histórico de estados (para debug)
        this.history = [];
        this.maxHistorySize = 50;

        // Inicializar
        this.initialize();
    }

    /**
     * Inicializar o gerenciador de estado
     */
    initialize() {
        // Carregar estado persistido
        this.loadPersistedState();

        // Configurar listeners de eventos
        this.setupEventListeners();

        // Marcar como inicializado
        this.setState('app.isInitialized', true);

        console.log('✅ StateManager inicializado');
    }

    /**
     * Carregar estado persistido do localStorage
     */
    loadPersistedState() {
        try {
            const persisted = localStorage.getItem('app_state');
            if (persisted) {
                const parsed = JSON.parse(persisted);

                // Mesclar apenas estados que devem ser persistidos
                if (parsed.auth) {
                    this.state.auth = { ...this.state.auth, ...parsed.auth };
                }
                if (parsed.ui) {
                    this.state.ui = { ...this.state.ui, ...parsed.ui };
                }
                if (parsed.data) {
                    this.state.data = { ...this.state.data, ...parsed.data };
                }
            }
        } catch (error) {
            console.warn('Erro ao carregar estado persistido:', error);
        }
    }

    /**
     * Salvar estado no localStorage
     */
    savePersistedState() {
        try {
            const toPersist = {
                auth: this.state.auth,
                ui: this.state.ui,
                data: this.state.data
            };

            localStorage.setItem('app_state', JSON.stringify(toPersist));
        } catch (error) {
            console.warn('Erro ao salvar estado persistido:', error);
        }
    }

    /**
     * Configurar listeners de eventos
     */
    setupEventListeners() {
        // Listener para mudanças de conectividade
        window.addEventListener('online', () => {
            this.setState('app.isOnline', true);
            this.triggerSync();
        });

        window.addEventListener('offline', () => {
            this.setState('app.isOnline', false);
        });

        // Listener para atividade do usuário
        const updateActivity = () => {
            this.setState('app.lastActivity', Date.now());
        };

        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, updateActivity, true);
        });

        // Salvar estado periodicamente
        setInterval(() => {
            this.savePersistedState();
        }, 30000); // A cada 30 segundos
    }

    /**
     * Obter valor do estado
     */
    get(path) {
        return this.getNestedValue(this.state, path);
    }

    /**
     * Definir valor no estado
     */
    setState(path, value) {
        const oldValue = this.get(path);

        // Não atualizar se o valor for igual
        if (this.isEqual(oldValue, value)) {
            return;
        }

        // Atualizar estado
        this.setNestedValue(this.state, path, value);

        // Adicionar ao histórico
        this.addToHistory(path, oldValue, value);

        // Notificar listeners
        this.notifyListeners(path, value, oldValue);

        // Salvar estado se necessário
        if (this.shouldPersist(path)) {
            this.savePersistedState();
        }
    }

    /**
     * Atualizar múltiplos valores no estado
     */
    setStateBatch(updates) {
        const oldValues = {};
        const newValues = {};

        // Coletar valores antigos
        Object.keys(updates).forEach(path => {
            oldValues[path] = this.get(path);
        });

        // Aplicar atualizações
        Object.entries(updates).forEach(([path, value]) => {
            this.setNestedValue(this.state, path, value);
            newValues[path] = value;
        });

        // Notificar listeners
        Object.entries(updates).forEach(([path, value]) => {
            this.notifyListeners(path, value, oldValues[path]);
        });

        // Salvar estado
        this.savePersistedState();
    }

    /**
     * Obter valor aninhado do objeto
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj);
    }

    /**
     * Definir valor aninhado no objeto
     */
    setNestedValue(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((current, key) => {
            if (!current[key] || typeof current[key] !== 'object') {
                current[key] = {};
            }
            return current[key];
        }, obj);

        target[lastKey] = value;
    }

    /**
     * Comparar valores
     */
    isEqual(a, b) {
        if (a === b) return true;
        if (a == null || b == null) return false;
        if (typeof a !== typeof b) return false;

        if (typeof a === 'object') {
            if (Array.isArray(a) !== Array.isArray(b)) return false;
            if (Array.isArray(a)) {
                if (a.length !== b.length) return false;
                return a.every((val, index) => this.isEqual(val, b[index]));
            }

            const keysA = Object.keys(a);
            const keysB = Object.keys(b);
            if (keysA.length !== keysB.length) return false;
            return keysA.every(key => this.isEqual(a[key], b[key]));
        }

        return false;
    }

    /**
     * Adicionar ao histórico
     */
    addToHistory(path, oldValue, newValue) {
        this.history.push({
            timestamp: Date.now(),
            path,
            oldValue,
            newValue
        });

        // Manter tamanho máximo do histórico
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }
    }

    /**
     * Verificar se deve persistir o estado
     */
    shouldPersist(path) {
        const persistPaths = [
            'auth',
            'ui.theme',
            'ui.sidebarOpen',
            'data.offlineQueue',
            'data.syncStatus'
        ];

        return persistPaths.some(persistPath => path.startsWith(persistPath));
    }

    /**
     * Adicionar listener para mudanças de estado
     */
    subscribe(path, callback) {
        if (!this.listeners.has(path)) {
            this.listeners.set(path, new Set());
        }

        this.listeners.get(path).add(callback);

        // Retornar função para cancelar inscrição
        return () => {
            const pathListeners = this.listeners.get(path);
            if (pathListeners) {
                pathListeners.delete(callback);
                if (pathListeners.size === 0) {
                    this.listeners.delete(path);
                }
            }
        };
    }

    /**
     * Notificar listeners
     */
    notifyListeners(path, newValue, oldValue) {
        // Notificar listeners específicos do caminho
        if (this.listeners.has(path)) {
            this.listeners.get(path).forEach(callback => {
                try {
                    callback(newValue, oldValue, path);
                } catch (error) {
                    console.error('Erro no listener:', error);
                }
            });
        }

        // Notificar listeners de caminhos pai
        const pathParts = path.split('.');
        while (pathParts.length > 1) {
            pathParts.pop();
            const parentPath = pathParts.join('.');

            if (this.listeners.has(parentPath)) {
                this.listeners.get(parentPath).forEach(callback => {
                    try {
                        callback(this.get(parentPath), oldValue, path);
                    } catch (error) {
                        console.error('Erro no listener pai:', error);
                    }
                });
            }
        }
    }

    /**
     * Obter estado completo
     */
    getState() {
        return JSON.parse(JSON.stringify(this.state));
    }

    /**
     * Definir estado completo
     */
    setState(state) {
        this.state = JSON.parse(JSON.stringify(state));
        this.savePersistedState();

        // Notificar todos os listeners
        this.listeners.forEach((callbacks, path) => {
            callbacks.forEach(callback => {
                try {
                    callback(this.get(path), null, path);
                } catch (error) {
                    console.error('Erro no listener:', error);
                }
            });
        });
    }

    /**
     * Resetar estado
     */
    reset() {
        this.state = {
            app: {
                isInitialized: false,
                currentPage: null,
                isLoading: false,
                isOnline: navigator.onLine,
                lastActivity: Date.now()
            },
            auth: {
                isAuthenticated: false,
                user: null,
                token: null,
                permissions: [],
                lastLogin: null
            },
            data: {
                cache: new Map(),
                offlineQueue: [],
                syncStatus: 'idle',
                lastSync: null
            },
            ui: {
                theme: 'light',
                sidebarOpen: false,
                notifications: [],
                modals: [],
                tooltips: [],
                loadingStates: new Map()
            },
            pages: {
                dashboard: {
                    stats: null,
                    activities: [],
                    alerts: [],
                    lastUpdate: null
                },
                produtos: {
                    items: [],
                    filters: {},
                    pagination: { page: 1, limit: 20, total: 0 },
                    lastUpdate: null
                },
                clientes: {
                    items: [],
                    filters: {},
                    pagination: { page: 1, limit: 20, total: 0 },
                    lastUpdate: null
                },
                vendas: {
                    items: [],
                    filters: {},
                    pagination: { page: 1, limit: 20, total: 0 },
                    lastUpdate: null
                },
                orcamentos: {
                    items: [],
                    filters: {},
                    pagination: { page: 1, limit: 20, total: 0 },
                    lastUpdate: null
                },
                relatorios: {
                    data: null,
                    filters: {},
                    lastUpdate: null
                }
            },
            errors: {
                list: [],
                lastError: null
            }
        };

        this.savePersistedState();
    }

    /**
     * Obter histórico de mudanças
     */
    getHistory() {
        return [...this.history];
    }

    /**
     * Limpar histórico
     */
    clearHistory() {
        this.history = [];
    }

    /**
     * Adicionar erro
     */
    addError(error) {
        const errorEntry = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            message: error.message || error,
            stack: error.stack,
            context: error.context || {}
        };

        this.state.errors.list.push(errorEntry);
        this.setState('errors.lastError', errorEntry);

        // Manter apenas os últimos 50 erros
        if (this.state.errors.list.length > 50) {
            this.state.errors.list.shift();
        }
    }

    /**
     * Limpar erros
     */
    clearErrors() {
        this.setState('errors.list', []);
        this.setState('errors.lastError', null);
    }

    /**
     * Adicionar notificação
     */
    addNotification(notification) {
        const notificationEntry = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            type: notification.type || 'info',
            title: notification.title || '',
            message: notification.message || '',
            duration: notification.duration || 5000,
            persistent: notification.persistent || false,
            ...notification
        };

        this.state.ui.notifications.push(notificationEntry);

        // Remover notificação após duração
        if (!notificationEntry.persistent) {
            setTimeout(() => {
                this.removeNotification(notificationEntry.id);
            }, notificationEntry.duration);
        }
    }

    /**
     * Remover notificação
     */
    removeNotification(id) {
        this.state.ui.notifications = this.state.ui.notifications.filter(
            notification => notification.id !== id
        );
    }

    /**
     * Limpar todas as notificações
     */
    clearNotifications() {
        this.setState('ui.notifications', []);
    }

    /**
     * Definir estado de carregamento
     */
    setLoading(key, isLoading) {
        this.state.ui.loadingStates.set(key, isLoading);
    }

    /**
     * Verificar se está carregando
     */
    isLoading(key) {
        return this.state.ui.loadingStates.get(key) || false;
    }

    /**
     * Trigger de sincronização
     */
    triggerSync() {
        if (this.state.app.isOnline && this.state.data.offlineQueue.length > 0) {
            this.setState('data.syncStatus', 'syncing');
            // Aqui você implementaria a lógica de sincronização
            setTimeout(() => {
                this.setState('data.syncStatus', 'idle');
                this.setState('data.lastSync', Date.now());
            }, 1000);
        }
    }

    /**
     * Métodos de conveniência para autenticação
     */
    setAuth(user, token, permissions = []) {
        this.setStateBatch({
            'auth.isAuthenticated': true,
            'auth.user': user,
            'auth.token': token,
            'auth.permissions': permissions,
            'auth.lastLogin': Date.now()
        });
    }

    clearAuth() {
        this.setStateBatch({
            'auth.isAuthenticated': false,
            'auth.user': null,
            'auth.token': null,
            'auth.permissions': [],
            'auth.lastLogin': null
        });
    }

    /**
     * Métodos de conveniência para UI
     */
    setTheme(theme) {
        this.setState('ui.theme', theme);
    }

    toggleSidebar() {
        this.setState('ui.sidebarOpen', !this.state.ui.sidebarOpen);
    }

    /**
     * Métodos de conveniência para páginas
     */
    setPageData(page, data) {
        this.setState(`pages.${page}`, {
            ...this.state.pages[page],
            ...data,
            lastUpdate: Date.now()
        });
    }

    clearPageData(page) {
        this.setState(`pages.${page}`, {
            items: [],
            filters: {},
            pagination: { page: 1, limit: 20, total: 0 },
            lastUpdate: null
        });
    }
}

// Criar instância global
const stateManager = new StateManager();

// Exportar para uso global
window.StateManager = stateManager;
window.state = stateManager;

// Métodos de conveniência globais
window.getState = (path) => stateManager.get(path);
window.setState = (path, value) => stateManager.setState(path, value);
window.subscribe = (path, callback) => stateManager.subscribe(path, callback); 