# 📸 Sistema de Fotos de Perfil - Supabase Storage

Este documento descreve o novo sistema de upload e gerenciamento de fotos de perfil usando o Supabase Storage.

## 🏗️ Arquitetura

### Estrutura de Arquivos
```
FOTOS_PERFIL/
├── {user-id-1}/
│   └── avatar.jpg
├── {user-id-2}/
│   └── avatar.jpg
└── {user-id-3}/
    └── avatar.jpg
```

### Bucket de Storage
- **Nome**: `ENSOS`
- **Visibilidade**: Público
- **Tamanho máximo**: 5MB por arquivo
- **Tipos permitidos**: JPEG, PNG, GIF

## 🚀 Configuração Inicial

### 1. Configurar o Bucket no Supabase

Execute o script de configuração:

```bash
node scripts/setup-supabase-storage.js
```

Este script irá:
- Criar o bucket `ENSOS` se não existir
- Configurar políticas RLS (Row Level Security)
- Testar o upload de uma imagem

### 2. Políticas de Segurança

O sistema implementa as seguintes políticas:

- **Upload**: Usuários podem fazer upload apenas de suas próprias fotos
- **Visualização**: Qualquer pessoa pode visualizar fotos de perfil
- **Atualização**: Usuários podem atualizar apenas suas próprias fotos
- **Exclusão**: Usuários podem deletar apenas suas próprias fotos

## 💻 Uso no Frontend

### Hook Personalizado

```typescript
import { usePhotoUpload } from '@/hooks/use-photo-upload';

const { uploadProfilePhoto, getProfilePhotoUrl, deleteProfilePhoto, isUploading } = usePhotoUpload();

// Upload de foto
const photoUrl = await uploadProfilePhoto(file, userId);

// Obter URL da foto
const photoUrl = getProfilePhotoUrl(userId);

// Deletar foto
const success = await deleteProfilePhoto(userId);
```

### Componente UserAvatar

```typescript
import UserAvatar from '@/components/UserAvatar';

<UserAvatar 
  userId="user-id" 
  userName="Nome do Usuário" 
  size="lg" 
/>
```

## 🔧 API do Supabase Storage

### Upload de Foto

```typescript
const { data, error } = await supabase.storage
  .from('ENSOS')
  .upload(`FOTOS_PERFIL/${userId}/avatar.jpg`, file, {
    upsert: true,
    cacheControl: '3600',
    contentType: 'image/jpeg'
  });
```

### Download de Foto

```typescript
const { data, error } = await supabase.storage
  .from('ENSOS')
  .download(`FOTOS_PERFIL/${userId}/avatar.jpg`);
```

### URL Pública

```typescript
const { data: url } = supabase.storage
  .from('ENSOS')
  .getPublicUrl(`FOTOS_PERFIL/${userId}/avatar.jpg`);
```

## 📱 Integração com Componentes

### Página de Perfil

A página de perfil (`client/src/pages/profile.tsx`) foi atualizada para:

- Usar o novo hook `usePhotoUpload`
- Exibir botão de deletar foto
- Mostrar loading durante upload
- Atualizar automaticamente o contexto de autenticação

### Hook de Autenticação

O hook de autenticação (`client/src/hooks/use-auth.tsx`) foi atualizado para:

- Buscar fotos automaticamente do Supabase Storage
- Usar URLs públicas para exibição
- Manter compatibilidade com sistema anterior

## 🔄 Migração do Sistema Anterior

### Antes (Sistema de Upload Local)
```typescript
// Upload via API do servidor
const formData = new FormData();
formData.append('photo', file);
const response = await fetch('/api/users/photo', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

### Depois (Supabase Storage)
```typescript
// Upload direto para Supabase
const photoUrl = await uploadProfilePhoto(file, userId);
```

## 🛡️ Segurança

### Validações Implementadas

1. **Tipo de arquivo**: Apenas imagens (JPEG, PNG, GIF)
2. **Tamanho**: Máximo 5MB
3. **Conversão**: Imagens são convertidas para JPEG automaticamente
4. **Políticas RLS**: Controle de acesso baseado em usuário
5. **Sanitização**: Nomes de arquivo padronizados

### URLs Públicas

- URLs são geradas automaticamente pelo Supabase
- Incluem timestamp para evitar cache
- Acessíveis sem autenticação para visualização

## 🐛 Troubleshooting

### Erro: "Bucket não encontrado"
```bash
# Execute o script de configuração
node scripts/setup-supabase-storage.js
```

### Erro: "Permissão negada"
- Verifique se as políticas RLS estão configuradas
- Confirme se o usuário está autenticado
- Verifique se o bucket `ENSOS` existe

### Erro: "Arquivo muito grande"
- Reduza o tamanho da imagem (máximo 5MB)
- Use compressão antes do upload

### Erro: "Tipo de arquivo não suportado"
- Use apenas JPEG, PNG ou GIF
- O sistema converte automaticamente para JPEG

## 📊 Monitoramento

### Logs de Upload
- Todos os uploads são logados no console
- Erros são capturados e exibidos via toast
- Status de loading é gerenciado automaticamente

### Métricas
- Tamanho dos arquivos
- Tipos de arquivo mais comuns
- Taxa de sucesso de upload

## 🔮 Próximas Melhorias

1. **Compressão automática**: Reduzir tamanho de imagens grandes
2. **Crop inteligente**: Detectar e recortar rostos automaticamente
3. **Múltiplas resoluções**: Gerar thumbnails automaticamente
4. **Cache otimizado**: Implementar cache mais eficiente
5. **Backup**: Sistema de backup automático das fotos

## 📝 Exemplos de Uso

### Upload Simples
```typescript
const handleFileSelect = async (event) => {
  const file = event.target.files[0];
  if (file && user?.id) {
    const photoUrl = await uploadProfilePhoto(file, user.id);
    if (photoUrl) {
      updateUser({ photo: photoUrl });
    }
  }
};
```

### Exibição em Lista
```typescript
{users.map(user => (
  <div key={user.id}>
    <UserAvatar userId={user.id} userName={user.name} size="sm" />
    <span>{user.name}</span>
  </div>
))}
```

### Verificação de Foto Existente
```typescript
const photoUrl = getProfilePhotoUrl(userId);
const hasPhoto = !!photoUrl;

if (hasPhoto) {
  // Exibir foto
} else {
  // Exibir fallback
}
```
