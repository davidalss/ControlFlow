# 📱 ControlFlow Mobile

App móvel para inspeções de qualidade em campo, desenvolvido com React Native e Expo.

## 🚀 Funcionalidades

### ✅ Implementadas

- **🔐 Autenticação Segura**
  - Login com email/senha
  - Armazenamento seguro de credenciais
  - Diferentes níveis de acesso (admin, inspector, engineering, supervisor)

- **📋 Formulários Dinâmicos**
  - Criação de inspeções baseadas em planos
  - Parâmetros configuráveis (numérico, texto, boolean, select)
  - Validação automática de conformidade
  - Captura automática de localização

- **📷 Captura de Mídia**
  - Fotos com câmera integrada
  - Gravação de vídeos (máx. 30 segundos)
  - Seleção de mídia da galeria
  - Controles de qualidade configuráveis

- **📊 Scanner QR Code/Barcode**
  - Scanner integrado para códigos de barras
  - Suporte a QR Code, Code128, Code39, EAN13, EAN8
  - Entrada manual de códigos
  - Identificação automática de produtos

- **🔄 Sincronização Offline**
  - Armazenamento local com SQLite
  - Funcionamento completo sem internet
  - Sincronização automática quando online
  - Fila de itens pendentes

- **📱 Interface Moderna**
  - Design Material Design com React Native Paper
  - Navegação intuitiva com tabs
  - Dashboard com estatísticas em tempo real
  - Lista de inspeções com filtros e busca

### 🔄 Funcionalidades Offline

- **Armazenamento Local**: Todos os dados são salvos localmente
- **Trabalho Offline**: App funciona completamente sem internet
- **Sincronização Inteligente**: Dados são sincronizados quando a conexão é restaurada
- **Fila de Sincronização**: Itens pendentes são processados automaticamente

## 🛠️ Tecnologias

- **React Native**: Framework principal
- **Expo**: Plataforma de desenvolvimento
- **TypeScript**: Tipagem estática
- **React Native Paper**: Componentes Material Design
- **SQLite**: Banco de dados local
- **Expo Camera**: Captura de fotos/vídeos
- **Expo Barcode Scanner**: Scanner de códigos
- **Expo Location**: Captura de localização
- **React Navigation**: Navegação entre telas

## 📦 Instalação

### Pré-requisitos

- Node.js 16+
- npm ou yarn
- Expo CLI
- Android Studio (para Android) ou Xcode (para iOS)

### Passos

1. **Instalar dependências**
   ```bash
   cd mobile
   npm install
   ```

2. **Configurar Expo**
   ```bash
   npx expo install
   ```

3. **Executar o app**
   ```bash
   npm start
   ```

4. **Testar no dispositivo**
   - Instale o app Expo Go no seu dispositivo
   - Escaneie o QR code que aparece no terminal
   - Ou use um emulador Android/iOS

## 🏗️ Estrutura do Projeto

```
mobile/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   ├── screens/            # Telas do app
│   │   ├── LoginScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── InspectionFormScreen.tsx
│   │   ├── InspectionListScreen.tsx
│   │   ├── BarcodeScannerScreen.tsx
│   │   ├── CameraScreen.tsx
│   │   ├── OfflineSyncScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── contexts/           # Contextos React
│   │   ├── AuthContext.tsx
│   │   └── OfflineContext.tsx
│   ├── types/              # Definições de tipos TypeScript
│   │   ├── index.ts
│   │   └── navigation.ts
│   ├── services/           # Serviços e APIs
│   └── utils/              # Utilitários
├── App.tsx                 # Componente principal
├── app.json               # Configuração Expo
└── package.json           # Dependências
```

## 🔧 Configuração

### Permissões

O app solicita as seguintes permissões:

- **Câmera**: Para captura de fotos e vídeos
- **Localização**: Para registrar onde as inspeções foram realizadas
- **Armazenamento**: Para salvar mídia e dados offline
- **Internet**: Para sincronização com o servidor

### Configurações do App

- **Qualidade de Mídia**: Configurável (baixa, média, alta)
- **Sincronização Automática**: Ativada por padrão
- **Captura de Localização**: Ativada por padrão
- **Notificações**: Configurável

