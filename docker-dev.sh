
#!/bin/bash

# Script para gerenciar o ambiente Docker de desenvolvimento

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para exibir ajuda
show_help() {
    echo "Uso: $0 [COMANDO]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  up       - Iniciar os serviços"
    echo "  down     - Parar os serviços"
    echo "  restart  - Reiniciar os serviços"
    echo "  logs     - Mostrar logs dos serviços"
    echo "  clean    - Limpar containers e volumes"
    echo "  status   - Mostrar status dos containers"
    echo "  help     - Mostrar esta ajuda"
}

# Verificar se o arquivo .env existe
check_env_file() {
    if [ ! -f ".env" ]; then
        echo -e "${RED}Erro: Arquivo .env não encontrado!${NC}"
        echo -e "${YELLOW}Execute: cp .env.example .env${NC}"
        echo -e "${YELLOW}E configure as variáveis necessárias.${NC}"
        exit 1
    fi
}

# Verificar se o Docker está instalado
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}Erro: Docker não está instalado!${NC}"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}Erro: Docker Compose não está instalado!${NC}"
        exit 1
    fi
}

case "$1" in
    up)
        echo -e "${GREEN}Iniciando serviços Docker...${NC}"
        check_docker
        check_env_file
        docker-compose up -d
        echo -e "${GREEN}Serviços iniciados!${NC}"
        echo -e "${YELLOW}Frontend: http://localhost:3000${NC}"
        echo -e "${YELLOW}Backend: http://localhost:3001${NC}"
        ;;
    down)
        echo -e "${YELLOW}Parando serviços Docker...${NC}"
        docker-compose down
        echo -e "${GREEN}Serviços parados!${NC}"
        ;;
    restart)
        echo -e "${YELLOW}Reiniciando serviços Docker...${NC}"
        docker-compose down
        docker-compose up -d
        echo -e "${GREEN}Serviços reiniciados!${NC}"
        ;;
    logs)
        docker-compose logs -f
        ;;
    clean)
        echo -e "${YELLOW}Limpando containers e volumes...${NC}"
        docker-compose down -v
        docker system prune -f
        echo -e "${GREEN}Limpeza concluída!${NC}"
        ;;
    status)
        echo -e "${GREEN}Status dos containers:${NC}"
        docker-compose ps
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}Comando inválido: $1${NC}"
        show_help
        exit 1
        ;;
esac
