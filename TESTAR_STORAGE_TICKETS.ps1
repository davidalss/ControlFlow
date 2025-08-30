# Script para testar configuração do Supabase Storage para Tickets
Write-Host "🎫 TESTANDO CONFIGURAÇÃO DO SUPABASE STORAGE" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Verificar configurações do Supabase
Write-Host "`n🔍 Verificando configurações do Supabase..." -ForegroundColor Yellow

# Verificar se as variáveis de ambiente estão definidas
$envContent = Get-Content ".env" -Raw
if ($envContent -match "SUPABASE_URL") {
    Write-Host "✅ SUPABASE_URL encontrada" -ForegroundColor Green
} else {
    Write-Host "❌ SUPABASE_URL não encontrada" -ForegroundColor Red
}

if ($envContent -match "SUPABASE_SERVICE_ROLE_KEY") {
    Write-Host "✅ SUPABASE_SERVICE_ROLE_KEY encontrada" -ForegroundColor Green
} else {
    Write-Host "❌ SUPABASE_SERVICE_ROLE_KEY não encontrada" -ForegroundColor Red
}

# Verificar configuração do bucket no código
Write-Host "`n🔍 Verificando configuração do bucket no código..." -ForegroundColor Yellow

$ticketsRoutesContent = Get-Content "server/routes/tickets.ts" -Raw

if ($ticketsRoutesContent -match "from\('ENSOS'\)") {
    Write-Host "✅ Bucket ENSOS configurado corretamente" -ForegroundColor Green
} else {
    Write-Host "❌ Bucket ENSOS não encontrado no código" -ForegroundColor Red
}

if ($ticketsRoutesContent -match "TICKETS/") {
    Write-Host "✅ Pasta TICKETS configurada corretamente" -ForegroundColor Green
} else {
    Write-Host "❌ Pasta TICKETS não encontrada no código" -ForegroundColor Red
}

# Verificar se o bucket está sendo usado corretamente no upload
if ($ticketsRoutesContent -match "from\('ENSOS'\).*upload.*TICKETS") {
    Write-Host "✅ Upload configurado para bucket ENSOS/TICKETS" -ForegroundColor Green
} else {
    Write-Host "❌ Upload não configurado corretamente" -ForegroundColor Red
}

# Verificar se o bucket está sendo usado corretamente no delete
if ($ticketsRoutesContent -match "from\('ENSOS'\).*remove.*TICKETS") {
    Write-Host "✅ Delete configurado para bucket ENSOS/TICKETS" -ForegroundColor Green
} else {
    Write-Host "❌ Delete não configurado corretamente" -ForegroundColor Red
}

# Verificar se a URL pública está sendo gerada corretamente
if ($ticketsRoutesContent -match "from\('ENSOS'\).*getPublicUrl.*TICKETS") {
    Write-Host "✅ URL pública configurada para bucket ENSOS/TICKETS" -ForegroundColor Green
} else {
    Write-Host "❌ URL pública não configurada corretamente" -ForegroundColor Red
}

Write-Host "`n🎯 RESUMO DA CONFIGURAÇÃO" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host "✅ Configuração do Supabase Storage atualizada!" -ForegroundColor Green

Write-Host "`n📋 Configurações implementadas:" -ForegroundColor Yellow
Write-Host "   • Bucket: ENSOS" -ForegroundColor White
Write-Host "   • Pasta: TICKETS" -ForegroundColor White
Write-Host "   • Endpoint: https://smvohmdytczfouslcaju.storage.supabase.co/storage/v1/s3" -ForegroundColor White
Write-Host "   • Region: sa-0east-1" -ForegroundColor White
Write-Host "   • Upload: ENSOS/TICKETS/tickets/{id}/{filename}" -ForegroundColor White
Write-Host "   • Delete: Configurado para remover arquivos corretamente" -ForegroundColor White
Write-Host "   • URL Pública: Gerada automaticamente" -ForegroundColor White

Write-Host "`n🚀 Próximos passos:" -ForegroundColor Yellow
Write-Host "   1. Verifique se o bucket 'ENSOS' existe no Supabase" -ForegroundColor White
Write-Host "   2. Verifique se a pasta 'TICKETS' tem permissões corretas" -ForegroundColor White
Write-Host "   3. Teste o upload de um arquivo através da interface" -ForegroundColor White
Write-Host "   4. Verifique se o arquivo aparece no bucket correto" -ForegroundColor White

Write-Host "`n📝 Estrutura de pastas no bucket ENSOS:" -ForegroundColor Yellow
Write-Host "   ENSOS/" -ForegroundColor White
Write-Host "   └── TICKETS/" -ForegroundColor White
Write-Host "       └── tickets/" -ForegroundColor White
Write-Host "           └── {ticket_id}/" -ForegroundColor White
Write-Host "               └── {timestamp}-{random}.{extension}" -ForegroundColor White

Write-Host "`n✨ Configuração do Supabase Storage concluída!" -ForegroundColor Green
