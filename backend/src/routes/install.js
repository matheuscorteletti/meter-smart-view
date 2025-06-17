
const express = require('express');
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const router = express.Router();

// Generate JWT secret
function generateJWTSecret() {
  return crypto.randomBytes(64).toString('hex');
}

// Create .env file
function createEnvContent(config) {
  return `
# Configurações do Banco de Dados
DB_HOST=${config.dbHost}
DB_PORT=${config.dbPort}
DB_NAME=${config.dbName}
DB_USER=${config.dbUser}
DB_PASSWORD=${config.dbPassword}

# JWT Configuration (chave gerada aleatoriamente para segurança)
JWT_SECRET=${generateJWTSecret()}

# Configurações do Servidor
NODE_ENV=production
PORT=3001

# Configurações do Frontend
VITE_API_BASE_URL=http://localhost:3001/api

# URL do Frontend
FRONTEND_URL=http://localhost:3000

# Configurações SMTP para Produção (Gmail exemplo)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-email@empresa.com
SMTP_PASSWORD=sua-senha-app-gmail
SMTP_FROM="Sistema de Medidores <noreply@medidores.com>"

# Sistema instalado (não remover esta linha)
SYSTEM_INSTALLED=true

# MODO ATUAL: Produção (emails reais via SMTP configurado)
# Para voltar aos emails fake, mude NODE_ENV para: development
`;
}

// Check if system is already installed
router.get('/check-installation', async (req, res) => {
  try {
    // Check if .env exists and has SYSTEM_INSTALLED=true
    const projectRoot = path.resolve(__dirname, '../../../');
    const envPath = path.join(projectRoot, '.env');
    
    try {
      const envContent = await fs.readFile(envPath, 'utf8');
      const isInstalled = envContent.includes('SYSTEM_INSTALLED=true');
      
      if (isInstalled) {
        // Also check if database connection works
        const envLines = envContent.split('\n');
        const config = {};
        
        envLines.forEach(line => {
          const [key, value] = line.split('=');
          if (key && value) {
            config[key.trim()] = value.trim();
          }
        });
        
        if (config.DB_HOST && config.DB_USER && config.DB_PASSWORD && config.DB_NAME) {
          try {
            const connection = await mysql.createConnection({
              host: config.DB_HOST,
              port: parseInt(config.DB_PORT) || 3306,
              user: config.DB_USER,
              password: config.DB_PASSWORD,
              database: config.DB_NAME
            });
            
            await connection.execute('SELECT 1 FROM users LIMIT 1');
            await connection.end();
            
            return res.json({ isInstalled: true });
          } catch (dbError) {
            console.log('Database check failed:', dbError.message);
          }
        }
      }
    } catch (fileError) {
      console.log('Env file not found or not readable');
    }
    
    res.json({ isInstalled: false });
  } catch (error) {
    console.error('Installation check error:', error);
    res.json({ isInstalled: false });
  }
});

// Test database connection
router.post('/test-connection', async (req, res) => {
  try {
    const { dbHost, dbPort, dbUser, dbPassword } = req.body;

    const connection = await mysql.createConnection({
      host: dbHost,
      port: parseInt(dbPort),
      user: dbUser,
      password: dbPassword
    });

    await connection.execute('SELECT 1');
    await connection.end();

    res.json({ success: true, message: 'Conexão estabelecida com sucesso' });
  } catch (error) {
    console.error('Connection test error:', error);
    res.status(400).json({ 
      success: false, 
      message: `Erro de conexão: ${error.message}` 
    });
  }
});

// Create .env file
router.post('/create-env', async (req, res) => {
  try {
    const config = req.body;
    const envContent = createEnvContent(config);
    
    // Write to project root .env
    const projectRoot = path.resolve(__dirname, '../../../');
    await fs.writeFile(path.join(projectRoot, '.env'), envContent);

    res.json({ success: true, message: 'Arquivo .env criado com sucesso' });
  } catch (error) {
    console.error('Create env error:', error);
    res.status(500).json({ 
      success: false, 
      message: `Erro ao criar .env: ${error.message}` 
    });
  }
});

// Create database
router.post('/create-database', async (req, res) => {
  try {
    const { dbHost, dbPort, dbUser, dbPassword, dbName } = req.body;

    const connection = await mysql.createConnection({
      host: dbHost,
      port: parseInt(dbPort),
      user: dbUser,
      password: dbPassword
    });

    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await connection.end();

    res.json({ success: true, message: `Banco '${dbName}' criado com sucesso` });
  } catch (error) {
    console.error('Create database error:', error);
    res.status(500).json({ 
      success: false, 
      message: `Erro ao criar banco: ${error.message}` 
    });
  }
});

// Create database structure
router.post('/create-structure', async (req, res) => {
  try {
    const { dbHost, dbPort, dbUser, dbPassword, dbName } = req.body;

    const connection = await mysql.createConnection({
      host: dbHost,
      port: parseInt(dbPort),
      user: dbUser,
      password: dbPassword,
      database: dbName
    });

    // Read and execute SQL file
    const sqlPath = path.join(__dirname, '../../../install/init.sql');
    const sqlContent = await fs.readFile(sqlPath, 'utf8');
    
    // Split by semicolon and execute each command
    const commands = sqlContent.split(';').filter(cmd => cmd.trim());
    
    for (const command of commands) {
      if (command.trim()) {
        await connection.execute(command);
      }
    }

    // Get summary of created data
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
    const [buildings] = await connection.execute('SELECT COUNT(*) as count FROM buildings');
    const [units] = await connection.execute('SELECT COUNT(*) as count FROM units');
    const [meters] = await connection.execute('SELECT COUNT(*) as count FROM meters');

    await connection.end();

    const summary = `${users[0].count} usuários, ${buildings[0].count} edifícios, ${units[0].count} unidades, ${meters[0].count} medidores`;

    res.json({ 
      success: true, 
      message: 'Estrutura criada com sucesso',
      summary 
    });
  } catch (error) {
    console.error('Create structure error:', error);
    res.status(500).json({ 
      success: false, 
      message: `Erro ao criar estrutura: ${error.message}` 
    });
  }
});

// Create admin user
router.post('/create-admin', async (req, res) => {
  try {
    const { dbHost, dbPort, dbUser, dbPassword, dbName, adminName, adminEmail, adminPassword } = req.body;

    const connection = await mysql.createConnection({
      host: dbHost,
      port: parseInt(dbPort),
      user: dbUser,
      password: dbPassword,
      database: dbName
    });

    // Hash the admin password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Check if admin already exists
    const [existingAdmin] = await connection.execute(
      'SELECT id FROM users WHERE email = ? OR role = "admin"',
      [adminEmail]
    );

    if (existingAdmin.length > 0) {
      // Update existing admin
      await connection.execute(
        'UPDATE users SET name = ?, email = ?, password = ?, role = "admin" WHERE id = ?',
        [adminName, adminEmail, hashedPassword, existingAdmin[0].id]
      );
    } else {
      // Create new admin
      await connection.execute(
        'INSERT INTO users (name, email, password, role, created_at, updated_at) VALUES (?, ?, ?, "admin", NOW(), NOW())',
        [adminName, adminEmail, hashedPassword]
      );
    }

    await connection.end();

    res.json({ 
      success: true, 
      message: 'Usuário administrador criado com sucesso' 
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ 
      success: false, 
      message: `Erro ao criar administrador: ${error.message}` 
    });
  }
});

module.exports = router;
