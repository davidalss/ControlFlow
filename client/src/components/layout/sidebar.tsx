import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

// Componente da barra lateral com navegação baseada no perfil do usuário
export default function Sidebar() {
  const { user } = useAuth(); // Pega dados do usuário logado
  const [location] = useLocation(); // Pega a rota atual

  // Define os itens do menu baseado no perfil do usuário logado
  const menuItems = [
    // Menu para Administradores - acesso total
    ...(user?.role === 'admin' ? [
      { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
      { path: '/users', icon: 'people', label: 'Usuários' },
      { path: '/approval-queue', icon: 'approval', label: 'Fila de Aprovação' },
      { path: '/inspections', icon: 'assignment', label: 'Inspeções' },
      { path: '/inspection-plans', icon: 'description', label: 'Planos de Inspeção' },
      { path: '/products', icon: 'inventory', label: 'Produtos' },
      { path: '/blocks', icon: 'block', label: 'Gestão de Bloqueios' },
      { path: '/reports', icon: 'analytics', label: 'Relatórios' },
      { path: '/indicators', icon: 'trending_up', label: 'Indicadores' },
      { path: '/logs', icon: 'receipt_long', label: 'Logs' },
    ] : []),

    // Menu para Inspetores - podem criar e ver suas próprias inspeções
    ...(user?.role === 'inspector' ? [
      { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
      { path: '/inspections/new', icon: 'add_circle', label: 'Nova Inspeção' },
      { path: '/inspections', icon: 'assignment', label: 'Minhas Inspeções' },
    ] : []),

    // Menu para Engenheiros de Qualidade - podem aprovar, gerenciar planos e também fazer inspeções
    ...(user?.role === 'engineering' ? [
      { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
      { path: '/approval-queue', icon: 'approval', label: 'Fila de Aprovação' },
      { path: '/inspections/new', icon: 'add_circle', label: 'Nova Inspeção' },
      { path: '/inspections', icon: 'assignment', label: 'Inspeções' },
      { path: '/inspection-plans', icon: 'description', label: 'Planos de Inspeção' },
      { path: '/products', icon: 'inventory', label: 'Produtos' },
    ] : []),

    // Menu para Controle de Bloqueio - gerenciam bloqueios de produtos/materiais
    ...(user?.role === 'block_control' ? [
      { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
      { path: '/blocks', icon: 'block', label: 'Gestão de Bloqueios' },
    ] : []),

    // Menu para Gerentes - acesso a relatórios e indicadores
    ...(user?.role === 'manager' ? [
      { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
      { path: '/reports', icon: 'analytics', label: 'Relatórios' },
      { path: '/indicators', icon: 'trending_up', label: 'Indicadores' },
    ] : []),

    // Menu para Visualizadores Temporários - apenas visualização
    ...(user?.role === 'temporary_viewer' ? [
      { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
      { path: '/inspections', icon: 'assignment', label: 'Inspeções' },
      { path: '/inspection-plans', icon: 'description', label: 'Planos de Inspeção' },
      { path: '/products', icon: 'inventory', label: 'Produtos' },
      { path: '/blocks', icon: 'block', label: 'Gestão de Bloqueios' },
    ] : []),
  ];

  // Unidades de negócio da WAP - cada uma tem produtos específicos
  const businessUnits = [
    { icon: 'construction', label: 'DIY' }, // Ferramentas e equipamentos para casa
    { icon: 'computer', label: 'TECH' }, // Produtos tecnológicos
    { icon: 'kitchen', label: 'COZINHA/BEAUTY' }, // Produtos para cozinha e beleza
    { icon: 'directions_car', label: 'MOTOR & COMFORT' }, // Produtos automotivos
  ];

  return (
    <nav className="w-64 bg-white shadow-sm border-r border-neutral-200 overflow-y-auto">
      <div className="p-4">
        {/* Navegação baseada no perfil do usuário */}
        <div className="space-y-2">
          {menuItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <a className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                location === item.path 
                  ? "bg-primary/10 text-primary" // Item ativo - destacado
                  : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900" // Item normal
              )}>
                <span className="material-icons mr-3">{item.icon}</span>
                {item.label}
                {/* Badge de notificação na fila de aprovação */}
                {item.path === '/approval-queue' && (
                  <span className="ml-auto bg-accent text-white text-xs rounded-full px-2 py-0.5">
                    3
                  </span>
                )}
              </a>
            </Link>
          ))}
        </div>

        {/* Seção das Unidades de Negócio */}
        <div className="mt-6">
          <h3 className="px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Unidades de Negócio
          </h3>
          <div className="mt-2 space-y-1">
            {businessUnits.map((unit) => (
              <Link key={unit.label} href="#">
                <a className="flex items-center px-3 py-2 text-sm text-neutral-600 rounded-lg hover:bg-neutral-100">
                  <span className="material-icons mr-3 text-lg">{unit.icon}</span>
                  {unit.label}
                </a>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
