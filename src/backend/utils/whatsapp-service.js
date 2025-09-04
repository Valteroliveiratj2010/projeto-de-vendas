/**
 * Sistema de WhatsApp - Serviço Completo
 * Usa Twilio para envio de mensagens WhatsApp Business
 */

const twilio = require('twilio');

class WhatsAppService {
    constructor() {
        this.client = null;
        this.isConfigured = false;
        this.templates = {};
        
        this.init();
    }
    
    /**
     * Inicializa o serviço de WhatsApp
     */
    async init() {
        try {
            console.log('📱 Inicializando serviço de WhatsApp...');
            
            // Verificar configurações
            if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
                console.warn('⚠️ Configurações do WhatsApp não encontradas. Sistema funcionará sem WhatsApp.');
                return;
            }
            
            // Criar cliente Twilio
            this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
            this.isConfigured = true;
            
            console.log('✅ Serviço de WhatsApp configurado com sucesso!');
            console.log(`📱 Número: ${process.env.TWILIO_PHONE_NUMBER}`);
            console.log(`🔑 Account SID: ${process.env.TWILIO_ACCOUNT_SID.substring(0, 8)}...`);
            
        } catch (error) {
            console.error('❌ Erro ao configurar serviço de WhatsApp:', error.message);
            this.isConfigured = false;
        }
    }
    
    /**
     * Envia mensagem de texto simples
     */
    async sendTextMessage(options) {
        if (!this.isConfigured) {
            throw new Error('Serviço de WhatsApp não configurado');
        }
        
        try {
            const { to, message, from = process.env.TWILIO_PHONE_NUMBER } = options;
            
            // Formatar número (remover + se existir e adicionar código do país se necessário)
            const formattedNumber = this.formatPhoneNumber(to);
            
            console.log(`📱 Enviando mensagem para: ${formattedNumber}`);
            
            const result = await this.client.messages.create({
                body: message,
                from: `whatsapp:${from}`,
                to: `whatsapp:${formattedNumber}`
            });
            
            console.log('✅ Mensagem WhatsApp enviada com sucesso:', result.sid);
            
            return {
                success: true,
                messageId: result.sid,
                status: result.status,
                message: 'Mensagem enviada com sucesso'
            };
            
        } catch (error) {
            console.error('❌ Erro ao enviar mensagem WhatsApp:', error.message);
            throw error;
        }
    }
    
    /**
     * Envia notificação de nova venda
     */
    async sendSaleNotification(options) {
        try {
            const { to, saleData, clientName } = options;
            
            const message = this.getSaleNotificationTemplate({
                saleData,
                clientName
            });
            
            return await this.sendTextMessage({
                to,
                message
            });
            
        } catch (error) {
            console.error('❌ Erro ao enviar notificação de venda:', error.message);
            throw error;
        }
    }
    
    /**
     * Envia notificação de orçamento
     */
    async sendQuoteNotification(options) {
        try {
            const { to, quoteData, clientName } = options;
            
            const message = this.getQuoteNotificationTemplate({
                quoteData,
                clientName
            });
            
            return await this.sendTextMessage({
                to,
                message
            });
            
        } catch (error) {
            console.error('❌ Erro ao enviar notificação de orçamento:', error.message);
            throw error;
        }
    }
    
    /**
     * Envia lembrete de pagamento
     */
    async sendPaymentReminder(options) {
        try {
            const { to, paymentData, clientName, dueDate } = options;
            
            const message = this.getPaymentReminderTemplate({
                paymentData,
                clientName,
                dueDate
            });
            
            return await this.sendTextMessage({
                to,
                message
            });
            
        } catch (error) {
            console.error('❌ Erro ao enviar lembrete de pagamento:', error.message);
            throw error;
        }
    }
    
    /**
     * Envia confirmação de pagamento
     */
    async sendPaymentConfirmation(options) {
        try {
            const { to, paymentData, clientName } = options;
            
            const message = this.getPaymentConfirmationTemplate({
                paymentData,
                clientName
            });
            
            return await this.sendTextMessage({
                to,
                message
            });
            
        } catch (error) {
            console.error('❌ Erro ao enviar confirmação de pagamento:', error.message);
            throw error;
        }
    }
    
    /**
     * Envia mensagem personalizada
     */
    async sendCustomMessage(options) {
        try {
            const { to, message, template = 'default' } = options;
            
            let finalMessage = message;
            
            // Aplicar template se especificado
            if (template !== 'default' && this.templates[template]) {
                finalMessage = this.templates[template](message);
            }
            
            return await this.sendTextMessage({
                to,
                message: finalMessage
            });
            
        } catch (error) {
            console.error('❌ Erro ao enviar mensagem personalizada:', error.message);
            throw error;
        }
    }
    
    /**
     * Envia mensagem em lote
     */
    async sendBulkMessage(options) {
        try {
            const { numbers, message, delay = 1000 } = options;
            
            if (!Array.isArray(numbers) || numbers.length === 0) {
                throw new Error('Lista de números inválida');
            }
            
            console.log(`📱 Enviando mensagem em lote para ${numbers.length} números...`);
            
            const results = [];
            
            for (let i = 0; i < numbers.length; i++) {
                try {
                    const result = await this.sendTextMessage({
                        to: numbers[i],
                        message
                    });
                    
                    results.push({
                        number: numbers[i],
                        success: true,
                        result
                    });
                    
                    console.log(`✅ Mensagem ${i + 1}/${numbers.length} enviada para ${numbers[i]}`);
                    
                    // Delay entre mensagens para evitar spam
                    if (i < numbers.length - 1) {
                        await this.delay(delay);
                    }
                    
                } catch (error) {
                    results.push({
                        number: numbers[i],
                        success: false,
                        error: error.message
                    });
                    
                    console.error(`❌ Erro ao enviar para ${numbers[i]}: ${error.message}`);
                }
            }
            
            const successCount = results.filter(r => r.success).length;
            const errorCount = results.length - successCount;
            
            console.log(`📊 Resultado do envio em lote: ${successCount} sucessos, ${errorCount} erros`);
            
            return {
                success: true,
                total: numbers.length,
                successCount,
                errorCount,
                results
            };
            
        } catch (error) {
            console.error('❌ Erro no envio em lote:', error.message);
            throw error;
        }
    }
    
    /**
     * Template para notificação de venda
     */
    getSaleNotificationTemplate(data) {
        return `🛒 *NOVA VENDA REALIZADA!*

🎉 Parabéns! Uma nova venda foi realizada.

📋 *Detalhes da Venda:*
• Cliente: ${data.clientName}
• Valor: R$ ${parseFloat(data.saleData.total).toFixed(2)}
• Status: ${data.saleData.status}
• Data: ${new Date(data.saleData.created_at).toLocaleDateString('pt-BR')}

💰 *Resumo Financeiro:*
• Total: R$ ${parseFloat(data.saleData.total).toFixed(2)}
• Pago: R$ ${parseFloat(data.saleData.pago || 0).toFixed(2)}
• Saldo: R$ ${parseFloat(data.saleData.saldo || 0).toFixed(2)}

📱 Esta notificação foi enviada automaticamente pelo Sistema de Vendas.

_Data: ${new Date().toLocaleString('pt-BR')}_`;
    }
    
    /**
     * Template para notificação de orçamento
     */
    getQuoteNotificationTemplate(data) {
        return `📋 *ORÇAMENTO CRIADO!*

Olá ${data.clientName}! 

📝 Seu orçamento foi criado com sucesso.

💰 *Detalhes do Orçamento:*
• Valor: R$ ${parseFloat(data.quoteData.total).toFixed(2)}
• Status: ${data.quoteData.status}
• Validade: ${new Date(data.quoteData.validade).toLocaleDateString('pt-BR')}

📋 *Próximos Passos:*
1. Analise o orçamento
2. Entre em contato para aceitar ou solicitar alterações
3. Após aceite, faremos o pedido

📱 Para dúvidas, responda esta mensagem ou entre em contato.

_Data: ${new Date().toLocaleString('pt-BR')}_`;
    }
    
    /**
     * Template para lembrete de pagamento
     */
    getPaymentReminderTemplate(data) {
        return `💰 *LEMBRETE DE PAGAMENTO*

Olá ${data.clientName}!

⏰ *Vencimento: ${new Date(data.dueDate).toLocaleDateString('pt-BR')}*

📋 *Detalhes do Pagamento:*
• Valor: R$ ${parseFloat(data.paymentData.total).toFixed(2)}
• Vencimento: ${new Date(data.dueDate).toLocaleDateString('pt-BR')}
• Dias em atraso: ${this.calculateDaysOverdue(data.dueDate)}

⚠️ *Importante:*
• Este pagamento está vencendo ou venceu
• Entre em contato para regularizar a situação
• Evite juros e multas por atraso

📱 Para negociar ou esclarecer dúvidas, responda esta mensagem.

_Data: ${new Date().toLocaleString('pt-BR')}_`;
    }
    
    /**
     * Template para confirmação de pagamento
     */
    getPaymentConfirmationTemplate(data) {
        return `✅ *PAGAMENTO CONFIRMADO!*

Olá ${data.clientName}!

🎉 Seu pagamento foi confirmado com sucesso!

💰 *Detalhes do Pagamento:*
• Valor: R$ ${parseFloat(data.paymentData.total).toFixed(2)}
• Data: ${new Date(data.paymentData.payment_date).toLocaleDateString('pt-BR')}
• Forma: ${data.paymentData.payment_method || 'Não informado'}
• Status: Confirmado

📋 *Resumo:*
• Pagamento processado com sucesso
• Recebemos a confirmação
• Obrigado pela confiança!

📱 Para dúvidas ou próximos pedidos, entre em contato.

_Data: ${new Date().toLocaleString('pt-BR')}_`;
    }
    
    /**
     * Formata número de telefone
     */
    formatPhoneNumber(phone) {
        // Remove caracteres especiais
        let formatted = phone.replace(/[\s\-\(\)\.]/g, '');
        
        // Remove + se existir
        if (formatted.startsWith('+')) {
            formatted = formatted.substring(1);
        }
        
        // Adiciona código do Brasil se não existir
        if (!formatted.startsWith('55') && formatted.length === 11) {
            formatted = '55' + formatted;
        }
        
        // Adiciona código do Brasil se não existir (formato 9 dígitos)
        if (!formatted.startsWith('55') && formatted.length === 10) {
            formatted = '55' + formatted;
        }
        
        return formatted;
    }
    
    /**
     * Calcula dias em atraso
     */
    calculateDaysOverdue(dueDate) {
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = today - due;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    }
    
    /**
     * Delay entre operações
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Testa conexão do WhatsApp
     */
    async testConnection() {
        if (!this.isConfigured) {
            return { success: false, message: 'Serviço não configurado' };
        }
        
        try {
            // Verificar se o cliente está funcionando
            if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
                return { success: false, message: 'Account SID inválido (deve começar com AC)' };
            }
            
            const account = await this.client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
            
            return { 
                success: true, 
                message: 'Conexão WhatsApp funcionando',
                account: {
                    sid: account.sid,
                    name: account.friendlyName,
                    status: account.status
                }
            };
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
            accountSid: process.env.TWILIO_ACCOUNT_SID ? 
                process.env.TWILIO_ACCOUNT_SID.substring(0, 8) + '...' : 'Não configurado',
            phoneNumber: process.env.TWILIO_PHONE_NUMBER || 'Não configurado'
        };
    }
}

module.exports = WhatsAppService; 