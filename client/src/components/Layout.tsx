import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  X,
  Home,
  FileText,
  Users,
  Settings,
  BarChart3,
  Shield,
  Award,
  Database,
  Layers,
  Target,
  Zap,
  TrendingUp,
  CheckSquare,
  Camera,
  BookOpen,
  AlertTriangle,
  Bell,
  User,
  LogOut,
  Grid,
  List,
  Sun,
  Moon,
  Search,
  CheckCircle,
  Plus,
  GraduationCap,
  Truck,
  ClipboardList,
  Lock,
  Play,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/use-auth';
import { useNotifications } from '@/hooks/use-notifications.tsx';
import { useTheme } from '@/contexts/ThemeContext';
import AnimatedLogo from '@/components/AnimatedLogo';
import Header from './layout/header';

interface LayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    href: '/dashboard'
  },
  {
    id: 'quality-engineering',
    label: 'Engenharia de Qualidade',
    icon: Shield,
    href: '/quality-engineering',
    children: [
      { id: 'products', label: 'Produtos', icon: Database, href: '/products' },
      { id: 'suppliers', label: 'Fornecedores', icon: Truck, href: '/supplier-management' },
      { id: 'inspection-plans', label: 'Planos de Inspeção', icon: FileText, href: '/inspection-plans' }
    ]
  },
  {
    id: 'quality-management',
    label: 'Gestão da Qualidade',
    icon: CheckSquare,
    href: '/quality',
    children: [
      { id: 'inspections', label: 'Inspeções', icon: CheckSquare, href: '/inspections' },
      { id: 'inspection-list', label: 'Lista de Inspeções', icon: List, href: '/inspection/list' },
      { id: 'spc-control', label: 'Controle SPC', icon: Target, href: '/spc-control' },
      { id: 'approval-queue', label: 'Aprovações', icon: CheckCircle, href: '/approval-queue' },
      { id: 'blocks', label: 'Gestão de Bloqueios', icon: Lock, href: '/blocks' }
    ]
  },
  {
    id: 'training',
    label: 'Treinamentos',
    icon: BookOpen,
    href: '/training',
    children: [
      { id: 'training-list', label: 'Lista de Treinamentos', icon: List, href: '/training' },
      { id: 'training-admin', label: 'Administração', icon: Settings, href: '/training/admin' },
      { id: 'training-player', label: 'Player de Conteúdo', icon: Play, href: '/training/player' },
      { id: 'training-downloads', label: 'Controle de Downloads', icon: Download, href: '/training/downloads' }
    ]
  },

  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    href: '/analytics',
    children: [
      { id: 'reports', label: 'Relatórios', icon: FileText, href: '/reports' },
      { id: 'indicators', label: 'Indicadores', icon: TrendingUp, href: '/indicators' }
    ]
  },
  {
    id: 'users',
    label: 'Usuários',
    icon: Users,
    href: '/users'
  },
  {
    id: 'profile',
    label: 'Perfil',
    icon: User,
    href: '/profile'
  },
  {
    id: 'solicitation',
    label: 'Solicitações',
    icon: ClipboardList,
    href: '/solicitation'
  },
  {
    id: 'system',
    label: 'Sistema',
    icon: Settings,
    href: '/system',
    children: [
      { id: 'settings', label: 'Configurações', icon: Settings, href: '/settings' },
      { id: 'logs', label: 'Logs do Sistema', icon: FileText, href: '/logs' }
    ]
  }
];

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const { theme, toggleTheme } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState('');

  // Carregar estado da sidebar do localStorage
  useEffect(() => {
    const savedState = localStorage.getItem(`sidebar-state-${user?.id}`);
    if (savedState) {
      try {
        const { collapsed, expanded } = JSON.parse(savedState);
        setSidebarCollapsed(collapsed);
        setExpandedItems(expanded);
      } catch (error) {
        console.error('Erro ao carregar estado da sidebar:', error);
      }
    }
  }, [user?.id]);

  // Salvar estado da sidebar no localStorage
  useEffect(() => {
    if (user?.id) {
      try {
        localStorage.setItem(`sidebar-state-${user.id}`, JSON.stringify({
          collapsed: sidebarCollapsed,
          expanded: expandedItems
        }));
      } catch (error) {
        console.error('Erro ao salvar estado da sidebar:', error);
      }
    }
  }, [sidebarCollapsed, expandedItems, user?.id]);

  // Atualizar path atual
  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleNavigation = (href: string) => {
    window.location.href = href;
  };

  const isActive = (href: string) => {
    return currentPath === href || currentPath.startsWith(href + '/');
  };

  const isExpanded = (itemId: string) => {
    return expandedItems.includes(itemId);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <motion.div
        className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out dark:bg-gray-800 dark:border-gray-700 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
        initial={false}
        animate={{ width: sidebarCollapsed ? 64 : 256 }}
      >
        {/* Header da Sidebar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <AnimatePresence mode="wait">
            {!sidebarCollapsed ? (
              <motion.div
                key="expanded"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center space-x-3"
              >
                <AnimatedLogo size="sm" showText={false} />
                <div>
                  <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">QualiHUB</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Gestão da Qualidade</p>
         </div>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="flex justify-center"
              >
                <AnimatedLogo size="sm" showText={false} />
              </motion.div>
            )}
          </AnimatePresence>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="h-8 w-8 p-0"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Scroll Area da Sidebar */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <div key={item.id}>
                  <motion.div
                    className={`group relative flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600 dark:bg-blue-900 dark:text-blue-300'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100'
                    }`}
                    onClick={() => {
                      if (item.children) {
                        toggleExpanded(item.id);
                      } else {
                        handleNavigation(item.href);
                      }
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <item.icon className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      isActive(item.href) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400'
                    }`} />
                    
                    <AnimatePresence mode="wait">
                      {!sidebarCollapsed && (
                        <motion.div
                          key="label"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                          className="flex-1 flex items-center justify-between"
                        >
                          <span>{item.label}</span>
                          <div className="flex items-center space-x-2">
                            {item.badge && (
                              <Badge variant="secondary" className="text-xs">
                                {item.badge}
                              </Badge>
                            )}
                            {item.children && (
                              <motion.div
                                animate={{ rotate: isExpanded(item.id) ? 90 : 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <ChevronRight className="h-4 w-4" />
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Submenu */}
                  <AnimatePresence>
                    {item.children && isExpanded(item.id) && !sidebarCollapsed && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="ml-6 space-y-1"
                      >
                        {item.children.map((child) => (
                          <motion.div
                            key={child.id}
                            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-all duration-200 ${
                              isActive(child.href)
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                            onClick={() => handleNavigation(child.href)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <child.icon className={`mr-3 h-4 w-4 flex-shrink-0 ${
                              isActive(child.href) ? 'text-blue-600' : 'text-gray-400'
                            }`} />
                            <span>{child.label}</span>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>
          </div>
        </ScrollArea>

        {/* Footer da Sidebar */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <AnimatePresence mode="wait">
              {!sidebarCollapsed && (
                <motion.div
                  key="user-info"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {user?.name || 'Usuário'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.role || 'Perfil'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="h-8 w-8 p-0"
              title="Sair"
            >
              <LogOut className="h-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header onMenuClick={toggleSidebar} />

        {/* Conteúdo */}
        <main className="flex-1 overflow-auto">
              {children}
        </main>
      </div>
    </div>
  );
}
