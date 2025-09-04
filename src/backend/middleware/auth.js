/**
 * Middleware de Autenticação
 * Protege rotas que requerem autenticação
 */

const AuthService = require('../utils/auth-service');

const authService = new AuthService();

/**
 * Middleware para verificar token JWT
 */
const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
        
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Token de acesso não fornecido',
                code: 'TOKEN_MISSING'
            });
        }
        
        const verification = authService.verifyToken(token);
        if (!verification.success) {
            return res.status(403).json({
                success: false,
                error: 'Token inválido ou expirado',
                code: 'TOKEN_INVALID'
            });
        }
        
        // Adicionar dados do usuário à requisição
        req.user = verification.data;
        req.token = token;
        
        next();
        
    } catch (error) {
        console.error('❌ Erro no middleware de autenticação:', error);
        return res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            code: 'INTERNAL_ERROR'
        });
    }
};

/**
 * Middleware para verificar permissões específicas
 */
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Usuário não autenticado',
                code: 'USER_NOT_AUTHENTICATED'
            });
        }
        
        // Verificar se o usuário tem uma das roles permitidas
        const allowedRoles = Array.isArray(roles) ? roles : [roles];
        
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'Acesso negado. Permissões insuficientes.',
                code: 'INSUFFICIENT_PERMISSIONS',
                required: allowedRoles,
                current: req.user.role
            });
        }
        
        next();
    };
};

/**
 * Middleware para verificar se é admin
 */
const requireAdmin = requireRole('admin');

/**
 * Middleware para verificar se é gerente ou admin
 */
const requireManager = requireRole(['admin', 'gerente']);

/**
 * Middleware para verificar se é vendedor, gerente ou admin
 */
const requireVendor = requireRole(['admin', 'gerente', 'vendedor']);

/**
 * Middleware opcional de autenticação (não bloqueia se não autenticado)
 */
const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        
        if (token) {
            const verification = authService.verifyToken(token);
            if (verification.success) {
                req.user = verification.data;
                req.token = token;
            }
        }
        
        next();
        
    } catch (error) {
        // Em caso de erro, continuar sem autenticação
        next();
    }
};

/**
 * Middleware para verificar se o usuário é o proprietário do recurso
 */
const requireOwnership = (resourceIdField = 'id') => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Usuário não autenticado',
                code: 'USER_NOT_AUTHENTICATED'
            });
        }
        
        // Admin pode acessar qualquer recurso
        if (req.user.role === 'admin') {
            return next();
        }
        
        // Verificar se o usuário é o proprietário do recurso
        const resourceId = req.params[resourceIdField] || req.body[resourceIdField];
        
        if (!resourceId) {
            return res.status(400).json({
                success: false,
                error: 'ID do recurso não fornecido',
                code: 'RESOURCE_ID_MISSING'
            });
        }
        
        // Se o usuário não for admin, verificar se é o proprietário
        if (req.user.userId !== parseInt(resourceId)) {
            return res.status(403).json({
                success: false,
                error: 'Acesso negado. Você só pode acessar seus próprios recursos.',
                code: 'OWNERSHIP_REQUIRED'
            });
        }
        
        next();
    };
};

/**
 * Middleware para verificar se o usuário está ativo
 */
const requireActiveUser = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Usuário não autenticado',
                code: 'USER_NOT_AUTHENTICATED'
            });
        }
        
        // Buscar usuário no banco para verificar status
        const user = await authService.findUserById(req.user.userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Usuário não encontrado',
                code: 'USER_NOT_FOUND'
            });
        }
        
        if (!user.active) {
            return res.status(403).json({
                success: false,
                error: 'Usuário inativo. Entre em contato com o administrador.',
                code: 'USER_INACTIVE'
            });
        }
        
        next();
        
    } catch (error) {
        console.error('❌ Erro no middleware de usuário ativo:', error);
        return res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            code: 'INTERNAL_ERROR'
        });
    }
};

/**
 * Middleware para rate limiting baseado no usuário
 */
const createRateLimiter = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
    const requests = new Map();
    
    return (req, res, next) => {
        const userId = req.user ? req.user.userId : req.ip;
        const now = Date.now();
        
        if (!requests.has(userId)) {
            requests.set(userId, []);
        }
        
        const userRequests = requests.get(userId);
        
        // Remover requisições antigas
        const validRequests = userRequests.filter(time => now - time < windowMs);
        requests.set(userId, validRequests);
        
        if (validRequests.length >= maxRequests) {
            return res.status(429).json({
                success: false,
                error: 'Muitas requisições. Tente novamente mais tarde.',
                code: 'RATE_LIMIT_EXCEEDED',
                retryAfter: Math.ceil(windowMs / 1000)
            });
        }
        
        // Adicionar requisição atual
        validRequests.push(now);
        requests.set(userId, validRequests);
        
        next();
    };
};

/**
 * Middleware para logging de requisições autenticadas
 */
const logAuthenticatedRequest = (req, res, next) => {
    if (req.user) {
        console.log(`🔐 [${new Date().toISOString()}] ${req.method} ${req.path} - Usuário: ${req.user.email} (${req.user.role})`);
    }
    next();
};

module.exports = {
    authenticateToken,
    requireRole,
    requireAdmin,
    requireManager,
    requireVendor,
    optionalAuth,
    requireOwnership,
    requireActiveUser,
    createRateLimiter,
    logAuthenticatedRequest
}; 