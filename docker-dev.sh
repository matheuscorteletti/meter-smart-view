
#!/bin/bash

# Script para gerenciar o ambiente Docker de desenvolvimento
# Conectando com banco externo em 192.168.100.240

case "$1" in
  "up")
    echo "🚀 Iniciando ambiente de desenvolvimento..."
    echo "📡 Conectando com banco externo: 192.168.100.240"
    docker-compose up frontend phpmyadmin
    ;;
  "down")
    echo "🛑 Parando ambiente..."
    docker-compose down
    ;;
  "logs")
    docker-compose logs -f
    ;;
  "phpmyadmin")
    echo "💾 Iniciando apenas o phpMyAdmin..."
    docker-compose up -d phpmyadmin
    ;;
  "frontend-only")
    echo "🎨 Iniciando apenas o frontend..."
    docker-compose up frontend
    ;;
  "clean")
    echo "🧹 Limpando containers..."
    docker-compose down
    docker system prune -f
    ;;
  *)
    echo "Uso: $0 {up|down|logs|phpmyadmin|frontend-only|clean}"
    echo ""
    echo "Comandos disponíveis:"
    echo "  up           - Inicia frontend + phpMyAdmin"
    echo "  down         - Para o ambiente"
    echo "  logs         - Mostra logs em tempo real"
    echo "  phpmyadmin   - Inicia apenas phpMyAdmin"
    echo "  frontend-only- Inicia apenas frontend"
    echo "  clean        - Remove containers"
    echo ""
    echo "💡 Lembre-se de definir DB_PASSWORD como variável de ambiente:"
    echo "   export DB_PASSWORD=sua_senha_do_banco"
    ;;
esac
