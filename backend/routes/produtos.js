const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// POST /produtos - Criar novo produto
router.post('/', async (req, res) => {
  try {
    const { nome, preco, estoque } = req.body;
    
    if (!nome || !preco) {
      return res.status(400).json({ error: 'Nome e preço são obrigatórios' });
    }

    if (preco < 0) {
      return res.status(400).json({ error: 'Preço deve ser maior ou igual a zero' });
    }

    if (estoque < 0) {
      return res.status(400).json({ error: 'Estoque deve ser maior ou igual a zero' });
    }

    const query = `
      INSERT INTO produtos (nome, preco, estoque) 
      VALUES ($1, $2, $3) 
      RETURNING *
    `;
    
    const result = await pool.query(query, [nome, preco, estoque || 0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /produtos - Listar todos os produtos
router.get('/', async (req, res) => {
  try {
    const query = 'SELECT * FROM produtos ORDER BY nome';
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /produtos/:id - Buscar produto por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'SELECT * FROM produtos WHERE id = $1';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /produtos/:id - Atualizar produto
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, preco, estoque } = req.body;
    
    if (!nome || !preco) {
      return res.status(400).json({ error: 'Nome e preço são obrigatórios' });
    }

    if (preco < 0) {
      return res.status(400).json({ error: 'Preço deve ser maior ou igual a zero' });
    }

    if (estoque < 0) {
      return res.status(400).json({ error: 'Estoque deve ser maior ou igual a zero' });
    }

    const query = `
      UPDATE produtos 
      SET nome = $1, preco = $2, estoque = $3, updated_at = NOW()
      WHERE id = $4 
      RETURNING *
    `;
    
    const result = await pool.query(query, [nome, preco, estoque, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /produtos/:id - Deletar produto
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'DELETE FROM produtos WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    res.json({ message: 'Produto deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
