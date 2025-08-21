// === IMPORTS ===
// React e hooks principais
import React, { useState, useEffect } from 'react';

// Biblioteca de animação para transições suaves
import { motion, AnimatePresence } from 'framer-motion';

// Ícones do Lucide React - todos os ícones usados na sidebar
import { 
  ChevronLeft,    // Seta para esquerda (colapsar sidebar)
  ChevronRight,   // Seta para direita (expandir sidebar)
  Menu,           // Ícone do menu hamburguer
  X,              // Ícone de fechar
  Home,           // Ícone da casa (Dashboard)
  FileText,       // Ícone de documento (Relatórios, Planos)
  Users,          // Ícone de usuários
  Settings,       // Ícone de configurações
  BarChart3,      // Ícone de gráfico (Analytics)
  Shield,         // Ícone de escudo (Qualidade)
  Award,          // Ícone de prêmio
  Database,       // Ícone de banco de dados (Produtos)
  Layers,         // Ícone de camadas
  Target,         // Ícone de alvo (SPC)
  Zap,            // Ícone de raio
  TrendingUp,     // Ícone de tendência (Indicadores)
  CheckSquare,    // Ícone de checkbox (Inspeções)
  Camera,         // Ícone de câmera
  BookOpen,       // Ícone de livro (Treinamentos)
  AlertTriangle,  // Ícone de alerta (SGQ)
  Bell,           // Ícone de sino (Notificações)
  User,           // Ícone de usuário (Perfil)
  LogOut,         // Ícone de logout
  Grid,           // Ícone de grade
  List,           // Ícone de lista
  Sun,            // Ícone de sol (tema claro)
  Moon,           // Ícone de lua (tema escuro)
  Search,         // Ícone de busca
  CheckCircle,    // Ícone de check (Aprovações)
  Plus,           // Ícone de mais
  GraduationCap,  // Ícone de formatura
  Truck,          // Ícone de caminhão (Fornecedores)
  ClipboardList,  // Ícone de clipboard (Solicitações)
  Lock,           // Ícone de cadeado (Bloqueios)
  Play,           // Ícone de play (Player)
  Download        // Ícone de download
} from 'lucide-react';

// Componentes UI personalizados
import { Button } from '@/components/ui/button';         // Botão customizado
import { Badge } from '@/components/ui/badge';           // Badge para notificações
import { Separator } from '@/components/ui/separator';   // Linha separadora
import { ScrollArea } from '@/components/ui/scroll-area'; // Área de scroll customizada

// Hooks personalizados
import { useAuth } from '@/hooks/use-auth';              // Hook de autenticação
import { useUserPhoto } from '@/hooks/use-user-photo';   // Hook para foto do usuário

// Componentes customizados
import EnsoSnakeLogo from '@/components/EnsoSnakeLogo';  // Logo animada da empresa
import Header from './layout/header';                    // Header da aplicação

// React Router para navegação
import { useLocation, useNavigate } from 'react-router-dom';


// === TIPOS/INTERFACES ===
// Props do componente Layout principal
interface LayoutProps {
  children: React.ReactNode; // Conteúdo que será exibido na área principal
}

// Estrutura de cada item do menu da sidebar
interface MenuItem {
  id: string;                                              // ID único do item
  label: string;                                           // Texto exibido
  icon: React.ComponentType<{ className?: string }>;       // Componente do ícone
  href: string;                                            // URL de navegação
  badge?: string;                                          // Badge opcional (ex: "Novo")
  children?: MenuItem[];                                   // Subitens (dropdown)
}

