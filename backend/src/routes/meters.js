
const express = require('express');
const Joi = require('joi');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validações
const meterSchema = Joi.object({
  unit_id: Joi.string().required(),
  type: Joi.string().valid('water', 'energy').required(),
  total_digits: Joi.number().integer().min(4).max(12).required(),
  calculation_digits: Joi.number().integer().min(2).max(8).required(),
  initial_reading: Joi.number().min(0).required(),
  threshold: Joi.number().min(0).required()
});

// Listar todos os medidores
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [meters] = await pool.execute(`
      SELECT m.id, m.unit_id, m.type, m.total_digits, m.calculation_digits, 
             m.initial_reading, m.threshold, m.created_at, m.updated_at,
             u.number as unit_number, u.floor as unit_floor,
             b.name as building_name
      FROM meters m
      LEFT JOIN units u ON m.unit_id = u.id
      LEFT JOIN buildings b ON u.building_id = b.id
      ORDER BY b.name, u.number, m.type
    `);

    res.json(meters);
  } catch (error) {
    console.error('Get meters error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar medidores por unidade
router.get('/unit/:unitId', authenticateToken, async (req, res) => {
  try {
    const [meters] = await pool.execute(`
      SELECT m.id, m.unit_id, m.type, m.total_digits, m.calculation_digits, 
             m.initial_reading, m.threshold, m.created_at, m.updated_at,
             u.number as unit_number, u.floor as unit_floor,
             b.name as building_name
      FROM meters m
      LEFT JOIN units u ON m.unit_id = u.id
      LEFT JOIN buildings b ON u.building_id = b.id
      WHERE m.unit_id = ?
      ORDER BY m.type
    `, [req.params.unitId]);

    res.json(meters);
  } catch (error) {
    console.error('Get meters by unit error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter medidor por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [meters] = await pool.execute(`
      SELECT m.id, m.unit_id, m.type, m.total_digits, m.calculation_digits, 
             m.initial_reading, m.threshold, m.created_at, m.updated_at,
             u.number as unit_number, u.floor as unit_floor,
             b.name as building_name
      FROM meters m
      LEFT JOIN units u ON m.unit_id = u.id
      LEFT JOIN buildings b ON u.building_id = b.id
      WHERE m.id = ?
    `, [req.params.id]);

    if (meters.length === 0) {
      return res.status(404).json({ error: 'Medidor não encontrado' });
    }

    res.json(meters[0]);
  } catch (error) {
    console.error('Get meter error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar novo medidor
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Apenas admins podem criar medidores
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const { error } = meterSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { unit_id, type, total_digits, calculation_digits, initial_reading, threshold } = req.body;

    // Verificar se a unidade existe
    const [units] = await pool.execute(
      'SELECT id FROM units WHERE id = ?',
      [unit_id]
    );

    if (units.length === 0) {
      return res.status(400).json({ error: 'Unidade não encontrada' });
    }

    // Verificar se já existe medidor do mesmo tipo na unidade
    const [existingMeters] = await pool.execute(
      'SELECT id FROM meters WHERE unit_id = ? AND type = ?',
      [unit_id, type]
    );

    if (existingMeters.length > 0) {
      return res.status(400).json({ error: `Já existe um medidor de ${type === 'water' ? 'água' : 'energia'} nesta unidade` });
    }

    const id = `meter-${Date.now()}`;

    await pool.execute(
      'INSERT INTO meters (id, unit_id, type, total_digits, calculation_digits, initial_reading, threshold) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, unit_id, type, total_digits, calculation_digits, initial_reading, threshold]
    );

    const [meters] = await pool.execute(`
      SELECT m.id, m.unit_id, m.type, m.total_digits, m.calculation_digits, 
             m.initial_reading, m.threshold, m.created_at, m.updated_at,
             u.number as unit_number, u.floor as unit_floor,
             b.name as building_name
      FROM meters m
      LEFT JOIN units u ON m.unit_id = u.id
      LEFT JOIN buildings b ON u.building_id = b.id
      WHERE m.id = ?
    `, [id]);

    res.status(201).json(meters[0]);
  } catch (error) {
    console.error('Create meter error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar medidor
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    // Apenas admins podem atualizar medidores
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const { error } = meterSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { unit_id, type, total_digits, calculation_digits, initial_reading, threshold } = req.body;

    // Verificar se a unidade existe
    const [units] = await pool.execute(
      'SELECT id FROM units WHERE id = ?',
      [unit_id]
    );

    if (units.length === 0) {
      return res.status(400).json({ error: 'Unidade não encontrada' });
    }

    // Verificar se já existe medidor do mesmo tipo na unidade (exceto o atual)
    const [existingMeters] = await pool.execute(
      'SELECT id FROM meters WHERE unit_id = ? AND type = ? AND id != ?',
      [unit_id, type, req.params.id]
    );

    if (existingMeters.length > 0) {
      return res.status(400).json({ error: `Já existe um medidor de ${type === 'water' ? 'água' : 'energia'} nesta unidade` });
    }

    const [result] = await pool.execute(
      'UPDATE meters SET unit_id = ?, type = ?, total_digits = ?, calculation_digits = ?, initial_reading = ?, threshold = ? WHERE id = ?',
      [unit_id, type, total_digits, calculation_digits, initial_reading, threshold, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Medidor não encontrado' });
    }

    const [meters] = await pool.execute(`
      SELECT m.id, m.unit_id, m.type, m.total_digits, m.calculation_digits, 
             m.initial_reading, m.threshold, m.created_at, m.updated_at,
             u.number as unit_number, u.floor as unit_floor,
             b.name as building_name
      FROM meters m
      LEFT JOIN units u ON m.unit_id = u.id
      LEFT JOIN buildings b ON u.building_id = b.id
      WHERE m.id = ?
    `, [req.params.id]);

    res.json(meters[0]);
  } catch (error) {
    console.error('Update meter error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar medidor
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Apenas admins podem deletar medidores
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const [result] = await pool.execute(
      'DELETE FROM meters WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Medidor não encontrado' });
    }

    res.json({ message: 'Medidor removido com sucesso' });
  } catch (error) {
    console.error('Delete meter error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
