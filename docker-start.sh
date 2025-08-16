#!/bin/bash

echo "========================================"
echo "   ControlFlow - Iniciando Docker"
echo "========================================"

# Verificar se o Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado"
    echo "Por favor, instale o Docker primeiro"
    exit 1
fi

# Verificar se o Docker está rodando
if ! docker info &> /dev/null; then
    echo "❌ Docker não está rodando"
    echo "Por favor, inicie o Docker"
    exit 1
fi

echo "✅ Docker está disponível"

# Criar arquivo .env se não existir
if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env..."
    cp env.example .env
    echo "✅ Arquivo .env criado"
else
    echo "✅ Arquivo .env já existe"
fi

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker-compose down

# Construir e iniciar containers
echo "🚀 Construindo e iniciando containers..."
docker-compose up --build -d

# Aguardar um pouco para os serviços iniciarem
echo "⏳ Aguardando serviços iniciarem..."
sleep 10

# Verificar status dos containers
echo "📊 Status dos containers:"
docker-compose ps

echo ""
echo "========================================"
echo "   ControlFlow está rodando!"
echo "========================================"
echo "🌐 Aplicação: http://localhost:5002"
echo "🗄️  Banco de dados: localhost:5432"
echo "📁 Uploads: ./uploads"
echo ""
echo "Para ver os logs: docker-compose logs -f"
echo "Para parar: docker-compose down"
echo "========================================"
