/**
 * Rotas para Sistema de Sincronização em Tempo Real
 * API para gerenciar sincronização e status dos clientes
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// Middleware para verificar se o serviço de sincronização está disponível
const checkSyncService = (req, res, next) => {
    if (!req.app.locals.syncService) {
        return res.status(503).json({
            success: false,
            error: 'Serviço de sincronização não disponível'
        });
    }
    next();
};

/**
 * GET /api/sync/status
 * Verifica status do serviço de sincronização
 */
router.get('/status', checkSyncService, (req, res) => {
    try {
        const syncService = req.app.locals.syncService;
        const stats = syncService.getStats();
        const connectedClients = syncService.getConnectedClients();
        
        res.json({
            success: true,
            data: {
                stats,
                connectedClients: connectedClients.length,
                isActive: syncService.isActive
            }
        });
    } catch (error) {
        console.error('❌ Erro ao verificar status da sincronização:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

/**
 * GET /api/sync/clients
 * Lista todos os clientes conectados
 */
router.get('/clients', checkSyncService, (req, res) => {
    try {
        const syncService = req.app.locals.syncService;
        const clients = syncService.getConnectedClients();
        
        // Remover informações sensíveis
        const safeClients = clients.map(client => ({
            id: client.id,
            connectedAt: client.connectedAt,
            lastActivity: client.lastActivity,
            auth: client.auth,
            userId: client.userId,
            syncStatus: client.syncStatus,
            deviceInfo: client.deviceInfo
        }));
        
        res.json({
            success: true,
            data: {
                clients: safeClients,
                total: safeClients.length
            }
        });
    } catch (error) {
        console.error('❌ Erro ao listar clientes:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

/**
 * POST /api/sync/force
 * Força sincronização para todos os clientes
 */
router.post('/force', [
    checkSyncService,
    body('entity').notEmpty().withMessage('Entidade é obrigatória'),
    body('message').optional().isString()
], (req, res) => {
    try {
        // Validar dados
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        
        const { entity, message } = req.body;
        const syncService = req.app.locals.syncService;
        
        // Forçar sincronização
        syncService.forceSyncForAll(entity);
        
        res.json({
            success: true,
            message: `Sincronização forçada para ${entity}`,
            data: {
                entity,
                timestamp: new Date().toISOString(),
                message: message || 'Sincronização forçada pelo servidor'
            }
        });
        
    } catch (error) {
        console.error('❌ Erro ao forçar sincronização:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

/**
 * POST /api/sync/broadcast
 * Envia mensagem para todos os clientes conectados
 */
router.post('/broadcast', [
    checkSyncService,
    body('event').notEmpty().withMessage('Evento é obrigatório'),
    body('data').isObject().withMessage('Dados são obrigatórios'),
    body('target').optional().isIn(['all', 'authenticated']).withMessage('Alvo deve ser "all" ou "authenticated"')
], (req, res) => {
    try {
        // Validar dados
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        
        const { event, data, target = 'all' } = req.body;
        const syncService = req.app.locals.syncService;
        
        // Enviar mensagem
        if (target === 'authenticated') {
            syncService.broadcastToAuthenticated(null, event, {
                ...data,
                timestamp: new Date().toISOString(),
                source: 'server'
            });
        } else {
            syncService.broadcastToAll(null, event, {
                ...data,
                timestamp: new Date().toISOString(),
                source: 'server'
            });
        }
        
        res.json({
            success: true,
            message: `Mensagem enviada para ${target} os clientes`,
            data: {
                event,
                target,
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('❌ Erro ao enviar broadcast:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

/**
 * POST /api/sync/notify-user
 * Envia notificação para clientes de um usuário específico
 */
router.post('/notify-user', [
    checkSyncService,
    body('userId').notEmpty().withMessage('ID do usuário é obrigatório'),
    body('event').notEmpty().withMessage('Evento é obrigatório'),
    body('data').isObject().withMessage('Dados são obrigatórios')
], (req, res) => {
    try {
        // Validar dados
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        
        const { userId, event, data } = req.body;
        const syncService = req.app.locals.syncService;
        
        // Enviar notificação para o usuário
        syncService.notifyUserClients(userId, event, {
            ...data,
            timestamp: new Date().toISOString(),
            source: 'server'
        });
        
        res.json({
            success: true,
            message: `Notificação enviada para usuário ${userId}`,
            data: {
                userId,
                event,
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('❌ Erro ao enviar notificação para usuário:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

/**
 * GET /api/sync/stats
 * Obtém estatísticas detalhadas do serviço
 */
router.get('/stats', checkSyncService, (req, res) => {
    try {
        const syncService = req.app.locals.syncService;
        const stats = syncService.getStats();
        const clients = syncService.getConnectedClients();
        
        // Estatísticas detalhadas
        const detailedStats = {
            ...stats,
            clientBreakdown: {
                authenticated: clients.filter(c => c.auth).length,
                unauthenticated: clients.filter(c => !c.auth).length,
                byStatus: {
                    ready: clients.filter(c => c.syncStatus === 'ready').length,
                    pending: clients.filter(c => c.syncStatus === 'pending').length,
                    error: clients.filter(c => c.syncStatus === 'error').length
                }
            },
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            timestamp: new Date().toISOString()
        };
        
        res.json({
            success: true,
            data: detailedStats
        });
        
    } catch (error) {
        console.error('❌ Erro ao obter estatísticas:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

/**
 * POST /api/sync/restart
 * Reinicia o serviço de sincronização
 */
router.post('/restart', checkSyncService, (req, res) => {
    try {
        const syncService = req.app.locals.syncService;
        
        // Parar serviço atual
        syncService.stop();
        
        // Aguardar um pouco
        setTimeout(() => {
            // Reiniciar serviço
            syncService.init();
        }, 1000);
        
        res.json({
            success: true,
            message: 'Serviço de sincronização reiniciado',
            data: {
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('❌ Erro ao reiniciar serviço:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

/**
 * GET /api/sync/health
 * Verificação de saúde do serviço
 */
router.get('/health', checkSyncService, (req, res) => {
    try {
        const syncService = req.app.locals.syncService;
        
        const health = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            service: {
                active: syncService.isActive,
                uptime: process.uptime(),
                memory: process.memoryUsage()
            },
            connections: {
                total: syncService.connectedClients.size,
                authenticated: Array.from(syncService.connectedClients.values()).filter(c => c.auth).length
            },
            sync: {
                total: syncService.syncStats.totalSyncs,
                success: syncService.syncStats.successfulSyncs,
                failed: syncService.syncStats.failedSyncs,
                lastSync: syncService.syncStats.lastSync
            }
        };
        
        // Determinar status geral
        if (!syncService.isActive) {
            health.status = 'unhealthy';
        } else if (syncService.syncStats.failedSyncs > syncService.syncStats.successfulSyncs) {
            health.status = 'degraded';
        }
        
        res.json({
            success: true,
            data: health
        });
        
    } catch (error) {
        console.error('❌ Erro na verificação de saúde:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

module.exports = router; 