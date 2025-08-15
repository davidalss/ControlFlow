# 📋 DOCUMENTAÇÃO COMPLETA - CONTROLFLOW

## 🎯 **VISÃO GERAL**

O **ControlFlow** é um sistema web responsivo para controle de qualidade e inspeções industriais, desenvolvido com tecnologias modernas e foco em usabilidade e eficiência. O sistema abrange desde o controle de produtos até treinamentos e gestão de qualidade.

### **Tecnologias Utilizadas**
- **Frontend:** React 18 + TypeScript + Vite
- **Backend:** Node.js + Express + TypeScript
- **Banco de Dados:** PostgreSQL
- **ORM:** Drizzle ORM
- **UI Framework:** Shadcn/ui + Tailwind CSS
- **Animações:** Framer Motion
- **Autenticação:** JWT
- **Upload de Arquivos:** Multer
- **Build Tool:** Vite + ESBuild

---

## 🏗️ **ARQUITETURA DO SISTEMA**

### **Estrutura de Diretórios**
```
ControlFlow/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── hooks/         # Custom hooks
│   │   ├── contexts/      # Contextos React
│   │   ├── lib/           # Utilitários e configurações
│   │   └── styles/        # Estilos globais
├── server/                # Backend Node.js
│   ├── middleware/        # Middlewares Express
│   ├── routes/           # Rotas da API
│   └── storage/          # Configuração de uploads
├── shared/               # Código compartilhado
│   └── schema.ts         # Schema do banco (Drizzle)
├── migrations/           # Migrações do banco
└── docs/                # Documentação
```

### **Fluxo de Dados**
1. **Frontend** → **API REST** → **Drizzle ORM** → **PostgreSQL**
2. **Autenticação JWT** em todas as rotas protegidas
3. **Upload de arquivos** via Multer
4. **Validação** via Zod schemas

---

## 🔐 **SISTEMA DE AUTENTICAÇÃO E CONTROLE DE USUÁRIOS**

### **Configuração JWT**
- **Secret:** Configurado via variável de ambiente
- **Expiração:** 24 horas
- **Refresh:** Implementado via middleware

### **Sistema de Roles e Permissões**
```typescript
type UserRole = 
  | 'admin'           // Administrador completo
  | 'inspector'       // Inspetor de qualidade
  | 'engineering'     // Engenharia de qualidade
  | 'coordenador'     // Coordenador de equipe
  | 'block_control'   // Controle de bloqueios
  | 'temporary_viewer' // Visualizador temporário
  | 'analista'        // Analista de dados
  | 'assistente'      // Assistente administrativo
  | 'lider'           // Líder de equipe
  | 'supervisor'      // Supervisor
  | 'p&d'            // Pesquisa e Desenvolvimento
  | 'tecnico'        // Técnico
  | 'manager';       // Gerente
```

### **Business Units**
```typescript
type BusinessUnit = 
  | 'DIY'              // Faça você mesmo
  | 'TECH'             // Tecnologia
  | 'KITCHEN_BEAUTY'   // Cozinha e Beleza
  | 'MOTOR_COMFORT'    // Motor e Conforto
  | 'N/A';             // Não aplicável
```

### **Funcionalidades do Módulo de Usuários**
- ✅ **Gestão Completa de Usuários**
  - Cadastro com validação de email
  - Definição de roles e permissões
  - Associação a business units
  - Upload de foto de perfil
  - Controle de status (ativo/inativo)
  - Data de expiração de conta

- ✅ **Sistema de Permissões**
  - Controle granular por módulo
  - Permissões de leitura/escrita/exclusão
  - Acesso baseado em business unit
  - Auditoria de ações

- ✅ **Recuperação de Senha**
  - Token de reset via email
  - Expiração automática
  - Validação de segurança

- ✅ **Perfil do Usuário**
  - Edição de dados pessoais
  - Alteração de senha
  - Upload de foto
  - Histórico de atividades

### **Rotas Protegidas**
```typescript
// Middleware de autenticação
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token não fornecido' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
};
```

### **Usuários Padrão**
- **Admin:** admin@controlflow.com / admin123
- **Inspetor:** inspector@controlflow.com / inspector123

---

## 📊 **MÓDULO DE PRODUTOS**

### **Funcionalidades**
- ✅ Cadastro completo de produtos
- ✅ Categorização por unidade de negócio
- ✅ Parâmetros técnicos (JSON)
- ✅ Busca e filtros avançados
- ✅ Upload de imagens
- ✅ Histórico de alterações
- ✅ Códigos EAN para inspeção
- ✅ Gestão de categorias
- ✅ Relatórios de produtos

