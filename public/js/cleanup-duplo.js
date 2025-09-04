// Script para limpar cache e localStorage - Problemas de Carregamento Duplo
console.log('🧹 INICIANDO LIMPEZA DE CACHE E LOCALSTORAGE');

// Função para limpar todos os caches
async function clearAllCaches() {
    try {
        console.log('🗑️ Limpando todos os caches...');

        if ('caches' in window) {
            const cacheNames = await caches.keys();
            console.log(`📦 Caches encontrados: ${cacheNames.length}`);

            for (const cacheName of cacheNames) {
                console.log(`🗑️ Removendo cache: ${cacheName}`);
                await caches.delete(cacheName);
            }

            console.log('✅ Todos os caches foram limpos!');
        } else {
            console.log('⚠️ Cache API não disponível');
        }
    } catch (error) {
        console.error('❌ Erro ao limpar caches:', error);
    }
}

// Função para desregistrar Service Workers
async function unregisterServiceWorkers() {
    try {
        console.log('🔧 Desregistrando Service Workers...');

        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            console.log(`🔧 Service Workers encontrados: ${registrations.length}`);

            for (const registration of registrations) {
                console.log(`🔧 Desregistrando: ${registration.scope}`);
                await registration.unregister();
            }

            console.log('✅ Todos os Service Workers foram desregistrados!');
        } else {
            console.log('⚠️ Service Worker não disponível');
        }
    } catch (error) {
        console.error('❌ Erro ao desregistrar Service Workers:', error);
    }
}

// Função para limpar localStorage
function clearLocalStorage() {
    try {
        console.log('💾 Limpando localStorage...');

        // Salvar apenas dados essenciais se necessário
        const authToken = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');

        // Limpar tudo
        localStorage.clear();

        // Restaurar dados essenciais se necessário
        if (authToken) {
            localStorage.setItem('authToken', authToken);
            console.log('✅ Token de autenticação preservado');
        }
        if (userData) {
            localStorage.setItem('userData', userData);
            console.log('✅ Dados do usuário preservados');
        }

        console.log('✅ LocalStorage limpo!');
    } catch (error) {
        console.error('❌ Erro ao limpar localStorage:', error);
    }
}

// Função para verificar instâncias duplicadas
function checkDuplicateInstances() {
    console.log('🔍 Verificando instâncias duplicadas...');

    const instances = [
        { name: 'window.dashboardPage', value: window.dashboardPage },
        { name: 'window.DashboardPage', value: window.DashboardPage },
        { name: 'window.clientesPageInstance', value: window.clientesPageInstance },
        { name: 'window.ClientesPage', value: window.ClientesPage },
        { name: 'window.sistemaVendas', value: window.sistemaVendas }
    ];

    instances.forEach(instance => {
        if (instance.value) {
            console.log(`✅ ${instance.name}: EXISTE`);
        } else {
            console.log(`⚠️ ${instance.name}: NÃO EXISTE`);
        }
    });
}

// Função principal de limpeza
async function performFullCleanup() {
    console.log('🚀 INICIANDO LIMPEZA COMPLETA...');

    // 1. Limpar caches
    await clearAllCaches();

    // 2. Desregistrar Service Workers
    await unregisterServiceWorkers();

    // 3. Limpar localStorage
    clearLocalStorage();

    // 4. Verificar instâncias
    checkDuplicateInstances();

    console.log('✅ LIMPEZA COMPLETA CONCLUÍDA!');
    console.log('🔄 Recarregando página em 3 segundos...');

    setTimeout(() => {
        window.location.reload();
    }, 3000);
}

// Executar limpeza se chamado diretamente
if (typeof window !== 'undefined') {
    // Adicionar função global para uso manual
    window.performFullCleanup = performFullCleanup;
    window.clearAllCaches = clearAllCaches;
    window.unregisterServiceWorkers = unregisterServiceWorkers;
    window.clearLocalStorage = clearLocalStorage;
    window.checkDuplicateInstances = checkDuplicateInstances;

    console.log('✅ Script de limpeza carregado!');
    console.log('💡 Use window.performFullCleanup() para executar limpeza completa');
} 