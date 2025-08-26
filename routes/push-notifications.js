/**
 * Rotas para Sistema de Notificações Push
 * API para gerenciar assinaturas e enviar notificações push
 */

const express = require('express');
const router = express.Router();
const PushNotificationService = require('../utils/push-service');
const { body, validationResult } = require('express-validator');

// Instanciar serviço de notificações push
const pushService = new PushNotificationService();

/**
 * GET /api/push/status
 * Verifica status do serviço de notificações push
 */
router.get('/status', async (req, res) => {
    try {
        const status = pushService.getStatus();
        const testResult = await pushService.testService();
        
        res.json({
            success: true,
            data: {
                ...status,
                test: testResult
            }
        });
    } catch (error) {
        console.error('❌ Erro ao verificar status das notificações push:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

/**
 * GET /api/push/public-key
 * Obtém chave pública VAPID para o frontend
 */
router.get('/public-key', (req, res) => {
    try {
        const publicKey = pushService.getPublicKey();
        
        if (!publicKey) {
            return res.status(500).json({
                success: false,
                error: 'Chave pública VAPID não disponível'
            });
        }
        
        res.json({
            success: true,
            data: {
                publicKey
            }
        });
        
    } catch (error) {
        console.error('❌ Erro ao obter chave pública VAPID:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

/**
 * POST /api/push/subscribe
 * Adiciona nova assinatura para notificações push
 */
router.post('/subscribe', [
    body('subscription').isObject().withMessage('Objeto de assinatura é obrigatório'),
    body('subscription.endpoint').notEmpty().withMessage('Endpoint é obrigatório'),
    body('subscription.keys').isObject().withMessage('Chaves são obrigatórias')
], async (req, res) => {
    try {
        // Validar dados
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        
        const { subscription } = req.body;
        
        // Adicionar assinatura
        const result = await pushService.addSubscription(subscription);
        
        res.json({
            success: true,
            data: result,
            message: 'Assinatura adicionada com sucesso'
        });
        
    } catch (error) {
        console.error('❌ Erro ao adicionar assinatura:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Erro interno do servidor'
        });
    }
});

/**
 * DELETE /api/push/unsubscribe/:id
 * Remove assinatura de notificações push
 */
router.delete('/unsubscribe/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Remover assinatura
        const result = await pushService.removeSubscription(id);
        
        if (result.success) {
            res.json({
                success: true,
                message: 'Assinatura removida com sucesso'
            });
        } else {
            res.status(404).json({
                success: false,
                error: result.error || 'Assinatura não encontrada'
            });
        }
        
    } catch (error) {
        console.error('❌ Erro ao remover assinatura:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Erro interno do servidor'
        });
    }
});

/**
 * POST /api/push/send
 * Envia notificação para uma assinatura específica
 */
router.post('/send', [
    body('subscriptionId').notEmpty().withMessage('ID da assinatura é obrigatório'),
    body('notification').isObject().withMessage('Notificação é obrigatória'),
    body('notification.title').notEmpty().withMessage('Título é obrigatório'),
    body('notification.body').notEmpty().withMessage('Corpo da mensagem é obrigatório')
], async (req, res) => {
    try {
        // Validar dados
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        
        const { subscriptionId, notification } = req.body;
        
        // Enviar notificação
        const result = await pushService.sendNotification(subscriptionId, notification);
        
        res.json({
            success: true,
            data: result,
            message: 'Notificação enviada com sucesso'
        });
        
    } catch (error) {
        console.error('❌ Erro ao enviar notificação:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Erro interno do servidor'
        });
    }
});

/**
 * POST /api/push/send-all
 * Envia notificação para todas as assinaturas ativas
 */
router.post('/send-all', [
    body('notification').isObject().withMessage('Notificação é obrigatória'),
    body('notification.title').notEmpty().withMessage('Título é obrigatório'),
    body('notification.body').notEmpty().withMessage('Corpo da mensagem é obrigatório')
], async (req, res) => {
    try {
        // Validar dados
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        
        const { notification } = req.body;
        
        // Enviar notificação para todos
        const result = await pushService.sendNotificationToAll(notification);
        
        res.json({
            success: true,
            data: result,
            message: 'Notificação enviada para todas as assinaturas'
        });
        
    } catch (error) {
        console.error('❌ Erro ao enviar notificação para todos:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Erro interno do servidor'
        });
    }
});

/**
 * POST /api/push/sale-notification
 * Envia notificação de nova venda
 */
router.post('/sale-notification', [
    body('saleData').isObject().withMessage('Dados da venda são obrigatórios'),
    body('saleData.total').notEmpty().withMessage('Total da venda é obrigatório'),
    body('saleData.clientName').notEmpty().withMessage('Nome do cliente é obrigatório')
], async (req, res) => {
    try {
        // Validar dados
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        
        const { saleData } = req.body;
        
        // Enviar notificação de venda
        const result = await pushService.sendSaleNotification(saleData);
        
        res.json({
            success: true,
            data: result,
            message: 'Notificação de venda enviada com sucesso'
        });
        
    } catch (error) {
        console.error('❌ Erro ao enviar notificação de venda:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Erro interno do servidor'
        });
    }
});

/**
 * POST /api/push/quote-notification
 * Envia notificação de novo orçamento
 */
router.post('/quote-notification', [
    body('quoteData').isObject().withMessage('Dados do orçamento são obrigatórios'),
    body('quoteData.total').notEmpty().withMessage('Total do orçamento é obrigatório'),
    body('quoteData.clientName').notEmpty().withMessage('Nome do cliente é obrigatório')
], async (req, res) => {
    try {
        // Validar dados
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        
        const { quoteData } = req.body;
        
        // Enviar notificação de orçamento
        const result = await pushService.sendQuoteNotification(quoteData);
        
        res.json({
            success: true,
            data: result,
            message: 'Notificação de orçamento enviada com sucesso'
        });
        
    } catch (error) {
        console.error('❌ Erro ao enviar notificação de orçamento:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Erro interno do servidor'
        });
    }
});

