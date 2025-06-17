
# Sistema de Medidores

Sistema completo para gerenciamento de medidores de água e energia em edifícios residenciais e comerciais.

## 🚀 Características

- **Interface Moderna**: React + TypeScript + Tailwind CSS
- **Gerenciamento Completo**: Edifícios, unidades, medidores e leituras
- **Alertas Inteligentes**: Notificações de consumo elevado
- **Relatórios**: Gráficos e análises de consumo
- **Multi-usuário**: Sistema de permissões (admin/usuário)
- **Responsivo**: Funciona em desktop, tablet e mobile

## 🏗️ Arquitetura

- **Frontend**: React 18 + Vite + TypeScript
- **UI Components**: Shadcn/UI + Tailwind CSS
- **Backend**: Node.js + Express
- **Banco de Dados**: MySQL 8.0+
- **Deploy**: Docker Compose

## 📦 Instalação

### Pré-requisitos
- **Docker + Docker Compose**
- **MySQL 8.0+** (servidor configurado)
- **Git**

### 1. Preparar Banco de Dados

Configure o MySQL no seu servidor:

```sql
-- Conectar como root no MySQL
mysql -u root -p

-- Criar usuário para o sistema
CREATE USER 'meter'@'%' IDENTIFIED BY 'SuaSenhaSegura123';

-- Dar permissões completas
GRANT ALL PRIVILEGES ON *.* TO 'meter'@'%';

-- Aplicar mudanças
FLUSH PRIVILEGES;

-- Verificar criação
SELECT User, Host FROM mysql.user WHERE User = 'meter';
```

### 2. Executar Script de Instalação

```sql
-- Conectar com o usuário criado
mysql -h SEU_IP_MYSQL -u meter -p

-- Executar o script de instalação
source install/init.sql;

-- OU via linha de comando:
mysql -h SEU_IP_MYSQL -u meter -p < install/init.sql
```

### 3. Configurar Ambiente

```bash
# Clonar repositório
git clone [SEU_REPOSITORIO]
cd sistema-medidores

# Configurar variáveis de ambiente
cp .env.example .env
nano .env
```

Configure o arquivo `.env` com suas informações:

```env
# Configurações do Banco de Dados
DB_HOST=192.168.100.240
DB_PORT=3306
DB_NAME=meter
DB_USER=meter
DB_PASSWORD=SuaSenhaSegura123

# JWT Configuration
JWT_SECRET=sua_chave_jwt_super_secreta_64_caracteres_aqui

# Configurações do Servidor
NODE_ENV=production
PORT=3001

# Configurações do Frontend
VITE_API_BASE_URL=http://localhost:3001/api

# URL do Frontend
FRONTEND_URL=http://localhost:3000
```

### 4. Iniciar com Docker

```bash
# Iniciar sistema completo
docker-compose up -d

# Ver logs em tempo real
docker-compose logs -f

# Verificar status
docker-compose ps
```

## 🔐 Primeiro Acesso

Após a instalação:
- **URL**: http://localhost:3000
- **Login**: admin@medidores.local
- **Senha**: admin123

⚠️ **IMPORTANTE**: Altere a senha do administrador após o primeiro login!

## 🛠️ Comandos Docker

```bash
# Iniciar sistema
docker-compose up -d

# Parar sistema
docker-compose down

# Reiniciar sistema
docker-compose restart

# Ver logs
docker-compose logs -f

# Limpar containers e volumes
docker-compose down -v
```

## 🗄️ Estrutura do Banco

O script `install/init.sql` cria:

- ✅ **Tabelas**: users, buildings, units, meters, readings
- ✅ **Índices**: Para otimização de performance
- ✅ **Usuário Admin**: admin@medidores.local (senha: admin123)
- ✅ **Dados de Exemplo**: Edifício e unidades de demonstração
- ✅ **Medidores Vazios**: Prontos para configuração

## 🔄 Reinstalação

Para reinstalar completamente:

```bash
# 1. Parar containers
docker-compose down -v

# 2. Limpar banco de dados
mysql -h SEU_IP_MYSQL -u meter -p -e "DROP DATABASE IF EXISTS meter;"

# 3. Executar script novamente
mysql -h SEU_IP_MYSQL -u meter -p < install/init.sql

# 4. Reiniciar containers
docker-compose up -d
```

## 🛡️ Segurança

### Alterar Senha do Admin
```sql
-- Gerar hash da nova senha em: https://bcrypt-generator.com/
UPDATE users 
SET password_hash = '$2a$10$SEU_NOVO_HASH_AQUI' 
WHERE email = 'admin@medidores.local';
```

### Criar Novos Administradores
```sql
INSERT INTO users (id, name, email, password_hash, role) VALUES 
(UUID(), 'Novo Admin', 'novo@admin.com', '$2a$10$HASH_DA_SENHA', 'admin');
```

## 📋 Comandos Úteis

### Verificar Instalação
```sql
USE meter;
SELECT 
    (SELECT COUNT(*) FROM users WHERE role = 'admin') as administradores,
    (SELECT COUNT(*) FROM buildings) as edificios,
    (SELECT COUNT(*) FROM units) as unidades,
    (SELECT COUNT(*) FROM meters) as medidores;
```

### Backup do Banco
```bash
mysqldump -h SEU_IP_MYSQL -u meter -p meter > backup_meter.sql
```

### Restaurar Backup
```bash
mysql -h SEU_IP_MYSQL -u meter -p meter < backup_meter.sql
```

## ✨ Funcionalidades

### Para Administradores
- Gerenciar edifícios e unidades
- Cadastrar e configurar medidores
- Visualizar todas as leituras
- Gerar relatórios completos
- Gerenciar usuários do sistema

### Para Usuários
- Registrar leituras mensais
- Visualizar histórico de consumo
- Receber alertas de consumo elevado
- Gerar relatórios da unidade
- Acompanhar tendências

## 🐛 Solução de Problemas

### Erro de Conexão MySQL
```bash
# Testar conexão
mysql -h SEU_IP_MYSQL -u meter -p

# Verificar firewall (porta 3306)
telnet SEU_IP_MYSQL 3306
```

### Container não inicia
```bash
docker-compose logs frontend
docker-compose logs backend
```

### Resetar Sistema
```bash
docker-compose down -v
mysql -h SEU_IP_MYSQL -u meter -p -e "DROP DATABASE meter;"
mysql -h SEU_IP_MYSQL -u meter -p < install/init.sql
docker-compose up -d
```

## 📄 Licença

Este projeto está sob a licença MIT.

---

**🎯 Sistema simplificado com instalação tradicional via SQL!**

**Desenvolvido para facilitar o gerenciamento de medidores em condomínios e edifícios.**
