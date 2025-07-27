
# Backend - Sistema de Medidores

Backend em Node.js com Express e MySQL para o sistema de gestão de medidores.

## Configuração

1. Instalar dependências:
```bash
cd backend
npm install
```

2. Configurar variáveis de ambiente:
```bash
cp .env.example .env
# Editar .env com suas configurações
```

3. Executar migrações do banco:
```bash
mysql -h 192.168.100.240 -u meter -p meter < migrations/001_add_reset_fields.sql
```

4. Iniciar servidor:
```bash
npm run dev
```

## Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/forgot-password` - Esqueci minha senha

### Usuários
- `GET /api/users/profile` - Obter perfil (requer auth)
- `PUT /api/users/profile` - Atualizar perfil (requer auth)
- `PUT /api/users/change-password` - Alterar senha (requer auth)

## Segurança

- Senhas com bcrypt (salt rounds: 12)
- Rate limiting (100 req/15min por IP)
- Validação com Joi
- Headers de segurança com Helmet
- Tokens JWT com expiração de 24h

## SMTP

Para desenvolvimento, usa Ethereal Email (fake SMTP).
Para produção, configure as variáveis SMTP_* no .env.
