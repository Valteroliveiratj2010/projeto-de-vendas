// Rotas para geração de PDF
const express = require('express');
const PDFGenerator = require('../utils/pdf-generator');
const { getClient, query } = require('../config/database');

const router = express.Router();

// ===== GERAR PDF DE VENDA =====
router.get('/venda/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        // Validar ID
        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({ success: false, error: 'ID de venda inválido' });
        }
        
        const client = await getClient();
        
        // Buscar dados da venda
        const vendaResult = await client.query(`
            SELECT v.*, c.nome as cliente_nome, c.documento, c.telefone, c.email, c.endereco
            FROM vendas v
            JOIN clientes c ON v.cliente_id = c.id
            WHERE v.id = $1
        `, [id]);
        
        if (vendaResult.rows.length === 0) {
            client.release();
            return res.status(404).json({ success: false, error: 'Venda não encontrada' });
        }
        
        const venda = vendaResult.rows[0];
        
        // Buscar itens da venda
        const itensResult = await client.query(`
            SELECT iv.*, p.nome as produto_nome
            FROM itens_venda iv
            JOIN produtos p ON iv.produto_id = p.id
            WHERE iv.venda_id = $1
        `, [id]);
        
        const itens = itensResult.rows;
        
        // Buscar pagamentos da venda
        const pagamentosResult = await client.query(`
            SELECT * FROM pagamentos 
            WHERE venda_id = $1 
            ORDER BY data_pagto ASC
        `, [id]);
        
        const pagamentos = pagamentosResult.rows;
        
        // Buscar dados do cliente
        const cliente = {
            nome: venda.cliente_nome || 'Cliente não informado',
            documento: venda.documento || 'Não informado',
            telefone: venda.telefone || 'Não informado',
            email: venda.email || 'Não informado',
            endereco: venda.endereco || 'Não informado'
        };
        
        client.release();
        
        // Validar dados antes de gerar PDF
        if (!venda || !cliente.nome) {
            return res.status(400).json({ success: false, error: 'Dados insuficientes para gerar PDF' });
        }
        
        // Gerar PDF
        const pdfGenerator = new PDFGenerator();
        const pdfDoc = await pdfGenerator.generateVendaPDF(venda, cliente, itens, pagamentos);
        
        // Configurar headers para download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="venda-${id.toString().padStart(6, '0')}.pdf"`);
        res.setHeader('Cache-Control', 'no-cache');
        
        // Enviar PDF
        pdfDoc.pipe(res);
        
    } catch (error) {
        console.error('❌ Erro ao gerar PDF da venda:', error);
        res.status(500).json({ success: false, error: 'Erro interno do servidor ao gerar PDF' });
    }
});

// ===== GERAR PDF DE ORÇAMENTO =====
router.get('/orcamento/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        // Validar ID
        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({ success: false, error: 'ID de orçamento inválido' });
        }
        
        const client = await getClient();
        
        // Buscar dados do orçamento
        const orcamentoResult = await client.query(`
            SELECT o.*, c.nome as cliente_nome, c.documento, c.telefone, c.email, c.endereco
            FROM orcamentos o
            JOIN clientes c ON o.cliente_id = c.id
            WHERE o.id = $1
        `, [id]);
        
        if (orcamentoResult.rows.length === 0) {
            client.release();
            return res.status(404).json({ success: false, error: 'Orçamento não encontrado' });
        }
        
        const orcamento = orcamentoResult.rows[0];
        
        // Buscar itens do orçamento
        const itensResult = await client.query(`
            SELECT oi.*, p.nome as produto_nome
            FROM orcamento_itens oi
            JOIN produtos p ON oi.produto_id = p.id
            WHERE oi.orcamento_id = $1
        `, [id]);
        
        const itens = itensResult.rows;
        
        // Buscar dados do cliente
        const cliente = {
            nome: orcamento.cliente_nome || 'Cliente não informado',
            documento: orcamento.documento || 'Não informado',
            telefone: orcamento.telefone || 'Não informado',
            email: orcamento.email || 'Não informado',
            endereco: orcamento.endereco || 'Não informado'
        };
        
        client.release();
        
        // Validar dados antes de gerar PDF
        if (!orcamento || !cliente.nome) {
            return res.status(400).json({ success: false, error: 'Dados insuficientes para gerar PDF' });
        }
        
        // Gerar PDF
        const pdfGenerator = new PDFGenerator();
        const pdfDoc = await pdfGenerator.generateOrcamentoPDF(orcamento, cliente, itens);
        
        // Configurar headers para download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="orcamento-${id.toString().padStart(6, '0')}.pdf"`);
        res.setHeader('Cache-Control', 'no-cache');
        
        // Enviar PDF
        pdfDoc.pipe(res);
        
    } catch (error) {
        console.error('❌ Erro ao gerar PDF do orçamento:', error);
        res.status(500).json({ success: false, error: 'Erro interno do servidor ao gerar PDF' });
    }
});

