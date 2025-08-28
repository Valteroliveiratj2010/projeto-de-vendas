const { Pool } = require('pg');
require('dotenv').config();

// Configuração da conexão com o banco PostgreSQL - FIXED
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'sistema_vendas_zc4o',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'sua_senha_aqui',
  max: 20, // Máximo de conexões no pool
  idleTimeoutMillis: 30000, // Tempo limite para conexões ociosas
  connectionTimeoutMillis: 2000, // Tempo limite para estabelecer conexão
});

// Log de configuração para debug
console.log('🔧 Configuração do banco:', {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'sistema_vendas_zc4o',
  user: process.env.DB_USER || 'postgres'
});

// Teste de conexão - FIXED VERSION
pool.on('connect', () => {
  console.log('✅ Conectado ao banco PostgreSQL - FIXED');
});

pool.on('error', (err) => {
  console.error('❌ Erro na conexão com o banco:', err);
});

// Função para executar queries
const query = (text, params) => pool.query(text, params);

// Função para obter cliente do pool
const getClient = () => pool.connect();

module.exports = {
  query,
  getClient,
  pool
}; 