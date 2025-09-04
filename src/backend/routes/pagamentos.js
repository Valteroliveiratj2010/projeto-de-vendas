const express = require('express');
const { body, validationResult } = require('express-validator');
const { query, getClient } = require('../config/database');
const router = express.Router();

// Middleware de validação
const validatePagamento = [
  body('venda_id').isInt({ min: 1 }).withMessage('ID da venda deve ser um número válido'),
  body('valor_pago').isFloat({ min: 0.01 }).withMessage('Valor do pagamento deve ser maior que zero'),
  body('forma_pagamento').optional().isLength({ min: 1, max: 50 }).withMessage('Forma de pagamento deve ter entre 1 e 50 caracteres'),
  body('observacoes').optional().isLength({ max: 1000 }).withMessage('Observações devem ter no máximo 1000 caracteres')
];

// GET /api/pagamentos - Listar todos os pagamentos
router.get('/', async (req, res) => {
  try {
    const { venda_id, cliente_id, page = 1, limit = 20, data_inicio, data_fim } = req.query;
    const offset = (page - 1) * limit;

    let sql = `
      SELECT p.*, v.total as venda_total, v.saldo as venda_saldo, v.status as venda_status,
             c.nome as cliente_nome, c.telefone as cliente_telefone
      FROM pagamentos p
      JOIN vendas v ON p.venda_id = v.id
      JOIN clientes c ON v.cliente_id = c.id
    `;

    let params = [];
    let whereConditions = [];

    if (venda_id) {
      whereConditions.push(`p.venda_id = $${params.length + 1}`);
      params.push(parseInt(venda_id));
    }

    if (cliente_id) {
      whereConditions.push(`v.cliente_id = $${params.length + 1}`);
      params.push(parseInt(cliente_id));
    }

    if (data_inicio) {
      whereConditions.push(`p.data_pagto >= $${params.length + 1}`);
      params.push(data_inicio);
    }

    if (data_fim) {
      whereConditions.push(`p.data_pagto <= $${params.length + 1}`);
      params.push(data_fim);
    }

    if (whereConditions.length > 0) {
      sql += ' WHERE ' + whereConditions.join(' AND ');
    }

    sql += ` ORDER BY p.data_pagto DESC 
             LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), offset);

    const result = await query(sql, params);

    // Contar total de registros
    let countSql = `
      SELECT COUNT(*) 
      FROM pagamentos p
      JOIN vendas v ON p.venda_id = v.id
      JOIN clientes c ON v.cliente_id = c.id
    `;

    let countParams = [];

    if (whereConditions.length > 0) {
      countSql += ' WHERE ' + whereConditions.join(' AND ');
      // Criar novos parâmetros para a contagem (sem LIMIT e OFFSET)
      if (venda_id) {
        countParams.push(parseInt(venda_id));
      }
      if (cliente_id) {
        countParams.push(parseInt(cliente_id));
      }
      if (data_inicio) {
        countParams.push(data_inicio);
      }
      if (data_fim) {
        countParams.push(data_fim);
      }
    }

    const countResult = await query(countSql, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Erro ao listar pagamentos:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// GET /api/pagamentos/:id - Buscar pagamento por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT p.*, v.total as venda_total, v.saldo as venda_saldo, v.status as venda_status,
              c.nome as cliente_nome, c.telefone as cliente_telefone, c.email as cliente_email
       FROM pagamentos p
       JOIN vendas v ON p.venda_id = v.id
       JOIN clientes c ON v.cliente_id = c.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Pagamento não encontrado' });
    }

    res.json({ success: true, data: result.rows[0] });

  } catch (error) {
    console.error('Erro ao buscar pagamento:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// GET /api/pagamentos/venda/:id - Buscar pagamentos de uma venda específica
router.get('/venda/:id', async (req, res) => {
  const client = await getClient();

  try {
    const vendaId = parseInt(req.params.id);
    console.log(`🔍 Buscando pagamentos para venda ID: ${vendaId}`);

    if (!vendaId || vendaId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'ID da venda deve ser um número válido'
      });
    }

    // Primeiro, verificar se a venda existe
    const vendaCheck = await client.query(
      'SELECT id FROM vendas WHERE id = $1',
      [vendaId]
    );

    if (vendaCheck.rows.length === 0) {
      console.log(`❌ Venda ${vendaId} não encontrada`);
      return res.status(404).json({
        success: false,
        error: 'Venda não encontrada'
      });
    }

    console.log(`✅ Venda ${vendaId} encontrada, buscando pagamentos...`);

    const result = await client.query(`
      SELECT 
        p.id,
        p.venda_id,
        p.valor_pago as valor,
        p.forma_pagamento as metodo_pagamento,
        p.data_pagto as data_pagamento,
        p.observacoes,
        'confirmado' as status,
        p.created_at,
        p.updated_at
      FROM pagamentos p
      WHERE p.venda_id = $1
      ORDER BY p.data_pagto DESC
    `, [vendaId]);

    console.log(`📊 Pagamentos encontrados para venda ${vendaId}:`, result.rows.length);
    console.log('📋 Dados dos pagamentos:', result.rows);

    res.json(result.rows);

  } catch (error) {
    console.error('❌ Erro ao buscar pagamentos da venda:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor ao buscar pagamentos',
      details: error.message
    });
  } finally {
    client.release();
  }
});

// POST /api/pagamentos - Registrar novo pagamento
router.post('/', validatePagamento, async (req, res) => {
  const client = await getClient();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { venda_id, valor_pago, forma_pagamento, observacoes } = req.body;

    await client.query('BEGIN');

    // Verificar se venda existe e buscar dados
    const vendaResult = await client.query(
      'SELECT id, total, pago, saldo, status FROM vendas WHERE id = $1',
      [venda_id]
    );

    if (vendaResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Venda não encontrada' });
    }

    const venda = vendaResult.rows[0];

    // Verificar se o pagamento não excede o saldo
    if (valor_pago > venda.saldo) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: `Valor do pagamento (${valor_pago}) não pode exceder o saldo devedor (${venda.saldo})`
      });
    }

    // Inserir pagamento
    const pagamentoResult = await client.query(
      `INSERT INTO pagamentos (venda_id, valor_pago, forma_pagamento, observacoes, data_pagto, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
       RETURNING *`,
      [venda_id, valor_pago, forma_pagamento || 'Dinheiro', observacoes || '']
    );

    // Calcular total pago baseado em todos os pagamentos existentes + novo pagamento
    const pagamentosExistentes = await client.query(
      'SELECT COALESCE(SUM(valor_pago), 0) as total_pago FROM pagamentos WHERE venda_id = $1',
      [venda_id]
    );

    const totalPagoExistentes = parseFloat(pagamentosExistentes.rows[0].total_pago) || 0;
    const novoPago = totalPagoExistentes;
    const novoSaldo = parseFloat(venda.total) - novoPago;

    // Determinar novo status
    let novoStatus = 'Pendente';
    if (novoSaldo === 0) {
      novoStatus = 'Pago';
    } else if (novoPago > 0) {
      novoStatus = 'Parcial';
    }

    await client.query(
      `UPDATE vendas 
       SET pago = $1, saldo = $2, status = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [novoPago, novoSaldo, novoStatus, venda_id]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Pagamento registrado com sucesso',
      data: {
        pagamento: pagamentoResult.rows[0],
        venda_atualizada: {
          id: venda_id,
          pago: novoPago,
          saldo: novoSaldo,
          status: novoStatus
        }
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao registrar pagamento:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  } finally {
    client.release();
  }
});

// PUT /api/pagamentos/:id - Atualizar pagamento
router.put('/:id', validatePagamento, async (req, res) => {
  const client = await getClient();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { valor_pago, observacoes } = req.body;

    await client.query('BEGIN');

    // Verificar se pagamento existe
    const pagamentoResult = await client.query(
      'SELECT id, venda_id, valor_pago FROM pagamentos WHERE id = $1',
      [id]
    );

    if (pagamentoResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Pagamento não encontrado' });
    }

    const pagamento = pagamentoResult.rows[0];
    const diferenca = valor_pago - pagamento.valor_pago;

    // Buscar dados da venda
    const vendaResult = await client.query(
      'SELECT id, total, pago, saldo, status FROM vendas WHERE id = $1',
      [pagamento.venda_id]
    );

    const venda = vendaResult.rows[0];

    // Verificar se a alteração não excede o saldo
    if (diferenca > venda.saldo + pagamento.valor_pago) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: 'Alteração do pagamento excederia o saldo devedor'
      });
    }

    // Atualizar pagamento
    await client.query(
      `UPDATE pagamentos 
       SET valor_pago = $1, observacoes = $2
       WHERE id = $3`,
      [valor_pago, observacoes, id]
    );

    // Recalcular venda
    const novoPago = venda.pago - pagamento.valor_pago + valor_pago;
    const novoSaldo = venda.total - novoPago;

    let novoStatus = 'Pendente';
    if (novoSaldo === 0) {
      novoStatus = 'Pago';
    } else if (novoPago > 0) {
      novoStatus = 'Parcial';
    }

    await client.query(
      `UPDATE vendas 
       SET pago = $1, saldo = $2, status = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [novoPago, novoSaldo, novoStatus, pagamento.venda_id]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Pagamento atualizado com sucesso',
      data: {
        pagamento: { ...pagamento, valor_pago, observacoes },
        venda_atualizada: {
          id: pagamento.venda_id,
          pago: novoPago,
          saldo: novoSaldo,
          status: novoStatus
        }
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao atualizar pagamento:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  } finally {
    client.release();
  }
});

// DELETE /api/pagamentos/:id - Excluir pagamento
router.delete('/:id', async (req, res) => {
  const client = await getClient();

  try {
    const { id } = req.params;

    await client.query('BEGIN');

    // Verificar se pagamento existe
    const pagamentoResult = await client.query(
      'SELECT id, venda_id, valor_pago FROM pagamentos WHERE id = $1',
      [id]
    );

    if (pagamentoResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Pagamento não encontrado' });
    }

    const pagamento = pagamentoResult.rows[0];

    // Buscar dados da venda
    const vendaResult = await client.query(
      'SELECT id, total, pago, saldo, status FROM vendas WHERE id = $1',
      [pagamento.venda_id]
    );

    const venda = vendaResult.rows[0];

    // Recalcular venda
    const novoPago = venda.pago - pagamento.valor_pago;
    const novoSaldo = venda.total - novoPago;

    let novoStatus = 'Pendente';
    if (novoSaldo === 0) {
      novoStatus = 'Pago';
    } else if (novoPago > 0) {
      novoStatus = 'Parcial';
    }

    // Atualizar venda
    await client.query(
      `UPDATE vendas 
       SET pago = $1, saldo = $2, status = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [novoPago, novoSaldo, novoStatus, pagamento.venda_id]
    );

    // Excluir pagamento
    const result = await client.query(
      'DELETE FROM pagamentos WHERE id = $1 RETURNING *',
      [id]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Pagamento excluído com sucesso',
      data: {
        pagamento: result.rows[0],
        venda_atualizada: {
          id: pagamento.venda_id,
          pago: novoPago,
          saldo: novoSaldo,
          status: novoStatus
        }
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao excluir pagamento:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  } finally {
    client.release();
  }
});

// GET /api/pagamentos/relatorio/resumo - Relatório resumido de pagamentos
router.get('/relatorio/resumo', async (req, res) => {
  try {
    const { data_inicio, data_fim } = req.query;

    let whereClause = '';
    let params = [];

    if (data_inicio && data_fim) {
      whereClause = 'WHERE p.data_pagto BETWEEN $1 AND $2';
      params = [data_inicio, data_fim];
    }

    const result = await query(`
      SELECT 
        COUNT(*) as total_pagamentos,
        SUM(p.valor_pago) as valor_total_pago,
        AVG(p.valor_pago) as valor_medio_pagamento,
        COUNT(DISTINCT p.venda_id) as vendas_com_pagamento,
        COUNT(DISTINCT v.cliente_id) as clientes_com_pagamento
      FROM pagamentos p
      JOIN vendas v ON p.venda_id = v.id
      ${whereClause}
    `, params);

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Erro ao gerar relatório de pagamentos:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

module.exports = router; 