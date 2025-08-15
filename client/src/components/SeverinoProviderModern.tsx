import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useNotifications } from '@/hooks/use-notifications';
import SeverinoAssistant from './SeverinoAssistant';
import SeverinoButton from './SeverinoButton';

interface SeverinoProviderProps {
  children: React.ReactNode;
}

export const SeverinoProviderModern: React.FC<SeverinoProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('');
  const [currentContext, setCurrentContext] = useState<any>(null);
  
  const { unreadCount: appNotifications, addNotification } = useNotifications();
  const { user, loading } = useAuth();

  // Verificar se o usuário está logado
  const isAuthenticated = !loading && !!user;

  const toggleSeverino = () => {
    // Só permite abrir o Severino se estiver logado
    if (isAuthenticated) {
      setIsOpen(!isOpen);
    }
  };

  // Handle Severino actions
  const handleSeverinoAction = (action: string, data: any) => {
    console.log('Severino action:', action, data);
    
    switch (action) {
      case 'navigate':
        // Navegação direta para páginas
        if (data.path) {
          window.location.href = data.path;
          
          // Se houver filtros, aplicá-los após a navegação
          if (data.filters) {
            setTimeout(() => {
              // Simular aplicação de filtros
              console.log('Aplicando filtros:', data.filters);
              // Aqui você pode implementar a lógica de filtros específica
            }, 1000);
          }
          
          // Mostrar notificação de navegação
          if (data.message) {
            addNotification({
              id: Date.now().toString(),
              title: 'Navegação',
              message: data.message,
              type: 'info',
              timestamp: new Date(),
              isRead: false
            });
          }
        }
        break;
        
      case 'create_visual':
        // Criação de elementos visuais
        console.log('Criando elemento visual:', data);
        
        // Mostrar notificação de criação
        if (data.message) {
          addNotification({
            id: Date.now().toString(),
            title: 'Criação Visual',
            message: data.message,
            type: 'success',
            timestamp: new Date(),
            isRead: false
          });
        }
        
        // Aqui você pode implementar a lógica de criação de elementos visuais
        // Por exemplo, abrir um modal com o editor visual
        break;
        
      case 'filter':
        // Aplicar filtros específicos
        console.log('Aplicando filtros:', data);
        // Implementar lógica de filtros
        break;
        
      case 'search':
        // Realizar busca
        console.log('Realizando busca:', data);
        // Implementar lógica de busca
        break;
        
      case 'create':
        // Criar novo item
        console.log('Criando novo item:', data);
        // Implementar lógica de criação
        break;
        
      default:
        console.log('Ação não reconhecida:', action);
    }
  };

  // Atualizar contexto baseado na página atual
  useEffect(() => {
    const path = window.location.pathname;
    setCurrentPage(path);
    
    // Definir contexto baseado na página
    let context = {};
    
    switch (path) {
      case '/inspections':
        context = { 
          type: 'inspections',
          title: 'Inspeções de Qualidade',
          description: 'Gerenciamento de inspeções e controles de qualidade'
        };
        break;
      case '/reports':
        context = { 
          type: 'reports',
          title: 'Relatórios',
          description: 'Análise de dados e geração de relatórios'
        };
        break;
      case '/training':
        context = { 
          type: 'training',
          title: 'Treinamentos',
          description: 'Gestão de treinamentos e capacitações'
        };
        break;
      case '/users':
        context = { 
          type: 'users',
          title: 'Usuários',
          description: 'Gestão de usuários e permissões'
        };
        break;
      default:
        context = { 
          type: 'general',
          title: 'Dashboard',
          description: 'Visão geral do sistema'
        };
    }
    
    setCurrentContext(context);
  }, []);

  return (
    <>
      {children}
      
      {/* Severino Chat */}
      <SeverinoAssistant
        isOpen={isOpen}
        onToggle={toggleSeverino}
        currentPage={currentPage}
        currentContext={currentContext}
        onAction={handleSeverinoAction}
      />
      
      {/* Severino Button - Só mostra se estiver logado */}
      {isAuthenticated && (
        <SeverinoButton
          isOpen={isOpen}
          onToggle={toggleSeverino}
          hasNotifications={appNotifications > 0}
          notificationCount={appNotifications}
          isProcessing={false}
        />
      )}
    </>
  );
};

export default SeverinoProviderModern;
