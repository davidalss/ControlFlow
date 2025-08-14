# 🚀 ControlFlow - Sistema de Gestão de Inspeção de Qualidade

## 📋 Visão Geral do Projeto

O **ControlFlow** é um sistema completo de gestão de inspeção de qualidade desenvolvido para controlar e automatizar processos de inspeção de produtos. O sistema permite criar planos de inspeção personalizados, gerenciar produtos, executar inspeções e gerar relatórios detalhados.

## 🏗️ Arquitetura do Sistema

### Frontend
- **React 18** com TypeScript
- **Vite** como bundler e dev server
- **Tailwind CSS** para estilização
- **shadcn/ui** para componentes de interface
- **Framer Motion** para animações
- **Lucide React** para ícones
- **React Query** para gerenciamento de estado e cache

### Backend
- **Node.js** com Express.js
- **TypeScript** para tipagem estática
- **Drizzle ORM** para acesso ao banco de dados
- **SQLite** como banco de dados (desenvolvimento)
- **JWT** para autenticação
- **bcrypt** para hash de senhas

### Banco de Dados
- **SQLite** (desenvolvimento)
- **Schema** definido com Drizzle ORM
- **Migrations** automáticas

## 🔧 Funcionalidades Implementadas

### 1. Sistema de Autenticação e Autorização
- ✅ Login/Logout com JWT
- ✅ Controle de acesso baseado em roles
- ✅ Middleware de autenticação
- ✅ Proteção de rotas

### 2. Gestão de Produtos
- ✅ CRUD completo de produtos
- ✅ Categorização de produtos
- ✅ Parâmetros técnicos (voltagem, peso, dimensões)
- ✅ Busca e filtros avançados
- ✅ Suporte a múltiplas voltagens (127V/220V)
- ✅ Upload de imagens de produtos

### 3. Planos de Inspeção
- ✅ Criação de planos personalizados
- ✅ Associação de múltiplos produtos por plano
- ✅ Etapas de inspeção com drag-and-drop
- ✅ Campos customizáveis (texto, número, seleção, checkbox, foto, arquivo)
- ✅ Etiquetas padrão de verificação
- ✅ Perguntas pré-definidas organizadas por categoria
- ✅ Controle de acesso granular
- ✅ Validação de dados
- ✅ Preview em tempo real

### 4. Editor de Campos Low-Code
- ✅ Interface intuitiva estilo AppSheet
- ✅ Configuração visual de tipos de campo
- ✅ Opções avançadas (condicionais, valores padrão)
- ✅ Configurações específicas por tipo
- ✅ Preview em tempo real
- ✅ Validação de formulários

### 5. Gestão de Etapas
- ✅ Criação e edição de etapas
- ✅ Reordenação por drag-and-drop
- ✅ Configuração de tempo estimado
- ✅ Campos obrigatórios/opcionais
- ✅ Expansão/contração de detalhes
- ✅ Inline editing

### 6. Sistema de Etiquetas
- ✅ Etiquetas padrão (DUN, EAN, ENCE, ID, Selo Ruído, etc.)
- ✅ Configuração de PDFs de referência
- ✅ Requisitos de foto
- ✅ Ativação/desativação por produto
- ✅ Comparação com padrões

### 7. Perguntas Pré-definidas
- ✅ 17 perguntas organizadas em 5 categorias:
  - **Embalagem**: Integridade, lacre, proteção
  - **Etiquetas**: Legibilidade, número de série, qualidade
  - **Impressão e Aparência**: Logos, cores, arte
  - **Produto e Componentes**: Presença, conectores, voltagem
  - **Documentação**: Revisão, aplicações, riscos
- ✅ Auto-criação de etapa "Material gráfico"
- ✅ Configuração de tipos de resposta (Sim/Não, Escala, Texto)
- ✅ Filtros por categoria

### 8. Interface Responsiva
- ✅ Design mobile-first
- ✅ Componentes reutilizáveis
- ✅ Tema consistente
- ✅ Animações suaves
- ✅ Feedback visual

## 🛠️ Tecnologias e Bibliotecas

