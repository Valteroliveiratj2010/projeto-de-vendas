const express = require('express');
const { body, validationResult } = require('express-validator');
const { query, getClient } = require('../config/database');
const router = express.Router();

// Middleware de validação
const validateVenda = [
  body('cliente_id').isInt({ min: 1 }).withMessage('ID do cliente deve ser um número válido'),
  body('itens').isArray({ min: 1 }).withMessage('Venda deve ter pelo menos um item'),
  body('itens.*.produto_id').isInt({ min: 1 }).withMessage('ID do produto deve ser válido'),
  body('itens.*.quantidade').isInt({ min: 1 }).withMessage('Quantidade deve ser maior que zero'),
  body('itens.*.preco_unit').isFloat({ min: 0.01 }).withMessage('Preço unitário deve ser maior que zero')
];

// GET /api/vendas - Listar todas as vendas
router.get('/', async (req, res) => {
  try {
    const { search, status, cliente_id, page = 1, limit = 20, data_inicio, data_fim } = req.query;
    const offset = (page - 1) * limit;

    let sql = `
      SELECT v.*, c.nome as cliente_nome, c.telefone as cliente_telefone,
             COUNT(iv.id) as total_itens
      FROM vendas v
      JOIN clientes c ON v.cliente_id = c.id
      LEFT JOIN itens_venda iv ON v.id = iv.venda_id
    `;

    let params = [];
    let whereConditions = [];

    if (search) {
      whereConditions.push(`(c.nome ILIKE $${params.length + 1} OR c.documento ILIKE $${params.length + 1})`);
      params.push(`%${search}%`);
    }

    if (status) {
      whereConditions.push(`v.status = $${params.length + 1}`);
      params.push(status);
    }

    if (cliente_id) {
      whereConditions.push(`v.cliente_id = $${params.length + 1}`);
      params.push(parseInt(cliente_id));
    }

    if (data_inicio) {
      whereConditions.push(`v.created_at >= $${params.length + 1}`);
      params.push(data_inicio);
    }

    if (data_fim) {
      whereConditions.push(`v.created_at <= $${params.length + 1}`);
      params.push(data_fim);
    }

    if (whereConditions.length > 0) {
      sql += ' WHERE ' + whereConditions.join(' AND ');
    }

    sql += ` GROUP BY v.id, v.cliente_id, v.total, v.pago, v.saldo, v.status, v.created_at, v.updated_at, v.sync_status, v.observacoes, c.nome, c.telefone
             ORDER BY v.created_at DESC 
             LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), offset);

    const result = await query(sql, params);

    // Contar total de registros
    let countSql = `
      SELECT COUNT(DISTINCT v.id) 
      FROM vendas v
      JOIN clientes c ON v.cliente_id = c.id
    `;

    let countParams = [];

    if (whereConditions.length > 0) {
      countSql += ' WHERE ' + whereConditions.join(' AND ');
      // Criar novos parâmetros para a contagem (sem LIMIT e OFFSET)
      if (search) {
        countParams.push(`%${search}%`);
      }
      if (status) {
        countParams.push(status);
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
    console.error('Erro ao listar vendas:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// GET /api/vendas/:id - Buscar venda por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar dados da venda
    const vendaResult = await query(
      `SELECT v.*, c.nome as cliente_nome, c.telefone, c.email, c.endereco, c.documento
       FROM vendas v
       JOIN clientes c ON v.cliente_id = c.id
       WHERE v.id = $1`,
      [id]
    );

    if (vendaResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Venda não encontrada' });
    }

    // Buscar itens da venda
    const itensResult = await query(
      `SELECT iv.*, p.nome as produto_nome, p.descricao
       FROM itens_venda iv
       JOIN produtos p ON iv.produto_id = p.id
       WHERE iv.venda_id = $1`,
      [id]
    );

    // Buscar pagamentos da venda
    const pagamentosResult = await query(
      'SELECT * FROM pagamentos WHERE venda_id = $1 ORDER BY data_pagto ASC',
      [id]
    );

    const venda = vendaResult.rows[0];
    venda.itens = itensResult.rows;
    venda.pagamentos = pagamentosResult.rows;

    res.json({ success: true, data: venda });

  } catch (error) {
    console.error('Erro ao buscar venda:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// POST /api/vendas - Criar nova venda
router.post('/', validateVenda, async (req, res) => {
  const client = await getClient();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { cliente_id, itens, observacoes } = req.body;

    await client.query('BEGIN');

    // Verificar se cliente existe
    const clienteResult = await client.query(
      'SELECT id FROM clientes WHERE id = $1',
      [cliente_id]
    );

    if (clienteResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Cliente não encontrado' });
    }

    // Verificar estoque e calcular total
    let total = 0;
    const itensValidados = [];

    for (const item of itens) {
      const produtoResult = await client.query(
        'SELECT id, nome, preco, estoque FROM produtos WHERE id = $1',
        [item.produto_id]
      );

      if (produtoResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ success: false, error: `Produto ${item.produto_id} não encontrado` });
      }

      const produto = produtoResult.rows[0];

      if (produto.estoque < item.quantidade) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          error: `Estoque insuficiente para ${produto.nome}. Disponível: ${produto.estoque}, Solicitado: ${item.quantidade}`
        });
      }

      const subtotal = item.quantidade * item.preco_unit;
      total += subtotal;

      itensValidados.push({
        produto_id: item.produto_id,
        quantidade: item.quantidade,
        preco_unit: item.preco_unit,
        subtotal,
        produto_nome: produto.nome
      });
    }

    // Criar venda
    const vendaResult = await client.query(
      `INSERT INTO vendas (cliente_id, total, saldo, observacoes) 
       VALUES ($1, $2, $2, $3) 
       RETURNING *`,
      [cliente_id, total, observacoes]
    );

    const venda = vendaResult.rows[0];

    // Inserir itens da venda
    for (const item of itensValidados) {
      await client.query(
        `INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unit, subtotal) 
         VALUES ($1, $2, $3, $4, $5)`,
        [venda.id, item.produto_id, item.quantidade, item.preco_unit, item.subtotal]
      );

      // Atualizar estoque
      await client.query(
        'UPDATE produtos SET estoque = estoque - $1 WHERE id = $2',
        [item.quantidade, item.produto_id]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Venda criada com sucesso',
      data: {
        ...venda,
        itens: itensValidados
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar venda:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  } finally {
    client.release();
  }
});

// PUT /api/vendas/:id - Editar venda existente
router.put('/:id', validateVenda, async (req, res) => {
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
    const { cliente_id, itens, observacoes } = req.body;

    await client.query('BEGIN');

    // Verificar se a venda existe
    const vendaResult = await client.query(
      'SELECT id, status FROM vendas WHERE id = $1',
      [id]
    );

    if (vendaResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Venda não encontrada' });
    }

    const vendaAtual = vendaResult.rows[0];

    // Verificar se a venda pode ser editada (não pode estar cancelada)
    if (vendaAtual.status === 'cancelado') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: 'Não é possível editar uma venda cancelada'
      });
    }

    // Verificar se cliente existe
    const clienteResult = await client.query(
      'SELECT id FROM clientes WHERE id = $1',
      [cliente_id]
    );

    if (clienteResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Cliente não encontrado' });
    }

    // Buscar itens atuais da venda para devolver ao estoque
    const itensAtuais = await client.query(
      'SELECT produto_id, quantidade FROM itens_venda WHERE venda_id = $1',
      [id]
    );

    // Devolver produtos ao estoque
    for (const item of itensAtuais.rows) {
      await client.query(
        'UPDATE produtos SET estoque = estoque + $1 WHERE id = $2',
        [item.quantidade, item.produto_id]
      );
    }

    // Verificar estoque e calcular novo total
    let total = 0;
    const itensValidados = [];

    for (const item of itens) {
      const produtoResult = await client.query(
        'SELECT id, nome, preco, estoque FROM produtos WHERE id = $1',
        [item.produto_id]
      );

      if (produtoResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ success: false, error: `Produto ${item.produto_id} não encontrado` });
      }

      const produto = produtoResult.rows[0];

      if (produto.estoque < item.quantidade) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          error: `Estoque insuficiente para ${produto.nome}. Disponível: ${produto.estoque}, Solicitado: ${item.quantidade}`
        });
      }

      const subtotal = item.quantidade * item.preco_unit;
      total += subtotal;

      itensValidados.push({
        produto_id: item.produto_id,
        quantidade: item.quantidade,
        preco_unit: item.preco_unit,
        subtotal
      });
    }

    // Buscar pagamentos existentes
    const pagamentosResult = await client.query(
      'SELECT COALESCE(SUM(valor_pago), 0) as total_pago FROM pagamentos WHERE venda_id = $1',
      [id]
    );

    const totalPago = parseFloat(pagamentosResult.rows[0].total_pago) || 0;
    const saldo = total - totalPago;

    // Determinar novo status
    let novoStatus = 'Pendente';
    if (saldo === 0) {
      novoStatus = 'Pago';
    } else if (totalPago > 0) {
      novoStatus = 'Parcial';
    }

    // Atualizar venda
    const vendaUpdatedResult = await client.query(
      `UPDATE vendas 
       SET cliente_id = $1, total = $2, pago = $3, saldo = $4, status = $5, 
           observacoes = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 
       RETURNING *`,
      [cliente_id, total, totalPago, saldo, novoStatus, observacoes || '', id]
    );

    // Remover itens atuais
    await client.query('DELETE FROM itens_venda WHERE venda_id = $1', [id]);

    // Inserir novos itens e atualizar estoque
    for (const item of itensValidados) {
      // Inserir item
      await client.query(
        `INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unit, subtotal) 
         VALUES ($1, $2, $3, $4, $5)`,
        [id, item.produto_id, item.quantidade, item.preco_unit, item.subtotal]
      );

      // Atualizar estoque
      await client.query(
        'UPDATE produtos SET estoque = estoque - $1 WHERE id = $2',
        [item.quantidade, item.produto_id]
      );
    }

    await client.query('COMMIT');

    // Buscar venda atualizada com dados completos
    const vendaCompleta = await client.query(
      `SELECT v.*, c.nome as cliente_nome, c.telefone, c.email 
       FROM vendas v
       JOIN clientes c ON v.cliente_id = c.id
       WHERE v.id = $1`,
      [id]
    );

    res.json({
      success: true,
      message: 'Venda atualizada com sucesso',
      data: vendaCompleta.rows[0]
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao editar venda:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  } finally {
    client.release();
  }
});

// PUT /api/vendas/:id/status - Atualizar status da venda
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Pendente', 'Parcial', 'Pago'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Status deve ser: Pendente, Parcial ou Pago'
      });
    }

    // Verificar se venda existe
    const existingResult = await query(
      'SELECT id FROM vendas WHERE id = $1',
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Venda não encontrada' });
    }

    const result = await query(
      `UPDATE vendas 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 
       RETURNING *`,
      [status, id]
    );

    res.json({
      success: true,
      message: 'Status da venda atualizado com sucesso',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Erro ao atualizar status da venda:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// DELETE /api/vendas/:id - Cancelar venda
router.delete('/:id', async (req, res) => {
  const client = await getClient();

  try {
    const { id } = req.params;

    await client.query('BEGIN');

    // Verificar se venda existe
    const vendaResult = await client.query(
      'SELECT id, status FROM vendas WHERE id = $1',
      [id]
    );

    if (vendaResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Venda não encontrada' });
    }

    const venda = vendaResult.rows[0];

    if (venda.status === 'Pago') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: 'Não é possível cancelar uma venda já paga'
      });
    }

    // Buscar itens da venda para restaurar estoque
    const itensResult = await client.query(
      'SELECT produto_id, quantidade FROM itens_venda WHERE venda_id = $1',
      [id]
    );

    // Restaurar estoque
    for (const item of itensResult.rows) {
      await client.query(
        'UPDATE produtos SET estoque = estoque + $1 WHERE id = $2',
        [item.quantidade, item.produto_id]
      );
    }

    // Excluir pagamentos (cascade)
    await client.query('DELETE FROM pagamentos WHERE venda_id = $1', [id]);

    // Excluir itens da venda (cascade)
    await client.query('DELETE FROM itens_venda WHERE venda_id = $1', [id]);

    // Excluir venda
    const result = await client.query(
      'DELETE FROM vendas WHERE id = $1 RETURNING *',
      [id]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Venda cancelada com sucesso',
      data: result.rows[0]
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao cancelar venda:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  } finally {
    client.release();
  }
});

// GET /api/vendas/relatorio/resumo - Relatório resumido de vendas
router.get('/relatorio/resumo', async (req, res) => {
  try {
    const { data_inicio, data_fim } = req.query;

    let whereClause = '';
    let params = [];

    if (data_inicio && data_fim) {
      whereClause = 'WHERE created_at BETWEEN $1 AND $2';
      params = [data_inicio, data_fim];
    }

    const result = await query(`
      SELECT 
        COUNT(*) as total_vendas,
        SUM(total) as valor_total_vendas,
        SUM(pago) as valor_total_pago,
        SUM(saldo) as valor_total_saldo,
        COUNT(CASE WHEN status = 'Pago' THEN 1 END) as vendas_pagas,
        COUNT(CASE WHEN status = 'Parcial' THEN 1 END) as vendas_parciais,
        COUNT(CASE WHEN status = 'Pendente' THEN 1 END) as vendas_pendentes,
        AVG(total) as ticket_medio
      FROM vendas
      ${whereClause}
    `, params);

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Erro ao gerar relatório de vendas:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// GET /api/vendas/relatorio/formas-pagamento - Relatório de formas de pagamento
router.get('/relatorio/formas-pagamento', async (req, res) => {
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
        p.forma_pagamento,
        COUNT(*) as quantidade,
        SUM(p.valor_pago) as valor_total
      FROM pagamentos p
      JOIN vendas v ON p.venda_id = v.id
      ${whereClause}
      GROUP BY p.forma_pagamento
      ORDER BY quantidade DESC
    `, params);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Erro ao gerar relatório de formas de pagamento:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

module.exports = router; 