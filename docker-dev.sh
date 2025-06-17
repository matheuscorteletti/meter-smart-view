
#!/bin/bash

# Script para gerenciar o ambiente Docker de desenvolvimento

case "$1" in
  "up")
    echo "🚀 Iniciando ambiente de desenvolvimento..."
    docker-compose up -d database
    echo "⏳ Aguardando banco de dados..."
    sleep 15
    docker-compose up frontend phpmyadmin
    ;;
  "down")
    echo "🛑 Parando ambiente..."
    docker-compose down
    ;;
  "logs")
    docker-compose logs -f
    ;;
  "db-only")
    echo "💾 Iniciando apenas o banco de dados..."
    docker-compose up -d database phpmyadmin
    ;;
  "clean")
    echo "🧹 Limpando containers e volumes..."
    docker-compose down -v
    docker system prune -f
    ;;
  *)
    echo "Uso: $0 {up|down|logs|db-only|clean}"
    echo ""
    echo "Comandos disponíveis:"
    echo "  up      - Inicia todo o ambiente"
    echo "  down    - Para o ambiente"
    echo "  logs    - Mostra logs em tempo real"
    echo "  db-only - Inicia apenas banco + phpMyAdmin"
    echo "  clean   - Remove containers e volumes"
    ;;
esac
