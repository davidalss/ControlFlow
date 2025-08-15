# 🐳 Setup ControlFlow com Docker

## 📋 Pré-requisitos

- **Docker Desktop** - [Download aqui](https://www.docker.com/products/docker-desktop/)
- **Git** - [Download aqui](https://git-scm.com/)

## 🚀 Setup Rápido

### Opção 1: Script Automático (Recomendado)
```bash
# Windows (CMD)
docker-setup.bat

# Windows (PowerShell)
.\docker-setup.ps1
```

### Opção 2: Comandos Manuais
```bash
# Construir e iniciar containers
docker-compose up --build -d

# Verificar status
docker-compose ps

# Ver logs
docker-compose logs -f
```

## 🌐 Acessos

Após iniciar os containers:

- **Frontend/Backend**: http://localhost:5002
- **PostgreSQL**: localhost:5432

## 🔐 Credenciais

### Aplicação
- **Email**: admin@controlflow.com
- **Senha**: admin123

### Banco de Dados
- **Host**: localhost
- **Porta**: 5432
- **Database**: controlflow_db
- **Usuário**: controlflow_db
- **Senha**: 123

## 🛠️ Comandos Úteis

```bash
# Iniciar serviços
docker-compose up -d

# Parar serviços
docker-compose down

# Reiniciar serviços
docker-compose restart

# Ver logs em tempo real
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f controlflow
docker-compose logs -f postgres

# Acessar container da aplicação
docker-compose exec controlflow sh

# Acessar banco PostgreSQL
docker-compose exec postgres psql -U controlflow_db -d controlflow_db

# Reconstruir containers
docker-compose up --build -d

# Limpar tudo (cuidado: remove dados)
docker-compose down -v
docker system prune -f
```

## 📁 Estrutura dos Containers

```
ControlFlow/
├── docker-compose.yml    # Configuração dos serviços
├── Dockerfile           # Imagem da aplicação
├── docker-setup.bat     # Script Windows CMD
├── docker-setup.ps1     # Script PowerShell
└── uploads/             # Volume compartilhado
```

## 🔧 Configurações

### Variáveis de Ambiente
```env
DATABASE_URL=postgresql://controlflow_db:123@postgres:5432/controlflow_db
JWT_SECRET=controlflow-jwt-secret-key-2024-development
PORT=5002
NODE_ENV=development
```

### Volumes
- `postgres_data`: Dados do PostgreSQL
- `./uploads:/app/uploads`: Arquivos enviados

### Portas
- `5002`: Aplicação ControlFlow
- `5432`: PostgreSQL

## 🚨 Solução de Problemas

### Container não inicia
```bash
# Verificar logs
docker-compose logs controlflow

# Verificar se a porta está livre
netstat -ano | findstr :5002
```

### Banco não conecta
```bash
# Verificar se PostgreSQL está rodando
docker-compose logs postgres

# Testar conexão
docker-compose exec postgres psql -U controlflow_db -d controlflow_db
```

### Problemas de permissão
```bash
# No Windows, execute como administrador
# No Linux/Mac, use sudo se necessário
```

### Limpar tudo e recomeçar
```bash
# Parar e remover tudo
docker-compose down -v
docker system prune -f

# Reconstruir
docker-compose up --build -d
```

## 📊 Monitoramento

### Status dos Containers
```bash
docker-compose ps
```

### Uso de Recursos
```bash
docker stats
```

### Logs em Tempo Real
```bash
docker-compose logs -f
```

## 🔄 Desenvolvimento

### Modificar Código
1. Faça as alterações no código
2. Reconstrua o container: `docker-compose up --build -d`

### Adicionar Dependências
1. Adicione no `package.json`
2. Reconstrua: `docker-compose up --build -d`

### Backup do Banco
```bash
# Backup
docker-compose exec postgres pg_dump -U controlflow_db controlflow_db > backup.sql

# Restore
docker-compose exec -T postgres psql -U controlflow_db controlflow_db < backup.sql
```

## 🎯 Próximos Passos

1. Execute `docker-setup.bat` ou `.\docker-setup.ps1`
2. Acesse http://localhost:5002
3. Faça login com as credenciais de teste
4. Explore os módulos disponíveis

---

**🎉 Seu ControlFlow está rodando no Docker!**
