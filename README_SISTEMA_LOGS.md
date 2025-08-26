# 📊 Sistema de Logs e Testes Automatizados

Solução completa de logs e testes automatizados com Supabase, Jest, frontend e backend para monitoramento em tempo real do sistema.

## 🎯 Funcionalidades

### ✅ **Sistema de Logs**
- **Logs em tempo real** no Supabase
- **Filtros avançados** por período, rota, suite, status
- **Paginação** (50 registros por vez)
- **Auto-refresh** a cada 30 segundos
- **Exportação** CSV/JSON
- **Estatísticas** em tempo real
- **Limpeza automática** de logs antigos

### ✅ **Testes Automatizados**
- **Healthcheck** - Verifica rotas críticas
- **Contract Testing** - Valida schemas das respostas
- **Smoke/CRUD** - Testa operações básicas
- **Auth & CORS** - Valida autenticação e CORS
- **Performance** - Mede tempo de resposta
- **Boundary Cases** - Testa casos extremos
- **Error Capture** - Simula e captura erros

### ✅ **Monitoramento**
- **Healthcheck Runner** - Execução automática
- **Clean Logs** - Limpeza de logs antigos
- **Dashboard** - Interface visual completa
- **Alertas** - Notificações de falhas

## 🚀 Instalação e Configuração

### 1. **Banco de Dados (Supabase)**

Execute a migração SQL:

```sql
-- Executar no Supabase SQL Editor
\i migrations/create-system-logs-table.sql
```

### 2. **Variáveis de Ambiente**

Crie/atualize o arquivo `.env`:

```env
# Supabase
SUPABASE_URL=sua_url_do_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key

# Testes
TEST_BASE_URL=https://enso-backend-0aa1.onrender.com
TEST_TIMEOUT=30000
TEST_RETRY_ATTEMPTS=3
LOG_RETENTION_DAYS=30

# Healthcheck Runner
RUN_INTERVAL=300000  # 5 minutos
```

### 3. **Dependências**

Instale as dependências necessárias:

```bash
npm install @supabase/supabase-js axios zod jest jest-junit dotenv
```

## 📋 Como Usar

### **1. Executar Testes Manuais**

```bash
# Healthcheck
node tests/healthcheck.test.js

# Contract Testing
node tests/contract.test.js

# Todos os testes com Jest
npm test

# Teste específico
npm test -- --testPathPattern=healthcheck.test.js
```

### **2. Healthcheck Runner (Automático)**

```bash
# Execução única
node scripts/healthcheck-runner.js --once

# Loop contínuo (padrão)
node scripts/healthcheck-runner.js

# Apenas limpeza
node scripts/healthcheck-runner.js --cleanup
```

### **3. Limpeza de Logs**

```bash
# Simulação (dry run)
DRY_RUN=true node scripts/clean-logs.js

# Execução real
node scripts/clean-logs.js
```

### **4. Acessar Dashboard**

Acesse a página de logs no frontend:
```
http://localhost:3000/system-logs
```

## 🔧 Configurações

### **Intervalos de Execução**

```bash
# Healthcheck a cada 2 minutos
RUN_INTERVAL=120000 node scripts/healthcheck-runner.js

# Limpeza diária
LOG_RETENTION_DAYS=7 node scripts/clean-logs.js
```

### **Timeouts de Teste**

```bash
# Timeout de 60 segundos
TEST_TIMEOUT=60000 npm test

# 3 tentativas de retry
TEST_RETRY_ATTEMPTS=3 npm test
```

## 📊 Estrutura dos Logs

### **Tabela `system_logs`**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | uuid | ID único do log |
| `test_suite` | text | Nome da suíte (healthcheck, contract, etc.) |
| `test_name` | text | Nome específico do teste |
| `route` | text | Rota da API testada |
| `status_code` | int | Código de status HTTP |
| `response_time_ms` | int | Tempo de resposta em ms |
| `cors_ok` | boolean | Se headers CORS estão corretos |
| `passed` | boolean | Se o teste passou |
| `error_message` | text | Mensagem de erro (se falhou) |
| `meta` | jsonb | Dados adicionais |
| `created_at` | timestamptz | Timestamp de criação |

