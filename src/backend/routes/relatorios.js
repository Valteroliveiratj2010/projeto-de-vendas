const express = require('express');
const { query } = require('../config/database');
const router = express.Router();

// GET /api/relatorios/dashboard - Dados para dashboard
router.get('/dashboard', async (req, res) => {
  try {
    // Estatísticas gerais
    const statsResult = await query(`
      SELECT 
        (SELECT COUNT(*) FROM clientes) as total_clientes,
        (SELECT COUNT(*) FROM produtos) as total_produtos,
        (SELECT COUNT(*) FROM vendas) as total_vendas,
        (SELECT COUNT(*) FROM orcamentos WHERE status = 'Ativo') as orcamentos_ativos,
        (SELECT COUNT(*) FROM orcamentos WHERE status = 'Aprovado') as orcamentos_aprovados,
        (SELECT COUNT(*) FROM orcamentos WHERE status = 'Convertido') as orcamentos_convertidos,
        (SELECT COUNT(*) FROM orcamentos WHERE status = 'Expirado') as orcamentos_expirados,
        (SELECT COALESCE(SUM(total), 0) FROM vendas) as valor_total_vendas,
        (SELECT COALESCE(SUM(saldo), 0) FROM vendas WHERE status != 'Pago') as valor_total_devido,
        (SELECT COALESCE(SUM(valor_pago), 0) FROM pagamentos) as valor_total_pago
    `);
    
    // Vendas por status
    const vendasStatusResult = await query(`
      SELECT 
        status,
        COUNT(*) as quantidade,
        COALESCE(SUM(total), 0) as valor_total
      FROM vendas 
      GROUP BY status
      ORDER BY quantidade DESC
    `);
    
    // Top 5 clientes devedores
    const clientesDevedoresResult = await query(`
      SELECT 
        c.nome,
        c.telefone,
        COUNT(v.id) as total_vendas,
        COALESCE(SUM(v.saldo), 0) as total_devido
      FROM clientes c
      JOIN vendas v ON c.id = v.cliente_id
      WHERE v.status != 'Pago'
      GROUP BY c.id, c.nome, c.telefone
      ORDER BY total_devido DESC
      LIMIT 5
    `);
    
    // Produtos com estoque baixo
    const estoqueBaixoResult = await query(`
      SELECT 
        nome,
        estoque,
        preco
      FROM produtos 
      WHERE estoque <= 5
      ORDER BY estoque ASC
      LIMIT 10
    `);
    
    // Vendas dos últimos 7 dias
    const vendasRecentesResult = await query(`
      SELECT 
        DATE(created_at) as data,
        COUNT(*) as quantidade,
        COALESCE(SUM(total), 0) as valor_total
      FROM vendas 
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY data DESC
    `);
    
    res.json({
      success: true,
      data: {
        estatisticas: statsResult.rows[0],
        vendas_por_status: vendasStatusResult.rows,
        clientes_devedores: clientesDevedoresResult.rows,
        estoque_baixo: estoqueBaixoResult.rows,
        vendas_recentes: vendasRecentesResult.rows
      }
    });
    
  } catch (error) {
    console.error('Erro ao gerar relatório do dashboard:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// GET /api/relatorios/vendas - Relatório detalhado de vendas
router.get('/vendas', async (req, res) => {
  try {
    const { data_inicio, data_fim, cliente_id, status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    let whereConditions = [];
    let params = [];
    
    if (data_inicio) {
      whereConditions.push(`v.created_at >= $${params.length + 1}`);
      params.push(data_inicio);
    }
    
    if (data_fim) {
      whereConditions.push(`v.created_at <= $${params.length + 1}`);
      params.push(data_fim);
    }
    
    if (cliente_id) {
      whereConditions.push(`v.cliente_id = $${params.length + 1}`);
      params.push(parseInt(cliente_id));
    }
    
    if (status) {
      whereConditions.push(`v.status = $${params.length + 1}`);
      params.push(status);
    }
    
    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
    
    // Buscar vendas
    const vendasResult = await query(`
      SELECT 
        v.id,
        v.created_at,
        v.total,
        v.pago,
        v.saldo,
        v.status,
        c.nome as cliente_nome,
        c.telefone as cliente_telefone,
        c.documento as cliente_documento,
        COUNT(iv.id) as total_itens,
        COALESCE(SUM(p.valor_pago), 0) as total_pago_realizado
      FROM vendas v
      JOIN clientes c ON v.cliente_id = c.id
      LEFT JOIN itens_venda iv ON v.id = iv.venda_id
      LEFT JOIN pagamentos p ON v.id = p.venda_id
      ${whereClause}
      GROUP BY v.id, c.nome, c.telefone, c.documento
      ORDER BY v.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `, [...params, parseInt(limit), offset]);
    
    // Contar total
    const countResult = await query(`
      SELECT COUNT(DISTINCT v.id)
      FROM vendas v
      JOIN clientes c ON v.cliente_id = c.id
      ${whereClause}
    `, params);
    
    const total = parseInt(countResult.rows[0].count);
    
    // Resumo financeiro
    const resumoResult = await query(`
      SELECT 
        COUNT(*) as total_vendas,
        COALESCE(SUM(total), 0) as valor_total_vendas,
        COALESCE(SUM(pago), 0) as valor_total_pago,
        COALESCE(SUM(saldo), 0) as valor_total_devido,
        AVG(total) as ticket_medio
      FROM vendas v
      ${whereClause}
    `, params);
    
    res.json({
      success: true,
      data: {
        vendas: vendasResult.rows,
        resumo: resumoResult.rows[0],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Erro ao gerar relatório de vendas:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// GET /api/relatorios/clientes - Relatório de clientes
router.get('/clientes', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    // Listar clientes com estatísticas
    const clientesResult = await query(`
      SELECT 
        c.*,
        COUNT(DISTINCT v.id) as total_vendas,
        COALESCE(SUM(v.total), 0) as valor_total_compras,
        COALESCE(SUM(v.saldo), 0) as valor_total_devido,
        COUNT(DISTINCT o.id) as total_orcamentos,
        COALESCE(SUM(o.total), 0) as valor_total_orcamentos,
        MAX(v.created_at) as ultima_compra,
        MAX(o.created_at) as ultimo_orcamento
      FROM clientes c
      LEFT JOIN vendas v ON c.id = v.cliente_id
      LEFT JOIN orcamentos o ON c.id = o.cliente_id
      GROUP BY c.id
      ORDER BY valor_total_devido DESC
      LIMIT $1 OFFSET $2
    `, [parseInt(limit), offset]);
    
    // Contar total
    const countResult = await query('SELECT COUNT(*) FROM clientes');
    const total = parseInt(countResult.rows[0].count);
    
    // Resumo geral
    const resumoResult = await query(`
      SELECT 
        COUNT(*) as total_clientes,
        COUNT(CASE WHEN EXISTS(SELECT 1 FROM vendas v WHERE v.cliente_id = c.id) THEN 1 END) as clientes_com_vendas,
        COUNT(CASE WHEN EXISTS(SELECT 1 FROM vendas v WHERE v.cliente_id = c.id AND v.status != 'Pago') THEN 1 END) as clientes_devedores,
        AVG(CASE WHEN EXISTS(SELECT 1 FROM vendas v WHERE v.cliente_id = c.id) THEN (
          SELECT AVG(v2.total) FROM vendas v2 WHERE v2.cliente_id = c.id
        ) END) as ticket_medio
      FROM clientes c
    `);
    
    res.json({
      success: true,
      data: {
        clientes: clientesResult.rows,
        resumo: resumoResult.rows[0],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Erro ao gerar relatório de clientes:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// GET /api/relatorios/produtos - Relatório de produtos
router.get('/produtos', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    // Listar produtos com estatísticas
    const produtosResult = await query(`
      SELECT 
        p.*,
        COUNT(iv.id) as total_vendido,
        COALESCE(SUM(iv.subtotal), 0) as valor_total_vendido,
        COALESCE(AVG(iv.preco_unit), 0) as preco_medio_vendido,
        MAX(v.created_at) as ultima_venda
      FROM produtos p
      LEFT JOIN itens_venda iv ON p.id = iv.produto_id
      LEFT JOIN vendas v ON iv.venda_id = v.id
      GROUP BY p.id
      ORDER BY total_vendido DESC
      LIMIT $1 OFFSET $2
    `, [parseInt(limit), offset]);
    
    // Contar total
    const countResult = await query('SELECT COUNT(*) FROM produtos');
    const total = parseInt(countResult.rows[0].count);
    
    // Resumo de estoque
    const estoqueResult = await query(`
      SELECT 
        COUNT(*) as total_produtos,
        SUM(estoque) as total_estoque,
        AVG(preco) as preco_medio,
        COUNT(CASE WHEN estoque = 0 THEN 1 END) as produtos_sem_estoque,
        COUNT(CASE WHEN estoque <= 5 THEN 1 END) as produtos_estoque_baixo,
        COUNT(CASE WHEN estoque > 20 THEN 1 END) as produtos_estoque_alto
      FROM produtos
    `);
    
    res.json({
      success: true,
      data: {
        produtos: produtosResult.rows,
        estoque: estoqueResult.rows[0],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Erro ao gerar relatório de produtos:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// GET /api/relatorios/financeiro - Relatório financeiro
router.get('/financeiro', async (req, res) => {
  try {
    const { data_inicio, data_fim } = req.query;
    
    let whereClause = '';
    let params = [];
    
    if (data_inicio && data_fim) {
      whereClause = 'WHERE v.created_at BETWEEN $1 AND $2';
      params = [data_inicio, data_fim];
    }
    
    // Resumo financeiro geral
    const resumoResult = await query(`
      SELECT 
        COUNT(*) as total_vendas,
        COALESCE(SUM(v.total), 0) as valor_total_vendas,
        COALESCE(SUM(v.pago), 0) as valor_total_pago,
        COALESCE(SUM(v.saldo), 0) as valor_total_devido,
        AVG(v.total) as ticket_medio,
        COUNT(CASE WHEN v.status = 'Pago' THEN 1 END) as vendas_pagas,
        COUNT(CASE WHEN v.status = 'Parcial' THEN 1 END) as vendas_parciais,
        COUNT(CASE WHEN v.status = 'Pendente' THEN 1 END) as vendas_pendentes
      FROM vendas v
      ${whereClause}
    `, params);
    
    // Fluxo de caixa por período
    const fluxoResult = await query(`
      SELECT 
        DATE(v.created_at) as data,
        COUNT(v.id) as vendas,
        COALESCE(SUM(v.total), 0) as receita,
        COALESCE(SUM(p.valor_pago), 0) as recebimentos
      FROM vendas v
      LEFT JOIN pagamentos p ON v.id = p.venda_id
      ${whereClause}
      GROUP BY DATE(v.created_at)
      ORDER BY data DESC
      LIMIT 30
    `, params);
    
    // Top clientes por valor
    const topClientesResult = await query(`
      SELECT 
        c.nome,
        c.telefone,
        COUNT(v.id) as total_vendas,
        COALESCE(SUM(v.total), 0) as valor_total_compras,
        COALESCE(SUM(v.saldo), 0) as valor_devido
      FROM clientes c
      JOIN vendas v ON c.id = v.cliente_id
      ${whereClause ? 'WHERE v.created_at BETWEEN $1 AND $2' : ''}
      GROUP BY c.id, c.nome, c.telefone
      ORDER BY valor_total_compras DESC
      LIMIT 10
    `, params);
    
    res.json({
      success: true,
      data: {
        resumo: resumoResult.rows[0],
        fluxo_caixa: fluxoResult.rows,
        top_clientes: topClientesResult.rows
      }
    });
    
  } catch (error) {
    console.error('Erro ao gerar relatório financeiro:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// GET /api/relatorios/orcamentos - Relatório de orçamentos
router.get('/orcamentos', async (req, res) => {
  try {
    const { page = 1, limit = 50, status, cliente_id } = req.query;
    const offset = (page - 1) * limit;
    
    let whereConditions = [];
    let params = [];
    
    if (status) {
      whereConditions.push(`o.status = $${params.length + 1}`);
      params.push(status);
    }
    
    if (cliente_id) {
      whereConditions.push(`o.cliente_id = $${params.length + 1}`);
      params.push(parseInt(cliente_id));
    }
    
    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
    
    // Buscar orçamentos
    const orcamentosResult = await query(`
      SELECT 
        o.*,
        c.nome as cliente_nome,
        c.telefone as cliente_telefone,
        c.documento as cliente_documento,
        COUNT(oi.id) as total_itens
      FROM orcamentos o
      JOIN clientes c ON o.cliente_id = c.id
      LEFT JOIN orcamento_itens oi ON o.id = oi.orcamento_id
      ${whereClause}
      GROUP BY o.id, c.nome, c.telefone, c.documento
      ORDER BY o.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `, [...params, parseInt(limit), offset]);
    
    // Contar total
    const countResult = await query(`
      SELECT COUNT(DISTINCT o.id)
      FROM orcamentos o
      JOIN clientes c ON o.cliente_id = c.id
      ${whereClause}
    `, params);
    
    const total = parseInt(countResult.rows[0].count);
    
    // Estatísticas por status
    const statsResult = await query(`
      SELECT 
        status,
        COUNT(*) as quantidade,
        COALESCE(SUM(total), 0) as valor_total
      FROM orcamentos
      GROUP BY status
      ORDER BY quantidade DESC
    `);
    
    res.json({
      success: true,
      data: {
        orcamentos: orcamentosResult.rows,
        estatisticas: statsResult.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Erro ao gerar relatório de orçamentos:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// GET /api/relatorios/exportar/csv - Exportar dados em CSV
router.get('/exportar/csv', async (req, res) => {
  try {
    const { tipo, data_inicio, data_fim } = req.query;
    
    if (!tipo || !['vendas', 'clientes', 'produtos'].includes(tipo)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Tipo deve ser: vendas, clientes ou produtos' 
      });
    }
    
    let sql = '';
    let filename = '';
    
    switch (tipo) {
      case 'vendas':
        filename = `vendas_${new Date().toISOString().split('T')[0]}.csv`;
        sql = `
          SELECT 
            v.id,
            v.created_at,
            v.total,
            v.pago,
            v.saldo,
            v.status,
            c.nome as cliente_nome,
            c.telefone as cliente_telefone,
            c.documento as cliente_documento
          FROM vendas v
          JOIN clientes c ON v.cliente_id = c.id
          ${data_inicio && data_fim ? 'WHERE v.created_at BETWEEN $1 AND $2' : ''}
          ORDER BY v.created_at DESC
        `;
        break;
        
      case 'clientes':
        filename = `clientes_${new Date().toISOString().split('T')[0]}.csv`;
        sql = `
          SELECT 
            id,
            nome,
            telefone,
            email,
            endereco,
            documento,
            created_at
          FROM clientes
          ORDER BY nome
        `;
        break;
        
      case 'produtos':
        filename = `produtos_${new Date().toISOString().split('T')[0]}.csv`;
        sql = `
          SELECT 
            id,
            nome,
            descricao,
            preco,
            estoque,
            created_at
          FROM produtos
          ORDER BY nome
        `;
        break;
    }
    
    const params = data_inicio && data_fim ? [data_inicio, data_fim] : [];
    const result = await query(sql, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Nenhum dado encontrado para exportação' });
    }
    
    // Gerar CSV
    const headers = Object.keys(result.rows[0]);
    let csv = headers.join(',') + '\n';
    
    result.rows.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      });
      csv += values.join(',') + '\n';
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
    
  } catch (error) {
    console.error('Erro ao exportar dados:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// GET /api/relatorios/graficos/vendas-periodo - Dados para gráfico de vendas por período
router.get('/graficos/vendas-periodo', async (req, res) => {
  try {
    const { periodo = 30 } = req.query;
    
    // Vendas por período (últimos X dias)
    const vendasPeriodoResult = await query(`
      SELECT 
        DATE(created_at) as data,
        COUNT(*) as quantidade,
        COALESCE(SUM(total), 0) as valor_total
      FROM vendas 
      WHERE created_at >= CURRENT_DATE - INTERVAL '${periodo} days'
      GROUP BY DATE(created_at)
      ORDER BY data ASC
    `);
    
    res.json({
      success: true,
      data: vendasPeriodoResult.rows
    });
    
  } catch (error) {
    console.error('Erro ao gerar dados de vendas por período:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// GET /api/relatorios/graficos/pagamentos-forma - Dados para gráfico de formas de pagamento
router.get('/graficos/pagamentos-forma', async (req, res) => {
  try {
    const { periodo = 30 } = req.query;
    
    // Formas de pagamento utilizadas
    const pagamentosFormaResult = await query(`
      SELECT 
        forma_pagamento,
        COUNT(*) as quantidade,
        COALESCE(SUM(valor_pago), 0) as valor_total
      FROM pagamentos 
      WHERE created_at >= CURRENT_DATE - INTERVAL '${periodo} days'
      GROUP BY forma_pagamento
      ORDER BY valor_total DESC
    `);
    
    res.json({
      success: true,
      data: pagamentosFormaResult.rows
    });
    
  } catch (error) {
    console.error('Erro ao gerar dados de formas de pagamento:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// GET /api/relatorios/graficos/produtos-vendidos - Dados para gráfico de produtos mais vendidos
router.get('/graficos/produtos-vendidos', async (req, res) => {
  try {
    const { periodo = 30, limite = 10 } = req.query;
    
    // Produtos mais vendidos
    const produtosVendidosResult = await query(`
      SELECT 
        p.nome,
        SUM(iv.quantidade) as quantidade_vendida,
        COALESCE(SUM(iv.quantidade * iv.preco_unitario), 0) as valor_total
      FROM produtos p
      JOIN itens_venda iv ON p.id = iv.produto_id
      JOIN vendas v ON iv.venda_id = v.id
      WHERE v.created_at >= CURRENT_DATE - INTERVAL '${periodo} days'
      GROUP BY p.id, p.nome
      ORDER BY quantidade_vendida DESC
      LIMIT ${limite}
    `);
    
    res.json({
      success: true,
      data: produtosVendidosResult.rows
    });
    
  } catch (error) {
    console.error('Erro ao gerar dados de produtos vendidos:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// GET /api/relatorios/graficos/clientes-ativos - Dados para gráfico de clientes ativos
router.get('/graficos/clientes-ativos', async (req, res) => {
  try {
    const { periodo = 30 } = req.query;
    
    // Clientes ativos por período
    const clientesAtivosResult = await query(`
      SELECT 
        DATE(created_at) as data,
        COUNT(DISTINCT cliente_id) as clientes_ativos
      FROM vendas 
      WHERE created_at >= CURRENT_DATE - INTERVAL '${periodo} days'
      GROUP BY DATE(created_at)
      ORDER BY data ASC
    `);
    
    res.json({
      success: true,
      data: clientesAtivosResult.rows
    });
    
  } catch (error) {
    console.error('Erro ao gerar dados de clientes ativos:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// GET /api/relatorios/graficos/estatisticas-gerais - Estatísticas para os cards
router.get('/graficos/estatisticas-gerais', async (req, res) => {
  try {
    const { periodo = 30 } = req.query;
    
    // Estatísticas gerais do período
    const statsResult = await query(`
      SELECT 
        COUNT(*) as total_vendas,
        COALESCE(SUM(total), 0) as receita_total,
        AVG(total) as ticket_medio,
        COUNT(DISTINCT cliente_id) as clientes_unicos,
        (
          SELECT COUNT(*) 
          FROM vendas v2 
          WHERE v2.created_at >= CURRENT_DATE - INTERVAL '${periodo * 2} days' 
          AND v2.created_at < CURRENT_DATE - INTERVAL '${periodo} days'
        ) as vendas_periodo_anterior,
        (
          SELECT COALESCE(SUM(total), 0) 
          FROM vendas v3 
          WHERE v3.created_at >= CURRENT_DATE - INTERVAL '${periodo * 2} days' 
          AND v3.created_at < CURRENT_DATE - INTERVAL '${periodo} days'
        ) as receita_periodo_anterior
      FROM vendas 
      WHERE created_at >= CURRENT_DATE - INTERVAL '${periodo} days'
    `);
    
    const stats = statsResult.rows[0];
    
    // Calcular crescimento
    const crescimento = stats.vendas_periodo_anterior > 0 
      ? ((stats.total_vendas - stats.vendas_periodo_anterior) / stats.vendas_periodo_anterior * 100).toFixed(1)
      : 0;
    
    res.json({
      success: true,
      data: {
        ...stats,
        crescimento: parseFloat(crescimento)
      }
    });
    
  } catch (error) {
    console.error('Erro ao gerar estatísticas gerais:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// GET /api/relatorios/graficos/tendencia-vendas - Dados para gráfico de tendência de vendas
router.get('/graficos/tendencia-vendas', async (req, res) => {
  try {
    const { periodo = 30 } = req.query;
    
    // Tendência de vendas (últimos X dias)
    const tendenciaResult = await query(`
      SELECT 
        DATE(created_at) as data,
        COUNT(*) as quantidade,
        COALESCE(SUM(total), 0) as valor_total
      FROM vendas 
      WHERE created_at >= CURRENT_DATE - INTERVAL '${periodo} days'
      GROUP BY DATE(created_at)
      ORDER BY data ASC
    `);
    
    res.json({
      success: true,
      data: tendenciaResult.rows
    });
    
  } catch (error) {
    console.error('Erro ao gerar dados de tendência de vendas:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// GET /api/relatorios/graficos/vendas-status - Dados para gráfico de status das vendas
router.get('/graficos/vendas-status', async (req, res) => {
  try {
    const { periodo = 30 } = req.query;
    
    // Status das vendas
    const vendasStatusResult = await query(`
      SELECT 
        status,
        COUNT(*) as quantidade,
        COALESCE(SUM(total), 0) as valor_total
      FROM vendas 
      WHERE created_at >= CURRENT_DATE - INTERVAL '${periodo} days'
      GROUP BY status
      ORDER BY quantidade DESC
    `);
    
    res.json({
      success: true,
      data: vendasStatusResult.rows
    });
    
  } catch (error) {
    console.error('Erro ao gerar dados de status das vendas:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// GET /api/relatorios/graficos/orcamentos-status - Dados para gráfico de status dos orçamentos
router.get('/graficos/orcamentos-status', async (req, res) => {
  try {
    const { periodo = 30 } = req.query;
    
    // Status dos orçamentos
    const orcamentosStatusResult = await query(`
      SELECT 
        status,
        COUNT(*) as quantidade,
        COALESCE(SUM(total), 0) as valor_total
      FROM orcamentos 
      WHERE created_at >= CURRENT_DATE - INTERVAL '${periodo} days'
      GROUP BY status
      ORDER BY quantidade DESC
    `);
    
    res.json({
      success: true,
      data: orcamentosStatusResult.rows
    });
    
  } catch (error) {
    console.error('Erro ao gerar dados de status dos orçamentos:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// GET /api/relatorios/graficos/valores-distribuicao - Dados para gráfico de distribuição de valores
router.get('/graficos/valores-distribuicao', async (req, res) => {
  try {
    const { periodo = 30 } = req.query;
    
    // Distribuição de valores das vendas - Versão simplificada
    const valoresDistribuicaoResult = await query(`
      WITH faixas AS (
        SELECT 
          total,
          CASE 
            WHEN total <= 100 THEN 'Até R$ 100'
            WHEN total <= 500 THEN 'R$ 100 - R$ 500'
            WHEN total <= 1000 THEN 'R$ 500 - R$ 1.000'
            WHEN total <= 5000 THEN 'R$ 1.000 - R$ 5.000'
            ELSE 'Acima de R$ 5.000'
          END as faixa_valor,
          CASE 
            WHEN total <= 100 THEN 1
            WHEN total <= 500 THEN 2
            WHEN total <= 1000 THEN 3
            WHEN total <= 5000 THEN 4
            ELSE 5
          END as ordem
        FROM vendas 
        WHERE created_at >= CURRENT_DATE - INTERVAL '${periodo} days'
      )
      SELECT 
        faixa_valor,
        COUNT(*) as quantidade,
        COALESCE(SUM(total), 0) as valor_total,
        ordem
      FROM faixas
      GROUP BY faixa_valor, ordem
      ORDER BY ordem
    `);
    
    res.json({
      success: true,
      data: valoresDistribuicaoResult.rows
    });
    
  } catch (error) {
    console.error('Erro ao gerar dados de distribuição de valores:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

module.exports = router; 