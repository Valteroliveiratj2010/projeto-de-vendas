/**
 * Rotas de Autenticação
 * Endpoints para login, logout e gerenciamento de usuários
 */

const express = require('express');
const router = express.Router();
const AuthService = require('../utils/auth-service');
const { body, validationResult } = require('express-validator');

const authService = new AuthService();

// Middleware para verificar token JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Token de acesso não fornecido'
        });
    }
    
    const verification = authService.verifyToken(token);
    if (!verification.success) {
        return res.status(403).json({
            success: false,
            error: 'Token inválido ou expirado'
        });
    }
    
    req.user = verification.data;
    next();
};

// Middleware para verificar permissões de admin
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Acesso negado. Requer permissões de administrador.'
        });
    }
    next();
};

// Rota de status do sistema de autenticação
router.get('/status', (req, res) => {
    try {
        const status = authService.getStatus();
        res.json({
            success: true,
            data: status
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Rota de login
router.post('/login', [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres')
], async (req, res) => {
    try {
        // Validar dados de entrada
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Dados inválidos',
                details: errors.array()
            });
        }
        
        const { email, password, rememberMe } = req.body;
        
        // Tentar fazer login
        const result = await authService.login(email, password, rememberMe);
        
        if (result.success) {
            res.json(result);
        } else {
            res.status(401).json(result);
        }
        
    } catch (error) {
        console.error('❌ Erro na rota de login:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// Rota de logout
router.post('/logout', authenticateToken, (req, res) => {
    try {
        const token = req.headers['authorization'].split(' ')[1];
        
        // Invalidar sessão se houver
        if (req.user.sessionId) {
            authService.invalidateSession(req.user.sessionId);
        }
        
        res.json({
            success: true,
            message: 'Logout realizado com sucesso'
        });
        
    } catch (error) {
        console.error('❌ Erro na rota de logout:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// Rota para verificar token
router.get('/verify', authenticateToken, (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                user: req.user,
                valid: true
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Rota para obter perfil do usuário
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await authService.findUserById(req.user.userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Usuário não encontrado'
            });
        }
        
        // Remover senha dos dados retornados
        const { password, ...safeUser } = user;
        
        res.json({
            success: true,
            data: safeUser
        });
        
    } catch (error) {
        console.error('❌ Erro ao obter perfil:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// Rota para atualizar perfil do usuário
router.put('/profile', authenticateToken, [
    body('name').optional().isLength({ min: 2 }).withMessage('Nome deve ter pelo menos 2 caracteres'),
    body('email').optional().isEmail().withMessage('Email inválido')
], async (req, res) => {
    try {
        // Validar dados de entrada
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Dados inválidos',
                details: errors.array()
            });
        }
        
        const updateData = {};
        if (req.body.name) updateData.name = req.body.name;
        if (req.body.email) updateData.email = req.body.email;
        
        const result = await authService.updateUser(req.user.userId, updateData);
        
        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
        
    } catch (error) {
        console.error('❌ Erro ao atualizar perfil:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// Rota para alterar senha
router.put('/change-password', authenticateToken, [
    body('currentPassword').isLength({ min: 6 }).withMessage('Senha atual deve ter pelo menos 6 caracteres'),
    body('newPassword').isLength({ min: 6 }).withMessage('Nova senha deve ter pelo menos 6 caracteres')
], async (req, res) => {
    try {
        // Validar dados de entrada
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Dados inválidos',
                details: errors.array()
            });
        }
        
        const { currentPassword, newPassword } = req.body;
        
        const result = await authService.changePassword(req.user.userId, currentPassword, newPassword);
        
        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
        
    } catch (error) {
        console.error('❌ Erro ao alterar senha:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// ROTAS ADMINISTRATIVAS (requerem permissão de admin)

// Rota para listar todos os usuários (admin)
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const result = await authService.getAllUsers();
        res.json(result);
    } catch (error) {
        console.error('❌ Erro ao listar usuários:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// Rota para criar usuário (admin)
router.post('/users', authenticateToken, requireAdmin, [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
    body('name').isLength({ min: 2 }).withMessage('Nome deve ter pelo menos 2 caracteres'),
    body('role').isIn(['admin', 'gerente', 'vendedor']).withMessage('Role inválido')
], async (req, res) => {
    try {
        // Validar dados de entrada
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Dados inválidos',
                details: errors.array()
            });
        }
        
        const { email, password, name, role } = req.body;
        
        const result = await authService.createUser({
            email,
            password,
            name,
            role
        });
        
        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
        
    } catch (error) {
        console.error('❌ Erro ao criar usuário:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// Rota para atualizar usuário (admin)
router.put('/users/:userId', authenticateToken, requireAdmin, [
    body('name').optional().isLength({ min: 2 }).withMessage('Nome deve ter pelo menos 2 caracteres'),
    body('role').optional().isIn(['admin', 'gerente', 'vendedor']).withMessage('Role inválido'),
    body('active').optional().isBoolean().withMessage('Status ativo deve ser booleano')
], async (req, res) => {
    try {
        // Validar dados de entrada
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Dados inválidos',
                details: errors.array()
            });
        }
        
        const userId = parseInt(req.params.userId);
        const updateData = {};
        
        if (req.body.name) updateData.name = req.body.name;
        if (req.body.role) updateData.role = req.body.role;
        if (req.body.active !== undefined) updateData.active = req.body.active;
        
        const result = await authService.updateUser(userId, updateData);
        
        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
        
    } catch (error) {
        console.error('❌ Erro ao atualizar usuário:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// Rota para deletar usuário (admin)
router.delete('/users/:userId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        
        // Não permitir deletar o próprio usuário
        if (userId === req.user.userId) {
            return res.status(400).json({
                success: false,
                error: 'Não é possível deletar seu próprio usuário'
            });
        }
        
        const result = await authService.deleteUser(userId);
        
        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
        
    } catch (error) {
        console.error('❌ Erro ao deletar usuário:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// Rota para redefinir senha de usuário (admin)
router.put('/users/:userId/reset-password', authenticateToken, requireAdmin, [
    body('newPassword').isLength({ min: 6 }).withMessage('Nova senha deve ter pelo menos 6 caracteres')
], async (req, res) => {
    try {
        // Validar dados de entrada
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Dados inválidos',
                details: errors.array()
            });
        }
        
        const userId = parseInt(req.params.userId);
        const { newPassword } = req.body;
        
        // Buscar usuário para obter senha atual
        const user = await authService.findUserById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Usuário não encontrado'
            });
        }
        
        // Alterar senha usando senha atual como "currentPassword"
        const result = await authService.changePassword(userId, user.password, newPassword);
        
        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
        
    } catch (error) {
        console.error('❌ Erro ao redefinir senha:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

module.exports = router; 