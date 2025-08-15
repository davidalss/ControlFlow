# 🚀 Guia de Configuração - ControlFlow na Nova Máquina

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js 18+** - [Download aqui](https://nodejs.org/)
- **npm** (vem com Node.js)
- **Git** - [Download aqui](https://git-scm.com/)

## 🔧 Passo a Passo da Configuração

### 1. Clone o Repositório
```bash
git clone https://github.com/seu-usuario/controlflow.git
cd ControlFlow
```

### 2. Instalar Dependências
```bash
# Instalar dependências do projeto principal
npm install

# Instalar dependências do cliente (se necessário)
cd client && npm install && cd ..
```

### 3. Configurar Variáveis de Ambiente
```bash
# Copiar o arquivo de exemplo
cp env.example .env
```

### 4. Editar o arquivo .env
Abra o arquivo `.env` e configure:

```env
# Configurações do Banco de Dados (SQLite local)
DATABASE_URL="file:./local.db"

# Chave secreta para JWT (GERE UMA CHAVE ÚNICA!)
JWT_SECRET="sua-chave-secreta-super-segura-aqui-123456789"

# Porta do servidor
PORT=5002

# Configurações do ambiente
NODE_ENV=development

# Configurações de upload
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=10485760

# Configurações de sessão
SESSION_SECRET="sua-chave-secreta-de-sessao-aqui"
```

### 5. Configurar o Banco de Dados
```bash
# Executar migrações do banco
npm run db:push
```

### 6. Iniciar o Servidor
```bash
# Modo desenvolvimento
npm run dev
```

## 🌐 Acessos

Após iniciar o servidor, você terá acesso a:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5002

## 🔐 Credenciais de Teste

Use estas credenciais para fazer login:

```
Email: admin@controlflow.com
Senha: admin123
```

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento

# Build
npm run build        # Build para produção

# Produção
npm run start        # Inicia servidor de produção

# Banco de dados
npm run db:push      # Executa migrações

# Verificação
npm run check        # Verifica tipos TypeScript
```

## 📁 Estrutura Importante

```
ControlFlow/
├── client/          # Frontend React
├── server/          # Backend Node.js
├── shared/          # Código compartilhado
├── uploads/         # Arquivos enviados
├── local.db         # Banco SQLite
├── .env             # Variáveis de ambiente
└── package.json     # Dependências
```

## 🚨 Solução de Problemas

### Erro de Porta em Uso
```bash
# Verificar processos na porta 5002
netstat -ano | findstr :5002

# Matar processo (substitua XXXX pelo PID)
taskkill /PID XXXX /F
```

### Erro de Dependências
```bash
# Limpar cache do npm
npm cache clean --force

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

### Erro de Banco de Dados
```bash
# Recriar banco
rm local.db
npm run db:push
```

## 📱 Funcionalidades Principais

- ✅ **Autenticação** com JWT
- ✅ **Gestão de Produtos** com CRUD completo
- ✅ **Planos de Inspeção** com editor low-code
- ✅ **Upload de Fotos** com editor integrado
- ✅ **Relatórios** e dashboards
- ✅ **Interface Responsiva** para mobile/desktop

## 🎯 Próximos Passos

1. Acesse http://localhost:5173
2. Faça login com as credenciais de teste
3. Explore os módulos disponíveis
4. Crie seu primeiro produto
5. Configure um plano de inspeção

## 📞 Suporte

Se encontrar problemas:

1. Verifique se todas as dependências estão instaladas
2. Confirme se o arquivo `.env` está configurado
3. Verifique se a porta 5002 está livre
4. Consulte os logs do servidor

---

**🎉 Parabéns! Seu ControlFlow está configurado e pronto para uso!**
