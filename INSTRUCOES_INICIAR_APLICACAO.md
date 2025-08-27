# 🚀 Instruções para Iniciar a Aplicação ControlFlow

## Problema Identificado
A aplicação não está acessível em localhost:3000 porque os containers Docker não estão rodando.

## 🔧 Solução Passo a Passo

### 1. Verificar se o Docker Desktop está rodando
- Abra o Docker Desktop
- Aguarde até aparecer "Docker Desktop is running" na barra de tarefas
- Se não estiver rodando, inicie o Docker Desktop

### 2. Abrir PowerShell como Administrador
- Pressione `Windows + X`
- Selecione "Windows PowerShell (Admin)" ou "Terminal (Admin)"

### 3. Navegar para o diretório do projeto
```powershell
cd "C:\Users\David PC\Desktop\ControlFlow"
```

### 4. Verificar se o Docker está funcionando
```powershell
docker --version
```
Deve mostrar a versão do Docker.

### 5. Parar containers existentes (se houver)
```powershell
docker-compose -f docker-compose.simple.yml down
```

### 6. Limpar containers órfãos
```powershell
docker container prune -f
```

### 7. Construir e iniciar a aplicação
```powershell
docker-compose -f docker-compose.simple.yml up --build -d
```

### 8. Aguardar a inicialização
Aguarde aproximadamente 2-3 minutos para todos os serviços iniciarem.

### 9. Verificar status dos containers
```powershell
docker-compose -f docker-compose.simple.yml ps
```

Todos os containers devem mostrar status "Up" ou "Running".

### 10. Verificar logs se necessário
```powershell
# Logs do backend
docker-compose -f docker-compose.simple.yml logs backend

# Logs do frontend
docker-compose -f docker-compose.simple.yml logs frontend
```

## 🌐 Acessar a Aplicação

Após todos os containers estarem rodando:

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5002

## 👤 Credenciais de Login

- **Administrador**: `admin@enso.com` / `admin123`
- **Usuário Teste**: `test@enso.com` / `test123`

## 🔍 Solução de Problemas

### Se os containers não iniciarem:
1. Verifique se o Docker Desktop está rodando
2. Reinicie o Docker Desktop
3. Execute os comandos novamente

### Se aparecer erro de porta em uso:
```powershell
# Parar todos os containers
docker stop $(docker ps -q)

# Remover todos os containers
docker rm $(docker ps -aq)

# Tentar novamente
docker-compose -f docker-compose.simple.yml up --build -d
```

### Se o banco não conectar:
```powershell
# Remover volume do banco e recriar
docker-compose -f docker-compose.simple.yml down -v
docker-compose -f docker-compose.simple.yml up --build -d
```

## 📞 Comandos Úteis

```powershell
# Ver todos os containers
docker ps -a

# Ver logs em tempo real
docker-compose -f docker-compose.simple.yml logs -f

# Parar a aplicação
docker-compose -f docker-compose.simple.yml down

# Reiniciar apenas um serviço
docker-compose -f docker-compose.simple.yml restart backend
```

## ✅ Verificação Final

Após seguir todos os passos, você deve conseguir acessar:
- http://localhost:3000 - Interface da aplicação
- http://localhost:5002/health - Status do backend

Se ainda houver problemas, verifique os logs dos containers para identificar o erro específico.
