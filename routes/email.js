/**
 * Rotas para Sistema de Email
 * API para envio de emails, relatórios e notificações
 */

const express = require('express');
const router = express.Router();
const EmailService = require('../utils/email-service');
const { body, validationResult } = require('express-validator');

// Instanciar serviço de email
const emailService = new EmailService();

/**
 * GET /api/email/status
 * Verifica status do serviço de email
 */
router.get('/status', async (req, res) => {
    try {
        const status = emailService.getStatus();
        const connection = await emailService.testConnection();
        
        res.json({
            success: true,
            data: {
                ...status,
                connection
            }
        });
    } catch (error) {
        console.error('❌ Erro ao verificar status do email:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

/**
 * POST /api/email/test
 * Testa envio de email
 */
router.post('/test', [
    body('to').isEmail().withMessage('Email de destino inválido'),
    body('subject').notEmpty().withMessage('Assunto é obrigatório')
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
        
        const { to, subject, message } = req.body;
        
        // Enviar email de teste
        const result = await emailService.sendEmail({
            to,
            subject: subject || 'Teste do Sistema de Email',
            html: `
                <h1>🧪 Teste do Sistema de Email</h1>
                <p>Este é um email de teste do Sistema de Vendas.</p>
                <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
                <p><strong>Mensagem:</strong> ${message || 'Teste automático'}</p>
                <hr>
                <p>Se você recebeu este email, o sistema está funcionando perfeitamente! 🎉</p>
            `
        });
        
        res.json({
            success: true,
            data: result,
            message: 'Email de teste enviado com sucesso'
        });
        
    } catch (error) {
        console.error('❌ Erro ao enviar email de teste:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Erro interno do servidor'
        });
    }
});

/**
 * POST /api/email/report
 * Envia relatório por email
 */
router.post('/report', [
    body('to').isEmail().withMessage('Email de destino inválido'),
    body('reportType').notEmpty().withMessage('Tipo de relatório é obrigatório')
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
        
        const { to, reportType, reportData, pdfPath, subject, message } = req.body;
        
        // Enviar relatório por email
        const result = await emailService.sendReportEmail({
            to,
            reportType,
            reportData,
            pdfPath,
            subject,
            message
        });
        
        res.json({
            success: true,
            data: result,
            message: `Relatório de ${reportType} enviado com sucesso`
        });
        
    } catch (error) {
        console.error('❌ Erro ao enviar relatório por email:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Erro interno do servidor'
        });
    }
});

/**
 * POST /api/email/sale-notification
 * Envia notificação de nova venda
 */
router.post('/sale-notification', [
    body('to').isEmail().withMessage('Email de destino inválido'),
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
        const result = await emailService.sendSaleNotification({
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
 * POST /api/email/quote
 * Envia orçamento por email
 */
router.post('/quote', [
    body('to').isEmail().withMessage('Email de destino inválido'),
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
        
        const { to, quoteData, clientName, pdfPath } = req.body;
        
        // Enviar orçamento por email
        const result = await emailService.sendQuoteEmail({
            to,
            quoteData,
            clientName,
            pdfPath
        });
        
        res.json({
            success: true,
            data: result,
            message: 'Orçamento enviado com sucesso'
        });
        
    } catch (error) {
        console.error('❌ Erro ao enviar orçamento por email:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Erro interno do servidor'
        });
    }
});

/**
 * POST /api/email/custom
 * Envia email personalizado
 */
router.post('/custom', [
    body('to').isEmail().withMessage('Email de destino inválido'),
    body('subject').notEmpty().withMessage('Assunto é obrigatório'),
    body('html').notEmpty().withMessage('Conteúdo HTML é obrigatório')
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
        
        const { to, subject, html, text, attachments } = req.body;
        
        // Enviar email personalizado
        const result = await emailService.sendEmail({
            to,
            subject,
            html,
            text,
            attachments
        });
        
        res.json({
            success: true,
            data: result,
            message: 'Email personalizado enviado com sucesso'
        });
        
    } catch (error) {
        console.error('❌ Erro ao enviar email personalizado:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Erro interno do servidor'
        });
    }
});

module.exports = router; 