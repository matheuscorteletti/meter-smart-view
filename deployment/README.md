
# Deploy na Infraestrutura Interna

Este guia explica como fazer o deploy desta aplicação na sua infraestrutura interna.

## Estrutura da Aplicação

- **Frontend**: React + Vite + TypeScript
- **Estado atual**: Usando localStorage (demonstração)
- **Necessário**: Backend com APIs REST + Banco MySQL

## Pré-requisitos

- Node.js 18+ 
- Servidor web (nginx, apache)
- Banco MySQL/PostgreSQL
- Backend (Node.js, PHP, Python, etc.)

## 1. Frontend (React)

### Instalação:
```bash
npm install
npm run build
```

### Deploy:
- Copie a pasta `dist/` para seu servidor web
- Configure nginx/apache para servir os arquivos estáticos
- Configure proxy para APIs do backend

### Configuração nginx exemplo:
```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    
    location / {
        root /path/to/dist;
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 2. Backend (APIs necessárias)

### Endpoints para implementar:

#### Autenticação:
- `POST /api/auth/login` - Login do usuário
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Dados do usuário atual

#### Edifícios:
- `GET /api/buildings` - Listar edifícios
- `POST /api/buildings` - Criar edifício
- `PUT /api/buildings/:id` - Atualizar edifício
- `DELETE /api/buildings/:id` - Deletar edifício

#### Unidades:
- `GET /api/units` - Listar unidades
- `POST /api/units` - Criar unidade
- `PUT /api/units/:id` - Atualizar unidade
- `DELETE /api/units/:id` - Deletar unidade

#### Medidores:
- `GET /api/meters` - Listar medidores
- `POST /api/meters` - Criar medidor
- `PUT /api/meters/:id` - Atualizar medidor
- `DELETE /api/meters/:id` - Deletar medidor

#### Leituras:
- `GET /api/readings` - Listar leituras
- `POST /api/readings` - Criar leitura
- `PUT /api/readings/:id` - Atualizar leitura
- `DELETE /api/readings/:id` - Deletar leitura

## 3. Banco de Dados MySQL

### Tabelas necessárias:

```sql
-- Usuários
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') NOT NULL,
    building_id VARCHAR(36),
    unit_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Edifícios
CREATE TABLE buildings (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Unidades
CREATE TABLE units (
    id VARCHAR(36) PRIMARY KEY,
    building_id VARCHAR(36) NOT NULL,
    number VARCHAR(50) NOT NULL,
    floor VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (building_id) REFERENCES buildings(id)
);

-- Medidores
CREATE TABLE meters (
    id VARCHAR(36) PRIMARY KEY,
    unit_id VARCHAR(36) NOT NULL,
    type ENUM('water', 'energy') NOT NULL,
    total_digits INT NOT NULL,
    calculation_digits INT NOT NULL,
    initial_reading DECIMAL(10,2) NOT NULL,
    threshold DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (unit_id) REFERENCES units(id)
);

-- Leituras
CREATE TABLE readings (
    id VARCHAR(36) PRIMARY KEY,
    meter_id VARCHAR(36) NOT NULL,
    reading DECIMAL(10,2) NOT NULL,
    consumption DECIMAL(10,2) NOT NULL,
    date TIMESTAMP NOT NULL,
    is_alert BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (meter_id) REFERENCES meters(id)
);
```

## 4. Variáveis de Ambiente

Crie um arquivo `.env.production`:

```env
# API Base URL
VITE_API_BASE_URL=http://seu-servidor.com/api

# Outras configurações
VITE_APP_NAME=Sistema de Medidores
VITE_APP_VERSION=1.0.0
```

## 5. Próximos Passos

1. **Escolha sua stack de backend** (Node.js, PHP, Python, etc.)
2. **Implemente as APIs** conforme os endpoints listados
3. **Configure o banco MySQL** com as tabelas
4. **Modifique o frontend** para usar as APIs ao invés do localStorage
5. **Configure seu servidor web** para servir o frontend e proxy das APIs

## Suporte

Se precisar de ajuda com algum desses passos, posso te auxiliar com:
- Código do backend (Node.js, PHP, etc.)
- Configuração do banco
- Modificação do frontend para usar APIs
- Configuração do servidor web
