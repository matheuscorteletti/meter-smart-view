
#!/usr/bin/env node

const readline = require('readline');
const fs = require('fs');
const mysql = require('mysql2/promise');
const crypto = require('crypto');
const path = require('path');

// Cores para o terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Interface para input do usuário
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Função para fazer perguntas
function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

// Função para exibir banner
function showBanner() {
  console.log(`${colors.cyan}${colors.bright}
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║               SISTEMA DE MEDIDORES - INSTALADOR              ║
║                                                              ║
║              Instalação Completa do Sistema                  ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`);
}

// Função para gerar JWT secret
function generateJWTSecret() {
  return crypto.randomBytes(64).toString('hex');
}

// Função para criar arquivo .env
function createEnvFile(config) {
  const envContent = `

# Configurações do Banco de Dados
DB_HOST=${config.dbHost}
DB_PORT=${config.dbPort}
DB_NAME=${config.dbName}
DB_USER=${config.dbUser}
DB_PASSWORD=${config.dbPassword}

# JWT Configuration (chave gerada aleatoriamente para segurança)
JWT_SECRET=${config.jwtSecret}

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

# Configurações SMTP Alternativas (comentadas - descomente para usar)
# SendGrid:
# SMTP_HOST=smtp.sendgrid.net
# SMTP_PORT=587
# SMTP_USER=apikey
# SMTP_PASSWORD=sua-api-key-sendgrid

# Outlook/Hotmail:
# SMTP_HOST=smtp-mail.outlook.com
# SMTP_PORT=587
# SMTP_USER=seu-email@outlook.com
# SMTP_PASSWORD=sua-senha-outlook

# MODO ATUAL: Produção (emails reais via SMTP configurado)
# Para voltar aos emails fake, mude NODE_ENV para: development

`;

  fs.writeFileSync('.env', envContent);
  console.log(`${colors.green}✅ Arquivo .env criado com sucesso!${colors.reset}`);
}

// Função para testar conexão com banco
async function testDatabaseConnection(config) {
  try {
    console.log(`${colors.yellow}🔄 Testando conexão com o banco de dados...${colors.reset}`);
    
    const connection = await mysql.createConnection({
      host: config.dbHost,
      port: config.dbPort,
      user: config.dbUser,
      password: config.dbPassword
    });

    await connection.execute('SELECT 1');
    console.log(`${colors.green}✅ Conexão com o banco estabelecida com sucesso!${colors.reset}`);
    
    await connection.end();
    return true;
  } catch (error) {
    console.log(`${colors.red}❌ Erro ao conectar com o banco: ${error.message}${colors.reset}`);
    return false;
  }
}

// Função para criar banco de dados
async function createDatabase(config) {
  try {
    console.log(`${colors.yellow}🔄 Criando banco de dados '${config.dbName}'...${colors.reset}`);
    
    const connection = await mysql.createConnection({
      host: config.dbHost,
      port: config.dbPort,
      user: config.dbUser,
      password: config.dbPassword
    });

    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${config.dbName}\``);
    console.log(`${colors.green}✅ Banco de dados '${config.dbName}' criado/verificado!${colors.reset}`);
    
    await connection.end();
    return true;
  } catch (error) {
    console.log(`${colors.red}❌ Erro ao criar banco: ${error.message}${colors.reset}`);
    return false;
  }
}

// Função para executar SQL
async function executeSQLFile(config) {
  try {
    console.log(`${colors.yellow}🔄 Criando estrutura do banco de dados...${colors.reset}`);
    
    const connection = await mysql.createConnection({
      host: config.dbHost,
      port: config.dbPort,
      user: config.dbUser,
      password: config.dbPassword,
      database: config.dbName
    });

    // Ler e executar o arquivo SQL
    const sqlContent = fs.readFileSync(path.join(__dirname, 'install', 'init.sql'), 'utf8');
    
    // Dividir comandos SQL por ponto e vírgula
    const commands = sqlContent.split(';').filter(cmd => cmd.trim());
    
    for (const command of commands) {
      if (command.trim()) {
        await connection.execute(command);
      }
    }

    console.log(`${colors.green}✅ Estrutura do banco criada com sucesso!${colors.reset}`);
    
    // Verificar dados inseridos
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
    const [buildings] = await connection.execute('SELECT COUNT(*) as count FROM buildings');
    const [units] = await connection.execute('SELECT COUNT(*) as count FROM units');
    const [meters] = await connection.execute('SELECT COUNT(*) as count FROM meters');
    
    console.log(`${colors.cyan}📊 Dados inseridos:${colors.reset}`);
    console.log(`   👥 Usuários: ${users[0].count}`);
    console.log(`   🏢 Edifícios: ${buildings[0].count}`);
    console.log(`   🏠 Unidades: ${units[0].count}`);
    console.log(`   📊 Medidores: ${meters[0].count}`);
    
    await connection.end();
    return true;
  } catch (error) {
    console.log(`${colors.red}❌ Erro ao executar SQL: ${error.message}${colors.reset}`);
    return false;
  }
}

