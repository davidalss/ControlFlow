import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import SeverinoAssistantNew from './SeverinoAssistantNew';
import SeverinoButton from './SeverinoButton';

interface SeverinoContextType {
  isOpen: boolean;
  toggleSeverino: () => void;
  updateContext: (page: string, context: any) => void;
  processQuery: (query: string) => Promise<any>;
  executeAction: (action: any) => Promise<void>;
  getContextualSuggestions: () => string[];
  provideProactiveHelp: () => void;
}

const SeverinoContext = createContext<SeverinoContextType | undefined>(undefined);

export const useSeverinoContext = () => {
  const context = useContext(SeverinoContext);
  if (!context) {
    throw new Error('useSeverinoContext must be used within a SeverinoProvider');
  }
  return context;
};

interface SeverinoProviderProps {
  children: React.ReactNode;
}

export const SeverinoProvider: React.FC<SeverinoProviderProps> = ({ children }) => {
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState('');
  const [currentContext, setCurrentContext] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // State para mensagens não lidas
  const [unreadMessages, setUnreadMessages] = useState<number>(0);
  const [hasUnreadMessages, setHasUnreadMessages] = useState<boolean>(false);

  // Função para marcar mensagens como lidas
  const markMessagesAsRead = () => {
    setUnreadMessages(0);
    setHasUnreadMessages(false);
  };

  // Função para adicionar mensagem não lida
  const addUnreadMessage = () => {
    setUnreadMessages(prev => prev + 1);
    setHasUnreadMessages(true);
  };

  // Simular mensagens não lidas (em produção, isso viria de um WebSocket ou API)
  useEffect(() => {
    const interval = setInterval(() => {
      // Simular mensagens não lidas ocasionalmente
      if (Math.random() < 0.1 && !isOpen) { // 10% de chance quando não está aberto
        addUnreadMessage();
      }
    }, 30000); // Verificar a cada 30 segundos

    return () => clearInterval(interval);
  }, [isOpen]);

  // Marcar como lido quando abrir o Severino
  useEffect(() => {
    if (isOpen) {
      markMessagesAsRead();
    }
  }, [isOpen]);

  const toggleSeverino = () => {
    if (isOpen && isMinimized) {
      // Se está minimizado, maximiza
      setIsMinimized(false);
    } else if (isOpen && !isMinimized) {
      // Se está aberto e não minimizado, fecha
      setIsOpen(false);
      setIsMinimized(false);
    } else {
      // Se está fechado, abre
      setIsOpen(true);
      setIsMinimized(false);
    }
  };
  const updateContext = (page: string, context: any) => {
    setCurrentPage(page);
    setCurrentContext(context);
  };
  const processQuery = async (query: string) => ({ success: true, data: { message: 'Processado' } });
  const executeAction = async (action: any) => console.log('Executando ação:', action);
  const getContextualSuggestions = () => ['Sugestão 1', 'Sugestão 2'];
  const provideProactiveHelp = () => console.log('Ajuda proativa');

  // Update page context when location changes
  useEffect(() => {
    const path = location.pathname;
    let page = '';
    
    // Map routes to page identifiers
    if (path.includes('/inspection-plans')) page = 'inspection-plans';
    else if (path.includes('/inspections')) page = 'inspections';
    else if (path.includes('/products')) page = 'products';
    else if (path.includes('/training')) page = 'training';
    else if (path.includes('/quality-engineering')) page = 'quality-engineering';
    else if (path.includes('/reports')) page = 'reports';
    else if (path.includes('/indicators')) page = 'indicators';
    else if (path.includes('/blocks')) page = 'blocks';
    else if (path.includes('/supplier-management')) page = 'supplier-management';
    else if (path.includes('/solicitation')) page = 'solicitation';
    else if (path.includes('/spc-control')) page = 'spc-control';
    else if (path.includes('/users')) page = 'users';
    else if (path.includes('/dashboard')) page = 'dashboard';
    else page = 'home';

    setCurrentPage(page);
    updateContext(page, currentContext);
  }, [location.pathname, currentContext, updateContext]);

  // Provide proactive help when page changes
  useEffect(() => {
    if (currentPage) {
      // Delay proactive help to avoid overwhelming the user
      const timer = setTimeout(() => {
        provideProactiveHelp();
      }, 5000); // 5 seconds after page load

      return () => clearTimeout(timer);
    }
  }, [currentPage, provideProactiveHelp]);



  // Handle Severino actions
  const handleSeverinoAction = async (action: string, data: any) => {
    try {
      // Map actions to actual functionality
      switch (action) {
        case 'navigate_to_page':
          // Navigate to specific page
          window.location.href = data.url;
          break;

        case 'open_modal':
          // Open specific modal or dialog
          console.log('Opening modal:', data.modalType);
          break;

        case 'fill_form':
          // Auto-fill form fields
          console.log('Filling form with:', data.fields);
          break;

        case 'validate_data':
          // Validate form data
          console.log('Validating data:', data);
          break;

        case 'generate_report':
          // Generate report
          console.log('Generating report:', data.reportType);
          break;

        case 'create_item':
          // Create new item
          console.log('Creating item:', data.itemType);
          break;

        case 'analyze_data':
          // Analyze data
          console.log('Analyzing data:', data);
          break;

        default:
          console.log('Unknown action:', action, data);
      }

      

    } catch (error) {
      console.error('Error executing Severino action:', error);
    }
  };

  // Context value
  const contextValue: SeverinoContextType = {
    isOpen,
    toggleSeverino,
    updateContext,
    processQuery,
    executeAction,
    getContextualSuggestions,
    provideProactiveHelp
  };

  return (
    <SeverinoContext.Provider value={contextValue}>
      {children}
      
      {/* Severino Button - Posicionado fora da sidebar */}
      <div className="severino-button-wrapper">
        <SeverinoButton
          isOpen={isOpen}
          onToggle={toggleSeverino}
          isProcessing={false}
          isMinimized={isMinimized}
          hasUnreadMessages={hasUnreadMessages}
          unreadCount={unreadMessages}
        />
      </div>

      {/* Severino Assistant */}
      <SeverinoAssistantNew
        isOpen={isOpen}
        onToggle={toggleSeverino}
        isMinimized={isMinimized}
        onMinimizeChange={setIsMinimized}
        currentPage={currentPage}
        currentContext={currentContext}
        onAction={handleSeverinoAction}
      />
    </SeverinoContext.Provider>
  );
};

export default SeverinoProvider;
