# 🚀 ControlFlow - Sistema de Gestão de Inspeção de Qualidade

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> Sistema completo para gestão e automação de processos de inspeção de qualidade industrial

## 📋 Visão Geral

O **ControlFlow** é uma solução moderna e completa para gestão de inspeção de qualidade, desenvolvida com tecnologias de ponta para oferecer uma experiência intuitiva e eficiente. O sistema permite criar planos de inspeção personalizados, gerenciar produtos, executar inspeções e gerar relatórios detalhados.

### ✨ Principais Características

- 🔐 **Autenticação Segura** com JWT e controle de acesso baseado em roles
- 📱 **Interface Responsiva** com design moderno e intuitivo
- 🎯 **Editor Low-Code** para configuração de campos de inspeção
- 📊 **Gestão Completa** de produtos, planos e etapas
- 🔄 **Drag & Drop** para reordenação de etapas
- 📋 **Perguntas Pré-definidas** organizadas por categoria
- 🏷️ **Sistema de Etiquetas** padrão da indústria
- ⚡ **Performance Otimizada** com React Query e cache inteligente

## 🏗️ Arquitetura

### Frontend
- **React 18** com TypeScript
- **Vite** para build e desenvolvimento
- **Tailwind CSS** para estilização
- **shadcn/ui** para componentes
- **Framer Motion** para animações
- **React Query** para gerenciamento de estado

### Backend
- **Node.js** com Express.js
- **TypeScript** para tipagem estática
- **Drizzle ORM** para acesso ao banco
- **SQLite** como banco de dados
- **JWT** para autenticação

## 🚀 Início Rápido

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/controlflow.git
cd ControlFlow

# Instalar dependências
cd client && npm install
cd ../server && npm install
cd ..

# Executar o projeto
npm run dev
```

### Acesso
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

## 📚 Documentação

- 📖 [Guia Completo](COMO_TESTAR.md) - Documentação detalhada
- 🔧 [API Reference](docs/api.md) - Documentação da API
- 🎨 [Component Library](docs/components.md) - Biblioteca de componentes
- 🗄️ [Database Schema](docs/schema.md) - Schema do banco de dados

## 🎯 Funcionalidades

### 🔐 Autenticação e Autorização
- Login/Logout com JWT
- Controle de acesso baseado em roles
- Proteção de rotas
- Refresh tokens

### 📦 Gestão de Produtos
- CRUD completo de produtos
- Categorização e parâmetros técnicos
- Suporte a múltiplas voltagens
- Upload de imagens
- Busca e filtros avançados

### 📋 Planos de Inspeção
- Criação de planos personalizados
- Associação de múltiplos produtos
- Etapas com drag-and-drop
- Editor de campos low-code
- Sistema de etiquetas padrão
- Perguntas pré-definidas

### 🎨 Editor Low-Code
- Interface intuitiva estilo AppSheet
- Configuração visual de campos
- Opções avançadas (condicionais, valores padrão)
- Preview em tempo real
- Validação de formulários

### 📊 Perguntas Pré-definidas
- 17 perguntas em 5 categorias:
  - **Embalagem**: Integridade, lacre, proteção
  - **Etiquetas**: Legibilidade, número de série
  - **Impressão**: Logos, cores, arte
  - **Componentes**: Presença, conectores, voltagem
  - **Documentação**: Revisão, aplicações, riscos

## 🛠️ Tecnologias

### Frontend
```json
{
  "react": "^18.2.0",
  "typescript": "^5.0.0",
  "vite": "^4.4.0",
  "tailwindcss": "^3.3.0",
  "framer-motion": "^10.16.0",
  "@dnd-kit/core": "^6.0.0"
}
```

### Backend
```json
{
  "express": "^4.18.0",
  "drizzle-orm": "^0.28.0",
  "jsonwebtoken": "^9.0.0",
  "bcrypt": "^5.1.0"
}
```

## 📁 Estrutura do Projeto

```
ControlFlow/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # Páginas da aplicação
│   │   └── lib/           # Utilitários
│   └── package.json
├── server/                # Backend Node.js
│   ├── src/
│   │   ├── routes/        # Rotas da API
│   │   ├── storage/       # Lógica de banco
│   │   └── middleware/    # Middlewares
│   └── package.json
├── shared/                # Código compartilhado
│   └── schema.ts         # Schema do banco
└── docs/                 # Documentação
```

## 🔄 Metodologias

- **Monorepo** com frontend e backend separados
- **API RESTful** com endpoints padronizados
- **Component-Based Architecture** (React)
- **Repository Pattern** para acesso a dados
- **Type Safety** com TypeScript
- **CRUD Operations** completas

## 🧪 Testes

### Cenários de Teste
- ✅ Criação de produto com múltiplas voltagens
- ✅ Criação de plano com múltiplos produtos
- ✅ Configuração de etapas com drag-and-drop
- ✅ Adição de campos customizados
- ✅ Configuração de etiquetas padrão
- ✅ Adição de perguntas por categoria

### Como Testar
1. Execute `npm run dev`
2. Acesse http://localhost:5173
3. Use as credenciais de teste
4. Navegue pelos módulos

## 🔮 Roadmap

### Próximas Funcionalidades
- [ ] Execução de inspeções
- [ ] Relatórios e dashboards
- [ ] Notificações em tempo real
- [ ] Mobile app (React Native)
- [ ] Integração com sistemas externos
- [ ] Testes automatizados

### Melhorias Técnicas
- [ ] Migração para PostgreSQL
- [ ] Cache Redis
- [ ] CI/CD pipeline
- [ ] Documentação da API (Swagger)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Equipe

- **Desenvolvedor Principal**: [Seu Nome]
- **Designer**: [Nome do Designer]
- **QA**: [Nome do QA]

## 📞 Suporte

- 📧 Email: suporte@controlflow.com
- 📱 WhatsApp: +55 (11) 99999-9999
- 🌐 Website: https://controlflow.com

## 🙏 Agradecimentos

- [shadcn/ui](https://ui.shadcn.com/) pelos componentes
- [Tailwind CSS](https://tailwindcss.com/) pela estilização
- [Drizzle ORM](https://orm.drizzle.team/) pelo ORM
- [Framer Motion](https://www.framer.com/motion/) pelas animações

---

**Desenvolvido com ❤️ para otimizar processos de inspeção de qualidade**

[![Made with Love](https://img.shields.io/badge/Made%20with-Love-red.svg)](https://github.com/seu-usuario/controlflow)
