# Correção: Problema "usuário não encontrado" ao adicionar membros aos grupos

## Problema Identificado

Ao adicionar membros a um grupo na página de usuários, o sistema mostrava "usuário não encontrado" na lista de membros, mesmo após o membro ser adicionado com sucesso.

## Causa Raiz

O problema estava na função `getGroupMembers` no backend (`server/storage.ts`). A função estava retornando apenas os dados da tabela `group_members` (id, groupId, userId, role, joinedAt), mas não incluía os dados do usuário (nome, email, etc.).

No frontend, a interface `GroupMember` esperava um campo `user` opcional com os dados do usuário, mas o backend não estava fornecendo essas informações.

## Solução Aplicada

### 1. Criação de Interface Estendida

Adicionada uma nova interface `GroupMemberWithUser` no `server/storage.ts`:

```typescript
interface GroupMemberWithUser extends GroupMember {
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}
```

### 2. Atualização da Função getGroupMembers

Modificada a função `getGroupMembers` para fazer um JOIN com a tabela `users` e retornar os dados do usuário:

```typescript
async getGroupMembers(groupId: string): Promise<GroupMemberWithUser[]> {
  const members = await this.db
    .select({
      id: groupMembers.id,
      groupId: groupMembers.groupId,
      userId: groupMembers.userId,
      role: groupMembers.role,
      joinedAt: groupMembers.joinedAt,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role
      }
    })
    .from(groupMembers)
    .leftJoin(users, eq(groupMembers.userId, users.id))
    .where(eq(groupMembers.groupId, groupId));
  
  return members;
}
```

### 3. Atualização da Interface IStorage

Atualizada a interface `IStorage` para usar o novo tipo de retorno:

```typescript
getGroupMembers(groupId: string): Promise<GroupMemberWithUser[]>;
```

## Resultado

Após a correção:
- ✅ Os membros do grupo agora exibem corretamente o nome e email do usuário
- ✅ Não há mais mensagens de "usuário não encontrado"
- ✅ A funcionalidade de adicionar, remover e editar membros funciona corretamente
- ✅ Os dados do usuário são carregados automaticamente ao selecionar um grupo

## Arquivos Modificados

- `server/storage.ts`: Adicionada interface `GroupMemberWithUser` e atualizada função `getGroupMembers`

## Data da Correção

29/08/2025
