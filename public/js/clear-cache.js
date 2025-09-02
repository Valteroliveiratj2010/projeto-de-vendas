/**
 * Script para limpar cache do Service Worker
 * Força atualização dos arquivos
 */

console.log('🧹 Iniciando limpeza de cache...');

// Função para limpar cache do Service Worker
async function clearServiceWorkerCache() {
    try {
        // Verificar se o service worker está registrado
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.getRegistration();

            if (registration) {
                console.log('🔄 Service Worker encontrado, limpando cache...');

                // Limpar todos os caches
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map(cacheName => {
                        console.log('🗑️ Removendo cache:', cacheName);
                        return caches.delete(cacheName);
                    })
                );

                // Atualizar service worker
                await registration.update();

                // Aguardar um pouco e recarregar
                setTimeout(() => {
                    console.log('🔄 Recarregando página...');
                    window.location.reload(true);
                }, 1000);

            } else {
                console.log('⚠️ Service Worker não encontrado');
            }
        } else {
            console.log('⚠️ Service Worker não suportado');
        }
    } catch (error) {
        console.error('❌ Erro ao limpar cache:', error);
    }
}

// Função para limpar cache do navegador
function clearBrowserCache() {
    console.log('🧹 Limpando cache do navegador...');

    // Forçar recarregamento sem cache
    window.location.reload(true);
}

// Função para verificar se os arquivos estão sendo carregados
function checkFilesLoaded() {
    console.log('🔍 Verificando carregamento dos arquivos...');

    // Verificar CSS
    const cssLinks = document.querySelectorAll('link[href*="icon-standardization"]');
    cssLinks.forEach(link => {
        console.log('📄 CSS encontrado:', link.href);
    });

    // Verificar JS
    const jsScripts = document.querySelectorAll('script[src*="icon-standardization"]');
    jsScripts.forEach(script => {
        console.log('📄 JS encontrado:', script.src);
    });

    // Verificar se a classe está disponível
    if (window.IconStandardization) {
        console.log('✅ IconStandardization disponível');
    } else {
        console.log('❌ IconStandardization não encontrada');
    }
}

// Executar verificações quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 DOM carregado, executando verificações...');
    checkFilesLoaded();

    // Adicionar botão de limpeza de cache
    const header = document.querySelector('.header-right');
    if (header) {
        const clearCacheBtn = document.createElement('button');
        clearCacheBtn.className = 'btn btn-warning';
        clearCacheBtn.innerHTML = '<i class="fas fa-broom"></i> Limpar Cache';
        clearCacheBtn.onclick = clearServiceWorkerCache;
        header.appendChild(clearCacheBtn);
    }
});

// Exportar funções para uso global
window.clearServiceWorkerCache = clearServiceWorkerCache;
window.clearBrowserCache = clearBrowserCache;
window.checkFilesLoaded = checkFilesLoaded;

console.log('✅ Script de limpeza de cache carregado'); 