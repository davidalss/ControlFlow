# Script REINICIAR - Frontend e Backend

Este script reinicia apenas os serviços Frontend e Backend da aplicação ENSO, mantendo os outros serviços (banco de dados, Redis, etc.) rodando.

## Arquivos Criados

- `REINICIAR.ps1` - Script PowerShell (recomendado)
- `REINICIAR.bat` - Script Batch (alternativa)

## Como Usar

### PowerShell (Recomendado)
```powershell
.\REINICIAR.ps1
```

### Batch
```cmd
REINICIAR.bat
```

## O que o Script Faz

1. ✅ **Verifica se o Docker está rodando**
2. 🕐 **Gera timestamp para cache busting**
3. 🛑 **Para apenas Frontend e Backend**
4. 🗑️ **Remove containers do Frontend e Backend**
5. 🔨 **Rebuild e inicia Frontend e Backend com cache correto**
6. ⏳ **Aguarda os serviços iniciarem**
7. 🔍 **Verifica status dos serviços**
8. 📋 **Mostra logs dos serviços reiniciados**

## Vantagens

- ⚡ **Rápido**: Reinicia apenas o necessário
- 💾 **Preserva dados**: Mantém banco de dados e Redis rodando
- 🔄 **Cache correto**: Usa timestamp para garantir rebuild correto
- 📊 **Feedback visual**: Mostra status e logs dos serviços

## Serviços Afetados

### Reiniciados
- Frontend (http://localhost:3000)
- Backend (http://localhost:5002)

### Mantidos Rodando
- PostgreSQL (localhost:5432)
- Redis (localhost:6379)
- Supabase (localhost:5433)
- Adminer (http://localhost:8080)
- Redis Commander (http://localhost:8081)

## Comandos Úteis

```bash
# Ver logs em tempo real
docker-compose -f docker-compose.dev.yml logs -f frontend backend

# Parar todos os serviços
docker-compose -f docker-compose.dev.yml down

# Rebuild completo (todos os serviços)
.\rebuild-dev.ps1

# Ver status de todos os serviços
docker-compose -f docker-compose.dev.yml ps
```

## Quando Usar

- 🔧 **Após alterações no código** (Frontend/Backend)
- 🐛 **Para resolver problemas** nos serviços principais
- ⚡ **Para aplicar mudanças** rapidamente
- 🔄 **Para reiniciar** sem perder dados do banco

## Troubleshooting

### Se o script falhar:
1. Verifique se o Docker Desktop está rodando
2. Execute `docker-compose -f docker-compose.dev.yml down` para parar tudo
3. Execute `.\rebuild-dev.ps1` para rebuild completo

### Se os serviços não iniciarem:
1. Verifique os logs: `docker-compose -f docker-compose.dev.yml logs frontend backend`
2. Verifique se as portas 3000 e 5002 estão livres
3. Reinicie o Docker Desktop se necessário
