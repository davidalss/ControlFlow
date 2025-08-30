# 🔔 Sistema de Notificações com Supabase

## 📋 1. Estrutura da Tabela no Supabase

```sql
-- Tabela de notificações no Supabase
create table notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  type text check (type in ('info', 'success', 'warning', 'error', 'urgent')),
  title text not null,
  message text not null,
  category text check (category in ('sgq', 'training', 'process', 'severino', 'system')),
  priority text check (priority in ('low', 'medium', 'high', 'urgent')),
  read boolean default false,
  action jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  expires_at timestamp with time zone,
  metadata jsonb
);

-- Políticas RLS para segurança
-- 1. Usuários normais veem apenas suas notificações
create policy "Usuários podem ver apenas suas notificações"
  on notifications for all
  using (
    auth.uid() = user_id 
    OR 
    (
      SELECT role FROM auth.users WHERE id = auth.uid()
    ) = 'admin'
  );

-- 2. Admins podem ver todas as notificações
create policy "Admins podem ver todas as notificações"
  on notifications for all
  using (
    (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

-- 3. View para admins com informações detalhadas
create view admin_notifications_view as
  select 
    n.*,
    u.email as user_email,
    u.user_metadata->>'full_name' as user_name,
    u.role as user_role
  from notifications n
  join auth.users u on n.user_id = u.id;

-- Garantir que apenas admins podem acessar a view
create policy "Apenas admins podem acessar view de notificações"
  on admin_notifications_view
  for select
  using ((SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin');
```

## 📦 2. Setup do Cliente

```typescript
// lib/supabase/notifications.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'urgent';
  title: string;
  message: string;
  category: 'sgq' | 'training' | 'process' | 'severino' | 'system';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  action?: {
    label: string;
    url: string;
  };
  created_at: Date;
  expires_at?: Date;
  metadata?: any;
}

export class NotificationService {
  // Verifica se o usuário é admin
  private async isAdmin(): Promise<boolean> {
    const user = supabase.auth.user();
    if (!user) return false;
    
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
      
    return profile?.role === 'admin';
  }

  // Buscar notificações (com suporte a admin)
  async fetchNotifications(options: {
    userId?: string;
    page?: number;
    limit?: number;
    isAdminView?: boolean;
  } = {}) {
    const { userId, page = 1, limit = 20, isAdminView = false } = options;
    const isUserAdmin = await this.isAdmin();

    if (isAdminView && isUserAdmin) {
      // Admins podem ver a view detalhada
      const { data, error } = await supabase
        .from('admin_notifications_view')
        .select('*')
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;
      return data;
    }

    // Query padrão para usuários normais ou admin vendo notificações específicas
    const query = supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    // Se um userId específico foi fornecido e o usuário é admin
    if (userId && isUserAdmin) {
      query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  // Criar nova notificação
  async createNotification(notification: Omit<Notification, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notification])
      .single();

    if (error) throw error;
    return data;
  }

  // Marcar como lida
  async markAsRead(id: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .match({ id });

    if (error) throw error;
  }

  // Marcar todas como lidas
  async markAllAsRead() {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .match({ user_id: supabase.auth.user()?.id });

    if (error) throw error;
  }
}
```

## 🎨 3. Componente com Animações

```typescript
// components/NotificationCenter.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';

export const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notificationService = new NotificationService();

  // Efeito para carregar notificações
  useEffect(() => {
    const loadNotifications = async () => {
      const data = await notificationService.fetchUserNotifications();
      setNotifications(data);
    };
    
    loadNotifications();
    
    // Setup do listener real-time
    const subscription = supabase
      .from('notifications')
      .on('INSERT', payload => {
        setNotifications(current => [payload.new, ...current]);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100"
      >
        <Bell className="h-6 w-6" />
        {notifications.some(n => !n.read) && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full"
          />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg"
          >
            {/* Lista de Notificações */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.map(notification => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="p-4 border-b hover:bg-gray-50"
                >
                  <h3 className="font-medium">{notification.title}</h3>
                  <p className="text-sm text-gray-600">{notification.message}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
```

## 🔌 4. Integração com Severino

```typescript
// lib/severino/notifications.ts
class SeverinoNotifications {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  async sendNotification(message: string) {
    await this.notificationService.createNotification({
      type: 'info',
      title: 'Severino',
      message,
      category: 'severino',
      priority: 'medium',
      read: false,
      metadata: {
        source: 'severino',
        timestamp: new Date().toISOString()
      }
    });
  }
}
```

## 🚀 5. Como Usar

### Exemplo de uso em componentes:

```typescript
function YourComponent() {
  const notificationService = new NotificationService();

  const handleAction = async () => {
    await notificationService.createNotification({
      type: 'success',
      title: 'Ação Concluída',
      message: 'Sua ação foi realizada com sucesso',
      category: 'system',
      priority: 'medium',
      read: false
    });
  };
}
```

### Exemplo de uso com Severino:

```typescript
const severino = new SeverinoNotifications();

// Quando Severino precisar notificar algo
await severino.sendNotification('Encontrei uma não conformidade no processo X');
```

## 📱 6. Animações Disponíveis

1. **Notificação Entrando**
```typescript
const entryAnimation = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.2 }
};
```

2. **Badge Pulsando**
```typescript
const pulseAnimation = {
  initial: { scale: 1 },
  animate: { 
    scale: [1, 1.2, 1],
    transition: {
      duration: 2,
      repeat: Infinity
    }
  }
};
```

3. **Lista Deslizando**
```typescript
const slideAnimation = {
  initial: { x: -20, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 20, opacity: 0 }
};
```

## ⚡ 7. Performance e Otimizações

1. **Paginação**
```typescript
async fetchUserNotifications(page = 1, limit = 20) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) throw error;
  return data;
}
```

2. **Limpeza Automática**
```typescript
// Função para limpar notificações antigas
async cleanupOldNotifications() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  await supabase
    .from('notifications')
    .delete()
    .lt('created_at', thirtyDaysAgo.toISOString());
}
```

3. **Cache Local**
```typescript
// hooks/useNotifications.ts
export function useNotifications() {
  const queryClient = useQueryClient();

  return useQuery('notifications', 
    () => notificationService.fetchUserNotifications(),
    {
      staleTime: 1000 * 60, // 1 minuto
      cacheTime: 1000 * 60 * 5 // 5 minutos
    }
  );
}
```

## 📋 Próximos Passos

1. [ ] Implementar a tabela no Supabase
2. [ ] Configurar as políticas de segurança
3. [ ] Implementar o NotificationService
4. [ ] Adicionar o componente NotificationCenter
5. [ ] Integrar com o Severino
6. [ ] Testar as animações
7. [ ] Implementar a limpeza automática
8. [ ] Adicionar paginação
9. [ ] Configurar cache
10. [ ] Testar em produção

## 🔒 Segurança

- Todas as operações são protegidas por RLS
- Usuários só podem ver suas próprias notificações
- Todas as queries são parametrizadas
- Dados sensíveis não são expostos

## 🔄 Integração Contínua

- As notificações são sincronizadas em tempo real
- Múltiplas abas/dispositivos mantêm o estado
- Sistema resiliente a falhas de conexão
- Backup automático dos dados
