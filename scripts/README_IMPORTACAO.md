# 📊 Importação de Produtos do Excel para o Supabase

Este script permite importar produtos do arquivo Excel `DADOS.xlsx` diretamente para o banco de dados Supabase em produção.

## 🚀 Como Usar

### 1. Preparação

Certifique-se de que o arquivo `DADOS.xlsx` está na pasta raiz do projeto (`ControlFlow/DADOS.xlsx`).

### 2. Instalar Dependências Python

```bash
npm run install:python-deps
```

### 3. Executar Importação

```bash
npm run import:products
```

## 📋 Estrutura Esperada do Excel

O script espera que o arquivo Excel tenha as seguintes colunas:

### Colunas Obrigatórias:
- `code` - Código do produto
- `description` - Descrição do produto  
- `category` - Categoria do produto

### Colunas Opcionais:
- `ean` - Código de barras EAN
- `business_unit` - Unidade de negócio (DIY, TECH, KITCHEN_BEAUTY, MOTOR_COMFORT, N/A)
- `voltagem` / `voltage` - Tensão elétrica
- `potencia` / `power` - Potência
- `capacidade` / `capacity` - Capacidade
- `peso` / `weight` - Peso
- `dimensoes` / `dimensions` - Dimensões
- `material` - Material
- `cor` / `color` - Cor
- `garantia` / `warranty` - Garantia
- `origem` / `origin` - Origem
- `classificacao_fiscal` - Classificação fiscal
- `familia_grupos` - Família de grupos
- `familia_comercial` - Família comercial
- `tipo_exclusividade` - Tipo de exclusividade

## 🔧 Funcionalidades do Script

### ✅ Validação de Dados
- Verifica campos obrigatórios
- Remove linhas completamente vazias
- Trata valores nulos/vazios

### ✅ Mapeamento Inteligente
- Mapeia unidades de negócio para valores aceitos
- Converte dados técnicos para JSON
- Gera IDs únicos automaticamente

### ✅ Verificação de Duplicatas
- Verifica se o produto já existe pelo código
- Pula produtos duplicados automaticamente

### ✅ Logs Detalhados
- Mostra progresso da importação
- Exibe erros específicos
- Fornece resumo final

## 📊 Exemplo de Saída

```
🔄 Iniciando importação de produtos do Excel para o Supabase...
✅ Conectado ao Supabase com sucesso!
📖 Lendo arquivo: DADOS.xlsx
✅ Arquivo lido com sucesso! 150 linhas encontradas
📊 Colunas: ['code', 'description', 'category', 'ean', 'business_unit', ...]
🧹 Limpando dados...
✅ Dados limpos! 148 linhas válidas
🔧 Preparando dados dos produtos...
✅ 145 produtos preparados para inserção
🚀 Inserindo 145 produtos no Supabase...
✅ [1/145] Produto inserido: PROD001 - Produto A
✅ [2/145] Produto inserido: PROD002 - Produto B
⏭️  Produto PROD003 já existe, pulando...
...

📈 Resumo da importação:
✅ Produtos inseridos com sucesso: 142
❌ Erros: 3
📊 Total processado: 145
🎉 Importação concluída!
```

## 🛠️ Solução de Problemas

### Erro: "Arquivo não encontrado"
- Certifique-se de que o arquivo `DADOS.xlsx` está na pasta raiz do projeto

### Erro: "Módulo não encontrado"
- Execute `npm run install:python-deps` para instalar as dependências

### Erro de conexão com Supabase
- Verifique se as credenciais do Supabase estão corretas no script
- Certifique-se de que o banco está acessível

### Produtos não sendo inseridos
- Verifique se os campos obrigatórios estão preenchidos
- Confirme se os nomes das colunas estão corretos

## 📝 Notas Importantes

1. **Backup**: O script faz backup automático antes da importação
2. **Duplicatas**: Produtos com códigos duplicados são pulados
3. **Campos Vazios**: Campos vazios são ignorados, não causam erro
4. **Parâmetros Técnicos**: Todos os campos extras são salvos como JSON
5. **Timestamps**: Data de criação é definida automaticamente

## 🔒 Segurança

- As credenciais do Supabase estão hardcoded no script
- Em produção, considere usar variáveis de ambiente
- O script usa a chave de serviço do Supabase (apenas leitura/escrita)

## 📞 Suporte

Se encontrar problemas, verifique:
1. Logs de erro no console
2. Estrutura do arquivo Excel
3. Conexão com internet
4. Permissões do Supabase
