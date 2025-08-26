/**
 * Sistema de Sincronização em Tempo Real
 * Usa Socket.IO para sincronização entre dispositivos
 */

const EventEmitter = require('events');

class SyncService extends EventEmitter {
    constructor(io) {
        super();
        this.io = io;
        this.connectedClients = new Map();
        this.syncQueue = new Map();
        this.isActive = false;
        this.syncStats = {
            totalSyncs: 0,
            successfulSyncs: 0,
            failedSyncs: 0,
            lastSync: null,
            activeConnections: 0
        };
        
        this.init();
    }
    
    /**
     * Inicializa o serviço de sincronização
     */
    init() {
        try {
            console.log('🔄 Inicializando serviço de sincronização em tempo real...');
            
            if (!this.io) {
                throw new Error('Socket.IO não foi inicializado');
            }
            
            this.setupSocketHandlers();
            this.isActive = true;
            
            console.log('✅ Serviço de sincronização inicializado com sucesso!');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar serviço de sincronização:', error.message);
            this.isActive = false;
        }
    }
    
    /**
     * Configura os handlers de Socket.IO
     */
    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            console.log(`🔌 Cliente conectado: ${socket.id}`);
            
            // Registrar cliente
            this.registerClient(socket);
            
            // Handlers de eventos
            this.setupClientHandlers(socket);
            
            // Desconexão
            socket.on('disconnect', () => {
                this.handleClientDisconnect(socket);
            });
            
