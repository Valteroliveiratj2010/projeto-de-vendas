/**
 * Módulo de Banco de Dados Local - Sistema de Vendas
 * Gerencia IndexedDB para funcionamento offline
 */

class LocalDatabase {
    constructor() {
        this.dbName = 'SistemaVendasDB';
        this.dbVersion = 1;
        this.db = null;
        this.init();
    }

    /**
     * Inicializa o banco de dados local
     */
    async init() {
        try {
            console.log('🚀 Inicializando banco de dados local...');
            
            // Verificar se IndexedDB está disponível
            if (!('indexedDB' in window)) {
                console.warn('⚠️ IndexedDB não está disponível');
                return;
            }
            
            // Abrir conexão
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = (event) => {
                console.error('❌ Erro ao abrir banco de dados:', event.target.error);
            };
            
            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('✅ Banco de dados local aberto com sucesso');
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                console.log('🔄 Atualizando banco de dados local...');
                
                // Criar stores
                this.createStores(db);
            };
            
        } catch (error) {
            console.error('❌ Erro ao inicializar banco local:', error);
        }
    }

    /**
     * Cria as stores do banco de dados
     */
    createStores(db) {
        // Store de clientes
        if (!db.objectStoreNames.contains('clientes')) {
            const clientesStore = db.createObjectStore('clientes', { keyPath: 'id', autoIncrement: true });
            clientesStore.createIndex('nome', 'nome', { unique: false });
            clientesStore.createIndex('documento', 'documento', { unique: true });
            console.log('✅ Store de clientes criada');
        }
        
        // Store de produtos
        if (!db.objectStoreNames.contains('produtos')) {
            const produtosStore = db.createObjectStore('produtos', { keyPath: 'id', autoIncrement: true });
            produtosStore.createIndex('nome', 'nome', { unique: false });
            produtosStore.createIndex('codigo', 'codigo', { unique: true });
            console.log('✅ Store de produtos criada');
        }
        
        // Store de vendas
        if (!db.objectStoreNames.contains('vendas')) {
            const vendasStore = db.createObjectStore('vendas', { keyPath: 'id', autoIncrement: true });
            vendasStore.createIndex('cliente_id', 'cliente_id', { unique: false });
            vendasStore.createIndex('status', 'status', { unique: false });
            vendasStore.createIndex('created_at', 'created_at', { unique: false });
            console.log('✅ Store de vendas criada');
        }
        
        // Store de itens de venda
        if (!db.objectStoreNames.contains('itens_venda')) {
            const itensStore = db.createObjectStore('itens_venda', { keyPath: 'id', autoIncrement: true });
            itensStore.createIndex('venda_id', 'venda_id', { unique: false });
            itensStore.createIndex('produto_id', 'produto_id', { unique: false });
            console.log('✅ Store de itens de venda criada');
        }
        
        // Store de pagamentos
        if (!db.objectStoreNames.contains('pagamentos')) {
            const pagamentosStore = db.createObjectStore('pagamentos', { keyPath: 'id', autoIncrement: true });
            pagamentosStore.createIndex('venda_id', 'venda_id', { unique: false });
            pagamentosStore.createIndex('data_pagto', 'data_pagto', { unique: false });
            console.log('✅ Store de pagamentos criada');
        }
        
        // Store de orçamentos
        if (!db.objectStoreNames.contains('orcamentos')) {
            const orcamentosStore = db.createObjectStore('orcamentos', { keyPath: 'id', autoIncrement: true });
            orcamentosStore.createIndex('cliente_id', 'cliente_id', { unique: false });
            orcamentosStore.createIndex('status', 'status', { unique: false });
            console.log('✅ Store de orçamentos criada');
        }
        
        // Store de sincronização
        if (!db.objectStoreNames.contains('sync_queue')) {
            const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
            syncStore.createIndex('type', 'type', { unique: false });
            syncStore.createIndex('status', 'status', { unique: false });
            console.log('✅ Store de sincronização criada');
        }
    }

    /**
     * Executa uma transação no banco
     */
    async executeTransaction(storeName, mode, operation) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Banco de dados não inicializado'));
                return;
            }
            
            const transaction = this.db.transaction([storeName], mode);
            const store = transaction.objectStore(storeName);
            
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
            
            operation(store);
        });
    }

    /**
     * Adiciona um item
     */
    async add(storeName, item) {
        try {
            await this.executeTransaction(storeName, 'readwrite', (store) => {
                store.add(item);
            });
            return true;
        } catch (error) {
            console.error(`❌ Erro ao adicionar em ${storeName}:`, error);
            throw error;
        }
    }

    /**
     * Atualiza um item
     */
    async update(storeName, item) {
        try {
            await this.executeTransaction(storeName, 'readwrite', (store) => {
                store.put(item);
            });
            return true;
        } catch (error) {
            console.error(`❌ Erro ao atualizar em ${storeName}:`, error);
            throw error;
        }
    }

    /**
     * Remove um item
     */
    async delete(storeName, id) {
        try {
            await this.executeTransaction(storeName, 'readwrite', (store) => {
                store.delete(id);
            });
            return true;
        } catch (error) {
            console.error(`❌ Erro ao deletar em ${storeName}:`, error);
            throw error;
        }
    }

    /**
     * Busca um item por ID
     */
    async get(storeName, id) {
        try {
            return await this.executeTransaction(storeName, 'readonly', (store) => {
                const request = store.get(id);
                request.onsuccess = () => resolve(request.result);
            });
        } catch (error) {
            console.error(`❌ Erro ao buscar em ${storeName}:`, error);
            throw error;
        }
    }

    /**
     * Lista todos os itens
     */
    async getAll(storeName) {
        try {
            return await this.executeTransaction(storeName, 'readonly', (store) => {
                const request = store.getAll();
                request.onsuccess = () => resolve(request.result);
            });
        } catch (error) {
            console.error(`❌ Erro ao listar ${storeName}:`, error);
            throw error;
        }
    }

    /**
     * Busca por índice
     */
    async getByIndex(storeName, indexName, value) {
        try {
            return await this.executeTransaction(storeName, 'readonly', (store) => {
                const index = store.index(indexName);
                const request = index.getAll(value);
                request.onsuccess = () => resolve(request.result);
            });
        } catch (error) {
            console.error(`❌ Erro ao buscar por índice em ${storeName}:`, error);
            throw error;
        }
    }

    /**
     * Limpa uma store
     */
    async clear(storeName) {
        try {
            await this.executeTransaction(storeName, 'readwrite', (store) => {
                store.clear();
            });
            return true;
        } catch (error) {
            console.error(`❌ Erro ao limpar ${storeName}:`, error);
            throw error;
        }
    }

    /**
     * Adiciona item à fila de sincronização
     */
    async addToSyncQueue(type, data, operation = 'create') {
        try {
            const syncItem = {
                type,
                data,
                operation,
                status: 'pending',
                created_at: new Date().toISOString(),
                retry_count: 0
            };
            
            await this.add('sync_queue', syncItem);
            console.log(`✅ Item adicionado à fila de sincronização: ${type}`);
            return true;
        } catch (error) {
            console.error('❌ Erro ao adicionar à fila de sincronização:', error);
            throw error;
        }
    }

    /**
     * Obtém itens pendentes de sincronização
     */
    async getPendingSyncItems() {
        try {
            return await this.getByIndex('sync_queue', 'status', 'pending');
        } catch (error) {
            console.error('❌ Erro ao buscar itens pendentes:', error);
            return [];
        }
    }

    /**
     * Marca item como sincronizado
     */
    async markAsSynced(id) {
        try {
            const item = await this.get('sync_queue', id);
            if (item) {
                item.status = 'synced';
                item.synced_at = new Date().toISOString();
                await this.update('sync_queue', item);
            }
            return true;
        } catch (error) {
            console.error('❌ Erro ao marcar como sincronizado:', error);
            throw error;
        }
    }

    /**
     * Marca item como falha na sincronização
     */
    async markAsSyncFailed(id, error) {
        try {
            const item = await this.get('sync_queue', id);
            if (item) {
                item.status = 'failed';
                item.error = error;
                item.retry_count = (item.retry_count || 0) + 1;
                item.last_retry = new Date().toISOString();
                await this.update('sync_queue', item);
            }
            return true;
        } catch (error) {
            console.error('❌ Erro ao marcar como falha:', error);
            throw error;
        }
    }

    /**
     * Verifica se está online
     */
    isOnline() {
        return navigator.onLine;
    }

    /**
     * Sincroniza dados pendentes
     */
    async syncPendingData() {
        try {
            if (!this.isOnline()) {
                console.log('⚠️ Offline - Sincronização adiada');
                return 0;
            }
            
            const pendingItems = await this.getPendingSyncItems();
            if (pendingItems.length === 0) {
                console.log('✅ Nenhum item pendente para sincronizar');
                return 0;
            }
            
            console.log(`🔄 Sincronizando ${pendingItems.length} itens...`);
            let syncedCount = 0;
            
            for (const item of pendingItems) {
                try {
                    // Implementar lógica de sincronização específica
                    await this.markAsSynced(item.id);
                    syncedCount++;
                } catch (error) {
                    await this.markAsSyncFailed(item.id, error.message);
                }
            }
            
            console.log(`✅ ${syncedCount} itens sincronizados com sucesso`);
            return syncedCount;
            
        } catch (error) {
            console.error('❌ Erro na sincronização:', error);
            return 0;
        }
    }
}

