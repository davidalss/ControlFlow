# Script para corrigir o JWT_SECRET
Write-Host "Corrigindo JWT_SECRET..." -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Yellow

# Verificar se o arquivo .env existe
$envPath = ".env"
if (-not (Test-Path $envPath)) {
    Write-Host "Arquivo .env não encontrado!" -ForegroundColor Red
    exit 1
}

# Ler o conteúdo atual
$content = Get-Content $envPath -Raw

# JWT_SECRET correto fornecido pelo usuário
$correctJwtSecret = "SH+hou79Yhqtmn+aTH3kii9WiPAlI3WKhovc4QLsG8ttmSB8a6X8xx/CzraYNlZFPAt8C8S3DRIvtp9ZJ+tuZQ=="

# Verificar se o JWT_SECRET precisa ser corrigido
if ($content -match 'JWT_SECRET="your-super-secret-jwt-key-here"' -or $content -match 'JWT_SECRET=enso-jwt-secret-key-2024-development') {
    Write-Host "JWT_SECRET precisa ser atualizado. Corrigindo..." -ForegroundColor Yellow
    
    # Substituir qualquer valor incorreto pelo valor correto
    $newContent = $content -replace 'JWT_SECRET="your-super-secret-jwt-key-here"', "JWT_SECRET=$correctJwtSecret"
    $newContent = $newContent -replace 'JWT_SECRET=enso-jwt-secret-key-2024-development', "JWT_SECRET=$correctJwtSecret"
    
    # Salvar o arquivo
    $newContent | Out-File -FilePath $envPath -Encoding UTF8
    
    Write-Host "JWT_SECRET corrigido com sucesso!" -ForegroundColor Green
} else {
    Write-Host "JWT_SECRET já está configurado corretamente" -ForegroundColor Green
}

# Verificar se o SESSION_SECRET também precisa ser corrigido
if ($content -match 'SESSION_SECRET="your-super-secret-session-key-here"') {
    Write-Host "SESSION_SECRET está com valor padrão. Corrigindo..." -ForegroundColor Yellow
    
    # Ler o conteúdo atualizado
    $content = Get-Content $envPath -Raw
    
    # Substituir o valor
    $newContent = $content -replace 'SESSION_SECRET="your-super-secret-session-key-here"', 'SESSION_SECRET=enso-session-secret-2024'
    
    # Salvar o arquivo
    $newContent | Out-File -FilePath $envPath -Encoding UTF8
    
    Write-Host "SESSION_SECRET corrigido com sucesso!" -ForegroundColor Green
} else {
    Write-Host "SESSION_SECRET já está configurado corretamente" -ForegroundColor Green
}

Write-Host "`nReiniciando backend para aplicar as correções..." -ForegroundColor Cyan

# Parar apenas o backend
docker-compose -f docker-compose.dev.yml stop backend

# Remover container do backend
docker-compose -f docker-compose.dev.yml rm -f backend

# Rebuild apenas o backend
$buildTimestamp = Get-Date -Format "yyyyMMddHHmmss"
$env:BUILD_TIMESTAMP = $buildTimestamp
docker-compose -f docker-compose.dev.yml up --build --force-recreate -d backend

Write-Host "Aguardando backend iniciar..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Verificar status do backend
Write-Host "`nVerificando status do backend..." -ForegroundColor Cyan
docker-compose -f docker-compose.dev.yml ps backend

# Verificar logs do backend
Write-Host "`nÚltimos logs do Backend:" -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml logs --tail=10 backend

Write-Host "`nJWT_SECRET corrigido e backend reiniciado!" -ForegroundColor Green
Write-Host "Agora teste acessar a página de logs novamente." -ForegroundColor Green