// ===== GERAR PDF DE RELATÓRIO DE VENDAS =====
router.get('/relatorio/vendas', async (req, res) => {
    const { data_inicio, data_fim, cliente_id, status, valor_min, valor_max } = req.query;
    
    try {
        let whereClause = 'WHERE 1=1';
        const params = [];
        let paramIndex = 1;
        
        // Filtros de data
        if (data_inicio) {
            whereClause += ` AND v.created_at >= $${paramIndex}`;
            params.push(data_inicio);
            paramIndex++;
        }
        
        if (data_fim) {
            whereClause += ` AND v.created_at <= $${paramIndex}`;
            params.push(data_fim + ' 23:59:59');
            paramIndex++;
        }
        
        // Filtro de cliente
        if (cliente_id) {
            whereClause += ` AND v.cliente_id = $${paramIndex}`;
            params.push(cliente_id);
            paramIndex++;
        }
        
        // Filtro de status
        if (status) {
            whereClause += ` AND v.status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }
        
        // Filtros de valor
        if (valor_min) {
            whereClause += ` AND v.total >= $${paramIndex}`;
            params.push(valor_min);
            paramIndex++;
        }
        
        if (valor_max) {
            whereClause += ` AND v.total <= $${paramIndex}`;
            params.push(valor_max);
            paramIndex++;
        }
        
        // Buscar vendas com filtros
        const vendasResult = await query(`
            SELECT v.*, c.nome as cliente_nome
            FROM vendas v
            JOIN clientes c ON v.cliente_id = c.id
            ${whereClause}
            ORDER BY v.created_at DESC
        `, params);
        
        const vendas = vendasResult.rows;
        
        // Validar dados
        if (!vendas || vendas.length === 0) {
            return res.status(404).json({ success: false, error: 'Nenhuma venda encontrada para os filtros aplicados' });
        }
        
        // Gerar PDF
        const pdfGenerator = new PDFGenerator();
        const pdfDoc = await pdfGenerator.generateRelatorioPDF('vendas', vendas, {
            data_inicio,
            data_fim,
            cliente_id,
            status,
            valor_min,
            valor_max
        });
        
        // Configurar headers para download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="relatorio-vendas-${new Date().toISOString().split('T')[0]}.pdf"`);
        res.setHeader('Cache-Control', 'no-cache');
        
        // Enviar PDF
        pdfDoc.pipe(res);
        
    } catch (error) {
        console.error('❌ Erro ao gerar PDF do relatório de vendas:', error);
        res.status(500).json({ success: false, error: 'Erro interno do servidor ao gerar PDF' });
    }
});

