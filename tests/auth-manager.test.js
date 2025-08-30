/**
 * 🧪 Testes do AuthManager
 */

describe('AuthManager', () => {
  let authManager;
  
  beforeEach(() => {
    // Limpar todos os mocks antes de cada teste
    clearAllMocks();
    
    // Mock do DOM básico
    document.body.innerHTML = `
      <div id="header-logout-btn" style="display: none;"></div>
      <div id="logout-btn" style="display: none;"></div>
      <div id="user-info" style="display: none;"></div>
      <div id="login-section" style="display: block;"></div>
      <div id="user-name"></div>
      <div id="user-role"></div>
      <form id="login-form">
        <input id="email" value="test@example.com">
        <input id="password" value="password123">
      </form>
      <div id="login-error" style="display: none;"></div>
    `;
    
    // Mock do fetch para login
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        token: 'test-token-123',
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          role: 'admin'
        }
      })
    });
    
    // Criar instância do AuthManager
    authManager = new AuthManager();
  });
  
  afterEach(() => {
    // Limpar intervalos
    if (authManager.authCheckInterval) {
      clearInterval(authManager.authCheckInterval);
    }
  });
  
  describe('Inicialização', () => {
    test('deve inicializar corretamente', () => {
      expect(authManager.isAuthenticated).toBe(false);
      expect(authManager.user).toBe(null);
      expect(authManager.token).toBe(null);
    });
    
    test('deve configurar event listeners', () => {
      const loginForm = document.getElementById('login-form');
      expect(loginForm).toBeTruthy();
    });
  });
  
  describe('Verificação de autenticação', () => {
    test('deve retornar false quando não há token', () => {
      const result = authManager.checkAuthStatus();
      expect(result).toBe(false);
    });
    
    test('deve retornar true quando há token válido', () => {
      // Simular dados no localStorage
      localStorage.getItem.mockReturnValueOnce('valid-token');
      localStorage.getItem.mockReturnValueOnce(JSON.stringify({
        id: 1,
        name: 'Test User',
        email: 'test@example.com'
      }));
      
      const result = authManager.checkAuthStatus();
      expect(result).toBe(true);
    });
    
    test('deve fazer logout em caso de erro', () => {
      // Simular erro no localStorage
      localStorage.getItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });
      
      const logoutSpy = jest.spyOn(authManager, 'logout');
      authManager.checkAuthStatus();
      
      expect(logoutSpy).toHaveBeenCalled();
    });
  });
  
  describe('Login', () => {
    test('deve fazer login com sucesso', async () => {
      const result = await authManager.login('test@example.com', 'password123');
      
      expect(result.success).toBe(true);
      expect(authManager.isAuthenticated).toBe(true);
      expect(authManager.token).toBe('test-token-123');
      expect(authManager.user.name).toBe('Test User');
    });
    
    test('deve salvar dados no localStorage após login', async () => {
      await authManager.login('test@example.com', 'password123');
      
      expect(localStorage.setItem).toHaveBeenCalledWith('authToken', 'test-token-123');
      expect(localStorage.setItem).toHaveBeenCalledWith('userData', expect.any(String));
    });
    
    test('deve atualizar UI após login', async () => {
      const updateUISpy = jest.spyOn(authManager, 'updateUI');
      
      await authManager.login('test@example.com', 'password123');
      
      expect(updateUISpy).toHaveBeenCalled();
    });
    
    test('deve lidar com erro de login', async () => {
      // Mock de erro no fetch
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          error: 'Credenciais inválidas'
        })
      });
      
      const result = await authManager.login('wrong@example.com', 'wrongpass');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Credenciais inválidas');
    });
    
    test('deve lidar com erro de conexão', async () => {
      // Mock de erro de rede
      fetch.mockRejectedValueOnce(new Error('Network error'));
      
      const result = await authManager.login('test@example.com', 'password123');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Erro de conexão');
    });
  });
  
  describe('Logout', () => {
    test('deve fazer logout corretamente', () => {
      // Simular usuário logado
      authManager.isAuthenticated = true;
      authManager.user = { name: 'Test User' };
      authManager.token = 'test-token';
      
      authManager.logout();
      
      expect(authManager.isAuthenticated).toBe(false);
      expect(authManager.user).toBe(null);
      expect(authManager.token).toBe(null);
    });
    
    test('deve limpar localStorage no logout', () => {
      authManager.logout();
      
      expect(localStorage.removeItem).toHaveBeenCalledWith('authToken');
      expect(localStorage.removeItem).toHaveBeenCalledWith('userData');
    });
    
    test('deve atualizar UI no logout', () => {
      const updateUISpy = jest.spyOn(authManager, 'updateUI');
      
      authManager.logout();
      
      expect(updateUISpy).toHaveBeenCalled();
    });
  });
  
  describe('Atualização de UI', () => {
    test('deve mostrar elementos de usuário logado quando autenticado', () => {
      authManager.isAuthenticated = true;
      authManager.user = { name: 'Test User', role: 'admin' };
      
      authManager.updateUI();
      
      const headerLogoutBtn = document.getElementById('header-logout-btn');
      const sidebarLogoutBtn = document.getElementById('logout-btn');
      const userInfo = document.getElementById('user-info');
      const loginSection = document.getElementById('login-section');
      
      expect(headerLogoutBtn.style.display).toBe('inline-block');
      expect(sidebarLogoutBtn.style.display).toBe('inline-block');
      expect(userInfo.style.display).toBe('flex');
      expect(loginSection.style.display).toBe('none');
    });
    
    test('deve ocultar elementos de usuário quando não autenticado', () => {
      authManager.isAuthenticated = false;
      
      authManager.updateUI();
      
      const headerLogoutBtn = document.getElementById('header-logout-btn');
      const sidebarLogoutBtn = document.getElementById('logout-btn');
      const userInfo = document.getElementById('user-info');
      const loginSection = document.getElementById('login-section');
      
      expect(headerLogoutBtn.style.display).toBe('none');
      expect(sidebarLogoutBtn.style.display).toBe('none');
      expect(userInfo.style.display).toBe('none');
      expect(loginSection.style.display).toBe('block');
    });
    
    test('deve atualizar informações do usuário', () => {
      authManager.isAuthenticated = true;
      authManager.user = { name: 'Test User', role: 'admin' };
      
      authManager.updateUserInfo();
      
      const userName = document.getElementById('user-name');
      const userRole = document.getElementById('user-role');
      
      expect(userName.textContent).toBe('Test User');
      expect(userRole.textContent).toBe('admin');
    });
  });
  
  describe('Permissões', () => {
    test('deve verificar permissões corretamente', () => {
      authManager.isAuthenticated = true;
      authManager.user = { role: 'admin' };
      
      expect(authManager.hasPermission('read')).toBe(true);
      expect(authManager.hasPermission('write')).toBe(true);
      expect(authManager.hasPermission('delete')).toBe(true);
    });
    
    test('deve retornar false para usuário não autenticado', () => {
      authManager.isAuthenticated = false;
      
      expect(authManager.hasPermission('read')).toBe(false);
    });
    
    test('deve verificar permissões de vendedor', () => {
      authManager.isAuthenticated = true;
      authManager.user = { role: 'vendedor' };
      
      expect(authManager.hasPermission('read')).toBe(true);
      expect(authManager.hasPermission('write')).toBe(true);
      expect(authManager.hasPermission('delete')).toBe(false);
    });
  });
  
  describe('Event Listeners', () => {
    test('deve configurar event listener para formulário de login', () => {
      const loginForm = document.getElementById('login-form');
      const submitEvent = new Event('submit');
      
      loginForm.dispatchEvent(submitEvent);
      
      // Verificar se fetch foi chamado (indicando que o event listener está funcionando)
      expect(fetch).toHaveBeenCalled();
    });
    
    test('deve configurar event listener para botões de logout', () => {
      const headerLogoutBtn = document.getElementById('header-logout-btn');
      const logoutSpy = jest.spyOn(authManager, 'logout');
      
      headerLogoutBtn.click();
      
      expect(logoutSpy).toHaveBeenCalled();
    });
  });
  
  describe('Verificação periódica', () => {
    test('deve iniciar verificação periódica', () => {
      const startSpy = jest.spyOn(authManager, 'startPeriodicAuthCheck');
      
      authManager.startPeriodicAuthCheck();
      
      expect(startSpy).toHaveBeenCalled();
      expect(authManager.authCheckInterval).toBeTruthy();
    });
    
    test('deve parar verificação periódica', () => {
      authManager.startPeriodicAuthCheck();
      authManager.stopPeriodicAuthCheck();
      
      expect(authManager.authCheckInterval).toBe(null);
    });
  });
  
  describe('Getters', () => {
    test('deve retornar status de autenticação', () => {
      authManager.isAuthenticated = true;
      
      expect(authManager.getAuthStatus()).toBe(true);
    });
    
    test('deve retornar dados do usuário', () => {
      const userData = { name: 'Test User' };
      authManager.user = userData;
      
      expect(authManager.getUser()).toBe(userData);
    });
    
    test('deve retornar token', () => {
      authManager.token = 'test-token';
      
      expect(authManager.getToken()).toBe('test-token');
    });
  });
}); 