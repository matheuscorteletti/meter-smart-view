
const express = require('express');
const Joi = require('joi');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validações
const readingSchema = Joi.object({
  meter_id: Joi.string().required(),
  reading: Joi.number().min(0).required(),
  date: Joi.date().iso().required()
});

// Listar todas as leituras
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 50, meter_id, start_date, end_date } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '1=1';
    let params = [];

    if (meter_id) {
      whereClause += ' AND r.meter_id = ?';
      params.push(meter_id);
    }

    if (start_date) {
      whereClause += ' AND r.reading_date >= ?';
      params.push(start_date);
    }

    if (end_date) {
      whereClause += ' AND r.reading_date <= ?';
      params.push(end_date);
    }

    // Para usuários não-admin, mostrar apenas leituras das suas unidades
    if (req.user.role !== 'admin' && req.user.unitId) {
      whereClause += ' AND m.unit_id = ?';
      params.push(req.user.unitId);
    }

    const [readings] = await pool.execute(`
      SELECT r.id, r.meter_id, r.reading, r.consumption, r.reading_date as date, r.is_alert, 
             r.created_at, r.updated_at,
             m.type as meter_type, m.threshold,
             u.number as unit_number, u.floor as unit_floor,
             b.name as building_name
      FROM readings r
      LEFT JOIN meters m ON r.meter_id = m.id
      LEFT JOIN units u ON m.unit_id = u.id
      LEFT JOIN buildings b ON u.building_id = b.id
      WHERE ${whereClause}
      ORDER BY r.reading_date DESC, r.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    // Contar total de registros
    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total
      FROM readings r
      LEFT JOIN meters m ON r.meter_id = m.id
      LEFT JOIN units u ON m.unit_id = u.id
      LEFT JOIN buildings b ON u.building_id = b.id
      WHERE ${whereClause}
    `, params);

    res.json({
      readings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Get readings error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar leituras por medidor
router.get('/meter/:meterId', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    // Verificar permissão do usuário
    if (req.user.role !== 'admin') {
      const [meterCheck] = await pool.execute(`
        SELECT m.id FROM meters m
        LEFT JOIN units u ON m.unit_id = u.id
        WHERE m.id = ? AND (? IS NULL OR u.id = ?)
      `, [req.params.meterId, req.user.unitId, req.user.unitId]);

      if (meterCheck.length === 0) {
        return res.status(403).json({ error: 'Acesso negado' });
      }
    }

    const [readings] = await pool.execute(`
      SELECT r.id, r.meter_id, r.reading, r.consumption, r.reading_date as date, r.is_alert, 
             r.created_at, r.updated_at,
             m.type as meter_type, m.threshold,
             u.number as unit_number, u.floor as unit_floor,
             b.name as building_name
      FROM readings r
      LEFT JOIN meters m ON r.meter_id = m.id
      LEFT JOIN units u ON m.unit_id = u.id
      LEFT JOIN buildings b ON u.building_id = b.id
      WHERE r.meter_id = ?
      ORDER BY r.reading_date DESC, r.created_at DESC
      LIMIT ? OFFSET ?
    `, [req.params.meterId, parseInt(limit), offset]);

    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM readings WHERE meter_id = ?',
      [req.params.meterId]
    );

    res.json({
      readings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Get readings by meter error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter leitura por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [readings] = await pool.execute(`
      SELECT r.id, r.meter_id, r.reading, r.consumption, r.reading_date as date, r.is_alert, 
             r.created_at, r.updated_at,
             m.type as meter_type, m.threshold,
             u.number as unit_number, u.floor as unit_floor,
             b.name as building_name
      FROM readings r
      LEFT JOIN meters m ON r.meter_id = m.id
      LEFT JOIN units u ON m.unit_id = u.id
      LEFT JOIN buildings b ON u.building_id = b.id
      WHERE r.id = ?
    `, [req.params.id]);

    if (readings.length === 0) {
      return res.status(404).json({ error: 'Leitura não encontrada' });
    }

    // Verificar permissão do usuário
    if (req.user.role !== 'admin' && req.user.unitId !== readings[0].unit_id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    res.json(readings[0]);
  } catch (error) {
    console.error('Get reading error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar nova leitura
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { error } = readingSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { meter_id, reading, date } = req.body;

    // Verificar se o medidor existe e se o usuário tem permissão
    const [meters] = await pool.execute(`
      SELECT m.id, m.initial_reading, m.threshold, m.type,
             u.id as unit_id, u.number as unit_number
      FROM meters m
      LEFT JOIN units u ON m.unit_id = u.id
      WHERE m.id = ?
    `, [meter_id]);

    if (meters.length === 0) {
      return res.status(400).json({ error: 'Medidor não encontrado' });
    }

    const meter = meters[0];

    // Verificar permissão do usuário
    if (req.user.role !== 'admin' && req.user.unitId !== meter.unit_id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    // Buscar última leitura para calcular consumo
    const [lastReadings] = await pool.execute(
      'SELECT reading FROM readings WHERE meter_id = ? ORDER BY date DESC, created_at DESC LIMIT 1',
      [meter_id]
    );

    let consumption;
    let previousReading;

    if (lastReadings.length > 0) {
      previousReading = lastReadings[0].reading;
      consumption = reading - previousReading;
    } else {
      // Primeira leitura - usar leitura inicial do medidor
      previousReading = meter.initial_reading;
      consumption = reading - meter.initial_reading;
    }

    // Verificar se a leitura é válida (não pode ser menor que a anterior)
    if (reading < previousReading) {
      return res.status(400).json({ 
        error: `A leitura (${reading}) não pode ser menor que a leitura anterior (${previousReading})` 
      });
    }

    // Verificar se é um alerta (consumo acima do threshold)
    const isAlert = consumption > meter.threshold;

    const id = `reading-${Date.now()}`;

    await pool.execute(
      'INSERT INTO readings (id, meter_id, reading, consumption, date, is_alert) VALUES (?, ?, ?, ?, ?, ?)',
      [id, meter_id, reading, consumption, date, isAlert]
    );

    const [newReading] = await pool.execute(`
      SELECT r.id, r.meter_id, r.reading, r.consumption, r.date, r.is_alert, 
             r.created_at, r.updated_at,
             m.type as meter_type, m.threshold,
             u.number as unit_number, u.floor as unit_floor,
             b.name as building_name
      FROM readings r
      LEFT JOIN meters m ON r.meter_id = m.id
      LEFT JOIN units u ON m.unit_id = u.id
      LEFT JOIN buildings b ON u.building_id = b.id
      WHERE r.id = ?
    `, [id]);

    res.status(201).json(newReading[0]);
  } catch (error) {
    console.error('Create reading error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar leitura
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { error } = readingSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { meter_id, reading, date } = req.body;

    // Verificar se a leitura existe e permissões
    const [existingReadings] = await pool.execute(`
      SELECT r.*, m.initial_reading, m.threshold, m.type,
             u.id as unit_id
      FROM readings r
      LEFT JOIN meters m ON r.meter_id = m.id
      LEFT JOIN units u ON m.unit_id = u.id
      WHERE r.id = ?
    `, [req.params.id]);

    if (existingReadings.length === 0) {
      return res.status(404).json({ error: 'Leitura não encontrada' });
    }

    const existingReading = existingReadings[0];

    // Verificar permissão do usuário
    if (req.user.role !== 'admin' && req.user.unitId !== existingReading.unit_id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    // Recalcular consumo com a nova leitura
    const [previousReadings] = await pool.execute(`
      SELECT reading FROM readings 
      WHERE meter_id = ? AND date < ? AND id != ?
      ORDER BY date DESC, created_at DESC 
      LIMIT 1
    `, [meter_id, date, req.params.id]);

    let consumption;
    let previousReading;

    if (previousReadings.length > 0) {
      previousReading = previousReadings[0].reading;
      consumption = reading - previousReading;
    } else {
      // Primeira leitura - usar leitura inicial do medidor
      previousReading = existingReading.initial_reading;
      consumption = reading - existingReading.initial_reading;
    }

    // Verificar se a leitura é válida
    if (reading < previousReading) {
      return res.status(400).json({ 
        error: `A leitura (${reading}) não pode ser menor que a leitura anterior (${previousReading})` 
      });
    }

    // Verificar se é um alerta
    const isAlert = consumption > existingReading.threshold;

    await pool.execute(
      'UPDATE readings SET meter_id = ?, reading = ?, consumption = ?, date = ?, is_alert = ? WHERE id = ?',
      [meter_id, reading, consumption, date, isAlert, req.params.id]
    );

    const [updatedReading] = await pool.execute(`
      SELECT r.id, r.meter_id, r.reading, r.consumption, r.date, r.is_alert, 
             r.created_at, r.updated_at,
             m.type as meter_type, m.threshold,
             u.number as unit_number, u.floor as unit_floor,
             b.name as building_name
      FROM readings r
      LEFT JOIN meters m ON r.meter_id = m.id
      LEFT JOIN units u ON m.unit_id = u.id
      LEFT JOIN buildings b ON u.building_id = b.id
      WHERE r.id = ?
    `, [req.params.id]);

    res.json(updatedReading[0]);
  } catch (error) {
    console.error('Update reading error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar leitura
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Verificar se a leitura existe e permissões
    const [existingReadings] = await pool.execute(`
      SELECT r.*, u.id as unit_id
      FROM readings r
      LEFT JOIN meters m ON r.meter_id = m.id
      LEFT JOIN units u ON m.unit_id = u.id
      WHERE r.id = ?
    `, [req.params.id]);

    if (existingReadings.length === 0) {
      return res.status(404).json({ error: 'Leitura não encontrada' });
    }

    // Verificar permissão do usuário (apenas admin ou dono da unidade)
    if (req.user.role !== 'admin' && req.user.unitId !== existingReadings[0].unit_id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const [result] = await pool.execute(
      'DELETE FROM readings WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Leitura não encontrada' });
    }

    res.json({ message: 'Leitura removida com sucesso' });
  } catch (error) {
    console.error('Delete reading error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
