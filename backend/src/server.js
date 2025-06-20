
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de segurança
app.use(helmet());

// Middleware para cookies
app.use(cookieParser());

// Configuração de CORS mais permissiva para desenvolvimento
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://4029d73d-8548-4fe2-8eac-cc334a11ed89.lovableproject.com',
    /\.lovableproject\.com$/,
    // Permitir qualquer origem durante desenvolvimento
    /^http:\/\/192\.168\.\d+\.\d+:\d+$/,
    'http://192.168.100.234:3000',
    'http://192.168.100.234:3001',
    /^https?:\/\/.*$/
  ],
  credentials: true, // IMPORTANTE: permitir cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // limite de 100 requests por IP
});
app.use(limiter);

// Middleware para parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Log para debug das rotas
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check ANTES das outras rotas
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Verificar se os arquivos de rota existem
console.log('Carregando rotas...');

try {
  const authRoutes = require('./routes/auth');
  const userRoutes = require('./routes/users');
  const buildingRoutes = require('./routes/buildings');
  const unitRoutes = require('./routes/units');
  const meterRoutes = require('./routes/meters');
  const readingRoutes = require('./routes/readings');

  // Debug: verificar se as rotas foram carregadas
  console.log('Auth routes carregadas:', typeof authRoutes);
  console.log('User routes carregadas:', typeof userRoutes);

  // Rotas com prefixos corretos
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/buildings', buildingRoutes);
  app.use('/api/units', unitRoutes);
  app.use('/api/meters', meterRoutes);
  app.use('/api/readings', readingRoutes);

  console.log('Rotas registradas:');
  console.log('- /api/auth/* (incluindo POST /login, POST /logout, POST /forgot-password)');
  console.log('- /api/users/*');
  console.log('- /api/buildings/*');
  console.log('- /api/units/*');
  console.log('- /api/meters/*');
  console.log('- /api/readings/*');

} catch (error) {
  console.error('Erro ao carregar rotas:', error);
}

// Lista todas as rotas registradas (para debug)
app.get('/api/routes', (req, res) => {
  const routes = [];
  
  function extractRoutes(stack, basePath = '') {
    stack.forEach((layer) => {
      if (layer.route) {
        // Rota direta
        routes.push({
          path: basePath + layer.route.path,
          methods: Object.keys(layer.route.methods)
        });
      } else if (layer.name === 'router' && layer.regexp) {
        // Router middleware
        const routerPath = layer.regexp.source
          .replace('\\/?', '')
          .replace('(?=\\/|$)', '')
          .replace('^', '')
          .replace('\\/', '/')
          .replace(/\\\//g, '/');
        
        if (layer.handle && layer.handle.stack) {
          extractRoutes(layer.handle.stack, routerPath);
        }
      }
    });
  }
  
  extractRoutes(app._router.stack);
  res.json({ routes });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log(`Rota não encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Rota não encontrada', path: req.originalUrl });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS configurado com credentials: true`);
  console.log(`API acessível em: http://192.168.100.234:${PORT}/api`);
  console.log('Testando rotas disponíveis em: http://192.168.100.234:' + PORT + '/api/routes');
  console.log('Rota de login disponível em: http://192.168.100.234:' + PORT + '/api/auth/login (POST)');
});
