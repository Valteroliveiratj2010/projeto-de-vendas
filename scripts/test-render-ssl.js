/**
 * Script para testar conexão SSL com PostgreSQL no Render
 * Testa configurações específicas para produção
 */

const { Pool } = require('pg');
require('dotenv').config();

// Configurações de teste para produção (Render)
const productionConfigs = [
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ssl: {
            rejectUnauthorized: false,
            require: true
        },
        description: 'Configuração SSL Render (rejectUnauthorized: false)'
    },
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ssl: true,
        description: 'Configuração SSL Render (ssl: true)'
    },
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ssl: {
            rejectUnauthorized: false
        },
        description: 'Configuração SSL Render (apenas rejectUnauthorized: false)'
    }
];

async function testConnection(config) {
    const pool = new Pool({
        ...config,
        connectionTimeoutMillis: 10000,
        query_timeout: 10000
    });

    try {
        const result = await pool.query('SELECT NOW() as current_time, current_database() as database_name, version() as pg_version');
        await pool.end();
        return {
            success: true,
            data: result.rows[0],
            config: config.description
        };
    } catch (error) {
        await pool.end();
        return {
            success: false,
            error: error.message,
            config: config.description
        };
    }
}

async function testAllProductionConfigurations() {
    console.log('🔍 Testando conexões SSL com PostgreSQL no Render...\n');
    console.log('🔧 Variáveis de ambiente:');
    console.log(`   DB_HOST: ${process.env.DB_HOST || 'Não definido'}`);
    console.log(`   DB_PORT: ${process.env.DB_PORT || 'Não definido'}`);
    console.log(`   DB_NAME: ${process.env.DB_NAME || 'Não definido'}`);
    console.log(`   DB_USER: ${process.env.DB_USER || 'Não definido'}`);
    console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'Não definido'}\n`);

    let successfulConfig = null;

    for (const config of productionConfigs) {
        console.log(`📋 Testando: ${config.description}`);

        const result = await testConnection(config);

        if (result.success) {
            console.log(`✅ CONEXÃO BEM-SUCEDIDA!`);
            console.log(`   Database: ${result.data.database_name}`);
            console.log(`   Tempo: ${result.data.current_time}`);
            console.log(`   PostgreSQL: ${result.data.pg_version.split(' ')[0]}\n`);
            successfulConfig = config;
            break;
        } else {
            console.log(`   ❌ Erro: ${result.error}\n`);
        }
    }

    if (successfulConfig) {
        console.log('🎉 CONFIGURAÇÃO FUNCIONANDO!');
        console.log('Use esta configuração no arquivo config/database.js:');
        console.log(JSON.stringify(successfulConfig, null, 2));
    } else {
        console.log('❌ Nenhuma configuração funcionou');
        console.log('💡 Verifique:');
        console.log('   1. Se as variáveis de ambiente estão corretas');
        console.log('   2. Se o banco está acessível');
        console.log('   3. Se as credenciais estão corretas');
    }
}

async function main() {
    try {
        await testAllProductionConfigurations();
    } catch (error) {
        console.error('❌ Erro durante teste:', error);
    }
}

if (require.main === module) {
    main();
}

module.exports = { testAllProductionConfigurations }; 