const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// POST /vendas - Criar nova venda com itens
router.post('/', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { cliente_id, forma_pagamento, itens } = req.body;
    
    if (!cliente_id || !forma_pagamento || !itens || itens.length === 0) {
      return res.status(400).json({ error: 'Cliente, forma de pagamento e itens são obrigatórios' });
    }

    // Verificar se cliente existe
    const clienteQuery = 'SELECT id FROM clientes WHERE id = $1';
    const clienteResult = await client.query(clienteQuery, [cliente_id]);
    
    if (clienteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    // Criar venda
    const vendaQuery = `
      INSERT INTO vendas (cliente_id, forma_pagamento) 
      VALUES ($1, $2) 
      RETURNING *
    `;
    
    const vendaResult = await client.query(vendaQuery, [cliente_id, forma_pagamento]);
    const venda = vendaResult.rows[0];

    let valorTotal = 0;

    // Processar itens da venda
    for (const item of itens) {
      const { produto_id, quantidade } = item;
      
      if (!produto_id || !quantidade || quantidade <= 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Produto e quantidade são obrigatórios' });
      }

      // Verificar produto e estoque
      const produtoQuery = 'SELECT * FROM produtos WHERE id = $1';
      const produtoResult = await client.query(produtoQuery, [produto_id]);
      
      if (produtoResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      const produto = produtoResult.rows[0];
      
      if (produto.estoque < quantidade) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Estoque insuficiente para o produto ${produto.nome}` });
      }

      // Criar item da venda
      const itemQuery = `
        INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unitario) 
        VALUES ($1, $2, $3, $4) 
        RETURNING *
      `;
      
      const itemResult = await client.query(itemQuery, [venda.id, produto_id, quantidade, produto.preco]);
      valorTotal += itemResult.rows[0].subtotal;

      // Atualizar estoque
      const updateEstoqueQuery = `
        UPDATE produtos 
        SET estoque = estoque - $1, updated_at = NOW()
        WHERE id = $2
      `;
      
      await client.query(updateEstoqueQuery, [quantidade, produto_id]);
    }

    // Atualizar valor total da venda
    const updateVendaQuery = `
      UPDATE vendas 
      SET valor_total = $1, updated_at = NOW()
      WHERE id = $2
    `;
    
    await client.query(updateVendaQuery, [valorTotal, venda.id]);

    await client.query('COMMIT');
    
    // Buscar venda completa com itens
    const vendaCompletaQuery = `
      SELECT v.*, c.nome as cliente_nome,
             json_agg(
               json_build_object(
                 'id', iv.id,
                 'produto_id', iv.produto_id,
                 'produto_nome', p.nome,
                 'quantidade', iv.quantidade,
                 'preco_unitario', iv.preco_unitario,
                 'subtotal', iv.subtotal
               )
             ) as itens
      FROM vendas v
      JOIN clientes c ON v.cliente_id = c.id
      JOIN itens_venda iv ON v.id = iv.venda_id
      JOIN produtos p ON iv.produto_id = p.id
      WHERE v.id = $1
      GROUP BY v.id, c.nome
    `;
    
    const vendaCompleta = await client.query(vendaCompletaQuery, [venda.id]);
    
    res.status(201).json(vendaCompleta.rows[0]);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar venda:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  } finally {
    client.release();
  }
});

// GET /vendas - Listar todas as vendas
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT v.*, c.nome as cliente_nome
      FROM vendas v
      JOIN clientes c ON v.cliente_id = c.id
      ORDER BY v.data DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar vendas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /vendas/:id - Buscar venda por ID com itens
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT v.*, c.nome as cliente_nome,
             json_agg(
               json_build_object(
                 'id', iv.id,
                 'produto_id', iv.produto_id,
                 'produto_nome', p.nome,
                 'quantidade', iv.quantidade,
                 'preco_unitario', iv.preco_unitario,
                 'subtotal', iv.subtotal
               )
             ) as itens
      FROM vendas v
      JOIN clientes c ON v.cliente_id = c.id
      JOIN itens_venda iv ON v.id = iv.venda_id
      JOIN produtos p ON iv.produto_id = p.id
      WHERE v.id = $1
      GROUP BY v.id, c.nome
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Venda não encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar venda:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /vendas/:id - Atualizar venda
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { cliente_id, forma_pagamento } = req.body;
    
    if (!cliente_id || !forma_pagamento) {
      return res.status(400).json({ error: 'Cliente e forma de pagamento são obrigatórios' });
    }

    // Verificar se cliente existe
    const clienteQuery = 'SELECT id FROM clientes WHERE id = $1';
    const clienteResult = await pool.query(clienteQuery, [cliente_id]);
    
    if (clienteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    const query = `
      UPDATE vendas 
      SET cliente_id = $1, forma_pagamento = $2, updated_at = NOW()
      WHERE id = $3 
      RETURNING *
    `;
    
    const result = await pool.query(query, [cliente_id, forma_pagamento, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Venda não encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar venda:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /vendas/:id - Deletar venda (cascade deleta itens)
router.delete('/:id', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    
    // Buscar itens da venda para restaurar estoque
    const itensQuery = `
      SELECT iv.produto_id, iv.quantidade 
      FROM itens_venda iv 
      WHERE iv.venda_id = $1
    `;
    
    const itensResult = await client.query(itensQuery, [id]);
    
    // Restaurar estoque dos produtos
    for (const item of itensResult.rows) {
      const restoreQuery = `
        UPDATE produtos 
        SET estoque = estoque + $1, updated_at = NOW()
        WHERE id = $2
      `;
      
      await client.query(restoreQuery, [item.quantidade, item.produto_id]);
    }
    
    // Deletar venda (cascade deleta itens)
    const deleteQuery = 'DELETE FROM vendas WHERE id = $1 RETURNING *';
    const result = await client.query(deleteQuery, [id]);
    
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Venda não encontrada' });
    }
    
    await client.query('COMMIT');
    res.json({ message: 'Venda deletada com sucesso' });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao deletar venda:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  } finally {
    client.release();
  }
});

module.exports = router;