// === CONFIGURAÇÃO DO MENU DA SIDEBAR ===
// Array com todos os itens do menu lateral
const menuItems: MenuItem[] = [
  // 🏠 DASHBOARD - Página principal
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    href: '/app'  // Navega para a página principal
  },
  
  // 🛡️ ENGENHARIA DE QUALIDADE - Menu com subitens
  {
    id: 'quality-engineering',
    label: 'Engenharia de Qualidade',
    icon: Shield,
    href: '#', // Não navega, apenas expande os subitens
    children: [
      { id: 'products', label: 'Produtos', icon: Database, href: '/products' },
      { id: 'suppliers', label: 'Fornecedores', icon: Truck, href: '/supplier-management' },
      { id: 'inspection-plans', label: 'Planos de Inspeção', icon: FileText, href: '/inspection-plans' }
    ]
  },
  
  // ✅ GESTÃO DA QUALIDADE - Menu com subitens
  {
    id: 'quality-management',
    label: 'Gestão da Qualidade',
    icon: CheckSquare,
    href: '#', // Não navega, apenas expande os subitens
    children: [
      { id: 'inspections', label: 'Inspeções', icon: CheckSquare, href: '/inspections' },
      { id: 'spc-control', label: 'Controle SPC', icon: Target, href: '/spc-control' },
      { id: 'approval-queue', label: 'Aprovações', icon: CheckCircle, href: '/approval-queue' },
      { id: 'blocks', label: 'Gestão de Bloqueios', icon: Lock, href: '/blocks' }
    ]
  },
  
  // ⚠️ SGQ - Sistema de Gestão da Qualidade
  {
    id: 'sgq',
    label: 'SGQ',
    icon: AlertTriangle,
    href: '/sgq'  // Navega diretamente para SGQ
  },
  
  // 📚 TREINAMENTOS - Menu com subitens
  {
    id: 'training',
    label: 'Treinamentos',
    icon: BookOpen,
    href: '#', // Não navega, apenas expande os subitens
    children: [
      { id: 'training-list', label: 'Lista de Treinamentos', icon: List, href: '/training' },
      { id: 'training-admin', label: 'Administração', icon: Settings, href: '/training/admin' },
      { id: 'training-player', label: 'Player de Conteúdo', icon: Play, href: '/training/player' },
      { id: 'training-downloads', label: 'Controle de Downloads', icon: Download, href: '/training/downloads' }
    ]
  },
  
  // 📊 ANALYTICS - Menu com subitens
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    href: '#', // Não navega, apenas expande os subitens
    children: [
      { id: 'reports', label: 'Relatórios', icon: FileText, href: '/reports' },
      { id: 'indicators', label: 'Indicadores', icon: TrendingUp, href: '/indicators' }
    ]
  },
  
  // 👥 USUÁRIOS - Página simples
  {
    id: 'users',
    label: 'Usuários',
    icon: Users,
    href: '/users'
  },
  
  // 👤 PERFIL - Página simples
  {
    id: 'profile',
    label: 'Perfil',
    icon: User,
    href: '/profile'
  },
  
  // 📋 SOLICITAÇÕES - Página simples
  {
    id: 'solicitation',
    label: 'Solicitações',
    icon: ClipboardList,
    href: '/solicitation'
  },
  
  // ⚙️ SISTEMA - Menu com subitens
  {
    id: 'system',
    label: 'Sistema',
    icon: Settings,
    href: '#', // Não navega, apenas expande os subitens
    children: [
      { id: 'settings', label: 'Configurações', icon: Settings, href: '/settings' },
      { id: 'logs', label: 'Logs do Sistema', icon: FileText, href: '/logs' }
    ]
  }
];