/**
 * POST /api/push/payment-notification
 * Envia notificação de pagamento
 */
router.post('/payment-notification', [
    body('paymentData').isObject().withMessage('Dados do pagamento são obrigatórios'),
    body('paymentData.total').notEmpty().withMessage('Total do pagamento é obrigatório')
], async (req, res) => {
    try {
        // Validar dados
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        
        const { paymentData } = req.body;
        
        // Enviar notificação de pagamento
        const result = await pushService.sendPaymentNotification(paymentData);
        
        res.json({
            success: true,
            data: result,
            message: 'Notificação de pagamento enviada com sucesso'
        });
        
    } catch (error) {
        console.error('❌ Erro ao enviar notificação de pagamento:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Erro interno do servidor'
        });
    }
});

/**
 * GET /api/push/subscriptions
 * Lista todas as assinaturas (apenas para administradores)
 */
router.get('/subscriptions', async (req, res) => {
    try {
        const stats = pushService.getSubscriptionStats();
        
        res.json({
            success: true,
            data: {
                stats,
                message: 'Estatísticas das assinaturas'
            }
        });
        
    } catch (error) {
        console.error('❌ Erro ao obter estatísticas das assinaturas:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

/**
 * POST /api/push/test
 * Testa envio de notificação
 */
router.post('/test', [
    body('subscriptionId').optional().isString(),
    body('title').optional().isString(),
    body('body').optional().isString()
], async (req, res) => {
    try {
        const { subscriptionId, title, body } = req.body;
        
        const notification = {
            title: title || '🧪 Teste de Notificação Push',
            body: body || 'Esta é uma notificação de teste do Sistema de Vendas!',
            icon: '/images/icon-192x192.png',
            badge: '/images/badge-72x72.png',
            data: {
                type: 'test',
                timestamp: new Date().toISOString(),
                url: '/'
            },
            actions: [
                {
                    action: 'view',
                    title: 'Ver Sistema',
                    icon: '/images/view-icon.png'
                },
                {
                    action: 'dismiss',
                    title: 'Fechar'
                }
            ],
            requireInteraction: true,
            tag: 'test-notification'
        };
        
        let result;
        if (subscriptionId) {
            result = await pushService.sendNotification(subscriptionId, notification);
        } else {
            result = await pushService.sendNotificationToAll(notification);
        }
        
        res.json({
            success: true,
            data: result,
            message: 'Notificação de teste enviada com sucesso'
        });
        
    } catch (error) {
        console.error('❌ Erro ao enviar notificação de teste:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Erro interno do servidor'
        });
    }
});

module.exports = router; 