### **Estrutura do Produto**
```typescript
interface Product {
  id: string;
  code: string;                    // Código interno
  ean: string;                     // Código de barras
  description: string;             // Descrição completa
  category: string;                // Categoria
  businessUnit: BusinessUnit;      // Unidade de negócio
  technicalParameters: string;     // JSON com parâmetros
  createdAt: Date;
}
```

### **Parâmetros Técnicos**
```json
{
  "potencia": "1500W",
  "capacidade": "5.5L",
  "temperatura": "80-200°C",
  "timer": "60 minutos",
  "funcoes": ["Fritar", "Assar", "Grelhar"],
  "dimensoes": "35 x 30 x 35 cm",
  "peso": "4.2 kg",
  "voltagem": "220V",
  "garantia": "12 meses"
}
```

---

## 🔍 **MÓDULO DE INSPEÇÕES**

### **Funcionalidades Principais**
- ✅ **Wizard de Inspeção**
  - Identificação do produto via EAN
  - Configuração de amostragem
  - Execução de inspeção
  - Revisão e aprovação

- ✅ **Planos de Inspeção**
  - Criação de planos baseados em documentos
  - Estrutura hierárquica de etapas
  - Checklists configuráveis
  - Parâmetros obrigatórios
  - Fotos obrigatórias

- ✅ **Execução de Inspeções**
  - Interface intuitiva para inspetores
  - Captura de fotos integrada
  - Validação em tempo real
  - Cálculo automático de AQL
  - Registro de não conformidades

- ✅ **Controle de Qualidade**
  - Aprovação/rejeição de lotes
  - Registro de bloqueios
  - Histórico completo
  - Relatórios detalhados

### **Estrutura do Plano de Inspeção**
```typescript
interface InspectionPlan {
  id: string;
  planCode: string;              // Ex: PCG02.049
  planName: string;              // Nome do plano
  planType: 'product' | 'parts'; // Tipo de inspeção
  version: string;               // Versão do plano
  status: 'active' | 'inactive' | 'draft';
  
  // Informações do produto
  productId: string;
  productCode: string;
  productName: string;
  productFamily: string;
  businessUnit: BusinessUnit;
  
  // Critérios de aceite
  aqlCritical: number;
  aqlMajor: number;
  aqlMinor: number;
  samplingMethod: string;
  inspectionLevel: 'I' | 'II' | 'III';
  
  // Estrutura
  inspectionSteps: string;       // JSON com etapas
  checklists: string;           // JSON com checklists
  requiredParameters: string;   // JSON com parâmetros
  requiredPhotos: string;       // JSON com fotos obrigatórias
  
  // Arquivos
  labelFile?: string;
  manualFile?: string;
  packagingFile?: string;
  artworkFile?: string;
  additionalFiles?: string;
  
  // Controle
  createdBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### **Fluxo de Inspeção**
1. **Identificação do Produto**
   - Leitura do código EAN
   - Carregamento do plano de inspeção
   - Validação de permissões

2. **Configuração de Amostragem**
   - Cálculo automático baseado no AQL
   - Definição do tamanho da amostra
   - Seleção do método de amostragem

3. **Execução da Inspeção**
   - Navegação pelas etapas do plano
   - Preenchimento de checklists
   - Captura de fotos obrigatórias
   - Registro de parâmetros

4. **Revisão e Aprovação**
   - Validação dos dados coletados
   - Cálculo de resultados
   - Decisão de aprovação/rejeição
   - Geração de relatório

---

## 🏭 **MÓDULO DE ENGENHARIA DE QUALIDADE**

### **Funcionalidades**
- ✅ **Gestão de Planos de Inspeção**
  - Criação e edição de planos
  - Versionamento de documentos
  - Aprovação de planos
  - Controle de revisões

- ✅ **Configuração de Parâmetros**
  - Definição de critérios AQL
  - Configuração de métodos de amostragem
  - Estabelecimento de limites de aceitação
  - Criação de checklists personalizados

- ✅ **Gestão de Documentação**
  - Upload de manuais técnicos
  - Gestão de etiquetas e embalagens
  - Controle de artes e especificações
  - Versionamento de documentos

- ✅ **Análise de Dados**
  - Relatórios de não conformidades
  - Análise de tendências
  - Estatísticas de qualidade
  - Indicadores de performance

- ✅ **Controle de Processos**
  - Definição de workflows
  - Configuração de aprovações
  - Gestão de exceções
  - Auditoria de processos

### **Estrutura de Workflow**
```typescript
interface QualityWorkflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  approvals: ApprovalStep[];
  isActive: boolean;
  createdAt: Date;
}

