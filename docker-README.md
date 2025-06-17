
# Sistema de Medidores - Configuração Docker

## Pré-requisitos

- Docker
- Docker Compose
- Git

## Configuração Inicial

1. **Clone o repositório e navegue até a pasta:**
   ```bash
   git clone <seu-repositorio>
   cd meter-system
   ```

2. **Configure as variáveis de ambiente:**
   ```bash
   # O arquivo .env já está criado com valores seguros
   # Você pode editá-lo se necessário
   nano .env
   ```

3. **Torne o script executável:**
   ```bash
   chmod +x docker-dev.sh
   ```

## Comandos Disponíveis

```bash
# Iniciar todos os serviços
./docker-dev.sh up

# Parar todos os serviços
./docker-dev.sh down

# Reiniciar serviços
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

## Acessos

- **Frontend (React)**: http://localhost:3000
- **Backend (Node.js)**: http://localhost:3001

## Variáveis de Ambiente

O arquivo `.env` contém:

- `DB_HOST`: Endereço do banco de dados
- `DB_PASSWORD`: Senha do banco de dados
- `JWT_SECRET`: Chave secreta para tokens JWT (gerada automaticamente)
- `VITE_API_BASE_URL`: URL base da API para o frontend

## Segurança

- O JWT Secret foi gerado automaticamente com 64 caracteres
- As senhas do banco são definidas no `.env`
- O arquivo `.env` está no `.gitignore` para não ser commitado

## Troubleshooting

1. **Se o container não iniciar:**
   ```bash
   ./docker-dev.sh logs
   ```

2. **Para limpar tudo e recomeçar:**
   ```bash
   ./docker-dev.sh clean
   ./docker-dev.sh up
   ```

3. **Para verificar se os containers estão rodando:**
   ```bash
   ./docker-dev.sh status
   ```
