# Módulo de Gestão de Fornecedores

## Visão Geral

O módulo de Gestão de Fornecedores foi implementado com todas as funcionalidades solicitadas, incluindo CRUD completo, vinculação de produtos, avaliações e auditorias.

## Funcionalidades Implementadas

### ✅ Cadastro e Manutenção de Fornecedores

- **Criar fornecedores**: Formulário completo com validação
- **Editar fornecedores**: Atualização de todos os campos
- **Excluir fornecedores**: Com confirmação e validações
- **Listar fornecedores**: Com filtros e paginação

### ✅ Tipos de Fornecedores

- **Importados**: Fornecedores que podem vender 1 ou mais produtos
- **Nacionais**: Fornecedores que vendem variedades de produtos já cadastrados

### ✅ Vinculação de Produtos

- **Vincular produtos**: Associar múltiplos produtos ao mesmo fornecedor
- **Gerenciar vínculos**: Adicionar/remover produtos de fornecedores

### ✅ Avaliação de Fornecedores

- **Criar avaliações**: Baseadas em eventos (recebimento de container, auditoria, etc.)
- **Critérios de avaliação**:
  - Qualidade (0-100)
  - Entrega (0-100)
  - Custo (0-100)
  - Comunicação (0-100)
  - Suporte Técnico (0-100)
- **Score geral**: Calculado automaticamente
- **Histórico**: Múltiplas avaliações por fornecedor

### ✅ Auditorias de Fornecedores

- **Criar auditorias**: Com diferentes tipos (inicial, vigilância, recertificação, acompanhamento)
- **Resultados**: Score e status (aprovado, reprovado, condicional)
- **Controle**: Próxima data de auditoria

### ✅ CRUD Funcional

- **Create**: Criar fornecedores, avaliações e auditorias
- **Read**: Listar e visualizar detalhes
- **Update**: Editar informações
- **Delete**: Excluir com validações

## Estrutura do Banco de Dados

### Tabela `suppliers`
```sql
CREATE TABLE "suppliers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "code" text UNIQUE NOT NULL,
  "name" text NOT NULL,
  "type" text NOT NULL, -- 'imported' | 'national'
  "country" text NOT NULL,
  "category" text NOT NULL,
  "status" text DEFAULT 'active', -- 'active' | 'suspended' | 'under_review' | 'blacklisted'
  "contact_person" text NOT NULL,
  "email" text NOT NULL,
  "phone" text NOT NULL,
  "address" text,
  "website" text,
  "rating" real DEFAULT 0,
  "performance" text, -- JSON
  "last_audit" timestamp,
  "next_audit" timestamp,
  "audit_score" real DEFAULT 0,
  "observations" text,
  "is_active" boolean DEFAULT true,
  "created_by" uuid NOT NULL REFERENCES users(id),
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);
```

### Tabela `supplier_products`
```sql
CREATE TABLE "supplier_products" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "supplier_id" uuid NOT NULL REFERENCES suppliers(id),
  "product_id" uuid NOT NULL REFERENCES products(id),
  "is_active" boolean DEFAULT true,
  "created_at" timestamp DEFAULT now()
);
```

### Tabela `supplier_evaluations`
```sql
CREATE TABLE "supplier_evaluations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "supplier_id" uuid NOT NULL REFERENCES suppliers(id),
  "evaluation_date" timestamp NOT NULL,
  "event_type" text NOT NULL, -- 'container_receipt' | 'audit' | 'quality_review' | 'performance_review'
  "event_description" text,
  "quality_score" real NOT NULL,
  "delivery_score" real NOT NULL,
  "cost_score" real NOT NULL,
  "communication_score" real NOT NULL,
  "technical_score" real NOT NULL,
  "overall_score" real NOT NULL,
  "strengths" text, -- JSON
  "weaknesses" text, -- JSON
  "recommendations" text, -- JSON
  "observations" text,
  "evaluated_by" uuid NOT NULL REFERENCES users(id),
  "created_at" timestamp DEFAULT now()
);
```

