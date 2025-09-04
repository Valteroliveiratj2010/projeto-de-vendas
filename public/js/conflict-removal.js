// ===== REMOÇÃO AUTOMÁTICA DE CONFLITOS =====
console.log('🧹 INICIANDO REMOÇÃO AUTOMÁTICA DE CONFLITOS...');

class ConflictRemoval {
    constructor() {
        this.removedElements = [];
        this.init();
    }

    init() {
        console.log('🧹 Inicializando remoção de conflitos...');

        // Aguardar DOM estar pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.removeConflicts());
        } else {
            this.removeConflicts();
        }

        // Monitorar mudanças no DOM
        this.setupMutationObserver();
    }

    removeConflicts() {
        console.log('🧹 Removendo elementos conflitantes...');

        // Lista de elementos conflitantes
        const conflictingSelectors = [
            '.top-bar',
            '.dashboard-header',
            '.page-header:not(.page-header[data-professional="true"])'
        ];

        conflictingSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (this.shouldRemove(element)) {
                    this.removeElement(element, selector);
                }
            });
        });

        // Marcar headers profissionais
        this.markProfessionalHeaders();
    }

    shouldRemove(element) {
        // Não remover se já foi marcado como profissional
        if (element.getAttribute('data-professional') === 'true') {
            return false;
        }

        // Não remover se é um header profissional
        if (element.classList.contains('page-header') &&
            element.querySelector('.header-content')) {
            return false;
        }

        return true;
    }

    removeElement(element, selector) {
        console.log(`🧹 Removendo elemento: ${selector}`);

        // Salvar informações antes de remover
        this.removedElements.push({
            selector: selector,
            className: element.className,
            innerHTML: element.innerHTML.substring(0, 100) + '...',
            timestamp: new Date().toISOString()
        });

        // Remover elemento
        element.remove();
    }

    markProfessionalHeaders() {
        const professionalHeaders = document.querySelectorAll('.page-header');
        professionalHeaders.forEach(header => {
            if (header.querySelector('.header-content')) {
                header.setAttribute('data-professional', 'true');
                console.log('✅ Header profissional marcado');
            }
        });
    }

    setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this.checkForConflicts(node);
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    checkForConflicts(node) {
        // Verificar se o nó adicionado é conflitante
        if (node.classList) {
            const conflictingClasses = ['top-bar', 'dashboard-header'];
            conflictingClasses.forEach(className => {
                if (node.classList.contains(className)) {
                    console.log(`🧹 Conflito detectado: ${className}`);
                    setTimeout(() => {
                        if (this.shouldRemove(node)) {
                            this.removeElement(node, `.${className}`);
                        }
                    }, 100);
                }
            });
        }

        // Verificar filhos do nó
        if (node.querySelectorAll) {
            const conflictingSelectors = ['.top-bar', '.dashboard-header'];
            conflictingSelectors.forEach(selector => {
                const elements = node.querySelectorAll(selector);
                elements.forEach(element => {
                    if (this.shouldRemove(element)) {
                        console.log(`🧹 Conflito detectado em filho: ${selector}`);
                        setTimeout(() => {
                            this.removeElement(element, selector);
                        }, 100);
                    }
                });
            });
        }
    }

    // Método para restaurar elementos removidos (para debug)
    restoreRemovedElements() {
        console.log('🔄 Restaurando elementos removidos...');
        console.table(this.removedElements);
    }

    // Método para limpar lista de elementos removidos
    clearRemovedList() {
        this.removedElements = [];
        console.log('🧹 Lista de elementos removidos limpa');
    }
}

// Inicializar remoção de conflitos
const conflictRemoval = new ConflictRemoval();

// Expor métodos globalmente
window.conflictRemoval = conflictRemoval;
window.restoreRemovedElements = () => conflictRemoval.restoreRemovedElements();
window.clearRemovedList = () => conflictRemoval.clearRemovedList();

console.log('✅ Remoção automática de conflitos inicializada!');
console.log('💡 Use window.restoreRemovedElements() para ver elementos removidos');
console.log('💡 Use window.clearRemovedList() para limpar lista de removidos'); 