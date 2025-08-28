const { Pool } = require('pg');
require('dotenv').config();

// Configuração da conexão com o banco PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'sistema_vendas_6a8n',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'sua_senha_aqui',
  // SSL só para produção (Render), não para desenvolvimento local
  ...(process.env.NODE_ENV === 'production' && {
    ssl: {
      rejectUnauthorized: false
    }
  }),
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// SQL para atualizar a tabela pagamentos
const updatePagamentosTableSQL = `
-- Adicionar colunas faltantes na tabela pagamentos
ALTER TABLE pagamentos 
ADD COLUMN IF NOT EXISTS forma_pagamento VARCHAR(50) DEFAULT 'Dinheiro',
ADD COLUMN IF NOT EXISTS observacoes TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Atualizar registros existentes com valores padrão
UPDATE pagamentos 
SET forma_pagamento = COALESCE(forma_pagamento, 'Dinheiro'),
    observacoes = COALESCE(observacoes, ''),
    created_at = COALESCE(created_at, data_pagto),
    updated_at = COALESCE(updated_at, data_pagto)
WHERE forma_pagamento IS NULL 
   OR observacoes IS NULL 
   OR created_at IS NULL 
   OR updated_at IS NULL;
`;

// Função para atualizar a tabela pagamentos
async function updatePagamentosTable() {
  try {
    console.log('🔧 Atualizando tabela pagamentos...');
    
    // Executar as alterações
    await pool.query(updatePagamentosTableSQL);
    console.log('✅ Tabela pagamentos atualizada com sucesso!');
    
    // Verificar a estrutura atual
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'pagamentos' 
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Estrutura atual da tabela pagamentos:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    console.log('🎉 Atualização concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao atualizar tabela pagamentos:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  updatePagamentosTable();
}

module.exports = { updatePagamentosTable }; 