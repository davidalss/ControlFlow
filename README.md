# 🚀 ControlFlow

Sistema de Controle de Qualidade e Inspeção Industrial com IA

## 📋 Sobre o Projeto

O ControlFlow é uma plataforma completa para gestão de qualidade industrial, incluindo:

- ✅ **Inspeções de Qualidade** com planos personalizáveis
- 🤖 **IA Assistente (Severino)** para análise de etiquetas e documentos
- 📊 **Dashboard** com métricas em tempo real
- 🔄 **Fluxo de Aprovação** automatizado
- 📱 **Interface Responsiva** para desktop e mobile
- 🗄️ **Gestão de Produtos** e fornecedores
- 📈 **Relatórios** e análises avançadas

## 🚀 Início Rápido

### Pré-requisitos
- Docker Desktop
- Git

### Setup Automatizado

#### Windows
```powershell
# Execute o script de setup
.\setup.ps1

# Ou com opções
.\setup.ps1 -SkipChecks -Force
```

#### Linux/macOS
```bash
# Execute o script de setup
./setup.sh

# Ou torne executável primeiro
chmod +x setup.sh
./setup.sh
```

### Setup Manual

1. **Clone o repositório**
```bash
git clone <URL_DO_REPOSITORIO>
cd ControlFlow
```

2. **Configure as variáveis de ambiente**
```bash
cp env.example .env
# Edite o arquivo .env conforme necessário
```

3. **Execute com Docker**
```bash
docker-compose up --build
```

4. **Acesse a aplicação**
- Frontend: http://localhost:5002
- API: http://localhost:5002/api
- Health Check: http://localhost:5002/health

## 🏗️ Arquitetura

```
ControlFlow/
├── client/                 # Frontend React + TypeScript
├── server/                 # Backend Node.js + Express
├── shared/                 # Schema compartilhado (Drizzle ORM)
├── migrations/             # Migrações do banco de dados
├── docs/                   # Documentação completa
├── uploads/                # Arquivos enviados
├── docker-compose.yml      # Configuração Docker
├── Dockerfile             # Imagem Docker
├── setup.sh               # Script de setup (Linux/macOS)
├── setup.ps1              # Script de setup (Windows)
└── README.md              # Este arquivo
```

## 🛠️ Tecnologias

### Frontend
- **React 18** com TypeScript
- **Tailwind CSS** para estilização
- **Radix UI** para componentes
- **React Query** para gerenciamento de estado
- **React Router** para navegação

### Backend
- **Node.js** com TypeScript
- **Express.js** para API REST
- **Drizzle ORM** para banco de dados
- **PostgreSQL** como banco principal
- **JWT** para autenticação

### DevOps
- **Docker** e **Docker Compose**
- **Multi-stage builds** para otimização
- **Volumes** para persistência de dados

## 📚 Documentação

- **[Setup Completo](docs/SETUP_COMPLETO.md)** - Guia detalhado de configuração
- **[Arquitetura](docs/ARQUITETURA_E_METODOLOGIA.md)** - Documentação técnica
- **[API](docs/API.md)** - Documentação da API REST

## 🔧 Comandos Úteis

### Docker
```bash
# Iniciar serviços
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down

# Rebuild após mudanças
docker-compose up --build

# Executar comandos no container
docker-compose exec controlflow_app npm run db:push
```

### Desenvolvimento
```bash
# Instalar dependências
npm install

# Executar migrações
npm run db:push

# Desenvolvimento
npm run dev

# Build
npm run build

# Verificar tipos
npm run check
```

## 🗄️ Banco de Dados

O sistema usa PostgreSQL com as seguintes tabelas principais:

- **users** - Usuários e autenticação
- **products** - Catálogo de produtos
- **inspection_plans** - Planos de inspeção
- **inspections** - Inspeções realizadas
- **rnc_records** - Registros de não conformidade
- **notifications** - Sistema de notificações
- **logs** - Logs de auditoria

## 🔐 Segurança

- Autenticação JWT
- Controle de acesso baseado em roles
- Validação de entrada com Zod
- Sanitização de dados
- Logs de auditoria

## 🚀 Deploy

### Desenvolvimento
```bash
docker-compose up --build
```

### Produção
```bash
# Configure variáveis de produção
NODE_ENV=production
JWT_SECRET=sua-chave-super-secreta

# Execute
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para suporte ou dúvidas:
1. Consulte a documentação em `docs/`
2. Verifique os logs: `docker-compose logs`
3. Abra uma issue no repositório

---

**ControlFlow** - Transformando a gestão de qualidade industrial com IA 🚀
