# ⚡ Configuração Rápida - ControlFlow

## 🚀 Setup em 3 Passos

### 1. Execute o Script Automático
```bash
# Windows (CMD)
setup-nova-maquina.bat

# Windows (PowerShell)
.\setup-nova-maquina.ps1
```

### 2. Ou Configure Manualmente
```bash
# Instalar dependências
npm install

# Copiar configurações
copy env.example .env

# Configurar banco
npm run db:push

# Iniciar servidor
npm run dev
```

### 3. Acesse o Sistema
- **URL**: http://localhost:5173
- **Email**: admin@controlflow.com
- **Senha**: admin123

## 🔧 Configurações do .env
Edite o arquivo `.env` com estas configurações:

```env
DATABASE_URL="file:./local.db"
JWT_SECRET="controlflow-jwt-secret-key-2024-development"
PORT=5002
NODE_ENV=development
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=10485760
SESSION_SECRET="controlflow-session-secret-2024-development"
```

## ✅ Verificação
- ✅ Node.js 18+ instalado
- ✅ Dependências instaladas
- ✅ Arquivo .env configurado
- ✅ Banco de dados criado
- ✅ Servidor rodando na porta 5002
- ✅ Frontend acessível em localhost:5173

## 🎯 Próximos Passos
1. Acesse http://localhost:5173
2. Faça login com as credenciais
3. Explore os módulos disponíveis
4. Crie seu primeiro produto
5. Configure um plano de inspeção

---
**🎉 Seu ControlFlow está pronto para uso!**
