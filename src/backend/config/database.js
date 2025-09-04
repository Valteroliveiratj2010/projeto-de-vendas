const { Pool } = require('pg');
require('dotenv').config();

// Configuração da conexão com o banco PostgreSQL - MELHORADA
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'sistema_vendas',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'sua_senha_aqui',
  // SSL só para produção (Render), não para desenvolvimento local
  ...(process.env.NODE_ENV === 'production' && {
    ssl: {
      rejectUnauthorized: false
    }
  }),
  max: 20, // Máximo de conexões no pool
  idleTimeoutMillis: 30000, // Tempo limite para conexões ociosas
  connectionTimeoutMillis: 5000, // Aumentado para 5 segundos
  statement_timeout: 30000, // Timeout para queries
  query_timeout: 30000, // Timeout para queries
});

// Log de configuração para debug
console.log('🔧 Configuração do banco:', {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'sistema_vendas',
  user: process.env.DB_USER || 'postgres',
  ssl: process.env.NODE_ENV === 'production' ? 'Sim (produção)' : 'Não (desenvolvimento)'
});

// Teste de conexão - MELHORADO
pool.on('connect', () => {
  console.log('✅ Conectado ao banco PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erro na conexão com o banco:', err);
  // Não encerrar o processo, apenas logar o erro
});

// Função para executar queries com retry
const query = async (text, params) => {
  const maxRetries = 3;
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await pool.query(text, params);
    } catch (error) {
      lastError = error;
      console.warn(`⚠️ Tentativa ${i + 1} falhou:`, error.message);

      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }

  throw lastError;
};

// Função para obter cliente do pool
const getClient = () => pool.connect();

// Função para testar conexão
const testConnection = async () => {
  try {
    const result = await query('SELECT NOW()');
    console.log('✅ Teste de conexão com banco bem-sucedido');
    return true;
  } catch (error) {
    console.error('❌ Falha no teste de conexão com banco:', error.message);
    return false;
  }
};

module.exports = {
  query,
  getClient,
  pool,
  testConnection
}; 