/**
 * Configuração do Banco de Dados PostgreSQL
 * Pool de conexões para o sistema de vendas
 */

require('dotenv').config();
const { Pool } = require('pg');

// Configurações do banco de dados
const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'sistema_vendas',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
  max: 20, // máximo de conexões no pool
  idleTimeoutMillis: 30000, // tempo para fechar conexões inativas
  connectionTimeoutMillis: 2000, // tempo limite para conectar
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

// Criar pool de conexões
const pool = new Pool(dbConfig);

// Eventos do pool
pool.on('connect', () => {
  console.log('✅ Conectado ao PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erro no pool PostgreSQL:', err);
});

// Função para executar queries
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(\📊 Query executada em \ms: \...\);
    return res.rows;
  } catch (error) {
    console.error('❌ Erro na query:', error);
    throw error;
  }
};

// Função para fechar o pool
const closePool = async () => {
  await pool.end();
  console.log('🔒 Pool de conexões fechado');
};

module.exports = {
  query,
  closePool,
  pool
};
