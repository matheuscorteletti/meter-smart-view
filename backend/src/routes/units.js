
const express = require('express');
const Joi = require('joi');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validações
const unitSchema = Joi.object({
  building_id: Joi.string().required(),
  number: Joi.string().min(1).max(50).required(),
  floor: Joi.string().min(1).max(50).required()
});

// Listar todas as unidades
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [units] = await pool.execute(`
      SELECT u.id, u.building_id, u.number, u.floor, u.created_at, u.updated_at,
             b.name as building_name
      FROM units u
      LEFT JOIN buildings b ON u.building_id = b.id
      ORDER BY b.name, u.floor, u.number
    `);

    res.json(units);
  } catch (error) {
    console.error('Get units error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar unidades por edifício
router.get('/building/:buildingId', authenticateToken, async (req, res) => {
  try {
    const [units] = await pool.execute(`
      SELECT u.id, u.building_id, u.number, u.floor, u.created_at, u.updated_at,
             b.name as building_name
      FROM units u
      LEFT JOIN buildings b ON u.building_id = b.id
      WHERE u.building_id = ?
      ORDER BY u.floor, u.number
    `, [req.params.buildingId]);

    res.json(units);
  } catch (error) {
    console.error('Get units by building error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter unidade por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [units] = await pool.execute(`
      SELECT u.id, u.building_id, u.number, u.floor, u.created_at, u.updated_at,
             b.name as building_name
      FROM units u
      LEFT JOIN buildings b ON u.building_id = b.id
      WHERE u.id = ?
    `, [req.params.id]);

    if (units.length === 0) {
      return res.status(404).json({ error: 'Unidade não encontrada' });
    }

    res.json(units[0]);
  } catch (error) {
    console.error('Get unit error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar nova unidade
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Apenas admins podem criar unidades
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const { error } = unitSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { building_id, number, floor } = req.body;

    // Verificar se o edifício existe
    const [buildings] = await pool.execute(
      'SELECT id FROM buildings WHERE id = ?',
      [building_id]
    );

    if (buildings.length === 0) {
      return res.status(400).json({ error: 'Edifício não encontrado' });
    }

    // Verificar se já existe unidade com o mesmo número no edifício
    const [existingUnits] = await pool.execute(
      'SELECT id FROM units WHERE building_id = ? AND number = ?',
      [building_id, number]
    );

    if (existingUnits.length > 0) {
      return res.status(400).json({ error: 'Já existe uma unidade com este número neste edifício' });
    }

    const id = `unit-${Date.now()}`;

    await pool.execute(
      'INSERT INTO units (id, building_id, number, floor) VALUES (?, ?, ?, ?)',
      [id, building_id, number, floor]
    );

    const [units] = await pool.execute(`
      SELECT u.id, u.building_id, u.number, u.floor, u.created_at, u.updated_at,
             b.name as building_name
      FROM units u
      LEFT JOIN buildings b ON u.building_id = b.id
      WHERE u.id = ?
    `, [id]);

    res.status(201).json(units[0]);
  } catch (error) {
    console.error('Create unit error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar unidade
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    // Apenas admins podem atualizar unidades
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const { error } = unitSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { building_id, number, floor } = req.body;

    // Verificar se o edifício existe
    const [buildings] = await pool.execute(
      'SELECT id FROM buildings WHERE id = ?',
      [building_id]
    );

    if (buildings.length === 0) {
      return res.status(400).json({ error: 'Edifício não encontrado' });
    }

    // Verificar se já existe unidade com o mesmo número no edifício (exceto a atual)
    const [existingUnits] = await pool.execute(
      'SELECT id FROM units WHERE building_id = ? AND number = ? AND id != ?',
      [building_id, number, req.params.id]
    );

    if (existingUnits.length > 0) {
      return res.status(400).json({ error: 'Já existe uma unidade com este número neste edifício' });
    }

    const [result] = await pool.execute(
      'UPDATE units SET building_id = ?, number = ?, floor = ? WHERE id = ?',
      [building_id, number, floor, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Unidade não encontrada' });
    }

    const [units] = await pool.execute(`
      SELECT u.id, u.building_id, u.number, u.floor, u.created_at, u.updated_at,
             b.name as building_name
      FROM units u
      LEFT JOIN buildings b ON u.building_id = b.id
      WHERE u.id = ?
    `, [req.params.id]);

    res.json(units[0]);
  } catch (error) {
    console.error('Update unit error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar unidade
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Apenas admins podem deletar unidades
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const [result] = await pool.execute(
      'DELETE FROM units WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Unidade não encontrada' });
    }

    res.json({ message: 'Unidade removida com sucesso' });
  } catch (error) {
    console.error('Delete unit error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
