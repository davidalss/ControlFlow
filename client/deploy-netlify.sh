#!/bin/bash

# Script para deploy no Netlify
echo "🚀 Iniciando deploy no Netlify..."

# Verificar se o Netlify CLI está instalado
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI não encontrado. Instalando..."
    npm install -g netlify-cli
fi

# Fazer login no Netlify (se necessário)
echo "🔐 Verificando login no Netlify..."
netlify status

# Fazer build do projeto
echo "🔨 Fazendo build do projeto..."
npm run build

# Verificar se o build foi bem-sucedido
if [ $? -eq 0 ]; then
    echo "✅ Build concluído com sucesso!"
    
    # Deploy para produção
    echo "📤 Fazendo deploy para produção..."
    netlify deploy --prod --dir=dist
    
    if [ $? -eq 0 ]; then
        echo "🎉 Deploy concluído com sucesso!"
        echo "🌐 URL do site: https://seu-site.netlify.app"
    else
        echo "❌ Erro no deploy"
        exit 1
    fi
else
    echo "❌ Erro no build"
    exit 1
fi
