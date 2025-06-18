
const express = require('express');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validações
const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required()
});

const createUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'user').required()
});

const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).optional(),
  role: Joi.string().valid('admin', 'user').required()
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required()
    .messages({
      'string.pattern.base': 'A senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'
    })
});

// Listar todos os usuários (apenas admin)
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const [users] = await pool.execute(
      'SELECT id, name, email, role, building_id, unit_id, created_at FROM users ORDER BY created_at DESC'
    );

    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      buildingId: user.building_id,
      unitId: user.unit_id,
      createdAt: user.created_at
    }));

    res.json(formattedUsers);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar novo usuário (apenas admin)
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const { error } = createUserSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, email, password, role } = req.body;

    // Verificar se email já existe
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Este email já está em uso' });
    }

    // Hash da senha
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const id = `user-${Date.now()}`;

    await pool.execute(
      'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [id, name, email, hashedPassword, role]
    );

    const [users] = await pool.execute(
      'SELECT id, name, email, role, building_id, unit_id, created_at FROM users WHERE id = ?',
      [id]
    );

    const user = users[0];
    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      buildingId: user.building_id,
      unitId: user.unit_id,
      createdAt: user.created_at
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar usuário (apenas admin)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const { error } = updateUserSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, email, password, role } = req.body;

    // Verificar se email já está em uso por outro usuário
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, req.params.id]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Este email já está em uso' });
    }

    let updateQuery = 'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?';
    let updateParams = [name, email, role, req.params.id];

    // Se senha foi fornecida, incluir no update
    if (password) {
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      updateQuery = 'UPDATE users SET name = ?, email = ?, role = ?, password_hash = ? WHERE id = ?';
      updateParams = [name, email, role, hashedPassword, req.params.id];
    }

    const [result] = await pool.execute(updateQuery, updateParams);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const [users] = await pool.execute(
      'SELECT id, name, email, role, building_id, unit_id, created_at FROM users WHERE id = ?',
      [req.params.id]
    );

    const user = users[0];
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      buildingId: user.building_id,
      unitId: user.unit_id,
      createdAt: user.created_at
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter perfil do usuário
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, name, email, role, building_id, unit_id FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const user = users[0];
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      buildingId: user.building_id,
      unitId: user.unit_id
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar perfil
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { error } = updateProfileSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, email } = req.body;

    // Verificar se email já está em uso por outro usuário
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, req.user.id]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Este email já está em uso' });
    }

    // Atualizar perfil
    await pool.execute(
      'UPDATE users SET name = ?, email = ? WHERE id = ?',
      [name, email, req.user.id]
    );

    // Buscar dados atualizados
    const [users] = await pool.execute(
      'SELECT id, name, email, role, building_id, unit_id FROM users WHERE id = ?',
      [req.user.id]
    );

    const user = users[0];
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      buildingId: user.building_id,
      unitId: user.unit_id
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Alterar senha
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { error } = changePasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { currentPassword, newPassword } = req.body;

    // Buscar senha atual
    const [users] = await pool.execute(
      'SELECT password_hash FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Verificar senha atual
    const validPassword = await bcrypt.compare(currentPassword, users[0].password_hash);
    if (!validPassword) {
      return res.status(400).json({ error: 'Senha atual incorreta' });
    }

    // Hash da nova senha
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Atualizar senha
    await pool.execute(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [hashedPassword, req.user.id]
    );

    res.json({ message: 'Senha alterada com sucesso' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