            // Erro de conexão
            socket.on('error', (error) => {
                this.handleClientError(socket, error);
            });
        });
    }
    
    /**
     * Configura handlers específicos do cliente
     */
    setupClientHandlers(socket) {
        // Autenticação do cliente
        socket.on('client:auth', (data) => {
            this.handleClientAuth(socket, data);
        });
        
        // Sincronização de dados
        socket.on('sync:request', (data) => {
            this.handleSyncRequest(socket, data);
        });
        
        // Atualização de dados
        socket.on('data:update', (data) => {
            this.handleDataUpdate(socket, data);
        });
        
        // Exclusão de dados
        socket.on('data:delete', (data) => {
            this.handleDataDelete(socket, data);
        });
        
        // Criação de dados
        socket.on('data:create', (data) => {
            this.handleDataCreate(socket, data);
        });
        
        // Ping/Pong para manter conexão
        socket.on('ping', () => {
            socket.emit('pong', { timestamp: Date.now() });
        });
        
        // Status do cliente
        socket.on('client:status', () => {
            this.sendClientStatus(socket);
        });
        
        // Sincronização manual
        socket.on('sync:manual', (data) => {
            this.handleManualSync(socket, data);
        });
    }
    
    /**
     * Registra um novo cliente
     */
    registerClient(socket) {
        const clientInfo = {
            id: socket.id,
            connectedAt: new Date(),
            lastActivity: new Date(),
            auth: false,
            userId: null,
            deviceInfo: null,
            syncStatus: 'pending'
        };
        
        this.connectedClients.set(socket.id, clientInfo);
        this.syncStats.activeConnections = this.connectedClients.size;
        
        // Emitir evento de cliente conectado
        this.emit('client:connected', clientInfo);
        
        // Enviar confirmação para o cliente
        socket.emit('connection:confirmed', {
            clientId: socket.id,
            timestamp: Date.now(),
            message: 'Conectado ao sistema de sincronização'
        });
        
        console.log(`📱 Cliente registrado: ${socket.id} (Total: ${this.connectedClients.size})`);
    }
    
    /**
     * Autentica um cliente
     */
    handleClientAuth(socket, data) {
        try {
            const { userId, deviceInfo, token } = data;
            
            if (!userId || !token) {
                socket.emit('auth:error', { message: 'Dados de autenticação inválidos' });
                return;
            }
            
            // Aqui você pode validar o token JWT se necessário
            // Por enquanto, aceitamos a autenticação
            
            const clientInfo = this.connectedClients.get(socket.id);
            if (clientInfo) {
                clientInfo.auth = true;
                clientInfo.userId = userId;
                clientInfo.deviceInfo = deviceInfo || {};
                clientInfo.syncStatus = 'ready';
                
                // Atualizar cliente
                this.connectedClients.set(socket.id, clientInfo);
                
                // Notificar cliente
                socket.emit('auth:success', {
                    message: 'Autenticado com sucesso',
                    userId: userId,
                    syncStatus: 'ready'
                });
                
                // Notificar outros clientes do mesmo usuário
                this.notifyUserClients(userId, 'client:user:connected', {
                    userId: userId,
                    deviceId: socket.id,
                    deviceInfo: deviceInfo
                });
                
                console.log(`✅ Cliente autenticado: ${socket.id} (Usuário: ${userId})`);
            }
            
        } catch (error) {
            console.error('❌ Erro na autenticação:', error.message);
            socket.emit('auth:error', { message: 'Erro interno na autenticação' });
        }
    }
    
    /**
     * Processa solicitação de sincronização
     */
    async handleSyncRequest(socket, data) {
        try {
            const { entity, lastSync, clientId } = data;
            const clientInfo = this.connectedClients.get(socket.id);
            
            if (!clientInfo || !clientInfo.auth) {
                socket.emit('sync:error', { message: 'Cliente não autenticado' });
                return;
            }
            
            console.log(`🔄 Sincronização solicitada: ${entity} (Cliente: ${clientId})`);
            
            // Simular busca de dados (aqui você integraria com seu banco)
            const syncData = await this.getSyncData(entity, lastSync, clientInfo.userId);
            
            // Enviar dados para sincronização
            socket.emit('sync:response', {
                entity: entity,
                data: syncData.data,
                timestamp: new Date().toISOString(),
                lastSync: syncData.lastSync,
                totalRecords: syncData.totalRecords
            });
            
            // Atualizar estatísticas
            this.syncStats.totalSyncs++;
            this.syncStats.successfulSyncs++;
            this.syncStats.lastSync = new Date();
            
            console.log(`✅ Sincronização concluída: ${entity} (${syncData.totalRecords} registros)`);
            
        } catch (error) {
            console.error('❌ Erro na sincronização:', error.message);
            
            this.syncStats.failedSyncs++;
            
            socket.emit('sync:error', {
                message: 'Erro na sincronização',
                error: error.message
            });
        }
    }
    
    /**
     * Processa atualização de dados
     */
    async handleDataUpdate(socket, data) {
        try {
            const { entity, recordId, changes, timestamp } = data;
            const clientInfo = this.connectedClients.get(socket.id);
            
            if (!clientInfo || !clientInfo.auth) {
                socket.emit('update:error', { message: 'Cliente não autenticado' });
                return;
            }
            
            console.log(`📝 Atualização recebida: ${entity} (ID: ${recordId})`);
            
            // Aqui você salvaria no banco de dados
            // Por enquanto, simulamos o sucesso
            
            // Notificar todos os clientes (exceto o remetente)
            this.broadcastToAll(socket.id, 'data:updated', {
                entity: entity,
                recordId: recordId,
                changes: changes,
                timestamp: timestamp,
                updatedBy: clientInfo.userId,
                deviceId: socket.id
            });
            
            // Confirmar atualização
            socket.emit('update:success', {
                message: 'Dados atualizados com sucesso',
                recordId: recordId,
                timestamp: timestamp
            });
            
            console.log(`✅ Atualização processada: ${entity} (ID: ${recordId})`);
            
        } catch (error) {
            console.error('❌ Erro na atualização:', error.message);
            socket.emit('update:error', { message: 'Erro interno na atualização' });
        }
    }
    
    /**
     * Processa exclusão de dados
     */
    async handleDataDelete(socket, data) {
        try {
            const { entity, recordId, timestamp } = data;
            const clientInfo = this.connectedClients.get(socket.id);
            
            if (!clientInfo || !clientInfo.auth) {
                socket.emit('delete:error', { message: 'Cliente não autenticado' });
                return;
            }
            
            console.log(`🗑️ Exclusão solicitada: ${entity} (ID: ${recordId})`);
            
            // Aqui você excluiria do banco de dados
            // Por enquanto, simulamos o sucesso
            
            // Notificar todos os clientes (exceto o remetente)
            this.broadcastToAll(socket.id, 'data:deleted', {
                entity: entity,
                recordId: recordId,
                timestamp: timestamp,
                deletedBy: clientInfo.userId,
                deviceId: socket.id
            });
            
            // Confirmar exclusão
            socket.emit('delete:success', {
                message: 'Dados excluídos com sucesso',
                recordId: recordId,
                timestamp: timestamp
            });
            
            console.log(`✅ Exclusão processada: ${entity} (ID: ${recordId})`);
            
        } catch (error) {
            console.error('❌ Erro na exclusão:', error.message);
            socket.emit('delete:error', { message: 'Erro interno na exclusão' });
        }
    }
    
    /**
     * Processa criação de dados
     */
    async handleDataCreate(socket, data) {
        try {
            const { entity, record, timestamp } = data;
            const clientInfo = this.connectedClients.get(socket.id);
            
            if (!clientInfo || !clientInfo.auth) {
                socket.emit('create:error', { message: 'Cliente não autenticado' });
                return;
            }
            
            console.log(`➕ Criação solicitada: ${entity}`);
            
            // Aqui você salvaria no banco de dados
            // Por enquanto, simulamos o sucesso e geramos um ID
            const recordId = `new_${Date.now()}`;
            const newRecord = { ...record, id: recordId, created_at: timestamp };
            
            // Notificar todos os clientes (exceto o remetente)
            this.broadcastToAll(socket.id, 'data:created', {
                entity: entity,
                record: newRecord,
                timestamp: timestamp,
                createdBy: clientInfo.userId,
                deviceId: socket.id
            });
            
            // Confirmar criação
            socket.emit('create:success', {
                message: 'Dados criados com sucesso',
                record: newRecord,
                timestamp: timestamp
            });
            
            console.log(`✅ Criação processada: ${entity} (ID: ${recordId})`);
            
        } catch (error) {
            console.error('❌ Erro na criação:', error.message);
            socket.emit('create:error', { message: 'Erro interno na criação' });
        }
    }
    
    /**
     * Processa sincronização manual
     */
    async handleManualSync(socket, data) {
        try {
            const { entities, force } = data;
            const clientInfo = this.connectedClients.get(socket.id);
            
            if (!clientInfo || !clientInfo.auth) {
                socket.emit('sync:manual:error', { message: 'Cliente não autenticado' });
                return;
            }
            
            console.log(`🔄 Sincronização manual solicitada: ${entities.join(', ')}`);
            
            // Processar cada entidade
            const results = [];
            for (const entity of entities) {
                try {
                    const syncData = await this.getSyncData(entity, null, clientInfo.userId, force);
                    results.push({
                        entity: entity,
                        success: true,
                        records: syncData.totalRecords,
                        timestamp: syncData.lastSync
                    });
                } catch (error) {
                    results.push({
                        entity: entity,
                        success: false,
                        error: error.message
                    });
                }
            }
            
            // Enviar resultados
            socket.emit('sync:manual:complete', {
                results: results,
                timestamp: new Date().toISOString()
            });
            
            console.log(`✅ Sincronização manual concluída: ${results.filter(r => r.success).length}/${results.length} sucessos`);
            
        } catch (error) {
            console.error('❌ Erro na sincronização manual:', error.message);
            socket.emit('sync:manual:error', { message: 'Erro interno na sincronização' });
        }
    }
    
    /**
     * Obtém dados para sincronização
     */
    async getSyncData(entity, lastSync, userId, force = false) {
        // Simulação de busca de dados
        // Aqui você integraria com seu banco de dados real
        
        const mockData = {
            vendas: [
                { id: 1, cliente: 'João Silva', total: 150.00, status: 'Pago' },
                { id: 2, cliente: 'Maria Santos', total: 200.00, status: 'Pendente' }
            ],
            clientes: [
                { id: 1, nome: 'João Silva', email: 'joao@email.com' },
                { id: 2, nome: 'Maria Santos', email: 'maria@email.com' }
            ],
            produtos: [
                { id: 1, nome: 'Produto A', preco: 50.00 },
                { id: 2, nome: 'Produto B', preco: 75.00 }
            ]
        };
        
        const data = mockData[entity] || [];
        const lastSyncTime = force ? null : (lastSync || new Date(0).toISOString());
        
        return {
            data: data,
            lastSync: new Date().toISOString(),
            totalRecords: data.length
        };
    }
    
    /**
     * Envia status para um cliente específico
     */
    sendClientStatus(socket) {
        const clientInfo = this.connectedClients.get(socket.id);
        if (clientInfo) {
            socket.emit('client:status:response', {
                clientId: socket.id,
                status: clientInfo.syncStatus,
                connectedAt: clientInfo.connectedAt,
                lastActivity: clientInfo.lastActivity,
                userId: clientInfo.userId
            });
        }
    }
    
    /**
     * Notifica clientes de um usuário específico
     */
    notifyUserClients(userId, event, data) {
        for (const [clientId, clientInfo] of this.connectedClients) {
            if (clientInfo.userId === userId && clientInfo.auth) {
                const socket = this.io.sockets.sockets.get(clientId);
                if (socket) {
                    socket.emit(event, data);
                }
            }
        }
    }
    
    /**
     * Transmite para todos os clientes (exceto o remetente)
     */
    broadcastToAll(excludeClientId, event, data) {
        this.io.emit(event, data);
    }
    
    /**
     * Transmite para clientes autenticados (exceto o remetente)
     */
    broadcastToAuthenticated(excludeClientId, event, data) {
        for (const [clientId, clientInfo] of this.connectedClients) {
            if (clientId !== excludeClientId && clientInfo.auth) {
                const socket = this.io.sockets.sockets.get(clientId);
                if (socket) {
                    socket.emit(event, data);
                }
            }
        }
    }
    
    /**
     * Atualiza atividade do cliente
     */
    updateClientActivity(socketId) {
        const clientInfo = this.connectedClients.get(socketId);
        if (clientInfo) {
            clientInfo.lastActivity = new Date();
            this.connectedClients.set(socketId, clientInfo);
        }
    }
    
    /**
     * Remove cliente desconectado
     */
    handleClientDisconnect(socket) {
        const clientInfo = this.connectedClients.get(socket.id);
        
        if (clientInfo) {
            console.log(`🔌 Cliente desconectado: ${socket.id} (Usuário: ${clientInfo.userId || 'Não autenticado'})`);
            
            // Notificar outros clientes do mesmo usuário
            if (clientInfo.userId) {
                this.notifyUserClients(clientInfo.userId, 'client:user:disconnected', {
                    userId: clientInfo.userId,
                    deviceId: socket.id
                });
            }
            
            // Remover cliente
            this.connectedClients.delete(socket.id);
            this.syncStats.activeConnections = this.connectedClients.size;
            
            // Emitir evento de cliente desconectado
            this.emit('client:disconnected', clientInfo);
        }
    }
    
    /**
     * Trata erro do cliente
     */
    handleClientError(socket, error) {
        console.error(`❌ Erro no cliente ${socket.id}:`, error.message);
        
        const clientInfo = this.connectedClients.get(socket.id);
        if (clientInfo) {
            clientInfo.syncStatus = 'error';
            this.connectedClients.set(socket.id, clientInfo);
        }
    }
    
    /**
     * Obtém estatísticas do serviço
     */
    getStats() {
        return {
            ...this.syncStats,
            connectedClients: this.connectedClients.size,
            isActive: this.isActive
        };
    }
    
    /**
     * Obtém lista de clientes conectados
     */
    getConnectedClients() {
        return Array.from(this.connectedClients.values());
    }
    
    /**
     * Força sincronização para todos os clientes
     */
    forceSyncForAll(entity) {
        console.log(`🔄 Forçando sincronização de ${entity} para todos os clientes...`);
        
        this.io.emit('sync:force', {
            entity: entity,
            timestamp: new Date().toISOString(),
            message: 'Sincronização forçada pelo servidor'
        });
    }
    
    /**
     * Para o serviço
     */
    stop() {
        console.log('🛑 Parando serviço de sincronização...');
        
        this.isActive = false;
        this.connectedClients.clear();
        this.syncStats.activeConnections = 0;
        
        console.log('✅ Serviço de sincronização parado');
    }
}

module.exports = SyncService; 