
# Sistema de Medidores

Sistema completo para gerenciamento de medidores de água e energia em edifícios residenciais e comerciais.

## 🚀 Características

- **Interface Moderna**: React + TypeScript + Tailwind CSS
- **Gerenciamento Completo**: Edifícios, unidades, medidores e leituras
- **Alertas Inteligentes**: Notificações de consumo elevado
- **Relatórios**: Gráficos e análises de consumo
- **Multi-usuário**: Sistema de permissões (admin/usuário)
- **Responsivo**: Funciona em desktop, tablet e mobile

## 🏗️ Arquitetura

- **Frontend**: React 18 + Vite + TypeScript
- **UI Components**: Shadcn/UI + Tailwind CSS
- **Backend**: Node.js + Express (preparado)
- **Banco de Dados**: MySQL 8.0+
- **Deploy**: Docker + Docker Compose

## 📦 Instalação Rápida

### Pré-requisitos
- Docker e Docker Compose
- MySQL Server em 192.168.100.240
- Git

### 1. Configurar Banco de Dados
```bash
# Execute o script de instalação no MySQL
mysql -h 192.168.100.240 -u root -p < install/init.sql
```

### 2. Iniciar Sistema
```bash
# Clonar repositório
git clone [SEU_REPOSITORIO]
cd sistema-medidores

# Tornar script executável
chmod +x docker-dev.sh

# Iniciar aplicação
./docker-dev.sh up
```

### 3. Acessar Sistema
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001

## 📚 Documentação Completa

Consulte o [Guia de Instalação Completo](install/README.md) para:
- Configuração detalhada do Ubuntu
- Troubleshooting avançado
- Configurações de segurança
- Backup e manutenção

## 🐳 Comandos Docker

```bash
./docker-dev.sh up       # Iniciar sistema
./docker-dev.sh down     # Parar sistema
./docker-dev.sh logs     # Ver logs
./docker-dev.sh status   # Status dos containers
./docker-dev.sh clean    # Limpar ambiente
```

## 🔐 Acesso Padrão

- **Email**: admin@medidores.local
- **Senha**: [configurar após instalação]

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
│   └── ui/             # Componentes UI base
├── contexts/           # Context providers
├── hooks/              # Custom hooks
├── lib/                # Utilitários
├── pages/              # Páginas principais
├── types/              # Definições TypeScript
install/                # Scripts de instalação
├── init.sql           # Script do banco
└── README.md          # Guia completo
```

## 🔄 Deploy em Produção

Para ambiente de produção:

1. Configure variáveis de ambiente seguras
2. Use HTTPS com certificados SSL
3. Configure backup automático do MySQL
4. Monitore logs e performance
5. Implemente rotação de logs

## 🤝 Contribuição

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para detalhes.

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

---

**Desenvolvido para facilitar o gerenciamento de medidores em condomínios e edifícios comerciais.**
