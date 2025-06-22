
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Joi = require('joi');
const pool = require('../config/database');
const { sendEmail } = require('../services/emailService');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

console.log('Carregando rotas de autenticação...');

// Validações com email mais flexível para aceitar domínios locais
const loginSchema = Joi.object({
  email: Joi.string().email({ tlds: false }).required(), // Permite domínios locais
  password: Joi.string().min(6).required()
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email({ tlds: false }).required() // Permite domínios locais
});

// Login
router.post('/login', async (req, res) => {
  console.log('Rota de login acessada (POST):', req.body);
  
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      console.log('Erro de validação:', error.details[0].message);
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = req.body;
    console.log('Email validado com sucesso:', email);
    console.log('Senha recebida (primeiros 3 chars):', password.substring(0, 3) + '***');

    // Buscar usuário
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      console.log('Usuário não encontrado para email:', email);
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    const user = users[0];
    console.log('Usuário encontrado:', { id: user.id, email: user.email });
    console.log('Hash no banco (primeiros 10 chars):', user.password_hash.substring(0, 10) + '...');

    // TESTE MANUAL: Verificar se o hash é para "secret"
    const testSecret = await bcrypt.compare('secret', user.password_hash);
    console.log('Teste com senha "secret":', testSecret);
    
    // TESTE MANUAL: Verificar se o hash é para "admin123"
    const testAdmin123 = await bcrypt.compare('admin123', user.password_hash);
    console.log('Teste com senha "admin123":', testAdmin123);

    // Verificar senha enviada
    console.log('Iniciando comparação bcrypt...');
    const validPassword = await bcrypt.compare(password, user.password_hash);
    console.log('Resultado da comparação bcrypt:', validPassword);
    console.log('Senha enviada:', password);
    console.log('Hash do banco:', user.password_hash);

    if (!validPassword) {
      console.log('Senha inválida para usuário:', email);
      console.log('DIAGNÓSTICO: A senha enviada não confere com o hash do banco');
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    // Gerar token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Configurar cookie HttpOnly
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS em produção
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 horas
    });

    console.log('Login realizado com sucesso para:', email);
    console.log('Cookie configurado com httpOnly:', true);
    console.log('Cookie secure:', process.env.NODE_ENV === 'production');
    console.log('Cookie sameSite:', 'lax');

    // Resposta (sem senha e sem token no body)
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        buildingId: user.building_id,
        unitId: user.unit_id
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  console.log('Logout acessado');
  
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  
  res.json({ message: 'Logout realizado com sucesso' });
});

// Esqueci minha senha
router.post('/forgot-password', async (req, res) => {
  try {
    const { error } = forgotPasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email } = req.body;

    // Verificar se usuário existe
    const [users] = await pool.execute(
      'SELECT id, name, email FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      // Por segurança, sempre retorna sucesso mesmo se email não existir
      return res.json({ message: 'Se o email existir, você receberá instruções para redefinir sua senha' });
    }

    const user = users[0];

    // Gerar token de reset
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

    // Salvar token no banco
    await pool.execute(
      'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
      [resetToken, resetTokenExpiry, user.id]
    );

    // Enviar email
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    await sendEmail({
      to: user.email,
      subject: 'Redefinição de Senha - Sistema de Medidores',
      html: `
        <h2>Redefinição de Senha</h2>
        <p>Olá ${user.name},</p>
        <p>Você solicitou a redefinição de sua senha. Clique no link abaixo para criar uma nova senha:</p>
        <p><a href="${resetUrl}" style="background: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Redefinir Senha</a></p>
        <p>Este link expira em 1 hora.</p>
        <p>Se você não solicitou esta redefinição, ignore este email.</p>
      `
    });

    res.json({ message: 'Se o email existir, você receberá instruções para redefinir sua senha' });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

console.log('Rotas de autenticação carregadas - /login, /logout e /forgot-password');

module.exports = router;
