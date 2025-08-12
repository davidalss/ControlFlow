## Arquitetura do Projeto

Este documento descreve a arquitetura do PROJETO QualiHub (ControlFlow) e a metodologia ágil adotada.

### Visão Geral

O sistema é composto por:
- Frontend Web (React + TypeScript + Vite)
- Backend (Node.js + Express + TypeScript)
- Banco de Dados (SQLite em dev; Drizzle ORM; opcional PostgreSQL em produção)
- App Mobile (React Native/Expo) para inspeções em campo
- Integração com SAP (sincronização de produtos, notificações e envio de resultados)

### Frontend Web
- React 18 + TypeScript, Vite para build/serve
- UI: Tailwind CSS, Radix UI, design responsivo, animações com framer-motion
- Estado do servidor: React Query (TanStack)
- Autenticação: JWT armazenado no localStorage e enviado via Authorization Bearer
- Roteamento: React Router, rotas protegidas por contexto de autenticação

#### Estrutura
- `client/src/pages`: páginas (dashboard, products, inspections, users, profile, etc)
- `client/src/components`: componentes reutilizáveis e UI (shadcn/radix)
- `client/src/hooks`: hooks (use-auth, use-theme, use-toast)
- `client/src/lib`: utilitários (queryClient, utils, constants)

### Backend
- Express + TypeScript
- Middlewares: autenticação JWT, upload de arquivos (Multer), sessões (para extensões futuras)
- Rotas RESTful:
  - `/api/auth/*` (login, me, esqueceu-senha)
  - `/api/users/*` (CRUD, perfil, mudança de senha/email, upload de foto)
  - `/api/products/*` (catálogo de produtos)
  - `/api/inspections/*`, `/api/inspection-plans/*`, `/api/approvals/*` (inspeções e aprovações)
  - `/api/blocks/*` (bloqueios)
  - `/api/reports`, `/api/logs`, `/api/notifications`
- Integração SAP encapsulada em `server/sap-integration.ts`

### Persistência (Drizzle ORM)
- Schema tipado em `shared/schema.ts`
- Migrações gerenciadas via Drizzle Kit
- Em desenvolvimento: SQLite (`local.db`)
- Em produção: recomendado PostgreSQL (config via `drizzle.config.ts` e variáveis de ambiente)

### App Mobile (Expo)
- Telas para inspeções, câmera, scanner de código de barras, sincronização offline
- Contextos: Autenticação e modo Offline
- Comunicação com backend via REST quando online; fallback local quando offline

### Segurança
- Autenticação JWT (Bearer) com expiração
- Autorização por role (admin, inspector, engineering, etc.)
- Validação de entrada (Zod onde aplicável)
- Uploads de mídia com validações básicas

### Observabilidade
- Logs estruturados no servidor
- Endpoints de logs/relatórios

---

## Metodologia Ágil

Adotamos uma abordagem enxuta de Scrum/Kanban, focando em entregas iterativas, curtas e com feedback contínuo.

### Papéis (ajustável ao tamanho da equipe)
- Product Owner: prioriza backlog e critérios de aceite
- Tech Lead: garante qualidade técnica e arquitetura
- Devs: implementam histórias, testes e revisão de código

### Cerimônias
- Planejamento (quinzenal/semanal): definição de metas do ciclo
- Dailies (curtas): alinhamento e remoção de impedimentos
- Review: demonstração de incrementos ao final do ciclo
- Retrospectiva: melhorias de processo contínuas

### Backlog e Priorização
- Épicos: grandes áreas (Inspeções, Produtos, SAP, Mobile)
- Histórias: tarefas com critérios de aceite claros
- Priorização por valor de negócio e risco

### Fluxo de Trabalho (Kanban)
- To Do → Em Progresso → Em Revisão → Testes → Done
- Limites de WIP para evitar multitarefa excessiva
- Pull Requests com revisão obrigatória

### Qualidade e Entrega Contínua
- Padrões de código (TypeScript estrito, ESLint/Prettier)
- Testes unitários onde crítico e e2e nas jornadas principais
- CI para lint/build/test; CD opcional para ambientes

### Métricas
- Throughput, Lead/Cycle Time
- Taxa de defeitos pós-release
- Aderência aos critérios de aceite e NPS dos usuários internos

---

## Como Contribuir
1. Abra uma issue descrevendo a necessidade
2. Crie uma branch `feat/xyz` ou `fix/xyz`
3. Commits semânticos (conventional commits)
4. Abra PR com descrição clara e evidências


