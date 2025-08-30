const { pool } = require('../config/database');

// Função para verificar tabelas específicas que estão falhando
async function checkFailingTables() {
  try {
    console.log('🔍 Verificando tabelas que estão falhando nas APIs...');
    
    // Verificar se a tabela orcamentos existe
    console.log('\n📋 VERIFICANDO TABELA ORÇAMENTOS:');
    try {
      const orcamentosExists = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'orcamentos'
        );
      `);
      
      if (orcamentosExists.rows[0].exists) {
        console.log('   ✅ Tabela orcamentos EXISTE');
        
        // Verificar estrutura
        const orcamentosStructure = await pool.query(`
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns 
          WHERE table_name = 'orcamentos' 
          ORDER BY ordinal_position
        `);
        
        console.log('   📊 Colunas encontradas:');
        orcamentosStructure.rows.forEach(col => {
          console.log(`      ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'NOT NULL'})`);
        });
        
        // Verificar se há dados
        const orcamentosCount = await pool.query('SELECT COUNT(*) FROM orcamentos');
        console.log(`   📈 Total de orçamentos: ${orcamentosCount.rows[0].count}`);
        
        // Testar a query que está falhando
        console.log('   🧪 Testando query da API...');
        const testQuery = await pool.query(`
          SELECT 
            status,
            COUNT(*) as quantidade,
            COALESCE(SUM(valor_total), 0) as valor_total
          FROM orcamentos 
          WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
          GROUP BY status
          ORDER BY quantidade DESC
        `);
        console.log('   ✅ Query executada com sucesso!');
        console.log(`   📊 Resultados: ${testQuery.rows.length} registros`);
        
      } else {
        console.log('   ❌ Tabela orcamentos NÃO EXISTE');
      }
    } catch (error) {
      console.log('   ❌ Erro ao verificar orcamentos:', error.message);
    }
    
    // Verificar se a tabela vendas existe
    console.log('\n📋 VERIFICANDO TABELA VENDAS:');
    try {
      const vendasExists = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'vendas'
        );
      `);
      
      if (vendasExists.rows[0].exists) {
        console.log('   ✅ Tabela vendas EXISTE');
        
        // Verificar estrutura
        const vendasStructure = await pool.query(`
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns 
          WHERE table_name = 'vendas' 
          ORDER BY ordinal_position
        `);
        
        console.log('   📊 Colunas encontradas:');
        vendasStructure.rows.forEach(col => {
          console.log(`      ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'NOT NULL'})`);
        });
        
        // Verificar se há dados
        const vendasCount = await pool.query('SELECT COUNT(*) FROM vendas');
        console.log(`   📈 Total de vendas: ${vendasCount.rows[0].count}`);
        
        // Testar a query que está falhando
        console.log('   🧪 Testando query da API...');
        const testQuery = await pool.query(`
          SELECT 
            CASE 
              WHEN total <= 100 THEN 'Até R$ 100'
              WHEN total <= 500 THEN 'R$ 100 - R$ 500'
              WHEN total <= 1000 THEN 'R$ 500 - R$ 1.000'
              WHEN total <= 5000 THEN 'R$ 1.000 - R$ 5.000'
              ELSE 'Acima de R$ 5.000'
            END as faixa_valor,
            COUNT(*) as quantidade,
            COALESCE(SUM(total), 0) as valor_total
          FROM vendas 
          WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
          GROUP BY faixa_valor
          ORDER BY 
            CASE faixa_valor
              WHEN 'Até R$ 100' THEN 1
              WHEN 'R$ 100 - R$ 500' THEN 2
              WHEN 'R$ 500 - R$ 1.000' THEN 3
              WHEN 'R$ 1.000 - R$ 5.000' THEN 4
              ELSE 5
            END
        `);
        console.log('   ✅ Query executada com sucesso!');
        console.log(`   📊 Resultados: ${testQuery.rows.length} registros`);
        
      } else {
        console.log('   ❌ Tabela vendas NÃO EXISTE');
      }
    } catch (error) {
      console.log('   ❌ Erro ao verificar vendas:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  } finally {
    await pool.end();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  checkFailingTables();
}

module.exports = { checkFailingTables }; 