// Sistema de Banco de Dados Offline com IndexedDB
class OfflineDatabase {
    constructor() {
        this.dbName = 'SistemaVendasDB';
        this.dbVersion = 1;
        this.db = null;
        this.syncQueue = [];
        this.isOnline = navigator.onLine;
        this.syncInProgress = false;
        this.isInitialized = false; // Adicionado para controlar a inicialização
        this.initAttempts = 0; // Adicionado para controlar tentativas de inicialização
        
        this.init();
        this.setupOnlineOfflineListeners();
    }

    async init() {
        try {
            console.log('🔄 Iniciando banco de dados offline...');
            
            // Verificar se IndexedDB está disponível
            if (!window.indexedDB) {
                console.warn('⚠️ IndexedDB não está disponível neste navegador');
                this.isInitialized = false;
                return;
            }
            
            // Verificar se já tentamos inicializar muitas vezes
            if (this.initAttempts > 3) {
                console.warn('⚠️ Muitas tentativas de inicialização, desistindo...');
                this.isInitialized = false;
                return;
            }
            
            this.initAttempts++;
            
            try {
                this.db = await this.openDatabase();
                
                // Verificar se o banco foi aberto corretamente
                if (!this.db) {
                    throw new Error('Falha ao abrir banco de dados');
                }
                
                // Carregar fila de sincronização
                await this.loadSyncQueue();
                
                console.log('✅ Banco de dados offline inicializado com sucesso');
                this.isInitialized = true;
                this.initAttempts = 0; // Reset contador de tentativas
                
            } catch (dbError) {
                console.warn('⚠️ Erro ao abrir banco, tentando limpar e recriar...');
                
                // Tentar limpar e recriar o banco se houver erro de versão
                if ((dbError.name === 'VersionError' || dbError.name === 'InvalidStateError' || dbError.message.includes('version change transaction')) && this.initAttempts <= 2) {
                    try {
                        await this.clearDatabase();
                        
                        // Aguardar um pouco antes de tentar novamente
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        
                        console.log('🔄 Tentando inicializar novamente...');
                        await this.init(); // Tentar novamente
                        return; // Sair se sucesso
                    } catch (retryError) {
                        console.error('❌ Falha ao recriar banco:', retryError);
                    }
                }
                
                throw dbError; // Re-throw para ser capturado pelo catch externo
            }
            
        } catch (error) {
            console.error('❌ Erro ao inicializar banco offline:', error);
            
            // Se chegou aqui, falhou mesmo após tentativa de recuperação
            this.isInitialized = false;
            
            // Notificar que o banco offline não está disponível
            if (window.eventManager) {
                window.eventManager.dispatchUpdate('database', 'offline-unavailable', {
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        }
    }

    openDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => {
                console.error('❌ Erro ao abrir banco IndexedDB:', request.error);
                reject(request.error);
            };
            
            request.onsuccess = () => {
                console.log('✅ Banco IndexedDB aberto com sucesso');
                resolve(request.result);
            };
            
            request.onupgradeneeded = (event) => {
                console.log('🔄 Atualizando banco IndexedDB para versão:', this.dbVersion);
                const db = event.target.result;
                try {
                    this.createObjectStores(db);
                    console.log('✅ Object stores criados/atualizados com sucesso');
                } catch (error) {
                    console.error('❌ Erro ao criar object stores:', error);
                    reject(error);
                }
            };
            
            request.onblocked = () => {
                console.warn('⚠️ Banco IndexedDB bloqueado - feche outras abas');
            };
        });
    }

