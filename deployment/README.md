
# Deploy na Infraestrutura Interna

Este guia explica como fazer o deploy desta aplicação conectando com banco externo.

## Estrutura da Aplicação

- **Frontend**: React + Vite + TypeScript
- **Backend**: APIs REST (a implementar)
- **Banco**: MySQL externo em 192.168.100.240

## Ambiente de Desenvolvimento com Docker

### Pré-requisitos
- Docker e Docker Compose instalados
- Git instalado
- Acesso ao banco MySQL em 192.168.100.240

### Configuração Rápida

```bash
# 1. Clone o repositório
git clone [seu-repositorio-url]
cd [nome-do-projeto]

# 2. Configure a senha do banco
export DB_PASSWORD=sua_senha_do_meter

# 3. Torne o script executável (Linux/Mac)
chmod +x docker-dev.sh

# 4. Inicie o ambiente
./docker-dev.sh up
```

### Serviços Disponíveis

Após executar `./docker-dev.sh up`:

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001 (quando implementar)

### Comandos Úteis

```bash
# Definir senha do banco
export DB_PASSWORD=sua_senha_do_meter

# Iniciar frontend
./docker-dev.sh up

# Iniciar apenas frontend
./docker-dev.sh frontend-only

# Ver logs em tempo real
./docker-dev.sh logs

# Parar ambiente
./docker-dev.sh down

# Limpar containers
./docker-dev.sh clean
```

### Configuração do Banco Externo

- **Host**: 192.168.100.240
- **Porta**: 3306
- **Database**: meter
- **Usuário**: meter
- **Senha**: [definir via DB_PASSWORD]

### Estrutura do Banco

Execute o script `deployment/init.sql` no seu banco MySQL externo para criar as tabelas necessárias.

## Próximos Passos

### 1. Configurar o Banco
Execute o script SQL no banco externo:
```bash
mysql -h 192.168.100.240 -u meter -p meter < deployment/init.sql
```

### 2. Testar o Frontend
O frontend já funciona com dados de exemplo (localStorage).

### 3. Implementar Backend
Crie a pasta `backend/` com suas APIs REST conectando no banco externo.

### 4. Conectar Frontend às APIs
Modifique o frontend para usar as APIs ao invés do localStorage.

## Suporte

Se precisar de ajuda com:
- Configuração do banco externo
- Implementação do backend
- Conexão frontend com APIs
- Problemas com Docker

Basta perguntar!
