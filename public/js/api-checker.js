/**
 * 🔍 VERIFICADOR DE API - SISTEMA PROFISSIONAL
 * Script para testar e verificar todas as APIs do sistema
 */

class APIChecker {
    constructor() {
        this.endpoints = [
            '/api/vendas',
            '/api/clientes',
            '/api/produtos',
            '/api/orcamentos',
            '/api/relatorios/dashboard',
            '/api/pagamentos'
        ];
        this.results = {};
        this.init();
    }

    init() {
        console.log('🔍 Inicializando verificador de API...');
        this.checkAllAPIs();
    }

    async checkAllAPIs() {
        console.log('🔍 Verificando todas as APIs...');

        for (const endpoint of this.endpoints) {
            await this.checkAPI(endpoint);
        }

        this.report();
    }

    async checkAPI(endpoint) {
        try {
            console.log(`🔍 Testando: ${endpoint}`);

            const startTime = Date.now();
            const response = await window.api.get(endpoint);
            const endTime = Date.now();
            const duration = endTime - startTime;

            this.results[endpoint] = {
                status: 'success',
                duration: duration,
                data: response.data,
                timestamp: new Date().toISOString()
            };

            console.log(`✅ ${endpoint}: ${duration}ms`);

        } catch (error) {
            this.results[endpoint] = {
                status: 'error',
                error: error.message,
                timestamp: new Date().toISOString()
            };

            console.error(`❌ ${endpoint}: ${error.message}`);
        }
    }

    report() {
        console.log('📊 Relatório de APIs:');
        console.log('=====================');

        let successCount = 0;
        let errorCount = 0;
        let totalDuration = 0;

        Object.entries(this.results).forEach(([endpoint, result]) => {
            if (result.status === 'success') {
                successCount++;
                totalDuration += result.duration;
                console.log(`✅ ${endpoint}: ${result.duration}ms`);
            } else {
                errorCount++;
                console.log(`❌ ${endpoint}: ${result.error}`);
            }
        });

        console.log('=====================');
        console.log(`✅ APIs funcionais: ${successCount}`);
        console.log(`❌ APIs com erro: ${errorCount}`);
        console.log(`⏱️ Tempo médio: ${successCount > 0 ? Math.round(totalDuration / successCount) : 0}ms`);

        if (errorCount > 0) {
            console.log('⚠️ Algumas APIs estão com problemas!');
        } else {
            console.log('🎉 Todas as APIs estão funcionando!');
        }
    }

    getResults() {
        return this.results;
    }
}

// Inicializar verificador quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.apiChecker = new APIChecker();
    }, 3000); // Aguardar 3 segundos para carregar tudo
});

console.log('🔍 Verificador de API carregado'); 