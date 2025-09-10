/**
 * Middleware centralizado para capturar e padronizar erros
 * Captura erros não tratados e retorna resposta JSON padronizada
 */

const errorHandler = (err, req, res, next) => {
    // Log do erro para debugging
    console.error('❌ Erro capturado:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
    });

    // Determinar status code baseado no tipo de erro
    let statusCode = 500;
    let message = 'Erro interno do servidor';

    // Erros de validação
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Dados inválidos';
    }
    
    // Erros de sintaxe JSON
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        statusCode = 400;
        message = 'JSON inválido';
    }
    
    // Erros de cast (MongoDB/banco de dados)
    if (err.name === 'CastError') {
        statusCode = 400;
        message = 'ID inválido';
    }
    
    // Erros de duplicação
    if (err.code === 11000) {
        statusCode = 409;
        message = 'Recurso já existe';
    }
    
    // Erros de autorização
    if (err.name === 'UnauthorizedError') {
        statusCode = 401;
        message = 'Não autorizado';
    }
    
    // Erros de permissão
    if (err.name === 'ForbiddenError') {
        statusCode = 403;
        message = 'Acesso negado';
    }
    
    // Erros de recurso não encontrado
    if (err.name === 'NotFoundError') {
        statusCode = 404;
        message = 'Recurso não encontrado';
    }
    
    // Erros de timeout
    if (err.name === 'TimeoutError') {
        statusCode = 408;
        message = 'Timeout da requisição';
    }
    
    // Erros de conexão com banco
    if (err.name === 'MongoError' || err.name === 'MongooseError') {
        statusCode = 503;
        message = 'Erro de conexão com banco de dados';
    }

    // Resposta padronizada
    const errorResponse = {
        error: message,
        status: statusCode,
        timestamp: new Date().toISOString(),
        path: req.url
    };

    // Em desenvolvimento, incluir stack trace
    if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = err.stack;
        errorResponse.details = err.message;
    }

    // Enviar resposta
    res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;