// Função principal
async function main() {
  try {
    showBanner();
    
    console.log(`${colors.yellow}Este instalador irá configurar o Sistema de Medidores do zero.${colors.reset}`);
    console.log(`${colors.yellow}Você precisará fornecer as informações de conexão com o banco MySQL.${colors.reset}\n`);
    
    // Coletar informações do banco
    const config = {
      dbHost: await question(`${colors.cyan}IP/Host do servidor MySQL${colors.reset} [localhost]: `) || 'localhost',
      dbPort: await question(`${colors.cyan}Porta do MySQL${colors.reset} [3306]: `) || '3306',
      dbName: await question(`${colors.cyan}Nome do banco de dados${colors.reset} [meter]: `) || 'meter',
      dbUser: await question(`${colors.cyan}Usuário do MySQL${colors.reset}: `),
      dbPassword: await question(`${colors.cyan}Senha do MySQL${colors.reset}: `),
      jwtSecret: generateJWTSecret()
    };
    
    if (!config.dbUser || !config.dbPassword) {
      console.log(`${colors.red}❌ Usuário e senha são obrigatórios!${colors.reset}`);
      process.exit(1);
    }
    
    console.log(`\n${colors.yellow}🔄 Iniciando instalação...${colors.reset}\n`);
    
    // Passo 1: Criar arquivo .env
    console.log(`${colors.blue}[1/4] Criando arquivo de configuração...${colors.reset}`);
    createEnvFile(config);
    
    // Passo 2: Testar conexão
    console.log(`${colors.blue}[2/4] Testando conexão com banco...${colors.reset}`);
    const connectionOk = await testDatabaseConnection(config);
    if (!connectionOk) {
      console.log(`${colors.red}❌ Não foi possível conectar com o banco. Verifique as configurações.${colors.reset}`);
      process.exit(1);
    }
    
    // Passo 3: Criar banco
    console.log(`${colors.blue}[3/4] Criando banco de dados...${colors.reset}`);
    const dbCreated = await createDatabase(config);
    if (!dbCreated) {
      console.log(`${colors.red}❌ Não foi possível criar o banco de dados.${colors.reset}`);
      process.exit(1);
    }
    
    // Passo 4: Executar SQL
    console.log(`${colors.blue}[4/4] Criando estrutura e dados iniciais...${colors.reset}`);
    const sqlExecuted = await executeSQLFile(config);
    if (!sqlExecuted) {
      console.log(`${colors.red}❌ Não foi possível criar a estrutura do banco.${colors.reset}`);
      process.exit(1);
    }
    
    // Sucesso!
    console.log(`\n${colors.green}${colors.bright}🎉 INSTALAÇÃO CONCLUÍDA COM SUCESSO! 🎉${colors.reset}\n`);
    
    console.log(`${colors.cyan}📋 Próximos passos:${colors.reset}`);
    console.log(`   1. ${colors.yellow}Configure o SMTP no arquivo .env para envio de emails${colors.reset}`);
    console.log(`   2. ${colors.yellow}Execute: ./docker-dev.sh up${colors.reset}`);
    console.log(`   3. ${colors.yellow}Acesse: http://localhost:3000${colors.reset}`);
    console.log(`   4. ${colors.yellow}Login admin: admin@medidores.local${colors.reset}`);
    console.log(`   5. ${colors.yellow}Altere a senha padrão após primeiro acesso${colors.reset}\n`);
    
    console.log(`${colors.magenta}💡 Dica: Para reinstalar, execute este script novamente.${colors.reset}`);
    
  } catch (error) {
    console.log(`${colors.red}❌ Erro durante a instalação: ${error.message}${colors.reset}`);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Verificar se mysql2 está instalado
try {
  require('mysql2');
} catch (error) {
  console.log(`${colors.red}❌ Dependência 'mysql2' não encontrada!${colors.reset}`);
  console.log(`${colors.yellow}Execute: npm install mysql2${colors.reset}`);
  process.exit(1);
}

// Executar instalador
main();
