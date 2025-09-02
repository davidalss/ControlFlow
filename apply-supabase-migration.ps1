# Script para aplicar migração no Supabase
# Execute este script para configurar o banco com todas as funcionalidades

Write-Host "🚀 Configurando banco Supabase para Flow Builder e Smart Inspection..." -ForegroundColor Green

# Verificar se o arquivo de migração existe
$migrationFile = "migrations/0011_flow_builder_and_smart_inspection_fixed.sql"
if (-not (Test-Path $migrationFile)) {
    Write-Host "❌ Arquivo de migração não encontrado: $migrationFile" -ForegroundColor Red
    exit 1
}

Write-Host "📁 Arquivo de migração encontrado: $migrationFile" -ForegroundColor Yellow

# Verificar se as variáveis de ambiente estão configuradas
$envFile = ".env.local"
if (Test-Path $envFile) {
    Write-Host "✅ Arquivo .env.local encontrado" -ForegroundColor Green
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "^SUPABASE_URL=") {
            $supabaseUrl = $_.Split("=")[1]
            Write-Host "🔗 Supabase URL: $supabaseUrl" -ForegroundColor Cyan
        }
        if ($_ -match "^SUPABASE_ANON_KEY=") {
            $supabaseKey = $_.Split("=")[1]
            Write-Host "🔑 Supabase Key: [OCULTA]" -ForegroundColor Cyan
        }
    }
} else {
    Write-Host "⚠️  Arquivo .env.local não encontrado" -ForegroundColor Yellow
    Write-Host "📝 Crie um arquivo .env.local com as seguintes variáveis:" -ForegroundColor White
    Write-Host "   SUPABASE_URL=sua_url_do_supabase" -ForegroundColor Gray
    Write-Host "   SUPABASE_ANON_KEY=sua_chave_anonima" -ForegroundColor Gray
    Write-Host "   SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role" -ForegroundColor Gray
}

Write-Host ""
Write-Host "📋 INSTRUÇÕES PARA APLICAR A MIGRAÇÃO:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1️⃣  Acesse o Dashboard do Supabase:" -ForegroundColor White
Write-Host "   https://app.supabase.com" -ForegroundColor Cyan
Write-Host ""
Write-Host "2️⃣  Selecione seu projeto" -ForegroundColor White
Write-Host ""
Write-Host "3️⃣  Vá para SQL Editor (ícone de código)" -ForegroundColor White
Write-Host ""
Write-Host "4️⃣  Copie o conteúdo do arquivo:" -ForegroundColor White
Write-Host "   $migrationFile" -ForegroundColor Cyan
Write-Host ""
Write-Host "5️⃣  Cole no SQL Editor e execute" -ForegroundColor White
Write-Host ""
Write-Host "6️⃣  Verifique se todas as tabelas foram criadas" -ForegroundColor White
Write-Host ""

# Mostrar resumo das tabelas que serão criadas
Write-Host "📊 TABELAS QUE SERÃO CRIADAS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔧 FLOW BUILDER:" -ForegroundColor Cyan
Write-Host "   • flow_nodes - Nós do fluxo de inspeção" -ForegroundColor White
Write-Host "   • flow_connections - Conexões entre nós" -ForegroundColor White
Write-Host "   • flow_plans - Planos de fluxo completos" -ForegroundColor White
Write-Host ""
Write-Host "📚 BIBLIOTECA DE CRITÉRIOS:" -ForegroundColor Cyan
Write-Host "   • criteria_blocks - Blocos reutilizáveis" -ForegroundColor White
Write-Host "   • criteria_categories - Categorias de critérios" -ForegroundColor White
Write-Host ""
Write-Host "🤖 EXECUÇÃO INTELIGENTE:" -ForegroundColor Cyan
Write-Host "   • smart_inspections - Execuções inteligentes" -ForegroundColor White
Write-Host "   • inspection_execution_history - Histórico de execução" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  NOTIFICAÇÕES NC:" -ForegroundColor Cyan
Write-Host "   • nc_notifications - Notificações de não conformidade" -ForegroundColor White
Write-Host "   • nc_details - Detalhes das NCs" -ForegroundColor White
Write-Host ""
Write-Host "🛡️  SISTEMAS CRÍTICOS:" -ForegroundColor Cyan
Write-Host "   • system_health_logs - Monitoramento de saúde" -ForegroundColor White
Write-Host "   • security_events - Eventos de segurança" -ForegroundColor White
Write-Host "   • cache_stats - Estatísticas de cache" -ForegroundColor White
Write-Host "   • backup_info - Informações de backup" -ForegroundColor White

Write-Host ""
Write-Host "✅ DADOS INICIAIS INCLUÍDOS:" -ForegroundColor Green
Write-Host "   • 6 categorias padrão de critérios" -ForegroundColor White
Write-Host "   • 5 critérios padrão reutilizáveis" -ForegroundColor White
Write-Host "   • Políticas RLS configuradas" -ForegroundColor White
Write-Host "   • Índices para performance" -ForegroundColor White

Write-Host ""
Write-Host "🔒 SEGURANÇA:" -ForegroundColor Yellow
Write-Host "   • Row Level Security (RLS) habilitado" -ForegroundColor White
Write-Host "   • Políticas de acesso configuradas" -ForegroundColor White
Write-Host "   • Triggers para auditoria" -ForegroundColor White

Write-Host ""
Write-Host "🚀 PRÓXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host "1. Execute a migração no Supabase" -ForegroundColor White
Write-Host "2. Teste as funcionalidades localmente" -ForegroundColor White
Write-Host "3. Faça deploy para produção" -ForegroundColor White

Write-Host ""
Write-Host "💡 DICA: Use o comando 'Get-Content $migrationFile' para ver o conteúdo da migração" -ForegroundColor Cyan
Write-Host ""

# Perguntar se quer ver o conteúdo da migração
$showMigration = Read-Host "Deseja ver o conteúdo da migração? (s/n)"
if ($showMigration -eq "s" -or $showMigration -eq "S") {
    Write-Host ""
    Write-Host "📄 CONTEÚDO DA MIGRAÇÃO:" -ForegroundColor Yellow
    Write-Host "=" * 80 -ForegroundColor Gray
    Get-Content $migrationFile | ForEach-Object {
        Write-Host $_ -ForegroundColor White
    }
    Write-Host "=" * 80 -ForegroundColor Gray
}

Write-Host ""
Write-Host "🎯 Migração pronta para ser aplicada no Supabase!" -ForegroundColor Green
Write-Host "Execute o script SQL no dashboard do Supabase para configurar o banco." -ForegroundColor White
