# 🐳 Guia de Atualização do Docker - ControlFlow

## ⚠️ IMPORTANTE: Sempre use este processo para mudanças no código

### 🔄 Processo Completo de Atualização

```bash
# 1. PARAR TUDO
docker-compose down

# 2. RECONSTRUIR SEM CACHE (OBRIGATÓRIO!)
docker-compose build --no-cache

# 3. SUBIR CONTAINERS NOVOS
docker-compose up -d

# 4. BUILD DO FRONTEND
docker-compose exec controlflow npm run build
```

### 📋 Comandos Rápidos (Copy & Paste)

```bash
# Comando único para tudo:
docker-compose down && docker-compose build --no-cache && docker-compose up -d && docker-compose exec controlflow npm run build
```

### 🔍 Verificar se Funcionou

```bash
# Ver containers rodando
docker ps

# Ver logs do container
docker-compose logs controlflow

# Acessar container
docker-compose exec controlflow sh
```

### 🚨 Por que usar --no-cache?

- **Cache do Docker** pode manter código antigo
- **Containers antigos** podem continuar rodando
- **Mudanças não aparecem** mesmo com restart
- **--no-cache** força reconstrução completa

### 📝 Checklist de Verificação

- [ ] Containers parados (`docker-compose down`)
- [ ] Imagem reconstruída (`build --no-cache`)
- [ ] Containers novos subidos (`up -d`)
- [ ] Frontend buildado (`npm run build`)
- [ ] Aplicação acessível (http://localhost:5002)
- [ ] Mudanças visíveis no navegador

### 🛠️ Troubleshooting

#### Se as mudanças não aparecem:
1. **Limpe cache do navegador** (Ctrl + F5)
2. **Abra aba anônima**
3. **Verifique se o container é novo:**
   ```bash
   docker ps --format "table {{.Names}}\t{{.CreatedAt}}"
   ```

#### Se o build falha:
```bash
# Limpar tudo e tentar novamente
docker system prune -a
docker-compose build --no-cache
```

### 📊 Comandos Úteis

```bash
# Ver uso de recursos
docker stats

# Ver imagens
docker images

# Limpar cache Docker
docker system prune

# Ver logs em tempo real
docker-compose logs -f controlflow
```

### 🎯 Lembrete Final

**SEMPRE use `--no-cache` quando fizer mudanças no código!**

O processo normal (`docker-compose restart`) **NÃO** aplica mudanças no código, apenas reinicia o container antigo.
