// ===== MONITORAMENTO DE PERSISTÊNCIA DOS HEADERS =====
console.log('👁️ INICIANDO MONITORAMENTO DE PERSISTÊNCIA...');

class HeaderPersistenceMonitor {
    constructor() {
        this.checkInterval = null;
        this.lastHeaderState = null;
        this.checks = 0;
        this.maxChecks = 60; // 5 minutos (60 * 5 segundos)
        this.init();
    }

    init() {
        console.log('👁️ Inicializando monitoramento...');

        // Aguardar um pouco para o sistema estabilizar
        setTimeout(() => {
            this.startMonitoring();
        }, 2000);
    }

    startMonitoring() {
        console.log('👁️ Iniciando monitoramento contínuo...');

        // Verificar a cada 5 segundos
        this.checkInterval = setInterval(() => {
            this.checkHeaderPersistence();
        }, 5000);
    }

    checkHeaderPersistence() {
        this.checks++;

        const header = document.querySelector('.page-header');
        const currentState = this.getHeaderState(header);

        if (!this.lastHeaderState) {
            this.lastHeaderState = currentState;
            console.log('👁️ Estado inicial do header registrado');
            return;
        }

        // Verificar se o header mudou
        if (JSON.stringify(currentState) !== JSON.stringify(this.lastHeaderState)) {
            console.log('⚠️ Mudança detectada no header!');
            console.log('Estado anterior:', this.lastHeaderState);
            console.log('Estado atual:', currentState);

            // Tentar restaurar o header
            this.restoreHeader();
        } else {
            console.log(`👁️ Header estável (verificação ${this.checks}/${this.maxChecks})`);
        }

        // Parar monitoramento após máximo de verificações
        if (this.checks >= this.maxChecks) {
            this.stopMonitoring();
            console.log('👁️ Monitoramento concluído - header estável');
        }

        this.lastHeaderState = currentState;
    }

    getHeaderState(header) {
        if (!header) {
            return { exists: false };
        }

        return {
            exists: true,
            className: header.className,
            hasContent: !!header.querySelector('.header-content'),
            hasTitle: !!header.querySelector('.page-title'),
            hasActions: !!header.querySelector('.header-actions'),
            title: header.querySelector('.page-title')?.textContent || '',
            actionCount: header.querySelectorAll('.action-btn').length
        };
    }

    restoreHeader() {
        console.log('🔧 Restaurando header...');

        // Forçar aplicação dos headers
        if (window.forceHeaderApp) {
            window.forceHeaderApp.applyHeaders();
        }

        // Atualizar estado
        setTimeout(() => {
            const header = document.querySelector('.page-header');
            this.lastHeaderState = this.getHeaderState(header);
            console.log('✅ Header restaurado');
        }, 1000);
    }

    stopMonitoring() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
            console.log('👁️ Monitoramento parado');
        }
    }

    // Método para reiniciar monitoramento
    restartMonitoring() {
        this.stopMonitoring();
        this.checks = 0;
        this.lastHeaderState = null;
        this.startMonitoring();
        console.log('👁️ Monitoramento reiniciado');
    }

    // Método para obter estatísticas
    getStats() {
        return {
            checks: this.checks,
            maxChecks: this.maxChecks,
            isMonitoring: !!this.checkInterval,
            lastState: this.lastHeaderState
        };
    }
}

// Inicializar monitoramento
const headerMonitor = new HeaderPersistenceMonitor();

// Expor métodos globalmente
window.headerMonitor = headerMonitor;
window.restartHeaderMonitoring = () => headerMonitor.restartMonitoring();
window.getHeaderStats = () => headerMonitor.getStats();

console.log('✅ Monitoramento de persistência inicializado!');
console.log('💡 Use window.restartHeaderMonitoring() para reiniciar monitoramento');
console.log('💡 Use window.getHeaderStats() para ver estatísticas'); 