interface WorkflowStep {
  id: string;
  name: string;
  type: 'inspection' | 'approval' | 'documentation';
  required: boolean;
  order: number;
  assignee: string;
  timeLimit?: number;
}
```

---

## 📚 **MÓDULO DE TREINAMENTOS**

### **Funcionalidades**
- ✅ **Gestão de Cursos**
  - Criação de cursos online
  - Upload de materiais (PDF, vídeos, imagens)
  - Configuração de módulos e aulas
  - Definição de pré-requisitos

- ✅ **Sistema de Aprendizado**
  - Player de vídeo integrado
  - Navegação por módulos
  - Progresso automático
  - Certificados de conclusão

- ✅ **Gestão de Usuários**
  - Matrícula em cursos
  - Acompanhamento de progresso
  - Histórico de treinamentos
  - Relatórios de participação

- ✅ **Administração**
  - Painel administrativo
  - Gestão de instrutores
  - Configuração de testes
  - Emissão de certificados

- ✅ **Relatórios e Analytics**
  - Progresso por usuário
  - Estatísticas de conclusão
  - Tempo médio de estudo
  - Avaliações de satisfação

### **Estrutura do Curso**
```typescript
interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: number;              // em minutos
  modules: CourseModule[];
  prerequisites: string[];
  isActive: boolean;
  createdAt: Date;
}

interface CourseModule {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
  quiz?: Quiz;
}

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'pdf' | 'text' | 'quiz';
  content: string;              // URL ou conteúdo
  duration: number;             // em minutos
  isRequired: boolean;
}
```

### **Sistema de Certificação**
- ✅ Emissão automática de certificados
- ✅ Validação de certificados
- ✅ Histórico de certificações
- ✅ Renovação de certificados

---

## 📈 **MÓDULO DE INDICADORES E RELATÓRIOS**

### **Dashboard Principal**
- ✅ **Métricas em Tempo Real**
  - Total de inspeções do dia
  - Taxa de aprovação/rejeição
  - Produtos mais inspecionados
  - Alertas de qualidade

- ✅ **Gráficos Interativos**
  - Tendências de qualidade
  - Performance por business unit
  - Análise de não conformidades
  - Comparativo mensal

### **Relatórios Especializados**
- ✅ **Relatórios de Inspeção**
  - Detalhamento por produto
  - Análise por período
  - Comparativo entre lotes
  - Exportação em PDF/Excel

- ✅ **Relatórios de Treinamento**
  - Progresso por usuário
  - Estatísticas de conclusão
  - Certificados emitidos
  - Avaliações de satisfação

- ✅ **Relatórios de Qualidade**
  - Análise de não conformidades
  - Tendências de defeitos
  - Performance de fornecedores
  - Indicadores de processo

---

## 🔒 **MÓDULO DE CONTROLE DE BLOQUEIOS**

### **Funcionalidades**
- ✅ **Gestão de Bloqueios**
  - Registro de produtos bloqueados
  - Motivos de bloqueio
  - Responsável pelo bloqueio
  - Data de liberação

- ✅ **Workflow de Aprovação**
  - Solicitação de liberação
  - Aprovação por níveis
  - Notificações automáticas
  - Histórico de decisões

- ✅ **Controle de Acesso**
  - Permissões por nível
  - Auditoria de ações
  - Logs de atividades
  - Backup de dados

---

## 🏢 **MÓDULO DE GESTÃO DE FORNECEDORES**

### **Funcionalidades**
- ✅ **Cadastro de Fornecedores**
  - Dados cadastrais completos
  - Classificação por categoria
  - Histórico de performance
  - Documentação legal

- ✅ **Avaliação de Qualidade**
  - Critérios de avaliação
  - Pontuação automática
  - Relatórios de performance
  - Ações corretivas

- ✅ **Controle de Contratos**
  - Gestão de contratos
  - Prazos de entrega
  - Especificações técnicas
  - Penalidades

---

## 📋 **MÓDULO DE SOLICITAÇÕES**

### **Funcionalidades**
- ✅ **Criação de Solicitações**
  - Tipos de solicitação
  - Priorização automática
  - Anexos de documentos
  - Rastreamento de status

- ✅ **Workflow de Aprovação**
  - Fluxo configurável
  - Notificações automáticas
  - Histórico de decisões
  - Relatórios de tempo

---

## 📊 **MÓDULO SPC (CONTROLE ESTATÍSTICO DE PROCESSO)**

### **Funcionalidades**
- ✅ **Cartas de Controle**
  - Gráficos X-bar e R
  - Limites de controle
  - Alertas automáticos
  - Análise de tendências

- ✅ **Análise de Capacidade**
  - Cálculo de Cp e Cpk
  - Análise de distribuição
  - Relatórios de capacidade
  - Recomendações

---

## 📱 **MÓDULO MOBILE**

### **Funcionalidades**
- ✅ **Inspeções em Campo**
  - Interface otimizada para mobile
  - Captura de fotos
  - Sincronização offline
  - GPS tracking

- ✅ **Scanner de Código de Barras**
  - Leitura de EAN
  - Identificação automática
  - Histórico de leituras
  - Validação em tempo real

---

## 🔧 **CONFIGURAÇÕES E PERSONALIZAÇÃO**

### **Configurações do Sistema**
- ✅ **Parâmetros Globais**
  - Configurações de email
  - Configurações de upload
  - Configurações de backup
  - Configurações de segurança

- ✅ **Personalização de Interface**
  - Temas claro/escuro
  - Layout personalizável
  - Idioma (português/inglês)
  - Notificações personalizadas

---

## 📚 **API REFERENCE**

### **Endpoints Principais**

#### **Autenticação**
```http
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me
POST /api/auth/reset-password
```

#### **Usuários**
```http
GET /api/users
POST /api/users
PUT /api/users/:id
DELETE /api/users/:id
GET /api/users/profile
PUT /api/users/profile
```

#### **Produtos**
```http
GET /api/products
POST /api/products
PUT /api/products/:id
DELETE /api/products/:id
GET /api/products/:id/inspections
```

#### **Planos de Inspeção**
```http
GET /api/inspection-plans
POST /api/inspection-plans
PUT /api/inspection-plans/:id
DELETE /api/inspection-plans/:id
GET /api/inspection-plans/:id/revisions
```

#### **Inspeções**
```http
GET /api/inspections
POST /api/inspections
PUT /api/inspections/:id
DELETE /api/inspections/:id
GET /api/inspections/:id/report
```

#### **Treinamentos**
```http
GET /api/training/courses
POST /api/training/courses
GET /api/training/enrollments
POST /api/training/enrollments
GET /api/training/certificates
```

#### **Relatórios**
```http
GET /api/reports/inspections
GET /api/reports/quality
GET /api/reports/training
GET /api/reports/indicators
```

### **Respostas Padrão**
```typescript
// Sucesso
{
  success: true,
  data: any,
  message?: string
}

