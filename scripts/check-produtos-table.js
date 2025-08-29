const { Pool } = require('pg');
require('dotenv').config();

// Configuração da conexão com o banco PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'sistema_vendas',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'guaguas00',
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

// Função para verificar a estrutura da tabela produtos
async function verificarTabelaProdutos() {
  try {
    console.log('🔧 Verificando estrutura da tabela produtos...');

    // Verificar se a tabela existe
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'produtos'
      );
    `);

    if (!tableExists.rows[0].exists) {
      console.log('❌ Tabela produtos não existe!');
      return;
    }

    // Verificar estrutura da tabela
    const structure = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'produtos'
      ORDER BY ordinal_position;
    `);

    console.log('📋 ESTRUTURA DA TABELA PRODUTOS:');
    structure.rows.forEach(row => {
      console.log(`   ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

    // Verificar dados existentes
    const countResult = await pool.query('SELECT COUNT(*) FROM produtos');
    console.log(`\n📊 Total de produtos na tabela: ${countResult.rows[0].count}`);

    if (countResult.rows[0].count > 0) {
      // Mostrar alguns produtos de exemplo
      const sampleResult = await pool.query('SELECT id, nome, estoque, preco FROM produtos LIMIT 5');
      console.log('\n📋 Exemplos de produtos:');
      sampleResult.rows.forEach(produto => {
        console.log(`   ID ${produto.id}: ${produto.nome} - Estoque: ${produto.estoque} - Preço: R$ ${produto.preco}`);
      });
    }

    // Verificar produtos com estoque baixo
    const estoqueBaixoResult = await pool.query(`
      SELECT id, nome, estoque FROM produtos 
      WHERE estoque <= 5 
      ORDER BY estoque ASC
    `);

    console.log(`\n⚠️ Produtos com estoque baixo (≤5): ${estoqueBaixoResult.rows.length}`);
    if (estoqueBaixoResult.rows.length > 0) {
      estoqueBaixoResult.rows.forEach(produto => {
        const status = produto.estoque === 0 ? '🚨 SEM ESTOQUE' : '⚠️ Estoque Baixo';
        console.log(`   - ${produto.nome}: ${produto.estoque} un. (${status})`);
      });
    }

  } catch (error) {
    console.error('❌ Erro ao verificar tabela produtos:', error);
  } finally {
    await pool.end();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  verificarTabelaProdutos();
}

module.exports = { verificarTabelaProdutos }; 