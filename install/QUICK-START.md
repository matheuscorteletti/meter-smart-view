
# Sistema de Medidores - Instalação Rápida

## 🚀 Instalação em 3 Passos

### 1. Clone o Repositório
```bash
git clone [URL_DO_REPOSITORIO]
cd sistema-medidores
```

### 2. Execute o Instalador
```bash
# Instalação automática (recomendada)
./quick-install.sh

# OU instalação manual
npm install mysql2 --save-dev
node install.js
```

### 3. Inicie o Sistema
```bash
./docker-dev.sh up
```

## 📋 Pré-requisitos

- **Node.js 18+**
- **MySQL 8.0+** (com usuário configurado)
- **Docker + Docker Compose**
- **Git**

## 🔧 Configuração do MySQL

Antes de executar o instalador, certifique-se de que você tem:

```sql
-- Usuário com privilégios
CREATE USER 'meter'@'%' IDENTIFIED BY 'SuaSenhaAqui';
GRANT ALL PRIVILEGES ON *.* TO 'meter'@'%';
FLUSH PRIVILEGES;
```

## 🎯 O que o Instalador Faz

1. **Coleta informações** do banco MySQL
2. **Cria arquivo .env** com configurações seguras
3. **Testa conexão** com o banco
4. **Cria banco de dados** e estrutura completa
5. **Insere dados iniciais** para teste
6. **Configura segurança** (JWT, etc.)

## 🌐 Acesso ao Sistema

Após instalação:
- **URL**: http://localhost:3000
- **Login**: admin@medidores.local  
- **Senha**: [definir no primeiro acesso]

## 🔄 Reinstalação

Para reinstalar completamente:
```bash
node install.js
```

O instalador pode ser executado quantas vezes necessário.

---

**Sistema pronto para uso em produção!**
