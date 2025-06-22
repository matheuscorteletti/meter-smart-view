
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const authenticateToken = async (req, res, next) => {
  console.log('🔐 Middleware de autenticação chamado');
  console.log('Cookies recebidos:', req.cookies);
  console.log('Headers Authorization:', req.headers['authorization']);
  console.log('URL da requisição:', req.url);
  console.log('Método:', req.method);
  
  // Tentar obter token do cookie primeiro, depois do header Authorization
  let token = req.cookies?.auth_token;
  console.log('Token do cookie:', token ? 'presente' : 'ausente');
  
  if (!token) {
    const authHeader = req.headers['authorization'];
    token = authHeader && authHeader.split(' ')[1];
    console.log('Token do header:', token ? 'presente' : 'ausente');
  }

  if (!token) {
    console.log('❌ Nenhum token encontrado - enviando 401');
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  try {
    console.log('🔍 Verificando token JWT...');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token decodificado:', { userId: decoded.userId, email: decoded.email });
    
    // Verificar se o usuário ainda existe
    const [users] = await pool.execute(
      'SELECT id, name, email, role, building_id, unit_id FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      console.log('❌ Usuário não encontrado no banco');
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    console.log('✅ Usuário autenticado:', users[0].email);
    req.user = {
      id: users[0].id,
      name: users[0].name,
      email: users[0].email,
      role: users[0].role,
      buildingId: users[0].building_id,
      unitId: users[0].unit_id
    };

    next();
  } catch (error) {
    console.error('❌ Erro na verificação do token:', error.message);
    return res.status(403).json({ error: 'Token inválido' });
  }
};

module.exports = { authenticateToken };
