const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'sistema_vendas_6a8n',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'sua_senha_aqui'
});

async function checkPagamentosTable() {
    try {
        console.log('🔍 Verificando estrutura da tabela pagamentos...');

        // Verificar colunas da tabela pagamentos
        const pagamentosColumns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'pagamentos' 
      ORDER BY ordinal_position
    `);

        console.log('📋 Colunas da tabela pagamentos:');
        pagamentosColumns.rows.forEach(row => {
            console.log(`  - ${row.column_name}: ${row.data_type}`);
        });

        // Testar query específica
        const result = await pool.query(`
      SELECT 
        p.id,
        p.venda_id,
        p.valor_pago as valor,
        p.forma_pagamento as metodo_pagamento,
        p.data_pagto as data_pagamento,
        p.observacoes,
        'confirmado' as status,
        p.created_at,
        p.updated_at
      FROM pagamentos p
      WHERE p.venda_id = $1
      ORDER BY p.data_pagto DESC
    `, [9]);

        console.log('📊 Resultado da query:', result.rows);

    } catch (error) {
        console.error('❌ Erro:', error);
    } finally {
        await pool.end();
    }
}

checkPagamentosTable(); 