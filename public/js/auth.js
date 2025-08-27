/**
 * SISTEMA DE AUTENTICAÇÃO - VERSÃO FUNCIONAL
 * Sistema simples e funcional
 */

class AuthSystem {
    constructor() {
        this.isAuthenticated = false;
        this.user = null;
        this.token = null;
        this.init();
    }

    init() {
        console.log('🔐 Inicializando sistema de autenticação...');
        
        // Verificar status imediatamente
        this.checkAuthStatus();
        
        // Verificar rota imediatamente
        this.checkRoute();
        
        this.setupEventListeners();
        
        // Verificar rota automaticamente após um delay
        setTimeout(() => {
            this.checkRoute();
        }, 500);
        
        // Verificar status periodicamente
        setInterval(() => {
            this.checkAuthStatus();
            this.checkRoute();
        }, 3000);
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
                
                // Atualizar interface imediatamente
                this.updateUI();
                
                return true;
            }
        } catch (error) {
            console.error('❌ Erro ao verificar autenticação:', error);
            this.logout();
        }
        
        this.isAuthenticated = false;
        this.user = null;
        this.token = null;
        
        // Atualizar interface para usuário não logado
        this.updateUI();
        
        // Verificar rota imediatamente após mudança de status
        this.checkRoute();
        
        return false;
    }
    
    updateUI() {
        const headerLogoutBtn = document.getElementById('header-logout-btn');
        const sidebarLogoutBtn = document.getElementById('logout-btn');
        const userInfo = document.getElementById('user-info');
        const loginSection = document.getElementById('login-section');
        
        if (this.isAuthenticated) {
            // Usuário logado
            if (headerLogoutBtn) headerLogoutBtn.style.display = 'inline-block';
            if (sidebarLogoutBtn) sidebarLogoutBtn.style.display = 'inline-block';
            if (userInfo) userInfo.style.display = 'flex';
            if (loginSection) loginSection.style.display = 'none';
            
            // Preencher informações do usuário
            try {
                const userName = document.getElementById('user-name');
                const userRole = document.getElementById('user-role');
                
                if (userName) userName.textContent = this.user.name || this.user.email;
                if (userRole) userRole.textContent = this.user.role || 'Administrador';
            } catch (error) {
                console.error('Erro ao carregar dados do usuário:', error);
            }
            
        } else {
            // Usuário não logado
            if (headerLogoutBtn) headerLogoutBtn.style.display = 'none';
            if (sidebarLogoutBtn) sidebarLogoutBtn.style.display = 'none';
            if (userInfo) userInfo.style.display = 'none';
            if (loginSection) loginSection.style.display = 'block';
        }
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
                // Salvar dados
                localStorage.setItem('authToken', data.data.token);
                localStorage.setItem('userData', JSON.stringify(data.data.user));
                
                // Atualizar estado
                this.isAuthenticated = true;
                this.user = data.data.user;
                this.token = data.data.token;
                
                // Atualizar interface
                this.updateUI();
                
                // Redirecionar para página principal
                window.location.replace('/');
                
            } else {
                throw new Error(data.error || 'Erro no login');
            }
            
        } catch (error) {
            console.error('❌ Erro no login:', error);
            throw error;
        }
    }

    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        this.isAuthenticated = false;
        this.user = null;
        this.token = null;
        
        // Atualizar interface
        this.updateUI();
        
        window.location.href = '/login';
    }

    checkRoute() {
        const currentPath = window.location.pathname;
        const isLoggedIn = this.isAuthenticated;
        
        console.log('🔍 Verificando rota:', currentPath, 'Usuário logado:', isLoggedIn);
        
        // Se estiver na página de login e não estiver logado, permitir acesso
        if (currentPath === '/login') {
            if (isLoggedIn) {
                // Usuário logado tentando acessar login - redirecionar para página principal
                console.log('🔄 Usuário logado, redirecionando para página principal...');
                window.location.replace('/');
            }
            return; // Permitir acesso à página de login
        }
        
        // Para todas as outras páginas, verificar autenticação
        if (!isLoggedIn) {
            console.log('🚫 Usuário não autenticado, redirecionando para login...');
            window.location.replace('/login');
            return;
        }
        
        // Usuário autenticado, permitir acesso
        console.log('✅ Usuário autenticado, acesso permitido');
    }

    setupEventListeners() {
        // Configurar botões de logout quando disponíveis
        document.addEventListener('DOMContentLoaded', () => {
            const headerLogoutBtn = document.getElementById('header-logout-btn');
            const sidebarLogoutBtn = document.getElementById('logout-btn');
            
            if (headerLogoutBtn) {
                headerLogoutBtn.addEventListener('click', () => this.logout());
            }
            
            if (sidebarLogoutBtn) {
                sidebarLogoutBtn.addEventListener('click', () => this.logout());
            }
        });
    }
}

// Inicializar sistema de autenticação
window.authSystem = new AuthSystem();

// Exportar função para uso global
window.checkAuthStatus = () => {
    if (window.authSystem) {
        return window.authSystem.checkAuthStatus();
    }
    return false;
};

// Verificar autenticação imediatamente quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔐 Verificando autenticação na carga da página...');
    if (window.authSystem) {
        window.authSystem.checkRoute();
    }
});

// Verificar autenticação também quando a página termina de carregar
window.addEventListener('load', () => {
    console.log('🔐 Verificando autenticação após carga completa...');
    if (window.authSystem) {
        window.authSystem.checkRoute();
    }
}); 