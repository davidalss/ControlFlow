#!/bin/bash

# 🐳 Script de Atualização Rápida do Docker - ControlFlow
# Para Linux/Mac (Bash)

echo "🚀 Iniciando atualização do ControlFlow..."

# 1. Parar containers
echo "📥 Parando containers..."
docker-compose down
if [ $? -ne 0 ]; then
    echo "❌ Erro ao parar containers!"
    exit 1
fi

# 2. Reconstruir sem cache
echo "🔨 Reconstruindo imagem sem cache..."
docker-compose build --no-cache
if [ $? -ne 0 ]; then
    echo "❌ Erro ao reconstruir imagem!"
    exit 1
fi

# 3. Subir containers
echo "📤 Subindo containers..."
docker-compose up -d
if [ $? -ne 0 ]; then
    echo "❌ Erro ao subir containers!"
    exit 1
fi

# 4. Aguardar containers ficarem prontos
echo "⏳ Aguardando containers ficarem prontos..."
sleep 10

# 5. Build do frontend
echo "🎨 Fazendo build do frontend..."
docker-compose exec controlflow npm run build
if [ $? -ne 0 ]; then
    echo "❌ Erro no build do frontend!"
    exit 1
fi

# 6. Verificar status
echo "🔍 Verificando status dos containers..."
docker ps

echo "✅ Atualização concluída com sucesso!"
echo "🌐 Acesse: http://localhost:5002"
echo "📝 Login: admin@controlflow.com / admin123"
