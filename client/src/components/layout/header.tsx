import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { USER_ROLES } from "@/lib/constants";
import { useNavigate, useLocation } from "react-router-dom";
import { Bell, BellOff, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useNotifications } from "@/hooks/use-notifications";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Mapeamento de rotas para títulos
  const getPageTitle = () => {
    const pathMap: { [key: string]: string } = {
      '/dashboard': 'Dashboard',
      '/spc-control': 'Controle SPC',
      '/supplier-management': 'Gestão de Fornecedores',
      '/users': 'Usuários',
      '/products': 'Produtos',
      '/inspections': 'Inspeções',
      '/inspection-plans': 'Planos de Inspeção',
      '/reports': 'Relatórios',
      '/settings': 'CONFIGURAÇÕES',
      '/profile': 'Perfil'
    };
    return pathMap[location.pathname] || 'Dashboard';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const { notifications, unreadCount, isLoading: loadingNotifications, markAsRead, markAllAsRead } = useNotifications();

  return (
    <header className="fixed top-0 left-64 right-0 z-50 h-16 backdrop-blur-md shadow-sm" style={{
      backgroundColor: 'var(--bg-primary)',
      borderBottom: '1px solid var(--border-color)'
    }}>
      <div className="flex items-center justify-between h-full px-6">
        {/* Título do App */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:block">
            <h1 className="text-lg font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {getPageTitle()}
            </h1>
          </div>
        </div>

        {/* User Menu */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <div className="flex items-center">
            <ThemeToggle />
          </div>
          
          {/* Notificações */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="relative p-2 rounded-lg transition-all duration-200 cursor-pointer"
                style={{
                  color: 'var(--text-secondary)',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                aria-label="Abrir notificações"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold flex items-center justify-center bg-blue-600 text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 p-0" align="end" sideOffset={8}>
              <div className="px-3 py-2 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
                <DropdownMenuLabel className="text-sm font-semibold">Notificações</DropdownMenuLabel>
                {unreadCount > 0 && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={markAllAsRead} 
                    className="h-7 px-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Marcar todas como lidas
                  </Button>
                )}
              </div>
              <ScrollArea className="max-h-80">
                {loadingNotifications ? (
                  <div className="p-4 text-sm text-gray-500 dark:text-gray-400">Carregando...</div>
                ) : notifications.length === 0 ? (
                  <div className="p-6 text-center flex flex-col items-center justify-center gap-2">
                    <BellOff className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Sem notificações</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <DropdownMenuItem key={n.id} className="items-start py-3 gap-2 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate text-gray-900 dark:text-white">{n.title}</p>
                          {!n.read && (
                            <Badge variant="secondary" className="ml-2 text-xs">novo</Badge>
                          )}
                        </div>
                        <p className="text-xs mt-1 break-words text-gray-600 dark:text-gray-400">{n.message}</p>
                      </div>
                      {!n.read && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }} 
                          className="h-7 text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          Ler
                        </Button>
                      )}
                    </DropdownMenuItem>
                  ))
                )}
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {user?.name}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {USER_ROLES[user?.role as keyof typeof USER_ROLES]}
              </p>
            </div>
            <button 
              onClick={() => navigate('/profile')} 
              className="rounded-full hover:ring-2 hover:ring-blue-500 transition-all duration-200"
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={user?.photo} alt={user?.name} />
                <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                  {user?.name?.split(' ').map(n=>n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </button>

            {/* Logout Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400 dark:hover:text-red-300 dark:border-red-800 dark:hover:border-red-700"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Sair</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