// Erro
{
  success: false,
  error: string,
  details?: any
}
```

---

## 🚀 **ROADMAP E MELHORIAS FUTURAS**

### **Próximas Funcionalidades**
- 🔄 **Integração SAP:** Sincronização com ERP
- 🤖 **IA/ML:** Detecção automática de defeitos
- 📊 **Dashboards Avançados:** Métricas em tempo real
- 🔔 **Sistema de Notificações:** Alertas inteligentes
- 📋 **Relatórios Avançados:** Exportação personalizada
- 🔗 **API Externa:** Integração com terceiros
- 📱 **App Mobile Nativo:** React Native
- 🎯 **Gamificação:** Sistema de pontos e conquistas

### **Otimizações Planejadas**
- ⚡ **Performance:** Otimização de queries e cache
- 🎯 **UX/UI:** Melhorias na interface e experiência
- 🔧 **DevOps:** CI/CD automatizado e monitoramento
- 📈 **Analytics:** Métricas avançadas e insights
- 🛡️ **Segurança:** Auditoria completa e compliance
- 🌐 **Internacionalização:** Suporte a múltiplos idiomas

---

## 📞 **SUPORTE E CONTATO**

### **Documentação Adicional**
- **Guia de Instalação:** `docs/INSTALACAO.md`
- **Guia de Uso:** `docs/GUIA_USUARIO.md`
- **API Docs:** `docs/API.md`
- **Troubleshooting:** `docs/TROUBLESHOOTING.md`
- **Guia de Treinamentos:** `docs/TREINAMENTOS.md`
- **Manual de Qualidade:** `docs/QUALIDADE.md`

### **Contato**
- **Email:** suporte@controlflow.com
- **Telefone:** (11) 9999-9999
- **Horário:** Segunda a Sexta, 8h às 18h
- **Chat:** Disponível no sistema

---

## 📄 **LICENÇA**

Este projeto está licenciado sob a **MIT License**. Veja o arquivo `LICENSE` para mais detalhes.

---

**Versão da Documentação:** 2.0.0  
**Última Atualização:** Janeiro 2025  
**Autor:** Equipe ControlFlow  
**Status:** Completa e Atualizada
