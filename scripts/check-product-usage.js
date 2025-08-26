const { pool } = require('../config/database');

// Função para verificar uso do produto
async function checkProductUsage() {
  try {
    console.log('🔍 Verificando uso do produto "Monitor LG 24""...');
    
    // Buscar o produto por nome
    const produtoResult = await pool.query(
      'SELECT id, nome FROM produtos WHERE nome ILIKE $1',
      ['%Monitor LG 24%']
    );
    
    if (produtoResult.rows.length === 0) {
      console.log('❌ Produto "Monitor LG 24"" não encontrado');
      return;
    }
    
    const produto = produtoResult.rows[0];
    console.log(`✅ Produto encontrado: ID ${produto.id} - ${produto.nome}`);
    
    // Verificar uso em vendas
    const vendasResult = await pool.query(
      'SELECT COUNT(*) FROM itens_venda WHERE produto_id = $1',
      [produto.id]
    );
    
    const vendasCount = parseInt(vendasResult.rows[0].count);
    console.log(`📊 Uso em vendas: ${vendasCount} item(s)`);
    
    if (vendasCount > 0) {
      const vendasDetalhes = await pool.query(
        `SELECT v.id as venda_id, v.created_at, iv.quantidade, iv.preco_unit, iv.subtotal,
                c.nome as cliente_nome
         FROM itens_venda iv
         JOIN vendas v ON iv.venda_id = v.id
         JOIN clientes c ON v.cliente_id = c.id
         WHERE iv.produto_id = $1
         ORDER BY v.created_at DESC`,
        [produto.id]
      );
      
      console.log('📋 Detalhes das vendas:');
      vendasDetalhes.rows.forEach((venda, index) => {
        console.log(`   ${index + 1}. Venda #${venda.venda_id} - Cliente: ${venda.cliente_nome} - Qtd: ${venda.quantidade} - Data: ${venda.created_at}`);
      });
    }
    
    // Verificar uso em orçamentos
    const orcamentosResult = await pool.query(
      'SELECT COUNT(*) FROM orcamento_itens WHERE produto_id = $1',
      [produto.id]
    );
    
    const orcamentosCount = parseInt(orcamentosResult.rows[0].count);
    console.log(`📋 Uso em orçamentos: ${orcamentosCount} item(s)`);
    
    if (orcamentosCount > 0) {
      const orcamentosDetalhes = await pool.query(
        `SELECT o.id as orcamento_id, o.created_at, oi.quantidade, oi.preco_unit, oi.subtotal,
                c.nome as cliente_nome
         FROM orcamento_itens oi
         JOIN orcamentos o ON oi.orcamento_id = o.id
         JOIN clientes c ON o.cliente_id = c.id
         WHERE oi.produto_id = $1
         ORDER BY o.created_at DESC`,
        [produto.id]
      );
      
      console.log('📋 Detalhes dos orçamentos:');
      orcamentosDetalhes.rows.forEach((orcamento, index) => {
        console.log(`   ${index + 1}. Orçamento #${orcamento.orcamento_id} - Cliente: ${orcamento.cliente_nome} - Qtd: ${orcamento.quantidade} - Data: ${orcamento.created_at}`);
      });
    }
    
    // Resumo
    console.log('\n📊 RESUMO:');
    console.log(`   Produto: ${produto.nome} (ID: ${produto.id})`);
    console.log(`   Total de vendas: ${vendasCount}`);
    console.log(`   Total de orçamentos: ${orcamentosCount}`);
    
    if (vendasCount === 0 && orcamentosCount === 0) {
      console.log('✅ Produto pode ser excluído (não está sendo usado)');
    } else {
      console.log('❌ Produto NÃO pode ser excluído (está sendo usado)');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar uso do produto:', error);
  } finally {
    await pool.end();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  checkProductUsage();
}

module.exports = { checkProductUsage }; 