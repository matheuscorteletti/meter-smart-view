
const express = require('express');
const Joi = require('joi');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validações
const buildingSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  address: Joi.string().min(5).max(500).required()
});

// Listar todos os edifícios
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [buildings] = await pool.execute(
      'SELECT id, name, address, created_at, updated_at FROM buildings ORDER BY created_at DESC'
    );

    res.json(buildings);
  } catch (error) {
    console.error('Get buildings error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter edifício por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [buildings] = await pool.execute(
      'SELECT id, name, address, created_at, updated_at FROM buildings WHERE id = ?',
      [req.params.id]
    );

    if (buildings.length === 0) {
      return res.status(404).json({ error: 'Edifício não encontrado' });
    }

    res.json(buildings[0]);
  } catch (error) {
    console.error('Get building error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar novo edifício
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Apenas admins podem criar edifícios
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const { error } = buildingSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, address } = req.body;
    const id = `building-${Date.now()}`;

    await pool.execute(
      'INSERT INTO buildings (id, name, address) VALUES (?, ?, ?)',
      [id, name, address]
    );

    const [buildings] = await pool.execute(
      'SELECT id, name, address, created_at, updated_at FROM buildings WHERE id = ?',
      [id]
    );

    res.status(201).json(buildings[0]);
  } catch (error) {
    console.error('Create building error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar edifício
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    // Apenas admins podem atualizar edifícios
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const { error } = buildingSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, address } = req.body;

    const [result] = await pool.execute(
      'UPDATE buildings SET name = ?, address = ? WHERE id = ?',
      [name, address, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Edifício não encontrado' });
    }

    const [buildings] = await pool.execute(
      'SELECT id, name, address, created_at, updated_at FROM buildings WHERE id = ?',
      [req.params.id]
    );

    res.json(buildings[0]);
  } catch (error) {
    console.error('Update building error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar edifício
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Apenas admins podem deletar edifícios
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const [result] = await pool.execute(
      'DELETE FROM buildings WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Edifício não encontrado' });
    }

    res.json({ message: 'Edifício removido com sucesso' });
  } catch (error) {
    console.error('Delete building error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
