import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  className?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
}

interface PageStatsProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4 | 6;
}

interface PageFiltersProps {
  children: React.ReactNode;
  title?: string;
}

interface PageContentProps {
  children: React.ReactNode;
  className?: string;
}

// Variantes de animação padrão
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// Componente de cabeçalho padronizado
export function PageHeader({ title, description, icon: Icon, actions }: PageHeaderProps) {
  return (
    <motion.div 
      className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4"
      variants={itemVariants}
    >
      <div>
        <h1 className="ds-heading-1 flex items-center gap-3">
          {Icon && <Icon className="w-8 h-8" />}
          {title}
        </h1>
        {description && (
          <p className="ds-text-secondary">
            {description}
          </p>
        )}
      </div>
      
      {actions && (
        <div className="flex items-center space-x-3">
          {actions}
        </div>
      )}
    </motion.div>
  );
}

// Componente de estatísticas padronizado
export function PageStats({ children, columns = 4 }: PageStatsProps) {
  const gridClass = `ds-grid ds-grid-${columns}`;
  
  return (
    <motion.div 
      className={`${gridClass} mb-8`}
      variants={itemVariants}
    >
      {children}
    </motion.div>
  );
}

// Componente de filtros padronizado
export function PageFilters({ children, title = "Filtros e Busca" }: PageFiltersProps) {
  return (
    <motion.div variants={itemVariants}>
      <div className="ds-card mb-8">
        <div className="ds-card-header">
          <h3 className="ds-heading-3 flex items-center gap-2">
            {title}
          </h3>
        </div>
        <div className="ds-card-content">
          {children}
        </div>
      </div>
    </motion.div>
  );
}

// Componente de conteúdo padronizado
export function PageContent({ children, className = "" }: PageContentProps) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}

// Componente de layout principal
export function PageLayout({ children, title, description, icon, actions, className = "" }: PageLayoutProps) {
  return (
    <motion.div 
      className={`ds-container max-w-none ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <PageHeader 
        title={title}
        description={description}
        icon={icon}
        actions={actions}
      />
      {children}
    </motion.div>
  );
}

// Componente de card de estatística
interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color?: string;
}

export function StatCard({ label, value, icon: Icon, trend, color = "text-blue-500" }: StatCardProps) {
  return (
    <div className="ds-card">
      <div className="ds-card-content">
        <div className="flex items-center justify-between">
          <div>
            <p className="ds-text-sm ds-text-secondary">{label}</p>
            <p className="ds-heading-3">{value}</p>
            {trend && (
              <p className="ds-text-xs text-green-600 font-medium">{trend}</p>
            )}
          </div>
          <Icon className={`w-8 h-8 ${color}`} />
        </div>
      </div>
    </div>
  );
}

// Hook para estados comuns de página
export function usePageState() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedItems, setSelectedItems] = React.useState<string[]>([]);

  const clearSearch = () => setSearchTerm('');
  const clearSelection = () => setSelectedItems([]);

  return {
    searchTerm,
    setSearchTerm,
    clearSearch,
    isLoading,
    setIsLoading,
    selectedItems,
    setSelectedItems,
    clearSelection
  };
}

// Componente de estado vazio padronizado
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      <Icon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="ds-heading-3 mb-2">{title}</h3>
      <p className="ds-text-secondary mb-4">{description}</p>
      {action && (
        <button 
          onClick={action.onClick}
          className="ds-button-primary inline-flex items-center gap-2"
        >
          {action.icon && <action.icon className="w-4 h-4" />}
          {action.label}
        </button>
      )}
    </div>
  );
}

// Componente de loading padronizado
interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Carregando..." }: LoadingStateProps) {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="ds-text-secondary">{message}</p>
      </div>
    </div>
  );
}

// Componente de erro padronizado
interface ErrorStateProps {
  title?: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function ErrorState({ 
  title = "Algo deu errado", 
  message, 
  action 
}: ErrorStateProps) {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-red-600 text-2xl">⚠️</span>
      </div>
      <h3 className="ds-heading-3 mb-2">{title}</h3>
      <p className="ds-text-secondary mb-4">{message}</p>
      {action && (
        <button 
          onClick={action.onClick}
          className="ds-button-secondary"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
