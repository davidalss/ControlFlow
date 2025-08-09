import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const { user } = useAuth();
  const [location] = useLocation();

  const menuItems = [
    // Inspector Menu Items
    ...(user?.role === 'inspector' ? [
      { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
      { path: '/inspections/new', icon: 'add_circle', label: 'Nova Inspeção' },
      { path: '/inspections', icon: 'assignment', label: 'Minhas Inspeções' },
    ] : []),

    // Quality Engineering Menu Items
    ...(user?.role === 'engineering' ? [
      { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
      { path: '/approval-queue', icon: 'approval', label: 'Fila de Aprovação' },
      { path: '/inspection-plans', icon: 'description', label: 'Planos de Inspeção' },
      { path: '/acceptance-recipes', icon: 'science', label: 'Receitas de Aceite' },
    ] : []),

    // Block Control Menu Items
    ...(user?.role === 'block_control' ? [
      { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
      { path: '/blocks', icon: 'block', label: 'Gestão de Bloqueios' },
    ] : []),

    // Manager Menu Items
    ...(user?.role === 'manager' ? [
      { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
      { path: '/reports', icon: 'analytics', label: 'Relatórios' },
      { path: '/indicators', icon: 'trending_up', label: 'Indicadores' },
    ] : []),
  ];

  const businessUnits = [
    { icon: 'construction', label: 'DIY' },
    { icon: 'computer', label: 'TECH' },
    { icon: 'kitchen', label: 'COZINHA/BEAUTY' },
    { icon: 'directions_car', label: 'MOTOR & COMFORT' },
  ];

  return (
    <nav className="w-64 bg-white shadow-sm border-r border-neutral-200 overflow-y-auto">
      <div className="p-4">
        {/* Role-based Navigation */}
        <div className="space-y-2">
          {menuItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <a className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                location === item.path 
                  ? "bg-primary/10 text-primary" 
                  : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
              )}>
                <span className="material-icons mr-3">{item.icon}</span>
                {item.label}
                {item.path === '/approval-queue' && (
                  <span className="ml-auto bg-accent text-white text-xs rounded-full px-2 py-0.5">
                    3
                  </span>
                )}
              </a>
            </Link>
          ))}
        </div>

        {/* Business Units */}
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
