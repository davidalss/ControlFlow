# 🚀 Como Testar o ControlFlow

## ✅ Status Atual
- ✅ **Aplicativo Web**: Pronto para teste
- ✅ **Aplicativo Mobile**: Pronto para teste
- ✅ **Scripts de verificação**: Criados
- ✅ **Documentação**: Completa

## 🎯 Teste Rápido (5 minutos)

### 1. Verificar Ambiente
```bash
# Execute o script de verificação
node test-quick.cjs
```

### 2. Instalar Dependências
```bash
# Opção 1: Script automático (Windows)
start-testing.bat

# Opção 2: Manual
npm install
cd mobile && npm install && cd ..
```

### 3. Testar Web App
```bash
npm run dev
# Acesse: http://localhost:5002
```

### 4. Testar Mobile App
```bash
# Instalar Expo CLI (uma vez)
npm install -g @expo/cli

# Iniciar mobile
cd mobile && npm start
# Escaneie QR code com Expo Go
```

## 🔑 Credenciais de Teste

| Usuário | Email | Senha | Função |
|---------|-------|-------|--------|
| **Admin** | `admin@controlflow.com` | `admin123` | Administração completa |
| **Inspector** | `inspector@controlflow.com` | `inspector123` | Inspeções de qualidade |
| **Engineering** | `engineering@controlflow.com` | `engineering123` | Engenharia e análise |

## 📱 Funcionalidades Mobile para Testar

### ✅ Login e Autenticação
- Login com credenciais
- Botão "Login Demo" para acesso rápido

### ✅ Dashboard
- Status online/offline
- Estatísticas de inspeções
- Ações rápidas

### ✅ Nova Inspeção
1. Selecionar produto
2. Escolher plano de inspeção
3. Preencher parâmetros dinâmicos
4. Capturar fotos/vídeos
5. Salvar inspeção

### ✅ Scanner de Código
- Escanear QR codes/barcodes
- Entrada manual de códigos

### ✅ Sincronização Offline
1. Desconectar internet
2. Criar inspeções
3. Reconectar internet
4. Sincronizar dados

## 🌐 Funcionalidades Web para Testar

### ✅ Dashboard Principal
- Estatísticas de qualidade
- Gráficos de conformidade
- Relatórios recentes

### ✅ Módulo SPC
- Acesse: `/spc-control`
- Gráficos de controle
- Análise de capacidade

### ✅ Gestão de Fornecedores
- Acesse: `/supplier-management`
- Performance de fornecedores
- Histórico de auditorias

### ✅ Integração SAP (Simulada)
- Sincronização de produtos
- Envio de notificações
- Troca de dados master

## 🔧 Solução de Problemas

### Erro de Banco de Dados
```bash
# Copie o arquivo de exemplo
cp env.example .env

# Edite com suas credenciais PostgreSQL
# Execute migrações
npm run db:push
```

### Erro de Porta
```bash
# Mude a porta no .env
PORT=5003
```

### Erro de Dependências Mobile
```bash
cd mobile
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 📋 Checklist de Teste

### Web App
- [ ] Login funciona
- [ ] Dashboard carrega
- [ ] Módulo SPC acessível
- [ ] Gestão de fornecedores funciona
- [ ] Integração SAP simulada

### Mobile App
- [ ] Login funciona
- [ ] Dashboard carrega
- [ ] Nova inspeção funciona
- [ ] Scanner de código funciona
- [ ] Sincronização offline funciona
- [ ] Lista de inspeções carrega

## 🎯 Cenários de Teste Recomendados

### Cenário 1: Fluxo Completo Web (10 min)
1. Login como admin
2. Verificar dashboard
3. Testar módulo SPC
4. Testar gestão de fornecedores
5. Testar integração SAP

### Cenário 2: Fluxo Completo Mobile (15 min)
1. Login como inspector
2. Criar nova inspeção
3. Usar scanner de código
4. Capturar fotos/vídeos
5. Salvar inspeção
6. Sincronizar dados

### Cenário 3: Teste Offline (10 min)
1. Desconectar internet
2. Criar múltiplas inspeções
3. Reconectar internet
4. Sincronizar todos os dados

## 📞 Suporte

- **Documentação completa**: `TESTING_GUIDE.md`
- **Verificação rápida**: `node test-quick.cjs`
- **Script de instalação**: `start-testing.bat` ou `start-testing.ps1`

## 🚀 Próximos Passos

Após testar com sucesso:
1. **Part 3: Automação** - Integração IoT
2. **Part 4: Business Intelligence** - Dashboards avançados
3. **Melhorias Mobile** - Push notifications, assinatura digital
4. **Integração Real SAP** - Configurar conexão real

---

**Boa sorte com os testes! 🎉**
