const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// POST /vendas - Criar nova venda com itens
router.post('/', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('=== INÍCIO DA CRIAÇÃO DE VENDA ===');
    console.log('Dados recebidos:', JSON.stringify(req.body, null, 2));
    
    const { cliente_id, forma_pagamento, itens } = req.body;
    
    console.log('Cliente ID:', cliente_id, typeof cliente_id);
    console.log('Forma de pagamento:', forma_pagamento, typeof forma_pagamento);
    console.log('Itens:', JSON.stringify(itens, null, 2));
    console.log('Quantidade de itens:', itens ? itens.length : 'undefined');
    
    if (!cliente_id || !forma_pagamento || !itens || itens.length === 0) {
      console.log('❌ ERRO: Campos obrigatórios não preenchidos');
      console.log('cliente_id válido:', !!cliente_id);
      console.log('forma_pagamento válida:', !!forma_pagamento);
      console.log('itens válidos:', !!(itens && itens.length > 0));
      return res.status(400).json({ error: 'Cliente, forma de pagamento e itens são obrigatórios' });
    }

    // Verificar se cliente existe
    console.log('🔍 Verificando se cliente existe...');
    const clienteQuery = 'SELECT id FROM clientes WHERE id = $1';
    const clienteResult = await client.query(clienteQuery, [cliente_id]);
    console.log('Resultado da consulta do cliente:', clienteResult.rows);
    
    if (clienteResult.rows.length === 0) {
      console.log('❌ Cliente não encontrado');
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    console.log('✅ Cliente encontrado');

    // Criar venda
    console.log('🔄 Criando venda...');
    const vendaQuery = `
      INSERT INTO vendas (cliente_id, forma_pagamento, data) 
      VALUES ($1, $2, CURRENT_DATE) 
      RETURNING *
    `;
    
    const vendaResult = await client.query(vendaQuery, [cliente_id, forma_pagamento]);
    const venda = vendaResult.rows[0];
    console.log('✅ Venda criada:', venda);

    let valorTotal = 0;

    // Processar itens da venda
    console.log('🔄 Processando itens da venda...');
    for (let i = 0; i < itens.length; i++) {
      const item = itens[i];
      console.log(`\n--- Processando item ${i + 1}/${itens.length} ---`);
      console.log('Item:', JSON.stringify(item, null, 2));
      
      const { produto_id, quantidade } = item;
      
      console.log('produto_id:', produto_id, typeof produto_id);
      console.log('quantidade:', quantidade, typeof quantidade);
      
      if (!produto_id || !quantidade || quantidade <= 0) {
        console.log('❌ ERRO: Produto e quantidade são obrigatórios');
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Produto e quantidade são obrigatórios' });
      }

      // Verificar produto e estoque
      console.log('🔍 Verificando produto e estoque...');
      const produtoQuery = 'SELECT * FROM produtos WHERE id = $1';
      const produtoResult = await client.query(produtoQuery, [produto_id]);
      console.log('Resultado da consulta do produto:', produtoResult.rows);
      
      if (produtoResult.rows.length === 0) {
        console.log('❌ Produto não encontrado');
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      const produto = produtoResult.rows[0];
      console.log('✅ Produto encontrado:', produto.nome);
      console.log('Estoque disponível:', produto.estoque);
      console.log('Quantidade solicitada:', quantidade);
      
      if (produto.estoque < quantidade) {
        console.log('❌ Estoque insuficiente');
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Estoque insuficiente para o produto ${produto.nome}` });
      }

      // Criar item da venda
      console.log('🔄 Criando item da venda...');
      const itemQuery = `
        INSERT INTO vendas_produtos (venda_id, produto_id, quantidade, preco_unitario) 
        VALUES ($1, $2, $3, $4) 
        RETURNING *
      `;
      
      const itemResult = await client.query(itemQuery, [venda.id, produto_id, quantidade, produto.preco]);
      const itemCriado = itemResult.rows[0];
      console.log('✅ Item criado:', itemCriado);
      
      const subtotal = itemCriado.quantidade * itemCriado.preco_unitario;
      valorTotal += subtotal;
      console.log('Subtotal do item:', subtotal);
      console.log('Valor total acumulado:', valorTotal);

      // Atualizar estoque
      console.log('🔄 Atualizando estoque...');
      const updateEstoqueQuery = `
        UPDATE produtos 
        SET estoque = estoque - $1
        WHERE id = $2
      `;
      
      await client.query(updateEstoqueQuery, [quantidade, produto_id]);
      console.log('✅ Estoque atualizado');
    }

    // Atualizar valor total da venda
    console.log('🔄 Atualizando valor total da venda...');
    console.log('Valor total final:', valorTotal);
    const updateVendaQuery = `
      UPDATE vendas 
      SET valor_total = $1
      WHERE id = $2
    `;
    
    await client.query(updateVendaQuery, [valorTotal, venda.id]);
    console.log('✅ Valor total atualizado');

    await client.query('COMMIT');
    console.log('✅ Transação commitada');
    
    // Buscar venda completa com itens
    console.log('🔄 Buscando venda completa...');
    const vendaCompletaQuery = `
      SELECT v.*, c.nome as cliente_nome,
             json_agg(
               json_build_object(
                 'id', vp.id,
                 'produto_id', vp.produto_id,
                 'produto_nome', p.nome,
                 'quantidade', vp.quantidade,
                 'preco_unitario', vp.preco_unitario,
                 'subtotal', (vp.quantidade * vp.preco_unitario)
               )
             ) as produtos
      FROM vendas v
      JOIN clientes c ON v.cliente_id = c.id
      JOIN vendas_produtos vp ON v.id = vp.venda_id
      JOIN produtos p ON vp.produto_id = p.id
      WHERE v.id = $1
      GROUP BY v.id, c.nome
    `;
    
    const vendaCompleta = await client.query(vendaCompletaQuery, [venda.id]);
    console.log('✅ Venda completa:', JSON.stringify(vendaCompleta.rows[0], null, 2));
    
    console.log('=== VENDA CRIADA COM SUCESSO ===');
    res.status(201).json(vendaCompleta.rows[0]);
    
  } catch (error) {
    console.log('❌ ERRO na criação da venda:', error);
    await client.query('ROLLBACK');
    console.error('Erro ao criar venda:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  } finally {
    client.release();
    console.log('�� Cliente de conexão liberado');
  }
});

// GET /vendas - Listar todas as vendas com produtos
router.get('/', async (req, res) => {
  try {
    console.log('=== LISTANDO VENDAS ===');
    const query = `
      SELECT v.*, c.nome as cliente_nome,
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', vp.id,
                   'produto_id', vp.produto_id,
                   'produto_nome', p.nome,
                   'quantidade', vp.quantidade,
                   'preco_unitario', vp.preco_unitario,
                   'subtotal', (vp.quantidade * vp.preco_unitario)
                 )
               ) FILTER (WHERE vp.id IS NOT NULL),
               '[]'::json
             ) as produtos
      FROM vendas v
      JOIN clientes c ON v.cliente_id = c.id
      LEFT JOIN vendas_produtos vp ON v.id = vp.venda_id
      LEFT JOIN produtos p ON vp.produto_id = p.id
      GROUP BY v.id, c.nome
      ORDER BY v.data DESC
    `;
    const result = await pool.query(query);
    console.log('✅ Vendas encontradas:', result.rows.length);
    console.log('Primeira venda:', result.rows[0] ? JSON.stringify(result.rows[0], null, 2) : 'Nenhuma venda');
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Erro ao listar vendas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /vendas/:id - Buscar venda por ID com itens
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('=== BUSCANDO VENDA POR ID ===');
    console.log('ID solicitado:', id);
    
    const query = `
      SELECT v.*, c.nome as cliente_nome,
             json_agg(
               json_build_object(
                 'id', vp.id,
                 'produto_id', vp.produto_id,
                 'produto_nome', p.nome,
                 'quantidade', vp.quantidade,
                 'preco_unitario', vp.preco_unitario,
                 'subtotal', (vp.quantidade * vp.preco_unitario)
               )
             ) as produtos
      FROM vendas v
      JOIN clientes c ON v.cliente_id = c.id
      JOIN vendas_produtos vp ON v.id = vp.venda_id
      JOIN produtos p ON vp.produto_id = p.id
      WHERE v.id = $1
      GROUP BY v.id, c.nome
    `;
    
    const result = await pool.query(query, [id]);
    console.log('Resultado da busca:', result.rows.length > 0 ? 'Encontrada' : 'Não encontrada');
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Venda não encontrada' });
    }
    
    console.log('✅ Venda encontrada:', JSON.stringify(result.rows[0], null, 2));
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Erro ao buscar venda:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /vendas/:id - Atualizar venda
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { cliente_id, forma_pagamento } = req.body;
    
    console.log('=== ATUALIZANDO VENDA ===');
    console.log('ID da venda:', id);
    console.log('Dados recebidos:', req.body);
    
    if (!cliente_id || !forma_pagamento) {
      console.log('❌ Campos obrigatórios não preenchidos');
      return res.status(400).json({ error: 'Cliente e forma de pagamento são obrigatórios' });
    }

    // Verificar se cliente existe
    console.log('🔍 Verificando se cliente existe...');
    const clienteQuery = 'SELECT id FROM clientes WHERE id = $1';
    const clienteResult = await pool.query(clienteQuery, [cliente_id]);
    
    if (clienteResult.rows.length === 0) {
      console.log('❌ Cliente não encontrado');
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    console.log('✅ Cliente encontrado');

    const query = `
      UPDATE vendas 
      SET cliente_id = $1, forma_pagamento = $2
      WHERE id = $3 
      RETURNING *
    `;
    
    const result = await pool.query(query, [cliente_id, forma_pagamento, id]);
    
    if (result.rows.length === 0) {
      console.log('❌ Venda não encontrada para atualização');
      return res.status(404).json({ error: 'Venda não encontrada' });
    }
    
    console.log('✅ Venda atualizada:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Erro ao atualizar venda:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /vendas/:id - Deletar venda (cascade deleta itens)
router.delete('/:id', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    console.log('=== DELETANDO VENDA ===');
    console.log('ID da venda:', id);
    
    // Buscar itens da venda para restaurar estoque
    console.log('🔍 Buscando itens da venda...');
    const itensQuery = `
      SELECT vp.produto_id, vp.quantidade 
      FROM vendas_produtos vp 
      WHERE vp.venda_id = $1
    `;
    
    const itensResult = await client.query(itensQuery, [id]);
    console.log('Itens encontrados:', itensResult.rows.length);
    
    // Restaurar estoque dos produtos
    console.log('🔄 Restaurando estoque...');
    for (const item of itensResult.rows) {
      console.log(`Restaurando ${item.quantidade} unidades do produto ${item.produto_id}`);
      const restoreQuery = `
        UPDATE produtos 
        SET estoque = estoque + $1
        WHERE id = $2
      `;
      
      await client.query(restoreQuery, [item.quantidade, item.produto_id]);
    }
    console.log('✅ Estoque restaurado');
    
    // Deletar venda (cascade deleta itens)
    console.log('🔄 Deletando venda...');
    const deleteQuery = 'DELETE FROM vendas WHERE id = $1 RETURNING *';
    const result = await client.query(deleteQuery, [id]);
    
    if (result.rows.length === 0) {
      console.log('❌ Venda não encontrada para exclusão');
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Venda não encontrada' });
    }
    
    await client.query('COMMIT');
    console.log('✅ Venda deletada com sucesso');
    res.json({ message: 'Venda deletada com sucesso' });
    
  } catch (error) {
    console.log('❌ ERRO na exclusão da venda:', error);
    await client.query('ROLLBACK');
    console.error('Erro ao deletar venda:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  } finally {
    client.release();
    console.log('�� Cliente de conexão liberado');
  }
});

module.exports = router;