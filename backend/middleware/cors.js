/**
 * Middleware CORS para liberar acesso do frontend à API
 * Configuração padrão para permitir requisições do frontend
 */

const cors = require('cors');

// Configuração padrão do CORS
const corsOptions = {
  // Permitir requisições de qualquer origem (em produção, especificar domínios)
  origin: true,
  
  // Métodos HTTP permitidos
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  
  // Headers permitidos
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma'
  ],
  
  // Headers expostos para o frontend
  exposedHeaders: [
    'Content-Length',
    'Content-Type',
    'Cache-Control',
    'Pragma'
  ],
  
  // Permitir credenciais (cookies, headers de autorização)
  credentials: true,
  
  // Tempo de cache para preflight requests
  maxAge: 86400, // 24 horas
  
  // Permitir requisições preflight
  preflightContinue: false,
  
  // Opções avançadas
  optionsSuccessStatus: 200
};

// Middleware CORS configurado
const corsMiddleware = cors(corsOptions);

module.exports = corsMiddleware;