### Frontend
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "typescript": "^5.0.0",
  "vite": "^4.4.0",
  "tailwindcss": "^3.3.0",
  "@radix-ui/react-*": "^1.0.0",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.0.0",
  "tailwind-merge": "^1.14.0",
  "framer-motion": "^10.16.0",
  "lucide-react": "^0.292.0",
  "@dnd-kit/core": "^6.0.0",
  "@dnd-kit/sortable": "^7.0.0",
  "@dnd-kit/utilities": "^3.2.0"
}
```

### Backend
```json
{
  "express": "^4.18.0",
  "typescript": "^5.0.0",
  "drizzle-orm": "^0.28.0",
  "sqlite3": "^5.1.0",
  "jsonwebtoken": "^9.0.0",
  "bcrypt": "^5.1.0",
  "cors": "^2.8.5",
  "helmet": "^7.0.0"
}
```

## 📁 Estrutura do Projeto

```
ControlFlow/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Utilitários e configurações
│   │   ├── pages/         # Páginas da aplicação
│   │   └── types/         # Definições de tipos
│   ├── public/            # Assets estáticos
│   └── package.json
├── server/                # Backend Node.js
│   ├── src/
│   │   ├── routes/        # Rotas da API
│   │   ├── storage/       # Lógica de banco de dados
│   │   ├── middleware/    # Middlewares
│   │   └── utils/         # Utilitários
│   └── package.json
├── shared/                # Código compartilhado
│   └── schema.ts         # Schema do banco
└── README.md
```

## 🔄 Metodologias e Padrões

### 1. Arquitetura
- **Monorepo** com frontend e backend separados
- **API RESTful** com endpoints padronizados
- **Separation of Concerns** com componentes modulares
- **Type Safety** com TypeScript em todo o projeto

### 2. Padrões de Desenvolvimento
- **Component-Based Architecture** (React)
- **Custom Hooks** para lógica reutilizável
- **Context API** para estado global
- **Repository Pattern** para acesso a dados
- **Middleware Pattern** para autenticação

### 3. CRUD Operations
- **Create**: Criação de produtos, planos, etapas, campos
- **Read**: Listagem com filtros, busca e paginação
- **Update**: Edição inline e em modais
- **Delete**: Remoção com confirmação

### 4. Estado e Cache
- **React Query** para cache de dados
- **Optimistic Updates** para melhor UX
- **Error Handling** centralizado
- **Loading States** consistentes

### 5. Validação e Segurança
- **JWT Authentication** com refresh tokens
- **Role-Based Access Control** (RBAC)
- **Input Validation** no frontend e backend
- **SQL Injection Protection** com Drizzle ORM
- **XSS Protection** com helmet

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação
```bash
# Clone o repositório
git clone <repository-url>
cd ControlFlow

# Instalar dependências do frontend
cd client
npm install

# Instalar dependências do backend
cd ../server
npm install

# Voltar para a raiz
cd ..
```

### Execução
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

### Acesso
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

## 📊 Funcionalidades por Módulo

### Módulo de Produtos
- [x] Listagem com paginação
- [x] Busca por código/nome
- [x] Filtros por categoria
- [x] Criação com validação
- [x] Edição inline
- [x] Upload de imagens
- [x] Exclusão com confirmação

### Módulo de Planos de Inspeção
- [x] Criação de planos
- [x] Associação de produtos
- [x] Configuração de etapas
- [x] Editor de campos low-code
- [x] Sistema de etiquetas
- [x] Perguntas pré-definidas
- [x] Controle de acesso
- [x] Preview em tempo real

### Módulo de Etapas
- [x] Drag-and-drop para reordenação
- [x] Configuração de tempo
- [x] Campos obrigatórios
- [x] Inline editing
- [x] Expansão/contração

### Sistema de Autenticação
- [x] Login/Logout
- [x] Proteção de rotas
- [x] Controle de acesso
- [x] Refresh tokens

## 🔮 Próximas Funcionalidades

### Planejadas
- [ ] Execução de inspeções
- [ ] Relatórios e dashboards
- [ ] Notificações em tempo real
- [ ] Exportação de dados
- [ ] Integração com sistemas externos
- [ ] Mobile app (React Native)
- [ ] Testes automatizados
- [ ] CI/CD pipeline

### Melhorias Técnicas
- [ ] Migração para PostgreSQL
- [ ] Cache Redis
- [ ] Logs estruturados
- [ ] Monitoramento
- [ ] Backup automático
- [ ] Documentação da API (Swagger)

## 🧪 Testes

### Como Testar
1. **Acesse** http://localhost:5173
2. **Faça login** com credenciais de teste
3. **Navegue** pelos módulos:
   - Produtos: Crie, edite, delete produtos
   - Planos: Crie planos de inspeção
   - Etapas: Configure etapas com drag-and-drop
   - Campos: Use o editor low-code
   - Etiquetas: Configure etiquetas padrão
   - Perguntas: Adicione perguntas pré-definidas

### Cenários de Teste
- ✅ Criação de produto com múltiplas voltagens
- ✅ Criação de plano com múltiplos produtos
- ✅ Configuração de etapas com drag-and-drop
- ✅ Adição de campos customizados
- ✅ Configuração de etiquetas padrão
- ✅ Adição de perguntas por categoria
- ✅ Controle de acesso por role
- ✅ Validação de formulários

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 👥 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

---

**Desenvolvido com ❤️ para otimizar processos de inspeção de qualidade**
