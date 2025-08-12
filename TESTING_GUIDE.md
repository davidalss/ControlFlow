# Guia de Teste - ControlFlow Quality Module

Este guia explica como testar tanto o **aplicativo web** quanto o **aplicativo móvel** do ControlFlow.

## 📋 Pré-requisitos

### Para o Aplicativo Web:
- Node.js 18+ instalado
- PostgreSQL configurado (ou banco de dados compatível)
- Navegador moderno (Chrome, Firefox, Safari, Edge)

### Para o Aplicativo Móvel:
- Node.js 18+ instalado
- Expo CLI instalado: `npm install -g @expo/cli`
- Expo Go app instalado no seu dispositivo móvel
- Dispositivo móvel (Android/iOS) ou emulador

## 🚀 Testando o Aplicativo Web

### 1. Configuração do Banco de Dados

Primeiro, configure as variáveis de ambiente:

```bash
# No diretório ControlFlow/
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações de banco de dados:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/controlflow"
JWT_SECRET="sua-chave-secreta-aqui"
PORT=5002
```

### 2. Instalação e Execução

```bash
# Navegue para o diretório do projeto
cd ControlFlow

# Instale as dependências
npm install

# Execute as migrações do banco de dados
npm run db:push

# Inicie o servidor de desenvolvimento
npm run dev
```

O aplicativo web estará disponível em: `http://localhost:5002`

### 3. Credenciais de Teste

Use as seguintes credenciais para testar:

**Administrador:**
- Email: `admin@controlflow.com`
- Senha: `admin123`

**Inspetor:**
- Email: `inspector@controlflow.com`
- Senha: `inspector123`

**Engenharia:**
- Email: `engineering@controlflow.com`
- Senha: `engineering123`

### 4. Funcionalidades para Testar

#### Dashboard Principal
- Visualizar estatísticas de qualidade
- Ver gráficos de conformidade
- Acessar relatórios recentes

#### Módulo SPC (Statistical Process Control)
- Acesse: `/spc-control`
- Visualizar gráficos de controle
- Analisar capacidade do processo
- Configurar limites de controle

#### Gestão de Fornecedores
- Acesse: `/supplier-management`
- Visualizar performance dos fornecedores
- Ver histórico de auditorias
- Gerenciar avaliações

#### Integração SAP (Simulada)
- Sincronização de produtos
- Envio de notificações
- Troca de dados master

## 📱 Testando o Aplicativo Móvel

### 1. Instalação das Dependências

```bash
# Navegue para o diretório mobile
cd ControlFlow/mobile

# Instale as dependências
npm install
```

### 2. Executando o App

```bash
# Inicie o servidor de desenvolvimento Expo
npm start
```

Isso abrirá o Metro Bundler no navegador. Você verá um QR code.

### 3. Testando no Dispositivo Físico

1. **Instale o Expo Go** no seu dispositivo móvel:
   - Android: Google Play Store
   - iOS: App Store

2. **Escaneie o QR Code**:
   - Android: Use o app Expo Go
   - iOS: Use a câmera do iPhone

### 4. Testando no Emulador

#### Android:
```bash
# Certifique-se de ter o Android Studio instalado
npm run android
```

#### iOS (apenas macOS):
```bash
# Certifique-se de ter o Xcode instalado
npm run ios
```

### 5. Credenciais de Teste do Mobile

Use as mesmas credenciais do web app:

**Inspetor (Recomendado para mobile):**
- Email: `inspector@controlflow.com`
- Senha: `inspector123`

### 6. Funcionalidades para Testar no Mobile

#### Login e Autenticação
- Teste o login com credenciais válidas
- Teste o botão "Login Demo" para acesso rápido

#### Dashboard
- Visualizar status online/offline
- Ver estatísticas de inspeções
- Acessar ações rápidas

#### Nova Inspeção
1. Toque em "Nova Inspeção"
2. Selecione um produto
3. Escolha um plano de inspeção
4. Preencha os parâmetros dinamicamente
5. Capture fotos/vídeos
6. Salve a inspeção

#### Scanner de Código de Barras
1. Toque em "Scanner"
2. Aponte para um código QR/barcode
3. Teste a entrada manual

#### Sincronização Offline
1. Desconecte a internet
2. Crie uma inspeção
3. Reconecte a internet
4. Vá para "Sincronizar" e sincronize

#### Lista de Inspeções
- Visualizar todas as inspeções
- Filtrar por status
- Ver detalhes de cada inspeção

## 🔧 Solução de Problemas

### Problemas Comuns do Web App

#### Erro de Conexão com Banco
```bash
# Verifique se o PostgreSQL está rodando
# Verifique as credenciais no .env
# Execute as migrações novamente
npm run db:push
```

#### Erro de Porta em Uso
```bash
# Mude a porta no .env
PORT=5003
```

### Problemas Comuns do Mobile

#### Erro de Dependências
```bash
# Limpe o cache do npm
npm cache clean --force
# Reinstale as dependências
rm -rf node_modules package-lock.json
npm install
```

#### Erro de Metro Bundler
```bash
# Limpe o cache do Expo
expo start --clear
```

#### Problemas de Permissões
- Verifique se o app tem permissão para câmera
- Verifique permissões de localização
- Verifique permissões de armazenamento

## 📊 Dados de Teste

### Produtos de Exemplo
- Produto A: "Válvula de Controle"
- Produto B: "Sensor de Pressão"
- Produto C: "Bomba Centrífuga"

### Planos de Inspeção
- Inspeção Visual: Parâmetros visuais
- Inspeção Dimensional: Medições
- Inspeção Funcional: Testes operacionais

## 🎯 Cenários de Teste Recomendados

### Cenário 1: Fluxo Completo Web
1. Login como administrador
2. Acessar dashboard
3. Verificar módulo SPC
4. Verificar gestão de fornecedores
5. Testar integração SAP

### Cenário 2: Fluxo Completo Mobile
1. Login como inspetor
2. Criar nova inspeção
3. Usar scanner de código
4. Capturar fotos/vídeos
5. Salvar inspeção
6. Sincronizar dados

### Cenário 3: Teste Offline
1. Desconectar internet
2. Criar múltiplas inspeções
3. Reconectar internet
4. Sincronizar todos os dados

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs no terminal
2. Consulte a documentação no README.md
3. Verifique se todas as dependências estão instaladas
4. Teste com dados de exemplo fornecidos

## 🚀 Próximos Passos

Após testar as funcionalidades básicas, você pode:

1. **Implementar Part 3: Automação** - Integração com sensores IoT
2. **Implementar Part 4: Business Intelligence** - Dashboards avançados
3. **Melhorar o Mobile** - Push notifications, assinatura digital
4. **Integração Real com SAP** - Configurar conexão real com SAP

---

**Boa sorte com os testes! 🎉**
