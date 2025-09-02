// Hook React para gerenciamento de cookies
import { useState, useEffect, useCallback } from 'react';
import { 
  cookieManager, 
  UserPreferences, 
  FlowBuilderState, 
  InspectionSession,
  CookieOptions 
} from '@/lib/cookie-manager';

export const useCookies = () => {
  const [preferences, setPreferences] = useState<UserPreferences>(() => 
    cookieManager.getUserPreferences()
  );
  
  const [flowBuilderState, setFlowBuilderState] = useState<FlowBuilderState>(() => 
    cookieManager.getFlowBuilderState()
  );
  
  const [inspectionSession, setInspectionSession] = useState<InspectionSession>(() => 
    cookieManager.getInspectionSession()
  );

  // =====================================================
  // PREFERÊNCIAS DO USUÁRIO
  // =====================================================

  const updateUserPreference = useCallback(<K extends keyof UserPreferences>(
    category: K,
    key: keyof UserPreferences[K],
    value: any
  ) => {
    cookieManager.updatePreference(category, key, value);
    setPreferences(cookieManager.getUserPreferences());
  }, []);

  const saveUserPreferences = useCallback((newPreferences: Partial<UserPreferences>) => {
    cookieManager.saveUserPreferences(newPreferences);
    setPreferences(cookieManager.getUserPreferences());
  }, []);

  const resetUserPreferences = useCallback(() => {
    cookieManager.saveUserPreferences({});
    setPreferences(cookieManager.getUserPreferences());
  }, []);

  // =====================================================
  // FLOW BUILDER STATE
  // =====================================================

  const updateFlowBuilderState = useCallback((newState: Partial<FlowBuilderState>) => {
    cookieManager.saveFlowBuilderState(newState);
    setFlowBuilderState(cookieManager.getFlowBuilderState());
  }, []);

  const saveCanvasPosition = useCallback((x: number, y: number) => {
    cookieManager.saveCanvasPosition(x, y);
    setFlowBuilderState(cookieManager.getFlowBuilderState());
  }, []);

  const saveCanvasZoom = useCallback((zoom: number) => {
    cookieManager.saveCanvasZoom(zoom);
    setFlowBuilderState(cookieManager.getFlowBuilderState());
  }, []);

  const resetFlowBuilderState = useCallback(() => {
    cookieManager.saveFlowBuilderState({});
    setFlowBuilderState(cookieManager.getFlowBuilderState());
  }, []);

  // =====================================================
  // SESSÃO DE INSPEÇÃO
  // =====================================================

  const updateInspectionSession = useCallback((newSession: Partial<InspectionSession>) => {
    cookieManager.saveInspectionSession(newSession);
    setInspectionSession(cookieManager.getInspectionSession());
  }, []);

  const startInspectionSession = useCallback((inspectionId: string) => {
    cookieManager.startInspectionSession(inspectionId);
    setInspectionSession(cookieManager.getInspectionSession());
  }, []);

  const updateInspectionStep = useCallback((step: number) => {
    cookieManager.updateInspectionStep(step);
    setInspectionSession(cookieManager.getInspectionSession());
  }, []);

  const clearInspectionSession = useCallback(() => {
    cookieManager.saveInspectionSession({});
    setInspectionSession(cookieManager.getInspectionSession());
  }, []);

  // =====================================================
  // CACHE E PERFORMANCE
  // =====================================================

  const setCache = useCallback((key: string, value: any, ttl: number = 3600) => {
    cookieManager.setCache(key, value, ttl);
  }, []);

  const getCache = useCallback((key: string) => {
    return cookieManager.getCache(key);
  }, []);

  const clearCache = useCallback(() => {
    cookieManager.cleanupExpiredCache();
  }, []);

  // =====================================================
  // UTILITÁRIOS
  // =====================================================

  const getCookie = useCallback((name: string) => {
    return cookieManager.getCookie(name);
  }, []);

  const setCookie = useCallback((name: string, value: string, options?: CookieOptions) => {
    cookieManager.setCookie(name, value, options);
  }, []);

  const removeCookie = useCallback((name: string) => {
    cookieManager.removeCookie(name);
  }, []);

  const hasCookie = useCallback((name: string) => {
    return cookieManager.hasCookie(name);
  }, []);

  const getAllCookies = useCallback(() => {
    return cookieManager.getAllCookies();
  }, []);

  const clearAllCookies = useCallback(() => {
    cookieManager.clearAllCookies();
    // Recarregar estados
    setPreferences(cookieManager.getUserPreferences());
    setFlowBuilderState(cookieManager.getFlowBuilderState());
    setInspectionSession(cookieManager.getInspectionSession());
  }, []);

  const getCookieStats = useCallback(() => {
    return cookieManager.getCookieStats();
  }, []);

  // =====================================================
  // TEMA E APARÊNCIA
  // =====================================================

  const setTheme = useCallback((theme: 'light' | 'dark' | 'auto') => {
    updateUserPreference('uiSettings', 'theme', theme);
    
    // Aplicar tema imediatamente
    if (theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [updateUserPreference]);

  const toggleTheme = useCallback(() => {
    const currentTheme = preferences.theme;
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [preferences.theme, setTheme]);

  // =====================================================
  // IDIOMA
  // =====================================================

  const setLanguage = useCallback((language: string) => {
    updateUserPreference('uiSettings', 'language', language);
  }, [updateUserPreference]);

  // =====================================================
  // CONFIGURAÇÕES DO FLOW BUILDER
  // =====================================================

  const toggleGridSnap = useCallback(() => {
    const currentValue = preferences.flowBuilderSettings.gridSnap;
    updateUserPreference('flowBuilderSettings', 'gridSnap', !currentValue);
  }, [preferences.flowBuilderSettings.gridSnap, updateUserPreference]);

  const toggleShowGrid = useCallback(() => {
    const currentValue = preferences.flowBuilderSettings.showGrid;
    updateUserPreference('flowBuilderSettings', 'showGrid', !currentValue);
  }, [preferences.flowBuilderSettings.showGrid, updateUserPreference]);

  const toggleAutoSave = useCallback(() => {
    const currentValue = preferences.flowBuilderSettings.autoSave;
    updateUserPreference('flowBuilderSettings', 'autoSave', !currentValue);
  }, [preferences.flowBuilderSettings.autoSave, updateUserPreference]);

  // =====================================================
  // CONFIGURAÇÕES DE INSPEÇÃO
  // =====================================================

  const toggleAutoAdvance = useCallback(() => {
    const currentValue = preferences.inspectionSettings.autoAdvance;
    updateUserPreference('inspectionSettings', 'autoAdvance', !currentValue);
  }, [preferences.inspectionSettings.autoAdvance, updateUserPreference]);

  const toggleShowHelpByDefault = useCallback(() => {
    const currentValue = preferences.inspectionSettings.showHelpByDefault;
    updateUserPreference('inspectionSettings', 'showHelpByDefault', !currentValue);
  }, [preferences.inspectionSettings.showHelpByDefault, updateUserPreference]);

  const setPhotoQuality = useCallback((quality: 'low' | 'medium' | 'high') => {
    updateUserPreference('inspectionSettings', 'photoQuality', quality);
  }, [updateUserPreference]);

  // =====================================================
  // CONFIGURAÇÕES DE UI
  // =====================================================

  const toggleSidebar = useCallback(() => {
    const currentValue = preferences.uiSettings.sidebarCollapsed;
    updateUserPreference('uiSettings', 'sidebarCollapsed', !currentValue);
  }, [preferences.uiSettings.sidebarCollapsed, updateUserPreference]);

  const toggleTooltips = useCallback(() => {
    const currentValue = preferences.uiSettings.showTooltips;
    updateUserPreference('uiSettings', 'showTooltips', !currentValue);
  }, [preferences.uiSettings.showTooltips, updateUserPreference]);

  const toggleCompactMode = useCallback(() => {
    const currentValue = preferences.uiSettings.compactMode;
    updateUserPreference('uiSettings', 'compactMode', !currentValue);
  }, [preferences.uiSettings.compactMode, updateUserPreference]);

  // =====================================================
  // EFEITOS
  // =====================================================

  useEffect(() => {
    // Aplicar tema inicial
    if (preferences.theme === 'dark' || 
        (preferences.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Aplicar idioma
    if (preferences.language) {
      document.documentElement.lang = preferences.language;
    }

    // Aplicar modo compacto
    if (preferences.uiSettings.compactMode) {
      document.body.classList.add('compact-mode');
    } else {
      document.body.classList.remove('compact-mode');
    }
  }, [preferences]);

  // =====================================================
  // RETORNO DO HOOK
  // =====================================================

  return {
    // Estados
    preferences,
    flowBuilderState,
    inspectionSession,
    
    // Preferências do usuário
    updateUserPreference,
    saveUserPreferences,
    resetUserPreferences,
    
    // Flow Builder
    updateFlowBuilderState,
    saveCanvasPosition,
    saveCanvasZoom,
    resetFlowBuilderState,
    
    // Sessão de inspeção
    updateInspectionSession,
    startInspectionSession,
    updateInspectionStep,
    clearInspectionSession,
    
    // Cache
    setCache,
    getCache,
    clearCache,
    
    // Utilitários
    getCookie,
    setCookie,
    removeCookie,
    hasCookie,
    getAllCookies,
    clearAllCookies,
    getCookieStats,
    
    // Tema e aparência
    setTheme,
    toggleTheme,
    setLanguage,
    
    // Flow Builder settings
    toggleGridSnap,
    toggleShowGrid,
    toggleAutoSave,
    
    // Inspection settings
    toggleAutoAdvance,
    toggleShowHelpByDefault,
    setPhotoQuality,
    
    // UI settings
    toggleSidebar,
    toggleTooltips,
    toggleCompactMode,
  };
};

// Hook específico para preferências
export const useUserPreferences = () => {
  const { preferences, updateUserPreference, saveUserPreferences, resetUserPreferences } = useCookies();
  
  return {
    preferences,
    updateUserPreference,
    saveUserPreferences,
    resetUserPreferences,
  };
};

// Hook específico para Flow Builder
export const useFlowBuilderCookies = () => {
  const { 
    flowBuilderState, 
    updateFlowBuilderState, 
    saveCanvasPosition, 
    saveCanvasZoom,
    resetFlowBuilderState 
  } = useCookies();
  
  return {
    flowBuilderState,
    updateFlowBuilderState,
    saveCanvasPosition,
    saveCanvasZoom,
    resetFlowBuilderState,
  };
};

// Hook específico para sessão de inspeção
export const useInspectionCookies = () => {
  const { 
    inspectionSession, 
    updateInspectionSession, 
    startInspectionSession, 
    updateInspectionStep,
    clearInspectionSession 
  } = useCookies();
  
  return {
    inspectionSession,
    updateInspectionSession,
    startInspectionSession,
    updateInspectionStep,
    clearInspectionSession,
  };
};
