const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// POST /orcamentos - Criar novo orçamento
router.post('/', async (req, res) => {
  try {
    const { cliente_id, valor_total, status = 'Pendente' } = req.body;
    
    if (!cliente_id || !valor_total) {
      return res.status(400).json({ error: 'Cliente e valor total são obrigatórios' });
    }

    if (valor_total < 0) {
      return res.status(400).json({ error: 'Valor total deve ser maior ou igual a zero' });
    }

    // Verificar se cliente existe
    const clienteQuery = 'SELECT id FROM clientes WHERE id = $1';
    const clienteResult = await pool.query(clienteQuery, [cliente_id]);
    
    if (clienteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    const query = `
      INSERT INTO orcamentos (cliente_id, valor_total, data, status) 
      VALUES ($1, $2, CURRENT_DATE, $3) 
      RETURNING *
    `;
    
    const result = await pool.query(query, [cliente_id, valor_total, status]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar orçamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /orcamentos - Listar todos os orçamentos
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT o.*, c.nome as cliente_nome
      FROM orcamentos o
      JOIN clientes c ON o.cliente_id = c.id
      ORDER BY o.data DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar orçamentos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /orcamentos/:id - Buscar orçamento por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT o.*, c.nome as cliente_nome, c.telefone, c.email
      FROM orcamentos o
      JOIN clientes c ON o.cliente_id = c.id
      WHERE o.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Orçamento não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar orçamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /orcamentos/:id - Atualizar orçamento
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { cliente_id, valor_total, status } = req.body;
    
    if (!cliente_id || !valor_total) {
      return res.status(400).json({ error: 'Cliente e valor total são obrigatórios' });
    }

    if (valor_total < 0) {
      return res.status(400).json({ error: 'Valor total deve ser maior ou igual a zero' });
    }

    // Verificar se cliente existe
    const clienteQuery = 'SELECT id FROM clientes WHERE id = $1';
    const clienteResult = await pool.query(clienteQuery, [cliente_id]);
    
    if (clienteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    const query = `
      UPDATE orcamentos 
      SET cliente_id = $1, valor_total = $2, status = $3, updated_at = NOW()
      WHERE id = $4 
      RETURNING *
    `;
    
    const result = await pool.query(query, [cliente_id, valor_total, status, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Orçamento não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar orçamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /orcamentos/:id - Deletar orçamento
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'DELETE FROM orcamentos WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Orçamento não encontrado' });
    }
    
    res.json({ message: 'Orçamento deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar orçamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;