# 🚀 Início Rápido - ControlFlow

## ⚡ Configuração em 1 Minuto

### 🎯 Opção 1: Script Automático (Recomendado)
```bash
# Execute um destes comandos:
setup-nova-maquina.bat          # Windows CMD
.\setup-nova-maquina.ps1        # Windows PowerShell
```

### 🎯 Opção 2: Comandos Manuais
```bash
npm install
copy env.example .env
npm run db:push
npm run dev
```

## 🌐 Acessos
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5002

## 🔐 Login
- **Email**: admin@controlflow.com
- **Senha**: admin123

## 📋 Pré-requisitos
- Node.js 18+ ([Download](https://nodejs.org/))
- Git ([Download](https://git-scm.com/))

## 🛠️ Scripts Úteis
```bash
npm run dev          # Desenvolvimento
npm run build        # Build produção
npm run start        # Produção
npm run db:push      # Migrações
```

## 📁 Arquivos Importantes
- `SETUP_NOVA_MAQUINA.md` - Guia completo
- `config-rapida.md` - Configuração rápida
- `setup-nova-maquina.bat` - Script Windows
- `setup-nova-maquina.ps1` - Script PowerShell

## 🚨 Problemas Comuns
- **Porta ocupada**: `netstat -ano | findstr :5002`
- **Dependências**: `npm cache clean --force && npm install`
- **Banco**: `rm local.db && npm run db:push`

---
**🎉 Pronto! Seu ControlFlow está configurado!**
