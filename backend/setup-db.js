/**
 * Script de Setup do Banco de Dados Online
 * Executa as migrações e insere dados iniciais
 */

require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configurações do banco
const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'sistema_vendas',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

async function setupDatabase() {
  const pool = new Pool(dbConfig);
  
  try {
    console.log('🚀 Iniciando setup do banco de dados online...');
    console.log(\📡 Conectando em: \:\\);
    
    // Testar conexão
    await pool.query('SELECT NOW()');
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // Ler arquivo de migração
    const migrationPath = path.join(__dirname, 'migrations', 'init.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Executar migração
    console.log('📊 Executando migrações...');
    await pool.query(migrationSQL);
    
    // Inserir dados iniciais
    console.log('📝 Inserindo dados iniciais...');
    
    // Clientes
    await pool.query(\
      INSERT INTO clientes (nome, email, telefone) VALUES
      ('João Silva', 'joao@email.com', '(11) 99999-9999'),
      ('Maria Santos', 'maria@email.com', '(11) 88888-8888'),
      ('Pedro Oliveira', 'pedro@email.com', '(11) 77777-7777'),
      ('Ana Costa', 'ana@email.com', '(11) 66666-6666'),
      ('Carlos Ferreira', 'carlos@email.com', '(11) 55555-5555')
      ON CONFLICT (email) DO NOTHING
    \);
    
    // Produtos
    await pool.query(\
      INSERT INTO produtos (nome, preco, estoque, categoria) VALUES
      ('Smartphone Samsung', 899.90, 15, 'Eletrônicos'),
      ('Notebook Dell', 2500.00, 8, 'Eletrônicos'),
      ('Mesa de Escritório', 450.00, 25, 'Móveis'),
      ('Fone Bluetooth', 199.90, 3, 'Eletrônicos'),
      ('Cadeira Gamer', 650.00, 12, 'Móveis'),
      ('Monitor 24"', 800.00, 7, 'Eletrônicos'),
      ('Teclado Mecânico', 350.00, 20, 'Eletrônicos'),
      ('Mouse Gamer', 150.00, 18, 'Eletrônicos')
      ON CONFLICT DO NOTHING
    \);
    
    // Vendas
    await pool.query(\
      INSERT INTO vendas (data, valor_total, forma_pagamento, cliente_id) VALUES
      ('2024-01-15', 899.90, 'PIX', 1),
      ('2024-01-16', 2500.00, 'Cartão', 2),
      ('2024-01-17', 450.00, 'Dinheiro', 3),
      ('2024-01-18', 199.90, 'PIX', 4),
      ('2024-01-19', 650.00, 'Cartão', 5)
      ON CONFLICT DO NOTHING
    \);
    
    // Produtos das vendas
    await pool.query(\
      INSERT INTO vendas_produtos (venda_id, produto_id, quantidade, preco_unitario) VALUES
      (1, 1, 1, 899.90),
      (2, 2, 1, 2500.00),
      (3, 3, 1, 450.00),
      (4, 4, 1, 199.90),
      (5, 5, 1, 650.00)
      ON CONFLICT DO NOTHING
    \);
    
    console.log('✅ Setup do banco de dados concluído!');
    console.log('🎉 Seu sistema está pronto para usar!');
    
  } catch (error) {
    console.error('❌ Erro no setup do banco:', error.message);
    console.log('💡 Verifique suas configurações no arquivo .env');
  } finally {
    await pool.end();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;
