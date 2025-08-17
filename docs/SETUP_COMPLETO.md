# 🚀 ControlFlow - Setup Completo

Este documento contém todas as instruções necessárias para configurar e executar o ControlFlow em uma nova máquina.

## 📋 Pré-requisitos

### 1. Docker Desktop
- **Windows**: Baixe e instale o [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- **Linux**: Instale Docker Engine e Docker Compose
- **macOS**: Baixe e instale o [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### 2. Git
- Instale o [Git](https://git-scm.com/) para clonar o repositório

### 3. Node.js (Opcional - para desenvolvimento local)
- Instale o [Node.js](https://nodejs.org/) versão 18 ou superior

## 🛠️ Configuração Inicial

### 1. Clone o Repositório
```bash
git clone <URL_DO_REPOSITORIO>
cd ControlFlow
```

### 2. Configure as Variáveis de Ambiente
Copie o arquivo de exemplo e configure as variáveis:
```bash
cp env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
# Database
DATABASE_URL=postgresql://controlflow_db:123@localhost:5432/controlflow_db

# JWT
JWT_SECRET=sua-chave-secreta-aqui
SESSION_SECRET=sua-sessao-secreta-aqui

# Server
PORT=5002
NODE_ENV=development

# Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Logging
LOG_LEVEL=info
```

### 3. Configure o Docker Compose
O arquivo `docker-compose.yml` já está configurado com:
- PostgreSQL 15
- ControlFlow Application
- Volumes para persistência de dados
- Rede dedicada

## 🚀 Executando o Projeto

### Opção 1: Docker (Recomendado)

#### 1. Build e Inicialização
```bash
# Build das imagens
docker-compose build

# Iniciar os serviços
docker-compose up -d
```

#### 2. Verificar Status
```bash
# Verificar se os containers estão rodando
docker-compose ps

# Ver logs em tempo real
docker-compose logs -f
```

#### 3. Acessar a Aplicação
- **Frontend**: http://localhost:5002
- **API**: http://localhost:5002/api
- **Health Check**: http://localhost:5002/health

### Opção 2: Desenvolvimento Local

#### 1. Instalar Dependências
```bash
npm install
```

#### 2. Configurar Banco de Dados
```bash
# Executar migrações
npm run db:push

# Ou usar o Drizzle Kit
npx drizzle-kit push
```

#### 3. Iniciar o Servidor
```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

## 🗄️ Configuração do Banco de Dados

### 1. Estrutura do Banco
O projeto usa PostgreSQL com as seguintes tabelas principais:
- `users` - Usuários do sistema
- `products` - Produtos
- `inspection_plans` - Planos de inspeção
- `inspections` - Inspeções realizadas
- `rnc_records` - Registros de não conformidade
- `notifications` - Notificações
- `logs` - Logs do sistema

### 2. Migrações
As migrações estão na pasta `migrations/` e são executadas automaticamente pelo Drizzle ORM.

### 3. Dados Iniciais
O sistema cria automaticamente:
- Usuário admin padrão
- Tabelas necessárias
- Configurações básicas

## 🔧 Comandos Úteis

### Docker
```bash
# Parar serviços
docker-compose down

# Parar e remover volumes
docker-compose down -v

# Rebuild após mudanças
docker-compose up --build

# Ver logs específicos
docker-compose logs controlflow_app
docker-compose logs controlflow_postgres

# Executar comandos no container
docker-compose exec controlflow_app npm run db:push
```

### Desenvolvimento
```bash
# Verificar tipos TypeScript
npm run check

# Executar migrações
npm run db:push

# Build do projeto
npm run build

# Limpar cache
npm run clean
```

## 🐛 Solução de Problemas

### 1. Porta 5002 já em uso
```bash
# Verificar o que está usando a porta
netstat -ano | findstr :5002

# Ou alterar a porta no docker-compose.yml
```

### 2. Erro de conexão com banco
```bash
# Verificar se o PostgreSQL está rodando
docker-compose ps

# Reiniciar apenas o banco
docker-compose restart controlflow_postgres
```

### 3. Erro de permissão no Docker
- No Windows: Execute o Docker Desktop como administrador
- No Linux: Adicione seu usuário ao grupo docker

### 4. Problemas de Build
```bash
# Limpar cache do Docker
docker system prune -a

# Rebuild completo
docker-compose build --no-cache
```

## 📁 Estrutura do Projeto

```
ControlFlow/
├── client/                 # Frontend React
├── server/                 # Backend Node.js
├── shared/                 # Schema compartilhado
├── migrations/             # Migrações do banco
├── docs/                   # Documentação
├── uploads/                # Arquivos enviados
├── docker-compose.yml      # Configuração Docker
├── Dockerfile             # Imagem Docker
├── package.json           # Dependências
└── README.md              # Documentação principal
```

## 🔐 Segurança

### 1. Variáveis de Ambiente
- Nunca commite o arquivo `.env`
- Use chaves secretas fortes para JWT_SECRET
- Configure HTTPS em produção

### 2. Banco de Dados
- Altere as senhas padrão em produção
- Configure backup automático
- Use conexões SSL em produção

### 3. Uploads
- Configure limite de tamanho de arquivo
- Valide tipos de arquivo
- Configure armazenamento seguro

## 🚀 Deploy em Produção

### 1. Configurações de Produção
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=chave-super-secreta-producao
```

### 2. Docker Compose para Produção
```yaml
version: '3.8'
services:
  controlflow:
    build:
      context: .
      target: production
    environment:
      NODE_ENV: production
    restart: unless-stopped
```

### 3. Monitoramento
- Configure logs centralizados
- Configure monitoramento de saúde
- Configure alertas

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique os logs: `docker-compose logs`
2. Consulte a documentação em `docs/`
3. Abra uma issue no repositório

## 🔄 Atualizações

### 1. Atualizar o Projeto
```bash
git pull origin main
docker-compose down
docker-compose up --build -d
```

### 2. Backup Antes de Atualizar
```bash
# Backup do banco
docker-compose exec controlflow_postgres pg_dump -U controlflow_db controlflow_db > backup.sql
```

---

**Nota**: Este projeto está configurado para desenvolvimento. Para produção, configure adequadamente as variáveis de ambiente, segurança e monitoramento.
