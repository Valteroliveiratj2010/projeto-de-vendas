const { pool } = require('../config/database');

// Função para testar o processo de pagamento
async function testPayment() {
  const client = await pool.connect();
  
  try {
    console.log('🧪 Testando processo de pagamento...');
    
    // 1. Verificar estado atual da venda #3
    console.log('\n📋 Estado atual da venda #3:');
    const vendaResult = await client.query(
      'SELECT id, total, pago, saldo, status FROM vendas WHERE id = 3'
    );
    
    if (vendaResult.rows.length === 0) {
      console.log('❌ Venda #3 não encontrada');
      return;
    }
    
    const venda = vendaResult.rows[0];
    console.log('   Total:', venda.total);
    console.log('   Pago:', venda.pago);
    console.log('   Saldo:', venda.saldo);
    console.log('   Status:', venda.status);
    
    // 2. Verificar pagamentos existentes
    console.log('\n💰 Pagamentos existentes para venda #3:');
    const pagamentosResult = await client.query(
      'SELECT id, valor_pago, data_pagto, forma_pagamento FROM pagamentos WHERE venda_id = 3'
    );
    
    console.log(`   Total de pagamentos: ${pagamentosResult.rows.length}`);
    pagamentosResult.rows.forEach((pag, index) => {
      console.log(`   ${index + 1}. R$ ${pag.valor_pago} - ${pag.forma_pagamento} - ${pag.data_pagto}`);
    });
    
    // 3. Simular um novo pagamento
    console.log('\n💳 Simulando novo pagamento...');
    const valorPagamento = 500.00;
    
    // Inserir pagamento
    const pagamentoResult = await client.query(
      `INSERT INTO pagamentos (venda_id, valor_pago, forma_pagamento, observacoes, data_pagto, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
       RETURNING *`,
      [3, valorPagamento, 'Cartão', 'Teste de pagamento']
    );
    
    console.log('✅ Pagamento inserido:', pagamentoResult.rows[0]);
    
    // 4. Atualizar venda
    const novoPago = parseFloat(venda.pago) + valorPagamento;
    const novoSaldo = parseFloat(venda.total) - novoPago;
    
    console.log('\n🔄 Atualizando venda:');
    console.log('   Pago atual:', venda.pago);
    console.log('   Novo pago:', novoPago);
    console.log('   Saldo atual:', venda.saldo);
    console.log('   Novo saldo:', novoSaldo);
    
    // Determinar novo status
    let novoStatus = 'Pendente';
    if (novoSaldo === 0) {
      novoStatus = 'Pago';
    } else if (novoPago > 0) {
      novoStatus = 'Parcial';
    }
    
    console.log('   Novo status:', novoStatus);
    
    await client.query(
      `UPDATE vendas 
       SET pago = $1, saldo = $2, status = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [novoPago, novoSaldo, novoStatus, 3]
    );
    
    // 5. Verificar se a atualização foi bem-sucedida
    console.log('\n✅ Verificando atualização:');
    const vendaAtualizada = await client.query(
      'SELECT id, total, pago, saldo, status FROM vendas WHERE id = 3'
    );
    
    const vendaNova = vendaAtualizada.rows[0];
    console.log('   Total:', vendaNova.total);
    console.log('   Pago:', vendaNova.pago);
    console.log('   Saldo:', vendaNova.saldo);
    console.log('   Status:', vendaNova.status);
    
    // 6. Verificar se os valores estão corretos
    if (parseFloat(vendaNova.pago) === novoPago && parseFloat(vendaNova.saldo) === novoSaldo) {
      console.log('\n🎉 Teste de pagamento SUCESSO!');
    } else {
      console.log('\n❌ Teste de pagamento FALHOU!');
      console.log('   Esperado - Pago:', novoPago, 'Saldo:', novoSaldo);
      console.log('   Obtido - Pago:', vendaNova.pago, 'Saldo:', vendaNova.saldo);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testPayment();
}

module.exports = { testPayment }; 