    createObjectStores(db = this.db) {
        if (!db) {
            console.error('❌ Database não disponível para criar object stores');
            return;
        }
        
        try {
            // Store para clientes
            if (!db.objectStoreNames.contains('clientes')) {
                const clientesStore = db.createObjectStore('clientes', { keyPath: 'id', autoIncrement: true });
                clientesStore.createIndex('documento', 'documento', { unique: true });
                clientesStore.createIndex('sync_status', 'sync_status', { unique: false });
                console.log('✅ Store clientes criada');
            }

            // Store para produtos
            if (!db.objectStoreNames.contains('produtos')) {
                const produtosStore = db.createObjectStore('produtos', { keyPath: 'id', autoIncrement: true });
                produtosStore.createIndex('nome', 'nome', { unique: false });
                produtosStore.createIndex('sync_status', 'sync_status', { unique: false });
                console.log('✅ Store produtos criada');
            }

            // Store para vendas
            if (!db.objectStoreNames.contains('vendas')) {
                const vendasStore = db.createObjectStore('vendas', { keyPath: 'id', autoIncrement: true });
                vendasStore.createIndex('cliente_id', 'cliente_id', { unique: false });
                vendasStore.createIndex('sync_status', 'sync_status', { unique: false });
                vendasStore.createIndex('created_at', 'created_at', { unique: false });
                console.log('✅ Store vendas criada');
            }

            // Store para itens de venda
            if (!db.objectStoreNames.contains('itens_venda')) {
                const itensStore = db.createObjectStore('itens_venda', { keyPath: 'id', autoIncrement: true });
                itensStore.createIndex('venda_id', 'venda_id', { unique: false });
                itensStore.createIndex('produto_id', 'produto_id', { unique: false });
                itensStore.createIndex('sync_status', 'sync_status', { unique: false });
                console.log('✅ Store itens_venda criada');
            }

            // Store para pagamentos
            if (!db.objectStoreNames.contains('pagamentos')) {
                const pagamentosStore = db.createObjectStore('pagamentos', { keyPath: 'id', autoIncrement: true });
                pagamentosStore.createIndex('venda_id', 'venda_id', { unique: false });
                pagamentosStore.createIndex('sync_status', 'sync_status', { unique: false });
                console.log('✅ Store pagamentos criada');
            }

            // Store para orçamentos
            if (!db.objectStoreNames.contains('orcamentos')) {
                const orcamentosStore = db.createObjectStore('orcamentos', { keyPath: 'id', autoIncrement: true });
                orcamentosStore.createIndex('cliente_id', 'cliente_id', { unique: false });
                orcamentosStore.createIndex('sync_status', 'sync_status', { unique: false });
                console.log('✅ Store orcamentos criada');
            }

            // Store para itens de orçamento
            if (!db.objectStoreNames.contains('orcamento_itens')) {
                const itensStore = db.createObjectStore('orcamento_itens', { keyPath: 'id', autoIncrement: true });
                itensStore.createIndex('orcamento_id', 'orcamento_id', { unique: false });
                itensStore.createIndex('produto_id', 'produto_id', { unique: false });
                itensStore.createIndex('sync_status', 'sync_status', { unique: false });
                console.log('✅ Store orcamento_itens criada');
            }

            // Store para fila de sincronização
            if (!db.objectStoreNames.contains('sync_queue')) {
                const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
                syncStore.createIndex('timestamp', 'timestamp', { unique: false });
                syncStore.createIndex('status', 'status', { unique: false });
                syncStore.createIndex('entity_type', 'entity_type', { unique: false });
                console.log('✅ Store sync_queue criada');
            }

            // Store para configurações
            if (!db.objectStoreNames.contains('configuracoes')) {
                const configStore = db.createObjectStore('configuracoes', { keyPath: 'key' });
                console.log('✅ Store configuracoes criada');
            }
            
            console.log('✅ Todos os object stores foram criados/verificados com sucesso');
            
        } catch (error) {
            console.error('❌ Erro ao criar object stores:', error);
            throw error;
        }
    }

    setupOnlineOfflineListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('🌐 Conexão restaurada - Iniciando sincronização...');
            this.syncOfflineData();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('📴 Conexão perdida - Modo offline ativado');
            this.showOfflineNotification();
        });
    }

    showOfflineNotification() {
        if (window.UI) {
            window.UI.showWarning('Modo Offline Ativado', 'Você pode continuar trabalhando. Os dados serão sincronizados quando a conexão for restaurada.');
        }
    }

    // Métodos CRUD genéricos
    async add(storeName, data) {
        try {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            
            // Marcar como não sincronizado se for uma operação offline
            if (!this.isOnline) {
                data.sync_status = false;
                data.offline_id = Date.now(); // ID temporário para operações offline
            }
            
            const result = await store.add(data);
            
            // Adicionar à fila de sincronização se offline
            if (!this.isOnline) {
                await this.addToSyncQueue('CREATE', storeName, data);
            }
            
            return result;
        } catch (error) {
            console.error(`❌ Erro ao adicionar em ${storeName}:`, error);
            throw error;
        }
    }

    async update(storeName, data) {
        try {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            
            if (!this.isOnline) {
                data.sync_status = false;
            }
            
            const result = await store.put(data);
            
            if (!this.isOnline) {
                await this.addToSyncQueue('UPDATE', storeName, data);
            }
            
            return result;
        } catch (error) {
            console.error(`❌ Erro ao atualizar em ${storeName}:`, error);
            throw error;
        }
    }

    async delete(storeName, id) {
        try {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            
            if (!this.isOnline) {
                await this.addToSyncQueue('DELETE', storeName, { id });
            }
            
            return await store.delete(id);
        } catch (error) {
            console.error(`❌ Erro ao deletar de ${storeName}:`, error);
            throw error;
        }
    }

    async get(storeName, id) {
        try {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            return await store.get(id);
        } catch (error) {
            console.error(`❌ Erro ao buscar em ${storeName}:`, error);
            throw error;
        }
    }

    async getAll(storeName, indexName = null, indexValue = null) {
        try {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            
            if (indexName && indexValue !== null) {
                const index = store.index(indexName);
                return await index.getAll(indexValue);
            }
            
            return await store.getAll();
        } catch (error) {
            console.error(`❌ Erro ao buscar todos de ${storeName}:`, error);
            throw error;
        }
    }
    
    /**
     * Métodos específicos para relatórios
     */
    async getAllVendas() {
        try {
            console.log('📊 Buscando todas as vendas...');
            const vendas = await this.getAll('vendas');
            console.log('✅ Vendas encontradas:', vendas.length);
            return vendas;
        } catch (error) {
            console.error('❌ Erro ao buscar vendas:', error);
            return [];
        }
    }
    
    async getAllOrcamentos() {
        try {
            console.log('📊 Buscando todos os orçamentos...');
            const orcamentos = await this.getAll('orcamentos');
            console.log('✅ Orçamentos encontrados:', orcamentos.length);
            return orcamentos;
        } catch (error) {
            console.error('❌ Erro ao buscar orçamentos:', error);
            return [];
        }
    }
    
    async getAllClientes() {
        try {
            console.log('📊 Buscando todos os clientes...');
            const clientes = await this.getAll('clientes');
            console.log('✅ Clientes encontrados:', clientes.length);
            return clientes;
        } catch (error) {
            console.error('❌ Erro ao buscar clientes:', error);
            return [];
        }
    }
    
    async getAllProdutos() {
        try {
            console.log('📊 Buscando todos os produtos...');
            const produtos = await this.getAll('produtos');
            console.log('✅ Produtos encontrados:', produtos.length);
            return produtos;
        } catch (error) {
            console.error('❌ Erro ao buscar produtos:', error);
            return [];
        }
    }

    // Fila de sincronização
    async addToSyncQueue(action, entityType, data) {
        try {
            const syncItem = {
                action,
                entity_type: entityType,
                data: JSON.stringify(data),
                timestamp: Date.now(),
                status: 'pending',
                retry_count: 0
            };

            const transaction = this.db.transaction(['sync_queue'], 'readwrite');
            const store = transaction.objectStore('sync_queue');
            await store.add(syncItem);
            
            console.log(`📝 Adicionado à fila de sincronização: ${action} ${entityType}`);
        } catch (error) {
            console.error('❌ Erro ao adicionar à fila de sincronização:', error);
        }
    }

    async loadSyncQueue() {
        try {
            this.syncQueue = await this.getAll('sync_queue');
            console.log(`📋 Fila de sincronização carregada: ${this.syncQueue.length} itens pendentes`);
        } catch (error) {
            console.error('❌ Erro ao carregar fila de sincronização:', error);
        }
    }

    async syncOfflineData() {
        if (this.syncInProgress || !this.isOnline) {
            return;
        }

        this.syncInProgress = true;
        console.log('🔄 Iniciando sincronização de dados offline...');

        try {
            const pendingItems = await this.getAll('sync_queue', 'status', 'pending');
            
            if (pendingItems.length === 0) {
                console.log('✅ Nenhum item pendente para sincronizar');
                this.syncInProgress = false;
                return;
            }

            console.log(`🔄 Sincronizando ${pendingItems.length} itens...`);

            for (const item of pendingItems) {
                try {
                    await this.processSyncItem(item);
                    await this.markSyncItemComplete(item.id);
                } catch (error) {
                    console.error(`❌ Erro ao sincronizar item ${item.id}:`, error);
                    await this.markSyncItemFailed(item.id, error.message);
                }
            }

            console.log('✅ Sincronização concluída!');
            
            // Notificar outras páginas sobre a sincronização
            this.notifySyncComplete();
            
        } catch (error) {
            console.error('❌ Erro durante sincronização:', error);
        } finally {
            this.syncInProgress = false;
        }
    }

    async processSyncItem(item) {
        const data = JSON.parse(item.data);
        
        switch (item.action) {
            case 'CREATE':
                await this.syncCreate(item.entity_type, data);
                break;
            case 'UPDATE':
                await this.syncUpdate(item.entity_type, data);
                break;
            case 'DELETE':
                await this.syncDelete(item.entity_type, data);
                break;
            default:
                console.warn(`⚠️ Ação de sincronização não reconhecida: ${item.action}`);
        }
    }

    async syncCreate(entityType, data) {
        // Implementar sincronização específica para cada entidade
        const apiEndpoint = `/api/${entityType}`;
        
        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log(`✅ ${entityType} criado no servidor:`, result);
            
            // Atualizar ID local com o ID do servidor
            if (result.data && result.data.id) {
                await this.updateLocalId(entityType, data.offline_id, result.data.id);
            }
            
        } catch (error) {
            throw new Error(`Erro ao sincronizar criação de ${entityType}: ${error.message}`);
        }
    }

    async syncUpdate(entityType, data) {
        const apiEndpoint = `/api/${entityType}/${data.id}`;
        
        try {
            const response = await fetch(apiEndpoint, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            console.log(`✅ ${entityType} atualizado no servidor:`, data.id);
            
        } catch (error) {
            throw new Error(`Erro ao sincronizar atualização de ${entityType}: ${error.message}`);
        }
    }

    async syncDelete(entityType, data) {
        const apiEndpoint = `/api/${entityType}/${data.id}`;
        
        try {
            const response = await fetch(apiEndpoint, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            console.log(`✅ ${entityType} deletado no servidor:`, data.id);
            
        } catch (error) {
            throw new Error(`Erro ao sincronizar exclusão de ${entityType}: ${error.message}`);
        }
    }

    async updateLocalId(entityType, offlineId, serverId) {
        try {
            const transaction = this.db.transaction([entityType], 'readwrite');
            const store = transaction.objectStore(entityType);
            
            // Buscar item pelo ID offline
            const items = await store.getAll();
            const item = items.find(i => i.offline_id === offlineId);
            
            if (item) {
                item.id = serverId;
                delete item.offline_id;
                item.sync_status = true;
                await store.put(item);
                console.log(`🔄 ID local atualizado: ${offlineId} → ${serverId}`);
            }
        } catch (error) {
            console.error('❌ Erro ao atualizar ID local:', error);
        }
    }

    async markSyncItemComplete(id) {
        try {
            const transaction = this.db.transaction(['sync_queue'], 'readwrite');
            const store = transaction.objectStore('sync_queue');
            const item = await store.get(id);
            
            if (item) {
                item.status = 'completed';
                item.completed_at = Date.now();
                await store.put(item);
            }
        } catch (error) {
            console.error('❌ Erro ao marcar item como completo:', error);
        }
    }

    async markSyncItemFailed(id, errorMessage) {
        try {
            const transaction = this.db.transaction(['sync_queue'], 'readwrite');
            const store = transaction.objectStore('sync_queue');
            const item = await store.get(id);
            
            if (item) {
                item.status = 'failed';
                item.error_message = errorMessage;
                item.retry_count = (item.retry_count || 0) + 1;
                item.failed_at = Date.now();
                await store.put(item);
            }
        } catch (error) {
            console.error('❌ Erro ao marcar item como falhou:', error);
        }
    }

    notifySyncComplete() {
        if (window.eventManager) {
            window.eventManager.dispatchUpdate('sync', 'complete', {
                timestamp: Date.now(),
                message: 'Sincronização offline concluída'
            });
        }
    }

    // Métodos específicos para cada entidade
    async getClientes() {
        return await this.getAll('clientes');
    }

    async getProdutos() {
        return await this.getAll('produtos');
    }

    async getVendas() {
        return await this.getAll('vendas');
    }

    async getPagamentos() {
        return await this.getAll('pagamentos');
    }

    async getOrcamentos() {
        return await this.getAll('orcamentos');
    }

    // Status de sincronização
    async getSyncStatus() {
        try {
            const pending = await this.getAll('sync_queue', 'status', 'pending');
            const failed = await this.getAll('sync_queue', 'status', 'failed');
            const completed = await this.getAll('sync_queue', 'status', 'completed');
            
            return {
                pending: pending.length,
                failed: failed.length,
                completed: completed.length,
                total: pending.length + failed.length + completed.length,
                isOnline: this.isOnline,
                syncInProgress: this.syncInProgress
            };
        } catch (error) {
            console.error('❌ Erro ao obter status de sincronização:', error);
            return { pending: 0, failed: 0, completed: 0, total: 0, isOnline: false, syncInProgress: false };
        }
    }

    // Limpar dados antigos
    async cleanupOldData() {
        try {
            const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
            
            // Limpar itens de sincronização antigos
            const transaction = this.db.transaction(['sync_queue'], 'readwrite');
            const store = transaction.objectStore('sync_queue');
            const items = await store.getAll();
            
            for (const item of items) {
                if (item.completed_at && item.completed_at < thirtyDaysAgo) {
                    await store.delete(item.id);
                }
            }
            
            console.log('🧹 Limpeza de dados antigos concluída');
        } catch (error) {
            console.error('❌ Erro na limpeza de dados:', error);
        }
    }

    // Método para limpar o banco de dados completo
    async clearDatabase() {
        return new Promise((resolve, reject) => {
            try {
                console.log('🗑️ Iniciando limpeza do banco de dados corrompido...');
                
                // Fechar conexão atual se existir
                if (this.db) {
                    this.db.close();
                    this.db = null;
                }
                
                const request = indexedDB.deleteDatabase(this.dbName);
                
                request.onsuccess = () => {
                    console.log('✅ Banco de dados corrompido limpo com sucesso.');
                    this.isInitialized = false;
                    resolve();
                };
                
                request.onerror = (event) => {
                    console.error('❌ Erro ao limpar banco de dados corrompido:', event.target.error);
                    reject(event.target.error);
                };
                
                request.onblocked = () => {
                    console.warn('⚠️ Banco bloqueado - feche outras abas e tente novamente');
                    reject(new Error('Banco bloqueado por outras abas'));
                };
                
            } catch (error) {
                console.error('❌ Erro ao tentar limpar banco de dados corrompido:', error);
                reject(error);
            }
        });
    }
}

// Criar instância global
window.offlineDB = new OfflineDatabase();

// Exportar para uso global
window.OfflineDatabase = OfflineDatabase;