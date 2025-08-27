/**
 * Módulo de UI - Sistema de Vendas
 * Gerencia notificações, modais e elementos de interface
 */

class UI {
    constructor() {
        this.toastTimeout = 5000; // 5 segundos
        this.init();
    }

    /**
     * Inicializa o módulo de UI
     */
    init() {
        console.log('🚀 Inicializando módulo de UI...');
        
        try {
            // Aguardar um pouco para garantir que o DOM esteja pronto
            setTimeout(() => {
                // Configurar containers
                this.setupContainers();
                
                // Configurar event listeners
                this.setupEventListeners();
                
                console.log('✅ Módulo de UI inicializado!');
                console.log('🔍 window.UI disponível:', !!window.UI);
                console.log('🔍 window.UI.showModal disponível:', !!(window.UI && window.UI.showModal));
                
                // Verificar se o método showModal está disponível
                if (this.showModal) {
                    console.log('✅ Método showModal disponível na instância');
                } else {
                    console.error('❌ Método showModal não disponível na instância');
                }
                
            }, 100);
            
        } catch (error) {
            console.error('❌ Erro ao inicializar módulo UI:', error);
        }
    }

    /**
     * Configura containers de UI
     */
    setupContainers() {
        // Verificar se os containers existem
        if (!document.getElementById('toast-container')) {
            this.createToastContainer();
        }
        
        // Verificar se o container de modal existe (já está no HTML)
        const modalContainer = document.getElementById('modal-container');
        if (!modalContainer) {
            console.warn('⚠️ Container de modal não encontrado, criando...');
            this.createModalContainer();
        } else {
            console.log('✅ Container de modal já existe no HTML');
        }
    }

    /**
     * Cria container de toasts
     */
    createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    /**
     * Cria container de modais
     */
    createModalContainer() {
        const container = document.createElement('div');
        container.id = 'modal-container';
        container.className = 'modal-container hidden';
        container.innerHTML = `
            <div class="modal-overlay" id="modal-overlay"></div>
            <div class="modal" id="modal">
                <div class="modal-header">
                    <h3 id="modal-title">Modal</h3>
                    <button class="modal-close" id="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body" id="modal-body">
                    <!-- Modal content will be loaded here -->
                </div>
            </div>
        `;
        document.body.appendChild(container);
        console.log('✅ Container de modal criado');
    }

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        // Fechar modal ao clicar no overlay
        document.addEventListener('click', (e) => {
            if (e.target.id === 'modal-overlay') {
                this.hideModal();
            }
        });

