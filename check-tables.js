const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'sistema_vendas_6a8n',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'sua_senha_aqui'
});

async function checkTables() {
    try {
        console.log('🔍 Verificando estrutura das tabelas...');

        // Verificar colunas da tabela vendas
        const vendasColumns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'vendas' 
      ORDER BY ordinal_position
    `);

        console.log('📋 Colunas da tabela vendas:');
        vendasColumns.rows.forEach(row => {
            console.log(`  - ${row.column_name}: ${row.data_type}`);
        });

        // Verificar algumas vendas
        const vendas = await pool.query('SELECT id, total, pago, saldo FROM vendas LIMIT 3');
        console.log('📊 Algumas vendas:', vendas.rows);

        // Verificar pagamentos
        const pagamentos = await pool.query('SELECT id, venda_id, valor_pago FROM pagamentos LIMIT 3');
        console.log('💰 Alguns pagamentos:', pagamentos.rows);

    } catch (error) {
        console.error('❌ Erro:', error);
    } finally {
        await pool.end();
    }
}

checkTables(); 