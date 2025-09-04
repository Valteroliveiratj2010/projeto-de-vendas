/**
 * Script para testar conexão com PostgreSQL
 * Testa senhas comuns e configurações
 */

const { Pool } = require('pg');

// Senhas comuns do PostgreSQL para teste
const commonPasswords = [
    '', // Senha vazia
    'postgres',
    'admin',
    'password',
    '123456',
    'postgresql',
    'root',
    'admin123',
    'postgres123',
    'sua_senha_aqui'
];

// Configurações de teste
const testConfigs = [
    {
        host: 'localhost',
        port: 5432,
        database: 'postgres', // Banco padrão
        user: 'postgres',
        description: 'Banco padrão postgres'
    },
    {
        host: 'localhost',
        port: 5432,
        database: 'sistema_vendas',
        user: 'postgres',
        description: 'Banco sistema_vendas'
    },
    {
        host: 'localhost',
        port: 5432,
        database: 'sistema_vendas_zc4o',
        user: 'postgres',
        description: 'Banco sistema_vendas_zc4o'
    }
];

async function testConnection(config, password) {
    const pool = new Pool({
        ...config,
        password,
        connectionTimeoutMillis: 3000,
        query_timeout: 5000
    });

    try {
        const result = await pool.query('SELECT NOW() as current_time, current_database() as database_name');
        await pool.end();
        return {
            success: true,
            data: result.rows[0],
            password: password
        };
    } catch (error) {
        await pool.end();
        return {
            success: false,
            error: error.message,
            password: password
        };
    }
}

async function testAllConfigurations() {
    console.log('🔍 Testando conexões com PostgreSQL...\n');

    for (const config of testConfigs) {
        console.log(`📋 Testando configuração: ${config.description}`);
        console.log(`   Host: ${config.host}:${config.port}`);
        console.log(`   Database: ${config.database}`);
        console.log(`   User: ${config.user}\n`);

        let foundPassword = false;

        for (const password of commonPasswords) {
            const result = await testConnection(config, password);

            if (result.success) {
                console.log(`✅ CONEXÃO BEM-SUCEDIDA!`);
                console.log(`   Senha: "${password}"`);
                console.log(`   Database: ${result.data.database_name}`);
                console.log(`   Tempo: ${result.data.current_time}\n`);
                foundPassword = true;
                break;
            } else {
                console.log(`   ❌ Senha "${password}": ${result.error}`);
            }
        }

        if (!foundPassword) {
            console.log(`❌ Nenhuma senha funcionou para esta configuração\n`);
        }

        console.log('---\n');
    }
}

async function createDatabaseIfNeeded() {
    console.log('🗄️ Tentando criar banco de dados se necessário...\n');

    // Testar conexão com banco postgres (padrão)
    const postgresPool = new Pool({
        host: 'localhost',
        port: 5432,
        database: 'postgres',
        user: 'postgres',
        password: 'postgres', // Tentar senha comum
        connectionTimeoutMillis: 5000
    });

    try {
        // Verificar se o banco sistema_vendas existe
        const result = await postgresPool.query(`
      SELECT datname FROM pg_database WHERE datname = 'sistema_vendas'
    `);

        if (result.rows.length === 0) {
            console.log('📝 Banco sistema_vendas não existe, criando...');
            await postgresPool.query('CREATE DATABASE sistema_vendas');
            console.log('✅ Banco sistema_vendas criado com sucesso!');
        } else {
            console.log('✅ Banco sistema_vendas já existe');
        }

        await postgresPool.end();
    } catch (error) {
        console.log('❌ Erro ao criar banco:', error.message);
        await postgresPool.end();
    }
}

async function main() {
    try {
        await testAllConfigurations();
        await createDatabaseIfNeeded();

        console.log('💡 RECOMENDAÇÕES:');
        console.log('1. Use a senha que funcionou no arquivo .env');
        console.log('2. Execute: npm run db:setup');
        console.log('3. Execute: npm start');

    } catch (error) {
        console.error('❌ Erro durante teste:', error);
    }
}

if (require.main === module) {
    main();
}

module.exports = { testAllConfigurations, createDatabaseIfNeeded }; 