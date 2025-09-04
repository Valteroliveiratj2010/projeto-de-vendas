/**
 * Sistema de Notificações Push - Serviço Completo
 * Usa web-push para enviar notificações push para o navegador
 */

const webpush = require('web-push');
const fs = require('fs').promises;
const path = require('path');

class PushNotificationService {
    constructor() {
        this.isConfigured = false;
        this.subscriptions = new Map();
        this.vapidKeys = null;
        this.subscriptionsFile = path.join(__dirname, '..', 'data', 'push-subscriptions.json');
        
        this.init();
    }
    
    /**
     * Inicializa o serviço de notificações push
     */
    async init() {
        try {
            console.log('🔔 Inicializando serviço de notificações push...');
            
            // Criar diretório de dados se não existir
            const dataDir = path.dirname(this.subscriptionsFile);
            try {
                await fs.access(dataDir);
            } catch {
                await fs.mkdir(dataDir, { recursive: true });
            }
            
            // Gerar ou carregar chaves VAPID
            await this.setupVapidKeys();
            
            // Carregar assinaturas salvas
            await this.loadSubscriptions();
            
            this.isConfigured = true;
            console.log('✅ Serviço de notificações push configurado com sucesso!');
            
        } catch (error) {
            console.error('❌ Erro ao configurar serviço de notificações push:', error.message);
            this.isConfigured = false;
        }
    }
    
    /**
     * Configura chaves VAPID
     */
    async setupVapidKeys() {
        try {
            const keysPath = path.join(__dirname, '..', 'data', 'vapid-keys.json');
            
            try {
                // Tentar carregar chaves existentes
                const keysData = await fs.readFile(keysPath, 'utf8');
                this.vapidKeys = JSON.parse(keysData);
                console.log('✅ Chaves VAPID carregadas do arquivo');
            } catch {
                // Gerar novas chaves
                console.log('🔑 Gerando novas chaves VAPID...');
                this.vapidKeys = webpush.generateVAPIDKeys();
                
                // Salvar chaves
                await fs.writeFile(keysPath, JSON.stringify(this.vapidKeys, null, 2));
                console.log('✅ Novas chaves VAPID geradas e salvas');
            }
            
            // Configurar web-push
            webpush.setVapidDetails(
                'mailto:admin@sistema-vendas.com',
                this.vapidKeys.publicKey,
                this.vapidKeys.privateKey
            );
            
        } catch (error) {
            console.error('❌ Erro ao configurar chaves VAPID:', error.message);
            throw error;
        }
    }
    
    /**
     * Carrega assinaturas salvas
     */
    async loadSubscriptions() {
        try {
            const data = await fs.readFile(this.subscriptionsFile, 'utf8');
            const subscriptions = JSON.parse(data);
            
            // Converter array para Map
            this.subscriptions.clear();
            subscriptions.forEach(sub => {
                this.subscriptions.set(sub.id, sub);
            });
            
            console.log(`✅ ${this.subscriptions.size} assinaturas carregadas`);
            
        } catch (error) {
            if (error.code !== 'ENOENT') {
                console.error('❌ Erro ao carregar assinaturas:', error.message);
            } else {
                console.log('📝 Nenhuma assinatura encontrada, criando arquivo novo');
                await this.saveSubscriptions();
            }
        }
    }
    
    /**
     * Salva assinaturas no arquivo
     */
    async saveSubscriptions() {
        try {
            const subscriptionsArray = Array.from(this.subscriptions.values());
            await fs.writeFile(this.subscriptionsFile, JSON.stringify(subscriptionsArray, null, 2));
        } catch (error) {
            console.error('❌ Erro ao salvar assinaturas:', error.message);
        }
    }
    
