# Solução para Problemas de WebSocket - ControlFlow

## 🔍 Diagnóstico do Problema

O erro `ERR_CONNECTION_REFUSED` na porta `24679` indica que o **HMR (Hot Module Replacement)** do Vite não está funcionando corretamente. Esta porta é usada pelo Vite para atualizações em tempo real durante o desenvolvimento.

### Possíveis Causas:

1. **Servidor não está rodando** - O servidor principal na porta 5001 não foi iniciado
2. **HMR do Vite falhou** - O Vite não conseguiu iniciar o servidor HMR na porta 24679
3. **Firewall bloqueando** - O Windows Firewall está bloqueando as portas
4. **Processos conflitantes** - Outros processos estão usando as portas necessárias
5. **Dependências corrompidas** - node_modules pode estar com problemas

## 🛠️ Soluções

### Solução 1: Script Automático (Recomendado)

Execute um dos scripts criados:

```bash
# Opção 1: Script Batch (Windows)
diagnostico-websocket.bat

# Opção 2: Script PowerShell (Windows)
.\resolver-websocket.ps1
```

### Solução 2: Manual

#### Passo 1: Verificar se o servidor está rodando
```bash
# Verificar porta 5001
netstat -an | findstr :5001

# Verificar porta 24679 (HMR)
netstat -an | findstr :24679
```

#### Passo 2: Matar processos conflitantes
```bash
# Verificar processos Node.js
tasklist /fi "imagename eq node.exe"

# Matar todos os processos Node.js (se necessário)
taskkill /f /im node.exe
```

#### Passo 3: Configurar Firewall
```bash
# Criar regras de firewall para ControlFlow
netsh advfirewall firewall add rule name="ControlFlow Port 5001" dir=in action=allow protocol=TCP localport=5001
netsh advfirewall firewall add rule name="ControlFlow Port 24679" dir=in action=allow protocol=TCP localport=24679
```

#### Passo 4: Reinstalar dependências
```bash
# Remover node_modules
rmdir /s node_modules

# Limpar cache do npm
npm cache clean --force

# Reinstalar dependências
npm install
```

#### Passo 5: Iniciar servidor
```bash
npm run dev
```

## 🔧 Configurações Importantes

### Vite Config (vite.config.ts)
```typescript
server: {
  hmr: {
    port: 24679, // Porta do HMR
    host: 'localhost',
    protocol: 'ws'
  },
}
```

### Servidor Principal (server/index.ts)
```typescript
const port = parseInt(process.env.PORT || '5001', 10);
server.listen({
  port,
  host: "0.0.0.0",
  reusePort: true,
});
```

## 🚨 Troubleshooting

### Se o servidor não iniciar:

1. **Verificar logs de erro**:
   ```bash
   npm run dev 2>&1 | tee server.log
   ```

2. **Verificar variáveis de ambiente**:
   ```bash
   echo $PORT
   echo $NODE_ENV
   ```

3. **Testar conectividade**:
   ```bash
   # Testar localhost
   ping localhost
   
   # Testar porta 5001
   telnet localhost 5001
   ```

### Se HMR não funcionar:

1. **Recarregar página**:
   - Pressione `Ctrl + F5` para recarregar sem cache

2. **Verificar console do navegador**:
   - Abra DevTools (F12)
   - Verifique erros na aba Console

3. **Desabilitar HMR temporariamente**:
   ```typescript
   // Em vite.config.ts
   server: {
     hmr: false
   }
   ```

## 📋 Checklist de Verificação

- [ ] Servidor rodando na porta 5001
- [ ] HMR ativo na porta 24679
- [ ] Firewall configurado
- [ ] Dependências instaladas
- [ ] Sem processos conflitantes
- [ ] Variáveis de ambiente corretas

## 🆘 Suporte

Se os problemas persistirem:

1. Execute o script de diagnóstico
2. Verifique os logs do servidor
3. Consulte a documentação do Vite
4. Verifique se há atualizações disponíveis

## 📝 Notas Importantes

- O WebSocket do Severino (porta 5001/ws/severino) é diferente do HMR do Vite (porta 24679)
- O HMR é usado apenas em desenvolvimento
- Em produção, o HMR é desabilitado automaticamente
- Sempre verifique se o servidor principal está rodando antes de tentar conectar ao HMR
