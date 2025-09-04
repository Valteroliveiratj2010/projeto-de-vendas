const express = require('express');
const { body, validationResult } = require('express-validator');
const { query, getClient } = require('../config/database');
const router = express.Router();

// Middleware de validação
const validateCliente = [
  body('nome').trim().isLength({ min: 2, max: 150 }).withMessage('Nome deve ter entre 2 e 150 caracteres'),
  body('telefone').trim().isLength({ min: 10, max: 20 }).withMessage('Telefone deve ter entre 10 e 20 caracteres'),
  body('email').optional().isEmail().withMessage('Email deve ser válido'),
  body('documento').optional().isLength({ min: 11, max: 30 }).withMessage('Documento deve ter entre 11 e 30 caracteres')
];

// GET /api/clientes - Listar todos os clientes
router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    
    let sql = 'SELECT * FROM clientes';
    let params = [];
    
    if (search) {
      sql += ' WHERE nome ILIKE $1 OR email ILIKE $1 OR documento ILIKE $1';
      params.push(`%${search}%`);
    }
    
    // Se limit for 0 ou 'all', retornar todos os clientes sem paginação
    if (limit === '0' || limit === 'all' || limit === 0) {
      sql += ' ORDER BY nome ASC';
      
      const result = await query(sql, params);
      
      res.json({
        success: true,
        data: result.rows,
        pagination: {
          page: 1,
          limit: 'all',
          total: result.rows.length,
          pages: 1
        }
      });
      return;
    }
    
    // Paginação normal
    const offset = (page - 1) * limit;
    sql += ' ORDER BY nome ASC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(parseInt(limit), offset);
    
    const result = await query(sql, params);
    
    // Contar total de registros
    let countSql = 'SELECT COUNT(*) FROM clientes';
    let countParams = [];
    if (search) {
      countSql += ' WHERE nome ILIKE $1 OR email ILIKE $1 OR documento ILIKE $1';
      countParams.push(`%${search}%`);
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
    console.error('Erro ao listar clientes:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// GET /api/clientes/:id - Buscar cliente por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      'SELECT * FROM clientes WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Cliente não encontrado' });
    }
    
    // Buscar contadores de vendas e orçamentos
    const vendasCountResult = await query(
      'SELECT COUNT(*) as total FROM vendas WHERE cliente_id = $1',
      [id]
    );
    
    const orcamentosCountResult = await query(
      'SELECT COUNT(*) as total FROM orcamentos WHERE cliente_id = $1',
      [id]
    );
    
    // Buscar histórico de vendas
    const vendasResult = await query(
      `SELECT v.*, 
              COUNT(iv.id) as total_itens,
              COALESCE(SUM(p.valor_pago), 0) as total_pago
       FROM vendas v 
       LEFT JOIN itens_venda iv ON v.id = iv.venda_id
       LEFT JOIN pagamentos p ON v.id = p.venda_id
       WHERE v.cliente_id = $1 
       GROUP BY v.id
       ORDER BY v.created_at DESC`,
      [id]
    );
    
    // Buscar histórico de orçamentos
    const orcamentosResult = await query(
      'SELECT * FROM orcamentos WHERE cliente_id = $1 ORDER BY created_at DESC',
      [id]
    );
    
    const cliente = result.rows[0];
    cliente.total_vendas = parseInt(vendasCountResult.rows[0].total);
    cliente.total_orcamentos = parseInt(orcamentosCountResult.rows[0].total);
    cliente.vendas = vendasResult.rows;
    cliente.orcamentos = orcamentosResult.rows;
    
    res.json({ success: true, data: cliente });
    
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// POST /api/clientes - Criar novo cliente
router.post('/', validateCliente, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    
    const { nome, telefone, email, endereco, documento } = req.body;
    
    // Verificar se já existe cliente com mesmo documento
    if (documento) {
      const existingResult = await query(
        'SELECT id FROM clientes WHERE documento = $1',
        [documento]
      );
      
      if (existingResult.rows.length > 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'Já existe um cliente com este documento' 
        });
      }
    }
    
    const result = await query(
      `INSERT INTO clientes (nome, telefone, email, endereco, documento) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [nome, telefone, email, endereco, documento]
    );
    
    res.status(201).json({ 
      success: true, 
      message: 'Cliente criado com sucesso',
      data: result.rows[0] 
    });
    
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// PUT /api/clientes/:id - Atualizar cliente
router.put('/:id', validateCliente, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    
    const { id } = req.params;
    const { nome, telefone, email, endereco, documento } = req.body;
    
    // Verificar se cliente existe
    const existingResult = await query(
      'SELECT id FROM clientes WHERE id = $1',
      [id]
    );
    
    if (existingResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Cliente não encontrado' });
    }
    
    // Verificar se documento já existe em outro cliente
    if (documento) {
      const duplicateResult = await query(
        'SELECT id FROM clientes WHERE documento = $1 AND id != $2',
        [documento, id]
      );
      
      if (duplicateResult.rows.length > 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'Já existe outro cliente com este documento' 
        });
      }
    }
    
    const result = await query(
      `UPDATE clientes 
       SET nome = $1, telefone = $2, email = $3, endereco = $4, documento = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 
       RETURNING *`,
      [nome, telefone, email, endereco, documento, id]
    );
    
    res.json({ 
      success: true, 
      message: 'Cliente atualizado com sucesso',
      data: result.rows[0] 
    });
    
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// DELETE /api/clientes/:id - Excluir cliente
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se cliente existe
    const clienteResult = await query(
      'SELECT * FROM clientes WHERE id = $1',
      [id]
    );
    
    if (clienteResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Cliente não encontrado' });
    }
    
    const cliente = clienteResult.rows[0];
    
    // Iniciar transação para exclusão em cascata
    const client = await getClient();
    
    try {
      await client.query('BEGIN');
      
      // 1. Excluir pagamentos das vendas do cliente
      const pagamentosResult = await client.query(
        `DELETE FROM pagamentos 
         WHERE venda_id IN (SELECT id FROM vendas WHERE cliente_id = $1)`,
        [id]
      );
      console.log(`🗑️ Excluídos ${pagamentosResult.rowCount} pagamentos`);
      
      // 2. Excluir itens das vendas do cliente
      const itensVendaResult = await client.query(
        `DELETE FROM itens_venda 
         WHERE venda_id IN (SELECT id FROM vendas WHERE cliente_id = $1)`,
        [id]
      );
      console.log(`🗑️ Excluídos ${itensVendaResult.rowCount} itens de venda`);
      
      // 3. Excluir vendas do cliente
      const vendasResult = await client.query(
        'DELETE FROM vendas WHERE cliente_id = $1',
        [id]
      );
      console.log(`🗑️ Excluídas ${vendasResult.rowCount} vendas`);
      
      // 4. Excluir itens dos orçamentos do cliente
      const itensOrcamentoResult = await client.query(
        `DELETE FROM orcamento_itens 
         WHERE orcamento_id IN (SELECT id FROM orcamentos WHERE cliente_id = $1)`,
        [id]
      );
      console.log(`🗑️ Excluídos ${itensOrcamentoResult.rowCount} itens de orçamento`);
      
      // 5. Excluir orçamentos do cliente
      const orcamentosResult = await client.query(
        'DELETE FROM orcamentos WHERE cliente_id = $1',
        [id]
      );
      console.log(`🗑️ Excluídos ${orcamentosResult.rowCount} orçamentos`);
      
      // 6. Finalmente, excluir o cliente
      const clienteResult = await client.query(
        'DELETE FROM clientes WHERE id = $1 RETURNING *',
        [id]
      );
      
      // Commit da transação
      await client.query('COMMIT');
      
      console.log(`✅ Cliente ${cliente.nome} excluído com sucesso junto com todas as suas atividades`);
      
      res.json({ 
        success: true, 
        message: `Cliente ${cliente.nome} excluído com sucesso junto com todas as suas atividades`,
        data: {
          cliente: clienteResult.rows[0],
          resumo: {
            vendas_excluidas: vendasResult.rowCount,
            orcamentos_excluidos: orcamentosResult.rowCount,
            pagamentos_excluidos: pagamentosResult.rowCount,
            itens_venda_excluidos: itensVendaResult.rowCount,
            itens_orcamento_excluidos: itensOrcamentoResult.rowCount
          }
        }
      });
      
    } catch (transactionError) {
      // Rollback em caso de erro
      await client.query('ROLLBACK');
      throw transactionError;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor ao excluir cliente',
      details: error.message 
    });
  }
});

// GET /api/clientes/:id/vendas - Histórico de vendas do cliente
router.get('/:id/vendas', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      `SELECT v.*, 
              COUNT(iv.id) as total_itens,
              COALESCE(SUM(p.valor_pago), 0) as total_pago
       FROM vendas v 
       LEFT JOIN itens_venda iv ON v.id = iv.venda_id
       LEFT JOIN pagamentos p ON v.id = p.venda_id
       WHERE v.cliente_id = $1 
       GROUP BY v.id
       ORDER BY v.created_at DESC`,
      [id]
    );
    
    res.json({ success: true, data: result.rows });
    
  } catch (error) {
    console.error('Erro ao buscar vendas do cliente:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

module.exports = router; 