    /**
     * Adiciona nova assinatura
     */
    async addSubscription(subscription) {
        try {
            const id = this.generateSubscriptionId();
            const newSubscription = {
                id,
                endpoint: subscription.endpoint,
                keys: subscription.keys,
                createdAt: new Date().toISOString(),
                lastUsed: new Date().toISOString(),
                active: true
            };
            
            this.subscriptions.set(id, newSubscription);
            await this.saveSubscriptions();
            
            console.log(`✅ Nova assinatura adicionada: ${id}`);
            return { success: true, id };
            
        } catch (error) {
            console.error('❌ Erro ao adicionar assinatura:', error.message);
            throw error;
        }
    }
    
    /**
     * Remove assinatura
     */
    async removeSubscription(id) {
        try {
            if (this.subscriptions.has(id)) {
                this.subscriptions.delete(id);
                await this.saveSubscriptions();
                console.log(`✅ Assinatura removida: ${id}`);
                return { success: true };
            } else {
                return { success: false, error: 'Assinatura não encontrada' };
            }
        } catch (error) {
            console.error('❌ Erro ao remover assinatura:', error.message);
            throw error;
        }
    }
    
    /**
     * Envia notificação para uma assinatura específica
     */
    async sendNotification(subscriptionId, notification) {
        try {
            const subscription = this.subscriptions.get(subscriptionId);
            if (!subscription) {
                throw new Error('Assinatura não encontrada');
            }
            
            if (!subscription.active) {
                throw new Error('Assinatura inativa');
            }
            
            const payload = JSON.stringify(notification);
            
            const result = await webpush.sendNotification(
                {
                    endpoint: subscription.endpoint,
                    keys: subscription.keys
                },
                payload
            );
            
            // Atualizar último uso
            subscription.lastUsed = new Date().toISOString();
            await this.saveSubscriptions();
            
            console.log(`✅ Notificação enviada para: ${subscriptionId}`);
            return { success: true, result };
            
        } catch (error) {
            console.error(`❌ Erro ao enviar notificação para ${subscriptionId}:`, error.message);
            
            // Se a assinatura for inválida, removê-la
            if (error.statusCode === 410) {
                console.log(`🗑️ Removendo assinatura inválida: ${subscriptionId}`);
                await this.removeSubscription(subscriptionId);
            }
            
            throw error;
        }
    }
    
    /**
     * Envia notificação para todas as assinaturas ativas
     */
    async sendNotificationToAll(notification) {
        try {
            const activeSubscriptions = Array.from(this.subscriptions.values())
                .filter(sub => sub.active);
            
            if (activeSubscriptions.length === 0) {
                console.log('⚠️ Nenhuma assinatura ativa encontrada');
                return { success: true, sent: 0, total: 0 };
            }
            
            console.log(`📤 Enviando notificação para ${activeSubscriptions.length} assinaturas...`);
            
            const results = [];
            let successCount = 0;
            let errorCount = 0;
            
            for (const subscription of activeSubscriptions) {
                try {
                    const result = await this.sendNotification(subscription.id, notification);
                    results.push({ id: subscription.id, success: true, result });
                    successCount++;
                } catch (error) {
                    results.push({ id: subscription.id, success: false, error: error.message });
                    errorCount++;
                }
            }
            
            console.log(`📊 Resultado: ${successCount} sucessos, ${errorCount} erros`);
            
            return {
                success: true,
                sent: successCount,
                total: activeSubscriptions.length,
                results
            };
            
        } catch (error) {
            console.error('❌ Erro no envio em massa:', error.message);
            throw error;
        }
    }
    
    /**
     * Envia notificação de nova venda
     */
    async sendSaleNotification(saleData) {
        const notification = {
            title: '🛒 Nova Venda Realizada!',
            body: `Venda de R$ ${parseFloat(saleData.total).toFixed(2)} para ${saleData.clientName}`,
            icon: '/images/icon-192x192.png',
            badge: '/images/badge-72x72.png',
            data: {
                type: 'sale',
                saleId: saleData.id,
                url: '/vendas'
            },
            actions: [
                {
                    action: 'view',
                    title: 'Ver Venda',
                    icon: '/images/view-icon.png'
                },
                {
                    action: 'dismiss',
                    title: 'Fechar'
                }
            ],
            requireInteraction: true,
            tag: 'sale-notification'
        };
        
        return await this.sendNotificationToAll(notification);
    }
    
