/**
 * Script de Teste de Conexão Railway
 * Testa a conexão com o banco PostgreSQL do Railway
 */

require('dotenv').config();
const { Pool } = require('pg');

async function testConnection() {
  console.log('🚂 Testando conexão com Railway PostgreSQL...');
  console.log(\📡 Host: \\);
  console.log(\🔌 Porta: \\);
  console.log(\🗄️ Banco: \\);
  console.log(\👤 Usuário: \\);
  
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // Testar conexão
    const result = await pool.query('SELECT NOW() as current_time, version() as postgres_version');
    console.log('✅ Conexão estabelecida com sucesso!');
    console.log(\⏰ Hora atual: \\);
    console.log(\🐘 PostgreSQL: \\);
    
    // Testar se as tabelas existem
    const tables = await pool.query(\
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    \);
    
    if (tables.rows.length > 0) {
      console.log('📊 Tabelas encontradas:');
      tables.rows.forEach(table => {
        console.log(\  - \\);
      });
    } else {
      console.log('📝 Nenhuma tabela encontrada. Execute o setup-db.js primeiro.');
    }
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
    console.log('💡 Verifique suas configurações no arquivo .env');
    console.log('🔗 Certifique-se de que o projeto Railway está ativo');
  } finally {
    await pool.end();
  }
}

testConnection();