### Tabela `supplier_audits`
```sql
CREATE TABLE "supplier_audits" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "supplier_id" uuid NOT NULL REFERENCES suppliers(id),
  "audit_date" timestamp NOT NULL,
  "auditor" text NOT NULL,
  "audit_type" text NOT NULL, -- 'initial' | 'surveillance' | 'recertification' | 'follow_up'
  "score" real NOT NULL,
  "status" text NOT NULL, -- 'passed' | 'failed' | 'conditional'
  "findings" text, -- JSON
  "recommendations" text, -- JSON
  "corrective_actions" text, -- JSON
  "next_audit_date" timestamp,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp DEFAULT now()
);
```

## API Endpoints

### Fornecedores
- `GET /api/suppliers` - Listar fornecedores com filtros
- `GET /api/suppliers/:id` - Buscar fornecedor específico
- `POST /api/suppliers` - Criar novo fornecedor
- `PUT /api/suppliers/:id` - Atualizar fornecedor
- `DELETE /api/suppliers/:id` - Deletar fornecedor
- `GET /api/suppliers/stats/overview` - Estatísticas gerais
- `DELETE /api/suppliers/clear-mock` - Limpar fornecedores fictícios

### Avaliações
- `GET /api/suppliers/:id/evaluations` - Listar avaliações
- `POST /api/suppliers/:id/evaluations` - Criar avaliação

### Auditorias
- `GET /api/suppliers/:id/audits` - Listar auditorias
- `POST /api/suppliers/:id/audits` - Criar auditoria

## Frontend

### Página Principal
- **Localização**: `client/src/pages/supplier-management.tsx`
- **Funcionalidades**:
  - Lista de fornecedores com filtros
  - Detalhes do fornecedor selecionado
  - Gráficos de performance
  - Histórico de avaliações e auditorias

### Hooks Personalizados
- **Localização**: `client/src/hooks/use-suppliers.ts`
- **Hooks disponíveis**:
  - `useSuppliers()` - Listar fornecedores
  - `useSupplier(id)` - Buscar fornecedor específico
  - `useCreateSupplier()` - Criar fornecedor
  - `useUpdateSupplier()` - Atualizar fornecedor
  - `useDeleteSupplier()` - Deletar fornecedor
  - `useCreateEvaluation()` - Criar avaliação
  - `useCreateAudit()` - Criar auditoria
  - `useClearMockSuppliers()` - Limpar dados fictícios

### Componentes
- **Formulários**: Criação e edição de fornecedores
- **Diálogos**: Avaliações e auditorias
- **Filtros**: Status, tipo, categoria, busca
- **Gráficos**: Performance e métricas

## Validações

### Fornecedor
- Código único obrigatório
- Nome obrigatório
- Tipo obrigatório (imported/national)
- País obrigatório
- Categoria obrigatória
- Contato obrigatório
- Email válido obrigatório
- Telefone obrigatório

### Avaliação
- Data da avaliação
- Tipo de evento obrigatório
- Scores de 0-100 para todos os critérios
- Score geral calculado automaticamente

### Auditoria
- Data da auditoria
- Auditor obrigatório
- Tipo de auditoria obrigatório
- Score de 0-100
- Status obrigatório

## Funcionalidades Especiais

### Limpeza de Dados Fictícios
- Endpoint: `DELETE /api/suppliers/clear-mock`
- Remove fornecedores com nome contendo "Mock"
- Apenas administradores podem executar
- Remove avaliações e auditorias relacionadas

### Estatísticas
- Total de fornecedores
- Distribuição por status
- Distribuição por tipo
- Top 10 países
- Rating médio

### Performance
- Cache com React Query
- Paginação otimizada
- Filtros em tempo real
- Validação de formulários com Zod

## Como Usar

1. **Acessar a página**: Navegue para `/supplier-management`
2. **Criar fornecedor**: Clique em "Novo Fornecedor"
3. **Editar fornecedor**: Clique em "Editar" na lista
4. **Criar avaliação**: Selecione um fornecedor e clique em "Nova Avaliação"
5. **Criar auditoria**: Selecione um fornecedor e clique em "Nova Auditoria"
6. **Filtrar**: Use os filtros na parte superior
7. **Visualizar detalhes**: Clique em um fornecedor na lista

## Próximos Passos

- [ ] Implementar exportação de relatórios
- [ ] Adicionar notificações para auditorias próximas
- [ ] Implementar dashboard de métricas
- [ ] Adicionar upload de documentos
- [ ] Implementar workflow de aprovação
- [ ] Adicionar integração com sistemas externos
