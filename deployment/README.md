
# Deploy na Infraestrutura Interna

Este guia explica como fazer o deploy desta aplicação na sua infraestrutura interna.

## Estrutura da Aplicação

- **Frontend**: React + Vite + TypeScript
- **Backend**: APIs REST (a implementar)
- **Banco**: MySQL 8.0 separado

## Ambiente de Desenvolvimento com Docker

### Pré-requisitos
- Docker e Docker Compose instalados
- Git instalado

### Configuração Rápida

```bash
# 1. Clone o repositório
git clone [seu-repositorio-url]
cd [nome-do-projeto]

# 2. Torne o script executável (Linux/Mac)
chmod +x docker-dev.sh

# 3. Inicie o ambiente
./docker-dev.sh up
```

### Serviços Disponíveis

Após executar `./docker-dev.sh up`:

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001 (quando implementar)
- **MySQL**: localhost:3306
- **phpMyAdmin**: http://localhost:8080

### Comandos Úteis

```bash
# Iniciar todo ambiente
./docker-dev.sh up

# Iniciar apenas banco + phpMyAdmin
./docker-dev.sh db-only

# Ver logs em tempo real
./docker-dev.sh logs

# Parar ambiente
./docker-dev.sh down

# Limpar tudo (containers e dados)
./docker-dev.sh clean
```

### Credenciais do Banco

- **Host**: localhost (ou 'database' dentro do Docker)
- **Porta**: 3306
- **Database**: meter_system
- **Usuário**: root
- **Senha**: password123
- **Usuário App**: meter_user / meter_pass

## Próximos Passos

### 1. Testar o Frontend
O frontend já funciona com dados de exemplo (localStorage).

### 2. Implementar Backend
Crie a pasta `backend/` com suas APIs REST:

```bash
mkdir backend
cd backend
npm init -y
# ... implementar APIs
```

### 3. Conectar Frontend às APIs
Modifique o frontend para usar as APIs ao invés do localStorage.

### 4. Deploy em Produção
Use o `Dockerfile` original para produção com nginx.

## Estrutura de Pastas Recomendada

```
projeto/
├── src/                 # Frontend React
├── backend/            # APIs (a criar)
├── deployment/         # Configs de deploy
├── docker-compose.yml  # Ambiente desenvolvimento
├── Dockerfile         # Build produção
├── Dockerfile.dev     # Build desenvolvimento
└── docker-dev.sh      # Script helper
```

## Suporte

Se precisar de ajuda com:
- Implementação do backend
- Conexão frontend com APIs
- Configuração de produção
- Problemas com Docker

Basta perguntar!
