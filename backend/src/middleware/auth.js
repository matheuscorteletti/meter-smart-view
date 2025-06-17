
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verificar se o usuário ainda existe
    const [users] = await pool.execute(
      'SELECT id, name, email, role, building_id, unit_id FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

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
    console.error('Auth error:', error);
    return res.status(403).json({ error: 'Token inválido' });
  }
};

module.exports = { authenticateToken };
