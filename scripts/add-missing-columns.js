const { pool } = require('../config/database');

// SQL para adicionar colunas faltantes
const addMissingColumnsSQL = `
-- Adicionar coluna observacoes na tabela vendas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vendas' AND column_name = 'observacoes'
    ) THEN
        ALTER TABLE vendas ADD COLUMN observacoes TEXT;
        RAISE NOTICE 'Coluna observacoes adicionada à tabela vendas';
    ELSE
        RAISE NOTICE 'Coluna observacoes já existe na tabela vendas';
    END IF;
END $$;

-- Adicionar coluna observacoes na tabela orcamentos
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orcamentos' AND column_name = 'observacoes'
    ) THEN
        ALTER TABLE orcamentos ADD COLUMN observacoes TEXT;
        RAISE NOTICE 'Coluna observacoes adicionada à tabela orcamentos';
    ELSE
        RAISE NOTICE 'Coluna observacoes já existe na tabela orcamentos';
    END IF;
END $$;
`;

// Função para adicionar as colunas faltantes
async function addMissingColumns() {
  try {
    console.log('🔧 Adicionando colunas faltantes...');
    
    // Adicionar colunas
    await pool.query(addMissingColumnsSQL);
    console.log('✅ Colunas faltantes adicionadas com sucesso!');
    
    console.log('🎉 Banco de dados atualizado com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao adicionar colunas:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  addMissingColumns();
}

module.exports = { addMissingColumns }; 