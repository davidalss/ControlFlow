import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import SeverinoAssistantNew from './SeverinoAssistantNew';
import SeverinoButton from './SeverinoButton';
import { useSeverino } from '@/hooks/use-severino';

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
  const [hasNotifications, setHasNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  const {
    state,
    toggleSeverino,
    updateContext,
    processQuery,
    executeAction,
    getContextualSuggestions,
    provideProactiveHelp
  } = useSeverino();

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
    if (currentPage && state.userPreferences.proactiveHelp) {
      // Delay proactive help to avoid overwhelming the user
      const timer = setTimeout(() => {
        provideProactiveHelp();
      }, 5000); // 5 seconds after page load

      return () => clearTimeout(timer);
    }
  }, [currentPage, state.userPreferences.proactiveHelp, provideProactiveHelp]);

  // Simulate notifications (in real app, this would come from backend)
  useEffect(() => {
    const checkNotifications = () => {
      // Simulate random notifications
      if (Math.random() > 0.8) {
        setHasNotifications(true);
        setNotificationCount(prev => prev + 1);
      }
    };

    const interval = setInterval(checkNotifications, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

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

      // Clear notifications after action
      if (hasNotifications) {
        setHasNotifications(false);
        setNotificationCount(0);
      }

    } catch (error) {
      console.error('Error executing Severino action:', error);
    }
  };

  // Context value
  const contextValue: SeverinoContextType = {
    isOpen: state.isOpen,
    toggleSeverino,
    updateContext: (page: string, context: any) => {
      setCurrentContext(context);
      updateContext(page, context);
    },
    processQuery,
    executeAction,
    getContextualSuggestions,
    provideProactiveHelp
  };

  return (
    <SeverinoContext.Provider value={contextValue}>
      {children}
      
      {/* Severino Button */}
      <SeverinoButton
        isOpen={state.isOpen}
        onToggle={toggleSeverino}
        hasNotifications={hasNotifications}
        notificationCount={notificationCount}
        isProcessing={false}
      />

      {/* Severino Assistant */}
              <SeverinoAssistantNew
        isOpen={state.isOpen}
        onToggle={toggleSeverino}
        currentPage={currentPage}
        currentContext={currentContext}
        onAction={handleSeverinoAction}
      />
    </SeverinoContext.Provider>
  );
};

export default SeverinoProvider;
