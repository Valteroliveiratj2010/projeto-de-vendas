const express = require('express');
const { body, validationResult } = require('express-validator');
const { getClient, query } = require('../config/database');

const router = express.Router();

// Middleware de validação para orçamento
const validateOrcamento = [
  body('cliente_id').isInt().withMessage('ID do cliente deve ser um número inteiro'),
  body('itens').isArray({ min: 1 }).withMessage('Orçamento deve ter pelo menos um item'),
  body('itens.*.produto_id').isInt().withMessage('ID do produto deve ser um número inteiro'),
  body('itens.*.quantidade').isInt({ min: 1 }).withMessage('Quantidade deve ser maior que zero'),
  body('itens.*.preco_unit').isFloat({ min: 0.01 }).withMessage('Preço unitário deve ser maior que zero'),
  body('validade').isISO8601().withMessage('Data de validade deve ser uma data válida'),
  body('observacoes').optional().isString().withMessage('Observações devem ser texto')
];

// GET /api/orcamentos - Listar orçamentos
router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 20, status, cliente_id } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let sql = `
      SELECT o.*, c.nome as cliente_nome, c.telefone as cliente_telefone,
             COUNT(oi.id) as total_itens
      FROM orcamentos o
      JOIN clientes c ON o.cliente_id = c.id
      LEFT JOIN orcamento_itens oi ON o.id = oi.orcamento_id
    `;
    
    let params = [];
    let whereConditions = [];
    
    if (search) {
      whereConditions.push(`(c.nome ILIKE $${params.length + 1} OR c.documento ILIKE $${params.length + 1})`);
      params.push(`%${search}%`);
    }
    
    if (status) {
      whereConditions.push(`o.status = $${params.length + 1}`);
      params.push(status);
    }
    
    if (cliente_id) {
      whereConditions.push(`o.cliente_id = $${params.length + 1}`);
      params.push(parseInt(cliente_id));
    }
    
    if (whereConditions.length > 0) {
      sql += ' WHERE ' + whereConditions.join(' AND ');
    }
    
    sql += ` GROUP BY o.id, o.cliente_id, o.total, o.validade, o.status, o.created_at, o.updated_at, o.sync_status, o.observacoes, c.nome, c.telefone
             ORDER BY o.created_at DESC 
             LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), offset);
    
    const result = await query(sql, params);
    
    // Contar total de registros
    let countSql = `
      SELECT COUNT(DISTINCT o.id) 
      FROM orcamentos o
      JOIN clientes c ON o.cliente_id = c.id
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
    console.error('Erro ao listar orçamentos:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// GET /api/orcamentos/:id - Buscar orçamento por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar dados do orçamento
    const orcamentoResult = await query(
      `SELECT o.*, c.nome as cliente_nome, c.telefone, c.email, c.endereco, c.documento
       FROM orcamentos o
       JOIN clientes c ON o.cliente_id = c.id
       WHERE o.id = $1`,
      [id]
    );
    
    if (orcamentoResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Orçamento não encontrado' });
    }
    
    // Buscar itens do orçamento
    const itensResult = await query(
      `SELECT oi.*, p.nome as produto_nome, p.descricao
       FROM orcamento_itens oi
       JOIN produtos p ON oi.produto_id = p.id
       WHERE oi.orcamento_id = $1`,
      [id]
    );
    
    const orcamento = orcamentoResult.rows[0];
    orcamento.itens = itensResult.rows;
    
    res.json({ success: true, data: orcamento });
    
  } catch (error) {
    console.error('Erro ao buscar orçamento:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// POST /api/orcamentos - Criar novo orçamento
router.post('/', validateOrcamento, async (req, res) => {
  const client = await getClient();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    
    const { cliente_id, itens, validade, observacoes } = req.body;
    
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
        subtotal
      });
    }
    
    // Criar orçamento
    const orcamentoResult = await client.query(
      `INSERT INTO orcamentos (cliente_id, total, validade, observacoes)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [cliente_id, total, validade, observacoes || '']
    );
    
    const orcamento = orcamentoResult.rows[0];
    
    // Inserir itens do orçamento
    for (const item of itensValidados) {
      await client.query(
        `INSERT INTO orcamento_itens (orcamento_id, produto_id, quantidade, preco_unit, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
        [orcamento.id, item.produto_id, item.quantidade, item.preco_unit, item.subtotal]
      );
    }
    
    await client.query('COMMIT');
    
    res.status(201).json({ 
      success: true, 
      message: 'Orçamento criado com sucesso',
      data: orcamento
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar orçamento:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  } finally {
    client.release();
  }
});

