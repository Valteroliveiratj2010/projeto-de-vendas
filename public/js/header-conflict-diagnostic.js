// ===== DIAGNÓSTICO DE CONFLITOS - HEADERS PROFISSIONAIS =====
console.log('🔍 INICIANDO DIAGNÓSTICO DE CONFLITOS...');

class HeaderConflictDiagnostic {
    constructor() {
        this.conflicts = [];
        this.init();
    }

    init() {
        console.log('🔍 Iniciando diagnóstico de conflitos...');

        // Aguardar DOM estar pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.runDiagnostic());
        } else {
            this.runDiagnostic();
        }
    }

    runDiagnostic() {
        console.log('🔍 Executando diagnóstico completo...');

        this.checkCSSConflicts();
        this.checkJavaScriptConflicts();
        this.checkHTMLStructure();
        this.checkScriptOrder();
        this.checkElementRemoval();
        this.generateReport();
    }

    checkCSSConflicts() {
        console.log('🔍 Verificando conflitos CSS...');

        // Verificar se os arquivos CSS dos headers estão carregados
        const headerCSSFiles = [
            '/css/headers-design-system.css',
            '/css/headers-components.css'
        ];

        headerCSSFiles.forEach(file => {
            const link = document.querySelector(`link[href="${file}"]`);
            if (!link) {
                this.conflicts.push({
                    type: 'CSS_MISSING',
                    file: file,
                    description: 'Arquivo CSS dos headers não encontrado'
                });
            } else {
                console.log(`✅ CSS carregado: ${file}`);
            }
        });

        // Verificar se há CSS conflitante
        const conflictingSelectors = [
            '.page-header',
            '.dashboard-header',
            '.top-bar'
        ];

        conflictingSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 1) {
                this.conflicts.push({
                    type: 'CSS_DUPLICATE',
                    selector: selector,
                    count: elements.length,
                    description: `Múltiplos elementos com selector ${selector}`
                });
            }
        });
    }

    checkJavaScriptConflicts() {
        console.log('🔍 Verificando conflitos JavaScript...');

        // Verificar se o sistema de headers está carregado
        if (!window.professionalHeaderSystem) {
            this.conflicts.push({
                type: 'JS_MISSING',
                component: 'ProfessionalHeaderSystem',
                description: 'Sistema de headers não inicializado'
            });
        } else {
            console.log('✅ Sistema de headers carregado');
        }

        // Verificar scripts conflitantes
        const conflictingScripts = [
            'fix-navigation.js',
            'fix-dashboard.js',
            'test-dashboard-api.js',
            'fix-dashboard-data.js',
            'check-database.js',
            'fix-produto-api.js'
        ];

        conflictingScripts.forEach(script => {
            const scriptElement = document.querySelector(`script[src*="${script}"]`);
            if (scriptElement) {
                this.conflicts.push({
                    type: 'JS_CONFLICT',
                    script: script,
                    description: `Script temporário pode estar interferindo: ${script}`
                });
            }
        });
    }

    checkHTMLStructure() {
        console.log('🔍 Verificando estrutura HTML...');

        // Verificar se há elementos conflitantes
        const topBar = document.querySelector('.top-bar');
        const dashboardHeader = document.querySelector('.dashboard-header');
        const pageHeader = document.querySelector('.page-header');

        if (topBar && pageHeader) {
            this.conflicts.push({
                type: 'HTML_CONFLICT',
                elements: ['.top-bar', '.page-header'],
                description: 'Top-bar e page-header coexistem (pode causar conflito)'
            });
        }

        if (dashboardHeader && pageHeader) {
            this.conflicts.push({
                type: 'HTML_CONFLICT',
                elements: ['.dashboard-header', '.page-header'],
                description: 'Dashboard-header e page-header coexistem (pode causar conflito)'
            });
        }

        // Verificar se o page-header está no lugar correto
        const mainContent = document.querySelector('.main-content');
        const pageHeaderInMain = mainContent?.querySelector('.page-header');

        if (!pageHeaderInMain) {
            this.conflicts.push({
                type: 'HTML_STRUCTURE',
                element: '.page-header',
                description: 'Page-header não encontrado dentro de .main-content'
            });
        }
    }

    checkScriptOrder() {
        console.log('🔍 Verificando ordem dos scripts...');

        const scripts = Array.from(document.querySelectorAll('script[src]'));
        const appJsIndex = scripts.findIndex(script => script.src.includes('app.js'));
        const headerSystemIndex = scripts.findIndex(script => script.src.includes('professional-header-system.js'));

        if (appJsIndex !== -1 && headerSystemIndex !== -1) {
            if (headerSystemIndex < appJsIndex) {
                this.conflicts.push({
                    type: 'SCRIPT_ORDER',
                    description: 'professional-header-system.js carregado antes de app.js'
                });
            } else {
                console.log('✅ Ordem dos scripts correta');
            }
        }
    }

    checkElementRemoval() {
        console.log('🔍 Verificando remoção de elementos...');

        // Monitorar remoção de elementos
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.removedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.classList?.contains('page-header') ||
                            node.classList?.contains('dashboard-header') ||
                            node.classList?.contains('top-bar')) {

                            this.conflicts.push({
                                type: 'ELEMENT_REMOVED',
                                element: node.className,
                                description: `Elemento ${node.className} foi removido do DOM`,
                                timestamp: new Date().toISOString()
                            });
                        }
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    generateReport() {
        console.log('🔍 Gerando relatório de conflitos...');

        if (this.conflicts.length === 0) {
            console.log('✅ Nenhum conflito detectado!');
            return;
        }

        console.log('❌ CONFLITOS DETECTADOS:');
        console.table(this.conflicts);

        // Criar relatório visual
        this.createConflictReport();
    }

    createConflictReport() {
        const reportContainer = document.createElement('div');
        reportContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 400px;
            max-height: 80vh;
            background: #1f2937;
            color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
            z-index: 10000;
            font-family: monospace;
            font-size: 12px;
            overflow-y: auto;
        `;

        reportContainer.innerHTML = `
            <h3 style="margin: 0 0 15px 0; color: #ef4444;">🔍 CONFLITOS DETECTADOS</h3>
            <div style="margin-bottom: 10px;">
                <strong>Total:</strong> ${this.conflicts.length} conflito(s)
            </div>
            ${this.conflicts.map(conflict => `
                <div style="margin-bottom: 10px; padding: 10px; background: #374151; border-radius: 4px;">
                    <div style="color: #f59e0b; font-weight: bold;">${conflict.type}</div>
                    <div style="margin-top: 5px;">${conflict.description}</div>
                    ${conflict.file ? `<div style="color: #9ca3af; margin-top: 3px;">Arquivo: ${conflict.file}</div>` : ''}
                    ${conflict.timestamp ? `<div style="color: #9ca3af; margin-top: 3px;">Hora: ${conflict.timestamp}</div>` : ''}
                </div>
            `).join('')}
            <button onclick="this.parentElement.remove()" style="
                background: #ef4444;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                margin-top: 10px;
            ">Fechar</button>
        `;

        document.body.appendChild(reportContainer);
    }

    // Método para forçar aplicação dos headers
    forceApplyHeaders() {
        console.log('🔧 Forçando aplicação dos headers...');

        // Remover elementos conflitantes
        const topBar = document.querySelector('.top-bar');
        const dashboardHeader = document.querySelector('.dashboard-header');

        if (topBar) {
            console.log('🔧 Removendo top-bar conflitante...');
            topBar.remove();
        }

        if (dashboardHeader) {
            console.log('🔧 Removendo dashboard-header conflitante...');
            dashboardHeader.remove();
        }

        // Forçar criação do header profissional
        if (window.professionalHeaderSystem) {
            window.professionalHeaderSystem.createHeaderStructure();
            window.professionalHeaderSystem.updateHeaderForCurrentPage();
        }
    }
}

// Inicializar diagnóstico
const headerDiagnostic = new HeaderConflictDiagnostic();

// Expor métodos globalmente
window.headerDiagnostic = headerDiagnostic;
window.forceApplyHeaders = () => headerDiagnostic.forceApplyHeaders();

console.log('✅ Diagnóstico de conflitos inicializado!');
console.log('💡 Use window.forceApplyHeaders() para forçar aplicação dos headers'); 