const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { Pool } = require('pg');

const dbConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    // Força a configuração SSL para a Render
    ssl: {
      rejectUnauthorized: false
    }
};

console.log('--- Configurações do Banco de Dados ---');
console.log('Host:', dbConfig.host);
console.log('User:', dbConfig.user);
console.log('Database:', dbConfig.database);
console.log('Port:', dbConfig.port);
console.log('Password:', dbConfig.password ? '********' : 'Senha não definida');
console.log('SSL Ativo:', !!dbConfig.ssl);
console.log('---------------------------------------');

const pool = new Pool(dbConfig);

// Conecta e testa a conexão para verificar se as credenciais estão corretas
pool.connect()
  .then(client => {
    console.log('✅ Conexão com o banco de dados estabelecida com sucesso!');
    client.release();
  })
  .catch(err => {
    console.error('❌ Erro ao conectar ao banco de dados:', err.stack);
    console.log('⚠️ Verifique as configurações no seu arquivo .env');
  });

const query = async (text, params) => {
    try {
        const start = Date.now();
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('✅ Query executada em', duration, 'ms:', { text, params, rows: res.rowCount });
        return res.rows;
    } catch (error) {
        console.error('❌ Erro na query:', error);
        throw error;
    }
};

module.exports = { query, pool };
