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
import EnsoSnakeLogo from '@/components/EnsoSnakeLogo';
import Header from './layout/header';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUserPhoto } from '@/hooks/use-user-photo';

interface LayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  href: string;
  badge?: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    href: '/app'
  },
  {
    id: 'quality-engineering',
    label: 'Engenharia de Qualidade',
    icon: Shield,
    href: '#',
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
    href: '#',
    children: [
      { id: 'inspections', label: 'Inspeções', icon: CheckSquare, href: '/inspections' },
      { id: 'spc-control', label: 'Controle SPC', icon: Target, href: '/spc-control' },
      { id: 'approval-queue', label: 'Aprovações', icon: CheckCircle, href: '/approval-queue' },
      { id: 'blocks', label: 'Gestão de Bloqueios', icon: Lock, href: '/blocks' },
      { id: 'solicitation', label: 'Solicitações', icon: ClipboardList, href: '/solicitation' }
    ]
  },
  {
    id: 'sgq',
    label: 'SGQ',
    icon: AlertTriangle,
    href: '/sgq'
  },
  {
    id: 'training',
    label: 'Treinamentos',
    icon: BookOpen,
    href: '#',
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
    href: '#',
    children: [
      { id: 'reports', label: 'Relatórios', icon: FileText, href: '/reports' },
      { id: 'indicators', label: 'Indicadores', icon: TrendingUp, href: '/indicators' }
    ]
  },
  {
    id: 'system',
    label: 'Sistema',
    icon: Settings,
    href: '#',
    children: [
      { id: 'users', label: 'Usuários', icon: Users, href: '/users' },
      { id: 'profile', label: 'Perfil', icon: User, href: '/profile' },
      { id: 'settings', label: 'Configurações', icon: Settings, href: '/settings' },
      { id: 'logs', label: 'Logs do Sistema', icon: FileText, href: '/logs' }
    ]
  }
];

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { photoUrl } = useUserPhoto();

  const currentPath = location.pathname;

  console.log('🔍 Layout renderizado:', {
    currentPath,
    user: !!user,
    sidebarCollapsed,
    expandedItems
  });

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
    console.log('🔍 Navegando para:', href);
    navigate(href);
  };

  const isActive = (href: string) => {
    return currentPath === href || currentPath.startsWith(href + '/');
  };

  const isExpanded = (itemId: string) => {
    return expandedItems.includes(itemId);
  };

  return (
    <div className="ds-page flex h-screen dashboard-layout">
      {/* Sidebar */}
      <motion.div
        className={`ds-sidebar sidebar-responsive fixed left-0 top-0 h-full z-50 ${
          sidebarCollapsed ? 'ds-sidebar-collapsed' : ''
        }`}
        initial={false}
        animate={{ width: sidebarCollapsed ? 64 : 256 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="flex items-center justify-between p-4 border-b border-stone-200/50 dark:border-stone-700/50 bg-gradient-to-r from-stone-100 via-stone-200 to-stone-300 dark:from-stone-800 dark:via-stone-900 dark:to-stone-950">
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
                <EnsoSnakeLogo size={40} showText={false} variant="animated" />
                <div>
                  <h1 className="text-lg font-bold text-stone-800 dark:text-stone-100">ENSO</h1>
                  <p className="text-xs text-stone-600 dark:text-stone-300">Sistema de Qualidade</p>
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
                <EnsoSnakeLogo size={40} showText={false} variant="animated" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <ScrollArea className="flex-1 h-full">
          <div className="p-2 pb-20">
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <div key={item.id}>
                  <motion.div
                    className={`group relative flex items-center px-3 py-3 text-sm font-medium rounded-lg cursor-pointer transition-all duration-300 ${
                      isActive(item.href)
                        ? 'bg-gradient-to-r from-stone-600 to-stone-700 text-stone-100 shadow-lg border-l-4 border-stone-400'
                        : 'text-stone-700 hover:bg-gradient-to-r hover:from-stone-100 hover:to-stone-200 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-gradient-to-r dark:hover:from-stone-800 dark:hover:to-stone-700 dark:hover:text-stone-100'
                    }`}
                    onClick={() => {
                      console.log('🔍 Item clicado:', item.id, item.href);
                      if (item.children) {
                        toggleExpanded(item.id);
                      } else {
                        handleNavigation(item.href);
                      }
                    }}
                    whileHover={{ scale: 1.02, x: 2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <item.icon className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      isActive(item.href) ? 'text-stone-100' : 'text-stone-500 group-hover:text-stone-700 dark:text-stone-400 dark:group-hover:text-stone-300'
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
                          {item.badge && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              {item.badge}
                            </Badge>
                          )}
                          {item.children && (
                            <ChevronRight 
                              className={`h-4 w-4 transition-transform duration-200 ${
                                isExpanded(item.id) ? 'rotate-90' : ''
                              }`} 
                            />
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {item.children && (
                    <AnimatePresence>
                      {isExpanded(item.id) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="ml-6 mt-1 space-y-1">
                            {item.children.map((child) => (
                              <motion.div
                                key={child.id}
                                className={`group relative flex items-center px-3 py-2 text-sm font-medium rounded-lg cursor-pointer transition-all duration-300 ${
                                  isActive(child.href)
                                    ? 'bg-gradient-to-r from-stone-500 to-stone-600 text-stone-100 shadow-md border-l-2 border-stone-300'
                                    : 'text-stone-600 hover:bg-gradient-to-r hover:from-stone-50 hover:to-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-gradient-to-r dark:hover:from-stone-700 dark:hover:to-stone-600 dark:hover:text-stone-100'
                                }`}
                                onClick={() => {
                                  console.log('🔍 Subitem clicado:', child.id, child.href);
                                  handleNavigation(child.href);
                                }}
                                whileHover={{ scale: 1.01, x: 1 }}
                                whileTap={{ scale: 0.99 }}
                              >
                                <child.icon className={`mr-3 h-4 w-4 flex-shrink-0 ${
                                  isActive(child.href) ? 'text-stone-100' : 'text-stone-400 group-hover:text-stone-600 dark:text-stone-500 dark:group-hover:text-stone-300'
                                }`} />
                                
                                <AnimatePresence mode="wait">
                                  {!sidebarCollapsed && (
                                    <motion.div
                                      key="child-label"
                                      initial={{ opacity: 0, x: -5 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      exit={{ opacity: 0, x: -5 }}
                                      transition={{ duration: 0.15 }}
                                      className="flex-1"
                                    >
                                      <span>{child.label}</span>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-stone-200/50 dark:border-stone-700/50">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Foto do usuário"
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-stone-300 dark:bg-stone-600 flex items-center justify-center">
                  <User className="h-4 w-4 text-stone-600 dark:text-stone-300" />
                </div>
              )}
            </div>
            
            <AnimatePresence mode="wait">
              {!sidebarCollapsed && (
                <motion.div
                  key="user-info"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                    {user?.name || 'Usuário'}
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
                    {user?.email || 'email@exemplo.com'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="h-8 w-8 p-0 text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Botão de toggle da sidebar - FORA da sidebar */}
      <motion.div
        className="fixed top-4 left-4 z-50 lg:hidden"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="h-10 w-10 p-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 text-stone-600 hover:text-stone-800 hover:bg-stone-200/50 dark:text-stone-300 dark:hover:text-stone-100 dark:hover:bg-stone-700/50 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
          title={sidebarCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </motion.div>

      {/* Botão de toggle da sidebar - Desktop (visível quando colapsada) */}
      <motion.div
        className="fixed top-4 z-40 hidden lg:block"
        style={{ left: sidebarCollapsed ? '80px' : '272px' }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="h-10 w-10 p-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 text-stone-600 hover:text-stone-800 hover:bg-stone-200/50 dark:text-stone-300 dark:hover:text-stone-100 dark:hover:bg-stone-700/50 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
          title={sidebarCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </motion.div>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ marginLeft: sidebarCollapsed ? '64px' : '256px' }}>
        <Header onMenuClick={toggleSidebar} />
        <main className="flex-1 overflow-auto bg-stone-50 dark:bg-stone-900">
          {children}
        </main>
      </div>
    </div>
  );
}
