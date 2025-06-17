
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
- Usuário `meter` já criado com privilégios no banco
- Porta 3306 acessível pela rede

---

## 🗄️ Configuração do Banco de Dados

### 1. Executar o Script de Instalação

**IMPORTANTE**: Execute este script **ANTES** de iniciar a aplicação Docker.

```bash
# Conectar ao MySQL (substitua pela senha real)
mysql -h 192.168.100.240 -u meter -p

# Executar o script de instalação
source /caminho/para/install/init.sql;

# Ou via linha de comando:
mysql -h 192.168.100.240 -u meter -p < install/init.sql
```

### 2. Verificar a Instalação

Execute estes comandos SQL para confirmar que tudo foi criado corretamente:

```sql
-- Conectar ao banco
USE meter;

-- Verificar tabelas criadas
SHOW TABLES;

-- Verificar dados iniciais - deve mostrar resumo completo
SELECT 'INSTALAÇÃO CONCLUÍDA' as status;
SELECT 'Usuários cadastrados:' as info, COUNT(*) as total FROM users;
SELECT 'Edifícios cadastrados:' as info, COUNT(*) as total FROM buildings;
SELECT 'Unidades cadastradas:' as info, COUNT(*) as total FROM units;
SELECT 'Medidores cadastrados:' as info, COUNT(*) as total FROM meters;

-- Verificar estrutura das tabelas principais
DESCRIBE users;
DESCRIBE buildings;
DESCRIBE meters;
```

### 3. Comandos de Teste Adicionais

```sql
-- Verificar dados de exemplo inseridos
SELECT * FROM users WHERE role = 'admin';
SELECT * FROM buildings;
SELECT * FROM units;
SELECT * FROM meters;

-- Testar relacionamentos
SELECT 
    b.name as edificio,
    u.number as unidade,
    u.floor as andar,
    m.type as tipo_medidor,
    m.serial_number as numero_serie
FROM buildings b
JOIN units u ON b.id = u.building_id
JOIN meters m ON u.id = m.unit_id;
```

### 4. O que o script cria:

- ✅ Banco de dados `meter`
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

## 🛠️ Comandos de Administração MySQL

### Backup do Banco
```bash
# Fazer backup completo
mysqldump -h 192.168.100.240 -u meter -p meter > backup_medidores_$(date +%Y%m%d).sql

# Restaurar backup
mysql -h 192.168.100.240 -u meter -p meter < backup_medidores_20241217.sql
```

### Gerenciar Usuários Admin
```sql
-- Criar novo usuário administrador
INSERT INTO users (id, name, email, password_hash, role) VALUES 
(UUID(), 'Seu Nome', 'seu@email.com', '$2b$10$hash_da_senha', 'admin');

-- Resetar senha do admin (gere o hash da nova senha primeiro)
UPDATE users SET password_hash = '$2b$10$novo_hash_aqui' 
WHERE email = 'admin@medidores.local';

-- Listar todos os admins
SELECT id, name, email, role, created_at FROM users WHERE role = 'admin';
```

### Monitoramento do Sistema
```sql
-- Estatísticas gerais
SELECT 
    (SELECT COUNT(*) FROM users) as total_usuarios,
    (SELECT COUNT(*) FROM buildings) as total_edificios,
    (SELECT COUNT(*) FROM units) as total_unidades,
    (SELECT COUNT(*) FROM meters) as total_medidores,
    (SELECT COUNT(*) FROM readings) as total_leituras;

-- Últimas leituras por tipo
SELECT 
    m.type as tipo,
    COUNT(r.id) as leituras_mes_atual
FROM meters m
LEFT JOIN readings r ON m.id = r.meter_id 
    AND MONTH(r.reading_date) = MONTH(CURRENT_DATE())
    AND YEAR(r.reading_date) = YEAR(CURRENT_DATE())
GROUP BY m.type;

-- Alertas ativos
SELECT COUNT(*) as alertas_ativos FROM readings WHERE is_alert = TRUE;
```

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

# Verificar se o banco foi criado
mysql -h 192.168.100.240 -u meter -p -e "SHOW DATABASES LIKE 'meter';"
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
- [ ] Usuário `meter` existente com privilégios
- [ ] Script `install/init.sql` executado com sucesso
- [ ] Comandos de verificação executados e OK
- [ ] Docker e Docker Compose instalados
- [ ] Repositório clonado
- [ ] Arquivo `.env` configurado
- [ ] Script `docker-dev.sh` com permissões de execução
- [ ] Containers iniciados com `./docker-dev.sh up`
- [ ] Frontend acessível em http://localhost:3000
- [ ] Dados de teste visíveis na interface

---

## 🆘 Suporte

Se encontrar problemas:

1. **Verifique os logs**: `./docker-dev.sh logs`
2. **Teste conexão MySQL**: Execute comandos de verificação
3. **Verifique portas**: Certifique-se que 3000/3001 estão livres
4. **Reinicie sistema**: `./docker-dev.sh restart`

Para problemas específicos, documente:
- Mensagem de erro completa
- Logs dos containers
- Resultado dos comandos de teste SQL
- Configuração do `.env`
- Versão do Docker/Ubuntu

---

## 📝 Próximos Passos

Após instalação bem-sucedida:

1. **Configurar usuários**: Criar contas para operadores
2. **Cadastrar edifícios**: Adicionar seus imóveis
3. **Registrar medidores**: Cadastrar equipamentos
4. **Implementar backend**: APIs REST para persistência
5. **Configurar backups**: Rotina de backup automático do MySQL

---

**Sistema desenvolvido para gerenciamento eficiente de medidores**
*Versão 1.0 - Documentação atualizada*
