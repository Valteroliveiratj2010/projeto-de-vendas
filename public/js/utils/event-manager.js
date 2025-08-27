/**
 * 🚀 GERENCIADOR DE EVENTOS GLOBAIS
 * Sistema de comunicação entre páginas para atualização automática
 */

class EventManager {
    constructor() {
        this.listeners = new Map();
        this.init();
    }
    
    init() {
        console.log('🚀 Event Manager inicializado!');
        this.setupGlobalListeners();
    }
    
    /**
     * 🔄 DISPARA EVENTO DE ATUALIZAÇÃO
     * Notifica outras páginas sobre mudanças
     */
    dispatchUpdate(type, action = 'update', data = {}) {
        console.log(`🔄 Disparando evento de atualização: ${type} - ${action}`);
        
        const updateEvent = new CustomEvent('dashboard-update', {
            detail: {
                type,
                action,
                timestamp: new Date().toISOString(),
                data
            }
        });
        
        // Disparar globalmente
        window.dispatchEvent(updateEvent);
        document.dispatchEvent(updateEvent);
        
        // Também disparar no localStorage para persistência
        this.persistUpdate(type, action, data);
        
        console.log('✅ Evento disparado com sucesso!');
    }
    
    /**
     * 📡 ESCUTA EVENTOS DE ATUALIZAÇÃO
     * Configura listeners para mudanças
     */
    listenForUpdates(callback, types = ['*']) {
        const listener = (event) => {
            const { type, action, data } = event.detail;
            
            // Verificar se deve processar este tipo de evento
            if (types.includes('*') || types.includes(type)) {
                console.log(`🔄 Evento recebido: ${type} - ${action}`);
                callback(event.detail);
            }
        };
        
        // Adicionar listener
        window.addEventListener('dashboard-update', listener);
        document.addEventListener('dashboard-update', listener);
        
        // Armazenar referência para remoção posterior
        const listenerId = Date.now() + Math.random();
        this.listeners.set(listenerId, { listener, types });
        
        return listenerId;
    }
    
    /**
     * 🚫 PARA DE ESCUTAR EVENTOS
     * Remove listener específico
     */
    stopListening(listenerId) {
        const listenerData = this.listeners.get(listenerId);
        if (listenerData) {
            window.removeEventListener('dashboard-update', listenerData.listener);
            document.removeEventListener('dashboard-update', listenerData.listener);
            this.listeners.delete(listenerId);
            console.log('🚫 Listener removido:', listenerId);
        }
    }
    
    /**
     * 💾 PERSISTE ATUALIZAÇÕES NO LOCALSTORAGE
     * Para sincronização entre abas
     */
    persistUpdate(type, action, data) {
        try {
            const updates = JSON.parse(localStorage.getItem('dashboard-updates') || '[]');
            updates.push({
                type,
                action,
                timestamp: new Date().toISOString(),
                data
            });
            
            // Manter apenas as últimas 50 atualizações
            if (updates.length > 50) {
                updates.splice(0, updates.length - 50);
            }
            
            localStorage.setItem('dashboard-updates', JSON.stringify(updates));
        } catch (error) {
            console.error('❌ Erro ao persistir atualização:', error);
        }
    }
    
    /**
     * 🔍 VERIFICA ATUALIZAÇÕES PENDENTES
     * Para sincronização ao carregar página
     */
    checkPendingUpdates() {
        try {
            const updates = JSON.parse(localStorage.getItem('dashboard-updates') || '[]');
            const now = new Date();
            const recentUpdates = updates.filter(update => {
                const updateTime = new Date(update.timestamp);
                const diffMinutes = (now - updateTime) / (1000 * 60);
                return diffMinutes < 5; // Últimos 5 minutos
            });
            
            if (recentUpdates.length > 0) {
                console.log(`🔄 ${recentUpdates.length} atualizações pendentes encontradas`);
                return recentUpdates;
            }
        } catch (error) {
            console.error('❌ Erro ao verificar atualizações pendentes:', error);
        }
        
        return [];
    }
    
    /**
     * 🧹 LIMPA ATUALIZAÇÕES ANTIGAS
     * Remove atualizações com mais de 1 hora
     */
    cleanupOldUpdates() {
        try {
            const updates = JSON.parse(localStorage.getItem('dashboard-updates') || '[]');
            const now = new Date();
            const recentUpdates = updates.filter(update => {
                const updateTime = new Date(update.timestamp);
                const diffHours = (now - updateTime) / (1000 * 60 * 60);
                return diffHours < 1; // Última hora
            });
            
            localStorage.setItem('dashboard-updates', JSON.stringify(recentUpdates));
        } catch (error) {
            console.error('❌ Erro ao limpar atualizações antigas:', error);
        }
    }
    
    /**
     * 🔧 CONFIGURA LISTENERS GLOBAIS
     * Para sincronização entre abas
     */
    setupGlobalListeners() {
        // Listener para mudanças no localStorage (outras abas)
        window.addEventListener('storage', (event) => {
            if (event.key === 'dashboard-updates') {
                console.log('🔄 Atualização detectada em outra aba');
                try {
                    const updates = JSON.parse(event.newValue || '[]');
                    if (updates.length > 0) {
                        const lastUpdate = updates[updates.length - 1];
                        this.dispatchUpdate(lastUpdate.type, lastUpdate.action, lastUpdate.data);
                    }
                } catch (error) {
                    console.error('❌ Erro ao processar atualização de outra aba:', error);
                }
            }
        });
        
        // Limpar atualizações antigas a cada 10 minutos
        setInterval(() => {
            this.cleanupOldUpdates();
        }, 10 * 60 * 1000);
        
        console.log('✅ Listeners globais configurados!');
    }
}

// Criar instância global
window.eventManager = new EventManager();

// Exportar para uso global
window.EventManager = EventManager; 