// PUT /api/orcamentos/:id - Atualizar orçamento
router.put('/:id', async (req, res) => {
  const client = await getClient();
  
  try {
    const { id } = req.params;
    const { status, converter_para_venda, cliente_id, itens, validade, observacoes } = req.body;
    
    // Verificar se orçamento existe
    const orcamentoResult = await client.query(
      'SELECT o.*, c.nome as cliente_nome FROM orcamentos o JOIN clientes c ON o.cliente_id = c.id WHERE o.id = $1',
      [id]
    );
    
    if (orcamentoResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Orçamento não encontrado' });
    }
    
    const orcamento = orcamentoResult.rows[0];
    
    // Se for para converter em venda
    if (converter_para_venda && status === 'aprovado') {
      await client.query('BEGIN');
      
      try {
        // Buscar itens do orçamento
        const itensResult = await client.query(
          'SELECT * FROM orcamento_itens WHERE orcamento_id = $1',
          [id]
        );
        
        if (itensResult.rows.length === 0) {
          throw new Error('Orçamento não possui itens para converter');
        }
        
        // Verificar estoque
        for (const item of itensResult.rows) {
          const produtoResult = await client.query(
            'SELECT estoque FROM produtos WHERE id = $1',
            [item.produto_id]
          );
          
          if (produtoResult.rows[0].estoque < item.quantidade) {
            throw new Error(`Estoque insuficiente para o produto ID ${item.produto_id}`);
          }
        }
        
        // Criar venda
        const vendaResult = await client.query(
          `INSERT INTO vendas (cliente_id, total, pago, saldo, status, observacoes, created_at, updated_at)
           VALUES ($1, $2, 0, $2, 'Pendente', $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
           RETURNING id`,
          [orcamento.cliente_id, orcamento.total, `Convertido do orçamento #${orcamento.id}`]
        );
        
        const vendaId = vendaResult.rows[0].id;
        
        // Inserir itens da venda
        for (const item of itensResult.rows) {
          await client.query(
            `INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unit, subtotal)
             VALUES ($1, $2, $3, $4, $5)`,
            [vendaId, item.produto_id, item.quantidade, item.preco_unit, item.subtotal]
          );
          
          // Atualizar estoque
          await client.query(
            'UPDATE produtos SET estoque = estoque - $1 WHERE id = $2',
            [item.quantidade, item.produto_id]
          );
        }
        
        // Atualizar status do orçamento
        await client.query(
          'UPDATE orcamentos SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          ['Convertido', id]
        );
        
        await client.query('COMMIT');
        
        res.json({ 
          success: true, 
          message: 'Orçamento convertido para venda com sucesso!',
          venda_id: vendaId
        });
        
        return;
        
      } catch (conversionError) {
        await client.query('ROLLBACK');
        throw conversionError;
      }
    }
    
    // Validação para atualização normal
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    
    // Não permitir editar orçamentos convertidos
    if (orcamento.status === 'Convertido') {
      return res.status(400).json({ 
        success: false, 
        error: 'Não é possível editar orçamento já convertido em venda' 
      });
    }
    
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
        subtotal
      });
    }
    
    // Atualizar orçamento
    await client.query(
      `UPDATE orcamentos 
       SET cliente_id = $1, total = $2, validade = $3, observacoes = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5`,
      [cliente_id, total, validade, observacoes || '', id]
    );
    
    // Remover itens antigos
    await client.query('DELETE FROM orcamento_itens WHERE orcamento_id = $1', [id]);
    
    // Inserir novos itens
    for (const item of itensValidados) {
      await client.query(
        `INSERT INTO orcamento_itens (orcamento_id, produto_id, quantidade, preco_unit, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, item.produto_id, item.quantidade, item.preco_unit, item.subtotal]
      );
    }
    
    await client.query('COMMIT');
    
    res.json({ 
      success: true, 
      message: 'Orçamento atualizado com sucesso' 
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao atualizar orçamento:', error);
    res.status(500).json({ success: false, error: error.message || 'Erro interno do servidor' });
  } finally {
    client.release();
  }
});

// DELETE /api/orcamentos/:id - Excluir orçamento
router.delete('/:id', async (req, res) => {
  const client = await getClient();
  
  try {
    const { id } = req.params;
    
    await client.query('BEGIN');
    
    // Verificar se orçamento existe
    const orcamentoResult = await client.query(
      'SELECT id, status FROM orcamentos WHERE id = $1',
      [id]
    );
    
    if (orcamentoResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Orçamento não encontrado' });
    }
    
    const orcamento = orcamentoResult.rows[0];
    
    // Não permitir excluir orçamentos convertidos
    if (orcamento.status === 'Convertido') {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        error: 'Não é possível excluir orçamento já convertido em venda' 
      });
    }
    
    // Remover itens do orçamento
    await client.query('DELETE FROM orcamento_itens WHERE orcamento_id = $1', [id]);
    
    // Remover orçamento
    await client.query('DELETE FROM orcamentos WHERE id = $1', [id]);
    
    await client.query('COMMIT');
    
    res.json({ 
      success: true, 
      message: 'Orçamento excluído com sucesso' 
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao excluir orçamento:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  } finally {
    client.release();
  }
});

// POST /api/orcamentos/:id/convert - Converter orçamento em venda
router.post('/:id/convert', async (req, res) => {
  const client = await getClient();
  
  try {
    const { id } = req.params;
    
    await client.query('BEGIN');
    
    // Verificar se orçamento existe e não foi convertido
    const orcamentoResult = await client.query(
      'SELECT * FROM orcamentos WHERE id = $1',
      [id]
    );
    
    if (orcamentoResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Orçamento não encontrado' });
    }
    
    const orcamento = orcamentoResult.rows[0];
    
    if (orcamento.status === 'Convertido') {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        error: 'Orçamento já foi convertido em venda' 
      });
    }
    
    // Buscar itens do orçamento
    const itensResult = await client.query(
      'SELECT * FROM orcamento_itens WHERE orcamento_id = $1',
      [id]
    );
    
    if (itensResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        error: 'Orçamento não possui itens' 
      });
    }
    
    // Verificar estoque
    for (const item of itensResult.rows) {
      const produtoResult = await client.query(
        'SELECT estoque FROM produtos WHERE id = $1',
        [item.produto_id]
      );
      
      if (produtoResult.rows[0].estoque < item.quantidade) {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          success: false, 
          error: 'Estoque insuficiente para converter orçamento em venda' 
        });
      }
    }
    
    // Criar venda
    const vendaResult = await client.query(
      `INSERT INTO vendas (cliente_id, total, pago, saldo, observacoes)
       VALUES ($1, $2, 0, $2, $3)
       RETURNING *`,
      [orcamento.cliente_id, orcamento.total, orcamento.observacoes]
    );
    
    const venda = vendaResult.rows[0];
    
    // Inserir itens da venda
    for (const item of itensResult.rows) {
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
    
    // Marcar orçamento como convertido
    await client.query(
      'UPDATE orcamentos SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['Convertido', id]
    );
    
    await client.query('COMMIT');
    
    res.json({ 
      success: true, 
      message: 'Orçamento convertido em venda com sucesso',
      data: {
        venda_id: venda.id,
        orcamento_id: id
      }
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao converter orçamento:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  } finally {
    client.release();
  }
});

module.exports = router; 