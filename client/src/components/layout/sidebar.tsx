import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";

// Componente da barra lateral com navegação baseada no perfil do usuário
export default function Sidebar() {
  const { user } = useAuth(); // Pega dados do usuário logado
  const location = useLocation(); // Pega a rota atual

  // Fetch pending approvals count for the sidebar badge
  const { data: pendingApprovalsCount, isLoading: isLoadingApprovals } = useQuery<any[], Error, number>({
    queryKey: ['/api/approvals/pending'],
    // Only enable this query if the user has a role that can see the approval queue
    enabled: Boolean(user?.role && ['engineering', 'manager', 'admin', 'coordenador'].includes(user.role)),
    select: (data) => data.length, // We only need the count
  });

  // Estado para controlar expansão dos sub-menus e categorias
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['visao-geral']); // Visão geral sempre expandida por padrão

  // Função para alternar expansão de sub-menus
  const toggleSubMenu = (menuKey: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuKey) 
        ? prev.filter(key => key !== menuKey)
        : [...prev, menuKey]
    );
  };

  // Função para alternar expansão de categorias
  const toggleCategory = (categoryKey: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryKey) 
        ? prev.filter(key => key !== categoryKey)
        : [...prev, categoryKey]
    );
  };

  // Função para criar itens de menu organizados por categoria
  const createMenuCategories = (role: string) => {
    const categories: any[] = [];

    // 📊 VISÃO GERAL
    categories.push({
      key: 'visao-geral',
      label: 'VISÃO GERAL',
      icon: 'dashboard',
      items: [
        { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
        ...(['admin', 'manager'].includes(role) ? [{ path: '/indicators', icon: 'trending_up', label: 'Indicadores' }] : [])
      ]
    });

    // 🔍 OPERAÇÕES
    const operacoesItems = [];
    if (['admin', 'coordenador', 'engineering', 'inspector', 'temporary_viewer'].includes(role)) {
      operacoesItems.push({ path: '/inspections', icon: 'assignment', label: 'Inspeções' });
    }
    
    if (['admin', 'coordenador', 'engineering', 'temporary_viewer'].includes(role)) {
      operacoesItems.push({ path: '/inspection-plans', icon: 'description', label: 'Planos de Inspeção' });
    }
    
    if (['admin', 'coordenador', 'block_control', 'temporary_viewer'].includes(role)) {
      operacoesItems.push({ path: '/blocks', icon: 'block', label: 'Gestão de Bloqueios' });
    }
    
    if (['admin', 'coordenador', 'engineering', 'inspector', 'block_control', 'manager', 'tecnico', 'analista', 'lider', 'supervisor'].includes(role)) {
      operacoesItems.push({ path: '/solicitation', icon: 'description', label: 'Solicitações' });
    }

    if (operacoesItems.length > 0) {
      categories.push({
        key: 'operacoes',
        label: 'OPERAÇÕES',
        icon: 'settings',
        items: operacoesItems
      });
    }

    // 📦 GESTÃO DE DADOS
    const dadosItems = [];
    if (['admin', 'coordenador', 'engineering', 'temporary_viewer'].includes(role)) {
      dadosItems.push({ path: '/products', icon: 'inventory', label: 'Produtos' });
    }
    
    if (['admin'].includes(role)) {
      dadosItems.push({ path: '/supplier-management', icon: 'business', label: 'Fornecedores' });
      dadosItems.push({ path: '/spc-control', icon: 'analytics', label: 'Controle SPC' });
    }

    if (dadosItems.length > 0) {
      categories.push({
        key: 'gestao-dados',
        label: 'GESTÃO DE DADOS',
        icon: 'storage',
        items: dadosItems
      });
    }

    // 👥 ADMINISTRAÇÃO
    const adminItems = [];
    if (['admin'].includes(role)) {
      adminItems.push({ path: '/users', icon: 'people', label: 'Usuários' });
      adminItems.push({ path: '/approval-queue', icon: 'approval', label: 'Fila de Aprovação' });
      adminItems.push({ path: '/logs', icon: 'receipt_long', label: 'Logs' });
    } else if (['coordenador', 'engineering', 'manager'].includes(role)) {
      adminItems.push({ path: '/approval-queue', icon: 'approval', label: 'Fila de Aprovação' });
    }

    if (adminItems.length > 0) {
      categories.push({
        key: 'administracao',
        label: 'ADMINISTRAÇÃO',
        icon: 'admin_panel_settings',
        items: adminItems
      });
    }

    // 🎓 TREINAMENTOS
    if (['admin', 'coordenador', 'engineering'].includes(role)) {
      categories.push({
        key: 'treinamentos',
        label: 'TREINAMENTOS',
        icon: 'school',
        items: [
          { path: '/training', icon: 'library_books', label: 'Lista de Treinamentos' },
          { path: '/training/new', icon: 'add_circle', label: 'Novo Treinamento' },
          { path: '/training/thumbnails', icon: 'image', label: 'Gerenciar Thumbnails' },
          { path: '/training/tests', icon: 'quiz', label: 'Configurar Testes' },
          { path: '/training/history', icon: 'history', label: 'Histórico' },
          { path: '/training/certificates', icon: 'verified', label: 'Certificados' }
        ]
      });
    }

    // 📊 RELATÓRIOS
    if (['admin', 'coordenador', 'manager', 'tecnico', 'analista', 'lider', 'supervisor', 'temporary_viewer'].includes(role)) {
      categories.push({
        key: 'relatorios',
        label: 'RELATÓRIOS',
        icon: 'analytics',
        items: [
          { path: '/reports', icon: 'analytics', label: 'Relatórios Gerais' },
          { path: '/inspections', icon: 'assignment', label: 'Relatórios de Inspeção' }
        ]
      });
    }

    return categories;
  };

  // Define as categorias do menu baseado no perfil do usuário logado
  const menuCategories = createMenuCategories(user?.role || '');

  return (
    <nav className="h-full flex flex-col theme-card-primary theme-shadow-lg theme-border-primary">
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin theme-border-primary">
        <div className="p-6">
        {/* Navegação baseada no perfil do usuário */}
        <div className="space-y-3">
          {menuCategories.map((category) => (
            <div key={category.key} className="group">
              {/* Cabeçalho da categoria */}
              <button
                onClick={() => toggleCategory(category.key)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ease-in-out",
                  "bg-white/50 hover:bg-white/80 border border-slate-200/50 hover:border-slate-300/50",
                  "shadow-sm hover:shadow-md transform hover:scale-[1.02]",
                  expandedCategories.includes(category.key) 
                    ? "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-md" 
                    : "text-slate-700 hover:text-slate-900"
                )}
              >
                <div className="flex items-center">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-all duration-300",
                    expandedCategories.includes(category.key)
                      ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg"
                      : "bg-slate-100 text-slate-600 group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-purple-600 group-hover:text-white"
                  )}>
                    <span className="material-icons text-sm">{category.icon}</span>
                  </div>
                  <span className="font-medium">{category.label}</span>
                </div>
                <span className={cn(
                  "material-icons transition-all duration-300 text-slate-400",
                  expandedCategories.includes(category.key) ? "rotate-180 text-blue-600" : ""
                )}>
                  expand_more
                </span>
              </button>
              
              {/* Itens da categoria */}
              <div className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out",
                expandedCategories.includes(category.key) ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              )}>
                <div className="ml-4 mt-2 space-y-1 pl-4 border-l-2 border-slate-200">
                  {category.items.map((item: any) => (
                    <div key={item.path || item.key}>
                      {item.hasSubMenu ? (
                        // Item com sub-menu
                        <div>
                          <button
                            onClick={() => toggleSubMenu(item.key!)}
                            className={cn(
                              "w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all duration-200",
                              "hover:bg-slate-50 hover:text-slate-900",
                              location.pathname.startsWith('/training') 
                                ? "bg-blue-50 text-blue-700 font-medium" 
                                : "text-slate-600"
                            )}
                          >
                            <div className="flex items-center">
                              <span className="material-icons mr-3 text-sm">{item.icon}</span>
                              {item.label}
                            </div>
                            <span className={cn(
                              "material-icons transition-transform duration-200 text-sm",
                              expandedMenus.includes(item.key!) ? "rotate-180" : ""
                            )}>
                              expand_more
                            </span>
                          </button>
                          
                          {/* Sub-menu */}
                          <div className={cn(
                            "overflow-hidden transition-all duration-200 ease-in-out",
                            expandedMenus.includes(item.key!) ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                          )}>
                            <div className="ml-6 mt-1 space-y-1">
                              {item.subItems?.map((subItem: any) => (
                                <Link
                                  key={subItem.path}
                                  to={subItem.path}
                                  className={cn(
                                    "flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200",
                                    "hover:bg-slate-50 hover:text-slate-900",
                                    location.pathname === subItem.path 
                                      ? "bg-blue-50 text-blue-700 font-medium" 
                                      : "text-slate-500"
                                  )}
                                >
                                  <span className="material-icons mr-3 text-sm">{subItem.icon}</span>
                                  {subItem.label}
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Item normal sem sub-menu
                        <Link
                          to={item.path!}
                          className={cn(
                            "flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200",
                            "hover:bg-slate-50 hover:text-slate-900",
                            location.pathname === item.path 
                              ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 font-medium border border-blue-200/50" 
                              : "text-slate-600"
                          )}
                        >
                          <span className="material-icons mr-3 text-sm">{item.icon}</span>
                          {item.label}
                          {/* Badge de notificação na fila de aprovação */}
                          {item.path === '/approval-queue' && !isLoadingApprovals && pendingApprovalsCount && pendingApprovalsCount > 0 && (
                            <span className="ml-auto bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full px-2 py-1 font-medium shadow-sm">
                              {pendingApprovalsCount}
                            </span>
                          )}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>
    </nav>
  );
}
