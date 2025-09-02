# Referência da API do ControlFlow

## 🌐 Visão Geral da API

A API do ControlFlow é uma API RESTful que fornece acesso a todas as funcionalidades do sistema. A API segue padrões REST, utiliza autenticação JWT e implementa validação robusta de entrada.

## 🔐 Autenticação

### JWT Token
```http
Authorization: Bearer <jwt_token>
```

### Headers Obrigatórios
```http
Content-Type: application/json
Authorization: Bearer <jwt_token>
X-Request-ID: <unique_request_id>
```

### Endpoints de Autenticação

#### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "João Silva",
      "role": "analyst"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_123"
  }
}
```

#### Refresh Token
```http
POST /api/auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "refresh_token_123"
}
```

#### Logout
```http
POST /api/auth/logout
```

## 📋 Planos de Inspeção

### Listar Planos
```http
GET /api/inspection-plans
```

**Query Parameters:**
- `page`: Número da página (padrão: 1)
- `limit`: Itens por página (padrão: 20)
- `status`: Filtro por status
- `productId`: Filtro por produto
- `createdBy`: Filtro por criador

**Response:**
```json
{
  "success": true,
  "data": {
    "plans": [
      {
        "id": "plan_123",
        "name": "Inspeção de Qualidade - Produto A",
        "description": "Plano completo para inspeção do produto A",
        "productId": "product_123",
        "status": "active",
        "createdBy": "user_123",
        "createdAt": "2024-01-15T10:00:00Z",
        "updatedAt": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "pages": 1
    }
  }
}
```

### Criar Plano
```http
POST /api/inspection-plans
```

**Request Body:**
```json
{
  "name": "Novo Plano de Inspeção",
  "description": "Descrição do plano",
  "productId": "product_123",
  "steps": [
    {
      "title": "Verificar Dimensões",
      "instruction": "Medir comprimento, largura e altura",
      "type": "measurement",
      "required": true,
      "order": 1
    }
  ]
}
```

### Obter Plano por ID
```http
GET /api/inspection-plans/:id
```

### Atualizar Plano
```http
PUT /api/inspection-plans/:id
```

### Excluir Plano
```http
DELETE /api/inspection-plans/:id
```

## 🔍 Inspeções

### Listar Inspeções
```http
GET /api/inspections
```

**Query Parameters:**
- `page`: Número da página
- `limit`: Itens por página
- `status`: Filtro por status
- `planId`: Filtro por plano
- `productId`: Filtro por produto
- `inspectorId`: Filtro por inspetor

### Criar Inspeção
```http
POST /api/inspections
```

**Request Body:**
```json
{
  "planId": "plan_123",
  "productId": "product_123",
  "inspectorId": "user_123",
  "startDate": "2024-01-15T10:00:00Z"
}
```

### Atualizar Status da Inspeção
```http
PATCH /api/inspections/:id/status
```

**Request Body:**
```json
{
  "status": "in_progress",
  "notes": "Iniciando inspeção"
}
```

### Registrar Resultado de Passo
```http
POST /api/inspections/:id/steps/:stepId/results
```

**Request Body:**
```json
{
  "value": "15.5",
  "unit": "cm",
  "notes": "Dimensão dentro do padrão",
  "photos": ["photo_url_1", "photo_url_2"],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 🎨 Flow Builder

### Salvar Estado do Flow
```http
POST /api/flow-builder/:planId/state
```

**Request Body:**
```json
{
  "nodes": [
    {
      "id": "node_1",
      "type": "verification",
      "title": "Verificar Dimensões",
      "position": { "x": 100, "y": 100 },
      "data": {
        "instruction": "Medir comprimento, largura e altura",
        "type": "measurement",
        "required": true
      }
    }
  ],
  "connections": [
    {
      "id": "conn_1",
      "source": "node_1",
      "target": "node_2",
      "type": "success"
    }
  ]
}
```

### Obter Estado do Flow
```http
GET /api/flow-builder/:planId/state
```

### Simular Flow
```http
POST /api/flow-builder/:planId/simulate
```

**Request Body:**
```json
{
  "answers": {
    "node_1": "15.5",
    "node_2": "SIM"
  }
}
```

## 📚 Biblioteca de Critérios

### Listar Critérios
```http
GET /api/criteria-blocks
```

**Query Parameters:**
- `category`: Filtro por categoria
- `tags`: Filtro por tags
- `type`: Filtro por tipo
- `search`: Busca por texto

### Criar Critério
```http
POST /api/criteria-blocks
```

**Request Body:**
```json
{
  "title": "Verificação de Dimensões",
  "description": "Critério para verificar dimensões de produtos",
  "instruction": "Medir comprimento, largura e altura com paquímetro",
  "type": "measurement",
  "category": "dimensional",
  "tags": ["dimensões", "medidas", "qualidade"],
  "helpMedia": {
    "type": "image",
    "url": "https://example.com/help-image.jpg"
  },
  "validation": {
    "minValue": 0,
    "maxValue": 100,
    "unit": "cm",
    "required": true
  }
}
```

### Atualizar Critério
```http
PUT /api/criteria-blocks/:id
```

### Excluir Critério
```http
DELETE /api/criteria-blocks/:id
```

## 🤖 Assistente de IA

### Sugerir Pontos de Falha
```http
POST /api/ai/suggest-failures
```

**Request Body:**
```json
{
  "planId": "plan_123",
  "context": {
    "productType": "eletrônico",
    "industry": "automotiva",
    "qualityStandards": ["ISO 9001", "IATF 16949"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "type": "verification",
        "title": "Verificar Temperatura de Operação",
        "description": "Testar temperatura máxima de operação",
        "reason": "Componentes eletrônicos são sensíveis à temperatura",
        "priority": "high",
        "estimatedTime": 300
      }
    ]
  }
}
```

### Analisar Padrões de NC
```http
POST /api/ai/analyze-nc-patterns
```

**Request Body:**
```json
{
  "productId": "product_123",
  "timeRange": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-31T23:59:59Z"
  }
}
```

## 📊 Notificações de NC

### Listar Notificações
```http
GET /api/nc-notifications
```

**Query Parameters:**
- `status`: Filtro por status
- `priority`: Filtro por prioridade
- `assignedTo`: Filtro por responsável
- `dateRange`: Filtro por período

### Criar Notificação
```http
POST /api/nc-notifications
```

**Request Body:**
```json
{
  "inspectionId": "inspection_123",
  "title": "Dimensões fora do padrão",
  "description": "Produto com dimensões abaixo do mínimo aceitável",
  "severity": "high",
  "priority": "urgent",
  "assignedTo": "user_456",
  "dueDate": "2024-01-20T23:59:59Z",
  "attachments": ["photo_url_1", "report_url_1"]
}
```

### Atualizar Status
```http
PATCH /api/nc-notifications/:id/status
```

**Request Body:**
```json
{
  "status": "in_progress",
  "notes": "Iniciando investigação",
  "estimatedResolution": "2024-01-25T23:59:59Z"
}
```

## 🏥 Sistemas Críticos

### Health Monitor

#### Status de Saúde
```http
GET /api/admin/health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overall": "healthy",
    "timestamp": "2024-01-15T10:00:00Z",
    "components": {
      "cpu": {
        "status": "healthy",
        "usage": 45.2,
        "threshold": 80
      },
      "memory": {
        "status": "healthy",
        "usage": 62.8,
        "threshold": 80
      },
      "database": {
        "status": "healthy",
        "latency": 12,
        "threshold": 100
      }
    }
  }
}
```

#### Verificação Manual
```http
POST /api/admin/health/check
```

### Cache Manager

#### Estatísticas de Cache
```http
GET /api/admin/cache
```

#### Limpar Cache
```http
POST /api/admin/cache/clear
```

**Request Body:**
```json
{
  "tags": ["products", "inspections"],
  "all": false
}
```

### Security Manager

#### Eventos de Segurança
```http
GET /api/admin/security
```

**Query Parameters:**
- `type`: Tipo de evento
- `ip`: Endereço IP
- `dateRange`: Período
- `severity`: Severidade

#### Desbloquear IP
```http
POST /api/admin/security/unblock/:ip
```

### Backup Manager

#### Listar Backups
```http
GET /api/admin/backup
```

#### Criar Backup
```http
POST /api/admin/backup/create
```

**Request Body:**
```json
{
  "type": "FULL",
  "description": "Backup manual antes de atualização",
  "retention": 30
}
```

#### Restaurar Backup
```http
POST /api/admin/backup/:id/restore
```

**Request Body:**
```json
{
  "confirm": true,
  "validateOnly": false
}
```

## 📁 Upload de Arquivos

### Upload de Arquivo
```http
POST /api/upload
```

**Headers:**
```http
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: Arquivo a ser enviado
- `category`: Categoria do arquivo
- `metadata`: Metadados adicionais (JSON)

**Response:**
```json
{
  "success": true,
  "data": {
    "fileId": "file_123",
    "filename": "inspection_photo.jpg",
    "url": "https://storage.example.com/files/file_123",
    "size": 2048576,
    "mimeType": "image/jpeg",
    "uploadedAt": "2024-01-15T10:00:00Z"
  }
}
```

### Listar Arquivos
```http
GET /api/upload
```

**Query Parameters:**
- `category`: Filtro por categoria
- `uploadedBy`: Filtro por usuário
- `dateRange`: Filtro por período
- `mimeType`: Filtro por tipo MIME

### Excluir Arquivo
```http
DELETE /api/upload/:fileId
```

## 🔍 Busca e Filtros

### Busca Global
```http
GET /api/search
```

**Query Parameters:**
- `q`: Termo de busca
- `type`: Tipo de resultado
- `limit`: Limite de resultados

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "type": "inspection_plan",
        "id": "plan_123",
        "title": "Inspeção de Qualidade - Produto A",
        "description": "Plano completo para inspeção...",
        "score": 0.95,
        "highlights": ["inspeção", "qualidade", "produto"]
      }
    ],
    "total": 1,
    "query": "inspeção qualidade"
  }
}
```

## 📈 Relatórios e Analytics

### Relatório de Inspeções
```http
GET /api/reports/inspections
```

**Query Parameters:**
- `dateRange`: Período do relatório
- `productId`: Filtro por produto
- `inspectorId`: Filtro por inspetor
- `format`: Formato (json, csv, pdf)

### Métricas de Performance
```http
GET /api/analytics/performance
```

**Query Parameters:**
- `timeRange`: Período das métricas
- `granularity`: Granularidade (hour, day, week, month)

**Response:**
```json
{
  "success": true,
  "data": {
    "metrics": {
      "totalInspections": 1250,
      "completedInspections": 1180,
      "ncRate": 0.056,
      "averageDuration": 1800,
      "inspectorEfficiency": 0.89
    },
    "trends": {
      "daily": [
        {
          "date": "2024-01-15",
          "inspections": 45,
          "ncs": 2,
          "efficiency": 0.91
        }
      ]
    }
  }
}
```

## ⚠️ Códigos de Erro

### Códigos HTTP
- `200`: Sucesso
- `201`: Criado com sucesso
- `400`: Requisição inválida
- `401`: Não autorizado
- `403`: Proibido
- `404`: Não encontrado
- `422`: Entidade não processável
- `429`: Muitas requisições
- `500`: Erro interno do servidor

### Códigos de Erro da Aplicação
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados de entrada inválidos",
    "details": [
      {
        "field": "email",
        "message": "Email deve ser válido"
      }
    ]
  }
}
```

### Códigos de Erro Comuns
- `AUTH_REQUIRED`: Autenticação necessária
- `INSUFFICIENT_PERMISSIONS`: Permissões insuficientes
- `RESOURCE_NOT_FOUND`: Recurso não encontrado
- `VALIDATION_ERROR`: Erro de validação
- `RATE_LIMIT_EXCEEDED`: Limite de taxa excedido
- `INTERNAL_ERROR`: Erro interno

## 📚 Exemplos de Uso

### Exemplo Completo: Criar e Executar Inspeção

#### 1. Criar Plano de Inspeção
```bash
curl -X POST http://localhost:3000/api/inspection-plans \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Inspeção de Qualidade",
    "description": "Plano para inspeção de qualidade",
    "productId": "product_123",
    "steps": [
      {
        "title": "Verificar Dimensões",
        "instruction": "Medir comprimento, largura e altura",
        "type": "measurement",
        "required": true,
        "order": 1
      }
    ]
  }'
```

#### 2. Criar Inspeção
```bash
curl -X POST http://localhost:3000/api/inspections \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "plan_123",
    "productId": "product_123",
    "inspectorId": "user_123"
  }'
```

#### 3. Registrar Resultado
```bash
curl -X POST http://localhost:3000/api/inspections/inspection_123/steps/step_1/results \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "value": "15.5",
    "unit": "cm",
    "notes": "Dimensão dentro do padrão"
  }'
```

## 🔧 Configuração e Limites

### Rate Limiting
- **Padrão**: 100 requisições por 15 minutos por IP
- **Autenticado**: 1000 requisições por 15 minutos por usuário
- **Admin**: 5000 requisições por 15 minutos por usuário

### Tamanhos de Arquivo
- **Imagens**: Máximo 10MB
- **Documentos**: Máximo 50MB
- **Vídeos**: Máximo 100MB

### Timeouts
- **Requisições**: 30 segundos
- **Uploads**: 5 minutos
- **Relatórios**: 2 minutos

---

**Referência da API do ControlFlow** - Interface completa para integração e desenvolvimento 🌐🔧