// ===== GERAR PDF DE RELATÓRIO DE CLIENTES =====
router.get('/relatorio/clientes', async (req, res) => {
    const { search, status_pagamento } = req.query;
    
    try {
        let whereClause = 'WHERE 1=1';
        const params = [];
        let paramIndex = 1;
        
        // Filtro de busca
        if (search) {
            whereClause += ` AND (c.nome ILIKE $${paramIndex} OR c.documento ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }
        
        // Filtro de status de pagamento
        if (status_pagamento) {
            if (status_pagamento === 'devedores') {
                whereClause += ` AND v.saldo > 0`;
            } else if (status_pagamento === 'em_dia') {
                whereClause += ` AND (v.saldo = 0 OR v.saldo IS NULL)`;
            }
        }
        
        // Buscar clientes com informações de vendas
        const clientesResult = await query(`
            SELECT 
                c.*,
                COUNT(v.id) as total_vendas,
                COALESCE(SUM(v.total), 0) as valor_total_vendas,
                COALESCE(SUM(v.saldo), 0) as saldo_total
            FROM clientes c
            LEFT JOIN vendas v ON c.id = v.cliente_id
            ${whereClause}
            GROUP BY c.id
            ORDER BY c.nome
        `, params);
        
        const clientes = clientesResult.rows;
        
        // Validar dados
        if (!clientes || clientes.length === 0) {
            return res.status(404).json({ success: false, error: 'Nenhum cliente encontrado para os filtros aplicados' });
        }
        
        // Gerar PDF
        const pdfGenerator = new PDFGenerator();
        const pdfDoc = await pdfGenerator.generateRelatorioPDF('clientes', clientes, {
            search,
            status_pagamento
        });
        
        // Configurar headers para download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="relatorio-clientes-${new Date().toISOString().split('T')[0]}.pdf"`);
        res.setHeader('Cache-Control', 'no-cache');
        
        // Enviar PDF
        pdfDoc.pipe(res);
        
    } catch (error) {
        console.error('❌ Erro ao gerar PDF do relatório de clientes:', error);
        res.status(500).json({ success: false, error: 'Erro interno do servidor ao gerar PDF' });
    }
});

// ===== GERAR PDF DE RELATÓRIO DE PRODUTOS =====
router.get('/relatorio/produtos', async (req, res) => {
    const { search, estoque_min, estoque_max } = req.query;
    
    try {
        let whereClause = 'WHERE 1=1';
        const params = [];
        let paramIndex = 1;
        
        // Filtro de busca
        if (search) {
            whereClause += ` AND (p.nome ILIKE $${paramIndex} OR p.descricao ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }
        
        // Filtro de estoque mínimo
        if (estoque_min) {
            whereClause += ` AND p.estoque >= $${paramIndex}`;
            params.push(estoque_min);
            paramIndex++;
        }
        
        // Filtro de estoque máximo
        if (estoque_max) {
            whereClause += ` AND p.estoque <= $${paramIndex}`;
            params.push(estoque_max);
            paramIndex++;
        }
        
        // Buscar produtos
        const produtosResult = await query(`
            SELECT 
                p.*,
                COUNT(iv.id) as total_vendas,
                COALESCE(SUM(iv.quantidade), 0) as quantidade_vendida
            FROM produtos p
            LEFT JOIN itens_venda iv ON p.id = iv.produto_id
            ${whereClause}
            GROUP BY p.id
            ORDER BY p.nome
        `, params);
        
        const produtos = produtosResult.rows;
        
        // Validar dados
        if (!produtos || produtos.length === 0) {
            return res.status(404).json({ success: false, error: 'Nenhum produto encontrado para os filtros aplicados' });
        }
        
        // Gerar PDF
        const pdfGenerator = new PDFGenerator();
        const pdfDoc = await pdfGenerator.generateRelatorioPDF('produtos', produtos, {
            search,
            estoque_min,
            estoque_max
        });
        
        // Configurar headers para download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="relatorio-produtos-${new Date().toISOString().split('T')[0]}.pdf"`);
        res.setHeader('Cache-Control', 'no-cache');
        
        // Enviar PDF
        pdfDoc.pipe(res);
        
    } catch (error) {
        console.error('❌ Erro ao gerar PDF do relatório de produtos:', error);
        res.status(500).json({ success: false, error: 'Erro interno do servidor ao gerar PDF' });
    }
});

