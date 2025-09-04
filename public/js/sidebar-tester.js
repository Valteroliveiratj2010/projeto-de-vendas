// ===== TESTE DE FUNCIONAMENTO DA SIDEBAR =====
console.log('🧪 TESTANDO FUNCIONAMENTO DA SIDEBAR...');

class SidebarTester {
    constructor() {
        this.init();
    }

    init() {
        console.log('🧪 Inicializando teste da sidebar...');

        // Aguardar DOM estar pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.runTests());
        } else {
            this.runTests();
        }
    }

    runTests() {
        console.log('🧪 Executando testes da sidebar...');

        setTimeout(() => {
            this.testSidebarElements();
            this.testSidebarToggle();
            this.testSidebarFunctionality();
        }, 1000);
    }

    testSidebarElements() {
        console.log('🧪 Testando elementos da sidebar...');

        const sidebar = document.getElementById('sidebar');
        const sidebarToggle = document.getElementById('sidebar-toggle');

        if (!sidebar) {
            console.error('❌ Sidebar não encontrada!');
            return false;
        }

        if (!sidebarToggle) {
            console.error('❌ Botão sidebar-toggle não encontrado!');
            return false;
        }

        console.log('✅ Elementos da sidebar encontrados');
        console.log('📊 Sidebar:', sidebar);
        console.log('📊 Botão:', sidebarToggle);

        return true;
    }

    testSidebarToggle() {
        console.log('🧪 Testando toggle da sidebar...');

        const sidebar = document.getElementById('sidebar');
        const sidebarToggle = document.getElementById('sidebar-toggle');

        if (!sidebar || !sidebarToggle) {
            console.error('❌ Elementos não encontrados para teste');
            return false;
        }

        // Verificar estado inicial
        const initialState = sidebar.classList.contains('open');
        console.log('📊 Estado inicial da sidebar:', initialState ? 'aberta' : 'fechada');

        // Simular clique
        console.log('🧪 Simulando clique no botão...');
        sidebarToggle.click();

        // Verificar mudança de estado
        setTimeout(() => {
            const newState = sidebar.classList.contains('open');
            console.log('📊 Estado após clique:', newState ? 'aberta' : 'fechada');

            if (newState !== initialState) {
                console.log('✅ Toggle da sidebar funcionando!');
            } else {
                console.error('❌ Toggle da sidebar não funcionou!');
            }

            // Restaurar estado original
            setTimeout(() => {
                if (newState !== initialState) {
                    sidebarToggle.click();
                    console.log('🔄 Estado restaurado');
                }
            }, 500);
        }, 100);

        return true;
    }

    testSidebarFunctionality() {
        console.log('🧪 Testando funcionalidade completa da sidebar...');

        const sidebar = document.getElementById('sidebar');
        const sidebarToggle = document.getElementById('sidebar-toggle');

        if (!sidebar || !sidebarToggle) {
            console.error('❌ Elementos não encontrados para teste');
            return false;
        }

        // Verificar event listeners
        console.log('📊 Verificando event listeners...');

        // Verificar se o botão tem a propriedade _hasClickListener
        if (sidebarToggle._hasClickListener) {
            console.log('✅ Botão tem listener configurado');
        } else {
            console.warn('⚠️ Botão não tem listener configurado');
        }

        // Verificar classes CSS
        console.log('📊 Verificando classes CSS...');
        console.log('📊 Classes da sidebar:', sidebar.className);
        console.log('📊 Classes do botão:', sidebarToggle.className);

        // Verificar estilos
        const sidebarStyles = window.getComputedStyle(sidebar);
        const buttonStyles = window.getComputedStyle(sidebarToggle);

        console.log('📊 Display da sidebar:', sidebarStyles.display);
        console.log('📊 Visibility da sidebar:', sidebarStyles.visibility);
        console.log('📊 Display do botão:', buttonStyles.display);

        return true;
    }
}

// Inicializar teste
const sidebarTester = new SidebarTester();

console.log('✅ Teste da sidebar inicializado!'); 