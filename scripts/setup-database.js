const { pool, testConnection } = require('../config/database');

// SQL para criar as tabelas do sistema - MELHORADO
const createTablesSQL = `
-- Tabela de clientes
CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    email VARCHAR(120),
    endereco TEXT,
    documento VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sync_status BOOLEAN DEFAULT true
);

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS produtos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL,
    estoque INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sync_status BOOLEAN DEFAULT true
);

-- Tabela de vendas
CREATE TABLE IF NOT EXISTS vendas (
    id SERIAL PRIMARY KEY,
    cliente_id INT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    pago DECIMAL(10,2) NOT NULL DEFAULT 0,
    saldo DECIMAL(10,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Parcial', 'Pago')),
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sync_status BOOLEAN DEFAULT true
);

-- Tabela de itens de venda
CREATE TABLE IF NOT EXISTS itens_venda (
    id SERIAL PRIMARY KEY,
    venda_id INT NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
    produto_id INT NOT NULL REFERENCES produtos(id) ON DELETE RESTRICT,
    quantidade INT NOT NULL,
    preco_unit DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    sync_status BOOLEAN DEFAULT true
);

-- Tabela de pagamentos
CREATE TABLE IF NOT EXISTS pagamentos (
    id SERIAL PRIMARY KEY,
    venda_id INT NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
    valor_pago DECIMAL(10,2) NOT NULL,
    forma_pagamento VARCHAR(50) DEFAULT 'Dinheiro',
    observacoes TEXT,
    data_pagto TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sync_status BOOLEAN DEFAULT true
);

-- Tabela de orçamentos
CREATE TABLE IF NOT EXISTS orcamentos (
    id SERIAL PRIMARY KEY,
    cliente_id INT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    validade DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Convertido', 'Expirado')),
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sync_status BOOLEAN DEFAULT true
);

-- Tabela de itens de orçamento
CREATE TABLE IF NOT EXISTS orcamento_itens (
    id SERIAL PRIMARY KEY,
    orcamento_id INT NOT NULL REFERENCES orcamentos(id) ON DELETE CASCADE,
    produto_id INT NOT NULL REFERENCES produtos(id) ON DELETE RESTRICT,
    quantidade INT NOT NULL,
    preco_unit DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    sync_status BOOLEAN DEFAULT true
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_vendas_cliente_id ON vendas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_vendas_status ON vendas(status);
CREATE INDEX IF NOT EXISTS idx_itens_venda_venda_id ON itens_venda(venda_id);
CREATE INDEX IF NOT EXISTS idx_itens_venda_produto_id ON itens_venda(produto_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_venda_id ON pagamentos(venda_id);
CREATE INDEX IF NOT EXISTS idx_orcamentos_cliente_id ON orcamentos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_orcamentos_status ON orcamentos(status);
CREATE INDEX IF NOT EXISTS idx_orcamento_itens_orcamento_id ON orcamento_itens(orcamento_id);
CREATE INDEX IF NOT EXISTS idx_orcamento_itens_produto_id ON orcamento_itens(produto_id);
CREATE INDEX IF NOT EXISTS idx_clientes_documento ON clientes(documento);
CREATE INDEX IF NOT EXISTS idx_produtos_nome ON produtos(nome);
`;

// SQL para inserir dados de exemplo - MELHORADO
const insertSampleDataSQL = `
-- Inserir clientes de exemplo
INSERT INTO clientes (nome, telefone, email, endereco, documento) VALUES
('João Silva', '(11) 99999-9999', 'joao@email.com', 'Rua das Flores, 123 - São Paulo/SP', '123.456.789-00'),
('Maria Santos', '(11) 88888-8888', 'maria@email.com', 'Av. Paulista, 1000 - São Paulo/SP', '987.654.321-00'),
('Empresa ABC Ltda', '(11) 77777-7777', 'contato@abc.com.br', 'Rua do Comércio, 500 - São Paulo/SP', '12.345.678/0001-90')
ON CONFLICT (id) DO NOTHING;

-- Inserir produtos de exemplo
INSERT INTO produtos (nome, descricao, preco, estoque) VALUES
('Notebook Dell Inspiron', 'Notebook Dell Inspiron 15 polegadas, 8GB RAM, 256GB SSD', 2999.99, 10),
('Mouse Wireless Logitech', 'Mouse sem fio Logitech com sensor óptico de alta precisão', 89.90, 25),
('Teclado Mecânico RGB', 'Teclado mecânico com switches blue e iluminação RGB', 299.90, 15),
('Monitor LG 24"', 'Monitor LG 24 polegadas Full HD, painel IPS', 799.90, 8),
('Webcam HD 1080p', 'Webcam com resolução Full HD e microfone integrado', 199.90, 20)
ON CONFLICT (id) DO NOTHING;
`;

// Função para criar as tabelas - MELHORADA
async function createTables() {
  try {
    console.log('🗄️ Criando tabelas do banco de dados...');

    // Criar tabelas
    await pool.query(createTablesSQL);
    console.log('✅ Tabelas criadas com sucesso!');

    // Inserir dados de exemplo
    console.log('📝 Inserindo dados de exemplo...');
    await pool.query(insertSampleDataSQL);
    console.log('✅ Dados de exemplo inseridos com sucesso!');

    return true;
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error.message);
    return false;
  }
}

// Função principal - MELHORADA
async function main() {
  try {
    console.log('🚀 Iniciando configuração do banco de dados...');

    // Testar conexão
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Não foi possível conectar ao banco de dados');
      console.log('💡 Verifique se:');
      console.log('   1. O PostgreSQL está rodando');
      console.log('   2. As credenciais no arquivo .env estão corretas');
      console.log('   3. O banco de dados existe');
      process.exit(1);
    }

    // Criar tabelas
    const tablesCreated = await createTables();
    if (!tablesCreated) {
      console.error('❌ Falha ao criar tabelas');
      process.exit(1);
    }

    console.log('🎉 Configuração do banco de dados concluída com sucesso!');
    console.log('✨ O sistema está pronto para uso!');

  } catch (error) {
    console.error('❌ Erro durante configuração:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { createTables, main }; 