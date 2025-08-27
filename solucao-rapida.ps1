Write-Host "🚀 SOLUÇÃO RÁPIDA - CONTROLFLOW" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Parar tudo primeiro
Write-Host "🛑 Parando todos os containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.simple.yml down 2>$null
docker-compose -f docker-compose.test.yml down 2>$null
docker stop $(docker ps -q) 2>$null
docker container prune -f 2>$null

# Tentativa 1: Frontend apenas
Write-Host "🔧 Tentativa 1: Iniciando apenas o frontend..." -ForegroundColor Yellow
docker-compose -f docker-compose.test.yml up --build -d frontend

Write-Host "⏳ Aguardando 30 segundos..." -ForegroundColor Gray
Start-Sleep -Seconds 30

$status1 = docker-compose -f docker-compose.test.yml ps
Write-Host "Status Tentativa 1:" -ForegroundColor Cyan
Write-Host $status1 -ForegroundColor Gray

# Testar conectividade
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ SUCESSO! Frontend está funcionando!" -ForegroundColor Green
    Write-Host "🌐 Acesse: http://localhost:3000" -ForegroundColor Green
    exit 0
} catch {
    Write-Host "❌ Tentativa 1 falhou: $($_.Exception.Message)" -ForegroundColor Red
}

# Tentativa 2: Frontend com configuração diferente
Write-Host "🔧 Tentativa 2: Frontend com configuração alternativa..." -ForegroundColor Yellow
docker-compose -f docker-compose.test.yml down 2>$null

# Modificar temporariamente o Dockerfile
$dockerfileContent = @"
FROM node:20-alpine

WORKDIR /app

# Instalar dependências do sistema
RUN apk add --no-cache python3 make g++ git curl bash

# Copiar package.json primeiro
COPY package*.json ./

# Instalar todas as dependências
RUN npm install --legacy-peer-deps

# Copiar todo o código
COPY . .

# Expor porta
EXPOSE 3000

# Comando alternativo
CMD ["npx", "vite", "--host", "0.0.0.0", "--port", "3000", "--force"]
"@

$dockerfileContent | Out-File -FilePath "client/Dockerfile.frontend.temp" -Encoding UTF8

# Usar o Dockerfile temporário
docker-compose -f docker-compose.test.yml up --build -d frontend

Write-Host "⏳ Aguardando 30 segundos..." -ForegroundColor Gray
Start-Sleep -Seconds 30

$status2 = docker-compose -f docker-compose.test.yml ps
Write-Host "Status Tentativa 2:" -ForegroundColor Cyan
Write-Host $status2 -ForegroundColor Gray

# Testar conectividade
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ SUCESSO! Frontend está funcionando!" -ForegroundColor Green
    Write-Host "🌐 Acesse: http://localhost:3000" -ForegroundColor Green
    exit 0
} catch {
    Write-Host "❌ Tentativa 2 falhou: $($_.Exception.Message)" -ForegroundColor Red
}

# Tentativa 3: Frontend com Node.js direto
Write-Host "🔧 Tentativa 3: Frontend com Node.js direto..." -ForegroundColor Yellow
docker-compose -f docker-compose.test.yml down 2>$null

# Criar Dockerfile alternativo
$dockerfileAlt = @"
FROM node:20-alpine

WORKDIR /app

# Instalar dependências do sistema
RUN apk add --no-cache python3 make g++ git curl bash

# Copiar package.json primeiro
COPY package*.json ./

# Instalar todas as dependências
RUN npm install --legacy-peer-deps

# Copiar todo o código
COPY . .

# Expor porta
EXPOSE 3000

# Comando com Node.js direto
CMD ["node", "-e", "require('child_process').spawn('npx', ['vite', '--host', '0.0.0.0', '--port', '3000'], {stdio: 'inherit'})"]
"@

$dockerfileAlt | Out-File -FilePath "client/Dockerfile.frontend.alt" -Encoding UTF8

# Usar o Dockerfile alternativo
docker-compose -f docker-compose.test.yml up --build -d frontend

Write-Host "⏳ Aguardando 45 segundos..." -ForegroundColor Gray
Start-Sleep -Seconds 45

$status3 = docker-compose -f docker-compose.test.yml ps
Write-Host "Status Tentativa 3:" -ForegroundColor Cyan
Write-Host $status3 -ForegroundColor Gray

# Testar conectividade
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ SUCESSO! Frontend está funcionando!" -ForegroundColor Green
    Write-Host "🌐 Acesse: http://localhost:3000" -ForegroundColor Green
    exit 0
} catch {
    Write-Host "❌ Tentativa 3 falhou: $($_.Exception.Message)" -ForegroundColor Red
}

# Se todas as tentativas falharam
Write-Host ""
Write-Host "❌ Todas as tentativas falharam!" -ForegroundColor Red
Write-Host "================================================" -ForegroundColor Red
Write-Host "Verifique os logs com:" -ForegroundColor Yellow
Write-Host "docker-compose -f docker-compose.test.yml logs frontend" -ForegroundColor Gray
Write-Host ""
Write-Host "Possíveis soluções:" -ForegroundColor Yellow
Write-Host "1. Reinicie o Docker Desktop" -ForegroundColor Gray
Write-Host "2. Verifique se as portas 3000, 5002, 5432 estão livres" -ForegroundColor Gray
Write-Host "3. Execute o diagnóstico completo: .\diagnostico.bat" -ForegroundColor Gray
