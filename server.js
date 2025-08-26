const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

// Importar rotas
const clientesRoutes = require('./routes/clientes');
const produtosRoutes = require('./routes/produtos');
const vendasRoutes = require('./routes/vendas');
const pagamentosRoutes = require('./routes/pagamentos');
const orcamentosRoutes = require('./routes/orcamentos');
const relatoriosRoutes = require('./routes/relatorios');
const pdfRoutes = require('./routes/pdf');
const emailRoutes = require('./routes/email');
const whatsappRoutes = require('./routes/whatsapp');
const pushNotificationRoutes = require('./routes/push-notifications');
const syncRoutes = require('./routes/sync');
const authRoutes = require('./routes/auth');

// Criar servidor HTTP e Socket.IO
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

// Configuração do Express
app.use((req, res, next) => {
    // Headers para quebrar cache
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('Last-Modified', new Date().toUTCString());
    
    // Adicionar timestamp único para arquivos estáticos
    if (req.path.match(/\.(js|css|html)$/)) {
        res.set('ETag', `"${Date.now()}"`);
    }
    
    next();
});

// Middleware de segurança
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "http://localhost:*", "ws://localhost:*"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));

// Rate limiting - Mais permissivo para desenvolvimento
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // Máximo 1000 requests por IP (mais permissivo para desenvolvimento)
  message: 'Muitas requisições deste IP, tente novamente mais tarde.'
});
app.use('/api/', limiter);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rotas da API
app.use('/api/clientes', clientesRoutes);
app.use('/api/produtos', produtosRoutes);
app.use('/api/vendas', vendasRoutes);
app.use('/api/pagamentos', pagamentosRoutes);
app.use('/api/orcamentos', orcamentosRoutes);
app.use('/api/relatorios', relatoriosRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/push-notifications', pushNotificationRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/auth', authRoutes);

// Inicializar serviço de sincronização
let syncService = null;
try {
    const SyncService = require('./utils/sync-service');
    syncService = new SyncService(io);
    app.locals.syncService = syncService;
    console.log('✅ Serviço de sincronização inicializado');
} catch (error) {
    console.error('❌ Erro ao inicializar serviço de sincronização:', error.message);
}

// Rota de teste da API
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Sistema de Vendas funcionando!',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        features: {
            email: true,
            whatsapp: true,
            pushNotifications: true,
            realTimeSync: !!syncService
        }
    });
});

// ROTAS ESPECÍFICAS PARA PÁGINAS
// Rota para página de login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// ELIMINAR COMPLETAMENTE O ACESSO AO DASHBOARD
app.all('/dashboard*', (req, res) => {
    console.log('🚫 ACESSO BLOQUEADO ao dashboard!');
    console.log('📍 URL solicitada:', req.originalUrl);
    console.log('🎯 FORÇANDO redirecionamento para página principal...');
    
    // Redirecionamento FORÇADO com status 301 (permanente)
    res.status(301).redirect('/');
});

// Rota para página inicial (index)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para página de teste básico
app.get('/test-basic', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'test-basic.html'));
});

// Rota para página de teste debug do sistema simples
app.get('/test-debug-simple', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'test-debug-simple.html'));
});

// Rota catch-all para o frontend (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Dados inválidos enviados' });
  }
  
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Iniciar servidor
server.listen(PORT, () => {
  console.log('🚀 Sistema de Vendas iniciado!');
  console.log(`📡 Servidor rodando na porta ${PORT}`);
  console.log(`🌐 Acesse: http://localhost:${PORT}`);
  console.log(`📊 API disponível em: http://localhost:${PORT}/api/health`);
  console.log(`🔄 Socket.IO disponível em: http://localhost:${PORT}`);
  console.log('✨ Sistema pronto para uso!');
  
  if (syncService) {
    console.log('🔄 Sincronização em tempo real ativa!');
  }
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
}); 