
#!/bin/bash

# Script de instalação rápida do Sistema de Medidores
# Execute com: bash quick-install.sh

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║               SISTEMA DE MEDIDORES - INSTALAÇÃO              ║
║                                                              ║
║                    Configuração Rápida                       ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
${NC}"

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não está instalado!${NC}"
    echo -e "${YELLOW}Instale o Node.js primeiro: https://nodejs.org${NC}"
    exit 1
fi

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ NPM não está instalado!${NC}"
    exit 1
fi

echo -e "${BLUE}[1/3] Instalando dependências do instalador...${NC}"
npm install mysql2 --save-dev

echo -e "${BLUE}[2/3] Tornando scripts executáveis...${NC}"
chmod +x install.js
chmod +x docker-dev.sh

echo -e "${BLUE}[3/3] Iniciando instalador interativo...${NC}"
echo ""
node install.js

echo -e "${GREEN}✅ Instalação concluída!${NC}"
echo -e "${YELLOW}Execute './docker-dev.sh up' para iniciar o sistema.${NC}"