## 📱 Telas Principais

### 1. Login
- Autenticação com email/senha
- Login demo disponível
- Armazenamento seguro de credenciais

### 2. Dashboard
- Visão geral das inspeções
- Estatísticas em tempo real
- Status de conexão
- Ações rápidas

### 3. Formulário de Inspeção
- Seleção de produto e plano
- Parâmetros dinâmicos
- Captura de mídia
- Validação automática

### 4. Scanner
- Scanner de códigos de barras
- Suporte a múltiplos formatos
- Entrada manual
- Integração com formulário

### 5. Lista de Inspeções
- Visualização de todas as inspeções
- Filtros por status
- Busca por texto
- Detalhes de conformidade

### 6. Sincronização
- Status de conexão
- Itens pendentes
- Sincronização manual
- Estatísticas de sync

### 7. Configurações
- Perfil do usuário
- Configurações do app
- Gerenciamento de dados
- Suporte e ajuda

## 🔐 Segurança

- **Autenticação JWT**: Tokens seguros
- **Armazenamento Criptografado**: Credenciais protegidas
- **Validação de Dados**: Verificação de entrada
- **Permissões Granulares**: Controle de acesso por função

## 📊 Dados Offline

### Estrutura do Banco Local

```sql
-- Inspeções
CREATE TABLE inspections (
  id TEXT PRIMARY KEY,
  productId TEXT,
  inspectionPlanId TEXT,
  inspectorId TEXT,
  status TEXT,
  location TEXT,
  results TEXT,
  photos TEXT,
  videos TEXT,
  notes TEXT,
  startedAt TEXT,
  completedAt TEXT,
  synced INTEGER DEFAULT 0,
  createdAt TEXT,
  updatedAt TEXT
);

-- Produtos
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  code TEXT,
  name TEXT,
  description TEXT,
  businessUnit TEXT,
  family TEXT,
  category TEXT,
  specifications TEXT,
  createdAt TEXT,
  updatedAt TEXT
);

-- Planos de Inspeção
CREATE TABLE inspection_plans (
  id TEXT PRIMARY KEY,
  name TEXT,
  description TEXT,
  productId TEXT,
  businessUnit TEXT,
  parameters TEXT,
  frequency TEXT,
  isActive INTEGER,
  createdAt TEXT,
  updatedAt TEXT
);

-- Fila de Sincronização
CREATE TABLE pending_sync (
  id TEXT PRIMARY KEY,
  type TEXT,
  data TEXT,
  createdAt TEXT
);
```

## 🚀 Build e Deploy

### Desenvolvimento
```bash
npm start
```

### Build para Produção
```bash
# Android
npx expo build:android

# iOS
npx expo build:ios
```

### EAS Build (Recomendado)
```bash
# Instalar EAS CLI
npm install -g @expo/eas-cli

# Configurar projeto
eas build:configure

# Build para Android
eas build --platform android

# Build para iOS
eas build --platform ios
```

## 🧪 Testes

### Credenciais Demo
- **Email**: `inspector@controlflow.com`
- **Senha**: `password`

### Funcionalidades de Teste
- Login com credenciais demo
- Criação de inspeções
- Captura de fotos/vídeos
- Scanner de códigos
- Sincronização offline

## 📈 Próximos Passos

### Melhorias Planejadas
- [ ] Notificações push
- [ ] Assinatura digital
- [ ] Relatórios offline
- [ ] Integração com sensores IoT
- [ ] Modo escuro
- [ ] Múltiplos idiomas

### Integrações Futuras
- [ ] SAP Integration
- [ ] Power BI Reports
- [ ] Machine Learning
- [ ] Real-time Analytics

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 📞 Suporte

Para suporte técnico ou dúvidas:
- Email: suporte@controlflow.com
- Documentação: [docs.controlflow.com](https://docs.controlflow.com)
- Issues: [GitHub Issues](https://github.com/controlflow/mobile/issues)

---

**ControlFlow Mobile** - Transformando inspeções de qualidade em campo 🏭📱
