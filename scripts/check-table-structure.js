const { pool } = require('../config/database');

// Função para verificar estrutura das tabelas
async function checkTableStructure() {
  try {
    console.log('🔍 Verificando estrutura das tabelas...');
    
    // Verificar estrutura da tabela pagamentos
    console.log('\n📋 TABELA PAGAMENTOS:');
    const pagamentosStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'pagamentos' 
      ORDER BY ordinal_position
    `);
    
    pagamentosStructure.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'NOT NULL'})`);
    });
    
    // Verificar estrutura da tabela vendas
    console.log('\n🛒 TABELA VENDAS:');
    const vendasStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'vendas' 
      ORDER BY ordinal_position
    `);
    
    vendasStructure.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'NOT NULL'})`);
    });
    
    // Verificar e adicionar colunas faltantes em pagamentos
    console.log('\n🔧 VERIFICANDO COLUNAS FALTANTES EM PAGAMENTOS:');
    
    const colunasNecessarias = [
      { nome: 'observacoes', tipo: 'TEXT' },
      { nome: 'forma_pagamento', tipo: 'VARCHAR(50)' },
      { nome: 'created_at', tipo: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
      { nome: 'updated_at', tipo: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' }
    ];
    
    for (const coluna of colunasNecessarias) {
      const existe = pagamentosStructure.rows.some(col => col.column_name === coluna.nome);
      console.log(`   ${coluna.nome}: ${existe ? '✅ EXISTE' : '❌ NÃO EXISTE'}`);
      
      if (!existe) {
        console.log(`   🔧 Adicionando coluna ${coluna.nome}...`);
        try {
          await pool.query(`ALTER TABLE pagamentos ADD COLUMN ${coluna.nome} ${coluna.tipo}`);
          console.log(`   ✅ Coluna ${coluna.nome} adicionada com sucesso!`);
        } catch (error) {
          console.log(`   ⚠️ Erro ao adicionar ${coluna.nome}:`, error.message);
        }
      }
    }
    
    // Verificar se há problemas na tabela vendas
    console.log('\n🔧 VERIFICANDO PROBLEMAS NA TABELA VENDAS:');
    
    // Verificar se os campos numéricos estão como DECIMAL/NUMERIC
    const camposNumericos = ['total', 'pago', 'saldo'];
    for (const campo of camposNumericos) {
      const coluna = vendasStructure.rows.find(col => col.column_name === campo);
      if (coluna) {
        console.log(`   ${campo}: ${coluna.data_type} ${coluna.data_type.includes('numeric') || coluna.data_type.includes('decimal') ? '✅' : '⚠️'}`);
      }
    }
    
    // Verificar se há campo data_venda
    const dataVenda = vendasStructure.rows.find(col => col.column_name === 'data_venda');
    if (dataVenda) {
      console.log(`   data_venda: ${dataVenda.data_type} ✅ EXISTE`);
    } else {
      console.log(`   data_venda: ❌ NÃO EXISTE - usando created_at`);
    }
    
    // Verificar estrutura final
    console.log('\n📋 ESTRUTURA FINAL DA TABELA PAGAMENTOS:');
    const finalStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'pagamentos' 
      ORDER BY ordinal_position
    `);
    
    finalStructure.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'NOT NULL'})`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao verificar estrutura das tabelas:', error);
  } finally {
    await pool.end();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  checkTableStructure();
}

module.exports = { checkTableStructure }; 