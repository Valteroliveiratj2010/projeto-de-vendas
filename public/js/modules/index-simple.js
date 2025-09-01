// Sistema de carregamento de módulos simplificado
class SimpleModuleLoader {
    constructor() {
        this.loadedModules = new Set();
        this.init();
    }

    init() {
        console.log('📦 Inicializando carregador simples de módulos...');
        
        // Aguardar scripts carregarem
        setTimeout(() => {
            this.checkModules();
            this.emitModulesLoaded();
        }, 200);
    }

    checkModules() {
        const modules = ['SystemConfig', 'AuthManager', 'UIManager', 'DataManager', 'RoutingManager'];
        
        modules.forEach(module => {
            if (window[module]) {
                this.loadedModules.add(module);
                console.log(`✅ Módulo ${module} encontrado`);
            } else {
                console.warn(`⚠️ Módulo ${module} não encontrado`);
            }
        });
    }

    emitModulesLoaded() {
        const event = new CustomEvent('modules:loaded', {
            detail: {
                modules: Array.from(this.loadedModules),
                timestamp: new Date().toISOString()
            }
        });

        document.dispatchEvent(event);
        window.dispatchEvent(event);
        console.log('📡 Evento de módulos carregados emitido');
    }

    getLoadedModules() {
        return Array.from(this.loadedModules);
    }
}

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.moduleLoader = new SimpleModuleLoader();
});

window.SimpleModuleLoader = SimpleModuleLoader;
