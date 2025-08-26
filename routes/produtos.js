const express = require('express');
const { body, validationResult } = require('express-validator');
const { query, getClient } = require('../config/database');
const router = express.Router();

// Middleware de validação
const validateProduto = [
  body('nome').trim().isLength({ min: 2, max: 120 }).withMessage('Nome deve ter entre 2 e 120 caracteres'),
  body('preco').isFloat({ min: 0.01 }).withMessage('Preço deve ser maior que zero'),
  body('estoque').isInt({ min: 0 }).withMessage('Estoque deve ser um número inteiro não negativo'),
  body('descricao').optional().isLength({ max: 1000 }).withMessage('Descrição deve ter no máximo 1000 caracteres')
];

// GET /api/produtos - Listar todos os produtos
router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 20, estoque_min } = req.query;
    const offset = (page - 1) * limit;
    
    let sql = 'SELECT * FROM produtos';
    let params = [];
    let whereConditions = [];
    
    if (search) {
      whereConditions.push(`(nome ILIKE $${params.length + 1} OR descricao ILIKE $${params.length + 1})`);
      params.push(`%${search}%`);
    }
    
    if (estoque_min !== undefined) {
      whereConditions.push(`estoque >= $${params.length + 1}`);
      params.push(parseInt(estoque_min));
    }
    
    if (whereConditions.length > 0) {
      sql += ' WHERE ' + whereConditions.join(' AND ');
    }
    
    sql += ' ORDER BY nome ASC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(parseInt(limit), offset);
    
    const result = await query(sql, params);
    
    // Contar total de registros
    let countSql = 'SELECT COUNT(*) FROM produtos';
    let countParams = [];
    
    if (whereConditions.length > 0) {
      countSql += ' WHERE ' + whereConditions.join(' AND ');
      // Criar novos parâmetros para a contagem (sem LIMIT e OFFSET)
      if (search) {
        countParams.push(`%${search}%`);
      }
      if (estoque_min !== undefined) {
        countParams.push(parseInt(estoque_min));
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
    console.error('Erro ao listar produtos:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// GET /api/produtos/:id - Buscar produto por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      'SELECT * FROM produtos WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Produto não encontrado' });
    }
    
    // Buscar histórico de vendas deste produto
    const vendasResult = await query(
      `SELECT v.id as venda_id, v.created_at, iv.quantidade, iv.preco_unit, iv.subtotal,
              c.nome as cliente_nome
       FROM itens_venda iv
       JOIN vendas v ON iv.venda_id = v.id
       JOIN clientes c ON v.cliente_id = c.id
       WHERE iv.produto_id = $1
       ORDER BY v.created_at DESC
       LIMIT 10`,
      [id]
    );
    
    const produto = result.rows[0];
    produto.historico_vendas = vendasResult.rows;
    
    res.json({ success: true, data: produto });
    
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// POST /api/produtos - Criar novo produto
router.post('/', validateProduto, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    
    const { nome, descricao, preco, estoque } = req.body;
    
    // Verificar se já existe produto com mesmo nome
    const existingResult = await query(
      'SELECT id FROM produtos WHERE nome ILIKE $1',
      [nome]
    );
    
    if (existingResult.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Já existe um produto com este nome' 
      });
    }
    
    const result = await query(
      `INSERT INTO produtos (nome, descricao, preco, estoque) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [nome, descricao, preco, estoque]
    );
    
    res.status(201).json({ 
      success: true, 
      message: 'Produto criado com sucesso',
      data: result.rows[0] 
    });
    
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// PUT /api/produtos/:id - Atualizar produto
router.put('/:id', validateProduto, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    
    const { id } = req.params;
    const { nome, descricao, preco, estoque } = req.body;
    
    // Verificar se produto existe
    const existingResult = await query(
      'SELECT id FROM produtos WHERE id = $1',
      [id]
    );
    
    if (existingResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Produto não encontrado' });
    }
    
    // Verificar se nome já existe em outro produto
    const duplicateResult = await query(
      'SELECT id FROM produtos WHERE nome ILIKE $1 AND id != $2',
      [nome, id]
    );
    
    if (duplicateResult.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Já existe outro produto com este nome' 
      });
    }
    
    const result = await query(
      `UPDATE produtos 
       SET nome = $1, descricao = $2, preco = $3, estoque = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 
       RETURNING *`,
      [nome, descricao, preco, estoque, id]
    );
    
    res.json({ 
      success: true, 
      message: 'Produto atualizado com sucesso',
      data: result.rows[0] 
    });
    
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// DELETE /api/produtos/:id - Excluir produto
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se produto tem vendas
    const vendasResult = await query(
      'SELECT COUNT(*) FROM itens_venda WHERE produto_id = $1',
      [id]
    );
    
    // Verificar se produto tem orçamentos
    const orcamentosResult = await query(
      'SELECT COUNT(*) FROM orcamento_itens WHERE produto_id = $1',
      [id]
    );
    
    const vendasCount = parseInt(vendasResult.rows[0].count);
    const orcamentosCount = parseInt(orcamentosResult.rows[0].count);
    
    if (vendasCount > 0 || orcamentosCount > 0) {
      let errorMessage = 'Não é possível excluir produto que está sendo usado em:';
      if (vendasCount > 0) {
        errorMessage += ` ${vendasCount} venda(s)`;
      }
      if (orcamentosCount > 0) {
        errorMessage += `${vendasCount > 0 ? ' e' : ' '} ${orcamentosCount} orçamento(s)`;
      }
      
      return res.status(400).json({ 
        success: false, 
        error: errorMessage 
      });
    }
    
    const result = await query(
      'DELETE FROM produtos WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Produto não encontrado' });
    }
    
    res.json({ 
      success: true, 
      message: 'Produto excluído com sucesso',
      data: result.rows[0] 
    });
    
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// PUT /api/produtos/:id/estoque - Atualizar apenas estoque
router.put('/:id/estoque', async (req, res) => {
  try {
    const { id } = req.params;
    const { estoque } = req.body;
    
    if (estoque === undefined || !Number.isInteger(estoque) || estoque < 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Estoque deve ser um número inteiro não negativo' 
      });
    }
    
    // Verificar se produto existe
    const existingResult = await query(
      'SELECT id FROM produtos WHERE id = $1',
      [id]
    );
    
    if (existingResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Produto não encontrado' });
    }
    
    const result = await query(
      `UPDATE produtos 
       SET estoque = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 
       RETURNING *`,
      [estoque, id]
    );
    
    res.json({ 
      success: true, 
      message: 'Estoque atualizado com sucesso',
      data: result.rows[0] 
    });
    
  } catch (error) {
    console.error('Erro ao atualizar estoque:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// GET /api/produtos/estoque/baixo - Produtos com estoque baixo
router.get('/estoque/baixo', async (req, res) => {
  try {
    const { limite = 10 } = req.query;
    
    const result = await query(
      `SELECT * FROM produtos 
       WHERE estoque <= $1 
       ORDER BY estoque ASC`,
      [parseInt(limite)]
    );
    
    res.json({ 
      success: true, 
      data: result.rows,
      total: result.rows.length
    });
    
  } catch (error) {
    console.error('Erro ao buscar produtos com estoque baixo:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// GET /api/produtos/relatorio/estoque - Relatório de estoque
router.get('/relatorio/estoque', async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        COUNT(*) as total_produtos,
        SUM(estoque) as total_estoque,
        AVG(preco) as preco_medio,
        COUNT(CASE WHEN estoque = 0 THEN 1 END) as produtos_sem_estoque,
        COUNT(CASE WHEN estoque <= 5 THEN 1 END) as produtos_estoque_baixo
      FROM produtos
    `);
    
    res.json({ 
      success: true, 
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('Erro ao gerar relatório de estoque:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

module.exports = router; 