// === COMPONENTE PRINCIPAL DO LAYOUT ===
export default function Layout({ children }: LayoutProps) {
  // === HOOKS E ESTADOS ===
  const { user, logout } = useAuth();                    // Dados do usuário e função de logout
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);  // Estado da sidebar (expandida/colapsada)
  const [expandedItems, setExpandedItems] = useState<string[]>([]);  // Items do menu que estão expandidos
  const location = useLocation();                        // Hook do React Router para localização atual
  const navigate = useNavigate();                        // Hook do React Router para navegação
  const { photoUrl } = useUserPhoto();                   // URL da foto do usuário

  const currentPath = location.pathname;                 // Caminho atual da URL

  // === DEBUG ===
  // Log para monitorar se o Layout está funcionando
  console.log('🔍 Layout renderizado:', {
    currentPath,
    user: !!user,
    sidebarCollapsed,
    expandedItems
  });

  // === GERENCIAMENTO DE ESTADO DA SIDEBAR ===
  // Carrega o estado salvo da sidebar do localStorage quando o usuário muda
  useEffect(() => {
    const savedState = localStorage.getItem(`sidebar-state-${user?.id}`);
    if (savedState) {
      try {
        const { collapsed, expanded } = JSON.parse(savedState);
        setSidebarCollapsed(collapsed);   // Restaura se estava colapsada
        setExpandedItems(expanded);       // Restaura quais itens estavam expandidos
      } catch (error) {
        console.error('Erro ao carregar estado da sidebar:', error);
      }
    }
  }, [user?.id]);

  // Salva o estado atual da sidebar no localStorage sempre que algo muda
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

  // === FUNÇÕES DE CONTROLE ===
  // Alterna entre sidebar expandida e colapsada
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Expande/colapsa um item específico do menu (para submenus)
  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)  // Remove se já está expandido
        : [...prev, itemId]                 // Adiciona se não está expandido
    );
  };

  // Função de navegação com debug
  const handleNavigation = (href: string) => {
    console.log('🔍 Navegando para:', href);
    navigate(href);  // Usa o React Router para navegar
  };

  // Verifica se uma rota está ativa (para destacar o item do menu)
  const isActive = (href: string) => {
    return currentPath === href || currentPath.startsWith(href + '/');
  };

  // Verifica se um item do menu está expandido
  const isExpanded = (itemId: string) => {
    return expandedItems.includes(itemId);
  };

  // === RENDER DO LAYOUT ===
  return (
      {/* Container principal do layout */}
      <div className="ds-page flex h-screen dashboard-layout">
        
        {/* === SIDEBAR LATERAL === */}
        <motion.div
          className={`ds-sidebar sidebar-responsive ${
            sidebarCollapsed ? 'ds-sidebar-collapsed' : ''
          }`}
          initial={false}
          animate={{ width: sidebarCollapsed ? 64 : 256 }}  // Anima largura: 64px colapsada, 256px expandida
        >
          
          {/* === HEADER DA SIDEBAR === */}
          {/* Contém logo, nome da empresa e botão de colapsar */}
          <div className="flex items-center justify-between p-4 border-b border-stone-200/50 dark:border-stone-700/50 bg-gradient-to-r from-stone-600 via-stone-700 to-stone-800 dark:from-stone-800 dark:via-stone-900 dark:to-stone-950">
            
            {/* Logo e nome da empresa (com animação de aparecer/sumir) */}
            <AnimatePresence mode="wait">
              {!sidebarCollapsed ? (
                {/* MODO EXPANDIDO: Logo + texto */}
                <motion.div
                  key="expanded"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center space-x-3"
                >
                  {/* ⚠️ LOGO - Tamanho fixo para evitar bugs */}
                  <EnsoSnakeLogo size={40} showText={false} variant="animated" />
                  <div>
                    <h1 className="text-lg font-bold text-stone-100">ENSO</h1>
                    <p className="text-xs text-stone-300">Sistema de Qualidade</p>
                  </div>
                </motion.div>
              ) : (
                {/* MODO COLAPSADO: Apenas logo */}
                <motion.div
                  key="collapsed"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="flex justify-center"
                >
                  {/* ⚠️ LOGO - Mesmo tamanho para consistência */}
                  <EnsoSnakeLogo size={40} showText={false} variant="animated" />
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Botão para colapsar/expandir a sidebar */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="h-8 w-8 p-0 text-stone-300 hover:text-stone-100 hover:bg-stone-700/50"
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
                              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-all duration-300 ${
                                isActive(child.href)
                                  ? 'bg-gradient-to-r from-stone-500 to-stone-600 text-stone-100 shadow-md'
                                  : 'text-stone-600 hover:bg-gradient-to-r hover:from-stone-50 hover:to-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-gradient-to-r dark:hover:from-stone-800 dark:hover:to-stone-700 dark:hover:text-stone-100'
                              }`}
                              onClick={() => {
                                console.log('🔍 Subitem clicado:', child.id, child.href);
                                handleNavigation(child.href);
                              }}
                              whileHover={{ scale: 1.02, x: 4 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <child.icon className={`mr-3 h-4 w-4 flex-shrink-0 ${
                                isActive(child.href) ? 'text-stone-100' : 'text-stone-500 dark:text-stone-400'
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
          <div className="border-t border-stone-200/50 dark:border-stone-700/50 p-4 bg-gradient-to-r from-stone-50 to-stone-100 dark:from-stone-800 dark:to-stone-900">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-stone-600 to-stone-700 rounded-full flex items-center justify-center shadow-md overflow-hidden">
                {photoUrl ? (
                  <img 
                    src={photoUrl} 
                    alt={user?.name || 'Usuário'} 
                    className="w-full h-full object-cover rounded-full"
                    key={photoUrl} // Força re-render quando a foto muda
                  />
                ) : (
                  <User className="w-4 h-4 text-stone-100" />
                )}
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
                    <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                      {user?.name || 'Usuário'}
                    </p>
                    <p className="text-xs text-stone-600 dark:text-stone-400 truncate">
                      {user?.role || 'Perfil'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="h-8 w-8 p-0 text-stone-600 hover:text-stone-800 hover:bg-stone-200/50 dark:text-stone-400 dark:hover:text-stone-200 dark:hover:bg-stone-700/50"
                title="Sair"
              >
                <LogOut className="h-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Conteúdo Principal */}
        <div className="flex-1 flex flex-col overflow-hidden main-content-responsive">
          {/* Header */}
          <div className="ds-header header-responsive">
            <Header onMenuClick={toggleSidebar} />
          </div>

          {/* Conteúdo */}
          <main className="flex-1 overflow-auto ds-content">
            <div className="ds-fade-in">
              {children}
            </div>
          </main>
        </div>
      </div>
  );
}
