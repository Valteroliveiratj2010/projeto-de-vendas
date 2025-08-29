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

// Produtos de teste com estoque baixo
const produtosTeste = [
  {
    nome: 'Produto SEM ESTOQUE - Teste',
    descricao: 'Produto para testar alerta crítico',
    preco: 29.99,
    estoque: 0
  },
  {
    nome: 'Produto Estoque Baixo - Teste',
    descricao: 'Produto para testar alerta de aviso',
    preco: 19.99,
    estoque: 3
  },
  {
    nome: 'Produto Estoque Crítico - Teste',
    descricao: 'Produto para testar alerta crítico',
    preco: 39.99,
    estoque: 0
  },
  {
    nome: 'Produto Estoque Baixo 2 - Teste',
    descricao: 'Produto para testar alerta de aviso',
    preco: 15.99,
    estoque: 2
  }
];

// Função para inserir produtos de teste
async function inserirProdutosTeste() {
  try {
    console.log('🔧 Inserindo produtos de teste para alertas de estoque...');

    // Verificar se já existem produtos de teste
    const existingResult = await pool.query(
      "SELECT COUNT(*) FROM produtos WHERE nome LIKE '%Teste%'"
    );
    
    if (existingResult.rows[0].count > 0) {
      console.log('⚠️ Produtos de teste já existem. Removendo...');
      await pool.query("DELETE FROM produtos WHERE nome LIKE '%Teste%'");
    }

    // Inserir produtos de teste
    for (const produto of produtosTeste) {
      const result = await pool.query(`
        INSERT INTO produtos (nome, descricao, preco, estoque, created_at, updated_at)
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id, nome, estoque
      `, [produto.nome, produto.descricao, produto.preco, produto.estoque]);
      
      console.log(`✅ Produto inserido: ${result.rows[0].nome} (ID: ${result.rows[0].id}) - Estoque: ${result.rows[0].estoque}`);
    }

    // Verificar produtos com estoque baixo
    const estoqueBaixoResult = await pool.query(`
      SELECT * FROM produtos 
      WHERE estoque <= 5 
      ORDER BY estoque ASC
    `);

    console.log('\n📊 Produtos com estoque baixo encontrados:');
    estoqueBaixoResult.rows.forEach(produto => {
      const status = produto.estoque === 0 ? '🚨 SEM ESTOQUE' : '⚠️ Estoque Baixo';
      console.log(`  - ${produto.nome}: ${produto.estoque} un. (${status})`);
    });

    console.log('\n🎉 Produtos de teste inseridos com sucesso!');
    console.log('💡 Agora recarregue o dashboard para ver os alertas funcionando.');

  } catch (error) {
    console.error('❌ Erro ao inserir produtos de teste:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  inserirProdutosTeste();
}

module.exports = { inserirProdutosTeste }; 