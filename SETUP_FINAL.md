# 🚀 Setup ControlFlow - Opções Disponíveis

## 🎯 Escolha sua Opção

### 🐳 **OPÇÃO 1: Docker (RECOMENDADO)**
**Vantagens**: Sem problemas de dependências, fácil de configurar, isolado
**Tempo**: ~5 minutos

1. **Instalar Docker**: Siga o guia `INSTALAR_DOCKER.md`
2. **Executar Setup**: `docker-setup.bat` ou `.\docker-setup.ps1`
3. **Acessar**: http://localhost:5002

### 🔧 **OPÇÃO 2: Setup Local**
**Vantagens**: Mais controle, desenvolvimento direto
**Tempo**: ~10 minutos

1. **Configurar Banco**: Use seu PostgreSQL local
2. **Executar Setup**: `setup-nova-maquina.bat` ou `.\setup-nova-maquina.ps1`
3. **Acessar**: http://localhost:5002

## 📋 Comparação

| Aspecto | Docker | Local |
|---------|--------|-------|
| **Facilidade** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Velocidade** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Controle** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Isolamento** | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| **Manutenção** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

## 🎯 Recomendação

**Para uso em produção ou desenvolvimento rápido**: Use **Docker**
**Para desenvolvimento avançado**: Use **Setup Local**

## 📁 Arquivos Criados

### Docker Setup
- `docker-compose.yml` - Configuração dos serviços
- `Dockerfile` - Imagem da aplicação
- `docker-setup.bat` - Script Windows CMD
- `docker-setup.ps1` - Script PowerShell
- `DOCKER_SETUP.md` - Guia completo
- `INSTALAR_DOCKER.md` - Guia de instalação

### Local Setup
- `setup-nova-maquina.bat` - Script Windows CMD
- `setup-nova-maquina.ps1` - Script PowerShell
- `SETUP_NOVA_MAQUINA.md` - Guia completo
- `INICIO_RAPIDO.md` - Setup rápido
- `config-rapida.md` - Configuração rápida

## 🌐 Acessos Finais

### Docker
- **Aplicação**: http://localhost:5002
- **PostgreSQL**: localhost:5432
- **Credenciais**: admin@controlflow.com / admin123

### Local
- **Aplicação**: http://localhost:5002
- **PostgreSQL**: localhost:5432 (seu banco)
- **Credenciais**: admin@controlflow.com / admin123

## 🛠️ Comandos Úteis

### Docker
```bash
# Iniciar
docker-compose up -d

# Parar
docker-compose down

# Logs
docker-compose logs -f

# Reconstruir
docker-compose up --build -d
```

### Local
```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Banco
npm run db:push
```

## 🚨 Suporte

Se encontrar problemas:

1. **Docker**: Verifique `DOCKER_SETUP.md`
2. **Local**: Verifique `SETUP_NOVA_MAQUINA.md`
3. **Geral**: Verifique os logs e arquivos de configuração

---

**🎉 Escolha sua opção e comece a usar o ControlFlow!**