// ===== GERAR PDF DE RELATÓRIO FINANCEIRO =====
router.get('/relatorio/financeiro', async (req, res) => {
    const { data_inicio, data_fim } = req.query;
    
    try {
        let whereClause = 'WHERE 1=1';
        const params = [];
        let paramIndex = 1;
        
        // Filtros de data
        if (data_inicio) {
            whereClause += ` AND v.created_at >= $${paramIndex}`;
            params.push(data_inicio);
            paramIndex++;
        }
        
        if (data_fim) {
            whereClause += ` AND v.created_at <= $${paramIndex}`;
            params.push(data_fim + ' 23:59:59');
            paramIndex++;
        }
        
        // Buscar dados financeiros
        const financeiroResult = await query(`
            SELECT 
                DATE(v.created_at) as data,
                COUNT(v.id) as total_vendas,
                COALESCE(SUM(v.total), 0) as valor_total,
                COALESCE(SUM(v.pago), 0) as valor_pago,
                COALESCE(SUM(v.saldo), 0) as valor_pendente
            FROM vendas v
            ${whereClause}
            GROUP BY DATE(v.created_at)
            ORDER BY DATE(v.created_at) DESC
        `, params);
        
        const financeiro = financeiroResult.rows;
        
        // Validar dados
        if (!financeiro || financeiro.length === 0) {
            return res.status(404).json({ success: false, error: 'Nenhum dado financeiro encontrado para o período' });
        }
        
        // Gerar PDF
        const pdfGenerator = new PDFGenerator();
        const pdfDoc = await pdfGenerator.generateRelatorioPDF('financeiro', financeiro, {
            data_inicio,
            data_fim
        });
        
        // Configurar headers para download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="relatorio-financeiro-${new Date().toISOString().split('T')[0]}.pdf"`);
        res.setHeader('Cache-Control', 'no-cache');
        
        // Enviar PDF
        pdfDoc.pipe(res);
        
    } catch (error) {
        console.error('❌ Erro ao gerar PDF do relatório financeiro:', error);
        res.status(500).json({ success: false, error: 'Erro interno do servidor ao gerar PDF' });
    }
});

// ===== GERAR PDF DE RELATÓRIO DE PAGAMENTOS =====
router.get('/relatorio/pagamentos', async (req, res) => {
    const { data_inicio, data_fim, forma_pagamento, venda_id } = req.query;
    
    try {
        let whereClause = 'WHERE 1=1';
        const params = [];
        let paramIndex = 1;
        
        // Filtros de data
        if (data_inicio) {
            whereClause += ` AND p.data_pagto >= $${paramIndex}`;
            params.push(data_inicio);
            paramIndex++;
        }
        
        if (data_fim) {
            whereClause += ` AND p.data_pagto <= $${paramIndex}`;
            params.push(data_fim + ' 23:59:59');
            paramIndex++;
        }
        
        // Filtro de forma de pagamento
        if (forma_pagamento) {
            whereClause += ` AND p.forma_pagamento = $${paramIndex}`;
            params.push(forma_pagamento);
            paramIndex++;
        }
        
        // Filtro de venda
        if (venda_id) {
            whereClause += ` AND p.venda_id = $${paramIndex}`;
            params.push(venda_id);
            paramIndex++;
        }
        
        // Buscar pagamentos
        const pagamentosResult = await query(`
            SELECT 
                p.*,
                v.total as venda_total,
                v.saldo as venda_saldo,
                c.nome as cliente_nome
            FROM pagamentos p
            JOIN vendas v ON p.venda_id = v.id
            JOIN clientes c ON v.cliente_id = c.id
            ${whereClause}
            ORDER BY p.data_pagto DESC
        `, params);
        
        const pagamentos = pagamentosResult.rows;
        
        // Validar dados
        if (!pagamentos || pagamentos.length === 0) {
            return res.status(404).json({ success: false, error: 'Nenhum pagamento encontrado para os filtros aplicados' });
        }
        
        // Gerar PDF
        const pdfGenerator = new PDFGenerator();
        const pdfDoc = await pdfGenerator.generateRelatorioPDF('pagamentos', pagamentos, {
            data_inicio,
            data_fim,
            forma_pagamento,
            venda_id
        });
        
        // Configurar headers para download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="relatorio-pagamentos-${new Date().toISOString().split('T')[0]}.pdf"`);
        res.setHeader('Cache-Control', 'no-cache');
        
        // Enviar PDF
        pdfDoc.pipe(res);
        
    } catch (error) {
        console.error('❌ Erro ao gerar PDF do relatório de pagamentos:', error);
        res.status(500).json({ success: false, error: 'Erro interno do servidor ao gerar PDF' });
    }
});

module.exports = router; 