// Script para corrigir problemas de navegação
console.log('🔧 CORRIGINDO PROBLEMAS DE NAVEGAÇÃO...');

// Função para forçar ativação de página
function forceActivatePage(pageName) {
    console.log(`🔄 Forçando ativação da página: ${pageName}`);

    // Ocultar todas as páginas
    const allPages = document.querySelectorAll('.page');
    allPages.forEach(page => {
        page.classList.remove('active');
        console.log(`🔍 Ocultando: ${page.id}`);
    });

    // Ativar página específica
    const targetPage = document.getElementById(`${pageName}-page`);
    if (targetPage) {
        targetPage.classList.add('active');
        console.log(`✅ Página ativada: ${targetPage.id}`);

        // Atualizar navegação
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        const navItem = document.querySelector(`[data-page="${pageName}"]`);
        if (navItem) {
            navItem.classList.add('active');
            console.log(`✅ Navegação atualizada: ${pageName}`);
        }

        return true;
    } else {
        console.error(`❌ Página não encontrada: ${pageName}-page`);
        return false;
    }
}

// Função para corrigir navegação da sidebar
function fixSidebarNavigation() {
    console.log('🔧 Corrigindo navegação da sidebar...');

    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        const link = item.querySelector('a');
        if (link) {
            // Remover event listeners antigos
            const newLink = link.cloneNode(true);
            link.parentNode.replaceChild(newLink, link);

            // Adicionar novo event listener
            newLink.addEventListener('click', (e) => {
                e.preventDefault();
                const pageName = item.getAttribute('data-page');
                console.log(`🔄 Navegação clicada: ${pageName}`);

                if (forceActivatePage(pageName)) {
                    // Atualizar hash
                    window.location.hash = `#${pageName}`;

                    // Disparar evento de mudança de página
                    window.dispatchEvent(new CustomEvent('pageChanged', {
                        detail: { page: pageName }
                    }));
                }
            });
        }
    });

    console.log('✅ Navegação da sidebar corrigida');
}

// Função para inicializar sistema de páginas
function initializePageSystem() {
    console.log('🚀 Inicializando sistema de páginas...');

    // Verificar página inicial
    const hash = window.location.hash.slice(1) || 'dashboard';
    console.log(`📋 Página inicial baseada no hash: ${hash}`);

    // Ativar página inicial
    if (forceActivatePage(hash)) {
        console.log(`✅ Página inicial ativada: ${hash}`);
    } else {
        console.log(`⚠️ Fallback para dashboard`);
        forceActivatePage('dashboard');
    }

    // Corrigir navegação
    fixSidebarNavigation();

    // Configurar listener para mudanças de hash
    window.addEventListener('hashchange', () => {
        const newHash = window.location.hash.slice(1) || 'dashboard';
        console.log(`🔄 Hash mudou para: ${newHash}`);
        forceActivatePage(newHash);
    });

    console.log('✅ Sistema de páginas inicializado');
}

// Executar correções quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePageSystem);
} else {
    initializePageSystem();
}

// Expor funções globalmente para debug
window.forceActivatePage = forceActivatePage;
window.fixSidebarNavigation = fixSidebarNavigation;
window.initializePageSystem = initializePageSystem;

console.log('✅ Script de correção de navegação carregado'); 