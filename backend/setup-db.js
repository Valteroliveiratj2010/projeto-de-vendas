const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false
  }
});

async function setupDatabase() {
  try {
    console.log('🔄 Iniciando configuração do banco de dados...');
    
    // Criar tabelas individualmente
    console.log('🔄 Criando tabelas...');
    
    // Tabela de Clientes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS clientes (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        telefone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Tabela de Produtos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS produtos (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        preco DECIMAL(10,2) NOT NULL,
        estoque INTEGER NOT NULL DEFAULT 0,
        categoria VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Tabela de Vendas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vendas (
        id SERIAL PRIMARY KEY,
        data DATE NOT NULL,
        valor_total DECIMAL(10,2) NOT NULL,
        forma_pagamento VARCHAR(20),
        cliente_id INTEGER REFERENCES clientes(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Tabela de Produtos por Venda
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vendas_produtos (
        id SERIAL PRIMARY KEY,
        venda_id INTEGER REFERENCES vendas(id) ON DELETE CASCADE,
        produto_id INTEGER REFERENCES produtos(id),
        quantidade INTEGER NOT NULL DEFAULT 1,
        preco_unitario DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Tabela de Orçamentos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orcamentos (
        id SERIAL PRIMARY KEY,
        data DATE NOT NULL,
        valor_total DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'Pendente',
        cliente_id INTEGER REFERENCES clientes(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Tabela de Produtos por Orçamento
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orcamentos_produtos (
        id SERIAL PRIMARY KEY,
        orcamento_id INTEGER REFERENCES orcamentos(id) ON DELETE CASCADE,
        produto_id INTEGER REFERENCES produtos(id),
        quantidade INTEGER NOT NULL DEFAULT 1,
        preco_unitario DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Tabelas criadas/verificadas com sucesso!');
    
    // Verificar se já existem dados
    const clientesCount = await pool.query('SELECT COUNT(*) FROM clientes');
    
    if (clientesCount.rows[0].count > 0) {
      console.log('ℹ️ Dados já existem no banco. Pulando inserção de dados de teste.');
      return;
    }
    
    console.log('�� Inserindo dados de teste...');
    
    // Inserir clientes de teste
    const clientes = [
      ['João Silva', 'joao@email.com', '(11) 99999-1111'],
      ['Maria Santos', 'maria@email.com', '(11) 99999-2222'],
      ['Pedro Oliveira', 'pedro@email.com', '(11) 99999-3333'],
      ['Ana Costa', 'ana@email.com', '(11) 99999-4444']
    ];
    
    for (const cliente of clientes) {
      await pool.query(
        'INSERT INTO clientes (nome, email, telefone) VALUES ($1, $2, $3)',
        cliente
      );
    }
    console.log('✅ Clientes inseridos!');
    
    // Inserir produtos de teste
    const produtos = [
      ['Notebook Dell', 2500.00, 10, 'Eletrônicos'],
      ['Mouse Wireless', 89.90, 50, 'Acessórios'],
      ['Teclado Mecânico', 199.90, 25, 'Acessórios'],
      ['Monitor 24"', 899.90, 15, 'Eletrônicos'],
      ['Webcam HD', 149.90, 30, 'Acessórios']
    ];
    
    for (const produto of produtos) {
      await pool.query(
        'INSERT INTO produtos (nome, preco, estoque, categoria) VALUES ($1, $2, $3, $4)',
        produto
      );
    }
    console.log('✅ Produtos inseridos!');
    
    // Inserir vendas de teste
    const vendas = [
      ['2024-01-15', 2589.90, 'Cartão', 1],
      ['2024-01-16', 1049.80, 'Dinheiro', 2],
      ['2024-01-17', 899.90, 'PIX', 3]
    ];
    
    for (const venda of vendas) {
      const result = await pool.query(
        'INSERT INTO vendas (data, valor_total, forma_pagamento, cliente_id) VALUES ($1, $2, $3, $4) RETURNING id',
        venda
      );
      
      const vendaId = result.rows[0].id;
      
      // Inserir produtos da venda
      if (vendaId === 1) {
        // Venda 1: Notebook + Mouse
        await pool.query(
          'INSERT INTO vendas_produtos (venda_id, produto_id, quantidade, preco_unitario) VALUES ($1, $2, $3, $4)',
          [vendaId, 1, 1, 2500.00]
        );
        await pool.query(
          'INSERT INTO vendas_produtos (venda_id, produto_id, quantidade, preco_unitario) VALUES ($1, $2, $3, $4)',
          [vendaId, 2, 1, 89.90]
        );
      } else if (vendaId === 2) {
        // Venda 2: Teclado + Webcam
        await pool.query(
          'INSERT INTO vendas_produtos (venda_id, produto_id, quantidade, preco_unitario) VALUES ($1, $2, $3, $4)',
          [vendaId, 3, 1, 199.90]
        );
        await pool.query(
          'INSERT INTO vendas_produtos (venda_id, produto_id, quantidade, preco_unitario) VALUES ($1, $2, $3, $4)',
          [vendaId, 5, 1, 149.90]
        );
      } else if (vendaId === 3) {
        // Venda 3: Monitor
        await pool.query(
          'INSERT INTO vendas_produtos (venda_id, produto_id, quantidade, preco_unitario) VALUES ($1, $2, $3, $4)',
          [vendaId, 4, 1, 899.90]
        );
      }
    }
    console.log('✅ Vendas inseridas!');
    
    console.log('🎉 Banco de dados configurado com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao configurar banco de dados:', error);
  } finally {
    await pool.end();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };