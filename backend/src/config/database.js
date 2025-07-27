
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'meter',
  timezone: '+00:00',
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

// Pool de conexões
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Teste de conexão
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conectado ao MySQL com sucesso');
    connection.release();
  } catch (error) {
    console.error('❌ Erro ao conectar com MySQL:', error.message);
    process.exit(1);
  }
}

testConnection();

module.exports = pool;
