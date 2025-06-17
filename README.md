
# Sistema de Medidores

Sistema completo para gerenciamento de medidores de água e energia em edifícios residenciais e comerciais.

## 🚀 Características

- **Interface Moderna**: React + TypeScript + Tailwind CSS
- **Instalação Web**: Interface gráfica para configuração inicial
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
- **MySQL 8.0+** (servidor externo configurado)
- **Git**

### 1. Preparar Banco de Dados Externo

Primeiro, configure o MySQL no seu servidor:

```sql
-- Conectar como root no MySQL
mysql -u root -p

-- Criar usuário para o sistema
CREATE USER 'meter'@'%' IDENTIFIED BY 'SuaSenhaSegura123';

-- Dar permissões completas
GRANT ALL PRIVILEGES ON *.* TO 'meter'@'%';

-- Aplicar mudanças
FLUSH PRIVILEGES;

-- Criar banco de dados
CREATE DATABASE meter CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Verificar criação
SHOW DATABASES;
SELECT User, Host FROM mysql.user WHERE User = 'meter';

-- Testar conexão (opcional)
mysql -h SEU_IP_MYSQL -u meter -p meter
```

### 2. Clonar e Configurar Projeto

```bash
# Clonar repositório
git clone [SEU_REPOSITORIO]
cd sistema-medidores

# OU copiar arquivos para pasta do Docker
# cp -r sistema-medidores/* /sua/pasta/docker/
```

### 3. Instalação via Interface Web (Docker Compose)

```bash
# Iniciar com Docker Compose
docker-compose up -d

# Aguardar containers iniciarem (30-60 segundos)
docker-compose ps

# Acessar instalador web
http://localhost:3000/install
```

**No instalador web você irá configurar:**
- 🔗 **Conexão MySQL**: Host (IP do servidor), porta 3306, usuário `meter`
- 🗄️ **Banco de Dados**: Nome `meter` (já criado)
- 👤 **Administrador**: Nome, email e senha do primeiro usuário

### 4. Comandos Docker Compose

```bash
# Iniciar sistema completo
docker-compose up -d

# Ver logs em tempo real
docker-compose logs -f

# Parar sistema
docker-compose down

# Reiniciar sistema
docker-compose restart

# Ver status dos containers
docker-compose ps

# Limpar containers e volumes
docker-compose down -v
```

## 🎯 Instalador Web

O sistema possui um **instalador web completo** que:

✅ **Testa a conexão** com o banco MySQL externo  
✅ **Cria o arquivo .env** com configurações seguras  
✅ **Conecta no banco** externo configurado  
✅ **Instala todas as tabelas** e estrutura  
✅ **Insere dados iniciais** para demonstração  
✅ **Configura o usuário administrador**  
✅ **Bloqueia reinstalações** por segurança  

### Como usar o instalador:

1. **Acesse**: `http://localhost:3000/install`
2. **Configure o MySQL**: Informe IP do servidor, porta 3306, usuário `meter`, senha
3. **Defina o administrador**: Nome, email e senha
4. **Inicie a instalação**: Clique em "🚀 Iniciar Instalação"
5. **Acompanhe o progresso**: Veja cada etapa sendo executada
6. **Sistema pronto**: Redirecionamento automático após conclusão

## 🔐 Primeiro Acesso

Após a instalação via web:
- **URL**: http://localhost:3000
- **Login**: Email definido na instalação
- **Senha**: Senha definida na instalação

### Contas de Demonstração (se usar dados de exemplo)
- **Admin**: admin@demo.com / admin123
- **Usuário**: user@demo.com / user123  
- **Visualizador**: viewer@demo.com / viewer123

## 🛡️ Segurança da Instalação

- ✅ **Proteção contra reinstalação**: Instalador é desabilitado automaticamente
- ✅ **Verificação de integridade**: Testa conexão antes de prosseguir
- ✅ **JWT seguro**: Chave gerada automaticamente com 64 caracteres
- ✅ **Validação de campos**: Verificação de dados obrigatórios
- ✅ **Senhas criptografadas**: Hash bcrypt para segurança

## 🔄 Reinstalação

Para reinstalar o sistema:

1. **Parar containers**
```bash
docker-compose down
```

2. **Remover arquivo .env**
```bash
rm .env
```

3. **Reiniciar containers**
```bash
docker-compose up -d
```

4. **Acessar novamente** `/install`
```
http://localhost:3000/install
```

## 🐳 Configuração Docker

### Estrutura dos Containers

```yaml
# docker-compose.yml
services:
  frontend:    # React App (porta 3000)
  backend:     # Node.js API (porta 3001)
  # MySQL externo (não no Docker)
```

### Variáveis de Ambiente

O instalador web cria automaticamente o arquivo `.env`:

```env
# Banco de dados externo
DB_HOST=192.168.1.100
DB_PORT=3306
DB_NAME=meter
DB_USER=meter
DB_PASSWORD=SuaSenhaSegura123

# Segurança
JWT_SECRET=chave_gerada_automaticamente_64_chars

# APIs
VITE_API_BASE_URL=http://localhost:3001
```

## 🛠️ Desenvolvimento

Este projeto utiliza:
- **React Query** para gerenciamento de estado
- **React Hook Form** para formulários
- **Recharts** para gráficos
- **Lucide React** para ícones
- **Date-fns** para manipulação de datas

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── admin/          # Área administrativa
│   ├── user/           # Área do usuário
│   ├── install/        # Componentes do instalador
│   └── ui/             # Componentes UI base
├── contexts/           # Context providers
├── hooks/              # Custom hooks
├── lib/                # Utilitários
├── pages/              # Páginas principais
│   └── Install.tsx     # Página do instalador web
├── types/              # Definições TypeScript
backend/                # Backend Node.js
├── src/routes/
│   └── install.js      # API do instalador
docker-compose.yml      # Configuração Docker
install/                # Scripts de instalação
├── init.sql           # Script do banco
├── INSTALLER.md       # Documentação do instalador
└── README.md          # Guias de instalação
```

## 📋 Comandos Administrativos

### Resetar Senha do Admin (Emergência)
```sql
-- Conectar ao MySQL externo
mysql -h SEU_IP_MYSQL -u meter -p

-- Usar banco de dados
USE meter;

-- Resetar senha (use https://bcrypt-generator.com/ para gerar hash)
UPDATE users 
SET password_hash = '$2b$10$NOVO_HASH_AQUI' 
WHERE email = 'seu@email.com';
```

### Listar Administradores
```sql
SELECT id, name, email, role, created_at 
FROM users 
WHERE role = 'admin';
```

## 🔄 Deploy em Produção

Para ambiente de produção:

1. Configure variáveis de ambiente seguras
2. Use HTTPS com certificados SSL
3. Configure backup automático do MySQL
4. Monitore logs e performance
5. Desabilite instalador em produção

```bash
# Production com Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

## ✨ Funcionalidades Principais

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

### Container não inicia
```bash
docker-compose logs frontend
docker-compose logs backend
```

### Erro de conexão MySQL
```bash
# Testar conexão do container
docker-compose exec backend ping SEU_IP_MYSQL

# Verificar firewall MySQL
# Porta 3306 deve estar aberta para o IP do Docker
```

### Reinstalação completa
```bash
docker-compose down -v
rm .env
docker-compose up -d
```

## 📄 Licença

Este projeto está sob a licença MIT.

---

**Desenvolvido para facilitar o gerenciamento de medidores em condomínios e edifícios comerciais.**

**🌟 Instalação simplificada com Docker Compose e interface web moderna!**
