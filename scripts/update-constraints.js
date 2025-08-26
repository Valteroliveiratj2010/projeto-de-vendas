const { pool } = require('../config/database');

async function updateConstraints() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Atualizando constraints de foreign key...');
    
    await client.query('BEGIN');
    
    // Remover constraints existentes
    console.log('🗑️ Removendo constraints existentes...');
    
    try {
      await client.query('ALTER TABLE vendas DROP CONSTRAINT IF EXISTS vendas_cliente_id_fkey');
    } catch (e) {
      console.log('⚠️ Constraint vendas_cliente_id_fkey não encontrada');
    }
    
    try {
      await client.query('ALTER TABLE orcamentos DROP CONSTRAINT IF EXISTS orcamentos_cliente_id_fkey');
    } catch (e) {
      console.log('⚠️ Constraint orcamentos_cliente_id_fkey não encontrada');
    }
    
    // Adicionar novas constraints com CASCADE
    console.log('➕ Adicionando novas constraints com CASCADE...');
    
    await client.query(`
      ALTER TABLE vendas 
      ADD CONSTRAINT vendas_cliente_id_fkey 
      FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
    `);
    
    await client.query(`
      ALTER TABLE orcamentos 
      ADD CONSTRAINT orcamentos_cliente_id_fkey 
      FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
    `);
    
    await client.query('COMMIT');
    
    console.log('✅ Constraints atualizadas com sucesso!');
    console.log('✅ Agora é possível excluir clientes com vendas/orçamentos');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro ao atualizar constraints:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  updateConstraints()
    .then(() => {
      console.log('✅ Script de atualização concluído!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro no script:', error);
      process.exit(1);
    });
}

module.exports = { updateConstraints }; 