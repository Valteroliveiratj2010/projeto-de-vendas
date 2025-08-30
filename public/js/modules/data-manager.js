/**
 * 📊 DATA MANAGER - Módulo de Gerenciamento de Dados
 * Responsável por toda a lógica de dados, cache e sincronização
 */

class DataManager {
    constructor() {
        this.cache = new Map();
        this.offlineData = new Map();
        this.syncQueue = [];
        this.isOnline = navigator.onLine;
        this.syncInterval = null;
        this.init();
    }

    init() {
        console.log('📊 Inicializando DataManager...');
        this.setupOnlineStatus();
        this.setupEventListeners();
        this.loadOfflineData();
        this.startSyncInterval();
    }

    setupOnlineStatus() {
        // Verificar status online/offline
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.handleOnlineStatus();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.handleOfflineStatus();
        });

        // Verificar status inicial
        this.isOnline = navigator.onLine;
        this.updateOfflineIndicator();
    }

    setupEventListeners() {
        // Event listener para sincronização manual
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-sync]')) {
                e.preventDefault();
                this.forceSync();
            }
        });
    }

    handleOnlineStatus() {
        console.log('🌐 Sistema online - Iniciando sincronização...');
        this.updateOfflineIndicator();
        this.syncOfflineData();
        this.processSyncQueue();
    }

    handleOfflineStatus() {
        console.log('📴 Sistema offline - Salvando dados localmente...');
        this.updateOfflineIndicator();
        this.stopSyncInterval();
    }

    updateOfflineIndicator() {
        const indicator = document.getElementById('offline-indicator');
        if (indicator) {
            if (this.isOnline) {
                indicator.classList.add('hidden');
            } else {
                indicator.classList.remove('hidden');
            }
        }
    }

    // Sistema de Cache
    setCache(key, data, ttl = 300000) { // 5 minutos padrão
        const cacheItem = {
            data: data,
            timestamp: Date.now(),
            ttl: ttl
        };
        
        this.cache.set(key, cacheItem);
        
        // Limpar cache expirado
        this.cleanExpiredCache();
    }

    getCache(key) {
        const item = this.cache.get(key);
        
        if (!item) return null;
        
        // Verificar se expirou
        if (Date.now() - item.timestamp > item.ttl) {
            this.cache.delete(key);
            return null;
        }
        
        return item.data;
    }

    clearCache(key = null) {
        if (key) {
            this.cache.delete(key);
        } else {
            this.cache.clear();
        }
    }

    cleanExpiredCache() {
        const now = Date.now();
        for (const [key, item] of this.cache.entries()) {
            if (now - item.timestamp > item.ttl) {
                this.cache.delete(key);
            }
        }
    }

    // Sistema de Dados Offline
    saveOfflineData(key, data) {
        this.offlineData.set(key, {
            data: data,
            timestamp: Date.now(),
            synced: false
        });
        
        // Salvar no localStorage
        this.persistOfflineData();
    }

    getOfflineData(key) {
        const item = this.offlineData.get(key);
        return item ? item.data : null;
    }

    markAsSynced(key) {
        const item = this.offlineData.get(key);
        if (item) {
            item.synced = true;
            this.persistOfflineData();
        }
    }

    persistOfflineData() {
        try {
            const data = {};
            for (const [key, value] of this.offlineData.entries()) {
                data[key] = value;
            }
            localStorage.setItem('offlineData', JSON.stringify(data));
        } catch (error) {
            console.error('Erro ao salvar dados offline:', error);
        }
    }

    loadOfflineData() {
        try {
            const data = localStorage.getItem('offlineData');
            if (data) {
                const parsed = JSON.parse(data);
                for (const [key, value] of Object.entries(parsed)) {
                    this.offlineData.set(key, value);
                }
            }
        } catch (error) {
            console.error('Erro ao carregar dados offline:', error);
        }
    }

    // Sistema de Sincronização
    addToSyncQueue(operation) {
        this.syncQueue.push({
            ...operation,
            timestamp: Date.now(),
            retries: 0
        });
        
        this.persistSyncQueue();
    }

    processSyncQueue() {
        if (!this.isOnline || this.syncQueue.length === 0) return;

        console.log(`🔄 Processando fila de sincronização (${this.syncQueue.length} itens)...`);

        const queue = [...this.syncQueue];
        this.syncQueue = [];

        queue.forEach(async (operation) => {
            try {
                await this.executeSyncOperation(operation);
            } catch (error) {
                console.error('Erro na sincronização:', error);
                // Re-adicionar à fila se não excedeu tentativas
                if (operation.retries < 3) {
                    operation.retries++;
                    this.syncQueue.push(operation);
                }
            }
        });

        this.persistSyncQueue();
    }

    async executeSyncOperation(operation) {
        const { type, endpoint, data, method = 'POST' } = operation;

        try {
            const response = await fetch(`/api${endpoint}`, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.authManager?.getToken()}`
                },
                body: method !== 'GET' ? JSON.stringify(data) : undefined
            });

            if (response.ok) {
                console.log(`✅ Sincronização bem-sucedida: ${type}`);
                this.markAsSynced(operation.key);
                return true;
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            throw new Error(`Falha na sincronização: ${error.message}`);
        }
    }

    persistSyncQueue() {
        try {
            localStorage.setItem('syncQueue', JSON.stringify(this.syncQueue));
        } catch (error) {
            console.error('Erro ao salvar fila de sincronização:', error);
        }
    }

    loadSyncQueue() {
        try {
            const data = localStorage.getItem('syncQueue');
            if (data) {
                this.syncQueue = JSON.parse(data);
            }
        } catch (error) {
            console.error('Erro ao carregar fila de sincronização:', error);
        }
    }

    // Sincronização de dados específicos
    async syncData(type, data) {
        if (this.isOnline) {
            // Tentar sincronizar imediatamente
            try {
                await this.executeSyncOperation({
                    type: type,
                    endpoint: `/${type}`,
                    data: data
                });
                return true;
            } catch (error) {
                console.warn('Sincronização imediata falhou, adicionando à fila:', error);
            }
        }

        // Adicionar à fila de sincronização
        this.addToSyncQueue({
            type: type,
            endpoint: `/${type}`,
            data: data
        });

        return false;
    }

    // Sincronização forçada
    async forceSync() {
        if (!this.isOnline) {
            this.showNotification('Sistema offline. Sincronização será feita quando voltar online.', 'warning');
            return false;
        }

        const loading = window.uiManager?.showLoading('Sincronizando dados...');
        
        try {
            await this.syncOfflineData();
            await this.processSyncQueue();
            
            this.showNotification('Sincronização concluída com sucesso!', 'success');
            return true;
        } catch (error) {
            console.error('Erro na sincronização forçada:', error);
            this.showNotification('Erro na sincronização. Tente novamente.', 'error');
            return false;
        } finally {
            if (loading) {
                window.uiManager?.hideLoading(loading);
            }
        }
    }

    // Sincronizar dados offline
    async syncOfflineData() {
        const unsyncedData = [];
        
        for (const [key, item] of this.offlineData.entries()) {
            if (!item.synced) {
                unsyncedData.push({ key, ...item });
            }
        }

        if (unsyncedData.length === 0) {
            console.log('✅ Todos os dados já estão sincronizados');
            return;
        }

        console.log(`🔄 Sincronizando ${unsyncedData.length} itens offline...`);

        for (const item of unsyncedData) {
            try {
                await this.executeSyncOperation({
                    type: item.type || 'data',
                    endpoint: item.endpoint || '/sync',
                    data: item.data
                });
                
                this.markAsSynced(item.key);
            } catch (error) {
                console.error(`Erro ao sincronizar item ${item.key}:`, error);
            }
        }
    }

    // Intervalo de sincronização
    startSyncInterval() {
        if (this.syncInterval) return;
        
        this.syncInterval = setInterval(() => {
            if (this.isOnline) {
                this.processSyncQueue();
            }
        }, 30000); // Sincronizar a cada 30 segundos
    }

    stopSyncInterval() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    // Notificações
    showNotification(message, type = 'info') {
        if (window.uiManager) {
            window.uiManager.showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    // Getters para uso externo
    getOnlineStatus() {
        return this.isOnline;
    }

    getCacheSize() {
        return this.cache.size;
    }

    getOfflineDataSize() {
        return this.offlineData.size;
    }

    getSyncQueueSize() {
        return this.syncQueue.length;
    }

    // Verificar se há dados não sincronizados
    hasUnsyncedData() {
        for (const item of this.offlineData.values()) {
            if (!item.synced) return true;
        }
        return false;
    }

    // Limpar dados antigos
    cleanupOldData(maxAge = 7 * 24 * 60 * 60 * 1000) { // 7 dias
        const now = Date.now();
        let cleaned = 0;

        // Limpar dados offline antigos
        for (const [key, item] of this.offlineData.entries()) {
            if (now - item.timestamp > maxAge) {
                this.offlineData.delete(key);
                cleaned++;
            }
        }

        // Limpar fila de sincronização antiga
        this.syncQueue = this.syncQueue.filter(item => {
            if (now - item.timestamp > maxAge) {
                cleaned++;
                return false;
            }
            return true;
        });

        if (cleaned > 0) {
            console.log(`🧹 Limpeza concluída: ${cleaned} itens removidos`);
            this.persistOfflineData();
            this.persistSyncQueue();
        }

        return cleaned;
    }
}

// Exportar para uso global
window.DataManager = DataManager; 