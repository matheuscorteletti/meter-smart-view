
# Sistema de Medidores - Guia de Instalação

## 📋 Visão Geral do Sistema

O **Sistema de Medidores** é uma aplicação web completa para gerenciamento de medidores de água e energia em edifícios residenciais e comerciais.

### Principais Funcionalidades:
- ✅ Gerenciamento de edifícios e unidades
- ✅ Cadastro e controle de medidores (água/energia)
- ✅ Registro de leituras mensais
- ✅ Alertas de consumo elevado
- ✅ Relatórios e gráficos de consumo
- ✅ Sistema de usuários (admin/usuário comum)
- ✅ Interface responsiva e moderna

### Tecnologias Utilizadas:
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express (quando implementado)
- **Banco de Dados**: MySQL 8.0+
- **Containerização**: Docker + Docker Compose

---

## 🖥️ Pré-requisitos do Sistema

### No servidor de desenvolvimento (Ubuntu):
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
sudo apt install docker.io docker-compose -y

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER

# Instalar Git
sudo apt install git -y

# Reiniciar para aplicar permissões
sudo reboot
```

### No servidor MySQL (192.168.100.240):
- MySQL Server 8.0 ou superior
- Acesso root ou usuário com privilégios administrativos
- Porta 3306 acessível pela rede

---

## 🗄️ Configuração do Banco de Dados

### 1. Executar o Script de Instalação

**IMPORTANTE**: Execute este script **ANTES** de iniciar a aplicação Docker.

```bash
# Conectar ao MySQL (substitua pela senha real)
mysql -h 192.168.100.240 -u root -p

# Executar o script de instalação
source /caminho/para/install/init.sql;

# Ou via linha de comando:
mysql -h 192.168.100.240 -u root -p < install/init.sql
```

### 2. Verificar a Instalação

```sql
-- Conectar ao banco
USE meter;

-- Verificar tabelas criadas
SHOW TABLES;

-- Verificar usuário criado
SELECT User, Host FROM mysql.user WHERE User = 'meter';

-- Verificar dados iniciais
SELECT * FROM users;
SELECT * FROM buildings;
```

### 3. O que o script cria:

- ✅ Banco de dados `meter`
- ✅ Usuário `meter` com senha `MeterSystem2024!`
- ✅ Todas as tabelas necessárias
- ✅ Índices para performance
- ✅ Dados de exemplo para teste
- ✅ Usuário admin padrão

---

## 🐳 Instalação com Docker (Ubuntu)

### 1. Clonar o Projeto
```bash
git clone [URL_DO_REPOSITORIO]
cd sistema-medidores
```

### 2. Configurar Ambiente
```bash
# O arquivo .env já está configurado
# Verifique se as configurações estão corretas
cat .env

# Se necessário, edite as configurações
nano .env
```

### 3. Tornar Script Executável
```bash
chmod +x docker-dev.sh
```

### 4. Iniciar Sistema
```bash
# Iniciar todos os serviços
./docker-dev.sh up

# Verificar se está funcionando
./docker-dev.sh status
```

### 5. Acessar Sistema
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001 (quando implementado)

---

## 📖 Comandos Úteis do Docker

```bash
# Iniciar sistema
./docker-dev.sh up

# Parar sistema
./docker-dev.sh down

# Reiniciar sistema
./docker-dev.sh restart

# Ver logs em tempo real
./docker-dev.sh logs

# Verificar status dos containers
./docker-dev.sh status

# Limpar containers e volumes
./docker-dev.sh clean

# Mostrar ajuda
./docker-dev.sh help
```

---

## 🔧 Configurações Importantes

### Arquivo .env
```env
# Banco de Dados
DB_HOST=192.168.100.240
DB_PORT=3306
DB_NAME=meter
DB_USER=meter
DB_PASSWORD=MeterSystem2024!

# Segurança
JWT_SECRET=[chave_gerada_automaticamente]

# Servidor
NODE_ENV=development
PORT=3001

# Frontend
VITE_API_BASE_URL=http://localhost:3001/api
```

### Portas Utilizadas
- **3000**: Frontend React
- **3001**: Backend Node.js
- **3306**: MySQL (servidor externo)

---

## 👥 Usuários Padrão

### Administrador
- **Email**: admin@medidores.local
- **Senha**: [definir após instalação]
- **Perfil**: Administrador completo

**IMPORTANTE**: Altere a senha padrão após primeiro acesso!

---

## 🔍 Troubleshooting

### Problemas Comuns:

#### 1. Container não inicia
```bash
# Verificar logs
./docker-dev.sh logs

# Limpar e reiniciar
./docker-dev.sh clean
./docker-dev.sh up
```

#### 2. Erro de conexão com banco
```bash
# Testar conexão com MySQL
mysql -h 192.168.100.240 -u meter -p meter

# Verificar se usuário meter existe
mysql -h 192.168.100.240 -u root -p -e "SELECT User, Host FROM mysql.user WHERE User = 'meter';"
```

#### 3. Permissões Docker
```bash
# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER

# Reiniciar sessão
logout
# Fazer login novamente
```

#### 4. Porta em uso
```bash
# Verificar portas ocupadas
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :3001

# Parar processo na porta
sudo kill -9 [PID]
```

---

## 📋 Checklist de Instalação

- [ ] MySQL Server configurado em 192.168.100.240
- [ ] Script `install/init.sql` executado com sucesso
- [ ] Docker e Docker Compose instalados
- [ ] Repositório clonado
- [ ] Arquivo `.env` configurado
- [ ] Script `docker-dev.sh` com permissões de execução
- [ ] Containers iniciados com `./docker-dev.sh up`
- [ ] Frontend acessível em http://localhost:3000
- [ ] Login admin funcionando

---

## 🆘 Suporte

Se encontrar problemas:

1. **Verifique os logs**: `./docker-dev.sh logs`
2. **Teste conexão MySQL**: Confirme acesso ao banco
3. **Verifique portas**: Certifique-se que 3000/3001 estão livres
4. **Reinicie sistema**: `./docker-dev.sh restart`

Para problemas específicos, documente:
- Mensagem de erro completa
- Logs dos containers
- Configuração do `.env`
- Versão do Docker/Ubuntu

---

## 📝 Próximos Passos

Após instalação bem-sucedida:

1. **Configurar usuários**: Criar contas para operadores
2. **Cadastrar edifícios**: Adicionar seus imóveis
3. **Registrar medidores**: Cadastrar equipamentos
4. **Implementar backend**: APIs REST para persistência
5. **Configurar backups**: Rotina de backup do MySQL

---

**Sistema desenvolvido para gerenciamento eficiente de medidores**
*Versão 1.0 - Documentação atualizada em $(date)*
