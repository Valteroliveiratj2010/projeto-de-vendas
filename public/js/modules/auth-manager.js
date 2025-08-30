/**
 * 🔐 AUTH MANAGER - Módulo de Gerenciamento de Autenticação
 * Responsável por toda a lógica de autenticação e autorização
 */

class AuthManager {
    constructor() {
        this.isAuthenticated = false;
        this.user = null;
        this.token = null;
        this.authCheckInterval = null;
        this.init();
    }

    init() {
        console.log('🔐 Inicializando AuthManager...');
        this.checkAuthStatus();
        this.setupEventListeners();
        this.startPeriodicAuthCheck();
    }

    checkAuthStatus() {
        try {
            const token = localStorage.getItem('authToken');
            const userData = localStorage.getItem('userData');
            
            if (token && userData) {
                const user = JSON.parse(userData);
                this.isAuthenticated = true;
                this.user = user;
                this.token = token;
                this.updateUI();
                
                // Se estamos na página de login e já autenticados, redirecionar para dashboard
                if (window.location.pathname === '/login.html') {
                    console.log('✅ Usuário já autenticado na página de login, redirecionando...');
                    this.redirectToDashboard();
                }
                
                return true;
            }
        } catch (error) {
            console.error('❌ Erro ao verificar autenticação:', error);
            this.logout();
        }
        
        this.isAuthenticated = false;
        this.user = null;
        this.token = null;
        this.updateUI();
        
        // Se não estamos autenticados e estamos na página principal, redirecionar para login
        if (window.location.pathname === '/' && !window.location.hash.includes('login')) {
            console.log('🔐 Usuário não autenticado na página principal, redirecionando para login...');
            this.redirectToLogin();
        }
        
        return false;
    }

    async login(email, password) {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                this.token = data.token;
                this.user = data.user;
                this.isAuthenticated = true;
                
                localStorage.setItem('authToken', this.token);
                localStorage.setItem('userData', JSON.stringify(this.user));
                
                this.updateUI();
                this.redirectToDashboard();
                return { success: true };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('❌ Erro no login:', error);
            return { success: false, error: 'Erro de conexão' };
        }
    }

    logout() {
        this.isAuthenticated = false;
        this.user = null;
        this.token = null;
        
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        
        this.updateUI();
        this.redirectToLogin();
    }

    updateUI() {
        const headerLogoutBtn = document.getElementById('header-logout-btn');
        const sidebarLogoutBtn = document.getElementById('logout-btn');
        const userInfo = document.getElementById('user-info');
        const loginSection = document.getElementById('login-section');
        
        if (this.isAuthenticated) {
            if (headerLogoutBtn) headerLogoutBtn.style.display = 'inline-block';
            if (sidebarLogoutBtn) sidebarLogoutBtn.style.display = 'inline-block';
            if (userInfo) userInfo.style.display = 'flex';
            if (loginSection) loginSection.style.display = 'none';
            
            this.updateUserInfo();
        } else {
            if (headerLogoutBtn) headerLogoutBtn.style.display = 'none';
            if (sidebarLogoutBtn) sidebarLogoutBtn.style.display = 'none';
            if (userInfo) userInfo.style.display = 'none';
            if (loginSection) loginSection.style.display = 'block';
        }
    }

    updateUserInfo() {
        try {
            const userName = document.getElementById('user-name');
            const userRole = document.getElementById('user-role');
            
            if (userName) userName.textContent = this.user.name || this.user.email;
            if (userRole) userRole.textContent = this.user.role || 'Administrador';
        } catch (error) {
            console.error('Erro ao carregar dados do usuário:', error);
        }
    }

    redirectToDashboard() {
        // Verificar se já estamos na página principal
        if (window.location.pathname === '/login.html') {
            window.location.href = '/#dashboard';
        } else {
            // Se já estamos na página principal, apenas navegar para dashboard
            if (window.routingManager) {
                window.routingManager.navigateTo('dashboard');
            } else {
                window.location.hash = '#dashboard';
            }
        }
    }

    redirectToLogin() {
        // Verificar se já estamos na página de login
        if (window.location.pathname !== '/login.html') {
            console.log('🔐 Redirecionando para página de login...');
            window.location.href = '/login.html?message=authentication_required';
        } else {
            console.log('🔐 Já estamos na página de login');
        }
    }

    setupEventListeners() {
        // Event listeners para botões de logout
        document.addEventListener('click', (e) => {
            if (e.target.id === 'header-logout-btn' || e.target.id === 'logout-btn') {
                e.preventDefault();
                this.logout();
            }
        });

        // Event listener para formulário de login
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                
                const result = await this.login(email, password);
                if (!result.success) {
                    this.showLoginError(result.error);
                }
            });
        }
    }

    showLoginError(message) {
        const errorDiv = document.getElementById('login-error');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
    }

    startPeriodicAuthCheck() {
        this.authCheckInterval = setInterval(() => {
            this.checkAuthStatus();
        }, 30000); // Verificar a cada 30 segundos
    }

    stopPeriodicAuthCheck() {
        if (this.authCheckInterval) {
            clearInterval(this.authCheckInterval);
            this.authCheckInterval = null;
        }
    }

    // Getters para uso externo
    getAuthStatus() {
        return this.isAuthenticated;
    }

    getUser() {
        return this.user;
    }

    getToken() {
        return this.token;
    }

    // Verificar se usuário tem permissão
    hasPermission(permission) {
        if (!this.isAuthenticated || !this.user) return false;
        
        const userRole = this.user.role;
        const permissions = {
            'admin': ['all'],
            'gerente': ['read', 'write', 'delete'],
            'vendedor': ['read', 'write'],
            'viewer': ['read']
        };
        
        return permissions[userRole]?.includes(permission) || 
               permissions[userRole]?.includes('all');
    }
}

// Exportar para uso global
window.AuthManager = AuthManager; 