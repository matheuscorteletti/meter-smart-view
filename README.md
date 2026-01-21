# Sistema de Medidores

Sistema para gerenciamento de medidores de água e energia em edifícios residenciais e comerciais.

## 🚀 Características

- **Interface Moderna**: React + TypeScript + Tailwind CSS
- **Gerenciamento Completo**: Edifícios, unidades, medidores e leituras
- **Alertas Inteligentes**: Notificações de consumo elevado
- **Relatórios**: Gráficos e análises de consumo
- **Multi-usuário**: Sistema de permissões (admin/usuário)
- **Responsivo**: Funciona em desktop, tablet e mobile

## 🏗️ Tecnologias

- **Frontend**: React 18 + Vite + TypeScript
- **UI Components**: Shadcn/UI + Tailwind CSS
- **Gráficos**: Recharts
- **Deploy**: Docker + Nginx

## 📦 Instalação

### Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

### Produção com Docker

```bash
# Build e iniciar container
docker-compose up -d

# Acessar em http://localhost:8087
```

## 🔐 Credenciais de Acesso

- **Admin**: admin@demo.com / admin123
- **Usuário**: user@demo.com / user123

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── admin/          # Área administrativa
│   ├── user/           # Área do usuário
│   └── ui/             # Componentes UI base
├── contexts/           # Context providers
├── hooks/              # Custom hooks
├── lib/                # Utilitários e storage
├── pages/              # Páginas principais
└── types/              # Definições TypeScript
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

## 📄 Licença

Este projeto está sob a licença MIT.
