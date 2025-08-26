const { pool } = require('../config/database');

// Função para limpar dados de teste
async function cleanTestData() {
  const client = await pool.connect();
  
  try {
    console.log('🧹 Limpando dados de teste...');
    
    await client.query('BEGIN');
    
    // 1. Excluir itens de venda do Monitor LG 24"
    console.log('📋 Excluindo itens de venda...');
    const itensVendaResult = await client.query(
      'DELETE FROM itens_venda WHERE produto_id IN (SELECT id FROM produtos WHERE nome ILIKE $1) RETURNING *',
      ['%Monitor LG 24%']
    );
    console.log(`✅ ${itensVendaResult.rows.length} item(s) de venda excluído(s)`);
    
    // 2. Excluir vendas vazias (sem itens)
    console.log('🛒 Excluindo vendas vazias...');
    const vendasVaziasResult = await client.query(
      `DELETE FROM vendas 
       WHERE id NOT IN (SELECT DISTINCT venda_id FROM itens_venda) 
       RETURNING *`
    );
    console.log(`✅ ${vendasVaziasResult.rows.length} venda(s) vazia(s) excluída(s)`);
    
    // 3. Excluir itens de orçamento do Monitor LG 24"
    console.log('📋 Excluindo itens de orçamento...');
    const itensOrcamentoResult = await client.query(
      'DELETE FROM orcamento_itens WHERE produto_id IN (SELECT id FROM produtos WHERE nome ILIKE $1) RETURNING *',
      ['%Monitor LG 24%']
    );
    console.log(`✅ ${itensOrcamentoResult.rows.length} item(s) de orçamento excluído(s)`);
    
    // 4. Excluir orçamentos vazios (sem itens)
    console.log('📄 Excluindo orçamentos vazios...');
    const orcamentosVaziosResult = await client.query(
      `DELETE FROM orcamentos 
       WHERE id NOT IN (SELECT DISTINCT orcamento_id FROM orcamento_itens) 
       RETURNING *`
    );
    console.log(`✅ ${orcamentosVaziosResult.rows.length} orçamento(s) vazio(s) excluído(s)`);
    
    // 5. Verificar se o produto pode ser excluído agora
    console.log('🔍 Verificando se o produto pode ser excluído...');
    const vendasResult = await client.query(
      'SELECT COUNT(*) FROM itens_venda WHERE produto_id IN (SELECT id FROM produtos WHERE nome ILIKE $1)',
      ['%Monitor LG 24%']
    );
    
    const orcamentosResult = await client.query(
      'SELECT COUNT(*) FROM orcamento_itens WHERE produto_id IN (SELECT id FROM produtos WHERE nome ILIKE $1)',
      ['%Monitor LG 24%']
    );
    
    const vendasCount = parseInt(vendasResult.rows[0].count);
    const orcamentosCount = parseInt(orcamentosResult.rows[0].count);
    
    console.log(`📊 Uso em vendas: ${vendasCount} item(s)`);
    console.log(`📋 Uso em orçamentos: ${orcamentosCount} item(s)`);
    
    if (vendasCount === 0 && orcamentosCount === 0) {
      console.log('✅ Produto pode ser excluído agora!');
    } else {
      console.log('❌ Produto ainda não pode ser excluído');
    }
    
    await client.query('COMMIT');
    console.log('🎉 Dados de teste limpos com sucesso!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro ao limpar dados de teste:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  cleanTestData();
}

module.exports = { cleanTestData }; 