### **Tipos de Suíte**

- `healthcheck` - Verificação de rotas críticas
- `contract` - Validação de schemas
- `smoke` - Testes CRUD básicos
- `auth_cors` - Autenticação e CORS
- `performance` - Testes de performance
- `boundary` - Casos extremos
- `error_capture` - Captura de erros

## 🎨 Interface do Frontend

### **Funcionalidades**

1. **Dashboard de Estatísticas**
   - Total de logs
   - Testes que passaram/falharam
   - Logs das últimas 24h
   - Tempo médio de resposta

2. **Filtros Avançados**
   - Por suíte de teste
   - Por rota específica
   - Por status (passou/falhou)
   - Por período (data inicial/final)

3. **Tabela de Logs**
   - Data/Hora
   - Suíte e Nome do Teste
   - Rota testada
   - Status HTTP com ícones
   - Tempo de resposta
   - Status CORS
   - Resultado (Passou/Falhou)
   - Mensagem de erro

4. **Exportação**
   - CSV com todos os dados
   - JSON para análise programática

5. **Auto-refresh**
   - Atualização automática a cada 30s
   - Indicador visual de status
   - Controle manual de pausa/play

## 🔍 Monitoramento

### **Alertas Automáticos**

O sistema pode ser configurado para enviar alertas quando:

- Taxa de falha > 20%
- Tempo de resposta > 5 segundos
- Rotas críticas não respondem
- Erros 5xx consecutivos

### **Métricas Importantes**

- **Uptime**: % de tempo que o sistema está funcionando
- **Response Time**: Tempo médio de resposta
- **Error Rate**: Taxa de erros por hora/dia
- **CORS Issues**: Problemas de CORS
- **Auth Failures**: Falhas de autenticação

## 🛠️ Manutenção

### **Limpeza Automática**

```bash
# Configurar cron job para limpeza diária
0 2 * * * cd /path/to/project && node scripts/clean-logs.js

# Configurar cron job para healthcheck a cada 5 minutos
*/5 * * * * cd /path/to/project && node scripts/healthcheck-runner.js --once
```

### **Backup de Logs**

```bash
# Exportar logs para backup
curl "https://api.supabase.com/rest/v1/system_logs?select=*" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  > backup-logs-$(date +%Y%m%d).json
```

### **Monitoramento de Performance**

```bash
# Verificar logs de performance
curl "https://api.supabase.com/rest/v1/system_logs?test_suite=eq.performance&response_time_ms=gt.2000" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY"
```

## 🚨 Troubleshooting

### **Problemas Comuns**

1. **Logs não aparecem**
   - Verificar conexão com Supabase
   - Validar variáveis de ambiente
   - Verificar permissões do service role

2. **Testes falhando**
   - Verificar se o backend está rodando
   - Validar URLs de teste
   - Verificar timeouts

3. **Performance lenta**
   - Ajustar intervalos de execução
   - Otimizar queries do Supabase
   - Verificar índices da tabela

### **Logs de Debug**

```bash
# Ativar logs verbosos
TEST_VERBOSE=true npm test

# Ver logs do healthcheck runner
node scripts/healthcheck-runner.js --once 2>&1 | tee healthcheck.log
```

## 📈 Melhorias Futuras

- [ ] **Alertas por Email/Slack**
- [ ] **Gráficos de tendência**
- [ ] **Análise de padrões**
- [ ] **Machine Learning para detecção de anomalias**
- [ ] **Integração com ferramentas de monitoramento**
- [ ] **Dashboard em tempo real com WebSockets**

## 📞 Suporte

Para dúvidas ou problemas:

1. Verificar logs do sistema
2. Consultar este README
3. Verificar configurações de ambiente
4. Testar conectividade com Supabase

---

**Desenvolvido com ❤️ para monitoramento robusto e confiável**
