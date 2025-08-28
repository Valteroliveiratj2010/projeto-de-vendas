// Sistema de Geração de PDF para Sistema de Vendas
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFGenerator {
    constructor() {
        this.doc = null;
        this.fonts = {
            regular: 'Helvetica',
            bold: 'Helvetica-Bold',
            italic: 'Helvetica-Oblique'
        };
    }

    // ===== GERADOR DE PDF DE VENDA =====
    async generateVendaPDF(venda, cliente, itens, pagamentos) {
        try {
            // Validar dados de entrada
            if (!venda || !cliente) {
                throw new Error('Dados insuficientes para gerar PDF');
            }
            
            // Criar novo documento PDF
            this.doc = new PDFDocument({
                size: 'A4',
                margins: {
                    top: 50,
                    bottom: 50,
                    left: 50,
                    right: 50
                },
                autoFirstPage: true
            });

            // Configurar fontes padrão
            this.doc.font(this.fonts.regular);
            this.doc.fontSize(10);

            // Cabeçalho
            this.addHeader('COMPROVANTE DE VENDA');
            
            // Informações da venda
            this.addVendaInfo(venda);
            
            // Informações do cliente
            this.addClienteInfo(cliente);
            
            // Itens da venda
            this.addItensVenda(itens);
            
            // Totais e status
            this.addTotaisVenda(venda);
            
            // Histórico de pagamentos
            if (pagamentos && pagamentos.length > 0) {
                this.addPagamentosInfo(pagamentos);
            }
            
            // Rodapé (com tratamento de erro)
            try {
                this.addFooter();
            } catch (footerError) {
                console.warn('⚠️ Erro no rodapé, continuando sem ele:', footerError);
            }
            
            // Finalizar documento
            this.doc.end();
            
            return this.doc;
            
        } catch (error) {
            console.error('❌ Erro ao gerar PDF de venda:', error);
            // Tentar finalizar o documento se existir
            if (this.doc) {
                try {
                    this.doc.end();
                } catch (finalizeError) {
                    console.error('❌ Erro ao finalizar PDF:', finalizeError);
                }
            }
            throw error;
        }
    }

    // ===== GERADOR DE PDF DE ORÇAMENTO =====
    async generateOrcamentoPDF(orcamento, cliente, itens) {
        try {
            // Validar dados de entrada
            if (!orcamento || !cliente) {
                throw new Error('Dados insuficientes para gerar PDF');
            }
            
            // Criar novo documento PDF
            this.doc = new PDFDocument({
                size: 'A4',
                margins: {
                    top: 50,
                    bottom: 50,
                    left: 50,
                    right: 50
                },
                autoFirstPage: true
            });

            // Configurar fontes padrão
            this.doc.font(this.fonts.regular);
            this.doc.fontSize(10);

            // Cabeçalho
            this.addHeader('ORÇAMENTO COMERCIAL');
            
            // Informações do orçamento
            this.addOrcamentoInfo(orcamento);
            
            // Informações do cliente
            this.addClienteInfo(cliente);
            
            // Itens do orçamento
            this.addItensOrcamento(itens);
            
            // Totais e condições
            this.addTotaisOrcamento(orcamento);
            
            // Rodapé (com tratamento de erro)
            try {
                this.addFooter();
            } catch (footerError) {
                console.warn('⚠️ Erro no rodapé, continuando sem ele:', footerError);
            }
            
            // Finalizar documento
            this.doc.end();
            
            return this.doc;
            
        } catch (error) {
            console.error('❌ Erro ao gerar PDF de orçamento:', error);
            // Tentar finalizar o documento se existir
            if (this.doc) {
                try {
                    this.doc.end();
                } catch (finalizeError) {
                    console.error('❌ Erro ao finalizar PDF:', finalizeError);
                }
            }
            throw error;
        }
    }

    // ===== GERADOR DE PDF DE RELATÓRIO =====
    async generateRelatorioPDF(tipo, dados, filtros = {}) {
        try {
            // Validar dados de entrada
            if (!tipo || !dados) {
                throw new Error('Dados insuficientes para gerar PDF');
            }
            
            // Criar novo documento PDF
            this.doc = new PDFDocument({
                size: 'A4',
                margins: {
                    top: 50,
                    bottom: 50,
                    left: 50,
                    right: 50
                },
                autoFirstPage: true
            });

            // Configurar fontes padrão
            this.doc.font(this.fonts.regular);
            this.doc.fontSize(10);

            // Cabeçalho
            this.addHeader(`RELATÓRIO DE ${tipo.toUpperCase()}`);
            
            // Filtros aplicados
            if (Object.keys(filtros).length > 0) {
                this.addFiltrosInfo(filtros);
            }
            
            // Dados do relatório
            this.addRelatorioData(tipo, dados);
            
            // Resumo e estatísticas
            this.addRelatorioResumo(tipo, dados);
            
            // Rodapé (com tratamento de erro)
            try {
                this.addFooter();
            } catch (footerError) {
                console.warn('⚠️ Erro no rodapé, continuando sem ele:', footerError);
            }
            
            // Finalizar documento
            this.doc.end();
            
            return this.doc;
            
        } catch (error) {
            console.error('❌ Erro ao gerar PDF de relatório:', error);
            // Tentar finalizar o documento se existir
            if (this.doc) {
                try {
                    this.doc.end();
                } catch (finalizeError) {
                    console.error('❌ Erro ao finalizar PDF:', finalizeError);
                }
            }
            throw error;
        }
    }

    // ===== MÉTODOS AUXILIARES =====

    addHeader(titulo) {
        try {
            // Logo/Header da empresa
            this.doc
                .font(this.fonts.bold)
                .fontSize(24)
                .fillColor('#2563eb')
                .text('🛒 SISTEMA DE VENDAS', { align: 'center' });
            
            this.doc.moveDown(0.5);
            
            // Título do documento
            this.doc
                .font(this.fonts.bold)
                .fontSize(18)
                .fillColor('#1f2937')
                .text(titulo, { align: 'center' });
            
            this.doc.moveDown(1);
            
            // Linha separadora
            this.doc
                .moveTo(50, this.doc.y)
                .lineTo(545, this.doc.y)
                .strokeColor('#e5e7eb')
                .lineWidth(2)
                .stroke();
            
            this.doc.moveDown(1);
            
            // Resetar fonte padrão
            this.doc.font(this.fonts.regular).fontSize(10);
            
        } catch (error) {
            console.error('❌ Erro ao adicionar cabeçalho:', error);
            throw error;
        }
    }

    addVendaInfo(venda) {
        try {
            this.doc
                .font(this.fonts.bold)
                .fontSize(14)
                .fillColor('#1f2937')
                .text('INFORMAÇÕES DA VENDA');
            
            this.doc.moveDown(0.5);
            
            const vendaInfo = [
                { label: 'Número da Venda:', value: `#${venda.id.toString().padStart(6, '0')}` },
                { label: 'Data:', value: this.formatDate(venda.created_at) },
                { label: 'Status:', value: this.getStatusText(venda.status) },
                { label: 'Observações:', value: venda.observacoes || 'Nenhuma' }
            ];
            
            this.addInfoTable(vendaInfo);
            this.doc.moveDown(1);
            
            // Resetar fonte padrão
            this.doc.font(this.fonts.regular).fontSize(10);
            
        } catch (error) {
            console.error('❌ Erro ao adicionar informações da venda:', error);
            throw error;
        }
    }

    addOrcamentoInfo(orcamento) {
        try {
            this.doc
                .font(this.fonts.bold)
                .fontSize(14)
                .fillColor('#1f2937')
                .text('INFORMAÇÕES DO ORÇAMENTO');
            
            this.doc.moveDown(0.5);
            
            const orcamentoInfo = [
                { label: 'Número:', value: `#${orcamento.id.toString().padStart(6, '0')}` },
                { label: 'Data:', value: this.formatDate(orcamento.created_at) },
                { label: 'Validade:', value: this.formatDate(orcamento.validade) },
                { label: 'Status:', value: this.getStatusText(orcamento.status) },
                { label: 'Observações:', value: orcamento.observacoes || 'Nenhuma' }
            ];
            
            this.addInfoTable(orcamentoInfo);
            this.doc.moveDown(1);
            
            // Resetar fonte padrão
            this.doc.font(this.fonts.regular).fontSize(10);
            
        } catch (error) {
            console.error('❌ Erro ao adicionar informações do orçamento:', error);
            throw error;
        }
    }

    addClienteInfo(cliente) {
        try {
            this.doc
                .font(this.fonts.bold)
                .fontSize(14)
                .fillColor('#1f2937')
                .text('INFORMAÇÕES DO CLIENTE');
            
            this.doc.moveDown(0.5);
            
            const clienteInfo = [
                { label: 'Nome:', value: cliente.nome || 'Não informado' },
                { label: 'Documento:', value: cliente.documento || 'Não informado' },
                { label: 'Telefone:', value: cliente.telefone || 'Não informado' },
                { label: 'Email:', value: cliente.email || 'Não informado' },
                { label: 'Endereço:', value: cliente.endereco || 'Não informado' }
            ];
            
            this.addInfoTable(clienteInfo);
            this.doc.moveDown(1);
            
            // Resetar fonte padrão
            this.doc.font(this.fonts.regular).fontSize(10);
            
        } catch (error) {
            console.error('❌ Erro ao adicionar informações do cliente:', error);
            throw error;
        }
    }

    addItensVenda(itens) {
        try {
            if (!itens || itens.length === 0) {
                this.doc
                    .font(this.fonts.regular)
                    .fontSize(10)
                    .fillColor('#6b7280')
                    .text('Nenhum item encontrado para esta venda.');
                this.doc.moveDown(1);
                return;
            }
            
            this.doc
                .font(this.fonts.bold)
                .fontSize(14)
                .fillColor('#1f2937')
                .text('ITENS DA VENDA');
            
            this.doc.moveDown(0.5);
            
            // Cabeçalho da tabela
            const tableHeaders = ['Produto', 'Qtd', 'Preço Unit.', 'Subtotal'];
            const columnWidths = [250, 60, 80, 80];
            
            this.doc
                .font(this.fonts.bold)
                .fontSize(10)
                .fillColor('#ffffff')
                .rect(50, this.doc.y, 470, 20)
                .fill();
            
            this.doc
                .fillColor('#1f2937')
                .text(tableHeaders[0], 55, this.doc.y + 5, { width: columnWidths[0] })
                .text(tableHeaders[1], 55 + columnWidths[0], this.doc.y + 5, { width: columnWidths[1] })
                .text(tableHeaders[2], 55 + columnWidths[0] + columnWidths[1], this.doc.y + 5, { width: columnWidths[2] })
                .text(tableHeaders[3], 55 + columnWidths[0] + columnWidths[1] + columnWidths[2], this.doc.y + 5, { width: columnWidths[3] });
            
            this.doc.moveDown(1);
            
            // Itens da tabela
            itens.forEach((item, index) => {
                const y = this.doc.y;
                
                // Linha alternada
                if (index % 2 === 0) {
                    this.doc
                        .fillColor('#f9fafb')
                        .rect(50, y, 470, 20)
                        .fill();
                }
                
                this.doc
                    .fillColor('#1f2937')
                    .font(this.fonts.regular)
                    .fontSize(9)
                    .text(item.produto_nome || 'Produto', 55, y + 5, { width: columnWidths[0] })
                    .text((item.quantidade || 0).toString(), 55 + columnWidths[0], y + 5, { width: columnWidths[1] })
                    .text(this.formatCurrency(item.preco_unit || 0), 55 + columnWidths[0] + columnWidths[1], y + 5, { width: columnWidths[2] })
                    .text(this.formatCurrency(item.subtotal || 0), 55 + columnWidths[0] + columnWidths[1] + columnWidths[2], y + 5, { width: columnWidths[3] });
                
                this.doc.moveDown(1);
            });
            
            this.doc.moveDown(0.5);
            
            // Resetar fonte padrão
            this.doc.font(this.fonts.regular).fontSize(10);
            
        } catch (error) {
            console.error('❌ Erro ao adicionar itens da venda:', error);
            throw error;
        }
    }

    addItensOrcamento(itens) {
        try {
            if (!itens || itens.length === 0) {
                this.doc
                    .font(this.fonts.regular)
                    .fontSize(10)
                    .fillColor('#6b7280')
                    .text('Nenhum item encontrado para este orçamento.');
                this.doc.moveDown(1);
                return;
            }
            
            this.doc
                .font(this.fonts.bold)
                .fontSize(14)
                .fillColor('#1f2937')
                .text('ITENS DO ORÇAMENTO');
            
            this.doc.moveDown(0.5);
            
            // Cabeçalho da tabela
            const tableHeaders = ['Produto', 'Qtd', 'Preço Unit.', 'Subtotal'];
            const columnWidths = [250, 60, 80, 80];
            
            this.doc
                .font(this.fonts.bold)
                .fontSize(10)
                .fillColor('#ffffff')
                .rect(50, this.doc.y, 470, 20)
                .fill();
            
            this.doc
                .fillColor('#1f2937')
                .text(tableHeaders[0], 55, this.doc.y + 5, { width: columnWidths[0] })
                .text(tableHeaders[1], 55 + columnWidths[0], this.doc.y + 5, { width: columnWidths[1] })
                .text(tableHeaders[2], 55 + columnWidths[0] + columnWidths[1], this.doc.y + 5, { width: columnWidths[2] })
                .text(tableHeaders[3], 55 + columnWidths[0] + columnWidths[1] + columnWidths[2], this.doc.y + 5, { width: columnWidths[3] });
            
            this.doc.moveDown(1);
            
            // Itens da tabela
            itens.forEach((item, index) => {
                const y = this.doc.y;
                
                // Linha alternada
                if (index % 2 === 0) {
                    this.doc
                        .fillColor('#f9fafb')
                        .rect(50, y, 470, 20)
                        .fill();
                }
                
                this.doc
                    .fillColor('#1f2937')
                    .font(this.fonts.regular)
                    .fontSize(9)
                    .text(item.produto_nome || 'Produto', 55, y + 5, { width: columnWidths[0] })
                    .text((item.quantidade || 0).toString(), 55 + columnWidths[0], y + 5, { width: columnWidths[1] })
                    .text(this.formatCurrency(item.preco_unit || 0), 55 + columnWidths[0] + columnWidths[1], y + 5, { width: columnWidths[2] })
                    .text(this.formatCurrency(item.subtotal || 0), 55 + columnWidths[0] + columnWidths[1] + columnWidths[2], y + 5, { width: columnWidths[3] });
                
                this.doc.moveDown(1);
            });
            
            this.doc.moveDown(0.5);
            
            // Resetar fonte padrão
            this.doc.font(this.fonts.regular).fontSize(10);
            
        } catch (error) {
            console.error('❌ Erro ao adicionar itens do orçamento:', error);
            throw error;
        }
    }

    addTotaisVenda(venda) {
        try {
            this.doc.moveDown(0.5);
            
            // Linha separadora
            this.doc
                .moveTo(50, this.doc.y)
                .lineTo(545, this.doc.y)
                .strokeColor('#e5e7eb')
                .lineWidth(1)
                .stroke();
            
            this.doc.moveDown(0.5);
            
            // Totais
            const totais = [
                { label: 'Total da Venda:', value: this.formatCurrency(venda.total || 0) },
                { label: 'Valor Pago:', value: this.formatCurrency(venda.pago || 0) },
                { label: 'Saldo Devedor:', value: this.formatCurrency(venda.saldo || 0) }
            ];
            
            this.addTotaisTable(totais);
            this.doc.moveDown(1);
            
            // Resetar fonte padrão
            this.doc.font(this.fonts.regular).fontSize(10);
            
        } catch (error) {
            console.error('❌ Erro ao adicionar totais da venda:', error);
            throw error;
        }
    }

    addTotaisOrcamento(orcamento) {
        try {
            this.doc.moveDown(0.5);
            
            // Linha separadora
            this.doc
                .moveTo(50, this.doc.y)
                .lineTo(545, this.doc.y)
                .strokeColor('#e5e7eb')
                .lineWidth(1)
                .stroke();
            
            this.doc.moveDown(0.5);
            
            // Totais
            const totais = [
                { label: 'Total do Orçamento:', value: this.formatCurrency(orcamento.total || 0) }
            ];
            
            this.addTotaisTable(totais);
            
            // Condições
            this.doc.moveDown(1);
            this.doc
                .font(this.fonts.bold)
                .fontSize(12)
                .fillColor('#1f2937')
                .text('CONDIÇÕES COMERCIAIS');
            
            this.doc.moveDown(0.5);
            this.doc
                .font(this.fonts.regular)
                .fontSize(10)
                .fillColor('#6b7280')
                .text('• Este orçamento é válido por 30 dias a partir da data de emissão');
            this.doc.moveDown(0.3);
            this.doc
                .text('• Formas de pagamento: Dinheiro, PIX, Cartão de Crédito/Débito');
            this.doc.moveDown(0.3);
            this.doc
                .text('• Entrega: Conforme acordado com o cliente');
            
            this.doc.moveDown(1);
            
            // Resetar fonte padrão
            this.doc.font(this.fonts.regular).fontSize(10);
            
        } catch (error) {
            console.error('❌ Erro ao adicionar totais do orçamento:', error);
            throw error;
        }
    }

    addPagamentosInfo(pagamentos) {
        try {
            this.doc
                .font(this.fonts.bold)
                .fontSize(14)
                .fillColor('#1f2937')
                .text('HISTÓRICO DE PAGAMENTOS');
            
            this.doc.moveDown(0.5);
            
            // Cabeçalho da tabela
            const tableHeaders = ['Data', 'Valor', 'Forma', 'Observações'];
            const columnWidths = [100, 80, 100, 190];
            
            this.doc
                .font(this.fonts.bold)
                .fontSize(10)
                .fillColor('#ffffff')
                .rect(50, this.doc.y, 470, 20)
                .fill();
            
            this.doc
                .fillColor('#1f2937')
                .text(tableHeaders[0], 55, this.doc.y + 5, { width: columnWidths[0] })
                .text(tableHeaders[1], 55 + columnWidths[0], this.doc.y + 5, { width: columnWidths[1] })
                .text(tableHeaders[2], 55 + columnWidths[0] + columnWidths[1], this.doc.y + 5, { width: columnWidths[2] })
                .text(tableHeaders[3], 55 + columnWidths[0] + columnWidths[1] + columnWidths[2], this.doc.y + 5, { width: columnWidths[3] });
            
            this.doc.moveDown(1);
            
            // Pagamentos
            pagamentos.forEach((pagamento, index) => {
                const y = this.doc.y;
                
                // Linha alternada
                if (index % 2 === 0) {
                    this.doc
                        .fillColor('#f9fafb')
                        .rect(50, y, 470, 20)
                        .fill();
                }
                
                this.doc
                    .fillColor('#1f2937')
                    .font(this.fonts.regular)
                    .fontSize(9)
                    .text(this.formatDate(pagamento.data_pagto), 55, y + 5, { width: columnWidths[0] })
                    .text(this.formatCurrency(pagamento.valor_pago || 0), 55 + columnWidths[0], y + 5, { width: columnWidths[1] })
                    .text(pagamento.forma_pagamento || 'Dinheiro', 55 + columnWidths[0] + columnWidths[1], y + 5, { width: columnWidths[2] })
                    .text(pagamento.observacoes || '-', 55 + columnWidths[0] + columnWidths[1] + columnWidths[2], y + 5, { width: columnWidths[3] });
                
                this.doc.moveDown(1);
            });
            
            this.doc.moveDown(0.5);
            
            // Resetar fonte padrão
            this.doc.font(this.fonts.regular).fontSize(10);
            
        } catch (error) {
            console.error('❌ Erro ao adicionar informações de pagamentos:', error);
            throw error;
        }
    }

    addFiltrosInfo(filtros) {
        try {
            this.doc
                .font(this.fonts.bold)
                .fontSize(12)
                .fillColor('#1f2937')
                .text('FILTROS APLICADOS');
            
            this.doc.moveDown(0.5);
            
            Object.entries(filtros).forEach(([key, value]) => {
                if (value) {
                    this.doc
                        .font(this.fonts.regular)
                        .fontSize(10)
                        .fillColor('#6b7280')
                        .text(`${this.formatFilterLabel(key)}: ${value}`);
                    this.doc.moveDown(0.3);
                }
            });
            
            this.doc.moveDown(1);
            
            // Resetar fonte padrão
            this.doc.font(this.fonts.regular).fontSize(10);
            
        } catch (error) {
            console.error('❌ Erro ao adicionar filtros:', error);
            throw error;
        }
    }

    addRelatorioData(tipo, dados) {
        try {
            this.doc
                .font(this.fonts.bold)
                .fontSize(14)
                .fillColor('#1f2937')
                .text(`DADOS DO RELATÓRIO - ${tipo.toUpperCase()}`);
            
            this.doc.moveDown(0.5);
            
            switch (tipo.toLowerCase()) {
                case 'vendas':
                    this.addVendasRelatorioData(dados);
                    break;
                case 'clientes':
                    this.addClientesRelatorioData(dados);
                    break;
                case 'produtos':
                    this.addProdutosRelatorioData(dados);
                    break;
                default:
                    this.addGenericRelatorioData(dados);
            }
            
            // Resetar fonte padrão
            this.doc.font(this.fonts.regular).fontSize(10);
            
        } catch (error) {
            console.error('❌ Erro ao adicionar dados do relatório:', error);
            throw error;
        }
    }

    addVendasRelatorioData(vendas) {
        try {
            if (!vendas || vendas.length === 0) {
                this.doc
                    .font(this.fonts.regular)
                    .fontSize(10)
                    .fillColor('#6b7280')
                    .text('Nenhuma venda encontrada para os filtros aplicados.');
                return;
            }
            
            // Cabeçalho da tabela
            const tableHeaders = ['Venda', 'Cliente', 'Data', 'Total', 'Status'];
            const columnWidths = [60, 150, 80, 80, 100];
            
            this.doc
                .font(this.fonts.bold)
                .fontSize(9)
                .fillColor('#ffffff')
                .rect(50, this.doc.y, 470, 20)
                .fill();
            
            this.doc
                .fillColor('#1f2937')
                .text(tableHeaders[0], 55, this.doc.y + 5, { width: columnWidths[0] })
                .text(tableHeaders[1], 55 + columnWidths[0], this.doc.y + 5, { width: columnWidths[1] })
                .text(tableHeaders[2], 55 + columnWidths[0] + columnWidths[1], this.doc.y + 5, { width: columnWidths[2] })
                .text(tableHeaders[3], 55 + columnWidths[0] + columnWidths[1] + columnWidths[2], this.doc.y + 5, { width: columnWidths[3] })
                .text(tableHeaders[4], 55 + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3], this.doc.y + 5, { width: columnWidths[4] });
            
            this.doc.moveDown(1);
            
            // Dados
            vendas.forEach((venda, index) => {
                const y = this.doc.y;
                
                // Linha alternada
                if (index % 2 === 0) {
                    this.doc
                        .fillColor('#f9fafb')
                        .rect(50, y, 470, 20)
                        .fill();
                }
                
                this.doc
                    .fillColor('#1f2937')
                    .font(this.fonts.regular)
                    .fontSize(8)
                    .text(`#${venda.id.toString().padStart(6, '0')}`, 55, y + 5, { width: columnWidths[0] })
                    .text(venda.cliente_nome || 'Cliente', 55 + columnWidths[0], y + 5, { width: columnWidths[1] })
                    .text(this.formatDate(venda.created_at), 55 + columnWidths[0] + columnWidths[1], y + 5, { width: columnWidths[2] })
                    .text(this.formatCurrency(venda.total || 0), 55 + columnWidths[0] + columnWidths[1] + columnWidths[2], y + 5, { width: columnWidths[3] })
                    .text(this.getStatusText(venda.status), 55 + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3], y + 5, { width: columnWidths[4] });
                
                this.doc.moveDown(1);
            });
            
        } catch (error) {
            console.error('❌ Erro ao adicionar dados de vendas:', error);
            throw error;
        }
    }

    addRelatorioResumo(tipo, dados) {
        try {
            this.doc.moveDown(1);
            
            // Linha separadora
            this.doc
                .moveTo(50, this.doc.y)
                .lineTo(545, this.doc.y)
                .strokeColor('#e5e7eb')
                .lineWidth(1)
                .stroke();
            
            this.doc.moveDown(1);
            
            this.doc
                .font(this.fonts.bold)
                .fontSize(14)
                .fillColor('#1f2937')
                .text('RESUMO E ESTATÍSTICAS');
            
            this.doc.moveDown(0.5);
            
            switch (tipo.toLowerCase()) {
                case 'vendas':
                    this.addVendasResumo(dados);
                    break;
                case 'clientes':
                    this.addClientesResumo(dados);
                    break;
                case 'produtos':
                    this.addProdutosResumo(dados);
                    break;
                default:
                    this.addGenericResumo(dados);
            }
            
            // Resetar fonte padrão
            this.doc.font(this.fonts.regular).fontSize(10);
            
        } catch (error) {
            console.error('❌ Erro ao adicionar resumo do relatório:', error);
            throw error;
        }
    }

    addVendasResumo(vendas) {
        try {
            if (!vendas || vendas.length === 0) return;
            
            const totalVendas = vendas.length;
            const valorTotal = vendas.reduce((sum, v) => sum + parseFloat(v.total || 0), 0);
            const vendasPendentes = vendas.filter(v => v.status === 'Pendente').length;
            const vendasPagas = vendas.filter(v => v.status === 'Pago').length;
            
            const resumo = [
                { label: 'Total de Vendas:', value: totalVendas.toString() },
                { label: 'Valor Total:', value: this.formatCurrency(valorTotal) },
                { label: 'Vendas Pendentes:', value: vendasPendentes.toString() },
                { label: 'Vendas Pagas:', value: vendasPagas.toString() }
            ];
            
            this.addResumoTable(resumo);
            
        } catch (error) {
            console.error('❌ Erro ao adicionar resumo de vendas:', error);
            throw error;
        }
    }

    addInfoTable(info) {
        try {
            info.forEach((item, index) => {
                const y = this.doc.y;
                
                // Linha alternada
                if (index % 2 === 0) {
                    this.doc
                        .fillColor('#f9fafb')
                        .rect(50, y, 470, 20)
                        .fill();
                }
                
                this.doc
                    .fillColor('#1f2937')
                    .font(this.fonts.bold)
                    .fontSize(10)
                    .text(item.label, 55, y + 5, { width: 150 })
                    .font(this.fonts.regular)
                    .text(item.value, 210, y + 5, { width: 310 });
                
                this.doc.moveDown(1);
            });
            
        } catch (error) {
            console.error('❌ Erro ao adicionar tabela de informações:', error);
            throw error;
        }
    }

    addTotaisTable(totais) {
        try {
            totais.forEach((item, index) => {
                const y = this.doc.y;
                
                this.doc
                    .fillColor('#1f2937')
                    .font(this.fonts.bold)
                    .fontSize(12)
                    .text(item.label, 350, y + 5, { width: 120 })
                    .font(this.fonts.bold)
                    .fontSize(14)
                    .text(item.value, 475, y + 5, { width: 70, align: 'right' });
                
                this.doc.moveDown(1);
            });
            
        } catch (error) {
            console.error('❌ Erro ao adicionar tabela de totais:', error);
            throw error;
        }
    }

    addResumoTable(resumo) {
        try {
            resumo.forEach((item, index) => {
                const y = this.doc.y;
                
                // Linha alternada
                if (index % 2 === 0) {
                    this.doc
                        .fillColor('#f9fafb')
                        .rect(50, y, 470, 20)
                        .fill();
                }
                
                this.doc
                    .fillColor('#1f2937')
                    .font(this.fonts.bold)
                    .fontSize(10)
                    .text(item.label, 55, y + 5, { width: 200 })
                    .font(this.fonts.regular)
                    .text(item.value, 260, y + 5, { width: 260 });
                
                this.doc.moveDown(1);
            });
            
        } catch (error) {
            console.error('❌ Erro ao adicionar tabela de resumo:', error);
            throw error;
        }
    }

    addFooter() {
        try {
            const pageCount = this.doc.bufferedPageRange().count;
            
            // Verificar se há páginas antes de tentar acessá-las
            if (pageCount === 0) {
                console.warn('⚠️ Nenhuma página encontrada para adicionar rodapé');
                return;
            }
            
            // PDFKit usa índices baseados em 1, não 0
            for (let i = 1; i <= pageCount; i++) {
                try {
                    this.doc.switchToPage(i);
                    
                    const y = this.doc.page.height - 50;
                    
                    // Linha separadora
                    this.doc
                        .moveTo(50, y)
                        .lineTo(545, y)
                        .strokeColor('#e5e7eb')
                        .lineWidth(1)
                        .stroke();
                    
                    this.doc.moveDown(0.5);
                    
                    // Informações do rodapé
                    this.doc
                        .font(this.fonts.regular)
                        .fontSize(8)
                        .fillColor('#6b7280')
                        .text('Sistema de Vendas - Gerado em ' + new Date().toLocaleString('pt-BR'), 50, y + 10, { width: 200 })
                        .text(`Página ${i} de ${pageCount}`, 400, y + 10, { width: 145, align: 'right' });
                } catch (pageError) {
                    console.warn(`⚠️ Erro ao adicionar rodapé na página ${i}:`, pageError);
                    // Continuar com as próximas páginas
                }
            }
            
        } catch (error) {
            console.error('❌ Erro ao adicionar rodapé:', error);
            // Não lançar erro para não quebrar a geração do PDF
            console.warn('⚠️ Continuando sem rodapé devido a erro');
        }
    }

    // ===== MÉTODOS UTILITÁRIOS =====

    getStatusText(status) {
        try {
            const statusMap = {
                'Pendente': '⏳ Pendente',
                'Parcial': '💰 Parcial',
                'Pago': '✅ Pago',
                'Ativo': '🟢 Ativo',
                'Convertido': '🔄 Convertido',
                'Expirado': '⏰ Expirado'
            };
            
            return statusMap[status] || status;
        } catch (error) {
            console.error('❌ Erro ao obter texto do status:', error);
            return status || 'Desconhecido';
        }
    }

    formatCurrency(value) {
        try {
            if (!value || isNaN(value)) return 'R$ 0,00';
            
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(value);
        } catch (error) {
            console.error('❌ Erro ao formatar moeda:', error);
            return 'R$ 0,00';
        }
    }

    formatDate(dateString) {
        try {
            if (!dateString) return 'Data não informada';
            
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Data inválida';
            
            return date.toLocaleDateString('pt-BR');
        } catch (error) {
            console.error('❌ Erro ao formatar data:', error);
            return 'Data inválida';
        }
    }

    formatFilterLabel(key) {
        try {
            const labels = {
                'data_inicio': 'Data Início',
                'data_fim': 'Data Fim',
                'cliente_id': 'Cliente',
                'status': 'Status',
                'valor_min': 'Valor Mínimo',
                'valor_max': 'Valor Máximo'
            };
            
            return labels[key] || key.charAt(0).toUpperCase() + key.slice(1);
        } catch (error) {
            console.error('❌ Erro ao formatar label do filtro:', error);
            return key;
        }
    }

    // ===== MÉTODOS DE EXPORTAÇÃO =====

    async saveToFile(stream, filepath) {
        return new Promise((resolve, reject) => {
            const writeStream = fs.createWriteStream(filepath);
            stream.pipe(writeStream);
            
            writeStream.on('finish', () => {
                resolve(filepath);
            });
            
            writeStream.on('error', (error) => {
                reject(error);
            });
        });
    }

    async generateBuffer() {
        return new Promise((resolve, reject) => {
            const chunks = [];
            
            this.doc.on('data', (chunk) => {
                chunks.push(chunk);
            });
            
            this.doc.on('end', () => {
                resolve(Buffer.concat(chunks));
            });
            
            this.doc.on('error', (error) => {
                reject(error);
            });
        });
    }
}

module.exports = PDFGenerator; 