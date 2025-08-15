# 🐳 Instalar Docker Desktop no Windows

## 📋 Pré-requisitos

- Windows 10/11 (64-bit)
- WSL 2 (Windows Subsystem for Linux 2)
- Virtualização habilitada na BIOS

## 🚀 Instalação Passo a Passo

### 1. Baixar Docker Desktop
- Acesse: https://www.docker.com/products/docker-desktop/
- Clique em "Download for Windows"
- Execute o instalador baixado

### 2. Configurar WSL 2 (se necessário)
```powershell
# Abrir PowerShell como administrador
wsl --install
```

### 3. Habilitar Virtualização
1. Reinicie o computador
2. Entre na BIOS (F2, F10, Del - depende da placa)
3. Procure por "Virtualization Technology" ou "Intel VT-x"
4. Habilite a opção
5. Salve e saia

### 4. Instalar Docker Desktop
1. Execute o instalador baixado
2. Siga as instruções na tela
3. Reinicie o computador quando solicitado

### 5. Verificar Instalação
```powershell
# Abrir PowerShell
docker --version
docker-compose --version
```

## 🔧 Configurações Recomendadas

### Docker Desktop Settings
1. Abra Docker Desktop
2. Vá em Settings (⚙️)
3. Configure:
   - **Resources > Memory**: 4GB ou mais
   - **Resources > CPUs**: 2 ou mais
   - **Resources > Disk**: 60GB ou mais

### WSL 2 Integration
1. Em Settings > Resources > WSL Integration
2. Habilite "Enable integration with my default WSL distro"

## 🚨 Solução de Problemas

### Docker não inicia
- Verifique se a virtualização está habilitada
- Reinicie o Docker Desktop
- Reinicie o computador

### Erro de WSL
```powershell
# Atualizar WSL
wsl --update

# Reiniciar WSL
wsl --shutdown
```

### Problemas de Permissão
- Execute PowerShell como administrador
- Verifique se o usuário está no grupo "docker-users"

## ✅ Verificação Final

Após a instalação, execute:

```powershell
# Verificar versão
docker --version

# Testar com container simples
docker run hello-world

# Se tudo funcionar, você verá:
# "Hello from Docker!"
```

## 🎯 Próximos Passos

Após instalar o Docker:

1. Volte ao diretório do ControlFlow
2. Execute: `docker-setup.bat` ou `.\docker-setup.ps1`
3. Acesse: http://localhost:5002

---

**🎉 Docker instalado com sucesso!**