        // Fechar modal com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideModal();
            }
        });

        // Botão de fechar modal
        document.addEventListener('click', (e) => {
            if (e.target.id === 'modal-close') {
                this.hideModal();
            }
        });
    }

    /**
     * Mostra toast de notificação
     */
    showToast(message, type = 'info', duration = null) {
        try {
            const container = document.getElementById('toast-container');
            if (!container) {
                console.warn('⚠️ Container de toast não encontrado');
                return;
            }

            // Criar toast
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            toast.innerHTML = `
                <div class="toast-content">
                    <div class="toast-icon">
                        <i class="${this.getToastIcon(type)}"></i>
                    </div>
                    <div class="toast-message">
                        <p>${message}</p>
                    </div>
                    <button class="toast-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;

            // Adicionar ao container
            container.appendChild(toast);

            // Mostrar com animação
            setTimeout(() => {
                toast.classList.add('show');
            }, 100);

            // Configurar auto-remoção
            const timeout = duration || this.toastTimeout;
            const timeoutId = setTimeout(() => {
                this.hideToast(toast);
            }, timeout);

            // Botão de fechar
            const closeBtn = toast.querySelector('.toast-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    clearTimeout(timeoutId);
                    this.hideToast(toast);
                });
            }

            // Retornar função para fechar manualmente
            return () => {
                clearTimeout(timeoutId);
                this.hideToast(toast);
            };

        } catch (error) {
            console.error('❌ Erro ao mostrar toast:', error);
            // Fallback para alert
            alert(`${type.toUpperCase()}: ${message}`);
        }
    }

    /**
     * Esconde toast
     */
    hideToast(toast) {
        if (!toast) return;
        
        toast.classList.remove('show');
        toast.classList.add('hiding');
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    /**
     * Mostra toast de sucesso
     */
    showSuccess(message, duration = null) {
        return this.showToast(message, 'success', duration);
    }

    /**
     * Mostra toast de erro
     */
    showError(message, duration = null) {
        return this.showToast(message, 'error', duration);
    }

    /**
     * Mostra erro com título e mensagem
     */
    showErrorWithTitle(title, message) {
        return this.showAlert({
            title: title,
            message: message
        });
    }

    /**
     * Mostra toast de aviso
     */
    showWarning(message, duration = null) {
        return this.showToast(message, 'warning', duration);
    }

    /**
     * Mostra toast de informação
     */
    showInfo(message, duration = null) {
        return this.showToast(message, 'info', duration);
    }

    /**
     * Retorna ícone para o tipo de toast
     */
    getToastIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    /**
     * Mostra modal
     */
    showModal(options) {
        try {
            console.log('🔄 Abrindo modal com opções:', options);
            
            const container = document.getElementById('modal-container');
            const modal = document.getElementById('modal');
            const title = document.getElementById('modal-title');
            const body = document.getElementById('modal-body');
            
            if (!container || !modal || !title || !body) {
                console.error('❌ Elementos do modal não encontrados');
                console.log('Container:', container);
                console.log('Modal:', modal);
                console.log('Title:', title);
                console.log('Body:', body);
                return;
            }

            // Configurar modal
            if (options.title) {
                title.textContent = options.title;
            }
            
            if (options.content) {
                body.innerHTML = options.content;
            }
            
            if (options.size) {
                modal.className = `modal modal-${options.size}`;
            } else {
                modal.className = 'modal';
            }

            // Mostrar modal
            container.classList.remove('hidden');
            console.log('✅ Modal exibido');
            
            // Focar no modal para acessibilidade
            setTimeout(() => {
                modal.focus();
            }, 100);

            // Retornar função para fechar
            return () => this.hideModal();

        } catch (error) {
            console.error('❌ Erro ao mostrar modal:', error);
        }
    }

    /**
     * Esconde modal
     */
    hideModal() {
        const container = document.getElementById('modal-container');
        if (container) {
            container.classList.add('hidden');
        }
    }

    /**
     * Mostra modal de confirmação
     */
    showConfirm(options) {
        return new Promise((resolve) => {
            const content = `
                <div class="confirm-dialog">
                    <div class="confirm-message">
                        <p>${options.message || 'Tem certeza que deseja continuar?'}</p>
                    </div>
                    <div class="confirm-actions">
                        <button class="btn btn-secondary" id="confirm-cancel">
                            ${options.cancelText || 'Cancelar'}
                        </button>
                        <button class="btn btn-primary" id="confirm-ok">
                            ${options.okText || 'Confirmar'}
                        </button>
                    </div>
                </div>
            `;

            const closeModal = this.showModal({
                title: options.title || 'Confirmação',
                content: content,
                size: 'sm'
            });

            // Configurar event listeners
            setTimeout(() => {
                const cancelBtn = document.getElementById('confirm-cancel');
                const okBtn = document.getElementById('confirm-ok');

                if (cancelBtn) {
                    cancelBtn.addEventListener('click', () => {
                        closeModal();
                        resolve(false);
                    });
                }

                if (okBtn) {
                    okBtn.addEventListener('click', () => {
                        closeModal();
                        resolve(true);
                    });
                }
            }, 100);
        });
    }

    /**
     * Mostra modal de alerta
     */
    showAlert(options) {
        return new Promise((resolve) => {
            const content = `
                <div class="alert-dialog">
                    <div class="alert-message">
                        <p>${options.message || 'Mensagem'}</p>
                    </div>
                    <div class="alert-actions">
                        <button class="btn btn-primary" id="alert-ok">
                            ${options.okText || 'OK'}
                        </button>
                    </div>
                </div>
            `;

            const closeModal = this.showModal({
                title: options.title || 'Alerta',
                content: content,
                size: 'sm'
            });

            // Configurar event listener
            setTimeout(() => {
                const okBtn = document.getElementById('alert-ok');
                if (okBtn) {
                    okBtn.addEventListener('click', () => {
                        closeModal();
                        resolve();
                    });
                }
            }, 100);
        });
    }

    /**
     * Mostra loading
     */
    showLoading(message = 'Carregando...') {
        const loading = document.createElement('div');
        loading.id = 'global-loading';
        loading.className = 'global-loading';
        loading.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <p>${message}</p>
            </div>
        `;
        
        document.body.appendChild(loading);
        
        // Retornar função para esconder
        return () => {
            if (loading.parentNode) {
                loading.parentNode.removeChild(loading);
            }
        };
    }

    /**
     * Esconde loading global
     */
    hideLoading() {
        const loading = document.getElementById('global-loading');
        if (loading && loading.parentNode) {
            loading.parentNode.removeChild(loading);
        }
    }

    /**
     * Formata moeda
     */
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    /**
     * Formata data
     */
    formatDate(date) {
        if (!date) return '-';
        
        const d = new Date(date);
        return d.toLocaleDateString('pt-BR');
    }

    /**
     * Formata data e hora
     */
    formatDateTime(date) {
        if (!date) return '-';
        
        const d = new Date(date);
        return d.toLocaleString('pt-BR');
    }

    /**
     * Formata telefone
     */
    formatPhone(phone) {
        if (!phone) return '-';
        
        // Remove tudo que não é número
        const numbers = phone.replace(/\D/g, '');
        
        if (numbers.length === 11) {
            return `(${numbers.slice(0,2)}) ${numbers.slice(2,7)}-${numbers.slice(7)}`;
        } else if (numbers.length === 10) {
            return `(${numbers.slice(0,2)}) ${numbers.slice(2,6)}-${numbers.slice(6)}`;
        }
        
        return phone;
    }

    /**
     * Formata CPF/CNPJ
     */
    formatDocument(doc) {
        if (!doc) return '-';
        
        // Remove tudo que não é número
        const numbers = doc.replace(/\D/g, '');
        
        if (numbers.length === 11) {
            // CPF
            return `${numbers.slice(0,3)}.${numbers.slice(3,6)}.${numbers.slice(6,9)}-${numbers.slice(9)}`;
        } else if (numbers.length === 14) {
            // CNPJ
            return `${numbers.slice(0,2)}.${numbers.slice(2,5)}.${numbers.slice(5,8)}/${numbers.slice(8,12)}-${numbers.slice(12)}`;
        }
        
        return doc;
    }
}

// Criar instância global da UI
window.UI = new UI();

// Exportar classe para uso global
window.UIClass = UI; 