/**
 * Sistema de Autenticação - Serviço Completo
 * Usa JWT para tokens e bcrypt para hash de senhas
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs').promises;
const path = require('path');

class AuthService {
    constructor() {
        this.secretKey = process.env.JWT_SECRET || 'sistema-vendas-secret-key-2024';
        this.usersFile = path.join(__dirname, '../data/users.json');
        this.sessions = new Map(); // Armazenamento em memória para sessões ativas
        
        this.init();
    }
    
    async init() {
        try {
            console.log('🔐 Inicializando serviço de autenticação...');
            
            // Criar diretório de dados se não existir
            const dataDir = path.dirname(this.usersFile);
            try {
                await fs.access(dataDir);
            } catch {
                await fs.mkdir(dataDir, { recursive: true });
            }
            
            // Criar arquivo de usuários se não existir
            try {
                await fs.access(this.usersFile);
            } catch {
                await this.createDefaultUsers();
            }
            
            console.log('✅ Serviço de autenticação inicializado');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar serviço de autenticação:', error.message);
        }
    }
    
    async createDefaultUsers() {
        try {
            const defaultUsers = [
                {
                    id: 1,
                    email: 'admin@sistema.com',
                    password: await bcrypt.hash('admin123', 10),
                    name: 'Administrador',
                    role: 'admin',
                    active: true,
                    createdAt: new Date().toISOString(),
                    lastLogin: null
                },
                {
                    id: 2,
                    email: 'vendedor@sistema.com',
                    password: await bcrypt.hash('vendedor123', 10),
                    name: 'Vendedor',
                    role: 'vendedor',
                    active: true,
                    createdAt: new Date().toISOString(),
                    lastLogin: null
                },
                {
                    id: 3,
                    email: 'gerente@sistema.com',
                    password: await bcrypt.hash('gerente123', 10),
                    name: 'Gerente',
                    role: 'gerente',
                    active: true,
                    createdAt: new Date().toISOString(),
                    lastLogin: null
                }
            ];
            
            await fs.writeFile(this.usersFile, JSON.stringify(defaultUsers, null, 2));
            console.log('✅ Usuários padrão criados');
            
        } catch (error) {
            console.error('❌ Erro ao criar usuários padrão:', error.message);
        }
    }
    
    async loadUsers() {
        try {
            const data = await fs.readFile(this.usersFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('❌ Erro ao carregar usuários:', error.message);
            return [];
        }
    }
    
    async saveUsers(users) {
        try {
            await fs.writeFile(this.usersFile, JSON.stringify(users, null, 2));
        } catch (error) {
            console.error('❌ Erro ao salvar usuários:', error.message);
            throw error;
        }
    }
    
    async findUserByEmail(email) {
        try {
            const users = await this.loadUsers();
            return users.find(user => user.email.toLowerCase() === email.toLowerCase());
        } catch (error) {
            console.error('❌ Erro ao buscar usuário:', error.message);
            return null;
        }
    }
    
    async findUserById(id) {
        try {
            const users = await this.loadUsers();
            return users.find(user => user.id === parseInt(id));
        } catch (error) {
            console.error('❌ Erro ao buscar usuário por ID:', error.message);
            return null;
        }
    }
    
    async validateCredentials(email, password) {
        try {
            const user = await this.findUserByEmail(email);
            
            if (!user) {
                return { success: false, error: 'Usuário não encontrado' };
            }
            
            if (!user.active) {
                return { success: false, error: 'Usuário inativo' };
            }
            
            const isPasswordValid = await bcrypt.compare(password, user.password);
            
            if (!isPasswordValid) {
                return { success: false, error: 'Senha incorreta' };
            }
            
            return { success: true, user };
            
        } catch (error) {
            console.error('❌ Erro na validação de credenciais:', error.message);
            return { success: false, error: 'Erro interno do servidor' };
        }
    }
    
    async login(email, password, rememberMe = false) {
        try {
            console.log(`🔑 Tentativa de login para: ${email}`);
            
            const validation = await this.validateCredentials(email, password);
            
            if (!validation.success) {
                return validation;
            }
            
            const user = validation.user;
            
            // Atualizar último login
            await this.updateLastLogin(user.id);
            
            // Gerar token JWT
            const token = this.generateToken(user);
            
            // Criar sessão
            const session = this.createSession(user, rememberMe);
            
            console.log(`✅ Login bem-sucedido para: ${email}`);
            
            return {
                success: true,
                data: {
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        lastLogin: user.lastLogin
                    },
                    expiresIn: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60, // 30 dias ou 24 horas
                    sessionId: session.id
                }
            };
            
        } catch (error) {
            console.error('❌ Erro no login:', error.message);
            return { success: false, error: 'Erro interno do servidor' };
        }
    }
    
    generateToken(user) {
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 dias
        };
        
        return jwt.sign(payload, this.secretKey);
    }
    
    verifyToken(token) {
        try {
            const decoded = jwt.verify(token, this.secretKey);
            return { success: true, data: decoded };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    createSession(user, rememberMe) {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const session = {
            id: sessionId,
            userId: user.id,
            email: user.email,
            role: user.role,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000)),
            active: true
        };
        
        this.sessions.set(sessionId, session);
        
        // Limpar sessões expiradas
        this.cleanupExpiredSessions();
        
        return session;
    }
    
    getSession(sessionId) {
        const session = this.sessions.get(sessionId);
        
        if (!session || !session.active) {
            return null;
        }
        
        if (new Date() > new Date(session.expiresAt)) {
            this.sessions.delete(sessionId);
            return null;
        }
        
        return session;
    }
    
    invalidateSession(sessionId) {
        this.sessions.delete(sessionId);
    }
    
    cleanupExpiredSessions() {
        const now = new Date();
        
        for (const [sessionId, session] of this.sessions.entries()) {
            if (now > new Date(session.expiresAt)) {
                this.sessions.delete(sessionId);
            }
        }
    }
    
    async updateLastLogin(userId) {
        try {
            const users = await this.loadUsers();
            const userIndex = users.findIndex(user => user.id === userId);
            
            if (userIndex !== -1) {
                users[userIndex].lastLogin = new Date().toISOString();
                await this.saveUsers(users);
            }
        } catch (error) {
            console.error('❌ Erro ao atualizar último login:', error.message);
        }
    }
    
    async createUser(userData) {
        try {
            const users = await this.loadUsers();
            
            // Verificar se email já existe
            const existingUser = users.find(user => user.email.toLowerCase() === userData.email.toLowerCase());
            if (existingUser) {
                return { success: false, error: 'Email já cadastrado' };
            }
            
            // Gerar novo ID
            const newId = Math.max(...users.map(user => user.id), 0) + 1;
            
            // Hash da senha
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            
            const newUser = {
                id: newId,
                email: userData.email,
                password: hashedPassword,
                name: userData.name,
                role: userData.role || 'vendedor',
                active: true,
                createdAt: new Date().toISOString(),
                lastLogin: null
            };
            
            users.push(newUser);
            await this.saveUsers(users);
            
            console.log(`✅ Usuário criado: ${userData.email}`);
            
            return {
                success: true,
                data: {
                    id: newUser.id,
                    email: newUser.email,
                    name: newUser.name,
                    role: newUser.role
                }
            };
            
        } catch (error) {
            console.error('❌ Erro ao criar usuário:', error.message);
            return { success: false, error: 'Erro interno do servidor' };
        }
    }
    
    async updateUser(userId, updateData) {
        try {
            const users = await this.loadUsers();
            const userIndex = users.findIndex(user => user.id === userId);
            
            if (userIndex === -1) {
                return { success: false, error: 'Usuário não encontrado' };
            }
            
            // Atualizar campos permitidos
            const allowedFields = ['name', 'role', 'active'];
            for (const field of allowedFields) {
                if (updateData[field] !== undefined) {
                    users[userIndex][field] = updateData[field];
                }
            }
            
            await this.saveUsers(users);
            
            console.log(`✅ Usuário atualizado: ${users[userIndex].email}`);
            
            return {
                success: true,
                data: {
                    id: users[userIndex].id,
                    email: users[userIndex].email,
                    name: users[userIndex].name,
                    role: users[userIndex].role,
                    active: users[userIndex].active
                }
            };
            
        } catch (error) {
            console.error('❌ Erro ao atualizar usuário:', error.message);
            return { success: false, error: 'Erro interno do servidor' };
        }
    }
    
    async changePassword(userId, currentPassword, newPassword) {
        try {
            const users = await this.loadUsers();
            const userIndex = users.findIndex(user => user.id === userId);
            
            if (userIndex === -1) {
                return { success: false, error: 'Usuário não encontrado' };
            }
            
            // Verificar senha atual
            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, users[userIndex].password);
            if (!isCurrentPasswordValid) {
                return { success: false, error: 'Senha atual incorreta' };
            }
            
            // Hash da nova senha
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            users[userIndex].password = hashedNewPassword;
            
            await this.saveUsers(users);
            
            console.log(`✅ Senha alterada para usuário: ${users[userIndex].email}`);
            
            return { success: true, message: 'Senha alterada com sucesso' };
            
        } catch (error) {
            console.error('❌ Erro ao alterar senha:', error.message);
            return { success: false, error: 'Erro interno do servidor' };
        }
    }
    
    async deleteUser(userId) {
        try {
            const users = await this.loadUsers();
            const userIndex = users.findIndex(user => user.id === userId);
            
            if (userIndex === -1) {
                return { success: false, error: 'Usuário não encontrado' };
            }
            
            const deletedUser = users[userIndex];
            users.splice(userIndex, 1);
            
            await this.saveUsers(users);
            
            console.log(`✅ Usuário deletado: ${deletedUser.email}`);
            
            return { success: true, message: 'Usuário deletado com sucesso' };
            
        } catch (error) {
            console.error('❌ Erro ao deletar usuário:', error.message);
            return { success: false, error: 'Erro interno do servidor' };
        }
    }
    
    async getAllUsers() {
        try {
            const users = await this.loadUsers();
            
            // Remover senhas dos dados retornados
            const safeUsers = users.map(user => ({
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                active: user.active,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin
            }));
            
            return { success: true, data: safeUsers };
            
        } catch (error) {
            console.error('❌ Erro ao obter usuários:', error.message);
            return { success: false, error: 'Erro interno do servidor' };
        }
    }
    
    getStatus() {
        return {
            active: true,
            totalUsers: this.sessions.size,
            activeSessions: this.sessions.size,
            secretKeyConfigured: !!this.secretKey
        };
    }
}

module.exports = AuthService; 