    /**
     * Envia notificação de novo orçamento
     */
    async sendQuoteNotification(quoteData) {
        const notification = {
            title: '📋 Novo Orçamento Criado!',
            body: `Orçamento de R$ ${parseFloat(quoteData.total).toFixed(2)} para ${quoteData.clientName}`,
            icon: '/images/icon-192x192.png',
            badge: '/images/badge-72x72.png',
            data: {
                type: 'quote',
                quoteId: quoteData.id,
                url: '/orcamentos'
            },
            actions: [
                {
                    action: 'view',
                    title: 'Ver Orçamento',
                    icon: '/images/view-icon.png'
                },
                {
                    action: 'dismiss',
                    title: 'Fechar'
                }
            ],
            requireInteraction: true,
            tag: 'quote-notification'
        };
        
        return await this.sendNotificationToAll(notification);
    }
    
    /**
     * Envia notificação de pagamento
     */
    async sendPaymentNotification(paymentData) {
        const notification = {
            title: '💰 Pagamento Recebido!',
            body: `Pagamento de R$ ${parseFloat(paymentData.total).toFixed(2)} confirmado`,
            icon: '/images/icon-192x192.png',
            badge: '/images/badge-72x72.png',
            data: {
                type: 'payment',
                paymentId: paymentData.id,
                url: '/pagamentos'
            },
            actions: [
                {
                    action: 'view',
                    title: 'Ver Pagamento',
                    icon: '/images/view-icon.png'
                },
                {
                    action: 'dismiss',
                    title: 'Fechar'
                }
            ],
            requireInteraction: false,
            tag: 'payment-notification'
        };
        
        return await this.sendNotificationToAll(notification);
    }
    
    /**
     * Envia notificação personalizada
     */
    async sendCustomNotification(options) {
        const notification = {
            title: options.title || 'Notificação do Sistema',
            body: options.body || 'Nova mensagem do sistema',
            icon: options.icon || '/images/icon-192x192.png',
            badge: options.badge || '/images/badge-72x72.png',
            data: options.data || {},
            actions: options.actions || [],
            requireInteraction: options.requireInteraction || false,
            tag: options.tag || 'custom-notification'
        };
        
        if (options.subscriptionId) {
            return await this.sendNotification(options.subscriptionId, notification);
        } else {
            return await this.sendNotificationToAll(notification);
        }
    }
    
    /**
     * Gera ID único para assinatura
     */
    generateSubscriptionId() {
        return 'sub_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * Obtém chave pública VAPID
     */
    getPublicKey() {
        return this.vapidKeys ? this.vapidKeys.publicKey : null;
    }
    
    /**
     * Obtém estatísticas das assinaturas
     */
    getSubscriptionStats() {
        const total = this.subscriptions.size;
        const active = Array.from(this.subscriptions.values()).filter(sub => sub.active).length;
        const inactive = total - active;
        
        return {
            total,
            active,
            inactive,
            lastAdded: total > 0 ? 
                new Date(Math.max(...Array.from(this.subscriptions.values()).map(s => new Date(s.createdAt)))) : null
        };
    }
    
    /**
     * Obtém status do serviço
     */
    getStatus() {
        return {
            configured: this.isConfigured,
            hasVapidKeys: !!this.vapidKeys,
            subscriptionsCount: this.subscriptions.size,
            stats: this.getSubscriptionStats()
        };
    }
    
    /**
     * Testa o serviço
     */
    async testService() {
        try {
            if (!this.isConfigured) {
                return { success: false, message: 'Serviço não configurado' };
            }
            
            // Testar se as chaves VAPID estão funcionando
            if (!this.vapidKeys) {
                return { success: false, message: 'Chaves VAPID não configuradas' };
            }
            
            return { 
                success: true, 
                message: 'Serviço de notificações push funcionando',
                publicKey: this.vapidKeys.publicKey.substring(0, 20) + '...'
            };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
}

module.exports = PushNotificationService; 