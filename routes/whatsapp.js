/**
 * Rotas para Sistema de WhatsApp
 * API para envio de mensagens, notificações e comunicação via WhatsApp
 */

const express = require('express');
const router = express.Router();
const WhatsAppService = require('../utils/whatsapp-service');
const { body, validationResult } = require('express-validator');

// Instanciar serviço de WhatsApp
const whatsappService = new WhatsAppService();

/**
 * GET /api/whatsapp/status
 * Verifica status do serviço de WhatsApp
 */
router.get('/status', async (req, res) => {
    try {
        const status = whatsappService.getStatus();
        const connection = await whatsappService.testConnection();
        
        res.json({
            success: true,
            data: {
                ...status,
                connection
            }
        });
    } catch (error) {
        console.error('❌ Erro ao verificar status do WhatsApp:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

/**
 * POST /api/whatsapp/send-text
 * Envia mensagem de texto simples
 */
router.post('/send-text', [
    body('to').notEmpty().withMessage('Número de telefone é obrigatório'),
    body('message').notEmpty().withMessage('Mensagem é obrigatória')
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
        
        const { to, message } = req.body;
        
        // Enviar mensagem
        const result = await whatsappService.sendTextMessage({
            to,
            message
        });
        
        res.json({
            success: true,
            data: result,
            message: 'Mensagem enviada com sucesso'
        });
        
    } catch (error) {
        console.error('❌ Erro ao enviar mensagem WhatsApp:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Erro interno do servidor'
        });
    }
});

/**
 * POST /api/whatsapp/sale-notification
 * Envia notificação de nova venda
 */
router.post('/sale-notification', [
    body('to').notEmpty().withMessage('Número de telefone é obrigatório'),
    body('saleData').isObject().withMessage('Dados da venda são obrigatórios'),
    body('clientName').notEmpty().withMessage('Nome do cliente é obrigatório')
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
        
        const { to, saleData, clientName } = req.body;
        
        // Enviar notificação de venda
        const result = await whatsappService.sendSaleNotification({
            to,
            saleData,
            clientName
        });
        
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
 * POST /api/whatsapp/quote-notification
 * Envia notificação de orçamento
 */
router.post('/quote-notification', [
    body('to').notEmpty().withMessage('Número de telefone é obrigatório'),
    body('quoteData').isObject().withMessage('Dados do orçamento são obrigatórios'),
    body('clientName').notEmpty().withMessage('Nome do cliente é obrigatório')
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
        
        const { to, quoteData, clientName } = req.body;
        
        // Enviar notificação de orçamento
        const result = await whatsappService.sendQuoteNotification({
            to,
            quoteData,
            clientName
        });
        
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
 * POST /api/whatsapp/payment-reminder
 * Envia lembrete de pagamento
 */
router.post('/payment-reminder', [
    body('to').notEmpty().withMessage('Número de telefone é obrigatório'),
    body('paymentData').isObject().withMessage('Dados do pagamento são obrigatórios'),
    body('clientName').notEmpty().withMessage('Nome do cliente é obrigatório'),
    body('dueDate').notEmpty().withMessage('Data de vencimento é obrigatória')
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
        
        const { to, paymentData, clientName, dueDate } = req.body;
        
        // Enviar lembrete de pagamento
        const result = await whatsappService.sendPaymentReminder({
            to,
            paymentData,
            clientName,
            dueDate
        });
        
        res.json({
            success: true,
            data: result,
            message: 'Lembrete de pagamento enviado com sucesso'
        });
        
    } catch (error) {
        console.error('❌ Erro ao enviar lembrete de pagamento:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Erro interno do servidor'
        });
    }
});

/**
 * POST /api/whatsapp/payment-confirmation
 * Envia confirmação de pagamento
 */
router.post('/payment-confirmation', [
    body('to').notEmpty().withMessage('Número de telefone é obrigatório'),
    body('paymentData').isObject().withMessage('Dados do pagamento são obrigatórios'),
    body('clientName').notEmpty().withMessage('Nome do cliente é obrigatório')
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
        
        const { to, paymentData, clientName } = req.body;
        
        // Enviar confirmação de pagamento
        const result = await whatsappService.sendPaymentConfirmation({
            to,
            paymentData,
            clientName
        });
        
        res.json({
            success: true,
            data: result,
            message: 'Confirmação de pagamento enviada com sucesso'
        });
        
    } catch (error) {
        console.error('❌ Erro ao enviar confirmação de pagamento:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Erro interno do servidor'
        });
    }
});

/**
 * POST /api/whatsapp/send-custom
 * Envia mensagem personalizada
 */
router.post('/send-custom', [
    body('to').notEmpty().withMessage('Número de telefone é obrigatório'),
    body('message').notEmpty().withMessage('Mensagem é obrigatória')
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
        
        const { to, message, template } = req.body;
        
        // Enviar mensagem personalizada
        const result = await whatsappService.sendCustomMessage({
            to,
            message,
            template
        });
        
        res.json({
            success: true,
            data: result,
            message: 'Mensagem personalizada enviada com sucesso'
        });
        
    } catch (error) {
        console.error('❌ Erro ao enviar mensagem personalizada:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Erro interno do servidor'
        });
    }
});

/**
 * POST /api/whatsapp/send-bulk
 * Envia mensagem em lote
 */
router.post('/send-bulk', [
    body('numbers').isArray({ min: 1 }).withMessage('Lista de números é obrigatória'),
    body('message').notEmpty().withMessage('Mensagem é obrigatória')
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
        
        const { numbers, message, delay } = req.body;
        
        // Validar números
        if (numbers.length > 50) {
            return res.status(400).json({
                success: false,
                error: 'Máximo de 50 números por envio em lote'
            });
        }
        
        // Enviar mensagem em lote
        const result = await whatsappService.sendBulkMessage({
            numbers,
            message,
            delay: delay || 1000
        });
        
        res.json({
            success: true,
            data: result,
            message: 'Mensagens em lote enviadas com sucesso'
        });
        
    } catch (error) {
        console.error('❌ Erro ao enviar mensagens em lote:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Erro interno do servidor'
        });
    }
});

/**
 * POST /api/whatsapp/test
 * Testa envio de mensagem
 */
router.post('/test', [
    body('to').notEmpty().withMessage('Número de telefone é obrigatório')
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
        
        const { to } = req.body;
        
        // Enviar mensagem de teste
        const result = await whatsappService.sendTextMessage({
            to,
            message: `🧪 Teste do Sistema de WhatsApp

✅ Esta é uma mensagem de teste do Sistema de Vendas.

📱 Se você recebeu esta mensagem, o sistema está funcionando perfeitamente!

📅 Data: ${new Date().toLocaleString('pt-BR')}

🎉 Sistema de WhatsApp ativo e funcionando!`
        });
        
        res.json({
            success: true,
            data: result,
            message: 'Mensagem de teste enviada com sucesso'
        });
        
    } catch (error) {
        console.error('❌ Erro ao enviar mensagem de teste:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Erro interno do servidor'
        });
    }
});

module.exports = router; 