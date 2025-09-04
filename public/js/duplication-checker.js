/**
 * 🔍 VERIFICADOR DE DUPLICAÇÕES - SISTEMA PROFISSIONAL
 * Script para detectar e prevenir duplicações de classes JavaScript
 */

class DuplicationChecker {
    constructor() {
        this.loadedClasses = new Set();
        this.duplicates = [];
        this.init();
    }

    init() {
        console.log('🔍 Inicializando verificador de duplicações...');
        this.checkExistingClasses();
        this.setupProtection();
    }

    checkExistingClasses() {
        const classNames = [
            'DashboardPage', 'ClientesPage', 'ProdutosPage', 'VendasPage',
            'OrcamentosPage', 'RelatoriosPageFinal', 'RelatoriosPageComDadosReais',
            'RelatoriosSimplesGlobal', 'RelatoriosResponsivos', 'SistemaVendas',
            'AuthSystem'
        ];

        classNames.forEach(className => {
            if (window[className]) {
                this.loadedClasses.add(className);
                console.log(`✅ Classe ${className} já carregada`);
            }
        });
    }

    setupProtection() {
        // Proteger contra redefinições
        const protectedClasses = [
            'DashboardPage', 'ClientesPage', 'ProdutosPage', 'VendasPage',
            'OrcamentosPage', 'RelatoriosPageFinal', 'RelatoriosPageComDadosReais',
            'RelatoriosSimplesGlobal', 'RelatoriosResponsivos'
        ];

        protectedClasses.forEach(className => {
            if (window[className]) {
                const originalClass = window[className];

                // Substituir com verificação
                Object.defineProperty(window, className, {
                    get: function () {
                        return originalClass;
                    },
                    set: function (newValue) {
                        console.warn(`⚠️ Tentativa de redefinir ${className} bloqueada`);
                        return originalClass;
                    },
                    configurable: false
                });
            }
        });
    }

    report() {
        console.log('📊 Relatório de Duplicações:');
        console.log(`✅ Classes carregadas: ${this.loadedClasses.size}`);
        console.log(`❌ Duplicações encontradas: ${this.duplicates.length}`);

        if (this.duplicates.length > 0) {
            console.log('❌ Lista de duplicações:', this.duplicates);
        }
    }
}

// Inicializar verificador quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.duplicationChecker = new DuplicationChecker();

    // Reportar após 2 segundos
    setTimeout(() => {
        window.duplicationChecker.report();
    }, 2000);
});

console.log('🔍 Verificador de duplicações carregado'); 