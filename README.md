# 🏭 PROJETO QualiHub (ControlFlow) – Plataforma Completa para Gestão da Qualidade

Sistema completo de gestão da qualidade integrado com SAP, focado em controle estatístico de processo (SPC), gestão de fornecedores, inspeções e rastreabilidade. Este repositório consolida o frontend web, backend, schema de banco e app mobile (Expo).

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Arquitetura](#arquitetura)
- [Arquitetura e Metodologia (Doc detalhado)](./ControlFlow/docs/ARQUITETURA_E_METODOLOGIA.md)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Uso](#uso)
- [API](#api)
- [Integração SAP](#integração-sap)
- [Contribuição](#contribuição)

## 🎯 Visão Geral

O ControlFlow é um sistema web moderno desenvolvido para gerenciar processos de qualidade na WAP, oferecendo:

- **Dashboard de Qualidade**: KPIs e métricas em tempo real
- **Controle Estatístico de Processo (SPC)**: Gráficos de controle e análise de capabilidade
- **Gestão de Fornecedores**: Avaliação e auditoria de fornecedores
- **Inspeções de Qualidade**: Processo completo de inspeção
- **Integração SAP**: Sincronização bidirecional com sistema SAP
- **Relatórios**: Geração de relatórios e análises

## ✨ Funcionalidades

### 🎛️ Dashboard de Qualidade
- KPIs em tempo real por unidade de negócio
- Métricas de qualidade (PPM, COQ, NPS)
- Indicadores de processo (CPK, OEE, MTBF)
- Gráficos interativos e dashboards responsivos

### 📊 Controle Estatístico de Processo (SPC)
- Gráficos de controle (X-Barra, R, S, Individual)
- Análise de capabilidade (CP, CPK)
- Detecção de tendências e mudanças
- Alertas automáticos para violações

### 🤝 Gestão de Fornecedores
- Avaliação de performance (qualidade, entrega, custo)
- Auditorias de fornecedores
- Histórico de métricas e tendências
- Sistema de rating e classificação

### 🔍 Inspeções de Qualidade
- Planos de inspeção personalizáveis
- Checklist digital com fotos e vídeos
- Fluxo de aprovação com diferentes níveis
- Rastreabilidade completa

### 🔗 Integração SAP
- Sincronização de produtos
- Notificações de qualidade
- Envio de resultados de inspeção
- Dados mestres (materiais, fornecedores, plantas)

### 📱 App Móvel (React Native)
- **Inspeções em Campo**: Formulários dinâmicos para inspeções
- **Captura de Mídia**: Fotos e vídeos integrados
- **Scanner QR Code/Barcode**: Identificação rápida de produtos
- **Sincronização Offline**: Trabalho sem internet
- **Interface Moderna**: Design Material Design responsivo

## 🏗️ Arquitetura

### Frontend (Web)
- **React 18** com TypeScript
- **Tailwind CSS** para estilização
- **Radix UI** para componentes
- **Recharts** para gráficos
- **React Query** para gerenciamento de estado

### App Móvel
- **React Native** com Expo
- **TypeScript** para type safety
- **React Native Paper** para UI Material Design
- **SQLite** para armazenamento offline
- **Expo Camera** para captura de mídia
- **Expo Barcode Scanner** para códigos

### Backend
- **Node.js** com Express
- **TypeScript** para type safety
- **PostgreSQL** com Drizzle ORM
- **JWT** para autenticação
- **Multer** para upload de arquivos

### Banco de Dados
- **PostgreSQL** como banco principal
- **SQLite** para dados offline do app móvel
- **Drizzle ORM** para migrations e queries
- **Schema** bem definido com relacionamentos

## 🚀 Instalação

### Pré-requisitos
- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### Passos

1. **Clone o repositório**
```bash
git clone <repository-url>
cd ControlFlow
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

4. **Configure o banco de dados**
```bash
npm run db:push
```

5. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

## ⚙️ Configuração

### Variáveis de Ambiente

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/controlflow

# JWT
JWT_SECRET=your-secret-key

# SAP Integration
SAP_BASE_URL=https://sap-instance.company.com
SAP_CLIENT=100
SAP_USERNAME=your-username
SAP_PASSWORD=your-password
SAP_AUTH_TOKEN=your-token

# Server
PORT=5001
NODE_ENV=development
```

### Configuração do Banco

O sistema usa Drizzle ORM com PostgreSQL. Execute as migrations:

```bash
npm run db:push
```

## 📖 Uso

### Acessando o Sistema

1. Acesse `http://localhost:5001`
2. Faça login com as credenciais padrão:
   - **Admin**: admin@wap.com / admin123
   - **Inspetor**: inspector@wap.com / inspector123

### Navegação

- **Dashboard**: Visão geral dos KPIs de qualidade
- **SPC**: Controle estatístico de processo
- **Fornecedores**: Gestão de fornecedores
- **Inspeções**: Processo de inspeção
- **Produtos**: Catálogo de produtos
- **Usuários**: Gestão de usuários

### App Móvel

Para usar o app móvel:

1. **Instalar dependências**:
   ```bash
   cd mobile
   npm install
   ```

2. **Executar o app**:
   ```bash
   npm start
   ```

3. **Testar no dispositivo**:
   - Instale o Expo Go no seu dispositivo
   - Escaneie o QR code que aparece no terminal
   - Use as credenciais demo: `inspector@controlflow.com` / `password`

**Funcionalidades do App**:
- 📱 Inspeções em campo com formulários dinâmicos
- 📷 Captura de fotos e vídeos
- 📊 Scanner QR Code/Barcode
- 🔄 Sincronização offline
- 📋 Lista de inspeções com filtros
- ⚙️ Configurações personalizáveis

## 🔌 API

### Autenticação

```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password"
}
```

### Produtos

```bash
GET /api/products
POST /api/products
PUT /api/products/:id
DELETE /api/products/:id
```

### Inspeções

```bash
GET /api/inspections
POST /api/inspections
PUT /api/inspections/:id
GET /api/inspections/:id/approve
```

### SAP Integration

```bash
POST /api/sap/sync-products
POST /api/sap/sync-notifications
POST /api/sap/send-inspection
GET /api/sap/master-data/:type
```

## 🔗 Integração SAP

### Configuração

1. Configure as variáveis de ambiente do SAP
2. Teste a conexão com o SAP
3. Configure os mapeamentos de dados

### Funcionalidades

- **Sincronização de Produtos**: Importa produtos do SAP
- **Notificações de Qualidade**: Recebe notificações do SAP
- **Envio de Resultados**: Envia resultados de inspeção para o SAP
- **Dados Mestres**: Acessa dados mestres do SAP

### Mapeamento de Dados

```typescript
// Exemplo de mapeamento
const businessUnitMapping = {
  'WAP': 'DIY',
  'WAAW': 'KITCHEN_BEAUTY',
  'TECH': 'TECH',
  'MOTORS': 'MOTOR_COMFORT'
};
```

## 📊 Estrutura do Banco de Dados

### Tabelas Principais

- **users**: Usuários do sistema
- **products**: Produtos da WAP
- **inspections**: Inspeções de qualidade
- **inspection_plans**: Planos de inspeção
- **suppliers**: Fornecedores
- **supplier_audits**: Auditorias de fornecedores
- **spc_data**: Dados de controle estatístico
- **notifications**: Notificações do sistema

### Relacionamentos

```sql
-- Exemplo de relacionamentos
products -> inspection_plans -> inspections
suppliers -> supplier_audits
users -> inspections (inspector)
users -> approval_decisions (engineer)
```

## 🎨 Interface do Usuário

### Design System

- **Cores**: Paleta baseada na identidade visual da WAP
- **Tipografia**: Inter para melhor legibilidade
- **Componentes**: Reutilizáveis e acessíveis
- **Responsividade**: Funciona em desktop e mobile

### Componentes Principais

- **Cards**: Para exibição de informações
- **Tables**: Para listagens
- **Charts**: Para visualização de dados
- **Forms**: Para entrada de dados
- **Modals**: Para ações específicas

## 🔒 Segurança

### Autenticação

- JWT tokens
- Refresh tokens
- Expiração automática
- Logout seguro

### Autorização

- Roles baseados em usuário
- Permissões granulares
- Middleware de proteção de rotas

### Validação

- Zod schemas
- Sanitização de inputs
- Validação de arquivos

## 📈 Monitoramento

### Logs

- Logs estruturados
- Níveis de log configuráveis
- Rotação de logs

### Métricas

- Performance de API
- Uso de recursos
- Erros e exceções

## 🚀 Deploy

### Produção

```bash
npm run build
npm start
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5001
CMD ["npm", "start"]
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

### Padrões de Código

- TypeScript strict mode
- ESLint + Prettier
- Conventional commits
- Testes unitários

## 📝 Licença

Este projeto é proprietário da WAP.

## 📞 Suporte

Para suporte técnico:
- Email: suporte@wap.com
- Documentação: [Link para documentação]
- Issues: [Link para issues]

---

**Desenvolvido com ❤️ pela equipe de TI da WAP**
