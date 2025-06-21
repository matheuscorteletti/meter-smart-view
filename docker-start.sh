
#!/bin/bash

echo "🚀 Iniciando Sistema de Medidores em Produção"

# Parar containers existentes
echo "📦 Parando containers existentes..."
docker-compose down

# Remover imagens antigas (opcional)
echo "🧹 Limpando imagens antigas..."
docker-compose down --rmi all

# Construir e iniciar containers
echo "🔨 Construindo e iniciando containers..."
docker-compose up --build -d

# Aguardar containers iniciarem
echo "⏳ Aguardando containers iniciarem..."
sleep 10

# Verificar status
echo "📊 Status dos containers:"
docker-compose ps

echo ""
echo "✅ Sistema iniciado!"
echo "🌐 Frontend: http://192.168.100.234:3000"
echo "🔧 Backend: http://192.168.100.234:3001"
echo "💚 Health Check: http://192.168.100.234:3001/api/health"
echo ""
echo "📋 Para ver logs:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 Para parar:"
echo "   docker-compose down"
