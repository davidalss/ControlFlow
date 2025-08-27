# Sistema de Testes Automatizados

Este diretório contém o sistema completo de testes automatizados para a aplicação ControlFlow, incluindo testes para todas as APIs existentes e a nova funcionalidade de etiqueta.

## 📋 Estrutura dos Testes

### Testes Existentes
- **`healthcheck.test.js`** - Testes de saúde da aplicação
- **`contract.test.js`** - Testes de contrato e validação de schemas
- **`smoke.test.js`** - Testes básicos de funcionalidade

### Testes Novos Implementados
- **`api-comprehensive.test.js`** - Testes abrangentes de todas as APIs
- **`etiqueta-feature.test.js`** - Testes específicos da funcionalidade de etiqueta
- **`config.js`** - Configuração centralizada para todos os testes

## 🚀 Como Executar os Testes

### Executar Todos os Testes
```bash
npm run test:all
```

### Executar Testes Específicos
```bash
# Testes de contrato
npm run test:contract

# Testes abrangentes de API
npm run test:api-comprehensive

# Testes específicos de etiqueta
npm run test:etiqueta

# Testes de saúde
npm run test:healthcheck

# Testes básicos
npm run test:smoke
```

## 📊 Cobertura dos Testes

### APIs Testadas

#### 1. API de Produtos (`/api/products`)
- ✅ GET - Listar todos os produtos
- ✅ GET - Recuperar produto individual
- ✅ Validação de schema
- ✅ Performance (tempo de resposta < 2s)

#### 2. API de Fornecedores (`/api/suppliers`)
- ✅ GET - Listar todos os fornecedores
- ✅ GET - Estatísticas de fornecedores
- ✅ Validação de schema
- ✅ Performance (tempo de resposta < 2s)

#### 3. API de Planos de Inspeção (`/api/inspection-plans`)
- ✅ GET - Listar todos os planos
- ✅ GET - Recuperar plano individual
- ✅ Validação de schema
- ✅ Integração com produtos

#### 4. API de Etiqueta Questions (`/api/etiqueta-questions`)
- ✅ GET - Listar todas as perguntas de etiqueta
- ✅ GET - Recuperar pergunta individual
- ✅ GET - Recuperar resultados de inspeção
- ✅ POST - Upload de PDF de referência
- ✅ POST - Executar inspeção de etiqueta
- ✅ Validação de schema
- ✅ Integração com Supabase Storage

### Funcionalidades Testadas

#### Validação de Entrada
- ✅ Rejeição de dados inválidos
- ✅ Validação de email
- ✅ Validação de limites de aprovação
- ✅ Validação de tipos de arquivo

#### Performance
- ✅ Tempo de resposta das APIs
- ✅ Performance de upload de arquivos
- ✅ Limites de timeout

#### Integração
- ✅ Relacionamentos entre entidades
- ✅ Integração com Supabase Storage
- ✅ Fluxo completo de etiqueta

## 🔧 Configuração

### Variáveis de Ambiente
```bash
# URL base para testes
TEST_BASE_URL=http://localhost:5002

# Configurações de Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Configurações de teste
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=testpassword123
TEST_LOGGING=true
TEST_LOG_LEVEL=info
```

### Configurações de Timeout
- **DEFAULT_TIMEOUT**: 15 segundos
- **UPLOAD_TIMEOUT**: 30 segundos
- **PERFORMANCE_TIMEOUT**: 10 segundos

## 📈 Métricas de Performance

### Limites Definidos
- **API Response Time**: < 2 segundos
- **Upload Time**: < 10 segundos
- **Database Query Time**: < 1 segundo

### Validações de Schema
Todos os endpoints são validados contra schemas Zod que garantem:
- Tipos de dados corretos
- Campos obrigatórios presentes
- Valores dentro dos limites esperados
- URLs válidas para arquivos

## 🧪 Testes Específicos de Etiqueta

### Funcionalidades Testadas
1. **Upload de PDF de Referência**
   - Conversão automática para imagem
   - Salvamento no Supabase Storage
   - Validação de formato e tamanho

2. **Inspeção de Etiqueta**
   - Upload de foto de teste
   - Comparação com imagem de referência
   - Cálculo de similaridade
   - Determinação de aprovação/reprovação

3. **Recuperação de Resultados**
   - Histórico de inspeções
   - Detalhes de comparação
   - Métricas de performance

4. **Validações**
   - Limite de aprovação (0-1)
   - Formatos de arquivo aceitos
   - Tamanhos máximos

## 🔍 Logs e Relatórios

### Formato de Log
Os testes geram logs detalhados incluindo:
- Tempo de execução
- Status de cada teste
- Erros e avisos
- Métricas de performance

### Exemplo de Saída
```
🚀 Iniciando Testes Abrangentes de API...
📍 Base URL: http://localhost:5002
⏱️  Timeout: 15000ms

🔍 Testando API de Produtos...
✅ GET /api/products - Listou 449 produtos (406ms)
✅ GET /api/products/:id - Produto individual recuperado (156ms)

📊 RESUMO DOS TESTES ABRANGENTES:
⏱️  Tempo total: 8542ms
✅ Passaram: 15/15
❌ Falharam: 0/15
📈 Taxa de sucesso: 100.0%
```

## 🛠️ Manutenção dos Testes

### Adicionando Novos Testes
1. Crie um novo arquivo de teste seguindo o padrão `*.test.js`
2. Importe as configurações de `config.js`
3. Use os schemas de validação existentes
4. Adicione o script no `package.json`
5. Documente a nova funcionalidade

### Atualizando Schemas
1. Modifique os schemas em `config.js`
2. Atualize os testes correspondentes
3. Execute os testes para validar as mudanças

### Configurações de Ambiente
1. Adicione novas variáveis em `TEST_CONFIG`
2. Atualize a validação em `ENV_CONFIG`
3. Documente as novas configurações

## 🚨 Troubleshooting

### Problemas Comuns

#### Timeout nos Testes
```bash
# Aumentar timeout
export TEST_BASE_URL_TIMEOUT=30000
```

#### Erro de Conexão
```bash
# Verificar se o servidor está rodando
curl http://localhost:5002/api/health
```

#### Erro de Autenticação
```bash
# Verificar variáveis de ambiente
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

### Logs de Debug
```bash
# Habilitar logs detalhados
export TEST_LOGGING=true
export TEST_LOG_LEVEL=debug
```

## 📝 Contribuição

Para contribuir com os testes:

1. **Siga o padrão existente** - Use as configurações e utilitários já definidos
2. **Mantenha a cobertura** - Adicione testes para novas funcionalidades
3. **Documente mudanças** - Atualize este README quando necessário
4. **Execute todos os testes** - Use `npm run test:all` antes de commitar

## 🔗 Links Úteis

- [Documentação da API](https://github.com/seu-repo/api-docs)
- [Schema de Validação](shared/schema.ts)
- [Configurações do Supabase](server/config/supabase.ts)
- [Scripts de Deploy](scripts/)
