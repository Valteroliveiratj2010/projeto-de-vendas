/**
 * Rotas do Dashboard
 * Endpoint para estatísticas e métricas do sistema
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

/**
 * GET /dashboard
 * Retorna estatísticas gerais do sistema
 */
router.get('/', async (req, res) => {
  try {
    console.log('=== CARREGANDO DADOS DO DASHBOARD ===');
    
    // Total de vendas por mês
    const vendasPorMes = await pool.query(`
      SELECT
        TO_CHAR(data, 'YYYY-MM') as mes,
        COUNT(*) as total_vendas,
        SUM(valor_total) as valor_total
      FROM vendas
      WHERE data >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY TO_CHAR(data, 'YYYY-MM')
      ORDER BY mes DESC
    `);

    // Quantidade de vendas por forma de pagamento
    const vendasPorPagamento = await pool.query(`
      SELECT
        forma_pagamento,
        COUNT(*) as quantidade,
        SUM(valor_total) as valor_total
      FROM vendas
      WHERE forma_pagamento IS NOT NULL
      GROUP BY forma_pagamento
      ORDER BY quantidade DESC
    `);

    // Produtos mais vendidos
    const produtosMaisVendidos = await pool.query(`
      SELECT
        p.id,
        p.nome,
        p.preco,
        SUM(vp.quantidade) as total_vendido,
        COUNT(DISTINCT v.id) as total_vendas
      FROM produtos p
      INNER JOIN vendas_produtos vp ON p.id = vp.produto_id
      INNER JOIN vendas v ON vp.venda_id = v.id
      GROUP BY p.id, p.nome, p.preco
      ORDER BY total_vendido DESC
      LIMIT 10
    `);

    // Clientes com mais compras
    const clientesMaisCompras = await pool.query(`
      SELECT
        c.id,
        c.nome,
        c.email,
        COUNT(v.id) as total_compras,
        SUM(v.valor_total) as valor_total_gasto
      FROM clientes c
      INNER JOIN vendas v ON c.id = v.cliente_id
      GROUP BY c.id, c.nome, c.email
      ORDER BY total_compras DESC, valor_total_gasto DESC
      LIMIT 10
    `);

    // Estatísticas gerais
    const estatisticasGerais = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM clientes) as total_clientes,
        (SELECT COUNT(*) FROM produtos) as total_produtos,
        (SELECT COUNT(*) FROM vendas) as total_vendas,
        (SELECT COUNT(*) FROM orcamentos) as total_orcamentos,
        (SELECT COALESCE(SUM(valor_total), 0) FROM vendas) as faturamento_total,
        (SELECT COALESCE(AVG(valor_total), 0) FROM vendas) as ticket_medio
    `);

    // Produtos em estoque baixo
    const produtosEstoqueBaixo = await pool.query(`
      SELECT
        id,
        nome,
        preco,
        estoque,
        categoria
      FROM produtos
      WHERE estoque < 10
      ORDER BY estoque ASC
    `);

    // Vendas recentes
    const vendasRecentes = await pool.query(`
      SELECT
        v.id,
        v.data,
        v.valor_total,
        v.forma_pagamento,
        c.nome as cliente_nome,
        c.email as cliente_email
      FROM vendas v
      INNER JOIN clientes c ON v.cliente_id = c.id
      ORDER BY v.data DESC
      LIMIT 10
    `);

    console.log('✅ Estatísticas gerais:', estatisticasGerais.rows[0]);
    console.log('✅ Vendas por mês:', vendasPorMes.rows.length);
    console.log('✅ Produtos mais vendidos:', produtosMaisVendidos.rows.length);
    console.log('✅ Produtos estoque baixo:', produtosEstoqueBaixo.rows.length);
    console.log('✅ Vendas recentes:', vendasRecentes.rows.length);

    // Resposta com todas as estatísticas
    const dashboard = {
      estatisticas_gerais: estatisticasGerais.rows[0],
      vendas_por_mes: vendasPorMes.rows,
      vendas_por_pagamento: vendasPorPagamento.rows,
      produtos_mais_vendidos: produtosMaisVendidos.rows,
      clientes_mais_compras: clientesMaisCompras.rows,
      produtos_estoque_baixo: produtosEstoqueBaixo.rows,
      vendas_recentes: vendasRecentes.rows,
      timestamp: new Date().toISOString()
    };

    res.json(dashboard);

  } catch (error) {
    console.error('❌ Erro ao buscar dados do dashboard:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível carregar as estatísticas do dashboard',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /dashboard/vendas-mensais
 * Retorna apenas vendas por mês
 */
router.get('/vendas-mensais', async (req, res) => {
  try {
    const vendasMensais = await pool.query(`
      SELECT
        TO_CHAR(data, 'YYYY-MM') as mes,
        COUNT(*) as total_vendas,
        SUM(valor_total) as valor_total
      FROM vendas
      WHERE data >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY TO_CHAR(data, 'YYYY-MM')
      ORDER BY mes DESC
    `);

    res.json(vendasMensais.rows);

  } catch (error) {
    console.error('❌ Erro ao buscar vendas mensais:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível carregar vendas mensais'
    });
  }
});

/**
 * GET /dashboard/produtos-populares
 * Retorna apenas produtos mais vendidos
 */
router.get('/produtos-populares', async (req, res) => {
  try {
    const produtosPopulares = await pool.query(`
      SELECT
        p.id,
        p.nome,
        p.preco,
        SUM(vp.quantidade) as total_vendido,
        COUNT(DISTINCT v.id) as total_vendas
      FROM produtos p
      INNER JOIN vendas_produtos vp ON p.id = vp.produto_id
      INNER JOIN vendas v ON vp.venda_id = v.id
      GROUP BY p.id, p.nome, p.preco
      ORDER BY total_vendido DESC
      LIMIT 20
    `);

    res.json(produtosPopulares.rows);

  } catch (error) {
    console.error('❌ Erro ao buscar produtos populares:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível carregar produtos populares'
    });
  }
});

/**
 * GET /dashboard/clientes-top
 * Retorna apenas clientes com mais compras
 */
router.get('/clientes-top', async (req, res) => {
  try {
    const clientesTop = await pool.query(`
      SELECT
        c.id,
        c.nome,
        c.email,
        COUNT(v.id) as total_compras,
        SUM(v.valor_total) as valor_total_gasto,
        AVG(v.valor_total) as ticket_medio
      FROM clientes c
      INNER JOIN vendas v ON c.id = v.cliente_id
      GROUP BY c.id, c.nome, c.email
      ORDER BY total_compras DESC, valor_total_gasto DESC
      LIMIT 20
    `);

    res.json(clientesTop.rows);

  } catch (error) {
    console.error('❌ Erro ao buscar clientes top:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível carregar clientes top'
    });
  }
});

module.exports = router;