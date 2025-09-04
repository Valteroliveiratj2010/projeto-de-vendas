/**
 * 🔐 Módulo de Autenticação - Refatorado
 * Sistema de autenticação robusto e seguro
 */

class AuthModule {
    constructor(app) {
        this.app = app;
        this.isAuthenticated = false;
        this.user = null;
        this.token = null;
        this.refreshTimer = null;
        this.checkInterval = null;

        this.config = {
            tokenKey: 'authToken',
            userDataKey: 'userData',
            tokenExpiry: 24 * 60 * 60 * 1000, // 24 horas
            refreshThreshold: 5 * 60 * 1000, // 5 minutos
            checkInterval: 30 * 1000 // 30 segundos
        };
    }

    async init() {
        console.log('🔐 Inicializando módulo de autenticação...');

        // Verificar autenticação inicial
        await this.checkAuthStatus();

        // Configurar event listeners
        this.setupEventListeners();

        // Iniciar verificação periódica
        this.startPeriodicCheck();

        console.log('✅ Módulo de autenticação inicializado');
    }

    async checkAuthStatus() {
        try {
            const token = localStorage.getItem(this.config.tokenKey);
            const userData = localStorage.getItem(this.config.userDataKey);

            if (token && userData) {
                // Verificar se o token ainda é válido
                const isValid = await this.validateToken(token);

                if (isValid) {
                    this.isAuthenticated = true;
                    this.user = JSON.parse(userData);
                    this.token = token;

                    // Configurar refresh automático
                    this.setupTokenRefresh();

                    console.log('✅ Usuário autenticado:', this.user.email);
                    return true;
                } else {
                    // Token inválido, fazer logout
                    await this.logout();
                }
            }

            this.isAuthenticated = false;
            this.user = null;
            this.token = null;

            return false;

        } catch (error) {
            console.error('❌ Erro ao verificar autenticação:', error);
            await this.logout();
            return false;
        }
    }

    async validateToken(token) {
        try {
            const response = await this.app.api.get('/auth/verify', {
                headers: { Authorization: `Bearer ${token}` }
            });

            return response.data && response.data.success;
        } catch (error) {
            console.warn('⚠️ Token inválido:', error);
            return false;
        }
    }

    async login(credentials) {
        try {
            // Validar credenciais
            const validation = this.validateCredentials(credentials);
            if (!validation.isValid) {
                return {
                    success: false,
                    error: validation.errors
                };
            }

            // Fazer requisição de login
            const response = await this.app.api.post('/auth/login', credentials);

            if (response.data && response.data.success) {
                const { token, user } = response.data.data;

                // Salvar dados de autenticação
                this.isAuthenticated = true;
                this.user = user;
                this.token = token;

                localStorage.setItem(this.config.tokenKey, token);
                localStorage.setItem(this.config.userDataKey, JSON.stringify(user));

                // Configurar refresh automático
                this.setupTokenRefresh();

                // Emitir evento de login
                this.app.eventBus.publish('auth:login', { user });

                console.log('✅ Login bem-sucedido:', user.email);

                return { success: true, data: { user, token } };
            } else {
                return {
                    success: false,
                    error: response.data.error || 'Erro no login'
                };
            }

        } catch (error) {
            console.error('❌ Erro no login:', error);
            return {
                success: false,
                error: 'Erro de conexão'
            };
        }
    }

    async logout() {
        try {
            // Invalidar token no servidor se possível
            if (this.token) {
                try {
                    await this.app.api.post('/auth/logout', {}, {
                        headers: { Authorization: `Bearer ${this.token}` }
                    });
                } catch (error) {
                    console.warn('⚠️ Erro ao invalidar token no servidor:', error);
                }
            }

            // Limpar dados locais
            this.isAuthenticated = false;
            this.user = null;
            this.token = null;

            localStorage.removeItem(this.config.tokenKey);
            localStorage.removeItem(this.config.userDataKey);

            // Parar timers
            this.stopTokenRefresh();
            this.stopPeriodicCheck();

            // Emitir evento de logout
            this.app.eventBus.publish('auth:logout');

            console.log('✅ Logout realizado com sucesso');

        } catch (error) {
            console.error('❌ Erro no logout:', error);
        }
    }

    validateCredentials(credentials) {
        const errors = {};

        if (!credentials.email) {
            errors.email = 'Email é obrigatório';
        } else if (!this.isValidEmail(credentials.email)) {
            errors.email = 'Email inválido';
        }

        if (!credentials.password) {
            errors.password = 'Senha é obrigatória';
        } else if (credentials.password.length < 6) {
            errors.password = 'Senha deve ter pelo menos 6 caracteres';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    setupTokenRefresh() {
        // Parar timer anterior se existir
        this.stopTokenRefresh();

        // Configurar refresh automático
        this.refreshTimer = setTimeout(async () => {
            await this.refreshToken();
        }, this.config.tokenExpiry - this.config.refreshThreshold);
    }

    async refreshToken() {
        try {
            const response = await this.app.api.post('/auth/refresh', {}, {
                headers: { Authorization: `Bearer ${this.token}` }
            });

            if (response.data && response.data.success) {
                const { token } = response.data.data;

                // Atualizar token
                this.token = token;
                localStorage.setItem(this.config.tokenKey, token);

                // Configurar próximo refresh
                this.setupTokenRefresh();

                console.log('✅ Token renovado com sucesso');

            } else {
                // Token não pode ser renovado, fazer logout
                await this.logout();
            }

        } catch (error) {
            console.error('❌ Erro ao renovar token:', error);
            await this.logout();
        }
    }

    startPeriodicCheck() {
        this.checkInterval = setInterval(async () => {
            await this.checkAuthStatus();
        }, this.config.checkInterval);
    }

    stopPeriodicCheck() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }

    stopTokenRefresh() {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
            this.refreshTimer = null;
        }
    }

    setupEventListeners() {
        // Event listener para formulário de login
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const email = document.getElementById('email')?.value;
                const password = document.getElementById('password')?.value;

                if (email && password) {
                    const result = await this.login({ email, password });
                    if (!result.success) {
                        this.showLoginError(result.error);
                    }
                }
            });
        }

        // Event listeners para botões de logout
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="logout"]')) {
                e.preventDefault();
                this.logout();
            }
        });
    }

    showLoginError(error) {
        const errorDiv = document.getElementById('login-error');
        if (errorDiv) {
            if (typeof error === 'object') {
                errorDiv.textContent = Object.values(error).join(', ');
            } else {
                errorDiv.textContent = error;
            }
            errorDiv.style.display = 'block';
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

    // Middleware para rotas protegidas
    async requireAuth(route) {
        if (route.requiresAuth && !this.isAuthenticated) {
            console.log('🚫 Acesso negado - usuário não autenticado');

            // Redirecionar para login
            window.location.href = '/login';
            return false;
        }

        return true;
    }
}

// Exportar para uso global
window.AuthModule = AuthModule; 