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

async function checkAndFixPagamentosForma() {
    try {
        console.log('🔍 Verificando formas de pagamento existentes...');

        // Verificar formas de pagamento atuais
        const formasResult = await pool.query(`
      SELECT 
        forma_pagamento,
        COUNT(*) as quantidade,
        COALESCE(SUM(valor_pago), 0) as valor_total
      FROM pagamentos 
      GROUP BY forma_pagamento
      ORDER BY quantidade DESC
    `);

        console.log('📊 Formas de pagamento encontradas:');
        formasResult.rows.forEach(row => {
            console.log(`  - ${row.forma_pagamento}: ${row.quantidade} pagamentos (R$ ${row.valor_total})`);
        });

        // Verificar se há pagamentos sem forma_pagamento definida
        const pagamentosSemForma = await pool.query(`
      SELECT COUNT(*) as total
      FROM pagamentos 
      WHERE forma_pagamento IS NULL OR forma_pagamento = ''
    `);

        console.log(`\n⚠️ Pagamentos sem forma definida: ${pagamentosSemForma.rows[0].total}`);

        // Verificar se há pagamentos com valores que deveriam ser cartão
        const pagamentosAltos = await pool.query(`
      SELECT 
        id,
        venda_id,
        valor_pago,
        forma_pagamento,
        created_at
      FROM pagamentos 
      WHERE valor_pago > 100 
      AND (forma_pagamento = 'Dinheiro' OR forma_pagamento IS NULL)
      ORDER BY valor_pago DESC
      LIMIT 10
    `);

        console.log('\n💰 Pagamentos com valores altos (possíveis cartões):');
        pagamentosAltos.rows.forEach(row => {
            console.log(`  - ID: ${row.id}, Venda: ${row.venda_id}, Valor: R$ ${row.valor_pago}, Forma: ${row.forma_pagamento || 'NULL'}`);
        });

        // Sugerir correções
        console.log('\n🔧 Sugestões de correção:');

        if (pagamentosSemForma.rows[0].total > 0) {
            console.log('  1. Atualizar pagamentos sem forma definida para "Dinheiro"');
            await pool.query(`
        UPDATE pagamentos 
        SET forma_pagamento = 'Dinheiro'
        WHERE forma_pagamento IS NULL OR forma_pagamento = ''
      `);
            console.log('  ✅ Pagamentos sem forma definida atualizados para "Dinheiro"');
        }

        // Adicionar alguns pagamentos de exemplo com cartão se não existirem
        const cartaoExists = formasResult.rows.some(row =>
            row.forma_pagamento.toLowerCase().includes('cartão') ||
            row.forma_pagamento.toLowerCase().includes('cartao') ||
            row.forma_pagamento.toLowerCase().includes('card')
        );

        if (!cartaoExists) {
            console.log('  2. Adicionando pagamentos de exemplo com cartão...');

            // Buscar algumas vendas para adicionar pagamentos com cartão
            const vendasResult = await pool.query(`
        SELECT id, total 
        FROM vendas 
        WHERE total > 50 
        ORDER BY created_at DESC 
        LIMIT 5
      `);

            for (const venda of vendasResult.rows) {
                // Verificar se já existe pagamento para esta venda
                const pagamentoExistente = await pool.query(`
          SELECT COUNT(*) as total
          FROM pagamentos 
          WHERE venda_id = $1
        `, [venda.id]);

                if (pagamentoExistente.rows[0].total === 0) {
                    // Adicionar pagamento com cartão
                    await pool.query(`
            INSERT INTO pagamentos (venda_id, valor_pago, forma_pagamento, observacoes, data_pagto, created_at, updated_at)
            VALUES ($1, $2, 'Cartão de Crédito', 'Pagamento com cartão de crédito', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          `, [venda.id, venda.total]);

                    console.log(`  ✅ Adicionado pagamento com cartão para venda ${venda.id} (R$ ${venda.total})`);
                }
            }
        }

        // Verificar resultado final
        console.log('\n📊 Formas de pagamento após correções:');
        const formasFinais = await pool.query(`
      SELECT 
        forma_pagamento,
        COUNT(*) as quantidade,
        COALESCE(SUM(valor_pago), 0) as valor_total
      FROM pagamentos 
      GROUP BY forma_pagamento
      ORDER BY quantidade DESC
    `);

        formasFinais.rows.forEach(row => {
            console.log(`  - ${row.forma_pagamento}: ${row.quantidade} pagamentos (R$ ${row.valor_total})`);
        });

        console.log('\n🎉 Verificação e correção concluídas!');

    } catch (error) {
        console.error('❌ Erro durante verificação:', error);
    } finally {
        await pool.end();
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    checkAndFixPagamentosForma();
}

module.exports = { checkAndFixPagamentosForma }; 