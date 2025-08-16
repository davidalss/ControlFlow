# 🐳 ControlFlow - Docker Setup

Configuração rápida do ControlFlow usando Docker.

## ⚡ Início Rápido

### Windows
```bash
# 1. Execute o script de inicialização
docker-start.bat

# 2. Acesse a aplicação
# http://localhost:5002
```

### Linux/macOS
```bash
# 1. Torne o script executável
chmod +x docker-start.sh

# 2. Execute o script
./docker-start.sh

# 3. Acesse a aplicação
# http://localhost:5002
```

## 🛠️ Comandos Úteis

```bash
# Iniciar aplicação
docker-start.bat (Windows) ou ./docker-start.sh (Linux/macOS)

# Parar aplicação
docker-stop.bat (Windows) ou docker-compose down

# Ver logs
docker-logs.bat (Windows) ou docker-compose logs -f

# Status dos containers
docker-compose ps

# Reconstruir e reiniciar
docker-compose up --build -d
```

## 📊 Serviços

- **🌐 Aplicação**: http://localhost:5002
- **🗄️ PostgreSQL**: localhost:5432
- **📁 Uploads**: ./uploads
- **🔍 Health Check**: http://localhost:5002/health

## 🔧 Configuração

### Variáveis de Ambiente
As configurações estão no arquivo `env.docker`. Principais variáveis:

```env
DATABASE_URL=postgresql://controlflow_db:123@postgres:5432/controlflow_db
JWT_SECRET=controlflow-jwt-secret-key-2024-development
PORT=5002
NODE_ENV=development
```

### Volumes
- `postgres_data`: Dados do PostgreSQL
- `./uploads`: Arquivos enviados pelos usuários
- `./shared`: Schema do banco de dados
- `./migrations`: Migrações do banco

## 🚨 Troubleshooting

### Problemas Comuns

1. **Porta 5002 já em uso**
   ```bash
   # Windows
   netstat -ano | findstr :5002
   taskkill /PID <PID> /F
   
   # Linux/macOS
   lsof -i :5002
   kill -9 <PID>
   ```

2. **Container não inicia**
   ```bash
   docker-compose logs controlflow
   ```

3. **Banco não conecta**
   ```bash
   docker-compose ps postgres
   docker-compose exec postgres pg_isready -U controlflow_db
   ```

### Logs Detalhados
```bash
# Todos os serviços
docker-compose logs

# Apenas aplicação
docker-compose logs controlflow

# Apenas banco
docker-compose logs postgres

# Tempo real
docker-compose logs -f
```

## 🔒 Segurança

⚠️ **Importante**: Para produção, altere as senhas padrão:

```env
POSTGRES_PASSWORD=sua_senha_forte
JWT_SECRET=seu_jwt_secret_forte
```

## 📚 Documentação Completa

Para mais detalhes, consulte o [DOCKER_GUIDE.md](./DOCKER_GUIDE.md).

---

**Status**: ✅ Pronto para uso
**Última atualização**: Janeiro 2024
