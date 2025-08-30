/**
 * 🎨 UI MANAGER - Módulo de Gerenciamento da Interface do Usuário
 * Responsável por toda a lógica de interface, responsividade e interações visuais
 */

class UIManager {
    constructor() {
        this.isSidebarOpen = false;
        this.isMobile = false;
        this.currentTheme = 'light';
        this.notifications = [];
        this.init();
    }

    init() {
        console.log('🎨 Inicializando UIManager...');
        this.detectDeviceType();
        this.setupEventListeners();
        this.setupResponsiveness();
        this.initializeTheme();
        this.setupNotifications();
    }

    detectDeviceType() {
        this.isMobile = window.innerWidth <= 768;
        this.isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
        this.isDesktop = window.innerWidth > 1024;
        
        console.log(`📱 Dispositivo detectado: ${this.isMobile ? 'Mobile' : this.isTablet ? 'Tablet' : 'Desktop'}`);
    }

    setupEventListeners() {
        // Menu hambúrguer
        const hamburgerBtn = document.getElementById('hamburger-btn');
        if (hamburgerBtn) {
            hamburgerBtn.addEventListener('click', () => this.toggleSidebar());
        }

        // Overlay da sidebar
        const sidebarOverlay = document.getElementById('sidebar-overlay');
        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', () => this.closeSidebar());
        }

        // Botão de fechar sidebar
        const closeSidebarBtn = document.getElementById('close-sidebar-btn');
        if (closeSidebarBtn) {
            closeSidebarBtn.addEventListener('click', () => this.closeSidebar());
        }

        // Event listener para redimensionamento da janela
        window.addEventListener('resize', () => this.handleResize());

        // Event listener para tecla ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeSidebar();
            }
        });

        // Event listener para cliques fora da sidebar
        document.addEventListener('click', (e) => {
            if (this.isSidebarOpen && !e.target.closest('.sidebar') && !e.target.closest('#hamburger-btn')) {
                this.closeSidebar();
            }
        });
    }

    setupResponsiveness() {
        // Aplicar classes CSS baseadas no tipo de dispositivo
        document.body.classList.toggle('mobile', this.isMobile);
        document.body.classList.toggle('tablet', this.isTablet);
        document.body.classList.toggle('desktop', this.isDesktop);

        // Configurar sidebar baseado no dispositivo
        if (this.isMobile) {
            this.closeSidebar();
        } else if (this.isDesktop) {
            this.openSidebar();
        }
    }

    handleResize() {
        const wasMobile = this.isMobile;
        this.detectDeviceType();
        this.setupResponsiveness();

        // Se mudou de mobile para desktop ou vice-versa
        if (wasMobile !== this.isMobile) {
            if (this.isMobile) {
                this.closeSidebar();
            } else if (this.isDesktop) {
                this.openSidebar();
            }
        }
    }

    toggleSidebar() {
        if (this.isSidebarOpen) {
            this.closeSidebar();
        } else {
            this.openSidebar();
        }
    }

    openSidebar() {
        this.isSidebarOpen = true;
        document.body.classList.add('sidebar-open');
        
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        
        if (sidebar) {
            sidebar.classList.add('open');
        }
        
        if (overlay) {
            overlay.classList.add('active');
        }

        // Em mobile, adicionar classe para animação
        if (this.isMobile) {
            document.body.classList.add('mobile-sidebar-open');
        }
    }

    closeSidebar() {
        this.isSidebarOpen = false;
        document.body.classList.remove('sidebar-open', 'mobile-sidebar-open');
        
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        
        if (sidebar) {
            sidebar.classList.remove('open');
        }
        
        if (overlay) {
            overlay.classList.remove('active');
        }
    }

    initializeTheme() {
        // Carregar tema salvo ou usar padrão
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
    }

    setTheme(theme) {
        this.currentTheme = theme;
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Atualizar ícones de tema
        this.updateThemeIcons();
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    updateThemeIcons() {
        const themeToggleBtn = document.getElementById('theme-toggle-btn');
        if (themeToggleBtn) {
            const icon = themeToggleBtn.querySelector('i');
            if (icon) {
                icon.className = this.currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
            }
        }
    }

    setupNotifications() {
        // Sistema de notificações
        this.notificationContainer = document.getElementById('notification-container');
        if (!this.notificationContainer) {
            this.createNotificationContainer();
        }
    }

    createNotificationContainer() {
        this.notificationContainer = document.createElement('div');
        this.notificationContainer.id = 'notification-container';
        this.notificationContainer.className = 'notification-container';
        document.body.appendChild(this.notificationContainer);
    }

    showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        this.notificationContainer.appendChild(notification);

        // Auto-remover após duração
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, duration);

        // Adicionar à lista de notificações ativas
        this.notifications.push(notification);

        return notification;
    }

    getNotificationIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    hideNotification(notification) {
        if (notification && notification.parentElement) {
            notification.remove();
            const index = this.notifications.indexOf(notification);
            if (index > -1) {
                this.notifications.splice(index, 1);
            }
        }
    }

    clearAllNotifications() {
        this.notifications.forEach(notification => {
            this.hideNotification(notification);
        });
    }

    // Sistema de loading
    showLoading(message = 'Carregando...') {
        const loading = document.createElement('div');
        loading.className = 'loading-overlay';
        loading.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <p>${message}</p>
            </div>
        `;
        
        document.body.appendChild(loading);
        return loading;
    }

    hideLoading(loading) {
        if (loading && loading.parentElement) {
            loading.remove();
        }
    }

    // Sistema de modais
    showModal(content, options = {}) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal ${options.size || 'medium'}">
                <div class="modal-header">
                    <h3>${options.title || 'Modal'}</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                ${options.footer ? `<div class="modal-footer">${options.footer}</div>` : ''}
            </div>
        `;

        document.body.appendChild(modal);

        // Fechar com ESC
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);

        // Fechar ao clicar fora
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                document.removeEventListener('keydown', handleEsc);
            }
        });

        return modal;
    }

    // Sistema de tooltips
    setupTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        
        tooltipElements.forEach(element => {
            element.addEventListener('mouseenter', (e) => this.showTooltip(e.target));
            element.addEventListener('mouseleave', (e) => this.hideTooltip(e.target));
        });
    }

    showTooltip(element) {
        const tooltipText = element.getAttribute('data-tooltip');
        if (!tooltipText) return;

        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = tooltipText;
        
        document.body.appendChild(tooltip);
        
        // Posicionar tooltip
        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + 'px';
        
        element.tooltip = tooltip;
    }

    hideTooltip(element) {
        if (element.tooltip) {
            element.tooltip.remove();
            element.tooltip = null;
        }
    }

    // Sistema de scroll suave
    smoothScrollTo(element, offset = 0) {
        const targetPosition = element.offsetTop - offset;
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }

    // Sistema de animações
    animateElement(element, animation, duration = 300) {
        element.style.animation = `${animation} ${duration}ms ease-in-out`;
        
        setTimeout(() => {
            element.style.animation = '';
        }, duration);
    }

    // Getters para uso externo
    getSidebarState() {
        return this.isSidebarOpen;
    }

    getDeviceType() {
        return {
            isMobile: this.isMobile,
            isTablet: this.isTablet,
            isDesktop: this.isDesktop
        };
    }

    getCurrentTheme() {
        return this.currentTheme;
    }

    // Verificar se elemento está visível na tela
    isElementVisible(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // Scroll para elemento
    scrollToElement(element, behavior = 'smooth') {
        element.scrollIntoView({ behavior, block: 'start' });
    }
}

// Exportar para uso global
window.UIManager = UIManager; 