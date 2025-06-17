
# Instalador do Sistema de Medidores

## 📦 Instalação Completa do Zero

Este instalador configura automaticamente todo o sistema, incluindo:
- ✅ Criação do arquivo `.env`
- ✅ Teste de conexão com banco MySQL
- ✅ Criação do banco de dados
- ✅ Criação de todas as tabelas
- ✅ Inserção de dados iniciais
- ✅ Configuração de segurança (JWT)

## 🚀 Como Usar

### Opção 1: Instalação Rápida (Recomendada)
```bash
# Tornar executável e executar
chmod +x quick-install.sh
./quick-install.sh
```

### Opção 2: Instalação Manual
```bash
# Instalar dependências
npm install mysql2 --save-dev

# Tornar executável
chmod +x install.js

# Executar instalador
node install.js
```

## 📝 Informações Necessárias

Durante a instalação, você precisará fornecer:

1. **IP/Host do MySQL** (ex: 192.168.100.240)
2. **Porta do MySQL** (padrão: 3306)
3. **Nome do banco** (padrão: meter)
4. **Usuário do MySQL**
5. **Senha do MySQL**

## 🔧 O que o Instalador Faz

### 1. Configuração do Ambiente
- Cria arquivo `.env` com todas as configurações
- Gera chave JWT segura automaticamente
- Configura URLs e portas do sistema

### 2. Verificação do Banco
- Testa conexão com MySQL
- Verifica permissões do usuário
- Valida configurações de rede

### 3. Criação da Estrutura
- Cria banco de dados se não existir
- Executa script SQL completo
- Cria todas as tabelas necessárias
- Adiciona índices para performance

### 4. Dados Iniciais
- Usuário administrador padrão
- Edifícios de exemplo
- Unidades de exemplo
- Medidores de exemplo

## 🏁 Após a Instalação

### 1. Configurar SMTP (Opcional)
Edite o arquivo `.env` para configurar envio de emails:
```env
SMTP_HOST=smtp.gmail.com
SMTP_USER=seu-email@gmail.com
SMTP_PASSWORD=sua-senha-app
```

### 2. Iniciar Sistema
```bash
./docker-dev.sh up
```

### 3. Acessar Sistema
- **Frontend**: http://localhost:3000
- **Login**: admin@medidores.local
- **Senha**: [definir após primeiro acesso]

## 🔄 Reinstalação

Para reinstalar completamente:
```bash
# O instalador pode ser executado novamente
node install.js

# Ele irá recriar tudo do zero
```

## 🐛 Solução de Problemas

### Erro de Conexão MySQL
- Verifique se o MySQL está rodando
- Confirme IP/porta/usuário/senha
- Verifique firewall e permissões de rede

### Erro de Permissões
```sql
-- Dar permissões completas ao usuário
GRANT ALL PRIVILEGES ON *.* TO 'meter'@'%';
FLUSH PRIVILEGES;
```

### Erro de Dependências
```bash
# Instalar dependências manualmente
npm install mysql2
```

## 📋 Estrutura Criada

O instalador cria:
- 📁 Banco `meter`
- 📊 5 tabelas principais (users, buildings, units, meters, readings)
- 🔐 Usuário admin padrão
- 🏢 Dados de exemplo para teste
- ⚙️ Configurações completas

## 🎯 Características

- ✅ **Interativo**: Guia passo a passo
- ✅ **Seguro**: Testa cada etapa antes de prosseguir
- ✅ **Completo**: Configura tudo automaticamente
- ✅ **Flexível**: Permite personalização
- ✅ **Reutilizável**: Pode ser executado múltiplas vezes

---

**Desenvolvido para facilitar a instalação do Sistema de Medidores**
