
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
- **Instalador**: Interface web interativa

## 📦 Instalação

### Pré-requisitos
- **Node.js 18+**
- **MySQL 8.0+** (com usuário configurado)
- **Git**

### 1. Clonar e Configurar
```bash
# Clonar repositório
git clone [SEU_REPOSITORIO]
cd sistema-medidores

# Instalar dependências
npm install
```

### 2. Instalação via Interface Web (Recomendada)
```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Acessar instalador web
http://localhost:3000/install
```

**No instalador web você irá configurar:**
- 🔗 **Conexão MySQL**: Host, porta, usuário e senha
- 🗄️ **Banco de Dados**: Nome do banco (será criado automaticamente)
- 👤 **Administrador**: Nome, email e senha do primeiro usuário

### 3. Instalação via Linha de Comando (Alternativa)
```bash
# Executar instalador automático
./quick-install.sh

# OU instalação manual
node install.js
```

## 🎯 Instalador Web

O sistema possui um **instalador web completo** que:

✅ **Testa a conexão** com o banco MySQL  
✅ **Cria o arquivo .env** com configurações seguras  
✅ **Cria o banco de dados** automaticamente  
✅ **Instala todas as tabelas** e estrutura  
✅ **Insere dados iniciais** para demonstração  
✅ **Configura o usuário administrador**  
✅ **Bloqueia reinstalações** por segurança  

### Como usar o instalador:

1. **Acesse**: `http://localhost:3000/install`
2. **Configure o MySQL**: Informe host, porta, usuário e senha
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

1. **Parar o servidor** se estiver rodando
2. **Remover o arquivo .env**
3. **Reiniciar o servidor**
4. **Acessar novamente** `/install`

```bash
# Comandos para reinstalação
rm .env
npm run dev
# Acesse http://localhost:3000/install
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
install/                # Scripts de instalação
├── init.sql           # Script do banco
├── INSTALLER.md       # Documentação do instalador
└── README.md          # Guias de instalação
```

## 🐳 Docker (Opcional)

Para usar com Docker:

```bash
./docker-dev.sh up       # Iniciar sistema
./docker-dev.sh down     # Parar sistema
./docker-dev.sh logs     # Ver logs
./docker-dev.sh status   # Status dos containers
```

## 📋 Comandos Administrativos

### Resetar Senha do Admin (Emergência)
```sql
-- Conectar ao MySQL
mysql -u root -p

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

## 📄 Licença

Este projeto está sob a licença MIT.

---

**Desenvolvido para facilitar o gerenciamento de medidores em condomínios e edifícios comerciais.**

**🌟 Instalação simplificada com interface web moderna!**
