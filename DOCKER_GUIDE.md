# 🐳 Guia Docker - ControlFlow

Este guia explica como configurar e executar o ControlFlow usando Docker.

## 📋 Pré-requisitos

- Docker Desktop instalado e rodando
- Windows 10/11 ou Linux/macOS
- Mínimo 4GB RAM disponível
- 10GB espaço em disco livre

## 🚀 Início Rápido

### 1. Clonar o repositório
```bash
git clone <seu-repositorio>
cd ControlFlow
```

### 2. Executar com Docker
```bash
# Windows
docker-start.bat

# Linux/macOS
./docker-start.sh
```

### 3. Acessar a aplicação
- 🌐 **Aplicação**: http://localhost:5002
- 🗄️ **Banco de dados**: localhost:5432
- 📁 **Uploads**: ./uploads

## 📁 Estrutura dos Arquivos Docker

```
ControlFlow/
├── Dockerfile              # Configuração da imagem
├── docker-compose.yml      # Orquestração dos serviços
├── .dockerignore          # Arquivos ignorados
├── env.docker             # Variáveis de ambiente para Docker
├── docker-start.bat       # Script de inicialização (Windows)
├── docker-stop.bat        # Script de parada (Windows)
├── docker-logs.bat        # Script de logs (Windows)
└── uploads/               # Diretório de uploads (volume)
```

## 🔧 Configuração Detalhada

### Serviços Incluídos

1. **PostgreSQL** (porta 5432)
   - Banco de dados principal
   - Dados persistentes
   - Health checks configurados

2. **ControlFlow App** (porta 5002)
   - Aplicação principal
   - Build otimizado com multi-stage
   - Volumes para uploads e código

3. **Redis** (porta 6379) - Opcional
   - Cache e sessões
   - Melhora performance

### Variáveis de Ambiente

As principais variáveis estão no `env.docker`:

```env
DATABASE_URL=postgresql://controlflow_db:123@postgres:5432/controlflow_db
JWT_SECRET=controlflow-jwt-secret-key-2024-development
PORT=5002
NODE_ENV=development
```

## 🛠️ Comandos Úteis

### Gerenciamento Básico

```bash
# Iniciar todos os serviços
docker-compose up -d

# Parar todos os serviços
docker-compose down

# Reconstruir e iniciar
docker-compose up --build -d

# Ver status dos containers
docker-compose ps

# Ver logs
docker-compose logs -f
```

### Scripts Windows

```bash
# Iniciar aplicação
docker-start.bat

# Parar aplicação
docker-stop.bat

# Ver logs
docker-logs.bat
```

### Comandos Avançados

```bash
# Entrar no container da aplicação
docker-compose exec controlflow sh

# Executar migrações do banco
docker-compose exec controlflow npm run db:push

# Backup do banco de dados
docker-compose exec postgres pg_dump -U controlflow_db controlflow_db > backup.sql

# Restaurar backup
docker-compose exec -T postgres psql -U controlflow_db controlflow_db < backup.sql
```

## 🔍 Troubleshooting

### Problemas Comuns

1. **Porta já em uso**
   ```bash
   # Verificar processos na porta
   netstat -ano | findstr :5002
   
   # Parar processo específico
   taskkill /PID <PID> /F
   ```

2. **Container não inicia**
   ```bash
   # Ver logs detalhados
   docker-compose logs controlflow
   
   # Verificar recursos do sistema
   docker system df
   ```

3. **Banco de dados não conecta**
   ```bash
   # Verificar se PostgreSQL está rodando
   docker-compose ps postgres
   
   # Testar conexão
   docker-compose exec postgres pg_isready -U controlflow_db
   ```

4. **Problemas de permissão (Linux/macOS)**
   ```bash
   # Ajustar permissões
   sudo chown -R $USER:$USER uploads/
   ```

### Logs e Debug

```bash
# Logs em tempo real
docker-compose logs -f

# Logs de serviço específico
docker-compose logs -f controlflow

# Logs com timestamps
docker-compose logs -f -t

# Últimas 100 linhas
docker-compose logs --tail=100
```

## 📊 Monitoramento

### Health Checks

Os containers incluem health checks automáticos:

- **PostgreSQL**: Verifica se o banco está respondendo
- **ControlFlow**: Verifica se a aplicação está acessível
- **Redis**: Verifica se o cache está funcionando

### Métricas

```bash
# Uso de recursos
docker stats

# Espaço em disco
docker system df

# Imagens não utilizadas
docker image prune
```

## 🔒 Segurança

### Boas Práticas

1. **Alterar senhas padrão**
   ```env
   POSTGRES_PASSWORD=sua_senha_forte
   JWT_SECRET=seu_jwt_secret_forte
   ```

2. **Usar volumes nomeados**
   ```yaml
   volumes:
     - postgres_data:/var/lib/postgresql/data
   ```

3. **Limitar recursos**
   ```yaml
   deploy:
     resources:
       limits:
         memory: 1G
         cpus: '0.5'
   ```

## 🚀 Produção

### Configuração para Produção

1. **Alterar NODE_ENV**
   ```env
   NODE_ENV=production
   ```

2. **Usar build de produção**
   ```yaml
   build:
     target: production
   ```

3. **Configurar reverse proxy**
   ```yaml
   # nginx ou traefik
   ```

4. **Backup automático**
   ```bash
   # Script de backup
   docker-compose exec postgres pg_dump -U controlflow_db controlflow_db > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs: `docker-compose logs`
2. Consulte este guia
3. Verifique se Docker está atualizado
4. Reinicie o Docker Desktop

## 🔄 Atualizações

Para atualizar o aplicativo:

```bash
# Parar containers
docker-compose down

# Puxar código atualizado
git pull

# Reconstruir e iniciar
docker-compose up --build -d
```

---

**Nota**: Este guia assume que você está usando Windows. Para Linux/macOS, adapte os comandos conforme necessário.
