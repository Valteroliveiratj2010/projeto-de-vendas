/**
 * Sistema de Email - Serviço Completo
 * Usa Nodemailer para envio de emails com templates e anexos
 */

const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

class EmailService {
    constructor() {
        this.transporter = null;
        this.isConfigured = false;
        this.templates = {};
        
        this.init();
    }
    
    /**
     * Inicializa o serviço de email
     */
    async init() {
        try {
            console.log('📧 Inicializando serviço de email...');
            
            // Verificar configurações
            if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
                console.warn('⚠️ Configurações de email não encontradas. Sistema funcionará sem email.');
                return;
            }
            
            // Criar transporter
            this.transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT || 587,
                secure: process.env.EMAIL_PORT === '465', // true para 465, false para outras portas
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                },
                tls: {
                    rejectUnauthorized: false // Para desenvolvimento
                }
            });
            
            // Verificar conexão
            await this.transporter.verify();
            this.isConfigured = true;
            
            console.log('✅ Serviço de email configurado com sucesso!');
            console.log(`📧 Host: ${process.env.EMAIL_HOST}:${process.env.EMAIL_PORT}`);
            console.log(`👤 Usuário: ${process.env.EMAIL_USER}`);
            
        } catch (error) {
            console.error('❌ Erro ao configurar serviço de email:', error.message);
            this.isConfigured = false;
        }
    }
    
    /**
     * Envia email básico
     */
    async sendEmail(options) {
        if (!this.isConfigured) {
            throw new Error('Serviço de email não configurado');
        }
        
        try {
            const mailOptions = {
                from: `"Sistema de Vendas" <${process.env.EMAIL_USER}>`,
                to: options.to,
                subject: options.subject,
                html: options.html,
                text: options.text || this.htmlToText(options.html)
            };
            
            // Adicionar anexos se existirem
            if (options.attachments && options.attachments.length > 0) {
                mailOptions.attachments = options.attachments;
            }
            
            const result = await this.transporter.sendMail(mailOptions);
            console.log('✅ Email enviado com sucesso:', result.messageId);
            
            return {
                success: true,
                messageId: result.messageId,
                message: 'Email enviado com sucesso'
            };
            
        } catch (error) {
            console.error('❌ Erro ao enviar email:', error.message);
            throw error;
        }
    }
    
    /**
     * Envia relatório por email
     */
    async sendReportEmail(options) {
        try {
            const { to, reportType, reportData, pdfPath, subject, message } = options;
            
            // Template do email
            const html = this.getReportEmailTemplate({
                reportType,
                reportData,
                message: message || `Segue o relatório de ${reportType} solicitado.`
            });
            
            // Configurar anexo se PDF existir
            const attachments = [];
            if (pdfPath && await this.fileExists(pdfPath)) {
                attachments.push({
                    filename: `${reportType}_${new Date().toISOString().split('T')[0]}.pdf`,
                    path: pdfPath,
                    contentType: 'application/pdf'
                });
            }
            
            return await this.sendEmail({
                to,
                subject: subject || `Relatório de ${reportType} - Sistema de Vendas`,
                html,
                attachments
            });
            
        } catch (error) {
            console.error('❌ Erro ao enviar relatório por email:', error.message);
            throw error;
        }
    }
    
    /**
     * Envia notificação de nova venda
     */
    async sendSaleNotification(options) {
        try {
            const { to, saleData, clientName } = options;
            
            const html = this.getSaleNotificationTemplate({
                saleData,
                clientName
            });
            
            return await this.sendEmail({
                to,
                subject: `Nova Venda Realizada - ${clientName}`,
                html
            });
            
        } catch (error) {
            console.error('❌ Erro ao enviar notificação de venda:', error.message);
            throw error;
        }
    }
    
    /**
     * Envia orçamento por email
     */
    async sendQuoteEmail(options) {
        try {
            const { to, quoteData, clientName, pdfPath } = options;
            
            const html = this.getQuoteEmailTemplate({
                quoteData,
                clientName
            });
            
            const attachments = [];
            if (pdfPath && await this.fileExists(pdfPath)) {
                attachments.push({
                    filename: `Orcamento_${clientName}_${new Date().toISOString().split('T')[0]}.pdf`,
                    path: pdfPath,
                    contentType: 'application/pdf'
                });
            }
            
            return await this.sendEmail({
                to,
                subject: `Orçamento - ${clientName}`,
                html,
                attachments
            });
            
        } catch (error) {
            console.error('❌ Erro ao enviar orçamento por email:', error.message);
            throw error;
        }
    }
    
    /**
     * Template para email de relatório
     */
    getReportEmailTemplate(data) {
        return `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Relatório - Sistema de Vendas</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; }
                    .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 12px; }
                    .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>📊 Sistema de Vendas</h1>
                        <p>Relatório Gerado</p>
                    </div>
                    <div class="content">
                        <h2>${data.reportType}</h2>
                        <p>${data.message}</p>
                        
                        ${data.reportData ? `
                        <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
                            <h3>Resumo do Relatório:</h3>
                            <ul>
                                ${Object.entries(data.reportData).map(([key, value]) => 
                                    `<li><strong>${key}:</strong> ${value}</li>`
                                ).join('')}
                            </ul>
                        </div>
                        ` : ''}
                        
                        <p>O relatório completo está anexado a este email em formato PDF.</p>
                        
                        <p><strong>Data de geração:</strong> ${new Date().toLocaleString('pt-BR')}</p>
                    </div>
                    <div class="footer">
                        <p>Este email foi gerado automaticamente pelo Sistema de Vendas</p>
                        <p>Para dúvidas, entre em contato com o suporte</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }
    
    /**
     * Template para notificação de venda
     */
    getSaleNotificationTemplate(data) {
        return `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Nova Venda - Sistema de Vendas</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; }
                    .sale-info { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
                    .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🛒 Nova Venda Realizada!</h1>
                        <p>Sistema de Vendas</p>
                    </div>
                    <div class="content">
                        <h2>Parabéns! Uma nova venda foi realizada.</h2>
                        
                        <div class="sale-info">
                            <h3>Detalhes da Venda:</h3>
                            <p><strong>Cliente:</strong> ${data.clientName}</p>
                            <p><strong>Valor Total:</strong> R$ ${parseFloat(data.saleData.total).toFixed(2)}</p>
                            <p><strong>Status:</strong> ${data.saleData.status}</p>
                            <p><strong>Data:</strong> ${new Date(data.saleData.created_at).toLocaleString('pt-BR')}</p>
                        </div>
                        
                        <p>Esta notificação foi enviada automaticamente para manter você informado sobre as atividades do sistema.</p>
                    </div>
                    <div class="footer">
                        <p>Sistema de Vendas - Notificação Automática</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }
    
    /**
     * Template para email de orçamento
     */
    getQuoteEmailTemplate(data) {
        return `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Orçamento - Sistema de Vendas</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; }
                    .quote-info { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
                    .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>📋 Orçamento</h1>
                        <p>Sistema de Vendas</p>
                    </div>
                    <div class="content">
                        <h2>Olá ${data.clientName}!</h2>
                        
                        <p>Segue o orçamento solicitado. O documento completo está anexado a este email.</p>
                        
                        <div class="quote-info">
                            <h3>Resumo do Orçamento:</h3>
                            <p><strong>Valor Total:</strong> R$ ${parseFloat(data.quoteData.total).toFixed(2)}</p>
                            <p><strong>Validade:</strong> ${new Date(data.quoteData.validade).toLocaleDateString('pt-BR')}</p>
                            <p><strong>Status:</strong> ${data.quoteData.status}</p>
                        </div>
                        
                        <p>Para aceitar este orçamento ou fazer alguma alteração, entre em contato conosco.</p>
                        
                        <p><strong>Data de envio:</strong> ${new Date().toLocaleString('pt-BR')}</p>
                    </div>
                    <div class="footer">
                        <p>Sistema de Vendas - Orçamento</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }
    
    /**
     * Converte HTML para texto simples
     */
    htmlToText(html) {
        return html
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .trim();
    }
    
    /**
     * Verifica se arquivo existe
     */
    async fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }
    
    /**
     * Testa conexão do email
     */
    async testConnection() {
        if (!this.isConfigured) {
            return { success: false, message: 'Serviço não configurado' };
        }
        
        try {
            await this.transporter.verify();
            return { success: true, message: 'Conexão de email funcionando' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
    
    /**
     * Obtém status do serviço
     */
    getStatus() {
        return {
            configured: this.isConfigured,
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            user: process.env.EMAIL_USER
        };
    }
}

module.exports = EmailService; 