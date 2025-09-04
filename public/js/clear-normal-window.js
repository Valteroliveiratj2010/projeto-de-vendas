// Script para limpar cache da janela normal - Execute no console (F12)
console.log('🧹 INICIANDO LIMPEZA DE CACHE PARA JANELA NORMAL');

async function clearCacheForNormalWindow() {
    try {
        console.log('🔍 Verificando caches ativos...');

        // 1. Limpar todos os caches
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            console.log(`📦 Caches encontrados: ${cacheNames.length}`);

            if (cacheNames.length > 0) {
                for (const cacheName of cacheNames) {
                    console.log(`🗑️ Removendo cache: ${cacheName}`);
                    await caches.delete(cacheName);
                }
                console.log('✅ Todos os caches foram limpos!');
            } else {
                console.log('✅ Nenhum cache encontrado');
            }
        }

        // 2. Desregistrar Service Workers
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            console.log(`🔧 Service Workers encontrados: ${registrations.length}`);

            if (registrations.length > 0) {
                for (const registration of registrations) {
                    console.log(`🔧 Desregistrando: ${registration.scope}`);
                    await registration.unregister();
                }
                console.log('✅ Todos os Service Workers foram desregistrados!');
            } else {
                console.log('✅ Nenhum Service Worker encontrado');
            }
        }

        // 3. Limpar localStorage (preservando autenticação)
        const authToken = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');

        console.log('💾 Limpando localStorage...');
        localStorage.clear();

        if (authToken) {
            localStorage.setItem('authToken', authToken);
            console.log('✅ Token de autenticação preservado');
        }
        if (userData) {
            localStorage.setItem('userData', userData);
            console.log('✅ Dados do usuário preservados');
        }

        console.log('✅ LocalStorage limpo!');

        // 4. Verificar instâncias duplicadas
        console.log('🔍 Verificando instâncias...');
        const instances = [
            'window.dashboardPage',
            'window.DashboardPage',
            'window.clientesPageInstance',
            'window.ClientesPage',
            'window.sistemaVendas'
        ];

        instances.forEach(instance => {
            if (window[instance.split('.')[1]]) {
                console.log(`⚠️ ${instance}: EXISTE (será limpo no reload)`);
            } else {
                console.log(`✅ ${instance}: NÃO EXISTE`);
            }
        });

        console.log('🎉 LIMPEZA CONCLUÍDA COM SUCESSO!');
        console.log('🔄 Recarregando página em 3 segundos...');

        setTimeout(() => {
            window.location.reload(true);
        }, 3000);

    } catch (error) {
        console.error('❌ Erro durante limpeza:', error);
        console.log('💡 Tente executar novamente ou use Ctrl+Shift+R');
    }
}

// Executar limpeza automaticamente
clearCacheForNormalWindow(); 